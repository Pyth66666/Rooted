"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import type { AdvisorAnswers } from "@/lib/advisor";

type Saved = { id: string; created_at: string; answers: AdvisorAnswers; version: string; recommendations: { name: string }[] };
function browserAuth(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && key ? createClient(url, key) : null;
}

export default function AdvisorAccount({ answers }: { answers?: AdvisorAnswers }) {
  const [client] = useState(browserAuth);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [signedIn, setSignedIn] = useState(false);
  const [sent, setSent] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<Saved[]>([]);

  useEffect(() => {
    if (!client) return;
    client.auth.getUser().then(({ data }) => setSignedIn(Boolean(data.user)));
    const { data } = client.auth.onAuthStateChange((_event, session) => setSignedIn(Boolean(session?.user)));
    return () => data.subscription.unsubscribe();
  }, [client]);
  async function token() { return (await client?.auth.getSession())?.data.session?.access_token; }
  async function load() {
    const access = await token(); if (!access) return;
    const res = await fetch("/api/advisor/saved", { headers: { Authorization: `Bearer ${access}` } });
    const data = await res.json();
    if (res.ok) setSaved(data.profiles); else setStatus(data.error || "Could not load profiles.");
  }
  useEffect(() => { if (signedIn) { const timer = setTimeout(() => void load(), 0); return () => clearTimeout(timer); } }, [signedIn]); // eslint-disable-line react-hooks/exhaustive-deps
  async function sendCode() {
    if (!client || busy) return;
    setBusy(true); setStatus("");
    const { error } = await client.auth.signInWithOtp({ email: email.trim(), options: { shouldCreateUser: true } });
    setBusy(false); setSent(!error); setStatus(error ? "Could not send a code. Try again shortly." : "Check your inbox for your one-time sign-in code.");
  }
  async function verify() {
    if (!client || busy) return;
    setBusy(true); setStatus("");
    const { error } = await client.auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    setBusy(false); setStatus(error ? "That code is invalid or expired. Request a new one." : "Email verified. You can now save your profile.");
  }
  async function save() {
    if (!answers || busy) return;
    const access = await token(); if (!access) return;
    setBusy(true); setStatus("");
    const res = await fetch("/api/advisor/saved", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${access}` }, body: JSON.stringify(answers) });
    const data = await res.json(); setBusy(false);
    setStatus(res.ok ? "Your profile is saved." : data.error || "Could not save profile.");
    if (res.ok) await load();
  }
  async function remove(id: string) {
    const access = await token(); if (!access) return;
    const res = await fetch(`/api/advisor/saved?id=${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${access}` } });
    if (res.ok) { setSaved((p) => p.filter((x) => x.id !== id)); setStatus("Profile deleted."); } else setStatus("Could not delete profile.");
  }
  if (!client) return <p className="mt-8 rounded-2xl bg-cream p-5 text-sm text-muted">Optional account saving will be available when email sign-in is configured. Your free result remains visible above.</p>;
  return <section className="mt-10 rounded-[1.5rem] bg-cream p-6 sm:p-8"><h2 className="font-serif text-3xl text-forest">Your ROOTED Hair Profile</h2><p className="mt-2 max-w-2xl text-sm text-muted">Save your result in a free account and revisit it later. Email verification is required. Saving does not opt you into marketing or research.</p>
    {!signedIn && <div className="mt-6 max-w-sm space-y-3"><label className="block text-sm text-forest" htmlFor="account-email">Email address</label><input id="account-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-sage/30 bg-white p-3 text-charcoal"/><button type="button" disabled={busy || !email.includes("@")} onClick={sendCode} className="rounded-full bg-forest px-6 py-3 text-sm text-ivory disabled:opacity-40">{sent ? "Resend code" : "Email my sign-in code"}</button>{sent && <><label className="block pt-3 text-sm text-forest" htmlFor="account-code">One-time code</label><input id="account-code" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} className="w-full rounded-xl border border-sage/30 bg-white p-3 text-charcoal"/><button type="button" disabled={busy || code.length < 6} onClick={verify} className="rounded-full border border-forest px-6 py-3 text-sm text-forest disabled:opacity-40">Verify email</button></>}</div>}
    {signedIn && <div className="mt-6"><div className="flex flex-wrap gap-3">{answers && <button disabled={busy} onClick={save} className="rounded-full bg-forest px-6 py-3 text-sm text-ivory disabled:opacity-40">Save this result</button>}<button onClick={async () => { await client.auth.signOut(); setSaved([]); setStatus("Signed out."); }} className="rounded-full border border-forest px-6 py-3 text-sm text-forest">Sign out</button></div><h3 className="mt-7 text-sm font-semibold text-forest">Saved profiles</h3>{saved.length === 0 && <p className="mt-2 text-sm text-muted">No saved profiles yet.</p>}{saved.map((item) => <div key={item.id} className="mt-3 rounded-xl bg-white/70 p-4 text-sm"><p className="font-medium text-forest">{new Date(item.created_at).toLocaleDateString()} · {item.answers.texture} hair · {item.answers.scalp} scalp</p><p className="mt-1 text-muted">{item.recommendations.map((p) => p.name).join(", ") || "No suitable product"}</p><p className="mt-1 text-xs text-earth">{item.version.startsWith("demo") ? "Legacy demonstration" : "Saved catalogue result"} · {item.version}. Catalogue details may have changed.</p><button onClick={() => remove(item.id)} className="mt-2 text-xs text-red-700 underline">Delete this profile</button></div>)}</div>}
    {status && <p role="status" className="mt-5 text-sm text-forest">{status}</p>}
  </section>;
}
