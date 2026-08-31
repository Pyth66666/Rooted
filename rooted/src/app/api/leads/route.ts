import { createClient } from "@supabase/supabase-js";

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const name = String(body.name ?? "").slice(0, 100);
  const email = String(body.email ?? "").slice(0, 200).toLowerCase();
  const concern = String(body.concern ?? "").slice(0, 100);
  const ageGroup = String(body.ageGroup ?? "").slice(0, 100);
  const budget = String(body.budget ?? "").slice(0, 100);

  if (!email || !concern || !ageGroup || !budget) {
    return Response.json({ error: "Missing required fields." }, { status: 400 });
  }

  try {
    const { error } = await supabase()
      .from("leads")
      .insert({ name, email, concern, age_group: ageGroup, budget });
    if (error) {
      console.error("Lead insert failed:", error);
      return Response.json({ error: "Could not save." }, { status: 502 });
    }
    return Response.json({ ok: true });
  } catch (err) {
    console.error("Lead save error:", err);
    return Response.json({ error: "Could not save." }, { status: 502 });
  }
}
