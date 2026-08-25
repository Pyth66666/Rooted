"use client";

import { useCallback, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import type { ProductResult } from "@/lib/mock-data";

interface Props {
  onResult: (product: ProductResult, previewUrl: string) => void;
}

export default function ProductScanner({ onResult }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) return;
      track("upload_started");

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setError("");
      setIsAnalyzing(true);
      track("upload_completed");

      const steps = [
        "Reading the label...",
        "Identifying the product...",
        "Looking at the ingredients...",
        "Almost done...",
      ];
      let idx = 0;
      const timer = setInterval(() => {
        idx++;
        setAnalysisStep(steps[idx % steps.length]);
      }, 1200);

      try {
        const body = new FormData();
        body.append("image", file);
        const res = await fetch("/api/analyze", { method: "POST", body });
        const product = await res.json();
        if (!res.ok) {
          throw new Error(product?.error || "Something went wrong.");
        }
        clearInterval(timer);
        track("analysis_viewed");
        onResult(product as ProductResult, url);
      } catch (err) {
        clearInterval(timer);
        setError(
          err instanceof Error
            ? err.message
            : "Could not analyze that photo. Try another one."
        );
        setIsAnalyzing(false);
        setPreviewUrl(null);
      }
    },
    [onResult]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDragging(false), []);

  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center py-20">
        <div className="mb-8 h-48 w-36 overflow-hidden rounded-sm border border-sage/10 bg-cream">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Your product"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <h3 className="font-serif text-2xl font-medium text-charcoal sm:text-3xl">
          Looking closely at your product…
        </h3>
        <p className="mt-3 animate-pulse text-sm text-muted">
          {analysisStep || "Reading the label..."}
        </p>
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-1 w-8 rounded-full bg-sage/30"
              style={{
                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section id="scan" className="bg-ivory py-24 lg:py-32">
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] text-earth">
          Get started
        </p>
        <h2 className="font-serif text-3xl font-medium text-charcoal sm:text-4xl lg:text-5xl">
          Let&apos;s start with what you already own.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted">
          Upload a photo of your shampoo, conditioner, serum, oil, or other
          hair product.
        </p>

        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`relative mx-auto mt-12 max-w-xl cursor-pointer rounded-sm border-2 border-dashed p-12 transition-all sm:p-16 ${
            isDragging
              ? "border-sage bg-sage/5"
              : "border-sage/20 bg-cream/50 hover:border-sage/40 hover:bg-cream"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />

          <div className="flex flex-col items-center">
            <svg
              className="mb-5 h-10 w-10 text-sage/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
            <p className="text-sm font-medium text-charcoal">
              Drop your product photo here
            </p>
            <p className="mt-1 text-sm text-muted">
              or <span className="underline decoration-sage/30 underline-offset-2">choose a photo</span>
            </p>
            <p className="mt-4 text-xs text-muted/60">
              JPG, PNG up to 10MB
            </p>
          </div>
        </div>

        {error && (
          <p className="mx-auto mt-4 max-w-md rounded-sm bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          onClick={() => {
            track("scan_clicked");
            if (typeof navigator !== "undefined" && navigator.mediaDevices) {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.capture = "environment";
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }
          }}
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted underline underline-offset-4 decoration-muted/30 transition-colors hover:text-charcoal"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
          </svg>
          Take a photo with your camera
        </button>
      </div>
    </section>
  );
}
