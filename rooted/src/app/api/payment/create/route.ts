import { createPayment } from "@/lib/pay";
import { ownsReference } from "@/lib/assessment-session";
import { supabase } from "@/lib/db";

const AMOUNT_CENTS = 1000; // RM10.00

export async function POST(request: Request) {
  let body: { reference?: string; email?: string; name?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const reference = body.reference || "";
  if (!ownsReference(request, reference)) return Response.json({ type: "error", message: "Assessment session expired." }, { status: 403 });
  const { data: assessment } = await supabase().from("assessments").select("id,payment_status").eq("payment_reference", reference).maybeSingle();
  if (!assessment || assessment.payment_status !== "pending") return Response.json({ type: "error", message: "Assessment is unavailable or already paid." }, { status: 409 });
  if (process.env.NODE_ENV === "production") return Response.json({ type: "error", message: "RM10 checkout is temporarily unavailable while payment verification is completed." }, { status: 503 });
  const res = await createPayment({
    email: body.email || "customer@example.com",
    amountCents: AMOUNT_CENTS,
    name: body.name || "ROOTED Customer",
    description: "Personalized Hair Assessment",
    redirectUrl: `${process.env.APP_URL || ""}/assessment?ref=${encodeURIComponent(reference)}`,
    reference,
  });
  return Response.json(res);
}
