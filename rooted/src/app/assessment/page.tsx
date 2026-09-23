"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AssessmentForm from "@/components/AssessmentForm";
import PaymentScreen from "@/components/PaymentScreen";
import AssessmentResults, {
  type AssessmentResultData,
} from "@/components/AssessmentResults";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { HairAnswerInput } from "@/lib/types";

type Stage = "form" | "payment" | "results" | "error";

function readScanName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem("rooted_last_scanned") ?? "";
  } catch {
    return "";
  }
}

export default function AssessmentPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("form");
  const [scanName] = useState<string>(readScanName);
  const [reference, setReference] = useState("");
  const [result, setResult] = useState<AssessmentResultData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (!ref) return;
    fetch(`/api/assessment/results?ref=${encodeURIComponent(ref)}`)
      .then(async (r) => { const data = await r.json(); setReference(ref); if (r.status === 402) { setStage("payment"); return; } if (!r.ok) throw new Error(data.error || "Could not restore your assessment."); setResult(data); setStage("results"); })
      .catch((e) => { setError(e instanceof Error ? e.message : "Could not restore your assessment."); setStage("error"); });
  }, []);

  const handleFormSubmit = async (answers: HairAnswerInput) => {
    try {
      const res = await fetch("/api/assessment/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(answers),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not start your assessment.");
        setStage("error");
        return;
      }
      setReference(data.reference);
      setStage("payment");
      window.scrollTo({ top: 0 });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Try again.");
      setStage("error");
    }
  };

  const handlePaid = (data: unknown) => {
    setResult(data as AssessmentResultData);
    setStage("results");
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />
      {stage === "form" && process.env.NODE_ENV === "production" && <section className="mx-auto max-w-xl px-6 pb-24 pt-20 text-center"><h1 className="font-serif text-4xl text-forest">RM10 assessment is paused</h1><p className="mt-5 text-sm leading-relaxed text-muted">The paid assessment is being reviewed to ensure it offers distinct value and a verified payment flow. Explore the free shampoo advisor without an account.</p><Link href="/shampoo-advisor" className="mt-7 inline-flex rounded-full bg-forest px-7 py-3 text-sm text-ivory">Explore the free advisor →</Link></section>}
      {(stage === "payment" || (stage === "form" && process.env.NODE_ENV !== "production")) && (
        <div className={stage === "form" ? "" : "hidden"}>
          <div className="bg-ivory pt-24 text-center">
            <Link
              href="/"
              className="text-sm text-muted underline underline-offset-4 decoration-muted/30 hover:text-charcoal"
            >
              ← Back to homepage
            </Link>
          </div>
          <AssessmentForm
            defaultCurrentProduct={scanName}
            onSubmit={handleFormSubmit}
            onBack={() => router.push("/")}
          />
        </div>
      )}

      {stage === "payment" && (
        <PaymentScreen
          reference={reference}
          onPaid={handlePaid}
          onBack={() => {
            setStage("form");
            window.scrollTo({ top: 0 });
          }}
        />
      )}

      {stage === "results" && result && <AssessmentResults result={result} />}

      {stage === "error" && (
        <section className="bg-ivory py-32 text-center">
          <div className="mx-auto max-w-md px-6">
            <h2 className="font-serif text-3xl font-medium text-charcoal">
              Something went wrong
            </h2>
            <p className="mt-4 text-sm text-muted">{error}</p>
            <a
              href="/assessment"
              className="mt-8 inline-flex rounded-full bg-sage px-8 py-3 text-sm font-medium text-ivory"
            >
              Try again
            </a>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
