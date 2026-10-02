import { generationUsage } from "../providers/openrouter.js";
import { appError } from "../core/http.js";

export const TOKEN_USD = 0.00001;

export const PROVIDER_BUDGET_SHARE = 0.5;

export const MARKUP = 1 / PROVIDER_BUDGET_SHARE;

export const TRIAL_MESSAGE_LIMIT = 10;

export const TRIAL_TOKENS = 10;

export const PI_PRICE_BUFFER = 0.05;

export const TRIAL_MODEL_FALLBACK = "openrouter/free";

export const tokensForUsd = (usd) =>
  Math.round((Number(usd) * PROVIDER_BUDGET_SHARE) / TOKEN_USD);

export function chargeGeminiUsage(
  price = {},
  usageMetadata = {},
  { webSearch = false, fallbackUsd = 0 } = {},
) {
  const promptBase = Math.max(
    0,
    Number(
      usageMetadata.promptTokenCount || usageMetadata.inputTokenCount || 0,
    ),
  );
  const toolPromptTotal = Math.max(
    0,
    Number(usageMetadata.toolUsePromptTokenCount || 0),
  );
  const promptTotal = promptBase + toolPromptTotal;
  const responseTotal = Math.max(
    0,
    Number(
      usageMetadata.candidatesTokenCount ||
        usageMetadata.responseTokenCount ||
        usageMetadata.outputTokenCount ||
        0,
    ),
  );
  const thoughtsTotal = Math.max(
    0,
    Number(usageMetadata.thoughtsTokenCount || 0),
  );
  const outputTotal = responseTotal + thoughtsTotal;
  const normalizeModality = (value) =>
    String(value || "")
      .toUpperCase()
      .replace(/^MODALITY_/, "");
  const sumDetails = (details) =>
    (Array.isArray(details) ? details : []).reduce((map, item) => {
      const key = normalizeModality(item?.modality || item?.type || "TEXT");
      map[key] = (map[key] || 0) + Math.max(0, Number(item?.tokenCount || 0));
      return map;
    }, {});
  const inputDetails = sumDetails(
    usageMetadata.promptTokensDetails || usageMetadata.inputTokensDetails,
  );
  const toolInputDetails = sumDetails(usageMetadata.toolUsePromptTokensDetails);
  for (const [modality, count] of Object.entries(toolInputDetails))
    inputDetails[modality] = (inputDetails[modality] || 0) + count;
  const outputDetails = sumDetails(
    usageMetadata.candidatesTokensDetails ||
      usageMetadata.responseTokensDetails ||
      usageMetadata.outputTokensDetails,
  );
  const hasInputDetails = Object.keys(inputDetails).length > 0;
  const hasOutputDetails = Object.keys(outputDetails).length > 0;
  const rate = (side, modality) => {
    const input = side === "input";
    const key = `${modality.toLowerCase()}${input ? "Input" : "Output"}`;
    const imageOutputRate =
      !input && modality === "IMAGE"
        ? Number(price.imageOutputPerMillion || 0) / 1e6
        : 0;
    return Math.max(
      0,
      Number(
        price[key] ||
          imageOutputRate ||
          (input ? price.prompt : price.completion) ||
          0,
      ),
    );
  };
  const calculate = (details, total, side) => {
    if (!Object.keys(details).length) return total * rate(side, "TEXT");
    return Object.entries(details).reduce(
      (sum, [modality, count]) => sum + Number(count) * rate(side, modality),
      0,
    );
  };
  const inputUsd = calculate(inputDetails, promptTotal, "input");
  const outputUsd =
    calculate(outputDetails, responseTotal, "output") +
    thoughtsTotal * rate("output", "TEXT");
  const requestUsd = hasOutputDetails
    ? 0
    : Math.max(0, Number(price.request || 0));
  const webUsd = webSearch
    ? Math.max(0, Number(price.web_search ?? price.webSearch ?? 0.01))
    : 0;
  let providerUsd = inputUsd + outputUsd + requestUsd + webUsd;
  let costSource =
    hasInputDetails || hasOutputDetails
      ? "gemini_usage_by_modality"
      : "gemini_usage_tokens";
  if (!hasInputDetails && !hasOutputDetails && Number(fallbackUsd) > 0) {
    providerUsd = Number(fallbackUsd);
    costSource = "model_fixed_price_fallback";
  }
  return {
    input: promptTotal,
    output: outputTotal,
    inputUsd,
    outputUsd,
    requestUsd,
    webUsd,
    providerUsd,
    costSource,
    tokenUsd: TOKEN_USD,
    markup: MARKUP,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / TOKEN_USD)),
    thoughts: thoughtsTotal,
    modalityUsage: { input: inputDetails, output: outputDetails },
  };
}

export function chargeTokens(price, usage = {}, webSearch = false) {
  const input = Number(usage.prompt_tokens || usage.input_tokens || 0);
  const output = Number(usage.completion_tokens || usage.output_tokens || 0);
  const reportedCost = Number(usage.cost || 0);
  const webSearchFallbackUsd = webSearch ? Number(price?.webSearch || 0.01) : 0;
  const fallbackCost =
    input * Number(price?.prompt || 0) +
    output * Number(price?.completion || 0) +
    webSearchFallbackUsd;
  const hasReportedCost = Number.isFinite(reportedCost) && reportedCost > 0;
  const providerUsd = hasReportedCost ? reportedCost : fallbackCost;
  return {
    input,
    output,
    providerUsd,
    costSource: hasReportedCost ? "openrouter_usage" : "catalog_estimate",
    tokenUsd: TOKEN_USD,
    markup: MARKUP,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / TOKEN_USD)),
  };
}

export function estimateTextTokens(value = "") {
  const text = String(value || "").trim();
  if (!text) return 0;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+(?:['_-][A-Za-z0-9]+)*/g) || [])
    .length;
  const arabicWords = (text.match(/[\u0600-\u06FF]+/g) || []).length;
  const punctuation = (text.match(/[^\s\p{L}\p{N}]/gu) || []).length;
  const codeLines = (
    text.match(
      /```|[{}[\]();<>_=+*/\\|`~]|\b(?:const|let|var|function|class|import|export|SELECT|FROM|WHERE)\b/g,
    ) || []
  ).length;
  const urls = (text.match(/https?:\/\/\S+/g) || []).reduce(
    (sum, url) => sum + Math.ceil(url.length / 3),
    0,
  );
  const wordEstimate = arabicWords * 1.35 + latinWords * 1.12;
  const characterFloor =
    text.length / (arabic > text.length * 0.2 ? 2.55 : 3.85);
  return Math.max(
    1,
    Math.ceil(
      Math.max(wordEstimate, characterFloor) +
        punctuation * 0.18 +
        codeLines * 0.42 +
        urls,
    ),
  );
}

export function attachmentTokenEstimate(attachment = {}) {
  const type = String(
    attachment.type || attachment.mime_type || "",
  ).toLowerCase();
  const size = Math.max(
    0,
    Number(attachment.size || attachment.size_bytes || 0),
  );
  if (type.startsWith("image/")) {
    // OpenRouter ultimately reports native multimodal token usage. Before sending,
    // dimensions are not always available, so use a conservative size-based band.
    if (!size) return 1050;
    if (size <= 350_000) return 750;
    if (size <= 1_500_000) return 1250;
    if (size <= 4_000_000) return 1900;
    return 2600;
  }
  if (type.includes("pdf"))
    return Math.max(900, Math.min(16000, Math.ceil(size / 155)));
  if (
    type.startsWith("text/") ||
    /json|xml|javascript|typescript|csv|markdown/.test(type)
  )
    return Math.max(220, Math.min(14000, Math.ceil(size / 3.2)));
  return Math.max(500, Math.min(9000, Math.ceil(size / 230)));
}

export function estimatedContentTokens(value) {
  if (typeof value === "string") {
    if (value.startsWith("data:")) return 0;
    return estimateTextTokens(value);
  }
  if (Array.isArray(value))
    return value.reduce((sum, item) => sum + estimatedContentTokens(item), 0);
  if (!value || typeof value !== "object") return 0;
  if (value.type === "image_url") return 1050;
  if (value.type === "file") return 1500;
  if (value.name || value.mime_type || value.size || value.size_bytes)
    return attachmentTokenEstimate(value);
  return Object.entries(value).reduce((sum, [key, item]) => {
    if (key === "file_data" || key === "url" || key === "dataUrl") return sum;
    return sum + estimatedContentTokens(item);
  }, 0);
}

export function latestUserText(messages = []) {
  const latest = [...messages]
    .reverse()
    .find((message) => message?.role === "user");
  return typeof latest?.content === "string" ? latest.content : "";
}

export function expectedOutputTokens(
  text,
  inputTokens,
  attachmentCount,
  imageCount,
  webSearch,
) {
  const value = String(text || "");
  const latestTokens = Math.max(1, estimateTextTokens(value));
  const asksForCode =
    /```|\b(code|كود|برمج|برنامج|function|api|html|javascript|python|sql)\b/i.test(
      value,
    );
  const asksForLong =
    /\b(explain|detailed|complete|full|report|article|essay|حلل|اشرح|بالتفصيل|كامل|تقرير|مقال)\b/i.test(
      value,
    );
  const asksForShort =
    /\b(short|brief|one word|مختصر|باختصار|كلمة واحدة)\b/i.test(value);
  let ratio = asksForCode
    ? 1.35
    : asksForLong
      ? 1.05
      : asksForShort
        ? 0.3
        : 0.72;
  let predicted =
    48 + latestTokens * ratio + Math.sqrt(Math.max(1, inputTokens)) * 5.5;
  predicted += attachmentCount * 45 + imageCount * 75 + (webSearch ? 120 : 0);
  return Math.max(64, Math.min(32768, Math.ceil(predicted)));
}

export function fitMessagesToModelContext(
  messages = [],
  contextLength = 0,
  outputReserve = 4096,
  locale = "en",
) {
  const source = Array.isArray(messages) ? messages : [];
  const context = Math.max(0, Number(contextLength || 0));
  if (!context)
    return {
      messages: source,
      omittedMessages: 0,
      inputTokens: Math.max(
        1,
        estimatedContentTokens(source) + 14 * source.length + 8,
      ),
    };
  const reserve = Math.max(512, Math.min(32768, Number(outputReserve || 4096)));
  const maxInput = Math.max(1024, context - reserve - 256);
  const system = source.filter((message) => message?.role === "system");
  const conversational = source.filter((message) => message?.role !== "system");
  const systemTokens = estimatedContentTokens(system) + 14 * system.length + 8;
  let used = systemTokens;
  const kept = [];
  for (let i = conversational.length - 1; i >= 0; i--) {
    const message = conversational[i];
    const cost = estimatedContentTokens(message) + 14;
    // Always keep the newest conversational message. If it alone is too large, fail explicitly upstream.
    if (!kept.length || used + cost <= maxInput) {
      kept.unshift(message);
      used += cost;
    } else break;
  }
  const omittedMessages = Math.max(0, conversational.length - kept.length);
  if (used > maxInput && kept.length <= 1)
    return {
      messages: [...system, ...kept],
      omittedMessages,
      inputTokens: used,
      tooLarge: true,
      maxInputTokens: maxInput,
    };
  const notice = omittedMessages
    ? {
        role: "system",
        content:
          locale === "ar"
            ? `ملاحظة نقل سياق: تم استبعاد ${omittedMessages} رسالة أقدم من هذا الطلب فقط للحفاظ على سعة سياق النموذج. لم يتم حذفها من المحادثة المحفوظة. إذا احتجت تفاصيل منها فاطلبها من المستخدم بوضوح.`
            : `Context transport note: ${omittedMessages} older message(s) were excluded from this request only to stay within the model context window. They remain saved in the conversation. Ask the user clearly if details from them are needed.`,
      }
    : null;
  const fitted = notice ? [...system, notice, ...kept] : [...system, ...kept];
  return {
    messages: fitted,
    omittedMessages,
    inputTokens: Math.max(
      1,
      estimatedContentTokens(fitted) + 14 * fitted.length + 8,
    ),
    maxInputTokens: maxInput,
  };
}

export function estimateChatCharge(
  price,
  messages = [],
  webSearch = false,
  outputReserve = 0,
) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  // Message framing differs by native tokenizer; 14 tokens/message plus a small
  // conversation header is a closer preflight approximation than word count alone.
  const inputTokens = Math.max(
    1,
    estimatedContentTokens(safeMessages) + 14 * safeMessages.length + 8,
  );
  const attachmentCount = safeMessages.reduce(
    (sum, message) =>
      sum +
      (Array.isArray(message?.attachments) ? message.attachments.length : 0),
    0,
  );
  const imageCount = safeMessages.reduce(
    (sum, message) =>
      sum +
      (Array.isArray(message?.attachments)
        ? message.attachments.filter((item) =>
            String(item?.type || "").startsWith("image/"),
          ).length
        : 0),
    0,
  );
  const automaticOutput = expectedOutputTokens(
    latestUserText(safeMessages),
    inputTokens,
    attachmentCount,
    imageCount,
    webSearch,
  );
  const requestedReserve = Number(outputReserve || 0);
  const reservedOutputTokens = Math.max(
    64,
    Math.min(
      32768,
      Math.ceil(requestedReserve > 0 ? requestedReserve : automaticOutput),
    ),
  );
  const promptRate = Math.max(0, Number(price?.prompt || 0));
  const completionRate = Math.max(0, Number(price?.completion || 0));
  const requestUsd = Math.max(0, Number(price?.request || 0));
  const inputUsd = inputTokens * promptRate;
  const outputUsd = reservedOutputTokens * completionRate;
  // Current OpenRouter web-plugin pricing is normally $0.005/request; use a
  // model-catalog value when supplied and otherwise this documented baseline.
  const webUsd = webSearch
    ? Math.max(0, Number(price?.web_search ?? price?.webSearch ?? 0.005))
    : 0;
  const providerUsd = inputUsd + outputUsd + requestUsd + webUsd;
  return {
    inputTokens,
    reservedOutputTokens,
    attachmentCount,
    imageCount,
    webSearch: Boolean(webSearch),
    inputUsd,
    outputUsd,
    requestUsd,
    webUsd,
    providerUsd,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / TOKEN_USD)),
  };
}

export function reservationTokens(estimatedTokens, kind = "chat") {
  const estimate = Math.max(1, Math.ceil(Number(estimatedTokens) || 1));
  const multiplier = kind === "image" ? 1.3 : 1.25;
  const minimumBuffer = kind === "image" ? 250 : 50;
  return Math.max(
    estimate,
    Math.ceil(estimate * multiplier),
    estimate + minimumBuffer,
  );
}

export async function resolveOpenRouterCharge({
  usage = {},
  generationId = "",
  price = {},
  webSearch = false,
  fallbackUsd = 0,
} = {}) {
  let normalizedUsage = { ...usage, cost: Number(usage.cost || 0) };
  if (
    !(normalizedUsage.cost > 0) &&
    generationId &&
    process.env.OPENROUTER_API_KEY
  ) {
    try {
      const data = await generationUsage(generationId);
      if (data)
        normalizedUsage = {
          ...normalizedUsage,
          ...data.usage,
          prompt_tokens:
            data.usage?.prompt_tokens ??
            data.tokens_prompt ??
            usage.prompt_tokens,
          completion_tokens:
            data.usage?.completion_tokens ??
            data.tokens_completion ??
            usage.completion_tokens,
          cost: Number(data.usage?.cost ?? data.cost ?? data.total_cost ?? 0),
        };
    } catch (error) {
      console.warn(
        "[OPENROUTER_GENERATION_COST_LOOKUP_FAILED]",
        error.code || error.message,
      );
    }
  }
  const result = chargeTokens(price, normalizedUsage, webSearch);
  if (!(normalizedUsage.cost > 0) && fallbackUsd > 0)
    return {
      ...result,
      providerUsd: fallbackUsd,
      chargedTokens: Math.max(1, Math.ceil(fallbackUsd / TOKEN_USD)),
      pricingBasis: "estimate",
    };
  return result;
}

export function affordableOutputLimit(
  price,
  availableTokens,
  estimate,
  cap = 16384,
) {
  const completionPrice = Number(price?.completion || 0);
  if (!(completionPrice > 0)) return Math.max(128, cap);
  const availableUsd = Math.max(
    0,
    Number(availableTokens || 0) * TOKEN_USD * 0.9,
  );
  const fixedUsd = Math.max(
    0,
    Number(estimate?.inputUsd || 0) + Number(estimate?.webUsd || 0),
  );
  const affordable = Math.floor((availableUsd - fixedUsd) / completionPrice);
  return Math.max(0, Math.min(cap, affordable));
}

export function isLowBalance(remainingTokens, lastCharge = 0) {
  const remaining = Math.max(0, Number(remainingTokens || 0));
  return (
    remaining > 0 &&
    remaining < Math.max(1000, Math.ceil(Number(lastCharge || 0) * 2))
  );
}

export async function classifyTokenChargeFailure(
  supabase,
  userId,
  requiredTokens,
  cause = null,
) {
  const required = Math.max(1, Math.ceil(Number(requiredTokens) || 1));
  const { data: profile, error } = await supabase
    .from("users")
    .select("ai_tokens,trial_messages_remaining,has_purchased")
    .eq("id", userId)
    .single();
  if (error || !profile) return appError("DATABASE_ERROR", {}, error || cause);
  const availableTokens = Math.max(0, Number(profile.ai_tokens || 0));
  if (
    !profile.has_purchased &&
    Number(profile.trial_messages_remaining || 0) <= 0
  ) {
    return appError("TRIAL_ENDED", { availableTokens }, cause);
  }
  if (availableTokens < required) {
    return appError(
      "INSUFFICIENT_TOKENS_FOR_REQUEST",
      {
        availableTokens,
        requiredTokens: required,
        shortfall: required - availableTokens,
      },
      cause,
    );
  }
  return appError("DATABASE_ERROR", {}, cause);
}
