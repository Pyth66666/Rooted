"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

const CONCERNS = [
  "Dryness",
  "Hair fall",
  "Frizz",
  "Oily scalp",
  "Dandruff",
  "Damage",
  "Lack of volume",
  "Curly hair care",
  "Other",
];

const AGE_GROUPS = [
  "Under 18",
  "18–24",
  "25–34",
  "35–44",
  "45–54",
  "55+",
];

const BUDGETS = [
  "Under RM20",
  "RM20–RM40",
  "RM40–RM60",
  "RM60–RM100",
  "RM100+",
  "I don't mind",
];

interface Props {
  onComplete: () => void;
}

export default function InterestForm({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concern, setConcern] = useState("");
  const [ageGroup, setAgeGroup] = useState("");
  const [budget, setBudget] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !concern || !ageGroup || !budget) return;
    track("email_submitted", { name, email, concern, ageGroup, budget });
    track("hair_concern_selected", { concern });
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, concern, ageGroup, budget }),
      });
    } catch (err) {
      console.error("Lead save failed:", err);
    }
    onComplete();
  };

  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-lg px-6 lg:px-8">
        <h3 className="text-center font-serif text-3xl font-medium text-charcoal sm:text-4xl">
          Before your results — one quick thing.
        </h3>
        <p className="mt-4 text-center text-sm text-muted">
          Tell us a little about yourself, and we&apos;ll break down your
          product right away.
        </p>
        <form onSubmit={onSubmit} className="mt-10 space-y-5">
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-muted/40 focus:border-sage"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-muted/40 focus:border-sage"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
              What&apos;s your biggest hair concern?
            </label>
            <select
              required
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
              className="w-full appearance-none border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors focus:border-sage"
            >
              <option value="">Select one</option>
              {CONCERNS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
              Age group
            </label>
            <select
              required
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full appearance-none border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors focus:border-sage"
            >
              <option value="">Select one</option>
              {AGE_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.15em] text-muted">
              How much would you pay for a product that actually works on your
              hair?
            </label>
            <select
              required
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full appearance-none border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors focus:border-sage"
            >
              <option value="">Select one</option>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="mt-4 w-full rounded-full bg-sage py-4 text-sm font-medium tracking-wide text-ivory transition-all hover:bg-forest"
          >
            Show my results
          </button>
          <p className="text-center text-xs text-muted/50">
            We&apos;ll only use your email to contact you about ROOTED. No spam.
          </p>
        </form>
      </div>
    </section>
  );
}
