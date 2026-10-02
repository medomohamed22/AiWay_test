import { getToolModelSettings } from "./tools.js";
import { getAvailableModels } from "../providers/openrouter-catalog.js";

export function isTextChatModel(model) {
  return Boolean(
    model &&
      (
        model.outputModalities ||
        model.architecture?.output_modalities || ["text"]
      ).includes("text"),
  );
}

export function isFreeModel(model) {
  return Boolean(
    model &&
      Number(model?.pricing?.prompt) === 0 &&
      Number(model?.pricing?.completion) === 0,
  );
}

export const TASK_MODEL_PROFILES = {
  coding: {
    families: [/deepseek/i, /qwen.*coder/i, /coder/i, /codestral/i, /gemma/i],
    quality: /(?:coder|code|deepseek|qwen|r1|reason|32b|70b|pro)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000,
  },
  summary: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 64000,
  },
  ads: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 16000,
  },
  writing: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000,
  },
  translate: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /command/i],
    quality: /(?:flash|qwen|mistral|command|mini|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000,
  },
  study: {
    families: [/gemini.*flash/i, /qwen/i, /deepseek/i, /mini/i],
    quality: /(?:flash|qwen|deepseek|reason|r1|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 64000,
  },
  business: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|reason|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000,
  },
};

export function modelBlendedCost(model) {
  const prompt = Math.max(0, Number(model?.pricing?.prompt || 0));
  const completion = Math.max(0, Number(model?.pricing?.completion || 0));
  return (prompt + completion * 2) * 1e6;
}

export function modelQualityScore(
  model,
  profile,
  { webSearch = false, hasAttachments = false } = {},
) {
  const label = `${model?.id || ""} ${model?.name || ""}`.toLowerCase();
  const context = Number(model?.contextLength || 0);
  let quality = 45;

  if (profile?.quality?.test(label)) quality += 18;
  if (/(?:reason|r1|thinking|pro|large|70b|72b|32b|34b|27b)/i.test(label))
    quality += 12;
  if (/(?:flash|mini|small|8b|7b)/i.test(label)) quality += 5;
  if (profile?.weak?.test(label)) quality -= 24;
  if (/(?:beta|preview|experimental)/i.test(label)) quality -= 3;

  if (context >= 128000) quality += 10;
  else if (context >= 64000) quality += 7;
  else if (context >= 32000) quality += 4;
  else if (profile?.minContext && context && context < profile.minContext)
    quality -= 12;

  if ((webSearch || hasAttachments) && context >= 64000) quality += 8;
  if ((webSearch || hasAttachments) && context && context < 32000)
    quality -= 16;
  return Math.max(0, Math.min(100, quality));
}

export function taskComplexity(
  text = "",
  { webSearch = false, hasAttachments = false } = {},
) {
  const q = String(text || "").toLowerCase();
  let score = 0;
  if (q.length > 1200) score += 1;
  if (q.length > 3500) score += 1;
  if (webSearch) score += 1;
  if (hasAttachments) score += 1;
  if (
    /(?:حلل|تحليل عميق|قارن|استراتيجية|معمارية|أمان|debug|architecture|security|reason|research|compare|multi-step|رياضيات|برهان)/i.test(
      q,
    )
  )
    score += 2;
  return score >= 3 ? "complex" : score >= 1 ? "medium" : "simple";
}

export function modelValueScore(model, profile, options = {}) {
  const cost = modelBlendedCost(model);
  const quality = modelQualityScore(model, profile, options);
  const complexity = options.complexity || "simple";
  // Paid models only. Simple tasks strongly favor the cheapest acceptable model;
  // harder tasks progressively give more weight to quality and context.
  const qualityWeight =
    complexity === "complex" ? 1.35 : complexity === "medium" ? 1.0 : 0.72;
  const costWeight =
    complexity === "complex" ? 8 : complexity === "medium" ? 14 : 23;
  const costPenalty = Math.log10(1 + Math.max(0, cost)) * costWeight;
  const cheapBonus = cost <= 0.5 ? 18 : cost <= 1.5 ? 12 : cost <= 4 ? 6 : 0;
  const qualityFloorPenalty = quality < 48 ? (48 - quality) * 2.2 : 0;
  return (
    quality * qualityWeight + cheapBonus - costPenalty - qualityFloorPenalty
  );
}

export function modelInputModalities(model) {
  const raw =
    model?.architecture?.input_modalities || model?.input_modalities || [];
  return Array.isArray(raw)
    ? raw.map((value) => String(value).toLowerCase())
    : [];
}

export function modelSupportsAttachmentTypes(model, attachmentTypes = []) {
  const types = Array.isArray(attachmentTypes)
    ? attachmentTypes
        .map((value) => String(value || "").toLowerCase())
        .filter(Boolean)
    : [];
  if (!types.length) return true;
  const modalities = modelInputModalities(model);
  // Text/code attachments are embedded as UTF-8 text before routing, so every text-chat model can consume them.
  const needsImage = types.some((type) => type.startsWith("image/"));
  const needsFile = types.some(
    (type) =>
      !type.startsWith("image/") &&
      !type.startsWith("text/") &&
      type !== "text",
  );
  if (needsImage && !modalities.includes("image")) return false;
  if (needsFile && !modalities.includes("file")) return false;
  return true;
}

export async function chooseTaskModel(
  taskId,
  text = "",
  { webSearch = false, hasAttachments = false, attachmentTypes = [] } = {},
) {
  const configured = (await getToolModelSettings())[taskId];
  if (configured) {
    const exact = (await getAvailableModels()).find(
      (model) => model.id === configured,
    );
    if (exact && modelSupportsAttachmentTypes(exact, attachmentTypes))
      return exact;
  }
  const profile = TASK_MODEL_PROFILES[taskId];
  if (!profile) return chooseAutoModel(text, { webSearch, hasAttachments });

  const models = (await getAvailableModels()).filter(
    (model) =>
      isTextChatModel(model) &&
      !model.locked &&
      !isFreeModel(model) &&
      modelSupportsAttachmentTypes(model, attachmentTypes),
  );
  if (!models.length) return null;

  const label = (model) => `${model.id || ""} ${model.name || ""}`;
  let candidates = [];
  for (const familyPattern of profile.families) {
    const familyMatches = models.filter((model) =>
      familyPattern.test(label(model)),
    );
    if (familyMatches.length) candidates.push(...familyMatches);
  }
  candidates = [
    ...new Map(candidates.map((model) => [model.id, model])).values(),
  ];
  if (!candidates.length) candidates = models;

  const complexity = taskComplexity(text, { webSearch, hasAttachments });
  const needsLargeContext =
    complexity === "complex" ||
    hasAttachments ||
    webSearch ||
    String(text || "").length > 3000;
  if (needsLargeContext) {
    const capable = candidates.filter(
      (model) => Number(model.contextLength || 0) >= 64000,
    );
    if (capable.length) candidates = capable;
  }

  // For simple work, remove clearly weak candidates and select primarily by price.
  if (complexity === "simple") {
    const acceptable = candidates.filter(
      (model) =>
        modelQualityScore(model, profile, { webSearch, hasAttachments }) >= 48,
    );
    if (acceptable.length) candidates = acceptable;
  }

  return (
    [...candidates].sort((a, b) => {
      const options = { webSearch, hasAttachments, complexity };
      const scoreDiff =
        modelValueScore(b, profile, options) -
        modelValueScore(a, profile, options);
      if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
      const costDiff = modelBlendedCost(a) - modelBlendedCost(b);
      if (Math.abs(costDiff) > 0.000001) return costDiff;
      return Number(b.contextLength || 0) - Number(a.contextLength || 0);
    })[0] ||
    chooseAutoModel(text, { webSearch, hasAttachments, attachmentTypes })
  );
}

export async function chooseAutoModel(
  text = "",
  { webSearch = false, hasAttachments = false, attachmentTypes = [] } = {},
) {
  const models = await getAvailableModels();
  const available = models.filter(
    (m) =>
      isTextChatModel(m) &&
      !isFreeModel(m) &&
      modelSupportsAttachmentTypes(m, attachmentTypes),
  );
  const q = String(text || "").toLowerCase();
  const complex =
    q.length > 1400 ||
    /(?:حلل|تحليل عميق|برمجة|كود|debug|architecture|security|رياضيات|reason|research|compare)/i.test(
      q,
    );
  const coding =
    /(?:كود|برمجة|خطأ|بايثون|جافاسكربت|sql|code|debug|function|api)/i.test(q);
  let pool = available;
  if (webSearch || hasAttachments || complex) {
    const capable = available.filter(
      (m) => Number(m.contextLength || 0) >= 64000,
    );
    if (capable.length) pool = capable;
  }
  const score = (m) => {
    const p = Number(m.pricing?.prompt || 0),
      c = Number(m.pricing?.completion || 0);
    let value = (p + c * 2) * 1e6;
    // Auto mode now prioritizes models known for fast inference before using price as a tie-breaker.
    if (/flash|mini|nano|fast|turbo|instant|haiku/i.test(`${m.id} ${m.name}`))
      value -= 120;
    if (
      /opus|pro|max|reason|r1|large|405b/i.test(`${m.id} ${m.name}`) &&
      !complex
    )
      value += 45;
    if (coding && /qwen|deepseek|coder|gemma/i.test(`${m.id} ${m.name}`))
      value -= 50;
    if (complex && /reason|r1|pro|large|70b|31b|27b/i.test(`${m.id} ${m.name}`))
      value -= 20;
    return value;
  };
  return (
    [...pool].sort((a, b) => score(a) - score(b))[0] || available[0] || null
  );
}
