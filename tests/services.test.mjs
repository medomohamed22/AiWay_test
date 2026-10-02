import "./setup.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import { requestJson } from "../server/providers/http.js";
import { normalizeImagePricing } from "../server/providers/openrouter-catalog.js";
import {
  resolveOpenRouterCharge,
  chargeTokens,
} from "../server/domain/credits.js";
import { setDatabaseClientForTests } from "../server/core/runtime.js";
import {
  getFeatureFlags,
  getPaymentPackages,
} from "../server/domain/settings.js";
import { getAiTools } from "../server/domain/tools.js";
import { enforceJsonBodySize } from "../server/core/http.js";
import {
  signAppToken,
  requireUser,
  requireAdmin,
  createDownloadTicket,
  verifyDownloadTicket,
} from "../server/features/auth/service.js";
import { ensureConversationOwner } from "../server/data/ownership.js";
import {
  chooseAutoModel,
  isTextChatModel,
} from "../server/domain/model-routing.js";
import { imageStorage } from "../server/providers/storage.js";
import imageHandler from "../api/image.js";
import chatHandler from "../api/chat.js";

function fakeClient(
  results = {},
  rpc = async () => ({ data: true, error: null }),
  storage = null,
) {
  return {
    rpc,
    storage,
    from(table) {
      let filters = [],
        operation = "select",
        patch;
      const q = {
        select() {
          return q;
        },
        eq(k, v) {
          filters.push([k, v]);
          return q;
        },
        order() {
          return q;
        },
        limit() {
          return q;
        },
        maybeSingle() {
          return q;
        },
        single() {
          return q;
        },
        update(value) {
          operation = "update";
          patch = value;
          return q;
        },
        insert(value) {
          operation = "insert";
          patch = value;
          return q;
        },
        then(resolve) {
          const result = results[table];
          resolve(
            typeof result === "function"
              ? result({ filters, operation, patch })
              : result || { data: null, error: null },
          );
        },
      };
      return q;
    },
  };
}
function response() {
  return {
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    getHeader(k) {
      return this.headers[k];
    },
    end(body) {
      this.body = JSON.parse(body);
      return this;
    },
  };
}
async function withFetch(fake, work) {
  const original = globalThis.fetch;
  globalThis.fetch = fake;
  try {
    return await work();
  } finally {
    globalThis.fetch = original;
  }
}
test("provider deadline covers a stalled JSON response body", async () => {
  await withFetch(
    async (url, options) =>
      new Response(
        new ReadableStream({
          start(controller) {
            const timer = setTimeout(() => controller.close(), 200);
            options.signal.addEventListener(
              "abort",
              () => {
                clearTimeout(timer);
                controller.error(options.signal.reason);
              },
              { once: true },
            );
          },
        }),
      ),
    async () => {
      await assert.rejects(
        requestJson("https://provider.invalid", {}, 25),
        (error) => error.code === "PROVIDER_TIMEOUT",
      );
    },
  );
});
test("provider invalid JSON and network failures return controlled errors", async () => {
  await withFetch(
    async () => new Response("invalid json"),
    async () => {
      await assert.rejects(
        requestJson("https://provider.invalid"),
        (e) => e.code === "PROVIDER_INVALID_RESPONSE",
      );
    },
  );
  await withFetch(
    async () => {
      throw Error("network down");
    },
    async () => {
      await assert.rejects(
        requestJson("https://provider.invalid"),
        (e) => e.code === "PROVIDER_NETWORK_ERROR",
      );
    },
  );
});
test("image endpoint pricing arrays preserve image and megapixel rates", () => {
  assert.deepEqual(
    normalizeImagePricing([
      { billable: "output_image", unit: "image", cost_usd: 0.03 },
      { billable: "output_image", unit: "image", cost_usd: 0.05 },
      { billable: "output_image", unit: "megapixel", cost_usd: 0.014 },
    ]),
    { image: 0.05, megapixel: 0.014 },
  );
});
test("image usage stays funded when the generation-cost service fails", async () => {
  await withFetch(
    async () => {
      throw Error("cost lookup offline");
    },
    async () => {
      const charge = await resolveOpenRouterCharge({
        usage: {},
        generationId: "image-request",
        price: { image: 0.03 },
        fallbackUsd: 0.03,
      });
      assert.equal(charge.providerUsd, 0.03);
      assert.equal(charge.chargedTokens, 3000);
      assert.equal(charge.pricingBasis, "estimate");
    },
  );
});
test("text usage keeps authoritative provider cost and legacy rounding", () => {
  const charge = chargeTokens(
    { prompt: 0.000001, completion: 0.000002 },
    { prompt_tokens: 100, completion_tokens: 50, cost: 0.002 },
  );
  assert.equal(charge.providerUsd, 0.002);
  assert.equal(charge.chargedTokens, 200);
});
test("control database outage does not enable features", async () => {
  setDatabaseClientForTests(
    fakeClient({
      admin_settings: {
        data: null,
        error: { code: "08006", message: "Connection lost" },
      },
    }),
  );
  await assert.rejects(getFeatureFlags(), (e) => e.code === "DATABASE_ERROR");
});
test("disabling all packages and tools does not resurrect defaults", async () => {
  setDatabaseClientForTests(
    fakeClient({
      payment_packages: { data: [], error: null },
      ai_tools: { data: [], error: null },
    }),
  );
  assert.deepEqual(await getPaymentPackages(), {});
  assert.deepEqual(await getAiTools(), []);
});
test("legacy absent configuration tables preserve the original default catalog", async () => {
  setDatabaseClientForTests(
    fakeClient({
      payment_packages: { data: null, error: { code: "42P01" } },
      ai_tools: { data: null, error: { code: "PGRST205" } },
    }),
  );
  assert.ok((await getPaymentPackages()).starter);
  assert.ok((await getAiTools()).some((t) => t.id === "coding"));
});
test("actual JSON body size is enforced without Content-Length", () => {
  assert.throws(
    () =>
      enforceJsonBodySize(
        { headers: {}, body: { prompt: "x".repeat(120) } },
        100,
      ),
    (e) => e.code === "PAYLOAD_TOO_LARGE",
  );
});
test("current database role overrides stale admin token claims", async () => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    pi_uid: "pi-one",
    username: "one",
    role: "user",
  };
  setDatabaseClientForTests(fakeClient({ users: { data: user, error: null } }));
  const token = await signAppToken({ ...user, role: "admin" });
  const current = await requireUser({
    headers: { authorization: "Bearer " + token },
    method: "GET",
  });
  assert.equal(current.role, "user");
  await assert.rejects(requireAdmin(current), (e) => e.code === "FORBIDDEN");
});
test("authentication database failure stays a service error", async () => {
  const token = await signAppToken({ id: "one", role: "user" });
  setDatabaseClientForTests(
    fakeClient({ users: { data: null, error: { code: "08006" } } }),
  );
  await assert.rejects(
    requireUser({
      headers: { authorization: "Bearer " + token },
      method: "GET",
    }),
    (e) => e.code === "DATABASE_ERROR",
  );
});
test("another account cannot access a conversation", async () => {
  const filters = [];
  const c = fakeClient({
    conversations: (query) => {
      filters.push(...query.filters);
      return { data: null, error: null };
    },
  });
  await assert.rejects(
    ensureConversationOwner(c, "conversation-other", "user-one"),
  );
  assert.deepEqual(filters, [
    ["id", "conversation-other"],
    ["user_id", "user-one"],
  ]);
});
test("download tickets cannot be used as app sessions", async () => {
  const ticket = await createDownloadTicket({
    sub: "one",
    kind: "image-view",
    imageId: "image",
  });
  assert.equal((await verifyDownloadTicket(ticket)).imageId, "image");
  await assert.rejects(
    requireUser({
      headers: { authorization: "Bearer " + ticket },
      method: "GET",
    }),
    (e) => e.code === "UNAUTHORIZED",
  );
});
test("automatic model routing excludes models without text output", async () => {
  assert.equal(isTextChatModel({ outputModalities: ["image"] }), false);
  setDatabaseClientForTests(
    fakeClient({ ai_tools: { data: [], error: null } }),
  );
  await withFetch(
    async () =>
      Response.json({
        data: [
          {
            id: "test/text",
            architecture: {
              input_modalities: ["text"],
              output_modalities: ["text"],
            },
            pricing: { prompt: 0, completion: 0 },
          },
        ],
      }),
    async () => {
      const model = await chooseAutoModel("Explain a small function");
      assert.ok(isTextChatModel(model));
    },
  );
});
test("OpenRouter image outage releases the existing token reservation", async () => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    pi_uid: "owner",
    username: "owner",
    role: "user",
    has_purchased: true,
    ai_tokens: 100000,
    paid_ai_tokens: 100000,
  };
  const calls = [];
  setDatabaseClientForTests(
    fakeClient(
      {
        users: { data: user, error: null },
        conversations: { data: { id: "conversation" }, error: null },
        ai_tools: { data: [], error: null },
      },
      async (name, args) => {
        calls.push([name, args]);
        return {
          data:
            name === "reserve_ai_tokens"
              ? { status: "reserved", reserved_tokens: 5000 }
              : true,
          error: null,
        };
      },
    ),
  );
  const token = await signAppToken(user),
    res = response();
  await withFetch(
    async (url) => {
      if (String(url).endsWith("/images"))
        return Response.json(
          { error: { message: "Service unavailable" } },
          { status: 503 },
        );
      if (String(url).endsWith("/endpoints"))
        return Response.json({ data: [] });
      return Response.json({
        data: [
          {
            id: "black-forest-labs/flux.2-klein-4b",
            architecture: {
              input_modalities: ["text"],
              output_modalities: ["image"],
            },
            pricing: { image: 0.03 },
          },
        ],
      });
    },
    async () => {
      await imageHandler(
        {
          method: "POST",
          query: {},
          headers: { authorization: "Bearer " + token },
          body: {
            conversationId: "conversation",
            prompt: "A blue sky",
            requestId: "image-test-request",
            modelId: "black-forest-labs/flux.2-klein-4b",
          },
        },
        res,
      );
      assert.ok(res.statusCode >= 500, JSON.stringify(res.body));
      assert.equal(calls.filter(([n]) => n === "reserve_ai_tokens").length, 1);
      assert.equal(calls.filter(([n]) => n === "release_ai_tokens").length, 1);
      assert.equal(calls.filter(([n]) => n === "finalize_ai_tokens").length, 0);
    },
  );
});
test("storage capacity failure preserves the client-only image fallback", async () => {
  const user = {
      id: "11111111-1111-4111-8111-111111111111",
      pi_uid: "owner",
      username: "owner",
      role: "user",
    },
    patches = [];
  const storage = {
    from(bucket) {
      assert.equal(bucket, "generated-images");
      return {
        upload: async () => ({ error: { message: "Storage quota exceeded" } }),
      };
    },
  };
  setDatabaseClientForTests(
    fakeClient(
      {
        users: { data: user, error: null },
        generated_images: (q) => {
          if (q.operation === "update") {
            patches.push(q.patch);
            return { data: null, error: null };
          }
          return { data: { id: "image-one", storage_path: null }, error: null };
        },
      },
      undefined,
      storage,
    ),
  );
  const token = await signAppToken(user),
    res = response();
  const png = Buffer.from([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0,
  ]).toString("base64");
  await imageHandler(
    {
      method: "POST",
      query: {},
      headers: { authorization: "Bearer " + token },
      body: {
        action: "persist",
        imageId: "image-one",
        imageData: "data:image/png;base64," + png,
      },
    },
    res,
  );
  assert.equal(res.statusCode, 200, JSON.stringify(res.body));
  assert.equal(res.body.storageStatus, "client_only");
  assert.equal(patches[0].storage_status, "client_only");
});
test("storage adapter keeps provider errors visible to callers", async () => {
  const error = { message: "Storage unavailable" };
  const storage = imageStorage({
    storage: { from: () => ({ remove: async () => ({ error }) }) },
  });
  assert.equal((await storage.remove(["owner/file.png"])).error, error);
});
test("streaming chat retains delta, saved assistant and final billing events", async () => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    pi_uid: "owner",
    username: "owner",
    role: "user",
    has_purchased: true,
    ai_tokens: 100000,
  };
  const calls = [],
    saved = [];
  setDatabaseClientForTests(
    fakeClient(
      {
        users: { data: user, error: null },
        conversations: { data: { id: "conversation" }, error: null },
        ai_tools: { data: [], error: null },
        messages: (q) => {
          saved.push(q.patch);
          return { data: { id: "assistant-one" }, error: null };
        },
      },
      async (name, args) => {
        calls.push([name, args]);
        return {
          data:
            name === "reserve_ai_tokens"
              ? { status: "reserved" }
              : name === "finalize_ai_tokens"
                ? 99800
                : true,
          error: null,
        };
      },
    ),
  );
  const token = await signAppToken(user);
  const res = {
    headers: {},
    chunks: [],
    status(n) {
      this.statusCode = n;
      return this;
    },
    setHeader(k, v) {
      this.headers[k] = v;
      return this;
    },
    getHeader(k) {
      return this.headers[k];
    },
    flushHeaders() {
      this.headersSent = true;
    },
    write(value) {
      this.chunks.push(value);
    },
    end(value) {
      if (value) this.chunks.push(value);
    },
  };
  await withFetch(
    async () =>
      new Response(
        "data: " +
          JSON.stringify({
            id: "gen-one",
            choices: [
              { delta: { content: "Hello world" }, finish_reason: "stop" },
            ],
            usage: { prompt_tokens: 100, completion_tokens: 50, cost: 0.002 },
          }) +
          "\n\ndata: [DONE]\n\n",
      ),
    async () => {
      await chatHandler(
        {
          method: "POST",
          query: {},
          headers: { authorization: "Bearer " + token },
          body: {
            conversationId: "conversation",
            modelId: "deepseek/deepseek-v4-flash",
            taskId: "all-models",
            requestId: "chat-stream-test",
            messages: [{ role: "user", content: "Say hello" }],
          },
        },
        res,
      );
    },
  );
  const events = res.chunks
    .flatMap((chunk) => chunk.split("\n"))
    .filter((line) => line.startsWith("data: "))
    .map((line) => JSON.parse(line.slice(6)));
  assert.equal(res.statusCode, 200, JSON.stringify(events));
  assert.equal(events.find((e) => e.type === "delta")?.text, "Hello world");
  assert.equal(events.find((e) => e.type === "done")?.chargedTokens, 200);
  assert.equal(
    saved.find((m) => m.role === "assistant")?.content,
    "Hello world",
  );
  assert.equal(calls.filter(([n]) => n === "finalize_ai_tokens").length, 1);
  assert.equal(calls.filter(([n]) => n === "release_ai_tokens").length, 0);
});
