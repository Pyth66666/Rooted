export type HairTexture = "straight" | "wavy" | "curly" | "coily" | "not_sure";
export type HairThickness = "fine" | "medium" | "thick" | "not_sure";
export type ScalpType = "normal" | "oily" | "dry" | "combination" | "sensitive" | "not_sure";

export interface HairAnswerInput {
  hairTexture: HairTexture;
  hairThickness: HairThickness;
  scalpType: ScalpType;
  concerns: string[];
  washFrequency: "daily" | "four_six" | "two_three" | "once_less";
  washRoutine: "shampoo_only" | "shampoo_conditioner" | "shampoo_mask" | "cowash" | "varies";
  heatExposure: "almost_daily" | "several_week" | "occasionally" | "mostly_indoor";
  sweatFrequency: "almost_daily" | "several_week" | "occasionally" | "rarely";
  headCovering: string[];
  treatments: string[];
  heatStyling: "daily" | "several_week" | "occasionally" | "rarely_never";
  productPriorities: string[];
  budget: string;
  currentProduct: string;
  personalGoal: string;
}

export interface UserHairProfile {
  id: string;
  hairTexture: HairTexture;
  hairThickness: HairThickness;
  scalpType: ScalpType;
  concerns: string[];
  washFrequency: string;
  washRoutine: string;
  heatExposure: string;
  sweatFrequency: string;
  headCovering: string[];
  treatments: string[];
  heatStyling: string;
  productPriorities: string[];
  budget: string;
  currentProduct: string;
  personalGoal: string;
}

export interface ProductResult {
  id?: string;
  name: string;
  brand: string;
  category: string;
  summary: string;
  bestFor: string[];
  consider: string[];
  ingredientsRaw?: string;
  normalizedIngredients?: string[];
  lowConfidence?: boolean;
  ingredients: IngredientAnalysis[];
}

export interface IngredientAnalysis {
  name: string;
  category: string;
  description: string;
  detail: string;
}

export interface ShampooRecommendation {
  id?: string;
  name: string;
  brand: string;
  why: string;
  bestFor: string[];
  priceRange: string;
  keyIngredients: string[];
  considerations: string;
  score: number;
}

export function supabaseProfileToInput(
  row: Record<string, unknown>
): UserHairProfile {
  return {
    id: String(row.id ?? ""),
    hairTexture: (row.hair_texture as UserHairProfile["hairTexture"]) ?? "not_sure",
    hairThickness: (row.hair_thickness as UserHairProfile["hairThickness"]) ?? "not_sure",
    scalpType: (row.scalp_type as UserHairProfile["scalpType"]) ?? "normal",
    concerns: Array.isArray(row.concerns) ? (row.concerns as string[]) : [],
    washFrequency: (row.wash_frequency as string) ?? "",
    washRoutine: (row.wash_routine as string) ?? "",
    heatExposure: (row.lifestyle as string) ?? "occasionally",
    sweatFrequency: "",
    headCovering: Array.isArray(row.head_covering) ? (row.head_covering as string[]) : [],
    treatments: Array.isArray(row.treatment_history) ? (row.treatment_history as string[]) : [],
    heatStyling: (row.heat_styling as string) ?? "",
    productPriorities: Array.isArray(row.ingredient_preferences)
      ? (row.ingredient_preferences as string[])
      : [],
    budget: (row.budget as string) ?? "",
    currentProduct: (row.current_product as string) ?? "",
    personalGoal: (row.personal_goal as string) ?? "",
  };
}
