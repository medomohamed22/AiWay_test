import { modelSettings } from "./model-settings.js";

import { gemini } from "../../providers/openrouter-account.js";
import { controlCenter } from "./control-center.js";

import { loadAnalytics } from "./analytics.js";

import { pageOptions } from "../../data/pagination.js";
import {
  allowMethods,
  json,
  localize,
  requestLocale,
} from "../../core/http.js";
import { db } from "../../core/runtime.js";
import { handleError } from "../../core/errors.js";
import { requireUser, requireAdmin } from "../auth/service.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  const locale = requestLocale(req);
  try {
    const mode = String(req.query?.mode || "");
    if (mode === "users") {
      const adminUser = await requireUser(req);
      await requireAdmin(adminUser);
      if (req.method !== "GET")
        return json(res, 405, { error: "METHOD_NOT_ALLOWED" });
      const { limit, offset } = pageOptions(req.query);
      const page = await db().rpc("aiway_admin_users", {
        p_limit: limit,
        p_offset: offset,
        p_search: String(req.query?.search || "").slice(0, 100),
      });
      if (page.error) throw page.error;
      return json(res, 200, page.data);
    }
    if (mode === "control-center") {
      const adminUser = await requireUser(req);
      await requireAdmin(adminUser);
      return await controlCenter(req, res, locale, adminUser);
    }
    if (mode === "model-settings") return await modelSettings(req, res, locale);
    if (req.method !== "GET")
      return json(res, 405, {
        error: localize(
          locale,
          "طريقة الطلب غير مسموحة.",
          "Method not allowed.",
        ),
      });
    const admin = await requireUser(req);
    await requireAdmin(admin);
    const s = db();
    const expirySweep = await s.rpc("expire_all_paid_tokens");
    if (expirySweep.error) throw expirySweep.error;
    return json(res, 200, await loadAnalytics(s, req.query, await gemini()));
  } catch (error) {
    return handleError(
      error,
      res,
      localize(
        locale,
        "تعذر تحميل إحصاءات الإدارة.",
        "Could not load admin analytics.",
      ),
      locale,
    );
  }
}
