import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../src/app/api/analyze/route.ts";

test("scanner handles malformed provider results without crashing", async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.NVIDIA_API_KEY;
  process.env.NVIDIA_API_KEY = "test-only";
  try {
    for (const [payload, status] of [[null, 422], [{ name: "Test shampoo", ingredients: [], bestFor: "wrong shape", consider: {} }, 200]]) {
      let calls = 0;
      globalThis.fetch = async (url, options) => {
        assert.equal(url, "https://integrate.api.nvidia.com/v1/chat/completions");
        assert.equal(options.headers.Authorization, "Bearer test-only");
        const sent = JSON.parse(options.body);
        assert.equal(sent.stream, false);
        assert.ok(sent.model.includes("vision"));
        assert.match(sent.messages[0].content[1].image_url.url, /^data:image\/jpeg;base64,/);
        return ++calls === 1
        ? Response.json({ error: "Temporarily busy" }, { status: 503 })
        : Response.json({ choices: [{ finish_reason: "stop", message: { content: JSON.stringify(payload) } }] });
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
    for (const [providerStatus, expected] of [[429, /request limit/], [401, /not configured/], [403, /not configured/]]) {
      globalThis.fetch = async () => Response.json({}, { status: providerStatus });
      const body = new FormData();
      body.append("image", new File([new Uint8Array([255, 216, 255, 0])], "test.jpg", { type: "image/jpeg" }));
      const result = await POST(new Request("http://localhost/api/analyze", { method: "POST", body }));
      assert.equal(result.status, 502);
      assert.match((await result.json()).error, expected);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.NVIDIA_API_KEY;
    else process.env.NVIDIA_API_KEY = originalKey;
  }
});
