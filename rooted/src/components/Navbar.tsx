"use client";
import Link from "next/link";

import { useState, useEffect } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ivory/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(67,90,69,0.08)]"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link href="/" className="font-serif text-2xl font-semibold tracking-[0.15em] text-charcoal lg:text-3xl">
            ROOTED
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#discover" className="text-sm tracking-wide text-muted transition-colors hover:text-charcoal">
              Discover
            </Link>
            <Link href="/#how-it-works" className="text-sm tracking-wide text-muted transition-colors hover:text-charcoal">
              How It Works
            </Link>
            <Link href="/#about" className="text-sm tracking-wide text-muted transition-colors hover:text-charcoal">
              About
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/#scan"
              className="hidden rounded-full border border-sage/30 bg-sage px-5 py-2 text-xs font-medium tracking-wide text-ivory transition-all hover:bg-forest md:inline-block"
            >
              Scan Your Product
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="flex flex-col gap-1.5 md:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <span
                className={`block h-0.5 w-5 bg-charcoal transition-transform ${
                  mobileOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-charcoal transition-opacity ${
                  mobileOpen ? "opacity-0" : ""
                }`}
              />
              <span
                className={`block h-0.5 w-5 bg-charcoal transition-transform ${
                  mobileOpen ? "-translate-y-2 -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="animate-fade-in border-t border-sage/10 bg-ivory/98 backdrop-blur-sm md:hidden">
          <div className="flex flex-col gap-0 px-6 py-4">
            <Link
              href="/#discover"
              onClick={() => setMobileOpen(false)}
              className="border-b border-sage/5 py-3 text-sm tracking-wide text-charcoal"
            >
              Discover
            </Link>
            <Link
              href="/#how-it-works"
              onClick={() => setMobileOpen(false)}
              className="border-b border-sage/5 py-3 text-sm tracking-wide text-charcoal"
            >
              How It Works
            </Link>
            <Link
              href="/#about"
              onClick={() => setMobileOpen(false)}
              className="border-b border-sage/5 py-3 text-sm tracking-wide text-charcoal"
            >
              About
            </Link>
            <Link
              href="/#scan"
              onClick={() => setMobileOpen(false)}
              className="mt-3 rounded-full bg-sage py-3 text-center text-sm font-medium text-ivory"
            >
              Scan Your Product
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
