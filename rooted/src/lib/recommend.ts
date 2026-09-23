import type { UserHairProfile, ShampooRecommendation } from "./types";

// Configurable weights. Adjust in backend without touching logic.
export const WEIGHTS = {
  hairScalp: 0.3,
  concerns: 0.2,
  ingredientCompatibility: 0.2,
  preferences: 0.1,
  budget: 0.1,
  climateLifestyle: 0.1,
};

export interface SeedProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  priceRange: string;
  budgetMax: number;
  market: "MY" | "INT";
  tags: string[];
  keyIngredients: string[];
  normalizedIngredients: string[];
  bestFor: string[];
  considerations: string;
  why?: string;
}

export interface RecommendationInput {
  profile: UserHairProfile;
  products: SeedProduct[];
  detectedIngredients?: string[];
}

const CONCERN_TAGS: Record<string, string[]> = {
  oily_fast: ["oil_control", "clarifying", "light_moisture"],
  dryness: ["moisture", "hydrating", "gentle"],
  frizz: ["frizz_control", "smoothing", "anti_humidity"],
  dandruff: ["scalp_care", "soothing"],
  weak: ["damage", "protein", "strengthening"],
  rough: ["smoothing", "conditioning"],
  dull: ["shine", "moisture"],
  tangle: ["smoothing", "conditioning"],
  scalp_uncomfortable: ["scalp_care", "gentle", "soothing"],
  flat: ["volume", "lightweight"],
  shedding: ["scalp_care", "gentle"],
};

function tagScore(product: SeedProduct, tag: string): number {
  return product.tags.includes(tag) ? 1 : 0;
}

function climateScore(product: SeedProduct, profile: UserHairProfile): number {
  let s = 0;
  const humid = profile.heatExposure !== "mostly_indoor";
  const sweaty = profile.sweatFrequency === "almost_daily" || profile.sweatFrequency === "several_week";
  if (humid || sweaty) {
    s += tagScore(product, "oil_control") * 0.5;
    s += tagScore(product, "anti_humidity") * 0.5;
  }
  if (profile.headCovering.includes("daily") || profile.headCovering.includes("several_week")) {
    s += tagScore(product, "scalp_care") * 0.5;
  }
  return Math.min(s, 1);
}

function budgetScore(product: SeedProduct, profile: UserHairProfile): number {
  const max = profile.budget;
  if (max === "under_15") return product.budgetMax <= 15 ? 1 : product.budgetMax <= 30 ? 0.5 : 0.1;
  if (max === "15_30") return product.budgetMax <= 30 ? 1 : product.budgetMax <= 50 ? 0.6 : 0.2;
  if (max === "31_50") return product.budgetMax <= 50 ? 1 : product.budgetMax <= 80 ? 0.7 : 0.3;
  if (max === "51_80") return product.budgetMax <= 80 ? 1 : 0.6;
  if (max === "80_plus") return 1;
  return 0.8;
}

function preferenceScore(product: SeedProduct, profile: UserHairProfile): number {
  const p = profile.productPriorities;
  let s = 0;
  if (p.includes("sulfate_free") && product.normalizedIngredients.length > 0 && !product.normalizedIngredients.some((i) => i.includes("sulfate"))) s += 1;
  if (p.includes("silicone_free") && !product.keyIngredients.includes("dimethicone")) s += 1;
  if (p.includes("fragrance_free") && product.normalizedIngredients.length > 0 && !product.normalizedIngredients.includes("fragrance")) s += 1;
  if (p.includes("natural") && product.tags.includes("natural")) s += 1;
  if (p.includes("volume") && tagScore(product, "volume")) s += 1;
  if (p.includes("moisture") && tagScore(product, "moisture")) s += 1;
  if (p.includes("oil_control") && tagScore(product, "oil_control")) s += 1;
  if (p.includes("scalp_care") && tagScore(product, "scalp_care")) s += 1;
  if (p.includes("frizz_control") && tagScore(product, "frizz_control")) s += 1;
  if (p.includes("gentle") && tagScore(product, "gentle")) s += 1;
  return Math.min(s / Math.max(p.length, 1), 1);
}

function hairScalpScore(product: SeedProduct, profile: UserHairProfile): number {
  let s = 0;
  if (profile.scalpType === "oily") s += tagScore(product, "oil_control") * 0.6;
  if (profile.scalpType === "dry") s += tagScore(product, "moisture") * 0.6;
  if (profile.scalpType === "sensitive") s += tagScore(product, "gentle") * 0.6 + tagScore(product, "scalp_care") * 0.4;
  if (profile.hairThickness === "fine") s += tagScore(product, "lightweight") * 0.7;
  if (profile.hairTexture === "curly" || profile.hairTexture === "coily") s += tagScore(product, "moisture") * 0.7 + tagScore(product, "smoothing") * 0.3;
  return Math.min(s, 1);
}

function concernScore(product: SeedProduct, profile: UserHairProfile): number {
  let hits = 0;
  const concerns = profile.concerns.filter((c) => CONCERN_TAGS[c]);
  if (concerns.length === 0) return 0.5;
  for (const concern of concerns) {
    for (const tag of CONCERN_TAGS[concern]) {
      if (tagScore(product, tag)) {
        hits++;
        break;
      }
    }
  }
  return hits / Math.min(concerns.length, 4);
}

export function ingredientCompatibilityScore(
  product: SeedProduct,
  detectedIngredients?: string[]
): number {
  // How well the current product's ingredients suit the user. Higher = matched
  // product ingredients align with preference (e.g. sulfate-free want).
  if (!detectedIngredients || detectedIngredients.length === 0) return 0.5;
  let s = 0;
  const hasSulfate = detectedIngredients.some((i) => i.includes("sulfate"));
  if (product.normalizedIngredients.some((i) => i.includes("sulfate")) ? false : !hasSulfate) {
    s += 0.5;
  }
  if (product.keyIngredients.includes("dimethicone")) s += 0.3;
  if (hasSulfate && product.tags.includes("gentle")) s -= 0.2;
  return Math.max(0, Math.min(s + 0.4, 1));
}

export function recommend(
  input: RecommendationInput
): ShampooRecommendation[] {
  const { profile, products } = input;
  const scored = products.map((p) => {
    const w = WEIGHTS;
    const raw =
      w.hairScalp * hairScalpScore(p, profile) +
      w.concerns * concernScore(p, profile) +
      w.ingredientCompatibility *
        Math.max(0.5, ingredientCompatibilityScore(p, input.detectedIngredients)) +
      w.preferences * preferenceScore(p, profile) +
      w.budget * budgetScore(p, profile) +
      w.climateLifestyle * climateScore(p, profile);
    const normalized = Math.min(raw, 1);
    return {
      id: p.id,
      name: p.name,
      brand: p.brand,
      why: p.why ?? `Chosen for its ${p.bestFor.slice(0, 2).join(" and ")} focus, which matches your ${profile.scalpType} scalp and stated concerns.`,
      bestFor: p.bestFor,
      priceRange: p.priceRange,
      keyIngredients: p.keyIngredients.slice(0, 3),
      considerations: p.considerations,
      score: Math.round(normalized * 100),
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 5);
}

export function matchProductId(
  currentName: string,
  products: SeedProduct[]
): string {
  if (!currentName.trim()) return "unmatched";
  const hit = products.find(
    (p) =>
      p.name.toLowerCase().includes(currentName.toLowerCase()) ||
      currentName.toLowerCase().includes(p.name.toLowerCase())
  );
  return hit ? hit.id : "unmatched";
}
