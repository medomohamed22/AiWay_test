import { fetchWithTimeout } from "../core/http.js";

export function escapeTelegramHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function formatCairoDateTime(value = new Date()) {
  try {
    return new Intl.DateTimeFormat("ar-EG-u-nu-latn", {
      timeZone: "Africa/Cairo",
      dateStyle: "medium",
      timeStyle: "medium",
    }).format(new Date(value));
  } catch {
    return new Date(value).toISOString();
  }
}

export async function sendTelegramNotification(html) {
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();
  if (!botToken || !chatId) return { sent: false, skipped: true };
  try {
    const response = await fetchWithTimeout(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: String(html || "").slice(0, 3900),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
      10000,
    );
    if (!response.ok) {
      const payload = await response.text().catch(() => "");
      console.error(
        "[TELEGRAM_NOTIFICATION_FAILED]",
        response.status,
        payload.slice(0, 500),
      );
      return { sent: false, status: response.status };
    }
    return { sent: true };
  } catch (error) {
    console.error("[TELEGRAM_NOTIFICATION_FAILED]", error?.message || error);
    return { sent: false };
  }
}

export function telegramHtml(value) {
  return escapeTelegramHtml(value);
}
