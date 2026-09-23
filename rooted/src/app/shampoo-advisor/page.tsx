"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvisorAccount from "@/components/AdvisorAccount";
import type { AdvisorAnswers } from "@/lib/advisor";

const STORAGE = "rooted_advisor_draft_v1";
const initial: AdvisorAnswers = { texture: "", thickness: "", scalp: "", concerns: [], treatments: [], routine: "", lifestyle: [], fragrance: "", sensitivity: "", budget: "" };
const screens = ["Your hair", "Your scalp", "Your priorities", "Your routine", "Your day", "Your preferences"];
const choices = {
  texture: [["straight", "Straight", "────"], ["wavy", "Wavy", "〰〰"], ["curly", "Curly", "◌◌"], ["coily", "Coily", "◎◎"], ["unsure", "Not sure", "?"]],
  thickness: [["fine", "Fine"], ["medium", "Medium"], ["thick", "Thick"], ["unsure", "Not sure"]],
  scalp: [["oily", "Gets oily quickly"], ["dry", "Feels dry or tight"], ["balanced", "Usually balanced"], ["sensitive", "Easily irritated"], ["unsure", "Not sure"]],
  concerns: [["oil", "Oil control"], ["moisture", "Moisture"], ["frizz", "Frizz"], ["damage", "Damage care"], ["volume", "Volume"], ["comfort", "Scalp comfort"], ["none", "None in particular"]],
  treatments: [["colour", "Coloured"], ["bleach", "Bleached"], ["chemical", "Rebonded or chemically treated"], ["none", "None"], ["unsure", "Not sure"]],
  routine: [["daily", "Every day"], ["several", "A few times a week"], ["weekly", "About weekly or less"], ["unsure", "It varies"]],
  lifestyle: [["sweat", "I sweat often"], ["outdoors", "I spend time outdoors"], ["headwear", "I wear a hijab, helmet or other head covering"], ["none", "None of these"]],
  fragrance: [["prefer_free", "Prefer no fragrance"], ["either", "Either is fine"], ["prefer_scented", "I like fragrance"]],
  sensitivity: [["fragrance", "Known fragrance sensitivity"], ["none", "No known sensitivity"], ["unsure", "Not sure"]],
  budget: [["under_25", "Under RM25"], ["under_40", "Under RM40"], ["any", "Flexible"]],
} as const;
type Key = keyof AdvisorAnswers;
type Pick = { id: string; name: string; brand: string; size: string; price: number; reasons: string[]; considerations: string[] };

export default function ShampooAdvisor() {
  const [answers, setAnswers] = useState<AdvisorAnswers>(initial);
  const [phase, setPhase] = useState<"intro" | "questions" | "review" | "results">("intro");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState("");
  const [scannedShampoo, setScannedShampoo] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      try { const saved = localStorage.getItem(STORAGE); if (saved) setAnswers({ ...initial, ...JSON.parse(saved) }); } catch { /* discarded draft */ }
      try { setScannedShampoo(localStorage.getItem("rooted_last_scanned") || ""); } catch { /* storage unavailable */ }
      if (new URLSearchParams(location.search).get("retailer")) setContext("This retailer link is not active. You can still explore the ROOTED demonstration catalogue.");
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(STORAGE, JSON.stringify(answers)); } catch { /* storage unavailable */ } }, [answers, hydrated]);

  function select(key: Key, value: string, multi = false) {
    setAnswers((previous) => {
      if (!multi) return { ...previous, [key]: value };
      const current = previous[key] as string[];
      const next = value === "none" || value === "unsure" ? [value] : current.includes(value) ? current.filter((v) => v !== value) : [...current.filter((v) => v !== "none" && v !== "unsure"), value];
      return { ...previous, [key]: next };
    });
  }
  function group(key: Key, title: string, multi = false) {
    return <fieldset className="mb-7"><legend className="mb-3 text-sm font-semibold text-forest">{title}</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{choices[key].map(([value, label, art]) => {
      const selected = multi ? (answers[key] as string[]).includes(value) : answers[key] === value;
      return <button type="button" key={value} aria-pressed={selected} onClick={() => select(key, value, multi)} className={`min-h-16 rounded-2xl border px-3 py-3 text-left text-sm transition duration-150 active:scale-[.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${selected ? "border-forest bg-forest text-ivory shadow-md" : "border-sage/20 bg-white/70 text-charcoal hover:border-sage hover:bg-white"}`}><span className="block font-medium">{label}</span>{art && <span aria-hidden="true" className="mt-2 block text-lg opacity-60">{art}</span>}</button>;
    })}</div></fieldset>;
  }
  const content = [
    <div key="hair">{group("texture", "Which shape looks most like your natural hair?")}{group("thickness", "How does one strand feel?")}</div>,
    <div key="scalp">{group("scalp", "How does your scalp usually feel?")}<p className="text-xs text-muted">Choose what is most typical, rather than how it feels on wash day.</p></div>,
    <div key="concerns">{group("concerns", "What would you most like help with?", true)}<p className="text-xs text-muted">Pick any that matter. “None” clears other choices.</p></div>,
    <div key="routine">{group("treatments", "Have you treated your hair recently?", true)}{group("routine", "How often do you wash it?")}</div>,
    <div key="day">{group("lifestyle", "What is part of your usual day?", true)}<p className="text-xs text-muted">These help us consider heat, sweat and washing habits without making assumptions about you.</p></div>,
    <div key="preferences">{group("fragrance", "What do you prefer about fragrance?")}{group("sensitivity", "Do you know of a fragrance sensitivity?")}{group("budget", "What is your budget per bottle?")}</div>,
  ];
  const ready = [answers.texture && answers.thickness, answers.scalp, answers.concerns.length, answers.treatments.length && answers.routine, answers.lifestyle.length, answers.fragrance && answers.sensitivity && answers.budget][step];
  async function submit() {
    if (loading) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/advisor", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(answers) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not prepare results.");
      setPicks(data.recommendations); setPhase("results"); window.scrollTo({ top: 0 });
    } catch (e) { setError(e instanceof Error ? e.message : "Please try again."); } finally { setLoading(false); }
  }
  function restart() { setAnswers(initial); setStep(0); setPhase("intro"); setPicks([]); try { localStorage.removeItem(STORAGE); } catch { /* no storage */ } }

  return <div className="min-h-screen bg-ivory"><Navbar /><main className="pb-20 pt-24 sm:pt-28"><div className="mx-auto max-w-5xl px-5 sm:px-8">
    {context && <p role="status" className="mb-5 rounded-xl border border-earth/30 bg-cream p-4 text-sm text-charcoal">{context}</p>}
    {phase === "intro" && <div className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-earth">ROOTED / Shampoo advisor</p><h1 className="mt-4 font-serif text-5xl leading-[.95] text-forest sm:text-7xl">Good hair days start with <em>clarity.</em></h1><p className="mt-7 max-w-lg text-base leading-relaxed text-muted">Tell us about your hair, scalp, routine and budget. See how a curated catalogue could be matched to your needs.</p>{scannedShampoo && <p className="mt-5 rounded-xl bg-cream p-4 text-sm text-forest">Scanned shampoo: <strong>{scannedShampoo}</strong>. We&apos;ll keep it in view, but cannot compare its formulation until verified catalogue data is available.</p>}<div className="mt-7 flex flex-wrap gap-2 text-xs text-forest"><span className="rounded-full bg-cream px-3 py-2">Free to explore</span><span className="rounded-full bg-cream px-3 py-2">No account needed</span><span className="rounded-full bg-cream px-3 py-2">6 short screens</span></div><p className="mt-5 text-sm text-earth">Currently uses clearly labelled demonstration products. No live retailer prices or stock.</p><button onClick={() => { setPhase("questions"); window.scrollTo({ top: 0 }); }} className="mt-8 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-ivory transition hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">Start consultation →</button></div><div className="relative flex min-h-96 items-center justify-center overflow-hidden rounded-[2rem] bg-[#DCE3D4] p-8"><div className="absolute left-[-10%] top-[10%] h-60 w-60 rounded-full border border-forest/15"/><div className="absolute right-[-10%] bottom-[-20%] h-72 w-72 rounded-full border border-forest/15"/><div aria-hidden="true" className="relative flex h-72 w-40 flex-col items-center rounded-[2.6rem_2.6rem_1.2rem_1.2rem] border border-forest/20 bg-[#718973] px-4 pt-14 shadow-[25px_30px_45px_rgba(38,59,45,.25),inset_-16px_0_20px_rgba(0,0,0,.12),inset_12px_0_18px_rgba(255,255,255,.18)] before:absolute before:-top-9 before:h-11 before:w-20 before:rounded-t-lg before:bg-forest"><span className="mt-8 w-full border-y border-ivory/50 py-5 text-center font-serif text-3xl tracking-widest text-ivory">ROOTED</span><span className="mt-4 text-center text-[10px] uppercase tracking-[.2em] text-ivory/80">Find your fit</span></div><span className="absolute bottom-6 right-6 rounded-full bg-ivory/90 px-4 py-2 text-xs text-forest">The consultation →</span></div></div>}
    {phase === "questions" && <div className="mx-auto max-w-3xl"><div className="mb-7 flex items-center justify-between gap-4"><span className="text-xs font-semibold uppercase tracking-[.2em] text-earth">The consultation</span><button onClick={() => setPhase("intro")} className="text-sm text-muted underline underline-offset-4">Cancel</button></div><div className="mb-8 h-2 overflow-hidden rounded-full bg-sage/15"><div className="h-full rounded-full bg-sage transition-all" style={{ width: `${((step + 1) / screens.length) * 100}%` }} /></div><p className="text-sm text-muted">{step + 1} of {screens.length}</p><h1 tabIndex={-1} className="mb-7 mt-2 font-serif text-4xl text-forest sm:text-5xl">{screens[step]}</h1><div className="rounded-[1.5rem] border border-sage/15 bg-cream/50 p-5 sm:p-8">{content[step]}<div className="flex items-center justify-between border-t border-sage/15 pt-5"><button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="min-h-11 text-sm text-forest underline disabled:opacity-30">Back</button><button disabled={!ready} onClick={() => { if (step === 5) setPhase("review"); else setStep(step + 1); window.scrollTo({ top: 0 }); }} className="min-h-11 rounded-full bg-forest px-7 text-sm font-semibold text-ivory disabled:opacity-40">{step === 5 ? "Review answers" : "Continue"} →</button></div></div></div>}
    {phase === "review" && <div className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">One last look</p><h1 className="mt-3 font-serif text-5xl text-forest">Your hair, in your words.</h1><div className="mt-8 grid gap-3 sm:grid-cols-2">{screens.map((name, i) => <button key={name} onClick={() => { setStep(i); setPhase("questions"); }} className="rounded-2xl border border-sage/15 bg-cream/70 p-5 text-left hover:border-forest"><span className="text-xs uppercase tracking-widest text-earth">{name}</span><span className="mt-2 block text-sm capitalize text-charcoal">{i === 0 ? `${answers.texture}, ${answers.thickness}` : i === 1 ? answers.scalp : i === 2 ? answers.concerns.join(", ") : i === 3 ? `${answers.treatments.join(", ")}; ${answers.routine}` : i === 4 ? answers.lifestyle.join(", ") : `${answers.fragrance.replaceAll("_", " ")}; ${answers.budget.replaceAll("_", " ")}`}</span><span className="mt-3 block text-xs text-sage underline">Edit</span></button>)}</div>{error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}<button disabled={loading} onClick={submit} className="mt-7 min-h-12 rounded-full bg-forest px-8 text-sm font-semibold text-ivory disabled:opacity-50">{loading ? "Preparing results…" : "See my results →"}</button></div>}
    {phase === "results" && <div className="mx-auto max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">Your ROOTED profile</p><h1 className="mt-3 font-serif text-5xl text-forest">A clearer place to start.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Your {answers.texture} hair and {answers.scalp} scalp, with {answers.concerns.join(", ")} in focus. These are catalogue matching examples, not predictions of how a product will work for you.</p><div className="mt-8 rounded-2xl bg-[#DFE7D9] p-5 text-sm text-forest"><strong>Demonstration catalogue</strong><p className="mt-1">Products, prices and formulas below are fictional fixtures. No purchase links or stock claims are available. ROOTED needs a verified retailer catalogue before live recommendations.</p></div><div className="mt-8 grid gap-5 md:grid-cols-2">{picks.map((p, i) => <article key={p.id} className="rounded-[1.5rem] border border-sage/15 bg-white/70 p-6"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">{i === 0 ? "Closest example" : "Also consider"}</p><div className="my-6 flex h-36 items-end justify-center rounded-2xl bg-cream"><div className="h-28 w-17 rounded-t-xl bg-sage shadow-xl"><div className="mt-10 border-y border-ivory/50 py-2 text-center font-serif text-xs text-ivory">ROOTED</div></div></div><h2 className="font-serif text-3xl text-forest">{p.name}</h2><p className="mt-1 text-sm text-muted">{p.brand} · {p.size} · Demo RM{p.price}</p><ul className="mt-5 space-y-2 text-sm text-charcoal">{p.reasons.length ? p.reasons.map((r) => <li key={r}>✓ {r}</li>) : <li>Limited profile overlap. Review the considerations.</li>}</ul><p className="mt-5 border-t border-sage/15 pt-4 text-xs leading-relaxed text-muted">{p.considerations.join(" ")}</p></article>)}</div>{picks.length === 0 && <div className="mt-8 rounded-2xl bg-cream p-7"><h2 className="font-serif text-2xl text-forest">No suitable example in this catalogue</h2><p className="mt-2 text-sm text-muted">Your budget or known sensitivity excludes the available demonstration products. Edit your answers or check again when a verified catalogue is available.</p></div>}<div className="mt-9 flex flex-wrap gap-3"><button onClick={() => setPhase("review")} className="rounded-full border border-forest px-6 py-3 text-sm text-forest">Edit answers</button><button onClick={restart} className="rounded-full border border-sage/30 px-6 py-3 text-sm text-forest">Start over</button></div><AdvisorAccount answers={answers} /><p className="mt-10 text-xs leading-relaxed text-muted">Cosmetic guidance only. Persistent or severe scalp symptoms deserve advice from a qualified healthcare professional. Your draft remains on this device; clear it with Start over, especially on a shared device.</p></div>}
  </div></main><Footer /></div>;
}
