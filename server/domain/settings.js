import { db } from "../core/runtime.js";
import { appError } from "../core/http.js";
import { tokensForUsd } from "./credits.js";

export const DEFAULT_FEATURE_FLAGS = Object.freeze({
  maintenance: false,
  login: true,
  payments: true,
  images: true,
  chat: true,
});

export async function getAdminSetting(key, fallback = null) {
  const { data, error } = await db()
    .from("admin_settings")
    .select("value")
    .eq("key", String(key))
    .maybeSingle();
  if (error && !["42P01", "PGRST205"].includes(error.code))
    throw appError("DATABASE_ERROR", {}, error);
  return data?.value ?? fallback;
}

export async function getFeatureFlags() {
  const value = await getAdminSetting("feature_flags", {});
  return {
    ...DEFAULT_FEATURE_FLAGS,
    ...(value && typeof value === "object" && !Array.isArray(value)
      ? value
      : {}),
  };
}

export async function assertFeatureEnabled(
  feature,
  { allowDuringMaintenance = false, user = null } = {},
) {
  const flags = await getFeatureFlags();
  // Admins must always retain a recovery path into the control center. Feature flags
  // are for public/user-facing availability and must never lock an admin out.
  if (user?.role === "admin") return flags;
  if (flags.maintenance && !allowDuringMaintenance)
    throw appError("MAINTENANCE_MODE");
  if (feature && flags[feature] === false)
    throw appError("FEATURE_DISABLED", { feature });
  return flags;
}

export async function getUserAdminControl(userId) {
  const { data, error } = await db()
    .from("admin_user_controls")
    .select(
      "user_id,account_status,chat_blocked,payment_blocked,note,updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();
  if (error && !["42P01", "PGRST205"].includes(error.code))
    throw appError("DATABASE_ERROR", {}, error);
  return (
    data || {
      account_status: "active",
      chat_blocked: false,
      payment_blocked: false,
    }
  );
}

export async function assertUserCapability(userId, capability, userRole = "") {
  // Never let account/chat/payment controls lock an administrator out of recovery.
  if (String(userRole || "").toLowerCase() === "admin")
    return {
      account_status: "active",
      chat_blocked: false,
      payment_blocked: false,
      adminBypass: true,
    };
  const control = await getUserAdminControl(userId);
  if (control.account_status === "suspended")
    throw appError("ACCOUNT_SUSPENDED");
  if (capability === "chat" && control.chat_blocked)
    throw appError("CHAT_BLOCKED");
  if (capability === "payment" && control.payment_blocked)
    throw appError("PAYMENT_BLOCKED");
  return control;
}

export async function getPaymentPackages({ includeInactive = false } = {}) {
  let query = db()
    .from("payment_packages")
    .select(
      "id,name_ar,name_en,usd,tokens,recommended_for,popular,is_active,sort_order,updated_at",
    )
    .order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("is_active", true);
  const { data, error } = await query;
  if (error) {
    if (["42P01", "PGRST205"].includes(error.code))
      return Object.fromEntries(
        Object.entries(PACKAGES).map(([id, p]) => [
          id,
          { ...p, is_active: true, sort_order: 0 },
        ]),
      );
    throw appError("DATABASE_ERROR", {}, error);
  }
  return Object.fromEntries(
    (data || []).map((row) => [
      row.id,
      {
        name_ar: row.name_ar,
        name_en: row.name_en,
        usd: Number(row.usd),
        tokens: Number(row.tokens),
        recommendedFor: row.recommended_for,
        popular: Boolean(row.popular),
        is_active: Boolean(row.is_active),
        sort_order: Number(row.sort_order || 0),
      },
    ]),
  );
}

export async function getPaymentPackage(id, { includeInactive = false } = {}) {
  const packages = await getPaymentPackages({ includeInactive });
  return packages[String(id)] || null;
}

export async function getGlobalAnnouncement() {
  const value = await getAdminSetting("global_announcement", {
    enabled: false,
    text_ar: "",
    text_en: "",
    level: "info",
  });
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : { enabled: false, text_ar: "", text_en: "", level: "info" };
}

export const PACKAGES = {
  lite: {
    name_ar: "لايت",
    name_en: "Lite",
    usd: 2,
    tokens: tokensForUsd(2),
    recommendedFor: "light",
  },
  starter: {
    name_ar: "ستارتر",
    name_en: "Starter",
    usd: 5,
    tokens: tokensForUsd(5),
    recommendedFor: "regular",
  },
  plus: {
    name_ar: "بلس",
    name_en: "Plus",
    usd: 10,
    tokens: tokensForUsd(10),
    recommendedFor: "advanced",
    popular: true,
  },
  pro: {
    name_ar: "برو",
    name_en: "Pro",
    usd: 20,
    tokens: tokensForUsd(20),
    recommendedFor: "power",
  },
};
