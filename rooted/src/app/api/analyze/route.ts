import type { ProductResult } from "@/lib/mock-data";
import { createClient } from "@supabase/supabase-js";

function supabase() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key);
}

const CATEGORIES = [
  "HYDRATING",
  "CONDITIONING",
  "CLEANSING",
  "BOTANICAL",
  "FRAGRANCE",
  "PRESERVATIVE",
] as const;
type Category = (typeof CATEGORIES)[number];

const PROMPT = `You are a haircare product analyst. Analyze the hair product label in this photo.

1. Read the product name, brand, and category (e.g. Shampoo, Conditioner, Hair Oil, Serum, Mask).
2. Extract the ingredient list from the label. If the ingredients panel is not visible, say so honestly instead of guessing.
3. For each ingredient you can read, categorize it and explain what it does for hair in simple, honest language. Never make medical claims. Use hedged language ("may help", "commonly used").
4. Write a short summary of what the product appears designed for, list who it may be best for, and anything worth considering/caution.

Respond in JSON only.`;

const responseSchema = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    brand: { type: "STRING" },
    category: { type: "STRING" },
    summary: { type: "STRING" },
    bestFor: { type: "ARRAY", items: { type: "STRING" } },
    consider: { type: "ARRAY", items: { type: "STRING" } },
    ingredients: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          category: { type: "STRING", enum: [...CATEGORIES] },
          description: { type: "STRING" },
          detail: { type: "STRING" },
        },
        required: ["name", "category", "description", "detail"],
      },
    },
  },
  required: [
    "name",
    "brand",
    "category",
    "summary",
    "bestFor",
    "consider",
    "ingredients",
  ],
};

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Server missing GEMINI_API_KEY. Add it to .env.local." },
      { status: 500 }
    );
  }

  let file: File;
  try {
    const formData = await request.formData();
    const f = formData.get("image");
    if (!(f instanceof File)) throw new Error();
    file = f;
  } catch {
    return Response.json({ error: "No image provided." }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return Response.json({ error: "Image too large (max 10MB)." }, { status: 400 });
  }

  const imageBase64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const stamp = Date.now();
  let imageUrl: string | null = null;
  try {
    const db = supabase();
    const path = `uploads/${stamp}-${file.name || "photo.jpg"}`;
    const { error } = await db.storage.from("rooted").upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) throw error;
    imageUrl = db.storage.from("rooted").getPublicUrl(path).data.publicUrl;
  } catch (err) {
    console.error("Storage save failed:", err);
  }

  let data: unknown;
  try {
    const res = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: PROMPT },
                {
                  inlineData: {
                    mimeType: file.type || "image/jpeg",
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
            responseSchema,
          },
        }),
      }
    );

    if (!res.ok) {
      const detail = await res.text();
      console.error("Gemini API error:", res.status, detail.slice(0, 500));
      return Response.json(
        { error: "AI service failed. Try again." },
        { status: 502 }
      );
    }

    data = await res.json();
  } catch (err) {
    console.error("Analyze route error:", err);
    return Response.json({ error: "Could not reach AI service." }, { status: 502 });
  }

  // ponytail: trust boundary — coerce model output instead of full schema validation (zod), add when input grows beyond this one shape
  const candidates = (
    data as { candidates?: { content?: { parts?: { text?: string }[] } }[] }
  ).candidates;
  const text = candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    return Response.json(
      { error: "Could not read the label clearly. Try a sharper photo." },
      { status: 422 }
    );
  }

  let parsed: Partial<ProductResult>;
  try {
    parsed = JSON.parse(text);
  } catch {
    return Response.json({ error: "Unexpected AI output." }, { status: 502 });
  }

  if (!parsed.name || !Array.isArray(parsed.ingredients)) {
    return Response.json(
      { error: "Could not find a product label in the photo." },
      { status: 422 }
    );
  }

  const result: ProductResult = {
    name: String(parsed.name).slice(0, 200),
    brand: String(parsed.brand ?? "Unknown").slice(0, 100),
    category: String(parsed.category ?? "Hair Product").slice(0, 100),
    summary: String(parsed.summary ?? "").slice(0, 3000),
    bestFor: (parsed.bestFor ?? []).slice(0, 8).map((s) => String(s).slice(0, 300)),
    consider: (parsed.consider ?? []).slice(0, 8).map((s) => String(s).slice(0, 300)),
    ingredients: parsed.ingredients
      .filter((i) => i && typeof i.name === "string")
      .slice(0, 30)
      .map((i) => ({
        name: String(i.name).slice(0, 200),
        category: (CATEGORIES as readonly string[]).includes(i.category)
          ? (i.category as Category)
          : "BOTANICAL",
        description: String(i.description ?? "").slice(0, 800),
        detail: String(i.detail ?? "").slice(0, 2500),
      })),
  };

  try {
    await supabase()
      .storage.from("rooted")
      .upload(`results/${stamp}.json`, JSON.stringify({ ...result, imageUrl }), {
        contentType: "application/json",
        upsert: false,
      });
  } catch (err) {
    console.error("Result save failed:", err);
  }

  return Response.json(result);
}
