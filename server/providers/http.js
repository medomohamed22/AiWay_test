import { appError } from "../core/http.js";

// Keep the deadline active through body consumption, not just response headers.
export async function requestJson(url, options = {}, timeoutMs = 15000) {
  const deadline = AbortSignal.timeout(timeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, deadline])
    : deadline;
  try {
    const response = await fetch(url, { ...options, signal });
    const data = await response.json();
    return { response, data };
  } catch (cause) {
    if (deadline.aborted) throw appError("PROVIDER_TIMEOUT", {}, cause);
    if (cause instanceof SyntaxError)
      throw appError("PROVIDER_INVALID_RESPONSE", {}, cause);
    throw appError("PROVIDER_NETWORK_ERROR", {}, cause);
  }
}
