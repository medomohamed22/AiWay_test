import { pageOptions } from "../../data/pagination.js";

import {
  appError,
  cleanText,
  json,
  localize,
  requestIp,
  enforceRateLimit,
} from "../../core/http.js";
import { requireAdmin } from "../auth/service.js";
import {
  sendTelegramNotification,
  telegramHtml,
  formatCairoDateTime,
} from "../../providers/notifications.js";

export async function handleSupport(req, res, user, s, locale) {
  const mode = String(req.query?.mode || req.body?.mode || "");
  if (!["support", "admin_support"].includes(mode)) return false;
  const isAdminMode = mode === "admin_support";
  if (isAdminMode) await requireAdmin(user);

  if (req.method === "GET") {
    if (isAdminMode) {
      const threadId = String(req.query?.threadId || "");
      if (threadId) {
        const { data: thread, error: tErr } = await s
          .from("support_threads")
          .select("id,user_id,username,status,created_at,updated_at")
          .eq("id", threadId)
          .single();
        if (tErr) throw appError("DATABASE_ERROR", {}, tErr);
        const { data: messages, error: mErr } = await s
          .from("support_messages")
          .select("id,sender_role,message,created_at,read_at")
          .eq("thread_id", threadId)
          .order("created_at", { ascending: true })
          .order("id", { ascending: true })
          .range(
            pageOptions(req.query, 100).offset,
            pageOptions(req.query, 100).offset +
              pageOptions(req.query, 100).limit,
          );
        if (mErr) throw appError("DATABASE_ERROR", {}, mErr);
        return json(res, 200, {
          thread,
          messages: (messages || []).slice(
            0,
            pageOptions(req.query, 100).limit,
          ),
          nextOffset:
            (messages || []).length > pageOptions(req.query, 100).limit
              ? pageOptions(req.query, 100).offset +
                pageOptions(req.query, 100).limit
              : null,
        });
      }
      const { limit, offset } = pageOptions(req.query);
      const page = await s.rpc("aiway_support_threads", {
        p_limit: limit,
        p_offset: offset,
      });
      if (page.error) throw appError("DATABASE_ERROR", {}, page.error);
      return json(res, 200, page.data);
    }
    const { data: thread, error: tErr } = await s
      .from("support_threads")
      .select("id,user_id,username,status,created_at,updated_at")
      .eq("user_id", user.id)
      .maybeSingle();
    if (tErr) throw appError("DATABASE_ERROR", {}, tErr);
    if (!thread)
      return json(res, 200, { thread: null, messages: [], unread: 0 });
    const { data: messages, error: mErr } = await s
      .from("support_messages")
      .select("id,sender_role,message,created_at,read_at")
      .eq("thread_id", thread.id)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(
        pageOptions(req.query, 100).offset,
        pageOptions(req.query, 100).offset + pageOptions(req.query, 100).limit,
      );
    if (mErr) throw appError("DATABASE_ERROR", {}, mErr);
    const unread = (messages || [])
      .slice(0, pageOptions(req.query, 100).limit)
      .filter((m) => m.sender_role === "admin" && !m.read_at).length;
    return json(res, 200, {
      thread,
      messages: (messages || []).slice(0, pageOptions(req.query, 100).limit),
      unread,
      nextOffset:
        (messages || []).length > pageOptions(req.query, 100).limit
          ? pageOptions(req.query, 100).offset +
            pageOptions(req.query, 100).limit
          : null,
    });
  }

  if (req.method === "POST") {
    await enforceRateLimit(s, `support:${user.id}:${requestIp(req)}`, 30, 60);
    const action = String(req.body?.action || "message");
    if (action === "mark-read") {
      if (isAdminMode) {
        const threadId = String(req.body?.threadId || "");
        if (!threadId)
          return json(res, 400, {
            error: localize(
              locale,
              "محادثة الدعم مطلوبة.",
              "Support thread is required.",
            ),
            code: "INVALID_REQUEST",
          });
        const { error } = await s
          .from("support_messages")
          .update({ read_at: new Date().toISOString() })
          .eq("thread_id", threadId)
          .eq("sender_role", "user")
          .is("read_at", null);
        if (error) throw appError("DATABASE_ERROR", {}, error);
      } else {
        const { data: thread, error: tErr } = await s
          .from("support_threads")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();
        if (tErr) throw appError("DATABASE_ERROR", {}, tErr);
        if (thread) {
          const { error } = await s
            .from("support_messages")
            .update({ read_at: new Date().toISOString() })
            .eq("thread_id", thread.id)
            .eq("sender_role", "admin")
            .is("read_at", null);
          if (error) throw appError("DATABASE_ERROR", {}, error);
        }
      }
      return json(res, 200, { marked: true });
    }
    const message = cleanText(req.body?.message, 2000);
    if (!message)
      return json(res, 400, {
        error: localize(
          locale,
          "اكتب رسالة الدعم أولًا.",
          "Write a support message first.",
        ),
        code: "INVALID_REQUEST",
      });
    if (isAdminMode) {
      const threadId = String(req.body?.threadId || "");
      if (!threadId)
        return json(res, 400, {
          error: localize(
            locale,
            "محادثة الدعم مطلوبة.",
            "Support thread is required.",
          ),
          code: "INVALID_REQUEST",
        });
      const { data: thread, error: tErr } = await s
        .from("support_threads")
        .select("id")
        .eq("id", threadId)
        .single();
      if (tErr) throw appError("DATABASE_ERROR", {}, tErr);
      const { data, error } = await s
        .from("support_messages")
        .insert({
          thread_id: thread.id,
          sender_role: "admin",
          sender_id: user.id,
          message,
        })
        .select("*")
        .single();
      if (error) throw appError("DATABASE_ERROR", {}, error);
      await s
        .from("support_threads")
        .update({ status: "open", updated_at: new Date().toISOString() })
        .eq("id", thread.id);
      return json(res, 201, { message: data });
    }
    let { data: thread, error: tErr } = await s
      .from("support_threads")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (tErr) throw appError("DATABASE_ERROR", {}, tErr);
    if (!thread) {
      const { data, error } = await s
        .from("support_threads")
        .insert({ user_id: user.id, username: user.username || "Pi User" })
        .select("id")
        .single();
      if (error) throw appError("DATABASE_ERROR", {}, error);
      thread = data;
    }
    const { data, error } = await s
      .from("support_messages")
      .insert({
        thread_id: thread.id,
        sender_role: "user",
        sender_id: user.id,
        message,
      })
      .select("*")
      .single();
    if (error) throw appError("DATABASE_ERROR", {}, error);
    await s
      .from("support_threads")
      .update({ status: "open", updated_at: new Date().toISOString() })
      .eq("id", thread.id);
    await sendTelegramNotification(
      `📩 <b>رسالة دعم جديدة</b>\n\n` +
        `👤 <b>اسم المستخدم:</b> ${telegramHtml(user.username || "مستخدم Pi")}\n` +
        `🆔 <b>معرّف المستخدم:</b> <code>${telegramHtml(user.id)}</code>\n` +
        `🕒 <b>الوقت:</b> ${telegramHtml(formatCairoDateTime(data.created_at))}\n\n` +
        `💬 <b>محتوى الرسالة:</b>\n${telegramHtml(message)}`,
    );
    return json(res, 201, { message: data });
  }
  return json(res, 405, {
    error: "Method not allowed",
    code: "METHOD_NOT_ALLOWED",
  });
}
