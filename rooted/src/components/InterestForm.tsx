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

interface Props {
  onComplete: () => void;
}

export default function InterestForm({ onComplete }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [concern, setConcern] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    track("email_submitted", { name, email, concern });
    if (concern) track("hair_concern_selected", { concern });
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
              What&apos;s your biggest hair concern?{" "}
              <span className="normal-case">(optional)</span>
            </label>
            <select
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
