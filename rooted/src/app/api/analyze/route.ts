import type { ProductResult } from "@/lib/types";

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
      { error: "Photo analysis is temporarily unavailable." },
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

  const bytes = Buffer.from(await file.arrayBuffer());
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (!((file.type === "image/jpeg" && jpeg) || (file.type === "image/png" && png))) {
    return Response.json({ error: "Choose a valid JPG or PNG photo." }, { status: 400 });
  }
  const imageBase64 = bytes.toString("base64");

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
          : "UNCLASSIFIED",
        description: String(i.description ?? "").slice(0, 800),
        detail: String(i.detail ?? "").slice(0, 2500),
      })),
    // Raw, unparsed ingredient names for manual review/correction.
    ingredientsRaw: parsed.ingredients
      .filter((i) => i && typeof i.name === "string")
      .map((i) => String(i.name))
      .join(", "),
  };
  // ponytail: heuristic low-confidence — model gives no numeric OCR confidence;
  // flag when few ingredients or a telling summary. Replace with a real OCR
  // confidence source when the vision pipeline adds one.
  result.lowConfidence =
    (result.ingredients.length > 0 && result.ingredients.length <= 4) ||
    /could not|cannot read|unable to read|blurr/i.test(result.summary);

  return Response.json(result);
}
