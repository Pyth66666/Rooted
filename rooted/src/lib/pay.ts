// Payment abstraction layer. Real provider can be swapped here without
// touching the rest of the app. Billplz adapter below; enable when keys set.

import { createHmac, timingSafeEqual } from "crypto";

export interface PaymentCreateResult {
  type: "dev" | "billplz" | "error";
  checkoutUrl?: string;
  id?: string;
  message?: string;
}

export interface PaymentConfirmation {
  paid: boolean;
  provider: string;
  transactionId?: string;
}

function enabled() {
  return Boolean(
    process.env.PAYMENT_MODE === "live" &&
      process.env.BILLPLZ_API_KEY &&
      process.env.BILLPLZ_COLLECTION_ID
  );
}

function billplzBase() {
  return process.env.BILLPLZ_SANDBOX === "true"
    ? "https://www.billplz-sandbox.com/api/v3"
    : "https://www.billplz.com/api/v3";
}

export async function createPayment(opts: {
  email: string;
  amountCents: number;
  name: string;
  description: string;
  redirectUrl: string;
  reference: string;
}): Promise<PaymentCreateResult> {
  if (!enabled()) {
    if (process.env.NODE_ENV === "production") return { type: "error", message: "Checkout unavailable." };
    // DEV / TEST mode: simulate a successful flow without any real charge.
    return {
      type: "dev",
      checkoutUrl: `/assessment/pay?reference=${encodeURIComponent(opts.reference)}&test=1`,
      id: `dev_${Date.now()}`,
    };
  }

  try {
    const body = new URLSearchParams({
      collection_id: process.env.BILLPLZ_COLLECTION_ID!,
      email: opts.email,
      name: opts.name.slice(0, 50),
      amount: String(opts.amountCents),
      callback_url: `${process.env.APP_URL}/api/payment/webhook`,
      redirect_url: opts.redirectUrl,
      description: opts.description.slice(0, 200),
      reference_1_label: "ref",
      reference_1: opts.reference,
    });
    const res = await fetch(`${billplzBase()}/bills`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(process.env.BILLPLZ_API_KEY!).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    if (!res.ok) {
      const t = await res.text();
      console.error("Billplz create error:", res.status, t.slice(0, 300));
      return { type: "error", message: "Could not create payment. Try again." };
    }
    const data = await res.json();
    return {
      type: "billplz",
      checkoutUrl: data.url,
      id: data.id,
    };
  } catch (err) {
    console.error("Billplz create error:", err);
    return { type: "error", message: "Could not reach payment service." };
  }
}

export function confirmPayment(): PaymentConfirmation {
  // In live mode this would verify signature/status via webhook + DB.
  // Dev mode always returns paid.
  return {
    paid: true,
    provider: enabled() ? "billplz" : "dev",
    transactionId: `txn_${Date.now()}`,
  };
}

export function verifyBillplzWebhook(raw: string, signature: string | null): boolean {
  // Dev/test mode: no real signature expected — but only allow it off live mode.
  if (!enabled()) return false;
  if (!signature) return false;
  const secret = process.env.BILLPLZ_X_SIGNATURE_KEY || "";
  if (!secret) return false;
  const expected = createHmac("sha256", secret).update(raw).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}
