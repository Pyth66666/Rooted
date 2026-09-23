import { supabase } from "@/lib/db";
import type { HairAnswerInput, UserHairProfile } from "@/lib/types";
import { newReference, sessionCookie } from "@/lib/assessment-session";

const AMOUNT_CENTS = 1000; // RM10.00

export async function POST(request: Request) {
  let body: HairAnswerInput;
  try {
    if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ error: "Request too large." }, { status: 413 });
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const required = ["hairTexture", "hairThickness", "scalpType", "concerns", "washFrequency"];
  for (const key of required) {
    if (body[key as keyof HairAnswerInput] === undefined) {
      return Response.json({ error: "Missing required answer." }, { status: 400 });
    }
  }

  const profile: UserHairProfile = {
    id: `${Date.now()}`,
    hairTexture: body.hairTexture,
    hairThickness: body.hairThickness,
    scalpType: body.scalpType,
    concerns: body.concerns ?? [],
    washFrequency: body.washFrequency,
    washRoutine: body.washRoutine ?? "",
    heatExposure: body.heatExposure ?? "",
    sweatFrequency: body.sweatFrequency ?? "",
    headCovering: body.headCovering ?? [],
    treatments: body.treatments ?? [],
    heatStyling: body.heatStyling ?? "",
    productPriorities: body.productPriorities ?? [],
    budget: body.budget ?? "",
    currentProduct: body.currentProduct ?? "",
    personalGoal: body.personalGoal ?? "",
  };

  let profileId: number | null = null;
  try {
    const { data, error } = await supabase()
      .from("user_hair_profiles")
      .insert({
        hair_texture: profile.hairTexture,
        hair_thickness: profile.hairThickness,
        scalp_type: profile.scalpType,
        concerns: profile.concerns,
        wash_frequency: profile.washFrequency,
        wash_routine: profile.washRoutine,
        lifestyle: profile.heatExposure,
        head_covering: profile.headCovering,
        treatment_history: profile.treatments,
        heat_styling: profile.heatStyling,
        ingredient_preferences: profile.productPriorities,
        budget: profile.budget,
        current_product: profile.currentProduct,
        personal_goal: profile.personalGoal,
      })
      .select("id")
      .single();
    if (error) {
      console.error("Profile insert failed:", error);
    } else {
      profileId = data.id;
    }
  } catch (err) {
    console.error("Profile save error:", err);
  }

  if (!profileId) return Response.json({ error: "Could not save your assessment. Please try again." }, { status: 503 });
  const reference = newReference();

  if (profileId) {
    const { error } = await supabase()
      .from("assessments")
      .insert({
        profile_id: profileId,
        payment_status: "pending",
        payment_reference: reference,
      });
    if (error) return Response.json({ error: "Could not save your assessment. Please try again." }, { status: 503 });
  }

  return Response.json({
    reference,
    amount: AMOUNT_CENTS,
    providerEnabled: Boolean(
      process.env.PAYMENT_MODE === "live" &&
        process.env.BILLPLZ_API_KEY &&
        process.env.BILLPLZ_COLLECTION_ID
    ),
  }, { headers: { "Set-Cookie": sessionCookie(reference), "Cache-Control": "no-store" } });
}
