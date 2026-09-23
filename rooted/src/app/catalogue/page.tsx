import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShampooCard from "@/components/ShampooCard";
import { SHAMPOOS } from "@/lib/advisor";

export const metadata = { title: "Malaysian shampoo catalogue | ROOTED", description: "Explore 10 shampoos listed in Malaysia, with ingredient sources and dated retailer prices." };
export default function CataloguePage() {
  return <div className="min-h-screen bg-ivory"><Navbar/><main className="mx-auto max-w-6xl px-6 pb-20 pt-32"><p className="text-xs font-semibold uppercase tracking-[.2em] text-earth">The source shelf / Malaysia</p><h1 className="mt-4 max-w-3xl font-serif text-5xl text-forest sm:text-6xl">Real products.<br/><em>Room to look closer.</em></h1><p className="mt-6 max-w-2xl text-base leading-relaxed text-muted">10 shampoos researched from Malaysian retailer and manufacturer pages on 23 September 2026. Open any source to compare the packaging, ingredients and current offer.</p><div className="my-8 rounded-2xl bg-cream p-5 text-sm leading-relaxed text-charcoal">A small curated catalogue, not the whole market. Claims are attributed to their sources; they do not establish how a product will perform for you. Formulas and prices can change. Stock and branch availability are unconfirmed.</div><Link href="/shampoo-advisor" className="mb-8 inline-flex rounded-full bg-forest px-7 py-3 text-sm font-semibold text-ivory">Find a place to start →</Link><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{SHAMPOOS.map((p) => <ShampooCard key={p.id} product={p}/>)}</div></main><Footer/></div>;
}
