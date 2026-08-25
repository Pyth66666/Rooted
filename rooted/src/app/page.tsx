"use client";

import { useState, useEffect } from "react";
import { track } from "@/lib/analytics";
import type { ProductResult } from "@/lib/mock-data";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import CuriositySection from "@/components/CuriositySection";
import ProductScanner from "@/components/ProductScanner";
import ProductResultView from "@/components/ProductResult";
import InterestForm from "@/components/InterestForm";
import HowItWorks from "@/components/HowItWorks";
import About from "@/components/About";
import Footer from "@/components/Footer";
import StickyMobileCTA from "@/components/StickyMobileCTA";

export default function Home() {
  const [result, setResult] = useState<ProductResult | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [formDone, setFormDone] = useState(false);

  useEffect(() => {
    track("page_view");
  }, []);

  const handleResult = (product: ProductResult, url: string) => {
    setResult(product);
    setPreviewUrl(url);
    setTimeout(() => {
      document.getElementById("interest")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const reset = () => {
    setResult(null);
    setPreviewUrl("");
    setFormDone(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-ivory">
      <Navbar />

      {!result && (
        <>
          <Hero />
          <CuriositySection />
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

          {!formDone && (
            <div id="interest">
              <InterestForm
                onComplete={() => {
                  setFormDone(true);
                  setTimeout(() => {
                    document.getElementById("result")?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              />
            </div>
          )}

          {formDone && (
            <div id="result">
              <ProductResultView product={result} />
            </div>
          )}
        </div>
      )}

      <HowItWorks />
      <About />
      <Footer />
      <StickyMobileCTA />
    </div>
  );
}
