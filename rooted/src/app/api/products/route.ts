import { currentProductCatalogAsync } from "@/lib/datasets";

// Public product name/brand list for the questionnaire's current-product
// search. No prices or sensitive fields exposed.
export async function GET() {
  if (process.env.NODE_ENV === "production") return Response.json([]);
  const products = await currentProductCatalogAsync();
  return Response.json(
    products.map((p) => ({ name: p.name, brand: p.brand }))
  );
}
