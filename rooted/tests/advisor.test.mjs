import assert from "node:assert/strict";
import test from "node:test";
import { parseAdvisorAnswers, recommendShampoos, SHAMPOOS, EMPTY_ANSWERS, routineNotes } from "../src/lib/advisor.ts";

const base = { texture: "wavy", thickness: "fine", scalp: "oily", concerns: ["oil"], treatments: ["none"], routine: "several", lifestyle: ["none"], fragrance: "either", sensitivity: "none", budget: "any" };
test("rejects empty, duplicate, contradictory and unknown answers", () => {
  for (const value of [{...base, concerns: []}, {...base, concerns: ["oil","oil"]}, {...base, treatments: ["unsure","colour"]}, {...base, scalp: "admin"}, {...base, lifestyle: ["none","outdoors"]}]) assert.equal(parseAdvisorAnswers(value), null);
});
test("validated answers drop unexpected identity and privilege fields", () => {
  assert.deepEqual(parseAdvisorAnswers({...base, user_id: "someone-else", admin: true}), base);
});
test("draft parsing permits unanswered fields but not corrupt shape", () => {
  assert.deepEqual(parseAdvisorAnswers(EMPTY_ANSWERS, true), EMPTY_ANSWERS);
  assert.equal(parseAdvisorAnswers({...EMPTY_ANSWERS, concerns: "oil"}, true), null);
  assert.equal(parseAdvisorAnswers(EMPTY_ANSWERS), null);
});
test("known fragrance sensitivity excludes parfum and fragrant essential oils", () => {
  const result = recommendShampoos({...base, concerns: ["comfort"], sensitivity: "fragrance"});
  assert.deepEqual(result.map(p => p.id), ["qv-gentle"]);
  assert.ok(result.every(p => !p.formulation.fragrance && p.formulation.ingredientsComplete));
  assert.equal(SHAMPOOS.find(p => p.id === "sukin-natural-balance").formulation.fragrance, true);
});
test("no match is not padded with products violating sensitivity or budget", () => {
  assert.deepEqual(recommendShampoos({...base, sensitivity: "fragrance", budget: "under_40"}), []);
});
test("budget uses regular listed price, not the temporary discount", () => {
  const result = recommendShampoos({...base, concerns: ["moisture"], budget: "under_25"});
  assert.ok(result.length > 0);
  assert.ok(result.every(p => p.listing.regularPrice < 25));
  assert.ok(!result.some(p => p.id.startsWith("ever")));
});
test("oil priority and fine strands favour a sourced matching claim", () => {
  assert.equal(recommendShampoos(base)[0].id, "everstrong-thickening");
});
test("colour history affects ranking even without a stated concern", () => {
  const answer = {...base, thickness: "medium", scalp: "balanced", concerns: ["none"], treatments: ["colour"]};
  assert.equal(recommendShampoos(answer)[0].id, "everpure-frizz-defy");
});
test("dandruff products require a flake answer, not irritation alone", () => {
  assert.ok(!recommendShampoos({...base, scalp: "sensitive"}).some(p => p.tags.includes("flakes")));
  assert.ok(recommendShampoos({...base, concerns: ["flakes"], scalp: "balanced", thickness: "medium"})[0].tags.includes("flakes"));
});
test("routine context does not silently change ranking", () => {
  const next = {...base, texture: "coily", lifestyle: ["headwear"]};
  assert.deepEqual(recommendShampoos(next).map(p=>p.id), recommendShampoos(base).map(p=>p.id));
  assert.ok(routineNotes(next).some(note=>note.includes("coverings")));
});
test("catalogue has ten unique Malaysian products and complete traceable snapshots", () => {
  assert.equal(SHAMPOOS.length, 10);
  assert.equal(new Set(SHAMPOOS.map(p=>p.id)).size, 10);
  for (const p of SHAMPOOS) {
    assert.equal(p.market, "MY");
    assert.ok(p.formulation.ingredients.length > 100);
    assert.ok(p.formulation.sourceUrl.startsWith("https://"));
    assert.ok(p.listing.url.startsWith("https://"));
    assert.ok(p.listing.regularPrice >= p.listing.price);
    assert.equal(p.listing.stock, "unknown");
    assert.equal(p.listing.observedAt, "2026-09-23");
  }
});


test("do not pad an oil-control result with irrelevant dry-hair products", () => {
  assert.deepEqual(recommendShampoos({...base, budget: "under_40"}).map(p=>p.id), ["everstrong-thickening"]);
});
