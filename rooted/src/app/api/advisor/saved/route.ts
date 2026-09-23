import { verifiedUser } from "@/lib/advisor-auth";
import { parseAdvisorAnswers, matchDemo, ADVISOR_VERSION } from "@/lib/advisor";
import { supabase } from "@/lib/db";

export async function GET(request: Request) {
  const user = await verifiedUser(request);
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const { data, error } = await supabase().from("advisor_profiles").select("id,created_at,answers,recommendations,version").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
  if (error) return Response.json({ error: "Could not load saved profiles." }, { status: 503 });
  return Response.json({ profiles: data }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  const user = await verifiedUser(request);
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  if (Number(request.headers.get("content-length") || 0) > 12000) return Response.json({ error: "Request too large." }, { status: 413 });
  let input: unknown;
  try { input = await request.json(); } catch { return Response.json({ error: "Invalid answers." }, { status: 400 }); }
  const answers = parseAdvisorAnswers(input);
  if (!answers) return Response.json({ error: "Invalid answers." }, { status: 400 });
  const { data, error } = await supabase().from("advisor_profiles").insert({ user_id: user.id, answers, recommendations: matchDemo(answers), version: ADVISOR_VERSION }).select("id").single();
  if (error) return Response.json({ error: "Could not save profile." }, { status: 503 });
  return Response.json({ id: data.id }, { status: 201 });
}

export async function DELETE(request: Request) {
  const user = await verifiedUser(request);
  if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) return Response.json({ error: "Invalid profile." }, { status: 400 });
  const { error } = await supabase().from("advisor_profiles").delete().eq("id", id).eq("user_id", user.id);
  if (error) return Response.json({ error: "Could not delete profile." }, { status: 503 });
  return Response.json({ ok: true });
}
