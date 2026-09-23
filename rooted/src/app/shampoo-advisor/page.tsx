"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdvisorAccount from "@/components/AdvisorAccount";
import { EMPTY_ANSWERS, parseAdvisorAnswers, routineNotes, ADVISOR_VERSION, type AdvisorAnswers, type ShampooPick } from "@/lib/advisor";
import Link from "next/link";
import EditorialImage from "@/components/EditorialImage";
import ShampooCard from "@/components/ShampooCard";

const STORAGE = "rooted_advisor_draft_v2";
const initial = EMPTY_ANSWERS;
const screens = ["Your hair", "Your scalp", "Your priorities", "Your routine", "Your day", "Your preferences"];
const choices = {
  texture: [["straight", "Straight", "────"], ["wavy", "Wavy", "〰〰"], ["curly", "Curly", "◌◌"], ["coily", "Coily", "◎◎"], ["unsure", "Not sure", "?"]],
  thickness: [["fine", "Fine"], ["medium", "Medium"], ["thick", "Thick"], ["unsure", "Not sure"]],
  scalp: [["oily", "Gets oily quickly"], ["dry", "Feels dry or tight"], ["balanced", "Usually balanced"], ["sensitive", "Easily irritated"], ["unsure", "Not sure"]],
  concerns: [["oil", "Oil control"], ["moisture", "Moisture"], ["frizz", "Frizz"], ["damage", "Damage care"], ["volume", "Volume"], ["comfort", "Scalp comfort"], ["flakes", "Visible flakes"], ["none", "None in particular"]],
  treatments: [["colour", "Coloured"], ["bleach", "Bleached"], ["chemical", "Rebonded or chemically treated"], ["none", "None"], ["unsure", "Not sure"]],
  routine: [["daily", "Every day"], ["several", "A few times a week"], ["weekly", "About weekly or less"], ["unsure", "It varies"]],
  lifestyle: [["sweat", "I sweat often"], ["outdoors", "I spend time outdoors"], ["headwear", "I wear a hijab, helmet or other head covering"], ["none", "None of these"]],
  fragrance: [["prefer_free", "Prefer no fragrance"], ["either", "Either is fine"], ["prefer_scented", "I like fragrance"]],
  sensitivity: [["fragrance", "Known fragrance sensitivity"], ["none", "No known sensitivity"], ["unsure", "Not sure"]],
  budget: [["under_25", "Under RM25"], ["under_40", "Under RM40"], ["any", "Flexible"]],
} as const;
type Key = keyof AdvisorAnswers;


export default function ShampooAdvisor() {
  const [answers, setAnswers] = useState<AdvisorAnswers>(initial);
  const [phase, setPhase] = useState<"intro" | "questions" | "review" | "results">("intro");
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<ShampooPick[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState("");
  const [scannedShampoo, setScannedShampoo] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { if (hydrated && phase !== "intro") heading.current?.focus({ preventScroll: true }); }, [phase, step, hydrated]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(STORAGE);
        if (raw) {
          const saved = JSON.parse(raw);
          const clean = parseAdvisorAnswers(saved.answers, true);
          if (clean && saved.version === ADVISOR_VERSION) {
            setAnswers(clean);
            setStep(Number.isInteger(saved.step) && saved.step >= 0 && saved.step < 6 ? saved.step : 0);
            if (["review", "results"].includes(saved.phase) && parseAdvisorAnswers(clean)) setPhase("review");
            else if (saved.phase === "questions") setPhase("questions");
          }
        }
      } catch { /* discard corrupt or outdated draft */ }
      try { setScannedShampoo(localStorage.getItem("rooted_last_scanned") || ""); } catch { /* storage unavailable */ }
      if (new URLSearchParams(location.search).get("retailer")) setContext("This retailer link is not active. You can still explore the full ROOTED catalogue; no branch-specific stock is available.");
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => { if (!hydrated) return; try { localStorage.setItem(STORAGE, JSON.stringify({ answers, step, phase, version: ADVISOR_VERSION })); } catch { /* storage unavailable */ } }, [answers, step, phase, hydrated]);

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
  function display(key: Key) {
    const value = answers[key];
    return (Array.isArray(value) ? value : [value]).map((v) => choices[key].find((item) => item[0] === v)?.[1] || v).join(", ");
  }
  const reviewGroups: Key[][] = [["texture", "thickness"], ["scalp"], ["concerns"], ["treatments", "routine"], ["lifestyle"], ["fragrance", "sensitivity", "budget"]];
  const content = [
    <div key="hair">{group("texture", "Which shape looks most like your natural hair?")}{group("thickness", "How does one strand feel?")}</div>,
    <div key="scalp">{group("scalp", "How does your scalp usually feel?")}<p className="text-xs text-muted">Choose what is most typical, rather than how it feels on wash day.</p></div>,
    <div key="concerns">{group("concerns", "What would you most like help with?", true)}<p className="text-xs text-muted">Pick any that matter. “None” clears other choices.</p></div>,
    <div key="routine">{group("treatments", "Have you treated your hair recently?", true)}{group("routine", "How often do you wash it?")}</div>,
    <div key="day">{group("lifestyle", "What is part of your usual day?", true)}<p className="text-xs text-muted">These guide routine notes. They do not change the product ranking or imply a scalp condition.</p></div>,
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
  function restart() { setAnswers(initial); setStep(0); setPhase("intro"); setPicks([]); try { localStorage.removeItem(STORAGE); localStorage.removeItem("rooted_advisor_draft_v1"); } catch { /* no storage */ } }

  return <div className="min-h-screen bg-ivory"><Navbar /><main className="pb-20 pt-24 sm:pt-28"><div className="mx-auto max-w-5xl px-5 sm:px-8">
    {context && <p role="status" className="mb-5 rounded-xl border border-earth/30 bg-cream p-4 text-sm text-charcoal">{context}</p>}
    {phase === "intro" && <div className="grid items-center gap-10 py-10 md:grid-cols-2 md:py-16"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-earth">ROOTED / Shampoo advisor</p><h1 ref={heading} tabIndex={-1} className="outline-none mt-4 font-serif text-5xl leading-[.95] text-forest sm:text-7xl">Good hair days start with <em>clarity.</em></h1><p className="mt-7 max-w-lg text-base leading-relaxed text-muted">Tell us about your hair, scalp, routine and budget. Explore real shampoos listed in Malaysia, with reasons and source evidence for each suggestion.</p>{scannedShampoo && <p className="mt-5 rounded-xl bg-cream p-4 text-sm text-forest">Scanned shampoo: <strong>{scannedShampoo}</strong>. We&apos;ll keep it in view, but cannot compare its formulation until its exact variant and ingredient list match a catalogue record.</p>}<div className="mt-7 flex flex-wrap gap-2 text-xs text-forest"><span className="rounded-full bg-cream px-3 py-2">Free to explore</span><span className="rounded-full bg-cream px-3 py-2">No account needed</span><span className="rounded-full bg-cream px-3 py-2">6 short screens</span></div><p className="mt-5 text-sm text-earth">10 source-reviewed shampoos · prices checked 23 Sep 2026. Stock is not live.</p><button onClick={() => { setPhase("questions"); window.scrollTo({ top: 0 }); }} className="mt-8 rounded-full bg-forest px-8 py-4 text-sm font-semibold text-ivory transition hover:bg-sage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest">{answers.texture ? "Continue consultation →" : "Start consultation →"}</button><Link href="/catalogue" className="mt-5 block text-sm text-forest underline underline-offset-4">Browse the source shelf ↗</Link>{answers.texture && <button onClick={restart} className="mt-4 text-xs text-muted underline">Clear saved draft</button>}</div><EditorialImage preload /></div>}
    {phase === "questions" && <div className="mx-auto max-w-3xl"><div className="mb-7 flex items-center justify-between gap-4"><span className="text-xs font-semibold uppercase tracking-[.2em] text-earth">The consultation</span><button onClick={() => setPhase("intro")} className="text-sm text-muted underline underline-offset-4">Cancel</button></div><div className="mb-8 h-2 overflow-hidden rounded-full bg-sage/15"><div className="h-full rounded-full bg-sage transition-all" style={{ width: `${((step + 1) / screens.length) * 100}%` }} /></div><p className="text-sm text-muted">{step + 1} of {screens.length}</p><h1 ref={heading} tabIndex={-1} className="outline-none mb-7 mt-2 font-serif text-4xl text-forest sm:text-5xl">{screens[step]}</h1><div className="rounded-[1.5rem] border border-sage/15 bg-cream/50 p-5 sm:p-8">{content[step]}<div className="flex items-center justify-between border-t border-sage/15 pt-5"><button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="min-h-11 text-sm text-forest underline disabled:opacity-30">Back</button><button disabled={!ready} onClick={() => { if (step === 5) setPhase("review"); else setStep(step + 1); window.scrollTo({ top: 0 }); }} className="min-h-11 rounded-full bg-forest px-7 text-sm font-semibold text-ivory disabled:opacity-40">{step === 5 ? "Review answers" : "Continue"} →</button></div></div></div>}
    {phase === "review" && <div className="mx-auto max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">One last look</p><h1 ref={heading} tabIndex={-1} className="outline-none mt-3 font-serif text-5xl text-forest">Your hair, in your words.</h1><div className="mt-8 grid gap-3 sm:grid-cols-2">{screens.map((name, i) => <button key={name} onClick={() => { setStep(i); setPhase("questions"); }} className="rounded-2xl border border-sage/15 bg-cream/70 p-5 text-left hover:border-forest"><span className="text-xs uppercase tracking-widest text-earth">{name}</span><span className="mt-2 block text-sm capitalize text-charcoal">{reviewGroups[i].map(display).join(" · ")}</span><span className="mt-3 block text-xs text-sage underline">Edit</span></button>)}</div>{error && <p role="alert" className="mt-5 text-sm text-red-700">{error}</p>}<button disabled={loading} onClick={submit} className="mt-7 min-h-12 rounded-full bg-forest px-8 text-sm font-semibold text-ivory disabled:opacity-50">{loading ? "Preparing results…" : "See my results →"}</button></div>}
    {phase === "results" && <div className="mx-auto max-w-4xl"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">Your ROOTED profile</p><h1 ref={heading} tabIndex={-1} className="outline-none mt-3 font-serif text-5xl text-forest">A clearer place to start.</h1><p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">Your focus: {display("concerns")}. Scalp: {display("scalp")}. These are matches to published product claims, not predictions of how a product will work for you.</p><div className="mt-8 rounded-2xl bg-[#DFE7D9] p-5 text-sm leading-relaxed text-forest"><strong>A sourced starting point</strong><p className="mt-1">Matched from 10 shampoos listed in Malaysia. Ingredients and prices were reviewed online on 23 Sep 2026, not verified against your bottle. Budget filters use regular listed prices. Product claims are not guarantees of performance.</p><Link href="/catalogue" className="mt-3 inline-block underline underline-offset-4">Explore all products & sources ↗</Link></div><div className="mt-8 grid items-start gap-5 md:grid-cols-2">{picks.map((p, i) => <ShampooCard key={p.id} product={p} index={i}/>)}</div>{picks.length === 0 && <div className="mt-8 rounded-2xl bg-cream p-7"><h2 className="font-serif text-2xl text-forest">No suitable product in this catalogue</h2><p className="mt-2 text-sm text-muted">Your filters exclude this small catalogue’s available options. Keep any known sensitivity restriction. You can review your budget or explore other products with a pharmacist.</p></div>}<div className="mt-9 flex flex-wrap gap-3"><button onClick={() => setPhase("review")} className="rounded-full border border-forest px-6 py-3 text-sm text-forest">Edit answers</button><button onClick={restart} className="rounded-full border border-sage/30 px-6 py-3 text-sm text-forest">Start over</button></div><section className="mt-8 rounded-2xl bg-cream p-6"><h2 className="font-serif text-2xl text-forest">A note for your routine</h2><ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted">{routineNotes(answers).map((note) => <li key={note}>{note}</li>)}</ul></section><AdvisorAccount answers={answers} /><p className="mt-10 text-xs leading-relaxed text-muted">Cosmetic guidance only. Persistent or severe scalp symptoms deserve advice from a qualified healthcare professional. Your draft remains on this device; clear it with Start over, especially on a shared device.</p></div>}
  </div></main><Footer /></div>;
}
