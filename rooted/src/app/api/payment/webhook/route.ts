import { verifyBillplzWebhook } from "@/lib/pay";
import { supabase } from "@/lib/db";

// Provider callback endpoint for live payments (Billplz POSTs a signed
// x-signature callback to callback_url here). Dev mode should never reach
// this route with a real charge; use /api/payment/dev-confirm instead.
export async function POST(request: Request) {
  // The legacy Billplz payload mapping is unverified. Keep checkout and
  // callbacks closed in production until a provider-tested adapter replaces it.
  if (process.env.NODE_ENV === "production") return Response.json({ ok: false }, { status: 503 });
  const raw = await request.text();

  if (!verifyBillplzWebhook(raw, request.headers.get("x-signature"))) {
    return Response.json({ ok: false, error: "Invalid signature." }, { status: 400 });
  }

  const params = new URLSearchParams(raw);
  const ref = params.get("reference_1") || params.get("ref") || "";
  const paid = ["paid", "completed"].includes((params.get("paid") || params.get("status") || "").toLowerCase());

  if (paid && ref) {
    try {
      const { error } = await supabase()
        .from("assessments")
        .update({
          payment_status: "paid",
          payment_provider: "billplz",
          payment_reference: ref,
        })
        .eq("payment_reference", ref)
        .eq("payment_status", "pending");
      if (error) return Response.json({ ok: false }, { status: 503 });
    } catch (err) {
      console.error("Webhook DB update failed:", err);
    }
  }
  return Response.json({ ok: paid });
}
