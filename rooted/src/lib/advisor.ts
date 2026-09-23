export const ADVISOR_VERSION = "demo-1";

export type AdvisorAnswers = {
  texture: string;
  thickness: string;
  scalp: string;
  concerns: string[];
  treatments: string[];
  routine: string;
  lifestyle: string[];
  fragrance: string;
  sensitivity: string;
  budget: string;
};

// Synthetic fixtures exercise the consultation. No real product, retailer,
// formulation or price is implied by these records.
export const DEMO_CATALOG = [
  { id: "demo-balance", name: "Balance Wash", brand: "ROOTED demo", size: "300 ml", price: 28, tags: ["oil", "comfort"], fragrance: true, ingredientsComplete: true, ingredients: ["water", "glycerin", "fragrance"], note: "Demonstration formula; no retailer listing or stock data." },
  { id: "demo-soft", name: "Soft Wash", brand: "ROOTED demo", size: "300 ml", price: 34, tags: ["moisture", "frizz", "damage"], fragrance: false, ingredientsComplete: true, ingredients: ["water", "glycerin"], note: "Demonstration formula; no retailer listing or stock data." },
  { id: "demo-light", name: "Light Wash", brand: "ROOTED demo", size: "250 ml", price: 22, tags: ["volume", "oil"], fragrance: false, ingredientsComplete: false, ingredients: [], note: "Ingredient information incomplete; cannot assess ingredient sensitivities." },
] as const;

const VALID: Record<keyof AdvisorAnswers, string[]> = {
  texture: ["straight", "wavy", "curly", "coily", "unsure"],
  thickness: ["fine", "medium", "thick", "unsure"],
  scalp: ["oily", "dry", "balanced", "sensitive", "unsure"],
  concerns: ["oil", "moisture", "frizz", "damage", "volume", "comfort", "none"],
  treatments: ["colour", "bleach", "chemical", "none", "unsure"],
  routine: ["daily", "several", "weekly", "unsure"],
  lifestyle: ["sweat", "outdoors", "headwear", "none"],
  fragrance: ["prefer_free", "either", "prefer_scented"],
  sensitivity: ["fragrance", "none", "unsure"],
  budget: ["under_25", "under_40", "any"],
};

export function parseAdvisorAnswers(value: unknown): AdvisorAnswers | null {
  if (!value || typeof value !== "object") return null;
  const answer = value as Record<string, unknown>;
  for (const key of Object.keys(VALID) as (keyof AdvisorAnswers)[]) {
    const v = answer[key];
    if (["concerns", "treatments", "lifestyle"].includes(key)) {
      if (!Array.isArray(v) || v.length > VALID[key].length || !v.every((x) => typeof x === "string" && VALID[key].includes(x))) return null;
      if (v.includes("none") && v.length > 1) return null;
    } else if (typeof v !== "string" || !VALID[key].includes(v)) return null;
  }
  return answer as AdvisorAnswers;
}

export function matchDemo(answers: AdvisorAnswers) {
  const ceiling = answers.budget === "under_25" ? 25 : answers.budget === "under_40" ? 40 : Infinity;
  return DEMO_CATALOG.filter((p) => {
    if (p.price > ceiling) return false;
    if (answers.sensitivity === "fragrance" && (!p.ingredientsComplete || p.fragrance)) return false;
    return true;
  }).map((p) => {
    const hits = p.tags.filter((tag) => answers.concerns.includes(tag) || (answers.scalp === "oily" && tag === "oil") || (answers.scalp === "dry" && tag === "moisture") || (answers.thickness === "fine" && tag === "volume"));
    return { ...p, reasons: hits.map((tag) => {
      const source = answers.concerns.includes(tag) ? `Your ${tag} concern` : tag === "oil" && answers.scalp === "oily" ? "Your oily scalp" : tag === "moisture" && answers.scalp === "dry" ? "Your dry scalp" : "Your fine strands";
      return `${source} aligns with this demonstration product’s ${tag} tag.`;
    }), rank: hits.length, considerations: [p.note, ...(answers.fragrance === "prefer_free" && p.fragrance ? ["This example has fragrance, which differs from your preference."] : [])] };
  }).sort((a, b) => b.rank - a.rank || a.price - b.price).slice(0, 3);
}
