export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-ivory pt-20">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-5rem)] items-center gap-12 lg:grid-cols-2 lg:gap-8">
          <div className="flex flex-col justify-center py-16 lg:py-0">
            <p className="animate-fade-up mb-6 text-xs font-medium uppercase tracking-[0.25em] text-earth">
              Hair Care Reimagined
            </p>
            <h1 className="animate-fade-up animate-delay-100 font-serif text-5xl font-semibold leading-[1.1] tracking-tight text-charcoal sm:text-6xl lg:text-7xl">
              Do you actually know{" "}
              <span className="text-sage italic">what&apos;s inside</span>{" "}
              your hair products?
            </h1>
            <p className="animate-fade-up animate-delay-200 mt-8 max-w-lg text-lg leading-relaxed text-muted">
              Take a photo of a hair product you already use. ROOTED helps you
              understand what&apos;s inside — from ingredients to what they are
              typically used for.
            </p>
            <div className="animate-fade-up animate-delay-300 mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <a
                href="#scan"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-sage px-8 py-4 text-sm font-medium tracking-wide text-ivory transition-all hover:bg-forest"
              >
                Scan Your Product
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <span className="text-center text-xs text-muted/70 sm:text-left">
                No account required
              </span>
            </div>
          </div>

          <div className="animate-fade-up animate-delay-300 relative flex items-center justify-center lg:h-full">
            <div className="relative w-full max-w-lg">
              <div className="aspect-[4/5] overflow-hidden rounded-sm bg-cream">
                <div className="flex h-full w-full flex-col items-center justify-center p-8">
                  <div className="mb-6 flex h-48 w-32 flex-col items-center justify-center rounded-sm border border-sage/15 bg-ivory shadow-sm sm:h-64 sm:w-40">
                    <svg className="mb-3 h-10 w-10 text-sage/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5m-4.25-8.646c.251.023.501.05.75.082M5 14.5l-.94 2.06a2.25 2.25 0 002.03 3.19h9.82a2.25 2.25 0 002.03-3.19L19 14.5" />
                    </svg>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted/50">Product</span>
                  </div>
                  <div className="space-y-2 text-center">
                    <div className="mx-auto h-1.5 w-24 rounded-full bg-sage/10" />
                    <div className="mx-auto h-1.5 w-20 rounded-full bg-sage/8" />
                    <div className="mx-auto h-1.5 w-16 rounded-full bg-sage/5" />
                  </div>
                  <div className="mt-6 flex gap-2">
                    {["🌿", "🍃", "🪵"].map((e, i) => (
                      <span key={i} className="text-lg opacity-30">{e}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-full bg-sage/5 lg:-bottom-6 lg:-right-6 lg:h-32 lg:w-32" />
              <div className="absolute -top-4 -left-4 h-16 w-16 rounded-full bg-earth/5 lg:-top-6 lg:-left-6 lg:h-20 lg:w-20" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cream/60 to-transparent" />
    </section>
  );
}
