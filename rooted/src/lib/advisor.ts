import catalogue from "../data/shampoos.my.json" with { type: "json" };

export const CATALOGUE_VERSION = catalogue.version;
export const ADVISOR_VERSION = `rules-2/${CATALOGUE_VERSION}`;
export const SHAMPOOS = catalogue.products;
export type AdvisorAnswers = {
  texture: string; thickness: string; scalp: string; concerns: string[];
  treatments: string[]; routine: string; lifestyle: string[];
  fragrance: string; sensitivity: string; budget: string;
};
export const EMPTY_ANSWERS: AdvisorAnswers = {
  texture: "", thickness: "", scalp: "", concerns: [], treatments: [],
  routine: "", lifestyle: [], fragrance: "", sensitivity: "", budget: "",
};
const VALID: Record<keyof AdvisorAnswers, string[]> = {
  texture: ["straight", "wavy", "curly", "coily", "unsure"],
  thickness: ["fine", "medium", "thick", "unsure"],
  scalp: ["oily", "dry", "balanced", "sensitive", "unsure"],
  concerns: ["oil", "moisture", "frizz", "damage", "volume", "comfort", "flakes", "none"],
  treatments: ["colour", "bleach", "chemical", "none", "unsure"],
  routine: ["daily", "several", "weekly", "unsure"],
  lifestyle: ["sweat", "outdoors", "headwear", "none"],
  fragrance: ["prefer_free", "either", "prefer_scented"],
  sensitivity: ["fragrance", "none", "unsure"],
  budget: ["under_25", "under_40", "any"],
};

export function parseAdvisorAnswers(value: unknown, partial = false): AdvisorAnswers | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const clean: Record<string, unknown> = {};
  for (const key of Object.keys(VALID) as (keyof AdvisorAnswers)[]) {
    const v = input[key];
    if (["concerns", "treatments", "lifestyle"].includes(key)) {
      if (!Array.isArray(v) || (!partial && !v.length) || v.length > VALID[key].length || new Set(v).size !== v.length || !v.every((x) => typeof x === "string" && VALID[key].includes(x))) return null;
      if ((v.includes("none") || v.includes("unsure")) && v.length > 1) return null;
      clean[key] = [...v];
    } else {
      if (typeof v !== "string" || !(VALID[key].includes(v) || (partial && v === ""))) return null;
      clean[key] = v;
    }
  }
  return clean as AdvisorAnswers;
}

const concernNames: Record<string, string> = { oil: "oil control", moisture: "moisture", frizz: "frizz care", damage: "damage care", volume: "volume", comfort: "scalp comfort", flakes: "visible flakes" };

// Match published claims, not clinical efficacy. Sensitivity is an exclusion;
// fragrance preference only changes ordering. Use regular prices for budgets.
export function recommendShampoos(answers: AdvisorAnswers) {
  const ceiling = answers.budget === "under_25" ? 25 : answers.budget === "under_40" ? 40 : Infinity;
  return SHAMPOOS.filter((p) => {
    if (p.listing.regularPrice >= ceiling) return false;
    if (answers.sensitivity === "fragrance" && (!p.formulation.ingredientsComplete || p.formulation.fragrance !== false)) return false;
    if (p.tags.includes("flakes") && !answers.concerns.includes("flakes")) return false;
    return true;
  }).map((p) => {
    let rank = 0;
    const reasons: string[] = [];
    function add(tag: string, points: number, reason: string) {
      if (p.tags.includes(tag)) { rank += points; reasons.push(reason); }
    }
    for (const concern of answers.concerns) add(concern, 4, `Your ${concernNames[concern]} priority overlaps with this product’s published claim.`);
    if (answers.scalp === "oily") add("oil", 2, "The listing describes cleansing excess oils, relevant to your oily scalp answer.");
    if (["dry", "sensitive"].includes(answers.scalp)) add("comfort", 2, "The manufacturer describes use for dry or sensitive scalps.");
    if (answers.thickness === "fine") add("volume", 2, "The volume claim may suit your preference for body in fine strands.");
    if (answers.treatments.includes("colour")) add("colour", 3, "The listing specifically describes colour-treated hair.");
    if (answers.treatments.some((x) => ["bleach", "chemical"].includes(x))) add("damage", 2, "Your treatment history makes the published damage-care claim relevant to review.");
    if (answers.routine === "daily") add("daily", 1, "The source describes suitability for daily washing.");
    if (answers.fragrance === "prefer_free" && !p.formulation.fragrance) { rank += 2; reasons.push("The manufacturer’s fragrance-free claim matches your preference."); }
    if (answers.fragrance === "prefer_scented" && p.formulation.fragrance) rank += 1;
    if (answers.sensitivity === "fragrance") reasons.push("No added fragrance is declared in this source snapshot. Recheck the bottle and your own triggers.");
    return { ...p, price: p.listing.price, reasons, rank, considerations: [p.formulation.note,
      ...(p.formulation.fragrance ? ["Contains fragrance or fragrant oils."] : ["Fragrance-free does not rule out other sensitivities."]),
      ...(answers.fragrance === "prefer_free" && p.formulation.fragrance ? ["This differs from your fragrance preference."] : []),
      "Prices are a dated online snapshot; branch stock is unconfirmed."] };
  }).filter((p) => p.rank > 0 || answers.concerns.includes("none")).sort((a, b) => b.rank - a.rank || a.listing.regularPrice - b.listing.regularPrice || a.id.localeCompare(b.id)).slice(0, 3);
}
export type ShampooPick = ReturnType<typeof recommendShampoos>[number];

export function routineNotes(answers: AdvisorAnswers): string[] {
  const notes = ["Hair shape and daily activities guide these routine notes. Ranking uses priorities, strand thickness, scalp, treatments, washing frequency and preferences."];
  if (["curly", "coily"].includes(answers.texture)) notes.push("For your curl pattern, assess slip and manageability alongside shampoo; this catalogue does not verify curl-specific performance.");
  if (answers.lifestyle.includes("sweat")) notes.push("You selected frequent sweating. Adjust washing to scalp comfort and how much sweat or buildup you notice.");
  if (answers.lifestyle.includes("headwear")) notes.push("You selected head coverings. Let hair dry before covering and keep the fabric or helmet lining clean.");
  if (answers.lifestyle.includes("outdoors")) notes.push("Outdoor time is routine context; it is not evidence that you need a stronger shampoo.");
  if (answers.sensitivity === "unsure") notes.push("Sensitivity is uncertain. This result has not screened for your individual ingredient triggers.");
  return notes;
}
