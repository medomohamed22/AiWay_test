import "./setup.mjs";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testDatabase, supabaseTestClient } from "./helpers/postgres.mjs";
import { setDatabaseClientForTests } from "../server/core/runtime.js";
import { signAppToken } from "../server/features/auth/service.js";
import completeHandler from "../api/payment-complete.js";
import { validateApprovedPayment } from "../server/domain/payment-service.js";
let database, pool, client;
const user = randomUUID(),
  other = randomUUID(),
  admin = randomUUID();
before(async () => {
  database = await testDatabase();
  pool = database.pool;
  client = supabaseTestClient(pool);
  setDatabaseClientForTests(client);
  await pool.query(
    "insert into users(id,pi_uid,username,role,ai_tokens,paid_ai_tokens) values($1,'pi-owner','owner','user',100,100),($2,'pi-other','other','user',0,0),($3,'pi-admin','admin','admin',0,0)",
    [user, other, admin],
  );
});
after(async () => {
  await database?.close();
});
async function payment(id, owner = user, tokens = 500) {
  await pool.query(
    "insert into payments(user_id,payment_id,package_id,amount_pi,usd_amount,ai_tokens,status) values($1,$2,'starter',2,5,$3,'approved')",
    [owner, id, tokens],
  );
}
const balance = async () =>
  Number(
    (await pool.query("select ai_tokens from users where id=$1", [user]))
      .rows[0].ai_tokens,
  );
const finish = (id, tx, owner = user) =>
  pool.query("select aiway_complete_purchase_once($1,$2,$3,$4)", [
    owner,
    id,
    tx,
    {},
  ]);

test("simultaneous callbacks credit a payment once across twelve database connections", async () => {
  await payment("duplicate-payment");
  const before = await balance();
  const results = await Promise.all(
    Array.from({ length: 25 }, () =>
      finish("duplicate-payment", "verified-tx-1"),
    ),
  );
  assert.equal(await balance(), before + 500);
  assert.equal(
    results.filter(
      (r) => !r.rows[0].aiway_complete_purchase_once.alreadyCompleted,
    ).length,
    1,
  );
  assert.equal(
    (
      await pool.query(
        "select count(*)::int as n from aiway_purchase_receipts where payment_id='duplicate-payment'",
      )
    ).rows[0].n,
    1,
  );
});
test("one transaction cannot credit two different payment identifiers", async () => {
  await payment("alias-payment-a");
  await payment("alias-payment-b");
  const before = await balance();
  const results = await Promise.allSettled([
    finish("alias-payment-a", "shared-tx"),
    finish("alias-payment-b", "shared-tx"),
  ]);
  assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(await balance(), before + 500);
});
test("purchase RPC rejects another account and leaves financial state intact", async () => {
  await payment("wrong-owner");
  const before = await balance();
  await assert.rejects(
    finish("wrong-owner", "owner-tx", other),
    /PAYMENT_MISMATCH/,
  );
  assert.equal(await balance(), before);
});
test("concurrent admin adjustments preserve both deltas and audit entries", async () => {
  const before = await balance();
  const adjust = (delta, id) =>
    pool.query("select aiway_adjust_balance($1,$2,$3,$4,$5)", [
      admin,
      user,
      delta,
      "Reviewed adjustment",
      id,
    ]);
  const id = randomUUID();
  await Promise.all([adjust(50, id), adjust(-20, randomUUID())]);
  assert.equal(await balance(), before + 30);
  await adjust(50, id);
  assert.equal(await balance(), before + 30);
  assert.equal(
    (
      await pool.query(
        "select count(*)::int as n from admin_audit_log where action='adjust_balance'",
      )
    ).rows[0].n,
    2,
  );
});
test("audit failure rolls back a balance adjustment", async () => {
  const before = await balance();
  await pool.query(
    "create function reject_test_audit() returns trigger language plpgsql as $$begin raise exception 'audit unavailable'; end$$;create trigger reject_audit before insert on admin_audit_log for each row execute function reject_test_audit()",
  );
  try {
    await assert.rejects(
      pool.query("select aiway_adjust_balance($1,$2,50,$3,$4)", [
        admin,
        user,
        "Test failure",
        randomUUID(),
      ]),
      /audit unavailable/,
    );
    assert.equal(await balance(), before);
  } finally {
    await pool.query(
      "drop trigger reject_audit on admin_audit_log;drop function reject_test_audit()",
    );
  }
});
test("completion accepts approved terms after the quote expired and the package was removed", async () => {
  await payment("late-payment");
  const remote = {
    user_uid: "pi-owner",
    amount: 2,
    metadata: {
      packageId: "starter",
      tokens: 500,
      usd: 5,
      quoteToken: "expired-old-checkout-token",
    },
    transaction: { txid: "late-tx", verified: true },
    status: { developer_completed: true },
  };
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => Response.json(remote);
  const token = await signAppToken({
    id: user,
    pi_uid: "pi-owner",
    username: "owner",
    role: "user",
  });
  const response = {
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
  const before = await balance();
  try {
    await completeHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer " + token },
        query: {},
        body: { paymentId: "late-payment" },
      },
      response,
    );
    assert.equal(response.statusCode, 200, JSON.stringify(response.body));
    assert.equal(response.body.completed, true);
    assert.equal(await balance(), before + 500);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
test("approved terms reject changed Pi owner, amount, tokens and package", () => {
  const payment = {
    user_id: user,
    amount_pi: 2,
    ai_tokens: 500,
    usd_amount: 5,
    package_id: "starter",
  };
  const remote = {
    user_uid: "pi-owner",
    amount: 2,
    metadata: { packageId: "starter", tokens: 500, usd: 5 },
  };
  for (const changed of [
    { ...remote, user_uid: "pi-other" },
    { ...remote, amount: 1 },
    { ...remote, metadata: { ...remote.metadata, tokens: 999 } },
    { ...remote, metadata: { ...remote.metadata, packageId: "pro" } },
  ]) {
    assert.throws(
      () =>
        validateApprovedPayment(payment, changed, {
          id: user,
          pi_uid: "pi-owner",
        }),
      /PAYMENT_MISMATCH/,
    );
  }
});
test("a failed Pi request does not credit the stored payment", async () => {
  await payment("pi-failure");
  const fetchOriginal = globalThis.fetch;
  globalThis.fetch = async () => {
    throw Error("Provider unavailable");
  };
  const token = await signAppToken({
    id: user,
    pi_uid: "pi-owner",
    username: "owner",
    role: "user",
  });
  const response = {
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
  const before = await balance();
  try {
    await completeHandler(
      {
        method: "POST",
        headers: { authorization: "Bearer " + token },
        query: {},
        body: { paymentId: "pi-failure" },
      },
      response,
    );
    assert.ok(response.statusCode >= 500);
    assert.equal(await balance(), before);
  } finally {
    globalThis.fetch = fetchOriginal;
  }
});
test("analytics count image usage once and retain it after storage record deletion", async () => {
  const conversation = randomUUID(),
    message = randomUUID();
  await pool.query(
    "insert into conversations(id,user_id,title) values($1,$2,'Image chat')",
    [conversation, user],
  );
  await pool.query(
    "insert into messages(id,user_id,conversation_id,role,model_id,token_usage) values($1,$2,$3,'assistant','image-model',$4)",
    [
      message,
      user,
      conversation,
      { type: "image", providerUsd: 0.03, chargedTokens: 3000 },
    ],
  );
  await pool.query(
    "insert into generated_images(user_id,conversation_id,message_id,model_id,token_usage) values($1,$2,$3,'image-model',$4)",
    [user, conversation, message, { providerUsd: 0.03, chargedTokens: 3000 }],
  );
  const summary = async () =>
    (await pool.query("select aiway_user_usage($1,30) as data", [user])).rows[0]
      .data;
  assert.equal((await summary()).consumedTokens, 3000);
  await pool.query("delete from generated_images where message_id=$1", [
    message,
  ]);
  assert.equal((await summary()).consumedTokens, 3000);
  const d = (await pool.query("select aiway_admin_dashboard(40,0,'') as data"))
    .rows[0].data;
  assert.equal(d.images.count, 1);
  assert.equal(d.messages.count, 0);
  assert.equal(d.providerCostUsd, 0.03);
  assert.equal(d.usage.dailyImages.length, 30);
  assert.equal(d.usage.hourCounts.length, 24);
});
test("conversation pages include equal timestamps without duplicates and enforce ownership", async () => {
  await pool.query(
    "insert into conversations(user_id,title,updated_at) select $1,'chat-'||n,'2026-01-01'::timestamptz from generate_series(1,85) n",
    [other],
  );
  const collected = [];
  let offset = 0;
  do {
    const page = (
      await pool.query("select aiway_conversation_page($1,40,$2) as data", [
        other,
        offset,
      ])
    ).rows[0].data;
    collected.push(...page.conversations);
    offset = page.nextOffset;
  } while (offset != null);
  assert.equal(collected.length, 85);
  assert.equal(new Set(collected.map((c) => c.id)).size, 85);
  const own = (
    await pool.query("select aiway_conversation_page($1,100,0) as data", [user])
  ).rows[0].data;
  assert.ok(
    own.conversations.every((c) => !collected.some((o) => o.id === c.id)),
  );
});
test("client roles cannot call privileged RPCs", async () => {
  const c = await pool.connect();
  try {
    await c.query("set role anon");
    await assert.rejects(
      c.query("select aiway_admin_dashboard(40,0,'')"),
      /permission denied/,
    );
    await assert.rejects(
      c.query("select complete_token_purchase($1,$2,$3,$4,$5)", [
        user,
        "wrong-owner",
        "legacy-tx",
        500,
        {},
      ]),
      /permission denied/,
    );
    await assert.rejects(
      c.query("select aiway_complete_purchase_once($1,$2,$3,$4)", [
        user,
        "wrong-owner",
        "tx",
        {},
      ]),
      /permission denied/,
    );
  } finally {
    await c.query("reset role");
    c.release();
  }
});
test("admin users are paged and server search finds records beyond the first page", async () => {
  await pool.query(
    "insert into users(username,pi_uid,role,created_at) select 'paged-user-'||n,'paged-pi-'||n,'user','2025-01-01'::timestamptz from generate_series(1,103) n",
  );
  const ids = new Set();
  let offset = 0;
  do {
    const page = (
      await pool.query(
        "select aiway_admin_users(40,$1,'paged-user-') as data",
        [offset],
      )
    ).rows[0].data;
    for (const user of page.usersTable) ids.add(user.id);
    offset = page.nextUsersOffset;
  } while (offset != null);
  assert.equal(ids.size, 103);
  const found = (
    await pool.query("select aiway_admin_users(40,0,'paged-user-103') as data")
  ).rows[0].data;
  assert.equal(found.usersTotal, 1);
  assert.equal(found.usersTable[0].username, "paged-user-103");
});
test("migrations can be reapplied without changing completed balances", async () => {
  const fs = await import("node:fs/promises"),
    before = await balance();
  for (const name of (await fs.readdir("supabase/migrations")).sort())
    await pool.query(await fs.readFile("supabase/migrations/" + name, "utf8"));
  assert.equal(await balance(), before);
});
