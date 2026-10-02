import { appError, json } from "./http.js";

export function safeInteger(value) {
  const number = Math.max(0, Math.ceil(Number(value) || 0));
  return Number.isFinite(number) ? number : 0;
}

export function formatTokens(value, language) {
  return safeInteger(value).toLocaleString("en-US");
}

export function normalizedErrorCode(error) {
  const raw = String(error?.code || error?.message || error || "").trim();
  if (raw.startsWith("MODEL_ROUTE_MISMATCH:")) return "MODEL_ROUTE_MISMATCH";
  if (/missing environment variables/i.test(raw))
    return "MISSING_CONFIGURATION";
  if (
    /aborterror|aborted|timed?\s*out|timeout/i.test(
      `${error?.name || ""} ${raw}`,
    )
  )
    return "REQUEST_TIMEOUT";
  if (
    /fetch failed|networkerror|econnreset|econnrefused|enotfound|socket hang up/i.test(
      raw,
    )
  )
    return "NETWORK_ERROR";
  if (/pgrst|postgres|supabase|relation .* does not exist|database/i.test(raw))
    return "DATABASE_ERROR";
  if (
    /(?:free[_ -]?tier|trial).*(?:not available|unsupported|limit\s*[:=]\s*0)|(?:not available|unsupported).*free[_ -]?tier/i.test(
      raw,
    )
  )
    return "MODEL_NOT_AVAILABLE_FREE_TIER";
  if (
    /resource_exhausted|quota exceeded|exceeded your current quota|rate limit/i.test(
      raw,
    )
  )
    return "RATE_LIMITED";
  if (
    /permission_denied|does not have access|not authorized|access denied/i.test(
      raw,
    )
  )
    return "PROVIDER_PERMISSION_DENIED";
  if (
    /model.*(?:not found|not available|unsupported)|not found.*model/i.test(raw)
  )
    return "MODEL_UNAVAILABLE";
  return raw;
}

export function errorDetails(error, locale = "ar") {
  if (
    [
      "PROVIDER_TIMEOUT",
      "PROVIDER_NETWORK_ERROR",
      "PROVIDER_INVALID_RESPONSE",
    ].includes(error?.code)
  ) {
    return {
      code: error.code,
      status: error.code === "PROVIDER_TIMEOUT" ? 504 : 502,
      message: localize(
        locale,
        "الخدمة الخارجية غير متاحة الآن. حاول مرة أخرى.",
        "The external service is unavailable. Try again.",
      ),
      meta: {},
    };
  }
  const language = String(locale).toLowerCase().startsWith("en") ? "en" : "ar";
  const code = normalizedErrorCode(error);
  const meta = error?.meta && typeof error.meta === "object" ? error.meta : {};
  const available = safeInteger(meta.availableTokens);
  const required = safeInteger(meta.requiredTokens || meta.estimatedTokens);
  const shortfall = safeInteger(
    meta.shortfall || Math.max(0, required - available),
  );

  const balanceFinished = {
    ar: "رصيدك انتهى. اشحن رصيدًا جديدًا ثم أعد إرسال الرسالة.",
    en: "Your balance has run out. Add more balance, then send the message again.",
  };
  const insufficientForRequest = {
    ar: `رصيدك الحالي ${formatTokens(available, language)} توكن، بينما التكلفة التقديرية لهذا الطلب نحو ${formatTokens(required, language)} توكن. اشحن ${formatTokens(shortfall, language)} توكن إضافي على الأقل ثم حاول مرة أخرى.`,
    en: `Your current balance is ${formatTokens(available, language)} tokens, while this request is estimated to need about ${formatTokens(required, language)} tokens. Add at least ${formatTokens(shortfall, language)} more tokens and try again.`,
  };

  const messages = {
    METHOD_NOT_ALLOWED: [
      405,
      {
        ar: "طريقة الطلب غير مسموح بها.",
        en: "This request method is not allowed.",
      },
    ],
    INVALID_REQUEST: [
      400,
      {
        ar: "بيانات الطلب غير مكتملة أو غير صحيحة. راجع المدخلات وحاول مرة أخرى.",
        en: "The request data is incomplete or invalid. Check the inputs and try again.",
      },
    ],
    PAYLOAD_TOO_LARGE: [
      413,
      {
        ar: "حجم الطلب أو المرفقات أكبر من الحد المسموح. قلّل حجم الملفات وحاول مرة أخرى.",
        en: "The request or attachments are too large. Reduce the file size and try again.",
      },
    ],
    INVALID_CHAT_REQUEST: [
      400,
      {
        ar: "تعذر إرسال الرسالة لأن بيانات المحادثة غير مكتملة. حدّث الصفحة وحاول مرة أخرى.",
        en: "The message could not be sent because the chat data is incomplete. Refresh the page and try again.",
      },
    ],
    INVALID_IMAGE_REQUEST: [
      400,
      {
        ar: "بيانات طلب الصورة غير مكتملة. اكتب وصفًا واضحًا ثم حاول مرة أخرى.",
        en: "The image request is incomplete. Enter a clear description and try again.",
      },
    ],
    UNAUTHORIZED: [
      401,
      {
        ar: "انتهت جلسة تسجيل الدخول أو لم تبدأ بعد. سجّل الدخول بحساب Pi ثم حاول مرة أخرى.",
        en: "Your sign-in session is missing or expired. Sign in with Pi and try again.",
      },
    ],
    FORBIDDEN: [
      403,
      {
        ar: "ليس لديك صلاحية لتنفيذ هذا الإجراء.",
        en: "You do not have permission to perform this action.",
      },
    ],
    ACCOUNT_SUSPENDED: [
      403,
      {
        ar: "تم إيقاف هذا الحساب مؤقتًا بواسطة الإدارة. تواصل مع الدعم للمراجعة.",
        en: "This account has been suspended by an administrator. Contact support for review.",
      },
    ],
    CHAT_BLOCKED: [
      403,
      {
        ar: "تم إيقاف استخدام المحادثة لهذا الحساب مؤقتًا.",
        en: "Chat access is temporarily disabled for this account.",
      },
    ],
    PAYMENT_BLOCKED: [
      403,
      {
        ar: "تم إيقاف عمليات الدفع لهذا الحساب مؤقتًا.",
        en: "Payments are temporarily disabled for this account.",
      },
    ],
    MAINTENANCE_MODE: [
      503,
      {
        ar: "AiWay تحت صيانة قصيرة حاليًا. حاول مرة أخرى بعد قليل.",
        en: "AiWay is temporarily under maintenance. Try again shortly.",
      },
    ],
    FEATURE_DISABLED: [
      503,
      {
        ar: "هذه الميزة متوقفة مؤقتًا بواسطة الإدارة.",
        en: "This feature is temporarily disabled by the administrator.",
      },
    ],
    INSUFFICIENT_TOKENS: [
      402,
      available <= 0
        ? balanceFinished
        : {
            ar: "رصيدك غير كافٍ لإتمام الطلب. اشحن رصيدًا إضافيًا ثم حاول مرة أخرى.",
            en: "Your balance is insufficient to complete the request. Add more balance and try again.",
          },
    ],
    INSUFFICIENT_TOKENS_FOR_REQUEST: [402, insufficientForRequest],
    LOW_BALANCE: [
      200,
      {
        ar: `رصيدك أوشك على النفاد: متبقٍ ${formatTokens(available, language)} توكن. اشحن رصيدًا لتجنب توقف الرسائل.`,
        en: `Your balance is running low: ${formatTokens(available, language)} tokens remain. Add balance to avoid interruptions.`,
      },
    ],
    PROVIDER_CREDITS_EXHAUSTED: [
      503,
      {
        ar: "رصيد مزود الذكاء الاصطناعي انتهى مؤقتًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay لإعادة شحن الخدمة.",
        en: "The AI provider balance is temporarily exhausted. Your balance was not charged; contact AiWay support so the service can be topped up.",
      },
    ],
    OPENROUTER_CREDITS_EXHAUSTED: [
      503,
      {
        ar: "رصيد مزود الذكاء الاصطناعي انتهى مؤقتًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay لإعادة شحن الخدمة.",
        en: "The AI provider balance is temporarily exhausted. Your balance was not charged; contact AiWay support so the service can be topped up.",
      },
    ],
    PROVIDER_AUTH_ERROR: [
      503,
      {
        ar: "إعداد الاتصال بمزود الذكاء الاصطناعي غير صالح حاليًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay.",
        en: "The AI provider connection is not configured correctly right now. Your balance was not charged; contact AiWay support.",
      },
    ],
    PROVIDER_PERMISSION_DENIED: [
      503,
      {
        ar: "مزود الذكاء الاصطناعي رفض تشغيل هذه الخدمة بالحساب الحالي. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay.",
        en: "The AI provider rejected this service for the current account. Your balance was not charged; contact AiWay support.",
      },
    ],
    FREE_DAILY_LIMIT: [
      429,
      {
        ar: "استخدمت 30 طلبًا مجانيًا اليوم. اختر نموذجًا آخر للمتابعة، وستتجدد الطلبات المجانية تلقائيًا غدًا.",
        en: "You have used all 30 free requests for today. Choose another model to continue; your free requests reset automatically tomorrow.",
      },
    ],
    RATE_LIMITED: [
      429,
      {
        ar: "هناك ضغط مرتفع أو تم بلوغ حد الطلبات مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.",
        en: "The service is busy or its request limit was reached temporarily. Wait a moment and try again; your balance was not charged.",
      },
    ],
    REQUEST_TIMEOUT: [
      504,
      {
        ar: "استغرق الطلب وقتًا أطول من المسموح. حاول مرة أخرى برسالة أقصر أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.",
        en: "The request took too long. Try a shorter message or choose another model; your balance was not charged.",
      },
    ],
    NETWORK_ERROR: [
      503,
      {
        ar: "تعذر الاتصال بالخدمة. تحقق من الإنترنت ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.",
        en: "Could not connect to the service. Check your internet connection and try again; your balance was not charged.",
      },
    ],
    MODEL_LOCKED: [
      403,
      {
        ar: "هذا النموذج متاح بعد أول عملية شراء. استخدم نموذج التجربة المجانية أو اشحن رصيدًا لفتح جميع النماذج.",
        en: "This model unlocks after your first purchase. Use the free-trial model or add balance to unlock all models.",
      },
    ],
    MODEL_UNAVAILABLE: [
      503,
      {
        ar: "النموذج المختار غير متاح حاليًا. حدّث قائمة النماذج واختر نموذجًا آخر؛ لم يتم خصم رصيدك.",
        en: "The selected model is currently unavailable. Refresh the model list and choose another model; your balance was not charged.",
      },
    ],
    MODEL_NOT_AVAILABLE_FREE_TIER: [
      402,
      {
        ar: "هذا النموذج غير متاح ضمن التجربة المجانية لهذا المشروع. فعّل الفوترة في Google AI Studio أو اختر نموذجًا مجانيًا آخر؛ لم يتم خصم رصيدك.",
        en: "This model is not available on the free tier for this project. Enable billing in Google AI Studio or choose another free-tier model; your balance was not charged.",
      },
    ],
    IMAGE_MODEL_UNAVAILABLE: [
      503,
      {
        ar: "نموذج الصور المختار غير متاح حاليًا. حدّث قائمة النماذج واختر نموذج صور آخر؛ لم يتم خصم رصيدك.",
        en: "The selected image model is currently unavailable. Refresh the model list and choose another image model; your balance was not charged.",
      },
    ],
    NO_PROVIDER_AVAILABLE: [
      503,
      {
        ar: "لا يوجد مزود متاح لهذا النموذج حاليًا. اختر نموذجًا آخر أو حاول بعد قليل؛ لم يتم خصم رصيدك.",
        en: "No provider is currently available for this model. Choose another model or try again shortly; your balance was not charged.",
      },
    ],
    PROVIDER_ERROR: [
      502,
      {
        ar: "حدث عطل مؤقت لدى مزود الذكاء الاصطناعي. حاول مرة أخرى أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.",
        en: "The AI provider had a temporary failure. Try again or choose another model; your balance was not charged.",
      },
    ],
    STREAM_INTERRUPTED: [
      502,
      {
        ar: "انقطع الاتصال أثناء كتابة الإجابة. أعد المحاولة؛ لن يُخصم رصيد عن الرد غير المكتمل.",
        en: "The connection was interrupted while the answer was being written. Try again; an incomplete response will not be charged.",
      },
    ],
    EMPTY_RESPONSE: [
      502,
      {
        ar: "لم يُرجع النموذج إجابة صالحة. حاول مرة أخرى أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.",
        en: "The model did not return a valid answer. Try again or choose another model; your balance was not charged.",
      },
    ],
    CONTENT_BLOCKED: [
      400,
      {
        ar: "رفض مزود الذكاء هذا الطلب بسبب سياسات المحتوى. عدّل صياغة الرسالة أو المرفق ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.",
        en: "The AI provider blocked this request under its content policies. Revise the message or attachment and try again; your balance was not charged.",
      },
    ],
    CONTEXT_TOO_LONG: [
      413,
      {
        ar: "المحادثة أو المرفقات أكبر من سعة النموذج. اختصر الرسالة، ابدأ محادثة جديدة، أو استخدم مرفقًا أصغر.",
        en: "The conversation or attachments exceed the model capacity. Shorten the message, start a new chat, or use a smaller attachment.",
      },
    ],
    ATTACHMENT_TOO_LARGE: [
      413,
      {
        ar: "حجم المرفق أكبر من المسموح. قلّل الحجم أو أرسل عددًا أقل من الملفات ثم حاول مرة أخرى.",
        en: "The attachment is larger than allowed. Reduce its size or send fewer files and try again.",
      },
    ],
    INVALID_ATTACHMENT: [
      400,
      {
        ar: "صيغة أحد المرفقات غير مدعومة أو بياناته غير صالحة. احذف المرفق وأعد رفعه بصيغة أخرى.",
        en: "An attachment has an unsupported format or invalid data. Remove it and upload it again in another format.",
      },
    ],
    REFERENCE_IMAGE_UNSUPPORTED: [
      400,
      {
        ar: "النموذج المختار لا يدعم الصور المرجعية. اختر نموذج صور يدعم إدخال الصور.",
        en: "The selected model does not support reference images. Choose an image model that accepts image input.",
      },
    ],
    SEARCH_MODEL_UNSUPPORTED: [
      400,
      {
        ar: "ميزة البحث غير متوفرة مع النموذج المختار حاليًا. اختر نموذجًا آخر ثم أعد المحاولة؛ لم يتم خصم رصيدك.",
        en: "Search is not currently available with the selected model. Choose another model and try again; your balance was not charged.",
      },
    ],
    SEARCH_BILLING_REQUIRED: [
      402,
      {
        ar: "ميزة البحث غير متوفرة حاليًا. حاول لاحقًا أو أرسل طلبك بدون البحث؛ لم يتم خصم رصيدك.",
        en: "Search is currently unavailable. Try again later or send your request without search; your balance was not charged.",
      },
    ],
    TRIAL_WEB_LOCKED: [
      403,
      {
        ar: "بحث الويب متاح بعد أول عملية شراء.",
        en: "Web search unlocks after your first purchase.",
      },
    ],
    TRIAL_ENDED: [
      402,
      {
        ar: "انتهت رسائلك التجريبية. اشحن رصيدًا لفتح جميع النماذج ومتابعة الاستخدام.",
        en: "Your free-trial messages have ended. Add balance to unlock all models and continue.",
      },
    ],
    MODEL_ROUTE_MISMATCH: [
      502,
      {
        ar: "أعاد المزود نموذجًا مختلفًا عن النموذج المختار، لذلك أُوقف الطلب ولم يتم خصم رصيدك.",
        en: "The provider returned a different model than the one selected, so the request was stopped and your balance was not charged.",
      },
    ],
    FILE_NOT_FOUND: [
      404,
      {
        ar: "الملف غير موجود أو لم يعد متاحًا.",
        en: "The file was not found or is no longer available.",
      },
    ],
    IMAGE_NOT_FOUND: [
      404,
      {
        ar: "الصورة غير موجودة أو لم تعد متاحة.",
        en: "The image was not found or is no longer available.",
      },
    ],
    DATABASE_ERROR: [
      503,
      {
        ar: "تعذر حفظ البيانات حاليًا. حاول مرة أخرى بعد قليل؛ لن يتم خصم رصيدك عن طلب لم يُحفظ.",
        en: "The data could not be saved right now. Try again shortly; a request that was not saved will not be charged.",
      },
    ],
    MISSING_CONFIGURATION: [
      503,
      {
        ar: "إعدادات الخدمة على الخادم غير مكتملة. تواصل مع إدارة AiWay.",
        en: "The server configuration is incomplete. Contact AiWay support.",
      },
    ],
    OKX_PRICE_UNAVAILABLE: [
      503,
      {
        ar: "تعذر جلب سعر Pi حاليًا. انتظر قليلًا ثم أعد فتح نافذة الشحن.",
        en: "The Pi price is currently unavailable. Wait a moment, then reopen the top-up window.",
      },
    ],
    PAYMENT_INVALID: [
      400,
      {
        ar: "بيانات الدفعة أو الباقة غير صحيحة.",
        en: "The payment or package details are invalid.",
      },
    ],
    PAYMENT_PENDING: [
      409,
      {
        ar: "الدفعة لم تصل إلى الشبكة بعد. أكملها من المحفظة ثم أعد إنهاء الدفعات المعلقة.",
        en: "The payment has not reached the network yet. Complete it in your wallet, then finish pending payments again.",
      },
    ],
    PI_LOGIN_FAILED: [
      401,
      {
        ar: "تعذر التحقق من حساب Pi. افتح الموقع داخل Pi Browser وسجّل الدخول من جديد.",
        en: "Could not verify your Pi account. Open the site in Pi Browser and sign in again.",
      },
    ],
    PI_SERVICE_UNAVAILABLE: [
      503,
      {
        ar: "خدمة Pi غير متاحة مؤقتًا. لم يتغير رصيدك؛ حاول مرة أخرى بعد قليل.",
        en: "The Pi service is temporarily unavailable. Your balance was not changed; try again shortly.",
      },
    ],
    PAYMENT_PROVIDER_AUTH_ERROR: [
      503,
      {
        ar: "إعدادات الدفع عبر Pi على الخادم غير صالحة حاليًا. لم يتغير رصيدك؛ تواصل مع إدارة AiWay.",
        en: "The server-side Pi payment settings are currently invalid. Your balance was not changed; contact AiWay support.",
      },
    ],
    REQUEST_IN_PROGRESS: [
      409,
      {
        ar: "يوجد طلب ذكاء قيد التنفيذ بالفعل. انتظر اكتماله ثم أرسل طلبًا جديدًا.",
        en: "An AI request is already in progress. Let it finish before sending another.",
      },
    ],
    REQUEST_ALREADY_PROCESSED: [
      409,
      {
        ar: "تمت معالجة هذا الطلب من قبل. حدّث المحادثة لعرض النتيجة.",
        en: "This request was already processed. Refresh the conversation to view the result.",
      },
    ],
    PAYMENT_MISMATCH: [
      400,
      {
        ar: "بيانات عملية الدفع لا تطابق الباقة أو الحساب الحالي، لذلك لم تتم إضافة الرصيد.",
        en: "The payment does not match the selected package or current account, so no balance was added.",
      },
    ],
    PAYMENT_FAILED: [
      502,
      {
        ar: "تعذر إتمام الدفع عبر Pi حاليًا. لم تتم إضافة أو خصم رصيد؛ حاول مرة أخرى.",
        en: "The Pi payment could not be completed right now. No balance was added or deducted; try again.",
      },
    ],
  };

  const entry = messages[code];
  if (!entry) return null;
  return {
    status: entry[0],
    message: entry[1][language],
    code,
    meta: {
      ...(required ? { requiredTokens: required } : {}),
      ...(available ||
      code === "INSUFFICIENT_TOKENS" ||
      code === "INSUFFICIENT_TOKENS_FOR_REQUEST"
        ? { availableTokens: available }
        : {}),
      ...(shortfall ? { shortfall } : {}),
    },
  };
}

export function providerPayloadText(payload) {
  if (typeof payload === "string") return payload.slice(0, 1000);
  return String(
    payload?.error?.message ||
      payload?.message ||
      payload?.error_description ||
      payload?.error ||
      "",
  ).slice(0, 1000);
}

export function openRouterError(status, payload, options = {}) {
  const message = providerPayloadText(payload);
  const lower = message.toLowerCase();
  const kind = options.kind === "image" ? "image" : "chat";
  let code = "PROVIDER_ERROR";

  if (status === 401) code = "PROVIDER_AUTH_ERROR";
  else if (
    status === 402 ||
    /insufficient credits|credit balance|add more credits|payment required/.test(
      lower,
    )
  )
    code = "PROVIDER_CREDITS_EXHAUSTED";
  else if (
    status === 403 &&
    /moderation|policy|content|guardrail|safety|flagged|blocked/.test(lower)
  )
    code = "CONTENT_BLOCKED";
  else if (status === 403) code = "PROVIDER_PERMISSION_DENIED";
  else if (status === 404)
    code = kind === "image" ? "IMAGE_MODEL_UNAVAILABLE" : "MODEL_UNAVAILABLE";
  else if (status === 408 || status === 504 || /timed? out|timeout/.test(lower))
    code = "REQUEST_TIMEOUT";
  else if (
    status === 413 ||
    /payload too large|file too large|attachment too large/.test(lower)
  )
    code = "ATTACHMENT_TOO_LARGE";
  else if (
    status === 429 ||
    /rate limit|too many requests|requests per minute|requests per day/.test(
      lower,
    )
  )
    code = "RATE_LIMITED";
  else if (
    /context length|maximum context|too many tokens|prompt is too long|token limit/.test(
      lower,
    )
  )
    code = "CONTEXT_TOO_LONG";
  else if (
    /moderation|content policy|safety|guardrail|flagged|blocked/.test(lower)
  )
    code = "CONTENT_BLOCKED";
  else if (
    /model .*not found|unknown model|model unavailable|model is unavailable|model.*down/.test(
      lower,
    )
  )
    code = kind === "image" ? "IMAGE_MODEL_UNAVAILABLE" : "MODEL_UNAVAILABLE";
  else if (
    status === 503 ||
    /no providers available|no available providers|provider unavailable/.test(
      lower,
    )
  )
    code = "NO_PROVIDER_AVAILABLE";
  else if (status === 400) code = "INVALID_REQUEST";
  else if (status >= 500) code = "PROVIDER_ERROR";

  return appError(code, {
    providerStatus: Number(status) || 0,
    kind,
    internalMessage: message,
  });
}

export function piApiError(status, payload, options = {}) {
  const message = providerPayloadText(payload).toLowerCase();
  const operation = options.operation === "login" ? "login" : "payment";
  let code = operation === "login" ? "PI_LOGIN_FAILED" : "PAYMENT_FAILED";
  if (status === 401 || status === 403)
    code =
      operation === "login" ? "UNAUTHORIZED" : "PAYMENT_PROVIDER_AUTH_ERROR";
  else if (status === 404)
    code = operation === "login" ? "PI_LOGIN_FAILED" : "PAYMENT_INVALID";
  else if (
    status === 408 ||
    status === 504 ||
    /timed? out|timeout/.test(message)
  )
    code = "REQUEST_TIMEOUT";
  else if (
    operation === "payment" &&
    (status === 409 ||
      /pending|not completed|not approved|transaction.*missing/.test(message))
  )
    code = "PAYMENT_PENDING";
  else if (status === 429 || /rate limit|too many requests/.test(message))
    code = "RATE_LIMITED";
  else if (status >= 500) code = "PI_SERVICE_UNAVAILABLE";
  return appError(code, {
    providerStatus: Number(status) || 0,
    internalMessage: providerPayloadText(payload),
  });
}

export function shouldTryModelFallback(error) {
  const code = normalizedErrorCode(error);
  return [
    "MODEL_UNAVAILABLE",
    "NO_PROVIDER_AVAILABLE",
    "PROVIDER_ERROR",
    "REQUEST_TIMEOUT",
  ].includes(code);
}

export function handleError(
  error,
  res,
  fallback = "Server error",
  locale = "ar",
) {
  const details = errorDetails(error, locale);
  if (details) {
    const internal =
      error?.cause?.message || error?.meta?.internalMessage || "";
    console.warn(`[${details.code}]${internal ? ` ${internal}` : ""}`);
    return json(res, details.status, {
      error: details.message,
      code: details.code,
      ...details.meta,
    });
  }
  console.error(error);
  return json(res, 500, { error: fallback, code: "SERVER_ERROR" });
}
import { localize } from "./http.js";
