import { maybeRefreshToken } from "../../features/auth/service.js";
import {
  allowMethods,
  appError,
  json,
  localize,
  requestLocale,
} from "../../core/http.js";
import { db } from "../../core/runtime.js";
import { handleError } from "../../core/errors.js";
import { requireUser } from "../auth/service.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET"])) return;
  const locale = requestLocale(req);
  try {
    const user = await requireUser(req);
    const supabase = db();
    const expired = await supabase.rpc("expire_paid_tokens", {
      p_user_id: user.id,
    });
    if (expired.error) throw appError("DATABASE_ERROR", {}, expired.error);
    const { data, error } = await supabase
      .from("users")
      .select(
        "id,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,created_at",
      )
      .eq("id", user.id)
      .single();
    if (error || !data) throw appError("DATABASE_ERROR", {}, error);

    const summary = await supabase.rpc("aiway_user_usage", {
      p_user_id: user.id,
      p_days: 30,
    });
    if (summary.error) throw appError("DATABASE_ERROR", {}, summary.error);
    const usageSummary = summary.data;
    const refreshedToken = await maybeRefreshToken(req, user);
    return json(res, 200, {
      user: data,
      usageSummary,
      ...(refreshedToken ? { refreshedToken } : {}),
    });
  } catch (error) {
    return handleError(
      error,
      res,
      localize(
        locale,
        "تعذر تحميل بيانات الحساب.",
        "Could not load the account details.",
      ),
      locale,
    );
  }
}
