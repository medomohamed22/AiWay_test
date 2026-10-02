import "./setup.mjs";
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { setDatabaseClientForTests } from "../server/core/runtime.js";
import { signAppToken } from "../server/features/auth/service.js";
import account from "../api/me.js";
import apps from "../api/apps.js";
import {
  extractDownloadableFiles,
  makeStoreZip,
} from "../server/features/chat/downloads.js";
import { sanitizeToolSvg } from "../server/domain/tool-icons.js";
import adminHandler from "../api/admin-stats.js";
import vm from "node:vm";
test("direct and rewritten account routes return the same profile and usage", async () => {
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    username: "owner",
    pi_uid: "pi-one",
    role: "user",
  };
  const summary = {
    periodDays: 30,
    consumedTokens: 3000,
    lastRequestTokens: 3000,
    lastRequestType: "image",
    lastRequestAt: "2026-10-02",
  };
  setDatabaseClientForTests({
    rpc: async (name) => ({
      data: name === "aiway_user_usage" ? summary : null,
      error: null,
    }),
    from(table) {
      const q = {
        select: () => q,
        eq: () => q,
        single: () => q,
        maybeSingle: () => q,
        then(resolve) {
          resolve({ data: table === "users" ? user : null, error: null });
        },
      };
      return q;
    },
  });
  const token = await signAppToken(user),
    req = {
      method: "GET",
      headers: { authorization: "Bearer " + token },
      query: {},
    };
  const res = () => ({
    headers: {},
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
    end(body) {
      this.body = JSON.parse(body);
    },
  });
  const direct = res(),
    rewritten = res();
  await account(req, direct);
  await apps({ ...req, query: { route: "me" } }, rewritten);
  assert.equal(direct.statusCode, 200);
  assert.deepEqual(rewritten.body, direct.body);
});
test("generated code download and ZIP support remain available", () => {
  const files = extractDownloadableFiles(
    "Example\n" +
      String.fromCharCode(96).repeat(3) +
      "file-index.html\n<h1>Hello</h1>\n" +
      String.fromCharCode(96).repeat(3),
  );
  assert.equal(files.length, 1);
  assert.match(files[0].content, /Hello/);
  const zip = makeStoreZip(files);
  assert.equal(zip.readUInt32LE(0), 0x04034b50);
  assert.ok(zip.includes(Buffer.from("<h1>Hello</h1>")));
});
test("tool SVG icons preserve valid shapes and reject executable content", () => {
  assert.match(
    sanitizeToolSvg('<svg viewBox="0 0 24 24"><path d="M0 0"/></svg>'),
    /path/,
  );
  assert.throws(
    () => sanitizeToolSvg("<svg><script>alert(1)</script></svg>"),
    /INVALID_TOOL_ICON/,
  );
});
test("build configuration publishes frontend assets separately from server modules", async () => {
  const config = JSON.parse(await fs.readFile("vercel.json", "utf8"));
  assert.equal(config.outputDirectory, "public");
  assert.ok(
    config.rewrites.some(
      (r) => r.source === "/api/me" && r.destination.includes("route=me"),
    ),
  );
  const html = await fs.readFile("admin.html", "utf8");
  assert.ok(html.indexOf("usersPrev") > html.indexOf("usersBody"));
  assert.equal((html.match(/id="usersNext"/g) || []).length, 1);
});
test("admin delegated handlers convert database failures to API error responses", async () => {
  const admin = {
    id: "11111111-1111-4111-8111-111111111111",
    username: "admin",
    pi_uid: "pi-admin",
    role: "admin",
  };
  setDatabaseClientForTests({
    from(table) {
      const q = {
        select: () => q,
        eq: () => q,
        order: () => q,
        limit: () => q,
        maybeSingle: () => q,
        single: () => q,
        then(resolve) {
          resolve(
            table === "users"
              ? { data: admin, error: null }
              : {
                  data: null,
                  error: { code: "08006", message: "Database offline" },
                },
          );
        },
      };
      return q;
    },
  });
  const original = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ data: [] });
  const token = await signAppToken(admin);
  const res = {
    headers: {},
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
    end(body) {
      this.body = JSON.parse(body);
    },
  };
  try {
    await adminHandler(
      {
        method: "GET",
        headers: { authorization: "Bearer " + token },
        query: { mode: "model-settings" },
      },
      res,
    );
    assert.equal(res.statusCode, 503);
    assert.equal(res.body.code, "DATABASE_ERROR");
  } finally {
    globalThis.fetch = original;
  }
});
test("support page collection retains unread messages from earlier pages", async () => {
  for (const file of ["app.js", "admin.js"]) {
    const source = await fs.readFile(file, "utf8");
    const start = source.indexOf("async function collectPages"),
      end = source.indexOf("\n}", start) + 2;
    const context = vm.createContext({});
    vm.runInContext(source.slice(start, end), context);
    const result = await context.collectPages(
      "/api/conversations?mode=support",
      "messages",
      async (url) =>
        url.includes("offset=0")
          ? { messages: [{ id: 1 }], unread: 1, nextOffset: 100 }
          : { messages: [{ id: 2 }], unread: 0, nextOffset: null },
    );
    assert.equal(result.messages.length, 2);
    assert.equal(result.unread, 1);
  }
});
