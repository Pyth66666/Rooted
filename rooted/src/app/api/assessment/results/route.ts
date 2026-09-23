import { supabase } from "@/lib/db";
import { currentProductCatalogAsync } from "@/lib/datasets";
import { recommend, matchProductId, WEIGHTS } from "@/lib/recommend";
import { supabaseProfileToInput } from "@/lib/types";
import { ownsReference } from "@/lib/assessment-session";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") || "";
  if (!ownsReference(request, ref)) return Response.json({ error: "Assessment not available in this session." }, { status: 403 });

  const { data: ownedAssessment } = await supabase().from("assessments").select("profile_id,payment_status").eq("payment_reference", ref).maybeSingle();
  if (!ownedAssessment?.profile_id) return Response.json({ error: "Assessment not found." }, { status: 404 });

  let profileData: Record<string, unknown> | null = null;
  try {
    const { data, error } = await supabase()
      .from("user_hair_profiles")
      .select("*")
      .eq("id", ownedAssessment.profile_id)
      .maybeSingle();
    if (!error && data) profileData = data;
  } catch (err) {
    console.error("Profile fetch error:", err);
  }

  if (!profileData) {
    return Response.json({ error: "Profile not found." }, { status: 404 });
  }

  if (ownedAssessment.payment_status !== "paid") {
    return Response.json(
      { error: "Payment required. Complete the RM10 payment to unlock your assessment." },
      { status: 402 }
    );
  }

  const products = await currentProductCatalogAsync();
  const profile = supabaseProfileToInput(profileData);

  const recommendations = recommend({
    profile,
    products,
  });

  const currentName =
    typeof profileData.current_product === "string" ? profileData.current_product : "";
  const matchedCurrent = matchProductId(currentName, products);

  const result = {
    profile: {
      hair: labelTexture(profile.hairTexture),
      thickness: labelThickness(profile.hairThickness),
      scalp: labelScalp(profile.scalpType),
      concerns: profile.concerns,
      washFrequency: labelFrequency(profile.washFrequency),
      treatments: profile.treatments,
      climate:
        profile.heatExposure === "mostly_indoor"
          ? "Mostly indoor"
          : "Hot / humid + regular outdoor exposure",
    },
    weights: WEIGHTS,
    recommendations,
    matchedCurrent,
    disclaimer:
      "ROOTED.MY provides cosmetic and product guidance based on the information you provide. It is not a medical diagnosis. If you have persistent or severe scalp/hair concerns, consider speaking with a qualified healthcare professional.",
  };

  return Response.json(result, { headers: { "Cache-Control": "no-store" } });
}

function labelTexture(v: string) {
  return { straight: "Straight", wavy: "Wavy", curly: "Curly", coily: "Coily", not_sure: "Not sure" }[v] ?? v;
}
function labelThickness(v: string) {
  return { fine: "Fine", medium: "Medium", thick: "Thick", not_sure: "Not sure" }[v] ?? v;
}
function labelScalp(v: string) {
  return {
    normal: "Normal",
    oily: "Oily",
    dry: "Dry",
    combination: "Combination",
    sensitive: "Easily irritated / sensitive",
    not_sure: "Not sure",
  }[v] ?? v;
}
function labelFrequency(v: string) {
  return {
    daily: "Every day",
    four_six: "4–6× weekly",
    two_three: "2–3× weekly",
    once_less: "Once a week or less",
  }[v] ?? v;
}
