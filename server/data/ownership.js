import { appError } from "../core/http.js";

export async function ensureConversationOwner(
  supabase,
  conversationId,
  userId,
) {
  const { data, error } = await supabase
    .from("conversations")
    .select("id,user_id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw appError("DATABASE_ERROR", {}, error);
  if (!data) throw appError("FORBIDDEN");
  return data;
}

export function normalizeRequestId(value) {
  const id = String(value || "").trim();
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(id)) throw appError("INVALID_REQUEST");
  return id;
}
