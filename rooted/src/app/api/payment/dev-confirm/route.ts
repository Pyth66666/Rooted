import { supabase } from "@/lib/db";
import { ownsReference } from "@/lib/assessment-session";

// Development / test payment confirmation. Explicitly refuses when a real
// provider is configured — the app never pretends a real payment happened.
export async function POST(request: Request) {
  const live = process.env.PAYMENT_MODE === "live";
  if (live || process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Dev confirmation disabled in live mode." },
      { status: 403 }
    );
  }

  let body: { reference?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const reference = body.reference;
  if (!reference || !ownsReference(request, reference)) {
    return Response.json({ error: "Missing reference." }, { status: 400 });
  }

  try {
    const { data, error } = await supabase()
      .from("assessments")
      .update({
        payment_status: "paid",
        payment_provider: "dev",
        payment_reference: reference,
      })
      .eq("payment_reference", reference)
      .eq("payment_status", "pending")
      .select("id")
      .maybeSingle();
    if (error) {
      console.error("Dev confirm failed:", error);
      return Response.json({ error: "Could not confirm payment." }, { status: 500 });
    }
    if (!data) {
      return Response.json({ error: "No pending assessment for this reference." }, { status: 404 });
    }
    return Response.json({ ok: true, paid: true, reference });
  } catch (err) {
    console.error("Dev confirm error:", err);
    return Response.json({ error: "Could not confirm payment." }, { status: 500 });
  }
}
