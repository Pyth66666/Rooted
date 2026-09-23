"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShampooRecommendation } from "@/lib/types";

export interface AssessmentResultData {
  profile: {
    hair: string;
    thickness: string;
    scalp: string;
    concerns: string[];
    washFrequency: string;
    treatments: string[];
    climate: string;
  };
  recommendations: ShampooRecommendation[];
  matchedCurrent: string;
  disclaimer: string;
  weights: Record<string, number>;
}

export default function AssessmentResults({ result }: { result: AssessmentResultData }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <div className="bg-ivory pb-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        {/* YOUR HAIR PROFILE */}
        <section className="pt-4">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-earth">
            Your result
          </p>
          <h2 className="mt-2 font-serif text-4xl font-medium text-charcoal">
            Your Hair Profile
          </h2>
          <div className="mt-8 grid gap-6 rounded-sm border border-sage/10 bg-cream/50 p-6 sm:grid-cols-2 sm:p-8">
            <ProfileField label="Hair" value={result.profile.hair} />
            <ProfileField label="Strand thickness" value={result.profile.thickness} />
            <ProfileField label="Scalp" value={result.profile.scalp} />
            <ProfileField label="Wash frequency" value={result.profile.washFrequency} />
            <ProfileField label="Climate / lifestyle" value={result.profile.climate} />
            <ProfileField
              label="Treatments"
              value={result.profile.treatments.length ? result.profile.treatments.join(", ") : "None"}
            />
          </div>
          <div className="mt-4 rounded-sm bg-sage/5 p-5">
            <p className="mb-2 text-xs font-medium uppercase tracking-[0.15em] text-sage">
              Main concerns
            </p>
            <div className="flex flex-wrap gap-2">
              {result.profile.concerns.map((c) => (
                <span key={c} className="rounded-full bg-sage/10 px-3 py-1 text-xs text-sage">
                  {c}
                </span>
              ))}
              {result.profile.concerns.length === 0 && (
                <span className="text-sm text-muted">No specific concerns selected.</span>
              )}
            </div>
          </div>
        </section>

        {/* CURRENT SHAMPOO + TOP PICKS */}
        <section className="mt-16">
          <h2 className="font-serif text-3xl font-medium text-charcoal">Our Top Picks</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Based on your hair profile, concerns, preferences, budget and
            Malaysia&apos;s hot and humid climate, here are shampoo formulas worth
            exploring.
          </p>

          <div className="mt-8 space-y-6">
            {result.recommendations.map((rec, i) => {
              const key = `${rec.name}-${i}`;
              return (
                <div key={key} className="rounded-sm border border-sage/10 bg-white/50 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.15em] text-earth">
                        #{i + 1} · {rec.brand}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-medium text-charcoal">
                        {rec.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-medium text-sage">{rec.score}/100</p>
                      <p className="text-xs text-muted">match</p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted">{rec.why}</p>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">
                    <MiniBlock title="Best for">
                      <ul className="space-y-1">
                        {rec.bestFor.map((b) => (
                          <li key={b} className="text-xs text-muted">
                            · {b}
                          </li>
                        ))}
                      </ul>
                    </MiniBlock>
                    <MiniBlock title="Price range">
                      <p className="text-xs text-muted">{rec.priceRange}</p>
                    </MiniBlock>
                    <MiniBlock title="Key ingredients">
                      <ul className="space-y-1">
                        {rec.keyIngredients.map((k) => (
                          <li key={k} className="text-xs text-muted">
                            · {k}
                          </li>
                        ))}
                      </ul>
                    </MiniBlock>
                  </div>

                  <button
                    onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}
                    className="mt-5 text-sm text-sage underline underline-offset-4 decoration-sage/30 hover:text-forest"
                  >
                    {expanded[key] ? "Hide considerations" : "Show considerations"}
                  </button>
                  {expanded[key] && (
                    <p className="mt-3 rounded-sm bg-cream/60 p-4 text-sm leading-relaxed text-muted">
                      {rec.considerations}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {result.recommendations.length === 0 && (
            <div className="mt-8 rounded-sm border border-sage/10 bg-cream/50 p-8 text-center">
              <p className="text-sm text-muted">
                We don&apos;t have enough product data to recommend specific
                shampoos yet. Your hair profile is still saved.
              </p>
            </div>
          )}
        </section>

        {/* WHY + INGREDIENT NOTE */}
        <section className="mt-16 rounded-sm border border-sage/10 bg-cream/50 p-8">
          <h2 className="font-serif text-2xl font-medium text-charcoal">
            Why We Recommended These
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Each product is scored across several factors — your hair and scalp
            needs, your stated concerns, ingredient compatibility, preferences,
            budget, and Malaysia&apos;s climate. We explain the reasoning for every
            pick rather than applying a one-size-fits-all rule like
            &quot;oily scalp = shampoo X&quot;.
          </p>
          <p className="mt-4 text-xs text-muted/70">
            Current scoring weights: hair/scalp 30%, concerns 20%, ingredient
            compatibility 20%, preferences 10%, budget 10%, climate 10%.
          </p>
        </section>

        {/* IMPORTANT NOTE */}
        <section className="mt-8 rounded-sm bg-forest p-8">
          <h2 className="font-serif text-xl font-medium text-ivory">Important note</h2>
          <p className="mt-3 text-sm leading-relaxed text-ivory/80">
            ROOTED.MY provides cosmetic and product guidance based on the
            information you provide. It is not a medical diagnosis. If you have
            persistent or severe scalp/hair concerns, consider speaking with a
            qualified healthcare professional.
          </p>
        </section>

        <section className="mt-16 border-t border-sage/10 pt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-sage px-8 py-4 text-sm font-medium tracking-wide text-ivory transition-all hover:bg-forest"
          >
            Scan another product
          </Link>
        </section>
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-earth">{label}</p>
      <p className="mt-1 font-medium text-charcoal">{value}</p>
    </div>
  );
}

function MiniBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-earth">
        {title}
      </p>
      {children}
    </div>
  );
}
