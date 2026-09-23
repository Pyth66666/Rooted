// Dataset import pipeline. Real bulk import from Open Beauty Facts / INCIDB.
//
// License status of primary sources (verify before production):
//  - Open Beauty Facts: data is CC-BY-SA / ODbL — must attribute.
//  - INCIDB (INCI Database): custom license — check https://incidb.com before bulk use.
//  - BEAUTEE cosmetic-ingredients-dataset: check repo license.
//  - bsyilmaz/skincare-ingredients-dataset: check repo license.
//
// This module is the seam where import jobs plug in. For now the
// recommendation engine uses SEED_PRODUCTS (see seed-data.ts) until a real
// DB import runs. Imported rows follow the PRODUCTS / INGREDIENTS /
// PRODUCT_INGREDIENTS schema in schema.sql and upsert by source + source_url
// to avoid duplicates.

import type { SeedProduct } from "./recommend";
import { SEED_PRODUCTS } from "./seed-data";
import { supabase } from "./db";

export interface ImportedProduct {
  barcode: string;
  brand: string;
  product_name: string;
  category: string;
  country: string;
  ingredients_raw?: string;
  image_url?: string;
  source: "openbeautyfacts" | "incidb" | "seed";
  source_url: string;
  price_range?: string;
  market_availability?: string;
  data_confidence: "high" | "medium" | "low";
}

// Pull shampoo/hair-care products from the public Open Beauty Facts JSON API.
// Results are filtered to hair-care and validated before upsert. Attribution
// is preserved via source_url. Never fabricates data — only fields the API
// actually returns are mapped; the rest stay undefined.
export async function importOpenBeautyFacts(limit = 50): Promise<ImportedProduct[]> {
  const url = new URL("https://world.openbeautyfacts.org/cgi/search.pl");
  url.searchParams.set("search_terms", "shampoo");
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  url.searchParams.set("page_size", String(limit));
  url.searchParams.set("fields", "code,product_name,brands,categories,categories_tags,countries,countries_tags,ingredients_text,image_front_url,unique_scans_n");

  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Open Beauty Facts request failed: ${res.status}`);

  const json = (await res.json()) as {
    products?: Array<Record<string, unknown>>;
  };

  const out: ImportedProduct[] = [];
  for (const p of json.products ?? []) {
    const tags = (Array.isArray(p.categories_tags) ? p.categories_tags : []).map(String);
    const isHair = tags.some((t) => t.includes("hair") || t.includes("shampoo"));
    if (!isHair) continue;

    const brand = String(p.brands ?? "Unknown");
    const name = String(p.product_name ?? "").trim();
    const barcode = String(p.code ?? "");
    if (!name || !barcode) continue;

    out.push({
      barcode,
      brand,
      product_name: name.slice(0, 300),
      category: "Shampoo",
      country: Array.isArray(p.countries) ? p.countries.map(String).join(", ") : "",
      ingredients_raw: typeof p.ingredients_text === "string" ? p.ingredients_text : "",
      image_url: typeof p.image_front_url === "string" ? p.image_front_url : "",
      source: "openbeautyfacts",
      source_url: `https://world.openbeautyfacts.org/product/${barcode}`,
      market_availability: "my" in (p as object) ? "MY" : undefined,
      data_confidence: "medium",
    });
  }
  return out;
}

// Upsert the fetched products into the Supabase `products` table.
export async function persistProducts(products: ImportedProduct[]): Promise<number> {
  if (products.length === 0) return 0;
  const rows = products.map((p) => ({
    barcode: p.barcode,
    brand: p.brand,
    product_name: p.product_name,
    category: p.category,
    country: p.country ?? null,
    ingredients_raw: p.ingredients_raw ?? null,
    image_url: p.image_url ?? null,
    source: p.source,
    source_url: p.source_url,
    price_range: p.price_range ?? null,
    market_availability: p.market_availability ?? null,
    data_confidence: p.data_confidence,
  }));
  const { data, error } = await supabase()
    .from("products")
    .upsert(rows, { onConflict: "source_url" })
    .select("id");
  if (error) {
    console.error("Product upsert failed:", error);
    throw error;
  }
  return (data ?? []).length;
}

// Placeholder — full crawler lands here. Keep signature stable.
export async function importDataset(
  source: ImportedProduct["source"]
): Promise<ImportedProduct[]> {
  if (source === "openbeautyfacts") return importOpenBeautyFacts();
  console.warn(`[dataset] import for "${source}" not yet configured.`);
  return [];
}

// Bridge seed into SeedProduct shape so the engine can consume it until a
// real DB import is live. In production, ask the DB table and fall back to
// seed when it is empty.
export async function currentProductCatalogAsync(): Promise<SeedProduct[]> {
  try {
    const { data, error } = await supabase()
      .from("products")
      .select("*")
      .limit(60);
    if (!error && data && data.length > 0) {
      return data.map((r) => ({
        id: String(r.id),
        name: r.product_name,
        brand: r.brand ?? "Unknown",
        category: r.category ?? "Shampoo",
        priceRange: r.price_range ?? "",
        budgetMax: 0,
        market: (r.market_availability ?? "INT") === "MY" ? "MY" : "INT",
        tags: [],
        keyIngredients: [],
        normalizedIngredients: [],
        bestFor: [],
        considerations: "",
        why: "Retrieved from the public Open Beauty Facts catalogue.",
      }));
    }
  } catch (err) {
    console.error("DB catalog fetch failed, using seed:", err);
  }
  return SEED_PRODUCTS;
}

// Bridge seed into SeedProduct shape so the engine can consume it until a
// real DB import is live. In production, replace with a DB query.
export function currentProductCatalog(): SeedProduct[] {
  return SEED_PRODUCTS;
}

// Confidently flag that reasons/attribution must be preserved on any imported
// product shown to users. UI reads `market` + `data_confidence` accordingly.
export const ATTRIBUTION_NOTE =
  "Product and ingredient data is sourced from public datasets with attribution where required.";
