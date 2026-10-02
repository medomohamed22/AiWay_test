import { appError } from "../core/http.js";

export async function claimFreeDailyUse(supabase, userId, kind = "chat") {
  const limit = 30;
  const { data, error } = await supabase.rpc("claim_free_model_request", {
    p_user_id: userId,
    p_kind: kind,
    p_daily_limit: limit,
  });
  if (error) {
    if (
      String(error.message || "")
        .toLowerCase()
        .includes("daily free limit")
    )
      throw appError("FREE_DAILY_LIMIT", {
        freeDailyLimit: limit,
        freeRequestKind: kind,
      });
    throw appError("DATABASE_ERROR", {}, error);
  }
  return data || {};
}

export async function reserveAiTokens(
  supabase,
  userId,
  requestId,
  kind,
  amount,
) {
  const { data, error } = await supabase.rpc("reserve_ai_tokens", {
    p_user_id: userId,
    p_request_id: requestId,
    p_kind: kind,
    p_amount: Math.max(1, Math.ceil(Number(amount) || 1)),
  });
  if (error) {
    const m = String(error.message || "").toLowerCase();
    if (m.includes("already in progress"))
      throw appError("REQUEST_IN_PROGRESS");
    if (m.includes("insufficient"))
      throw appError("INSUFFICIENT_TOKENS_FOR_REQUEST");
    if (m.includes("trial ended")) throw appError("TRIAL_ENDED");
    throw appError("DATABASE_ERROR", {}, error);
  }
  if (data?.status === "completed" || data?.status === "released")
    throw appError("REQUEST_ALREADY_PROCESSED");
  return data || {};
}

export async function finalizeAiTokens(
  supabase,
  userId,
  requestId,
  actual,
  meta = {},
) {
  const { data, error } = await supabase.rpc("finalize_ai_tokens", {
    p_user_id: userId,
    p_request_id: requestId,
    p_actual: Math.max(1, Math.ceil(Number(actual) || 1)),
    p_meta: meta,
  });
  if (error) throw appError("DATABASE_ERROR", {}, error);
  return Math.max(0, Number(data || 0));
}

export async function releaseAiTokens(supabase, userId, requestId, meta = {}) {
  if (!requestId) return;
  const { error } = await supabase.rpc("release_ai_tokens", {
    p_user_id: userId,
    p_request_id: requestId,
    p_meta: meta,
  });
  if (error) console.error("Token reservation release failed:", error.message);
}

export async function claimFreeTrialToken(supabase, userId, requestId, toolId) {
  const { data, error } = await supabase.rpc("claim_aiway_free_trial_token", {
    p_user_id: userId,
    p_request_id: requestId,
    p_tool_id: String(toolId || "").slice(0, 40),
  });
  if (error) {
    const message = String(error.message || "").toLowerCase();
    if (message.includes("trial tool locked")) throw appError("MODEL_LOCKED");
    if (message.includes("trial ended")) throw appError("TRIAL_ENDED");
    if (message.includes("already purchased"))
      throw appError("INVALID_REQUEST");
    throw appError("DATABASE_ERROR", {}, error);
  }
  return data || {};
}

export async function releaseFreeTrialToken(supabase, userId, requestId) {
  if (!requestId) return;
  const { error } = await supabase.rpc("release_aiway_free_trial_token", {
    p_user_id: userId,
    p_request_id: requestId,
  });
  if (error) console.error("Free trial token release failed:", error.message);
}
