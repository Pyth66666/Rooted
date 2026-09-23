"use client";

import { track } from "@/lib/analytics";

export default function PaidCTA() {
  return (
    <section className="bg-forest py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-sage/80">
          Go deeper
        </p>
        <h3 className="font-serif text-3xl font-medium text-ivory sm:text-4xl">Explore your hair profile</h3>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ivory/70">
          The free shampoo advisor explores how your hair, scalp, lifestyle and budget relate to product choices. The separate RM10 assessment is currently paused while its additional value and payment flow are reviewed.
        </p>
        <p className="mx-auto mt-4 max-w-md text-xs text-ivory/50">
          Your ingredient summary above stays free.
        </p>
        <a
          href="/shampoo-advisor"
          onClick={() => track("paid_cta_clicked")}
          className="mt-8 inline-flex items-center justify-center rounded-full bg-ivory px-8 py-4 text-sm font-medium tracking-wide text-forest transition-all hover:bg-cream"
        >
          Find My Shampoo — Free
        </a>
      </div>
    </section>
  );
}
