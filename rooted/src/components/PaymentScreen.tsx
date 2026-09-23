"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

interface Props {
  reference: string;
  email?: string;
  onPaid: (result: unknown) => void;
  onBack: () => void;
}

const INCLUDES = [
  "Personalized hair / scalp profile",
  "A fuller written profile of your answers",
  "Shampoo recommendations",
  "Explanation of why each recommendation fits your answers",
];

export default function PaymentScreen({ reference, email, onPaid, onBack }: Props) {
  const [state, setState] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const pay = async () => {
    setState("processing");
    setError("");
    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference, email }),
      });
      const data = await res.json();
      if (!res.ok || data.type === "error") {
        setError(data.message || "Payment could not be created.");
        setState("error");
        return;
      }
      if (data.type === "billplz" && data.checkoutUrl) {
        // Live provider: send user to checkout; webhook marks paid.
        window.location.assign(data.checkoutUrl);
        return;
      }
      if (data.type === "dev") {
        // Development / test mode: explicitly confirm, never a real charge.
        const confirm = await fetch("/api/payment/dev-confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });
        const confirmBody = await confirm.json();
        if (!confirm.ok) {
          setError(confirmBody.error || "Could not confirm test payment.");
          setState("error");
          return;
        }
        setState("done");
        track("payment_completed_dev");
        const results = await fetch(`/api/assessment/results?ref=${encodeURIComponent(reference)}`);
        const body = await results.json();
        if (!results.ok) throw new Error(body.error || "Payment confirmed, but results are not ready. Reload this page to retry.");
        onPaid(body);
      }
    } catch (err) {
      console.error("Payment error", err);
      setError(err instanceof Error ? err.message : "Something went wrong. Try again.");
      setState("error");
      setState("error");
    }
  };

  if (state === "done") return <p role="status" className="py-20 text-center">Opening your results…</p>;

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-md px-6 text-center">
        <div className="rounded-sm border border-sage/10 bg-cream/50 p-8">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-earth">
            Your personalized hair assessment
          </p>
          <p className="mt-4 font-serif text-5xl font-medium text-charcoal">RM10</p>
          {process.env.NODE_ENV === "production" && <p className="mt-3 text-sm text-earth">Checkout is paused while payment verification is completed. You can explore the free shampoo advisor now.</p>}
          <ul className="mt-8 space-y-3 text-left">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-muted">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage/10 text-sage">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={pay}
            disabled={state === "processing" || process.env.NODE_ENV === "production"}
            className="mt-8 w-full rounded-full bg-sage py-4 text-sm font-medium tracking-wide text-ivory transition-all enabled:hover:bg-forest disabled:opacity-50"
          >
            {state === "processing" ? "Processing…" : "Pay RM10 & Get My Assessment"}
          </button>
          {error && (
            <p className="mt-4 rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}
          <p className="mt-4 text-xs text-muted/60">
            {process.env.NODE_ENV !== "production"
              ? "Development mode — no real payment is charged."
              : "Secure payment. No auto-renewal."}
          </p>
        </div>
        <button
          onClick={onBack}
          className="mt-6 text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-colors hover:text-charcoal"
        >
          Back to questions
        </button>
      </div>
    </section>
  );
}
