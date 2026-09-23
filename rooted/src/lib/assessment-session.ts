import { randomBytes, timingSafeEqual } from "node:crypto";

export function newReference() { return `rooted_${randomBytes(24).toString("hex")}`; }

export function ownsReference(request: Request, reference: string) {
  if (!/^rooted_[a-f0-9]{48}$/.test(reference)) return false;
  const value = request.headers.get("cookie")?.split(";").map((x) => x.trim()).find((x) => x.startsWith("rooted_assessment="))?.slice("rooted_assessment=".length) || "";
  const a = Buffer.from(value); const b = Buffer.from(reference);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function sessionCookie(reference: string) {
  return `rooted_assessment=${reference}; HttpOnly; SameSite=Lax; Path=/; Max-Age=86400${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
}
