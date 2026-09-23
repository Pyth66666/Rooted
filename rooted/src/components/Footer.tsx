import Link from "next/link";

export default function Footer() {
  return <footer className="bg-charcoal py-14 pb-24 text-ivory md:pb-14"><div className="mx-auto grid max-w-6xl gap-9 px-6 md:grid-cols-2"><div><p className="font-serif text-3xl tracking-[.15em]">ROOTED</p><p className="mt-3 max-w-sm text-sm leading-relaxed text-ivory/70">Understand your hair products and explore a clearer way to choose shampoo.</p></div><nav aria-label="Footer" className="flex flex-wrap items-start gap-5 text-sm text-ivory/80 md:justify-end"><Link href="/#scan" className="hover:text-white">Scan a product</Link><Link href="/shampoo-advisor" className="hover:text-white">Shampoo advisor</Link><Link href="/my-profile" className="hover:text-white">My profile</Link><Link href="/privacy" className="hover:text-white">Privacy</Link></nav></div><p className="mx-auto mt-10 max-w-6xl border-t border-white/15 px-6 pt-6 text-xs text-ivory/60">© 2026 ROOTED. No retailer partnership is implied.</p></footer>;
}
