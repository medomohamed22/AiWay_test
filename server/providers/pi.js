import { requestJson } from "./http.js";
import { appError } from "../core/http.js";
import { piApiError } from "../core/errors.js";

export async function piPayment(paymentId, action = "", body) {
  if (!process.env.PI_SECRET_KEY) throw appError("MISSING_CONFIGURATION");
  const base = (process.env.PI_API_BASE_URL || "https://api.minepi.com")
    .replace(/\/$/, "")
    .replace(/(?:\/v2)?$/, "/v2");
  const options = {
    method: action ? "POST" : "GET",
    headers: {
      Authorization: `Key ${process.env.PI_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
  };
  if (body !== undefined) options.body = JSON.stringify(body);
  const { response, data } = await requestJson(
    `${base}/payments/${encodeURIComponent(paymentId)}${action ? "/" + action : ""}`,
    options,
    20000,
  );
  if (!response.ok)
    throw piApiError(response.status, data, { operation: "payment" });
  return data;
}

export async function piIdentity(accessToken) {
  const base = (process.env.PI_API_BASE_URL || "https://api.minepi.com")
    .replace(/\/$/, "")
    .replace(/(?:\/v2)?$/, "/v2");
  const { response, data } = await requestJson(
    `${base}/me`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
    12000,
  );
  if (!response.ok)
    throw piApiError(response.status, data, { operation: "login" });
  return data;
}
