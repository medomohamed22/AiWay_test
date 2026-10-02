export function normalizeImagePricing(pricing) {
  if (!Array.isArray(pricing)) return pricing || {};
  const normalized = {};
  for (const entry of pricing) {
    if (entry.billable !== "output_image") continue;
    const value = Number(entry.cost_usd);
    if (!(value > 0)) continue;
    const key =
      entry.unit === "megapixel"
        ? "megapixel"
        : entry.unit === "image"
          ? "image"
          : null;
    // Multiple resolution variants: retain a conservative maximum for reservation.
    if (key) normalized[key] = Math.max(normalized[key] || 0, value);
  }
  return normalized;
}
import { requestJson } from "./http.js";

export const CURATED_MODEL_IDS = [
  "deepseek/deepseek-v4-flash",
  "openai/gpt-5.6-luna",
  "openai/gpt-5.6-sol-pro",
  "openai/gpt-5.4",
  "openai/gpt-5.4-mini",
  "openai/gpt-5.4-nano",
  "google/gemini-3.1-pro-preview",
  "google/gemini-3.1-flash-lite-preview",
  "x-ai/grok-4.1-fast",
  "x-ai/grok-4",
  "deepseek/deepseek-v4",
  "deepseek/deepseek-r1-0528",
  "z-ai/glm-5",
  "z-ai/glm-4.7",
  "anthropic/claude-opus-4.6",
  "anthropic/claude-sonnet-4.6",
  "qwen/qwen3.5-397b-a17b",
  "meta-llama/llama-4-maverick",
];

export const FALLBACK_OPENROUTER_MODELS = [
  {
    id: "deepseek/deepseek-v4-flash",
    name: "DeepSeek V4 Flash",
    description: "سريع واقتصادي للبرمجة والتلخيص والكتابة والمهام العامة.",
    contextLength: 1048576,
    pricing: { prompt: 0.09 / 1e6, completion: 0.18 / 1e6 },
    inputModalities: ["text"],
    outputModalities: ["text"],
    provider: "deepseek",
  },
  {
    id: "openai/gpt-5.6-luna",
    name: "GPT-5.6 Luna",
    description: "نموذج سريع وفعال للتوازن بين الجودة والتكلفة.",
    contextLength: 1048576,
    pricing: { prompt: 0.1 / 1e6, completion: 0.6 / 1e6 },
    inputModalities: ["text", "image", "files"],
    outputModalities: ["text"],
    provider: "openai",
  },
  {
    id: "openai/gpt-5.6-sol-pro",
    name: "GPT-5.6 Sol Pro",
    description: "نموذج عالي الجودة للمهام المعقدة والاستدلال والبرمجة.",
    contextLength: 1048576,
    pricing: { prompt: 5 / 1e6, completion: 30 / 1e6 },
    inputModalities: ["text", "image", "files"],
    outputModalities: ["text"],
    provider: "openai",
  },
  {
    id: "openrouter/free",
    name: "OpenRouter Free Router",
    description: "يوجّه الطلب إلى نموذج مجاني متاح يدعم خصائص الطلب.",
    contextLength: 128000,
    pricing: { prompt: 0, completion: 0 },
    inputModalities: ["text", "image", "files"],
    outputModalities: ["text"],
    provider: "openrouter",
  },
  {
    id: "openrouter/auto",
    name: "OpenRouter Auto",
    description: "اختيار تلقائي ذكي من OpenRouter.",
    contextLength: 128000,
    pricing: { prompt: 1 / 1e6, completion: 3 / 1e6 },
    inputModalities: ["text", "image", "files"],
    outputModalities: ["text"],
    provider: "openrouter",
  },
];

export function normalizeOpenRouterModel(model) {
  const architecture = model?.architecture || {};
  const pricing = normalizeImagePricing(model?.pricing || {});
  const num = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const provider = String(model?.id || "").split("/")[0] || "openrouter";
  return {
    id: String(model.id),
    name: String(model.name || model.id),
    description: String(model.description || ""),
    created: Number(model.created || 0),
    contextLength: Number(model.context_length || model.contextLength || 0),
    pricing: {
      prompt: num(pricing.prompt),
      completion: num(pricing.completion),
      request: num(pricing.request),
      image: num(pricing.image),
      image_output: num(pricing.image_output),
      output_image: num(pricing.output_image),
      megapixel: num(pricing.megapixel),
      web_search: num(pricing.web_search),
    },
    inputModalities: Array.isArray(architecture.input_modalities)
      ? architecture.input_modalities
      : ["text"],
    outputModalities: Array.isArray(architecture.output_modalities)
      ? architecture.output_modalities
      : ["text"],
    supported_parameters: model.supported_parameters || {},
    provider,
    providerLabel: provider,
    tier: String(model.id).endsWith(":free") ? "free" : "stable",
  };
}

export let modelCatalogCache = { expires: 0, data: null };

export async function getAvailableModels() {
  if (modelCatalogCache.data && Date.now() < modelCatalogCache.expires)
    return modelCatalogCache.data.map((x) => ({
      ...x,
      pricing: { ...x.pricing },
    }));
  try {
    const { response, data: payload } = await requestJson(
      "https://openrouter.ai/api/v1/models?output_modalities=text",
      { headers: { Accept: "application/json" } },
      15000,
    );
    if (!response.ok) throw new Error(`OpenRouter models ${response.status}`);
    const all = (Array.isArray(payload?.data) ? payload.data : [])
      .map(normalizeOpenRouterModel)
      .filter((x) => x.id && x.outputModalities.includes("text"));
    const famous =
      /^(openai|google|x-ai|deepseek|z-ai|anthropic|qwen|meta-llama|mistralai|moonshotai)\//;
    let selected = all.filter(
      (x) =>
        CURATED_MODEL_IDS.includes(x.id) ||
        famous.test(x.id) ||
        x.id.endsWith(":free"),
    );
    selected = [
      ...new Map(
        [...FALLBACK_OPENROUTER_MODELS, ...selected].map((x) => [x.id, x]),
      ).values(),
    ];
    modelCatalogCache = {
      expires: Date.now() + 15 * 60 * 1000,
      data: selected,
    };
    return selected.map((x) => ({ ...x, pricing: { ...x.pricing } }));
  } catch (error) {
    console.warn("[OPENROUTER_CATALOG_FALLBACK]", error?.message || error);
    return FALLBACK_OPENROUTER_MODELS.map((x) => ({
      ...x,
      pricing: { ...x.pricing },
    }));
  }
}

export let imageCatalogCache = { expires: 0, data: null };

export async function getOpenRouterImageModels() {
  if (imageCatalogCache.data && Date.now() < imageCatalogCache.expires)
    return imageCatalogCache.data.map((x) => ({
      ...x,
      pricing: { ...x.pricing },
    }));
  try {
    const { response, data: payload } = await requestJson(
      "https://openrouter.ai/api/v1/images/models",
      { headers: { Accept: "application/json" } },
      15000,
    );
    if (!response.ok)
      throw new Error(`OpenRouter image models ${response.status}`);
    const items = (Array.isArray(payload?.data) ? payload.data : [])
      .map(normalizeOpenRouterModel)
      .filter((x) => x.outputModalities.includes("image"));
    imageCatalogCache = { expires: Date.now() + 15 * 60 * 1000, data: items };
    return items.map((x) => ({ ...x, pricing: { ...x.pricing } }));
  } catch (error) {
    console.warn(
      "[OPENROUTER_IMAGE_CATALOG_FALLBACK]",
      error?.message || error,
    );
    return GEMINI_IMAGE_MODELS.map((x) => ({
      ...x,
      pricing: { ...x.pricing },
    }));
  }
}

export const imageEndpointCache = new Map();

export async function getOpenRouterImageModelEndpoints(modelId) {
  const id = String(modelId || "").trim();
  if (!id) return [];
  const cached = imageEndpointCache.get(id);
  if (cached && Date.now() < cached.expires)
    return cached.data.map((item) => ({
      ...item,
      pricing: { ...(item.pricing || {}) },
    }));
  try {
    const { response, data: payload } = await requestJson(
      `https://openrouter.ai/api/v1/images/models/${encodeURIComponent(id).replace(/%2F/g, "/")}/endpoints`,
      { headers: { Accept: "application/json" } },
      12000,
    );
    if (!response.ok)
      throw new Error(`OpenRouter image endpoints ${response.status}`);
    const raw = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.endpoints)
        ? payload.endpoints
        : [];
    const data = raw.map((endpoint, index) => {
      const normalized = normalizeOpenRouterModel({
        id: endpoint?.id || `${id}#${index}`,
        name: endpoint?.name || endpoint?.provider_name || id,
        architecture: endpoint?.architecture || {},
        pricing: endpoint?.pricing || {},
        supported_parameters:
          endpoint?.supported_parameters || endpoint?.capabilities || {},
      });
      return {
        ...endpoint,
        ...normalized,
        modelId: id,
        providerName:
          endpoint?.provider_name || endpoint?.provider || normalized.provider,
      };
    });
    imageEndpointCache.set(id, { expires: Date.now() + 10 * 60 * 1000, data });
    return data.map((item) => ({
      ...item,
      pricing: { ...(item.pricing || {}) },
    }));
  } catch (error) {
    console.warn(
      "[OPENROUTER_IMAGE_ENDPOINTS_FALLBACK]",
      id,
      error?.message || error,
    );
    return [];
  }
}

export const GEMINI_IMAGE_MODELS = [
  {
    id: "black-forest-labs/flux.2-klein-4b",
    name: "FLUX.2 Klein 4B",
    description: "أرخص نموذج FLUX وسريع لتوليد الصور.",
    pricing: { megapixel: 0.014 },
    inputModalities: ["text", "image"],
    outputModalities: ["image"],
    supported_parameters: {
      resolution: { type: "enum", values: ["512", "1K", "2K"] },
      aspect_ratio: {
        type: "enum",
        values: ["1:1", "16:9", "9:16", "4:3", "3:4"],
      },
      n: { type: "boolean" },
    },
    provider: "black-forest-labs",
  },
  {
    id: "black-forest-labs/flux.2-pro",
    name: "FLUX.2 Pro",
    description: "جودة أعلى للصور والتعديل متعدد المراجع.",
    pricing: { request: 0.03, image: 0.03 },
    inputModalities: ["text", "image"],
    outputModalities: ["image"],
    supported_parameters: {
      resolution: { type: "enum", values: ["1K", "2K", "4K"] },
      aspect_ratio: {
        type: "enum",
        values: ["1:1", "16:9", "9:16", "4:3", "3:4"],
      },
      n: { type: "boolean" },
    },
    provider: "black-forest-labs",
  },
];

export async function getModel(modelId) {
  return (
    (await getAvailableModels()).find((model) => model.id === modelId) || null
  );
}
