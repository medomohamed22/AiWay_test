import { getOpenRouterImageModelEndpoints } from "../providers/openrouter-catalog.js";

export function parseAspectRatio(value = "1:1") {
  const match = String(value || "1:1").match(
    /(\d+(?:\.\d+)?)\s*[:xX/]\s*(\d+(?:\.\d+)?)/,
  );
  const w = Number(match?.[1] || 1),
    h = Number(match?.[2] || 1);
  return w > 0 && h > 0 ? { w, h } : { w: 1, h: 1 };
}

export function imageMegapixels(resolution = "", aspectRatio = "1:1") {
  const text = String(resolution || "1K")
    .trim()
    .toUpperCase();
  const explicit = text.match(/(\d+)\s*[X×]\s*(\d+)/i);
  if (explicit)
    return Math.max(0.01, (Number(explicit[1]) * Number(explicit[2])) / 1e6);
  const side =
    text === "4K" ? 4096 : text === "2K" ? 2048 : text === "512" ? 512 : 1024;
  const { w, h } = parseAspectRatio(aspectRatio);
  const width = w >= h ? side : Math.max(1, Math.round((side * w) / h));
  const height = h >= w ? side : Math.max(1, Math.round((side * h) / w));
  return Math.max(0.01, (width * height) / 1e6);
}

export function estimateFromImagePricing(
  pricing = {},
  resolution = "",
  aspectRatio = "1:1",
  hasReferenceImage = false,
) {
  const num = (key) => {
    const value = Number(pricing?.[key]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };
  const megapixels = imageMegapixels(resolution, aspectRatio);
  const fixed =
    num("request") ||
    num("image") ||
    num("image_output") ||
    num("output_image");
  const perMegapixel =
    num("megapixel") || num("image_megapixel") || num("output_image_megapixel");
  let providerUsd = fixed || (perMegapixel ? perMegapixel * megapixels : 0);
  if (!providerUsd) providerUsd = 0.04 * Math.max(1, megapixels);
  if (hasReferenceImage) providerUsd *= 1.08;
  providerUsd *= 1.05;
  return {
    providerUsd,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / 0.00001)),
    megapixels,
    pricingBasis: fixed
      ? "per_image"
      : perMegapixel
        ? "per_megapixel"
        : "fallback",
    unitPrice: fixed || perMegapixel || 0,
  };
}

export async function estimateImageCharge(
  model,
  resolution = "",
  aspectRatio = "1:1",
  hasReferenceImage = false,
) {
  const endpoints = await getOpenRouterImageModelEndpoints(model?.id);
  const candidates = [model, ...endpoints].map((item) =>
    estimateFromImagePricing(
      item?.pricing || {},
      resolution,
      aspectRatio,
      hasReferenceImage,
    ),
  );
  return (
    candidates
      .filter((x) => x.unitPrice > 0)
      .sort((a, b) => a.providerUsd - b.providerUsd)[0] || candidates[0]
  );
}
