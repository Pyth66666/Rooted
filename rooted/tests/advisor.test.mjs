import assert from "node:assert/strict";
import test from "node:test";
import { parseAdvisorAnswers, matchDemo } from "../src/lib/advisor.ts";

const base = { texture: "wavy", thickness: "fine", scalp: "oily", concerns: ["oil"], treatments: ["none"], routine: "several", lifestyle: ["none"], fragrance: "either", sensitivity: "none", budget: "any" };

test("rejects contradictory none selection and unknown values", () => {
  assert.equal(parseAdvisorAnswers({ ...base, treatments: ["none", "colour"] }), null);
  assert.equal(parseAdvisorAnswers({ ...base, scalp: "admin" }), null);
});

test("known fragrance sensitivity excludes fragrant and incomplete formulas", () => {
  const result = matchDemo({ ...base, sensitivity: "fragrance" });
  assert.ok(result.length > 0);
  assert.ok(result.every((p) => !p.fragrance && p.ingredientsComplete));
});

test("limited catalogue returns an empty result without padding", () => {
  assert.deepEqual(matchDemo({ ...base, sensitivity: "fragrance", budget: "under_25" }), []);
});

test("budget and profile priorities affect ranking", () => {
  const result = matchDemo({ ...base, budget: "under_25" });
  assert.ok(result.every((p) => p.price <= 25));
  assert.equal(result[0]?.id, "demo-light");
});
