import { fetchWithTimeout, appError } from "../core/http.js";

export let piPriceCache = {
  price: 0,
  expires: 0,
  quotedAt: null,
  source: null,
};

export function validPiPrice(value) {
  const price = Number(value);
  return Number.isFinite(price) && price > 0.01 && price < 100 ? price : 0;
}

export async function fetchPiPriceSource(source) {
  const headers = { Accept: "application/json", "User-Agent": "AiWay/1.0" };
  if (source === "OKX") {
    const response = await fetchWithTimeout(
      "https://www.okx.com/api/v5/market/ticker?instId=PI-USDT",
      { headers },
      4500,
    );
    if (!response.ok) throw new Error(`OKX ${response.status}`);
    const payload = await response.json();
    if (String(payload?.code || "0") !== "0")
      throw new Error(String(payload?.msg || "OKX ticker failed"));
    const ticker = payload?.data?.[0] || {};
    const last = validPiPrice(ticker.last),
      bid = validPiPrice(ticker.bidPx),
      ask = validPiPrice(ticker.askPx);
    const price = last || (bid && ask ? (bid + ask) / 2 : 0);
    if (!price) throw new Error("Invalid OKX PI price");
    return { price, source: "OKX PI-USDT spot ticker" };
  }
  if (source === "Gate.io") {
    const response = await fetchWithTimeout(
      "https://api.gateio.ws/api/v4/spot/tickers?currency_pair=PI_USDT",
      { headers },
      4500,
    );
    if (!response.ok) throw new Error(`Gate.io ${response.status}`);
    const payload = await response.json();
    const ticker = Array.isArray(payload) ? payload[0] : payload || {};
    const last = validPiPrice(ticker.last),
      bid = validPiPrice(ticker.highest_bid),
      ask = validPiPrice(ticker.lowest_ask);
    const price = last || (bid && ask ? (bid + ask) / 2 : 0);
    if (!price) throw new Error("Invalid Gate.io PI price");
    return { price, source: "Gate.io PI_USDT spot ticker" };
  }
  const response = await fetchWithTimeout(
    "https://api.mexc.com/api/v3/ticker/price?symbol=PIUSDT",
    { headers },
    4500,
  );
  if (!response.ok) throw new Error(`MEXC ${response.status}`);
  const payload = await response.json();
  const price = validPiPrice(payload?.price);
  if (!price) throw new Error("Invalid MEXC PI price");
  return { price, source: "MEXC PIUSDT spot ticker" };
}

export async function getPiUsd() {
  if (piPriceCache.price > 0 && Date.now() < piPriceCache.expires)
    return piPriceCache.price;
  const attempts = ["OKX", "Gate.io", "MEXC"].map((source) =>
    fetchPiPriceSource(source),
  );
  let quote;
  try {
    quote = await Promise.any(attempts);
  } catch (error) {
    console.warn(
      "All Pi price providers failed",
      error?.errors?.map?.((e) => e?.message) || error?.message || error,
    );
    throw appError("OKX_PRICE_UNAVAILABLE", {
      internalMessage: "All configured Pi price providers are unavailable",
    });
  }
  piPriceCache = {
    price: quote.price,
    source: quote.source,
    expires: Date.now() + 60_000,
    quotedAt: new Date().toISOString(),
  };
  return quote.price;
}
