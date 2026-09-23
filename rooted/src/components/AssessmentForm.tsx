"use client";

import { useEffect, useState } from "react";
import { QUESTIONS } from "@/lib/assessment-data";
import type { HairAnswerInput } from "@/lib/types";

type PartialAnswers = Partial<HairAnswerInput>;

interface CatalogItem {
  name: string;
  brand: string;
}

interface Props {
  defaultCurrentProduct?: string;
  onSubmit: (answers: HairAnswerInput) => void;
  onBack?: () => void;
}

export default function AssessmentForm({
  defaultCurrentProduct,
  onSubmit,
  onBack,
}: Props) {
  const [step, setStep] = useState(0);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [query, setQuery] = useState<string>(
    defaultCurrentProduct && defaultCurrentProduct !== "uploaded"
      ? defaultCurrentProduct
      : ""
  );
  const [answers, setAnswers] = useState<PartialAnswers>(() => {
    const init: PartialAnswers = {};
    if (defaultCurrentProduct && defaultCurrentProduct !== "uploaded") {
      init.currentProduct = defaultCurrentProduct;
    }
    return init;
  });

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => setCatalog([]));
  }, []);

  const question = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const setAnswer = (id: string, value: unknown) => {
    setAnswers((a) => ({ ...a, [id]: value }));
  };

  const toggleMulti = (id: string, value: string) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[id as keyof PartialAnswers])
        ? (a[id as keyof PartialAnswers] as string[])
        : [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...a, [id]: next };
    });
  };

  const currentValue = answers[question.id as keyof PartialAnswers];
  const isAnswered =
    question.type === "multi"
      ? Array.isArray(currentValue) && (currentValue as string[]).length > 0
      : question.type === "text"
        ? typeof currentValue === "string" && currentValue.trim().length > 0
        : currentValue !== undefined;

  const next = () => {
    if (!isAnswered) return;
    if (isLast) {
      onSubmit(answers as HairAnswerInput);
    } else {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0 });
    }
  };

  const prev = () => {
    if (step === 0) onBack?.();
    else setStep((s) => s - 1);
  };

  const matches =
    query.trim().length > 0
      ? catalog.filter(
          (c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.brand.toLowerCase().includes(query.toLowerCase())
        )
      : [];

  const pickedProduct = query.trim()
    ? catalog.find((c) => c.name.toLowerCase() === query.trim().toLowerCase())
    : undefined;

  const onQueryChange = (value: string) => {
    setQuery(value);
    setAnswer("currentProduct", value);
  };

  return (
    <section className="bg-ivory py-16 lg:py-24">
      <div className="mx-auto max-w-xl px-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.25em] text-earth">
            Personalized Hair Assessment
          </p>
          <h2 className="mt-3 font-serif text-3xl font-medium text-charcoal">
            A few questions about your hair
          </h2>
          <p className="mt-4 text-sm text-muted">
            Question {step + 1} of {QUESTIONS.length}
          </p>
          <div className="mx-auto mt-4 flex max-w-xs gap-1.5">
            {QUESTIONS.map((q, i) => (
              <span
                key={q.id}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i <= step ? "bg-sage" : "bg-sage/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-sm border border-sage/10 bg-cream/50 p-6 sm:p-8">
          <h3 className="font-serif text-2xl font-medium text-charcoal">
            {question.title}
          </h3>
          {question.subtitle && (
            <p className="mt-2 text-sm text-muted">{question.subtitle}</p>
          )}
          {question.help && (
            <p className="mt-3 rounded-sm bg-sage/5 px-4 py-3 text-xs leading-relaxed text-muted">
              {question.help}
            </p>
          )}

          {question.id === "currentProduct" && (
            <p className="mt-2 text-xs italic text-muted">
              Search the ROOTED.MY picks, type your own brand, or say you don&apos;t
              know. If you uploaded a photo, that shampoo is pre-filled.
            </p>
          )}

          <div className="mt-6 space-y-3">
            {question.type === "text" && question.id === "currentProduct" ? (
              <div>
                <input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search brand or product name…"
                  className="w-full border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-muted/40 focus:border-sage"
                />
                {matches.length > 0 && (
                  <ul className="mt-2 max-h-48 overflow-auto rounded-sm border border-sage/15 bg-ivory p-1">
                    {matches.map((m) => (
                      <li key={m.name}>
                        <button
                          type="button"
                          onClick={() => {
                            onQueryChange(m.name);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-charcoal hover:bg-sage/10"
                        >
                          {m.name} <span className="text-muted">— {m.brand}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {pickedProduct && (
                  <p className="mt-2 rounded-sm bg-sage/5 px-3 py-2 text-xs text-charcoal">
                    ✓ Matched: {pickedProduct.name} ({pickedProduct.brand})
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => onQueryChange("I don't know")}
                  className="mt-3 rounded-sm border border-sage/20 px-4 py-2 text-xs text-muted transition-colors hover:border-sage/40 hover:text-charcoal"
                >
                  {query === "I don't know" ? "✓ " : ""}I don&apos;t know
                </button>
              </div>
            ) : question.type === "text" ? (
              <textarea
                value={(currentValue as string) ?? ""}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                rows={4}
                className="w-full resize-none border-b border-sage/20 bg-transparent py-3 text-sm text-charcoal outline-none transition-colors placeholder:text-muted/40 focus:border-sage"
                placeholder="For example: less frizz, more shine, or less oil by midday..."
              />
            ) : question.type === "single" ? (
              question.options?.map((opt) => {
                const selected = currentValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setAnswer(question.id, opt.value)}
                    className={`w-full rounded-sm border px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? "border-sage bg-sage/5 text-charcoal"
                        : "border-sage/20 text-muted hover:border-sage/40"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })
            ) : (
              question.options?.map((opt) => {
                const cur = Array.isArray(currentValue)
                  ? (currentValue as string[])
                  : [];
                const selected = cur.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleMulti(question.id, opt.value)}
                    className={`flex w-full items-center justify-between rounded-sm border px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? "border-sage bg-sage/5 text-charcoal"
                        : "border-sage/20 text-muted hover:border-sage/40"
                    }`}
                  >
                    {opt.label}
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-sm border text-xs ${
                        selected ? "border-sage bg-sage text-ivory" : "border-sage/30 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              className="text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-colors hover:text-charcoal"
            >
              {step === 0 ? "Cancel" : "Back"}
            </button>
            <button
              type="button"
              onClick={next}
              disabled={!isAnswered}
              className="rounded-full bg-sage px-8 py-3 text-sm font-medium tracking-wide text-ivory transition-all enabled:hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLast ? "See My Plan" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
