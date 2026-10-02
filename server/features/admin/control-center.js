import { audit } from "./audit.js";
import { randomUUID } from "node:crypto";

import { piPayment } from "../../providers/pi.js";
import {
  validateApprovedPayment,
  completePurchase,
} from "../../domain/payment-service.js";
import { pageOptions } from "../../data/pagination.js";
import { db } from "../../core/runtime.js";
import { json } from "../../core/http.js";
import {
  getPaymentPackages,
  getFeatureFlags,
  getGlobalAnnouncement,
} from "../../domain/settings.js";
export async function fetchAll(factory, size = 100, offset = 0) {
  const { data, error } = await factory().range(offset, offset + size - 1);
  if (error) throw error;
  return data || [];
}

export async function optional(
  factory,
  fallback = [],
  limit = 100,
  offset = 0,
) {
  try {
    return await fetchAll(factory, limit, offset);
  } catch (e) {
    console.warn("Optional admin source unavailable:", e?.message);
    if (!["42P01", "PGRST205"].includes(e?.code)) throw e;
    return fallback;
  }
}

export async function controlCenter(req, res, locale, admin) {
  const supabase = db(),
    section = String(req.query?.section || "overview");
  if (req.method === "GET") {
    if (section === "user") {
      const userId = String(req.query?.userId || "");
      const [u, c, p, conv, usage] = await Promise.all([
        supabase
          .from("users")
          .select(
            "id,pi_uid,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,last_login_at,created_at,updated_at",
          )
          .eq("id", userId)
          .maybeSingle(),
        supabase
          .from("admin_user_controls")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle(),
        supabase
          .from("payments")
          .select(
            "payment_id,txid,status,package_id,amount_pi,usd_amount,ai_tokens,created_at,completed_at",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(30),
        supabase
          .from("conversations")
          .select("id,title,model_id,created_at,updated_at")
          .eq("user_id", userId)
          .order("updated_at", { ascending: false })
          .limit(12),
        supabase.rpc("aiway_admin_user_usage", { p_user_id: userId }),
      ]);
      if (u.error) throw u.error;
      if (!u.data) return json(res, 404, { error: "المستخدم غير موجود" });
      if (c.error || p.error || conv.error || usage.error)
        throw c.error || p.error || conv.error || usage.error;
      return json(res, 200, {
        user: u.data,
        control: c.data || {
          account_status: "active",
          chat_blocked: false,
          payment_blocked: false,
        },
        payments: p.data || [],
        conversations: conv.data || [],
        usage: {
          ...usage.data,
          lastActivity:
            usage.data.lastActivity ||
            u.data.last_login_at ||
            u.data.created_at,
        },
      });
    }
    const { limit, offset } = pageOptions(req.query, 100);
    const migrationProbe = await supabase
      .from("admin_settings")
      .select("key")
      .limit(1);
    const migrationReady = !migrationProbe.error;
    const migrationError = migrationProbe.error
      ? String(
          migrationProbe.error.message ||
            migrationProbe.error.code ||
            "ADMIN_UPGRADE_REQUIRED",
        )
      : "";
    const [payments, controls, packages, audits, versions, settings, errors] =
      await Promise.all([
        optional(
          () =>
            supabase
              .from("payments")
              .select(
                "payment_id,txid,status,package_id,amount_pi,usd_amount,ai_tokens,user_id,created_at,completed_at",
              )
              .order("created_at", { ascending: false }),
          [],
          limit + 1,
          offset,
        ),
        optional(
          () =>
            supabase
              .from("admin_user_controls")
              .select("*")
              .order("updated_at", { ascending: false }),
          [],
          limit + 1,
          offset,
        ),
        getPaymentPackages({ includeInactive: true }),
        optional(
          () =>
            supabase
              .from("admin_audit_log")
              .select(
                "id,admin_user_id,action,target_type,target_id,reason,old_value,new_value,created_at",
              )
              .order("created_at", { ascending: false }),
          [],
          limit + 1,
          offset,
        ),
        optional(
          () =>
            supabase
              .from("ai_tool_versions")
              .select("id,tool_id,version_no,snapshot,created_at")
              .order("created_at", { ascending: false }),
          [],
          limit + 1,
          offset,
        ),
        Promise.all([getFeatureFlags(), getGlobalAnnouncement()]),
        optional(
          () =>
            supabase
              .from("ai_usage_reservations")
              .select(
                "id,user_id,kind,status,response_meta,created_at,updated_at",
              )
              .eq("status", "released")
              .order("created_at", { ascending: false }),
          [],
          limit + 1,
          offset,
        ),
      ]);
    return json(res, 200, {
      payments: payments.slice(0, limit),
      controls: controls.slice(0, limit),
      packages,
      featureFlags: settings[0],
      announcement: settings[1],
      audit: audits.slice(0, limit),
      versions: versions.slice(0, limit),
      errors: errors.slice(0, limit).map((r) => ({
        id: r.id,
        userId: r.user_id,
        endpoint: r.response_meta?.endpoint || r.kind || "unknown",
        code: r.response_meta?.code || "REQUEST_RELEASED",
        model: r.response_meta?.model || r.response_meta?.modelId || "",
        latency: r.response_meta?.latency_ms || r.response_meta?.latencyMs || 0,
        requestId: r.response_meta?.requestId || r.id,
        createdAt: r.created_at,
        meta: r.response_meta || {},
      })),
      migrationReady,
      migrationError,
      nextOffset: [payments, controls, audits, versions, errors].some(
        (rows) => rows.length > limit,
      )
        ? offset + limit
        : null,
    });
  }
  const b =
      typeof req.body === "string"
        ? JSON.parse(req.body || "{}")
        : req.body || {},
    action = String(b.action || "");
  if (action === "adjust-balance") {
    const userId = String(b.userId || ""),
      delta = Math.trunc(Number(b.delta || 0)),
      reason = String(b.reason || "").trim();
    if (!userId || !delta || !reason)
      return json(res, 400, { error: "المستخدم والمبلغ والسبب مطلوبون" });
    if (!Number.isSafeInteger(delta))
      return json(res, 400, { error: "INVALID_REQUEST" });
    const result = await supabase.rpc("aiway_adjust_balance", {
      p_admin_id: admin.id,
      p_user_id: userId,
      p_delta: delta,
      p_reason: reason,
      p_request_id: b.requestId || randomUUID(),
    });
    if (result.error) throw result.error;
    return json(res, 200, result.data);
  }
  if (action === "user-control") {
    const userId = String(b.userId || ""),
      reason = String(b.reason || "").trim();
    if (!userId || !reason) return json(res, 400, { error: "السبب مطلوب" });
    const old = await supabase
      .from("admin_user_controls")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();
    const row = {
      user_id: userId,
      account_status: b.accountStatus === "suspended" ? "suspended" : "active",
      chat_blocked: Boolean(b.chatBlocked),
      payment_blocked: Boolean(b.paymentBlocked),
      note: String(b.note || "").slice(0, 500),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    };
    const q = await supabase
      .from("admin_user_controls")
      .upsert(row, { onConflict: "user_id" });
    if (q.error) throw q.error;
    await audit(
      admin,
      "update_user_control",
      "user",
      userId,
      reason,
      old.data,
      row,
    );
    return json(res, 200, { ok: true, control: row });
  }
  if (action === "save-package") {
    const x = b.package || {},
      id = String(x.id || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "")
        .slice(0, 32),
      reason = String(b.reason || "").trim();
    if (!id || !reason || !(Number(x.usd) > 0) || !(Number(x.tokens) > 0))
      return json(res, 400, { error: "بيانات الباقة والسبب مطلوبة" });
    const old = await supabase
      .from("payment_packages")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    const row = {
      id,
      name_ar: String(x.name_ar || id).slice(0, 80),
      name_en: String(x.name_en || id).slice(0, 80),
      usd: Number(x.usd),
      tokens: Math.trunc(Number(x.tokens)),
      recommended_for: String(x.recommendedFor || "regular").slice(0, 40),
      popular: Boolean(x.popular),
      is_active: x.is_active !== false,
      sort_order: Math.trunc(Number(x.sort_order || 0)),
      updated_by: admin.id,
      updated_at: new Date().toISOString(),
    };
    const q = await supabase
      .from("payment_packages")
      .upsert(row, { onConflict: "id" });
    if (q.error) throw q.error;
    await audit(
      admin,
      "save_package",
      "payment_package",
      id,
      reason,
      old.data,
      row,
    );
    return json(res, 200, {
      ok: true,
      packages: await getPaymentPackages({ includeInactive: true }),
    });
  }
  if (action === "save-settings") {
    const key = String(b.key || ""),
      reason = String(b.reason || "").trim();
    if (!["feature_flags", "global_announcement"].includes(key) || !reason)
      return json(res, 400, { error: "الإعداد والسبب مطلوبان" });
    const old = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (
      old.error &&
      ["42P01", "PGRST205"].includes(String(old.error.code || ""))
    )
      return json(res, 409, {
        error:
          "شغّل supabase/migrations (راجع README.md) مرة واحدة في Supabase أولًا.",
        code: "ADMIN_UPGRADE_REQUIRED",
      });
    const value = b.value && typeof b.value === "object" ? b.value : {};
    const q = await supabase.from("admin_settings").upsert(
      {
        key,
        value,
        updated_by: admin.id,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );
    if (q.error) {
      if (
        ["42P01", "PGRST205"].includes(String(q.error.code || "")) ||
        /admin_settings/i.test(String(q.error.message || ""))
      )
        return json(res, 409, {
          error:
            "شغّل supabase/migrations (راجع README.md) مرة واحدة في Supabase أولًا.",
          code: "ADMIN_UPGRADE_REQUIRED",
        });
      throw q.error;
    }
    await audit(
      admin,
      "save_setting",
      "setting",
      key,
      reason,
      old.data?.value || null,
      value,
    );
    return json(res, 200, { ok: true, value });
  }
  if (action === "payment-recheck") {
    const paymentId = String(b.paymentId || "").trim(),
      reason = String(b.reason || "").trim() || "Admin payment recheck";
    if (!paymentId) return json(res, 400, { error: "paymentId مطلوب" });
    const stored = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .maybeSingle();
    if (stored.error || !stored.data)
      return json(res, 404, { error: "الدفعة غير موجودة" });
    if (!process.env.PI_SECRET_KEY)
      return json(res, 500, { error: "PI_SECRET_KEY غير مضبوط" });
    const owner = await supabase
      .from("users")
      .select("id,pi_uid")
      .eq("id", stored.data.user_id)
      .single();
    if (owner.error) throw owner.error;
    let remote = await piPayment(paymentId);
    validateApprovedPayment(stored.data, remote, owner.data);
    const txid = String(remote?.transaction?.txid || "").trim(),
      verified = Boolean(
        remote?.transaction?.verified || remote?.status?.transaction_verified,
      );
    if (
      stored.data.status !== "completed" &&
      txid &&
      verified &&
      !remote?.status?.cancelled &&
      !remote?.status?.user_cancelled
    ) {
      if (!remote?.status?.developer_completed)
        remote = await piPayment(paymentId, "complete", { txid });
      if (!remote?.status?.developer_completed)
        remote = await piPayment(paymentId);
      validateApprovedPayment(stored.data, remote, owner.data);
      if (
        !remote?.status?.developer_completed ||
        String(remote?.transaction?.txid || "").trim() !== txid
      )
        throw new Error("PAYMENT_PENDING");
      await completePurchase(supabase, owner.data, stored.data, txid, {
        admin_recheck: true,
        payment: remote,
      });
    }
    const latest = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId)
      .single();
    await audit(
      admin,
      "recheck_payment",
      "payment",
      paymentId,
      reason,
      stored.data,
      latest.data,
    );
    return json(res, 200, {
      ok: true,
      payment: latest.data,
      remoteStatus: remote?.status || {},
    });
  }
  return json(res, 400, { error: "إجراء إدارة غير معروف" });
}
