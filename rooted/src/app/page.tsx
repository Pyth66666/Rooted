"use client";

import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";
import type { ProductResult } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CuriositySection from "@/components/CuriositySection";
import ProductScanner from "@/components/ProductScanner";
import ProductResultView from "@/components/ProductResult";
import PaidCTA from "@/components/PaidCTA";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";
import Link from "next/link";

export default function Home() {
  const [result, setResult] = useState<ProductResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    track("page_view");
  }, []);

  const handleResult = (product: ProductResult, url: string) => {
    setResult(product);
    setPreviewUrl(url);
    track("analysis_viewed");
    setTimeout(() => document.getElementById("result")?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const reset = () => {
    setResult(null);
    setPreviewUrl("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {!result && (
        <>
          <Hero />
          <CuriositySection />
          <section className="bg-[#DFE7D9] py-20" id="advisor"><div className="mx-auto grid max-w-6xl items-center gap-10 px-6 md:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-[.25em] text-earth">The shampoo advisor</p><h2 className="mt-4 font-serif text-5xl leading-none text-forest">Too many shampoos. <em>Not enough clarity.</em></h2><p className="mt-6 max-w-lg text-base leading-relaxed text-charcoal/75">Explore how your hair, scalp, lifestyle and budget can guide a shampoo choice. Free, with no account required.</p><p className="mt-4 text-sm text-earth">10 shampoos listed in Malaysia, with ingredient sources and dated prices.</p><Link href="/shampoo-advisor" className="mt-8 inline-flex rounded-full bg-forest px-8 py-4 text-sm font-semibold text-ivory hover:bg-sage">Find My Shampoo →</Link></div><div className="rounded-[2rem] border border-forest/15 bg-ivory/70 p-8"><p className="font-serif text-6xl text-forest">10<span className="ml-3 font-sans text-sm text-muted">products, with sources</span></p><p className="mt-5 text-sm leading-relaxed text-muted">From everyday care to fragrance-free options. Understand why a shampoo appears, compare its ingredients, then check the retailer’s latest offer.</p><Link href="/catalogue" className="mt-6 inline-block text-sm font-semibold text-forest underline underline-offset-4">Browse the source shelf ↗</Link></div></div></section>
          <ProductScanner onResult={handleResult} />
        </>
      )}

      {result && (
        <div className="pt-20">
          <div className="bg-ivory py-8 text-center">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-colors hover:text-charcoal"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Scan another product
            </button>
          </div>

          {previewUrl && (
            <div className="bg-cream py-8 text-center">
              <div className="mx-auto h-40 w-28 overflow-hidden rounded-sm border border-sage/10">
                <img
                  src={previewUrl}
                  alt="Your scanned product"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}

          <div id="result"><ProductResultView key={result.name} product={result} /></div>
          <div className="bg-cream py-10 text-center"><p className="mx-auto max-w-xl px-6 text-sm text-muted">Ingredient education describes a product label. The advisor uses your own answers to explore shampoo matches.</p><Link href="/shampoo-advisor" className="mt-5 inline-flex rounded-full bg-forest px-7 py-3 text-sm text-ivory">Explore the shampoo advisor →</Link></div>
          <PaidCTA />
        </div>
      )}

      <HowItWorks />
      <About />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
