export function json(res, status, body) {
  res
    .status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8");
  if (!res.getHeader("Cache-Control"))
    res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  return res.end(JSON.stringify(body));
}

export function enforceJsonBodySize(req, maxBytes = 4_000_000) {
  const declared = Number(req?.headers?.["content-length"] || 0);
  const body = req?.body;
  const actual =
    body == null
      ? 0
      : Buffer.byteLength(
          typeof body === "string" ? body : JSON.stringify(body),
        );
  if (declared > maxBytes || actual > maxBytes)
    throw appError("PAYLOAD_TOO_LARGE");
}

export function safeHttpUrl(value, fallback = "") {
  try {
    const url = new URL(String(value || ""));
    if (url.protocol !== "https:" && url.protocol !== "http:") return fallback;
    return url.toString();
  } catch {
    return fallback;
  }
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const timeout = Math.max(1, Number(timeoutMs) || 15000);
  const timeoutController = new AbortController();
  const timer = setTimeout(
    () =>
      timeoutController.abort(
        new DOMException("Request timed out", "TimeoutError"),
      ),
    timeout,
  );
  const callerSignal = options?.signal;
  const signal = callerSignal
    ? typeof AbortSignal.any === "function"
      ? AbortSignal.any([callerSignal, timeoutController.signal])
      : timeoutController.signal
    : timeoutController.signal;

  let abortFromCaller;
  if (callerSignal && typeof AbortSignal.any !== "function") {
    abortFromCaller = () => timeoutController.abort(callerSignal.reason);
    if (callerSignal.aborted) abortFromCaller();
    else
      callerSignal.addEventListener("abort", abortFromCaller, { once: true });
  }

  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
    if (callerSignal && abortFromCaller)
      callerSignal.removeEventListener("abort", abortFromCaller);
  }
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader("Allow", methods.join(", "));
  const locale = requestLocale(req);
  json(res, 405, {
    error: localize(
      locale,
      "طريقة الطلب غير مسموح بها.",
      "This request method is not allowed.",
    ),
    code: "METHOD_NOT_ALLOWED",
  });
  return false;
}

export function cleanText(value, max = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export function requestLocale(req) {
  const value =
    req?.body?.locale ||
    req?.query?.locale ||
    req?.headers?.["x-ui-language"] ||
    req?.headers?.["accept-language"] ||
    "ar";
  return String(value).toLowerCase().startsWith("en") ? "en" : "ar";
}

export function localize(locale, ar, en) {
  return String(locale).toLowerCase().startsWith("en") ? en : ar;
}

export function appError(code, meta = {}, cause = null) {
  const error = new Error(String(code || "SERVER_ERROR"));
  error.code = String(code || "SERVER_ERROR");
  error.meta = meta && typeof meta === "object" ? meta : {};
  if (cause) error.cause = cause;
  return error;
}

export function requestIp(req) {
  return String(
    req?.headers?.["x-real-ip"] ||
      req?.headers?.["x-vercel-forwarded-for"] ||
      req?.headers?.["x-forwarded-for"] ||
      "unknown",
  )
    .split(",")[0]
    .trim()
    .slice(0, 80);
}

export async function enforceRateLimit(supabase, bucket, limit, windowSeconds) {
  const { data, error } = await supabase.rpc("check_api_rate_limit", {
    p_bucket: String(bucket).slice(0, 180),
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) throw appError("DATABASE_ERROR", {}, error);
  if (!data) throw appError("RATE_LIMITED");
}
