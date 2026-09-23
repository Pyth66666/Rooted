"use client";

import { useState } from "react";
import type { ProductResult } from "@/lib/types";
import IngredientCard from "./IngredientCard";

interface Props {
  product: ProductResult;
}

export default function ProductResult({ product }: Props) {
  const [ingredients, setIngredients] = useState(product.ingredients);
  const [identity, setIdentity] = useState({ name: product.name, brand: product.brand, category: product.category });
  const [identityDraft, setIdentityDraft] = useState(identity);
  const [editingIdentity, setEditingIdentity] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(product.ingredientsRaw ?? "");

  const dirty =
    draft.trim() !== (product.ingredientsRaw ?? "").trim();
  const identityChanged = identity.name !== product.name || identity.brand !== product.brand || identity.category !== product.category;

  const applyCorrection = () => {
    const names = draft
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    setIngredients((prev) => {
      const kept = prev.filter((p) => names.includes(p.name));
      const added = names
        .filter((n) => !kept.some((k) => k.name === n))
        .map((n) => ({
          name: n,
          category: "UNCLASSIFIED" as const,
          description: "Ingredient as corrected by you; function not verified.",
          detail: "",
        }));
      return [...kept, ...added];
    });
    setEditing(false);
  };

  const saveIdentity = () => {
    const corrected = { name: identityDraft.name.trim().slice(0, 200), brand: identityDraft.brand.trim().slice(0, 100), category: identityDraft.category };
    if (!corrected.name || !corrected.brand) return;
    setIdentity(corrected);
    setEditingIdentity(false);
    try { localStorage.setItem("rooted_last_scanned", corrected.category === "Shampoo" ? corrected.name : ""); } catch { /* storage unavailable */ }
  };

  return (
    <section className="bg-ivory py-16">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <div className="mb-12 border-b border-sage/10 pb-8">
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.25em] text-earth">
            Your product
          </p>
          <h2 className="font-serif text-4xl font-medium text-charcoal sm:text-5xl">
            {identity.name}
          </h2>
          <div className="mt-4 flex flex-wrap gap-6 text-sm text-muted">
            <div>
              <span className="text-xs uppercase tracking-wider text-earth">Brand</span>
              <p className="mt-0.5 font-medium text-charcoal">{identity.brand}</p>
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-earth">Category</span>
              <p className="mt-0.5 font-medium text-charcoal">{identity.category}</p>
            </div>
          </div>
          <button type="button" onClick={() => { setIdentityDraft(identity); setEditingIdentity(true); }} className="mt-4 text-sm text-sage underline underline-offset-4">Correct product identification</button>
          {editingIdentity && <div className="mt-5 grid gap-3 rounded-xl bg-cream p-5"><label className="text-sm text-forest">Product name<input value={identityDraft.name} onChange={(e) => setIdentityDraft((v) => ({ ...v, name: e.target.value }))} className="mt-1 block w-full rounded-lg border border-sage/20 bg-white p-2" /></label><label className="text-sm text-forest">Brand<input value={identityDraft.brand} onChange={(e) => setIdentityDraft((v) => ({ ...v, brand: e.target.value }))} className="mt-1 block w-full rounded-lg border border-sage/20 bg-white p-2" /></label><label className="text-sm text-forest">Product type<select value={identityDraft.category} onChange={(e) => setIdentityDraft((v) => ({ ...v, category: e.target.value }))} className="mt-1 block w-full rounded-lg border border-sage/20 bg-white p-2"><option>Shampoo</option><option>Conditioner</option><option>Serum</option><option>Hair Oil</option><option>Mask</option><option>Other Hair Product</option></select></label><div className="flex gap-3"><button onClick={saveIdentity} className="rounded-full bg-forest px-5 py-2 text-sm text-ivory">Save correction</button><button onClick={() => setEditingIdentity(false)} className="text-sm text-muted underline">Cancel</button></div></div>}
        </div>

        <div className="mb-16">
          <div className="flex items-center justify-between">
            <h3 className="mb-2 font-serif text-2xl font-medium text-charcoal">
              What&apos;s inside?
            </h3>
            {product.lowConfidence && !editing && (
              <button
                onClick={() => {
                  setDraft(ingredients.map((i) => i.name).join(", "));
                  setEditing(true);
                }}
                className="rounded-sm border border-sage/20 px-3 py-1.5 text-xs text-sage transition-colors hover:border-sage/40"
              >
                Review ingredients
              </button>
            )}
          </div>
          <p className="mb-8 text-sm text-muted">
            We identified {ingredients.length} ingredients on the label.
          </p>

          {product.lowConfidence && !editing && (
            <div className="mb-6 rounded-sm bg-amber-50 px-4 py-3 text-sm text-amber-800">
              The label may not have been read perfectly. Tap{" "}
              <strong>Review ingredients</strong> to check or correct the list.
            </div>
          )}

          {editing ? (
            <div className="mb-6 rounded-sm border border-sage/15 bg-cream/50 p-5">
              <p className="mb-2 text-sm font-medium text-charcoal">
                Edit the ingredient list (separate by commas)
              </p>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-sm border border-sage/20 bg-ivory p-3 text-sm text-charcoal outline-none focus:border-sage"
              />
              <div className="mt-3 flex gap-3">
                <button
                  onClick={applyCorrection}
                  disabled={!dirty}
                  className="rounded-full bg-sage px-5 py-2 text-xs font-medium text-ivory transition-colors enabled:hover:bg-forest disabled:opacity-40"
                >
                  Save corrections
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="rounded-full border border-sage/20 px-5 py-2 text-xs text-muted transition-colors hover:border-sage/40 hover:text-charcoal"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-sage/8">
              {ingredients.map((ing, i) => (
                <IngredientCard key={`${ing.name}-${i}`} ingredient={ing} />
              ))}
            </div>
          )}
        </div>

        <div className="rounded-sm bg-cream/70 p-8 lg:p-10">
          <h3 className="font-serif text-2xl font-medium text-charcoal sm:text-3xl">
            So... what does all of this actually mean?
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
            {dirty || identityChanged ? "You corrected the scan. The original automated summary may no longer apply; review the corrected details above." : product.summary}
          </p>

          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-sage">
                Best suited for
              </p>
              <ul className="space-y-1.5">
                {product.bestFor.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="h-1 w-1 rounded-full bg-sage/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-earth">
                Things you may want to consider
              </p>
              <ul className="space-y-1.5">
                {product.consider.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-charcoal">
                    <span className="h-1 w-1 rounded-full bg-earth/50" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted/60 leading-relaxed">
          Ingredient information is provided for educational purposes and does
          not replace professional medical advice.
        </p>
      </div>
    </section>
  );
}
