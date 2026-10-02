import { handleAnnouncements } from "./announcements.js";
import { handleSupport } from "./support.js";
import { pageOptions } from "../../data/pagination.js";
import { imageStorage } from "../../providers/storage.js";
import {
  allowMethods,
  appError,
  cleanText,
  json,
  localize,
  requestLocale,
} from "../../core/http.js";
import { createDownloadTicket, requireUser } from "../auth/service.js";
import { db } from "../../core/runtime.js";
import { handleError } from "../../core/errors.js";

export default async function handler(req, res) {
  if (!allowMethods(req, res, ["GET", "POST", "PATCH", "DELETE"])) return;
  const locale = requestLocale(req);
  try {
    const user = await requireUser(req),
      s = db();
    const announcementHandled = await handleAnnouncements(
      req,
      res,
      user,
      s,
      locale,
    );
    if (announcementHandled !== false) return announcementHandled;
    const supportHandled = await handleSupport(req, res, user, s, locale);
    if (supportHandled !== false) return supportHandled;

    if (req.method === "GET") {
      const id = String(req.query?.id || "");
      if (id) {
        const imagesOnly = String(req.query?.imagesOnly || "") === "1";
        const includeImages = String(req.query?.includeImages || "1") !== "0";

        if (imagesOnly) {
          const { data: images, error } = await s
            .from("generated_images")
            .select("*")
            .eq("conversation_id", id)
            .eq("user_id", user.id)
            .order("created_at", { ascending: true });
          if (error) throw appError("DATABASE_ERROR", {}, error);
          const hydrated = await Promise.all(
            (images || []).map(async (image) => {
              const output = { ...image };
              if (
                output.storage_path ||
                output.thumbnail_data ||
                output.source_url
              ) {
                const ticket = await createDownloadTicket(
                  { sub: user.id, imageId: output.id, kind: "image-view" },
                  "2h",
                );
                output.display_url = `/api/image?action=view&ticket=${encodeURIComponent(ticket)}`;
              }
              return output;
            }),
          );
          return json(res, 200, { images: hydrated });
        }

        const { data: conversation, error: conversationError } = await s
          .from("conversations")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();
        if (conversationError)
          throw appError("DATABASE_ERROR", {}, conversationError);

        const messageOffset = Math.max(
          0,
          Math.floor(Number(req.query?.messageOffset || 0)),
        );
        const PAGE_FETCH = 24,
          RESPONSE_BUDGET = 3_350_000;
        const { data: messageBatch, error: messagesError } = await s
          .from("messages")
          .select("*")
          .eq("conversation_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .order("id", { ascending: true })
          .range(messageOffset, messageOffset + PAGE_FETCH - 1);
        if (messagesError) throw appError("DATABASE_ERROR", {}, messagesError);
        const batch = messageBatch || [];
        let messages = [],
          responseBytes = 0;
        for (const message of batch) {
          const bytes = Buffer.byteLength(JSON.stringify(message), "utf8");
          if (messages.length && responseBytes + bytes > RESPONSE_BUDGET) break;
          messages.push(message);
          responseBytes += bytes;
        }
        const nextMessageOffset =
          messages.length < batch.length || batch.length === PAGE_FETCH
            ? messageOffset + messages.length
            : null;

        if (!includeImages) {
          conversation.messages = (messages || []).map((message) => ({
            ...message,
            generated_images: [],
          }));
          return json(res, 200, { conversation, nextMessageOffset });
        }

        const messageIds = (messages || []).map((message) => message.id);
        let images = [];
        if (messageIds.length) {
          const { data, error } = await s
            .from("generated_images")
            .select("*")
            .eq("conversation_id", id)
            .eq("user_id", user.id)
            .in("message_id", messageIds)
            .order("created_at", { ascending: true });
          if (error) throw appError("DATABASE_ERROR", {}, error);
          images = data || [];
        }

        const hydratedImages = await Promise.all(
          images.map(async (image) => {
            const output = { ...image };
            if (
              output.storage_path ||
              output.thumbnail_data ||
              output.source_url
            ) {
              const ticket = await createDownloadTicket(
                { sub: user.id, imageId: output.id, kind: "image-view" },
                "2h",
              );
              output.display_url = `/api/image?action=view&ticket=${encodeURIComponent(ticket)}`;
            }
            return output;
          }),
        );
        const imagesByMessage = new Map();
        for (const image of hydratedImages) {
          const list = imagesByMessage.get(image.message_id) || [];
          list.push(image);
          imagesByMessage.set(image.message_id, list);
        }

        conversation.messages = (messages || []).map((message) => ({
          ...message,
          generated_images: imagesByMessage.get(message.id) || [],
        }));
        return json(res, 200, { conversation, nextMessageOffset });
      }

      const { limit, offset } = pageOptions(req.query);
      const page = await s.rpc("aiway_conversation_page", {
        p_user_id: user.id,
        p_limit: limit,
        p_offset: offset,
      });
      if (page.error) throw appError("DATABASE_ERROR", {}, page.error);
      return json(res, 200, page.data);
    }

    if (req.method === "POST") {
      const { data, error } = await s
        .from("conversations")
        .insert({
          user_id: user.id,
          title: cleanText(req.body?.title || "New chat", 80),
          model_id: cleanText(req.body?.modelId, 120),
        })
        .select("*")
        .single();
      if (error) throw appError("DATABASE_ERROR", {}, error);
      return json(res, 201, { conversation: data });
    }

    const id = String(req.body?.id || req.query?.id || "");
    if (!id)
      return json(res, 400, {
        error: localize(
          locale,
          "معرّف المحادثة مطلوب.",
          "Conversation id is required.",
        ),
        code: "INVALID_REQUEST",
      });
    if (req.method === "PATCH") {
      const patch = {};
      if (req.body?.title !== undefined)
        patch.title = cleanText(req.body.title, 80);
      if (req.body?.modelId !== undefined)
        patch.model_id = cleanText(req.body.modelId, 120);
      const { data, error } = await s
        .from("conversations")
        .update(patch)
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();
      if (error) throw appError("DATABASE_ERROR", {}, error);
      return json(res, 200, { conversation: data });
    }

    // Delete any full-resolution files owned by this conversation before removing
    // the database rows. This prevents orphaned objects in Supabase Storage.
    const { data: imageRows, error: imageLookupError } = await s
      .from("generated_images")
      .select("storage_path")
      .eq("conversation_id", id)
      .eq("user_id", user.id)
      .not("storage_path", "is", null);
    if (imageLookupError)
      throw appError("DATABASE_ERROR", {}, imageLookupError);

    const storagePaths = [
      ...new Set(
        (imageRows || [])
          .map((row) => String(row.storage_path || "").trim())
          .filter(Boolean),
      ),
    ];

    // Supabase Storage accepts a list of paths. Chunking keeps large
    // conversations within request-size limits. If removal fails, keep the
    // conversation intact so the user can retry instead of leaving stale rows.
    for (let offset = 0; offset < storagePaths.length; offset += 100) {
      const batch = storagePaths.slice(offset, offset + 100);
      const { error: storageDeleteError } = await imageStorage(s).remove(batch);
      if (storageDeleteError)
        throw appError("DATABASE_ERROR", {}, storageDeleteError);
    }

    const { data: deletedRows, error } = await s
      .from("conversations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id");
    if (error) throw appError("DATABASE_ERROR", {}, error);
    if (!deletedRows?.length)
      return json(res, 404, {
        error: localize(
          locale,
          "المحادثة غير موجودة أو حُذفت بالفعل.",
          "The conversation was not found or was already deleted.",
        ),
        code: "FILE_NOT_FOUND",
      });
    return json(res, 200, {
      deleted: true,
      deletedImages: storagePaths.length,
    });
  } catch (e) {
    return handleError(
      e,
      res,
      localize(
        locale,
        "تعذر تنفيذ العملية على المحادثة. حاول مرة أخرى.",
        "Could not complete the conversation operation. Try again.",
      ),
      locale,
    );
  }
}
