// Ingredient normalization: maps common naming variants to a canonical key
// while preserving the original raw text. Never invents ingredients.

const VARIANT_MAP: Record<string, string> = {
  "sodium lauryl ether sulfate": "sodium laureth sulfate",
  "sodium laureth sulfate": "sodium laureth sulfate",
  "sles": "sodium laureth sulfate",
  "sodium lauryl sulfate": "sodium lauryl sulfate",
  "sls": "sodium lauryl sulfate",
  "cocamidopropyl betaine": "cocamidopropyl betaine",
  "cocamidopropyl betain": "cocamidopropyl betaine",
  "dimethicone": "dimethicone",
  "dimeticone": "dimethicone",
  "panthenol": "panthenol",
  "pantothenyl alcohol": "panthenol",
  "glycerin": "glycerin",
  "glycerine": "glycerin",
  "glycerol": "glycerin",
  "parfum": "fragrance",
  "fragrance": "fragrance",
  "citric acid": "citric acid",
};

export function normalizeIngredientName(raw: string): string {
  const key = raw.trim().toLowerCase().replace(/\s+/g, " ");
  return VARIANT_MAP[key] ?? key;
}

export function parseIngredientList(raw: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !/^ingredients?[:\s]?$/i.test(s));
}

export function normalizeIngredients(raw: string): {
  rawList: string[];
  normalized: string[];
  lookup: Record<string, string>;
} {
  const rawList = parseIngredientList(raw);
  const normalized = rawList.map(normalizeIngredientName);
  const lookup: Record<string, string> = {};
  rawList.forEach((r, i) => {
    lookup[normalized[i]] = r;
  });
  return { rawList, normalized, lookup };
}
