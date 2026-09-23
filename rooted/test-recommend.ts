import assert from "node:assert/strict";
import { recommend, WEIGHTS, matchProductId } from "./src/lib/recommend.ts";
import { SEED_PRODUCTS } from "./src/lib/seed-data.ts";
import type { UserHairProfile } from "./src/lib/types.ts";

function profile(over: Partial<UserHairProfile>): UserHairProfile {
  return {
    id: "t",
    hairTexture: "wavy",
    hairThickness: "medium",
    scalpType: "oily",
    concerns: ["frizz", "oily_fast"],
    washFrequency: "four_six",
    washRoutine: "shampoo_conditioner",
    heatExposure: "almost_daily",
    sweatFrequency: "almost_daily",
    headCovering: ["daily"],
    treatments: [],
    heatStyling: "rarely_never",
    productPriorities: ["oil_control", "frizz_control"],
    budget: "15_30",
    currentProduct: "Sunsilk Anti-Hair Fall",
    personalGoal: "less frizz",
    ...over,
  };
}

// 1. weights sum to 1.0
assert.ok(Math.abs(Object.values(WEIGHTS).reduce((a, b) => a + b, 0) - 1) < 1e-9);

// 2. return up to 5, sorted desc, scores valid
const recs = recommend({ profile: profile(), products: SEED_PRODUCTS });
assert.ok(recs.length >= 1 && recs.length <= 5, "1..5 recommendations");
for (let i = 1; i < recs.length; i++) {
  assert.ok(recs[i - 1].score >= recs[i].score, "sorted desc");
}
assert.ok(recs.every((r) => r.score <= 100 && r.score >= 0), "score 0..100");

// 3. dry/frizz+natural profile: genuinely moisture/smoothing picks top the list
const dry = recommend({
  profile: profile({
    scalpType: "dry",
    concerns: ["dryness", "frizz"],
    productPriorities: ["moisture", "natural"],
    heatExposure: "occasionally",
    sweatFrequency: "rarely",
    headCovering: ["never"],
  }),
  products: SEED_PRODUCTS,
});
const moistureIds = ["ogx-argon-oil", "clearly-botanicals-hydration", "dove-1min-smooth"];
assert.ok(
  moistureIds.includes(dry[0].id) && moistureIds.includes(dry[1].id),
  "moisture/smoothing picks top dry profile"
);

// 4. volume-only premium not a top-5 pick for dry hair
assert.ok(!dry.some((r) => r.id === "living-proof-full"), "premium volume not top-5 for dry");

// 5. empty catalog -> empty result (no crash)
assert.deepEqual(recommend({ profile: profile(), products: [] }), []);

// 6. budget is a real factor: low budget should not surface the RM90+ product
const low = recommend({ profile: profile({ budget: "under_15" }), products: SEED_PRODUCTS });
assert.ok(!low.some((r) => r.id === "living-proof-full"), "RM90+ product excluded from low budget");

// 7. match resolving
assert.equal(matchProductId("Sunsilk Anti-Hair Fall", SEED_PRODUCTS), "sunsilk-anti-hairfall");
assert.equal(matchProductId("totally unknown", SEED_PRODUCTS), "unmatched");

console.log("ALL RECOMMEND TESTS PASS");
