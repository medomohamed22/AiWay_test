import accountHandler from "../account/handler.js";
import interactionsHandler from "./interactions.js";
import {
  allowMethods,
  appError,
  json,
  localize,
  requestLocale,
  safeHttpUrl,
} from "../../core/http.js";
import { db } from "../../core/runtime.js";
import { errorDetails, handleError } from "../../core/errors.js";

const APP_FIELDS =
  "id,name,slug,category,network,short_description,website_url,icon_url,screenshot_urls,rating,ratings_count,views_count,get_clicks_count,is_verified,is_featured,featured_until,developer_name,created_at";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST"])) return;
  const locale = requestLocale(req);
  try {
    const route = String(req.query?.route || "");
    if (route === "me") return accountHandler(req, res);
    if (route === "interactions") return interactionsHandler(req, res);

    if (String(req.query?.mode || "") === "version") {
      const version =
        process.env.VERCEL_GIT_COMMIT_SHA ||
        process.env.VERCEL_DEPLOYMENT_ID ||
        process.env.APP_VERSION ||
        "local-development";
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );
      return json(res, 200, { version });
    }
    const supabase = db();
    const now = new Date().toISOString();
    const params = req.query || {};
    const enhanced = Boolean(
      params.id ||
        params.q ||
        params.network ||
        params.category ||
        params.sort ||
        params.limit ||
        params.cursor,
    );
    let query = supabase
      .from("apps")
      .select(APP_FIELDS, enhanced ? { count: "exact" } : undefined)
      .eq("status", "published");

    if (params.id) query = query.eq("id", params.id).limit(1);
    if (
      params.network &&
      ["mainnet", "testnet"].includes(String(params.network))
    )
      query = query.eq("network", params.network);
    if (params.category && params.category !== "All")
      query = query.eq("category", String(params.category).slice(0, 50));
    if (params.q) {
      const q = String(params.q)
        .trim()
        .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
        .replace(/\s+/g, " ")
        .slice(0, 80);
      if (q)
        query = query.or(
          `name.ilike.%${q}%,short_description.ilike.%${q}%,category.ilike.%${q}%`,
        );
    }
    let offset = 0;
    if (params.cursor) {
      if (String(params.cursor).startsWith("page:")) {
        offset = Number(String(params.cursor).slice(5));
        if (!Number.isInteger(offset) || offset < 0 || offset > 1000000)
          throw appError("INVALID_REQUEST");
      } else query = query.lt("created_at", params.cursor); // Accept legacy timestamp cursors.
    }

    query = query
      .order("is_featured", { ascending: false })
      .order("featured_until", { ascending: false, nullsFirst: false });
    const sort = String(params.sort || "newest");
    if (sort === "rating")
      query = query
        .order("rating", { ascending: false })
        .order("ratings_count", { ascending: false });
    else if (sort === "views")
      query = query.order("views_count", { ascending: false });
    else if (sort === "clicks")
      query = query.order("get_clicks_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const limit = enhanced
      ? Math.min(Math.max(Number(params.limit) || 20, 1), 50)
      : null;
    query = query.order("id", { ascending: false });
    if (limit) query = query.range(offset, offset + limit);
    const { data, error, count } = await query;
    if (error) throw error;

    res.setHeader(
      "Cache-Control",
      enhanced
        ? "s-maxage=45, stale-while-revalidate=240"
        : "s-maxage=60, stale-while-revalidate=300",
    );
    const apps = (limit ? (data || []).slice(0, limit) : data || []).map(
      (app) => ({
        ...app,
        website_url: safeHttpUrl(app.website_url),
        icon_url: safeHttpUrl(app.icon_url),
        screenshot_urls: Array.isArray(app.screenshot_urls)
          ? app.screenshot_urls.map((url) => safeHttpUrl(url)).filter(Boolean)
          : [],
        is_featured: Boolean(
          app.is_featured && (!app.featured_until || app.featured_until > now),
        ),
      }),
    );
    if (!enhanced) return json(res, 200, { apps });
    if (params.id) return json(res, 200, { app: apps[0] || null });
    return json(res, 200, {
      apps,
      total: count ?? apps.length,
      nextCursor:
        (data || []).length > limit ? "page:" + (offset + limit) : null,
    });
  } catch (error) {
    console.error(error);
    const route = String(req.query?.route || "");
    if (route === "me" || route === "interactions")
      return handleError(
        error,
        res,
        localize(
          locale,
          "تعذر تنفيذ الطلب.",
          "Could not complete the request.",
        ),
        locale,
      );
    if (String(req.query?.mode || "") === "live-token") {
      const details = errorDetails(error, locale);
      return json(res, details.status || 500, {
        error: details.message,
        code: details.code,
        ...(details.meta || {}),
      });
    }
    return json(res, 500, {
      error: localize(
        locale,
        "تعذر تحميل التطبيقات حاليًا.",
        "Could not load the apps right now.",
      ),
      code: "SERVER_ERROR",
    });
  }
}
