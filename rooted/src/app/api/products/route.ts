import { SHAMPOOS } from "@/lib/advisor";
export async function GET() {
  return Response.json(SHAMPOOS.map((p) => ({ id: p.id, name: p.name, brand: p.brand })));
}
