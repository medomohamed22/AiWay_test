import { requestJson } from "./http.js";
import { fetchWithTimeout } from "../core/http.js";

export function openRouterHeaders(extra = {}) {
  return {
    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY || ""}`,
    "Content-Type": "application/json",
    ...extra,
  };
}
export async function openRouterJson(path, options = {}, timeoutMs = 15000) {
  return requestJson(
    "https://openrouter.ai/api/v1/" + path,
    { ...options, headers: openRouterHeaders(options.headers) },
    timeoutMs,
  );
}
export function streamChat(body, headers = {}) {
  return fetchWithTimeout(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: openRouterHeaders(headers),
      body: JSON.stringify(body),
    },
    240000,
  );
}
export function generateImage(body, headers = {}) {
  return openRouterJson(
    "images",
    { method: "POST", headers, body: JSON.stringify(body) },
    120000,
  );
}
export async function generationUsage(id) {
  const { response, data } = await openRouterJson(
    "generation?id=" + encodeURIComponent(id),
    {},
    12000,
  );
  if (!response.ok) return null;
  return data?.data || data;
}
