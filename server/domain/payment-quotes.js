import {
  requireEnv,
  JWT_ISSUER,
  PAYMENT_QUOTE_AUDIENCE,
  jwtSecret,
} from "../core/runtime.js";
import { SignJWT, jwtVerify } from "jose";
import { randomBytes } from "node:crypto";
import { appError } from "../core/http.js";
import { getPaymentPackage } from "./settings.js";
import { getPiUsd, piPriceCache } from "../providers/pi-price.js";
import { PI_PRICE_BUFFER } from "./credits.js";

export async function signPaymentQuote(payload) {
  requireEnv();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuer(JWT_ISSUER)
    .setAudience(PAYMENT_QUOTE_AUDIENCE)
    .setJti(randomBytes(12).toString("hex"))
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function verifyPaymentQuote(token) {
  requireEnv();
  const value = String(token || "").trim();
  if (!value) throw appError("PAYMENT_INVALID");
  try {
    const { payload } = await jwtVerify(
      value,
      new TextEncoder().encode(jwtSecret),
      {
        issuer: JWT_ISSUER,
        audience: PAYMENT_QUOTE_AUDIENCE,
        algorithms: ["HS256"],
      },
    );
    const packageId = String(payload.packageId || "");
    const pack = await getPaymentPackage(packageId, { includeInactive: true });
    const amountPi = Number(payload.amountPi);
    const usd = Number(payload.usd);
    const tokens = Number(payload.tokens);
    if (
      !pack ||
      !Number.isFinite(amountPi) ||
      amountPi <= 0 ||
      usd !== Number(pack.usd) ||
      tokens !== Number(pack.tokens)
    ) {
      throw appError("PAYMENT_MISMATCH");
    }
    return {
      packageId,
      amountPi,
      usd,
      tokens,
      piUsd: Number(payload.piUsd || 0),
      jti: String(payload.jti || ""),
    };
  } catch (error) {
    if (error?.code === "PAYMENT_MISMATCH") throw error;
    throw appError("PAYMENT_INVALID");
  }
}

export async function packageQuote(id) {
  const pack = await getPaymentPackage(id);
  if (!pack) return null;
  const piUsd = await getPiUsd();
  const baseAmountPi = pack.usd / piUsd;
  const amountPi = Number((baseAmountPi * (1 + PI_PRICE_BUFFER)).toFixed(7));
  const quotedAt = new Date().toISOString();
  const quoteExpiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
  const quoteToken = await signPaymentQuote({
    packageId: id,
    amountPi,
    usd: pack.usd,
    tokens: pack.tokens,
    piUsd: Number(piUsd.toFixed(8)),
  });
  return {
    ...pack,
    piUsd,
    baseAmountPi: Number(baseAmountPi.toFixed(7)),
    priceBufferPercent: PI_PRICE_BUFFER * 100,
    amountPi,
    quotedAt,
    quoteExpiresAt,
    quoteToken,
    pricingSource: piPriceCache.source || "Pi spot market fallback",
  };
}
