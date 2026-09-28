import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/analyze/route.ts";

test("scanner handles malformed provider results without crashing", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "test-only";
  try {
    for (const [payload, status] of [[null, 422], [{ name: "Test shampoo", ingredients: [], bestFor: "wrong shape", consider: {} }, 200]]) {
      let calls = 0;
      globalThis.fetch = async (url, options) => {
        assert.equal(url, "https://api.openai.com/v1/responses");
        assert.equal(options.headers.Authorization, "Bearer test-only");
        const sent = JSON.parse(options.body);
        assert.equal(sent.store, false);
        assert.equal(sent.text.format.strict, true);
        assert.equal(sent.text.format.schema.additionalProperties, false);
        assert.match(sent.input[0].content[1].image_url, /^data:image\/jpeg;base64,/);
        return ++calls === 1
        ? Response.json({ error: "Temporarily busy" }, { status: 503 })
        : Response.json({ status: "completed", output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(payload) }] }] });
      };
      const body = new FormData();
      body.append("image", new File([new Uint8Array([255, 216, 255, 0])], "test.jpg", { type: "image/jpeg" }));
      const result = await POST(new Request("http://localhost/api/analyze", { method: "POST", body }));
      assert.equal(result.status, status);
      assert.equal(calls, 2, "temporary provider failures are retried once");
      if (status === 200) {
        const product = await result.json();
        assert.deepEqual(product.bestFor, []);
        assert.deepEqual(product.consider, []);
      }
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});
