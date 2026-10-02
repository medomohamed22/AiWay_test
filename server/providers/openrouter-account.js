import { requestJson } from "./http.js";

const num = (v) => Number(v) || 0;
export async function gemini() {
  const apiKey = String(process.env.OPENROUTER_API_KEY || "").trim();
  const managementKey = String(
    process.env.OPENROUTER_MANAGEMENT_API_KEY || apiKey,
  ).trim();
  if (!apiKey)
    return {
      configured: false,
      status: "missing",
      credits: null,
      key: { label: "OpenRouter API" },
      modelsApi: false,
      billingNote: "أضف OPENROUTER_API_KEY في متغيرات البيئة.",
    };
  const headers = {
    Accept: "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const managementHeaders = {
    Accept: "application/json",
    Authorization: `Bearer ${managementKey}`,
  };
  const fetchJson = async (url, h) => {
    const { response: r, data: body } = await requestJson(
      url,
      { headers: h },
      10000,
    );
    if (!r.ok)
      throw new Error(body?.error?.message || `OpenRouter ${r.status}`);
    return body;
  };
  const [modelsResult, keyResult, creditsResult] = await Promise.allSettled([
    fetchJson("https://openrouter.ai/api/v1/models", headers),
    fetchJson("https://openrouter.ai/api/v1/key", headers),
    fetchJson("https://openrouter.ai/api/v1/credits", managementHeaders),
  ]);
  const modelsBody =
    modelsResult.status === "fulfilled" ? modelsResult.value : null;
  const keyData =
    keyResult.status === "fulfilled" ? keyResult.value?.data || {} : {};
  const creditsData =
    creditsResult.status === "fulfilled"
      ? creditsResult.value?.data || {}
      : null;
  const totalCredits = creditsData
    ? Math.max(0, num(creditsData.total_credits))
    : null;
  const totalUsage = creditsData
    ? Math.max(0, num(creditsData.total_usage))
    : Math.max(0, num(keyData.usage));
  const remaining =
    totalCredits == null
      ? keyData.limit_remaining == null
        ? null
        : Math.max(0, num(keyData.limit_remaining))
      : Math.max(0, totalCredits - totalUsage);
  const credits =
    remaining == null
      ? null
      : {
          remaining,
          totalCredits,
          totalUsage,
          source: creditsData ? "openrouter-credits-api" : "openrouter-key-api",
        };
  const errors = [modelsResult, keyResult, creditsResult]
    .filter((x) => x.status === "rejected")
    .map((x) => String(x.reason?.message || x.reason));
  return {
    configured: true,
    status:
      modelsBody || Object.keys(keyData).length || creditsData ? "ok" : "error",
    credits,
    key: {
      label: keyData.label || "OpenRouter API",
      limit: keyData.limit ?? null,
      limitRemaining: keyData.limit_remaining ?? null,
      limitReset: keyData.limit_reset ?? null,
      isFreeTier: Boolean(keyData.is_free_tier),
      usage: Math.max(0, num(keyData.usage)),
      usageDaily: Math.max(0, num(keyData.usage_daily)),
      usageWeekly: Math.max(0, num(keyData.usage_weekly)),
      usageMonthly: Math.max(0, num(keyData.usage_monthly)),
      byokUsage: Math.max(0, num(keyData.byok_usage)),
    },
    modelsApi: Boolean(modelsBody),
    availableModels: Array.isArray(modelsBody?.data)
      ? modelsBody.data.length
      : 0,
    creditsApi: Boolean(creditsData),
    accountType: "admin",
    errors,
    error: errors[0] || "",
    billingNote: creditsData
      ? "الرصيد والشحن والاستخدام مقروءة مباشرة من OpenRouter بعملة الدولار."
      : "أضف OPENROUTER_MANAGEMENT_API_KEY لقراءة إجمالي الشحن والرصيد؛ تم عرض بيانات مفتاح API المتاحة.",
  };
}
