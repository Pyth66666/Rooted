"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";

type Answer = "yes" | "maybe" | "no" | null;

interface Props {
  onAnswer: (answer: Answer) => void;
}

export default function ValidationCTA({ onAnswer }: Props) {
  const [selected, setSelected] = useState<Answer>(null);

  const choose = (answer: Answer) => {
    setSelected(answer);
    track(`interest_${answer!}`);
    onAnswer(answer);
  };

  return (
    <section className="bg-cream py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <h2 className="font-serif text-3xl font-medium leading-snug text-charcoal sm:text-4xl lg:text-5xl">
          What if your hair products
          <br />
          <span className="italic text-sage">were actually chosen for you?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted">
          We&apos;re working on a new way to discover hair products based on your
          hair type, concerns, routine, and preferences — instead of choosing from
          thousands of bottles on a shelf.
        </p>
        <p className="mt-6 font-serif text-xl text-charcoal italic">
          Would you use something like that?
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {([
            { key: "yes", label: "Yes, I'd try it", emphasis: true },
            { key: "maybe", label: "Maybe", emphasis: false },
            { key: "no", label: "Not for me", emphasis: false },
          ] as const).map(({ key, label, emphasis }) => (
            <button
              key={key}
              onClick={() => choose(key)}
              className={`w-full rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-all sm:w-auto ${
                selected === key
                  ? "bg-sage text-ivory"
                  : emphasis
                  ? "border border-sage/30 bg-sage text-ivory hover:bg-forest"
                  : "border border-sage/20 text-muted hover:border-sage/40 hover:text-charcoal"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
