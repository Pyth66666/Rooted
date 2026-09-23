export interface Ingredient {
  name: string;
  category: "HYDRATING" | "CONDITIONING" | "CLEANSING" | "BOTANICAL" | "FRAGRANCE" | "PRESERVATIVE";
  description: string;
  detail: string;
}

export interface ProductResult {
  name: string;
  brand: string;
  category: string;
  summary: string;
  bestFor: string[];
  consider: string[];
  ingredients: Ingredient[];
  ingredientsRaw?: string;
  lowConfidence?: boolean;
}

export const MOCK_PRODUCT: ProductResult = {
  name: "Hydrating Shampoo",
  brand: "Botanical Care Co.",
  category: "Shampoo",
  summary:
    "This formula appears to focus primarily on cleansing and hydration. It contains several commonly used conditioning and moisturizing ingredients that may help maintain softness and manageability.",
  bestFor: ["Potentially dry hair", "Normal hair", "Color-treated hair"],
  consider: ["Fragrance", "Contains sulfates"],
  ingredients: [
    {
      name: "Glycerin",
      category: "HYDRATING",
      description: "Hydrating ingredient",
      detail: "Helps attract and retain moisture in the hair.",
    },
    {
      name: "Panthenol",
      category: "CONDITIONING",
      description: "Conditioning ingredient",
      detail: "Commonly used to improve hair feel and manageability.",
    },
    {
      name: "Argan Oil",
      category: "BOTANICAL",
      description: "Plant-derived oil",
      detail: "Often used to provide softness and conditioning.",
    },
    {
      name: "Sodium Laureth Sulfate",
      category: "CLEANSING",
      description: "Cleansing agent",
      detail: "A widely used surfactant that helps create lather and remove buildup.",
    },
    {
      name: "Shea Butter",
      category: "HYDRATING",
      description: "Natural emollient",
      detail: "Generally associated with moisture and smoothing.",
    },
    {
      name: "Keratin",
      category: "CONDITIONING",
      description: "Structural protein",
      detail: "May help temporarily improve hair strength and appearance.",
    },
    {
      name: "Linalool",
      category: "FRAGRANCE",
      description: "Fragrance compound",
      detail: "Commonly used to provide a pleasant scent.",
    },
    {
      name: "Citric Acid",
      category: "PRESERVATIVE",
      description: "pH adjuster",
      detail: "Typically used to balance the pH level of the formula.",
    },
  ],
};
