import { importDataset, persistProducts } from "@/lib/datasets";

// Trigger the dataset import pipeline. Guarded by a shared secret so it
// cannot be run by the public. Call: POST /api/dataset/import with header
// `x-admin-key` matching DATASET_IMPORT_KEY.
export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") return Response.json({ error: "Imports require an approved admin workflow." }, { status: 403 });
  const key = process.env.DATASET_IMPORT_KEY;
  if (!key || request.headers.get("x-admin-key") !== key) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const source = "openbeautyfacts" as const;
  try {
    const body = await request.json();
    if (body?.source !== "openbeautyfacts") return Response.json({ error: "Unsupported source." }, { status: 400 });
  } catch {
    // default source
  }

  try {
    const fetched = await importDataset(source);
    const persisted = await persistProducts(fetched);
    return Response.json({ fetched: fetched.length, persisted });
  } catch (err) {
    console.error("Dataset import failed:", err);
    const msg = err instanceof Error ? err.message : "Import failed.";
    return Response.json({ error: msg }, { status: 500 });
  }
}
