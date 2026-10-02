import { appError, cleanText, json, localize } from "../../core/http.js";
import { requireAdmin } from "../auth/service.js";

export async function handleAnnouncements(req, res, user, s, locale) {
  const mode = String(req.query?.mode || req.body?.mode || "");
  if (!["announcements", "admin_announcements"].includes(mode)) return false;
  const admin = mode === "admin_announcements";
  if (admin) await requireAdmin(user);
  if (req.method === "GET") {
    if (admin) {
      const { data, error } = await s
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw appError("DATABASE_ERROR", {}, error);
      return json(res, 200, { announcements: data || [] });
    }
    const now = new Date().toISOString();
    const { data: userProfile, error: userErr } = await s
      .from("users")
      .select("created_at,has_purchased")
      .eq("id", user.id)
      .single();
    if (userErr) throw appError("DATABASE_ERROR", {}, userErr);
    let hasPaid = Boolean(userProfile?.has_purchased);
    if (!hasPaid) {
      const pay = await s
        .from("payments")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .limit(1);
      if (pay.error) throw appError("DATABASE_ERROR", {}, pay.error);
      hasPaid = Boolean(pay.data?.length);
    }
    const { data: raw, error } = await s
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .lte("published_at", now)
      .or(`expires_at.is.null,expires_at.gt.${now}`)
      .order("published_at", { ascending: false })
      .limit(50);
    if (error) throw appError("DATABASE_ERROR", {}, error);
    const createdAt = userProfile?.created_at
      ? new Date(userProfile.created_at).getTime()
      : 0;
    const data = (raw || []).filter((item) => {
      const audience = item.audience || "all";
      if (audience === "paid") return hasPaid;
      if (audience === "new") {
        const days = Math.max(1, Number(item.new_user_days || 7));
        return createdAt && createdAt >= Date.now() - days * 86400000;
      }
      return true;
    });
    const ids = data.map((x) => x.id);
    let reads = [];
    if (ids.length) {
      const r = await s
        .from("announcement_reads")
        .select("announcement_id,read_at")
        .eq("user_id", user.id)
        .in("announcement_id", ids);
      if (r.error) throw appError("DATABASE_ERROR", {}, r.error);
      reads = r.data || [];
    }
    const map = new Map(reads.map((x) => [x.announcement_id, x.read_at]));
    const announcements = data.map((x) => ({
      ...x,
      read_at: map.get(x.id) || null,
    }));
    const unread = announcements.filter((x) => !x.read_at).length;
    return json(res, 200, { announcements, unread });
  }
  if (
    req.method === "POST" &&
    !admin &&
    String(req.body?.action || "") === "mark-read"
  ) {
    const ids = Array.isArray(req.body?.ids)
      ? req.body.ids
          .map((x) => String(x))
          .filter(Boolean)
          .slice(0, 50)
      : [];
    if (!ids.length) return json(res, 200, { marked: 0 });
    const now = new Date().toISOString();
    const rows = ids.map((id) => ({
      announcement_id: id,
      user_id: user.id,
      read_at: now,
    }));
    const r = await s
      .from("announcement_reads")
      .upsert(rows, { onConflict: "announcement_id,user_id" });
    if (r.error) throw appError("DATABASE_ERROR", {}, r.error);
    return json(res, 200, { marked: ids.length });
  }
  if (req.method === "POST" && admin) {
    const b = req.body || {},
      kind = ["system", "event", "update", "news"].includes(String(b.kind))
        ? String(b.kind)
        : "system",
      audience = ["all", "paid", "new"].includes(String(b.audience))
        ? String(b.audience)
        : "all",
      durationHours = Math.min(
        8760,
        Math.max(1, Number(b.durationHours || 24)),
      ),
      publishedAt = b.publishedAt || new Date().toISOString(),
      expiresAt =
        b.expiresAt ||
        new Date(
          new Date(publishedAt).getTime() + durationHours * 3600000,
        ).toISOString();
    const row = {
      kind,
      audience,
      new_user_days: Math.min(90, Math.max(1, Number(b.newUserDays || 7))),
      title_ar: cleanText(b.titleAr, 160),
      title_en: cleanText(b.titleEn, 160),
      body_ar: cleanText(b.bodyAr, 4000),
      body_en: cleanText(b.bodyEn, 4000),
      is_active: b.isActive !== false,
      published_at: publishedAt,
      expires_at: expiresAt,
      created_by: user.id,
    };
    if (!row.title_ar && !row.title_en)
      return json(res, 400, {
        error: localize(
          locale,
          "اكتب عنوان الإعلان.",
          "Enter an announcement title.",
        ),
        code: "INVALID_REQUEST",
      });
    if (!row.body_ar && !row.body_en)
      return json(res, 400, {
        error: localize(
          locale,
          "اكتب محتوى الإعلان.",
          "Enter announcement content.",
        ),
        code: "INVALID_REQUEST",
      });
    const { data, error } = await s
      .from("announcements")
      .insert(row)
      .select("*")
      .single();
    if (error) throw appError("DATABASE_ERROR", {}, error);
    return json(res, 201, { announcement: data });
  }
  if (req.method === "PATCH" && admin) {
    const id = String(req.body?.id || "");
    const { data, error } = await s
      .from("announcements")
      .update({ is_active: Boolean(req.body?.isActive) })
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw appError("DATABASE_ERROR", {}, error);
    return json(res, 200, { announcement: data });
  }
  return json(res, 405, {
    error: "Method not allowed",
    code: "METHOD_NOT_ALLOWED",
  });
}
