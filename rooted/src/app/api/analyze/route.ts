import type { ProductResult } from "@/lib/types";

export const maxDuration = 60;

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
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    brand: { type: "string" },
    category: { type: "string" },
    summary: { type: "string" },
    bestFor: { type: "array", items: { type: "string" } },
    consider: { type: "array", items: { type: "string" } },
    ingredients: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          category: { type: "string", enum: [...CATEGORIES] },
          description: { type: "string" },
          detail: { type: "string" },
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
  const apiKey = process.env.NVIDIA_API_KEY;
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
    let res: Response | undefined;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        res = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
        method: "POST",
        signal: AbortSignal.timeout(22000),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: process.env.NVIDIA_MODEL || "meta/llama-3.2-90b-vision-instruct",
          messages: [{ role: "user", content: [
            { type: "text", text: PROMPT + "\nReturn one JSON object matching this schema, without markdown: " + JSON.stringify(responseSchema) },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${imageBase64}` } },
          ] }],
          stream: false,
          temperature: 0.2,
          max_tokens: 4096,
        }),
      }
    );
        if (![502, 503, 504].includes(res.status) || attempt === 1) break;
        await res.body?.cancel();
      } catch (error) {
        if (attempt === 1) throw error;
      }
    }

    if (!res) throw new Error("No response from photo service.");
    if (!res.ok) {
      await res.body?.cancel();
      console.error("NVIDIA API error:", res.status);
      return Response.json(
        { error: res.status === 429
          ? "The photo service has reached its request limit. Please try again later."
          : [401, 403].includes(res.status)
            ? "Photo analysis is not configured correctly. Please contact ROOTED."
            : "Photo analysis is temporarily unavailable. Please try again shortly, or explore the free shampoo advisor." },
        { status: 502 }
      );
    }

    data = await res.json();
  } catch (err) {
    console.error("Analyze route error:", err);
    return Response.json({ error: "Could not reach AI service." }, { status: 502 });
  }

  const response = data as { choices?: { finish_reason?: string; message?: { content?: string } }[] } | null;
  const choice = response?.choices?.[0];
  if (choice?.finish_reason !== "stop") {
    return Response.json({ error: "Could not finish reading the label. Please try a clearer photo." }, { status: 422 });
  }
  const content = choice.message?.content;
  const text = typeof content === "string" ? content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "") : "";

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

  if (!parsed || typeof parsed !== "object" || !parsed.name || !Array.isArray(parsed.ingredients)) {
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
    bestFor: (Array.isArray(parsed.bestFor) ? parsed.bestFor : []).slice(0, 8).map((s) => String(s).slice(0, 300)),
    consider: (Array.isArray(parsed.consider) ? parsed.consider : []).slice(0, 8).map((s) => String(s).slice(0, 300)),
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
