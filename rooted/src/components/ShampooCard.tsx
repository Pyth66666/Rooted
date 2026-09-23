import type { SHAMPOOS, ShampooPick } from "@/lib/advisor";

type Product = (typeof SHAMPOOS)[number];
export default function ShampooCard({ product: p, index }: { product: Product | ShampooPick; index?: number }) {
  const matched = "reasons" in p;
  return <article className="flex flex-col rounded-[1.5rem] border border-sage/20 bg-white/80 p-6 sm:p-7">
    <div className="mb-6 flex items-start justify-between gap-3">
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-earth">{matched ? index === 0 ? "First to explore" : "Also consider" : p.listing.retailer}</p>
      <span className="rounded-full bg-cream px-3 py-1 text-xs text-forest">{p.size}</span>
    </div>
    <p className="text-sm font-medium text-sage">{p.brand}</p>
    <h2 className="mt-2 font-serif text-3xl leading-tight text-forest">{p.name}</h2>
    <p className="mt-4 text-sm leading-relaxed text-muted">{p.claim}</p>
    <div className="my-5 border-y border-sage/15 py-4"><p className="font-serif text-3xl text-forest">RM{p.listing.price.toFixed(2)}<span className="ml-2 font-sans text-xs text-muted">observed online</span></p><p className="mt-1 text-xs text-muted">Regular listed price RM{p.listing.regularPrice.toFixed(2)} · checked 23 Sep 2026</p></div>
    {matched && <><h3 className="text-sm font-semibold text-forest">Why it appears</h3><ul className="mt-2 list-disc space-y-2 pl-4 text-sm leading-relaxed text-charcoal">{p.reasons.length ? p.reasons.map((r) => <li key={r}>{r}</li>) : <li>Limited overlap with your priorities. This is an option within your filters, with no claim of a close match.</li>}</ul><p className="mt-4 text-xs leading-relaxed text-muted">{p.considerations.join(" ")}</p></>}
    <details className="mt-5 border-t border-sage/15 pt-4 text-xs leading-relaxed text-muted"><summary className="cursor-pointer font-semibold text-forest">Ingredients & source evidence</summary><p className="mt-3">{p.formulation.fragrance ? "Fragrance or fragrant oils are listed." : "Manufacturer claims fragrance-free."} Source-reviewed online; not checked against a physical bottle.</p><p className="mt-3">{p.formulation.ingredients}</p><a className="mt-3 inline-block text-forest underline underline-offset-4" href={p.formulation.sourceUrl} target="_blank" rel="noopener noreferrer">Ingredient source: {p.formulation.sourceName} ↗</a><p className="mt-2">Malaysia · reviewed {p.formulation.reviewedAt} · formula snapshot {p.formulation.id}</p></details>
    <a href={p.listing.url} target="_blank" rel="noopener noreferrer" className="mt-6 block rounded-full bg-forest px-5 py-3 text-center text-sm font-semibold text-ivory hover:bg-sage">View at {p.listing.retailer} ↗</a>
    <p className="mt-3 text-center text-[11px] leading-relaxed text-muted">Check the pack photo, current price and stock with the retailer. No affiliate link or retailer partnership.</p>
  </article>;
}
