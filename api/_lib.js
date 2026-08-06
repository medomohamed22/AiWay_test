import { createClient } from '@supabase/supabase-js';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const jwtSecret = process.env.APP_JWT_SECRET;
const JWT_ISSUER = 'aiway';
const APP_TOKEN_AUDIENCE = 'aiway-api';
const ADMIN_TOKEN_AUDIENCE = 'aiway-admin';
const DOWNLOAD_TOKEN_AUDIENCE = 'aiway-download';
const APP_SESSION_TTL = '24h';

export function requireEnv() {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!jwtSecret || jwtSecret.length < 32) missing.push('APP_JWT_SECRET');
  if (missing.length) throw appError('MISSING_CONFIGURATION', { missing });
}

export function db() {
  requireEnv();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
}


function escapeTelegramHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function formatCairoDateTime(value = new Date()) {
  try {
    return new Intl.DateTimeFormat('ar-EG-u-nu-latn', {
      timeZone: 'Africa/Cairo', dateStyle: 'medium', timeStyle: 'medium'
    }).format(new Date(value));
  } catch {
    return new Date(value).toISOString();
  }
}

export async function sendTelegramNotification(html) {
  const botToken = String(process.env.TELEGRAM_BOT_TOKEN || '').trim();
  const chatId = String(process.env.TELEGRAM_CHAT_ID || '').trim();
  if (!botToken || !chatId) return { sent: false, skipped: true };
  try {
    const response = await fetchWithTimeout(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: String(html || '').slice(0, 3900),
          parse_mode: 'HTML',
          disable_web_page_preview: true
        })
      },
      10000
    );
    if (!response.ok) {
      const payload = await response.text().catch(() => '');
      console.error('[TELEGRAM_NOTIFICATION_FAILED]', response.status, payload.slice(0, 500));
      return { sent: false, status: response.status };
    }
    return { sent: true };
  } catch (error) {
    console.error('[TELEGRAM_NOTIFICATION_FAILED]', error?.message || error);
    return { sent: false };
  }
}

export function telegramHtml(value) {
  return escapeTelegramHtml(value);
}

export function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  return res.end(JSON.stringify(body));
}


export async function fetchWithTimeout(url, options = {}, timeoutMs = 15000) {
  const timeout = Math.max(1, Number(timeoutMs) || 15000);
  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(new DOMException('Request timed out', 'TimeoutError')), timeout);
  const callerSignal = options?.signal;
  const signal = callerSignal
    ? (typeof AbortSignal.any === 'function'
        ? AbortSignal.any([callerSignal, timeoutController.signal])
        : timeoutController.signal)
    : timeoutController.signal;

  let abortFromCaller;
  if (callerSignal && typeof AbortSignal.any !== 'function') {
    abortFromCaller = () => timeoutController.abort(callerSignal.reason);
    if (callerSignal.aborted) abortFromCaller();
    else callerSignal.addEventListener('abort', abortFromCaller, { once: true });
  }

  try {
    return await fetch(url, { ...options, signal });
  } finally {
    clearTimeout(timer);
    if (callerSignal && abortFromCaller) callerSignal.removeEventListener('abort', abortFromCaller);
  }
}

export function allowMethods(req, res, methods) {
  if (methods.includes(req.method)) return true;
  res.setHeader('Allow', methods.join(', '));
  const locale = requestLocale(req);
  json(res, 405, {
    error: localize(locale, 'طريقة الطلب غير مسموح بها.', 'This request method is not allowed.'),
    code: 'METHOD_NOT_ALLOWED'
  });
  return false;
}

export async function signAppToken(user) {
  requireEnv();
  return new SignJWT({ username: user.username, pi_uid: user.pi_uid, role: user.role })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(JWT_ISSUER)
    .setAudience(APP_TOKEN_AUDIENCE)
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(APP_SESSION_TTL)
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function createDownloadTicket(payload, expiresIn = '2m') {
  requireEnv();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(JWT_ISSUER)
    .setAudience(DOWNLOAD_TOKEN_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function verifyDownloadTicket(token) {
  requireEnv();
  if (!token) throw appError('UNAUTHORIZED');
  try {
    const { payload } = await jwtVerify(String(token), new TextEncoder().encode(jwtSecret), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: DOWNLOAD_TOKEN_AUDIENCE
    });
    if (!payload.sub || !payload.kind || (!payload.messageId && !payload.imageId)) throw appError('UNAUTHORIZED');
    return payload;
  } catch (error) {
    if (error?.code === 'UNAUTHORIZED') throw error;
    throw appError('UNAUTHORIZED', {}, error);
  }
}

export async function requireUser(req) {
  requireEnv();
  const authorization = req.headers.authorization || '';
  const headerToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  // Native browser downloads cannot attach an Authorization header. For the two
  // attachment-only POST routes, the signed app token is sent in the HTTPS form body.
  const bodyToken = req.method === 'POST' && String(req.body?.action || '').startsWith('download-')
    ? String(req.body?.authToken || '')
    : '';
  const token = headerToken || bodyToken;
  if (!token) throw appError('UNAUTHORIZED');
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: APP_TOKEN_AUDIENCE
    });
    if (!payload.sub) throw appError('UNAUTHORIZED');

    // Never trust authorization-relevant claims from a stale token. Confirm that the
    // account still exists and read the current role from the database on every request.
    const { data: currentUser, error } = await db()
      .from('users')
      .select('id,username,pi_uid,role')
      .eq('id', payload.sub)
      .maybeSingle();
    if (error || !currentUser) throw appError('UNAUTHORIZED');
    return currentUser;
  } catch (error) {
    if (error?.code === 'UNAUTHORIZED') throw error;
    throw appError('UNAUTHORIZED', {}, error);
  }
}

export async function requireAdmin(user) {
  if (!user?.id) throw appError('FORBIDDEN');
  const { data, error } = await db().from('users').select('role').eq('id', user.id).single();
  if (error || data?.role !== 'admin') throw appError('FORBIDDEN');
}


export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  try {
    const [type, salt, hash] = String(stored || '').split(':');
    if (type !== 'scrypt' || !salt || !hash) return false;
    const actual = scryptSync(String(password), salt, 64);
    const expected = Buffer.from(hash, 'hex');
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch { return false; }
}

export async function signAdminToken(admin) {
  requireEnv();
  return new SignJWT({ role: 'admin', email: admin.email, admin: true })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuer(JWT_ISSUER)
    .setAudience(ADMIN_TOKEN_AUDIENCE)
    .setSubject(admin.id).setIssuedAt().setExpirationTime('12h')
    .sign(new TextEncoder().encode(jwtSecret));
}

export async function requireAdminToken(req) {
  requireEnv();
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw appError('UNAUTHORIZED');
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret), {
      algorithms: ['HS256'],
      issuer: JWT_ISSUER,
      audience: ADMIN_TOKEN_AUDIENCE
    });
    if (!payload.sub || payload.role !== 'admin' || !payload.admin) throw appError('FORBIDDEN');
    const { data: admin, error } = await db().from('admin_accounts').select('id,email,is_active').eq('id', payload.sub).maybeSingle();
    if (error || !admin?.is_active) throw appError('FORBIDDEN');
    return { ...payload, email: admin.email };
  } catch (error) {
    if (error?.code === 'FORBIDDEN') throw error;
    throw appError('UNAUTHORIZED', {}, error);
  }
}

export function cleanText(value, max = 500) {
  return String(value ?? '').trim().slice(0, max);
}

export function requestLocale(req) {
  const value = req?.body?.locale || req?.query?.locale || req?.headers?.['x-ui-language'] || req?.headers?.['accept-language'] || 'ar';
  return String(value).toLowerCase().startsWith('en') ? 'en' : 'ar';
}

export function localize(locale, ar, en) {
  return String(locale).toLowerCase().startsWith('en') ? en : ar;
}

export function appError(code, meta = {}, cause = null) {
  const error = new Error(String(code || 'SERVER_ERROR'));
  error.code = String(code || 'SERVER_ERROR');
  error.meta = meta && typeof meta === 'object' ? meta : {};
  if (cause) error.cause = cause;
  return error;
}

function safeInteger(value) {
  const number = Math.max(0, Math.ceil(Number(value) || 0));
  return Number.isFinite(number) ? number : 0;
}

function formatTokens(value, language) {
  return safeInteger(value).toLocaleString('en-US');
}

function normalizedErrorCode(error) {
  const raw = String(error?.code || error?.message || error || '').trim();
  if (raw.startsWith('MODEL_ROUTE_MISMATCH:')) return 'MODEL_ROUTE_MISMATCH';
  if (/missing environment variables/i.test(raw)) return 'MISSING_CONFIGURATION';
  if (/aborterror|aborted|timed?\s*out|timeout/i.test(`${error?.name || ''} ${raw}`)) return 'REQUEST_TIMEOUT';
  if (/fetch failed|networkerror|econnreset|econnrefused|enotfound|socket hang up/i.test(raw)) return 'NETWORK_ERROR';
  if (/pgrst|postgres|supabase|relation .* does not exist|database/i.test(raw)) return 'DATABASE_ERROR';
  if (/(?:free[_ -]?tier|trial).*(?:not available|unsupported|limit\s*[:=]\s*0)|(?:not available|unsupported).*free[_ -]?tier/i.test(raw)) return 'MODEL_NOT_AVAILABLE_FREE_TIER';
  if (/resource_exhausted|quota exceeded|exceeded your current quota|rate limit/i.test(raw)) return 'RATE_LIMITED';
  if (/permission_denied|does not have access|not authorized|access denied/i.test(raw)) return 'PROVIDER_PERMISSION_DENIED';
  if (/model.*(?:not found|not available|unsupported)|not found.*model/i.test(raw)) return 'MODEL_UNAVAILABLE';
  return raw;
}

export function errorDetails(error, locale = 'ar') {
  const language = String(locale).toLowerCase().startsWith('en') ? 'en' : 'ar';
  const code = normalizedErrorCode(error);
  const meta = error?.meta && typeof error.meta === 'object' ? error.meta : {};
  const available = safeInteger(meta.availableTokens);
  const required = safeInteger(meta.requiredTokens || meta.estimatedTokens);
  const shortfall = safeInteger(meta.shortfall || Math.max(0, required - available));

  const balanceFinished = {
    ar: 'رصيدك انتهى. اشحن رصيدًا جديدًا ثم أعد إرسال الرسالة.',
    en: 'Your balance has run out. Add more balance, then send the message again.'
  };
  const insufficientForRequest = {
    ar: `رصيدك الحالي ${formatTokens(available, language)} توكن، بينما التكلفة التقديرية لهذا الطلب نحو ${formatTokens(required, language)} توكن. اشحن ${formatTokens(shortfall, language)} توكن إضافي على الأقل ثم حاول مرة أخرى.`,
    en: `Your current balance is ${formatTokens(available, language)} tokens, while this request is estimated to need about ${formatTokens(required, language)} tokens. Add at least ${formatTokens(shortfall, language)} more tokens and try again.`
  };

  const messages = {
    METHOD_NOT_ALLOWED: [405, { ar: 'طريقة الطلب غير مسموح بها.', en: 'This request method is not allowed.' }],
    INVALID_REQUEST: [400, { ar: 'بيانات الطلب غير مكتملة أو غير صحيحة. راجع المدخلات وحاول مرة أخرى.', en: 'The request data is incomplete or invalid. Check the inputs and try again.' }],
    INVALID_CHAT_REQUEST: [400, { ar: 'تعذر إرسال الرسالة لأن بيانات المحادثة غير مكتملة. حدّث الصفحة وحاول مرة أخرى.', en: 'The message could not be sent because the chat data is incomplete. Refresh the page and try again.' }],
    INVALID_IMAGE_REQUEST: [400, { ar: 'بيانات طلب الصورة غير مكتملة. اكتب وصفًا واضحًا ثم حاول مرة أخرى.', en: 'The image request is incomplete. Enter a clear description and try again.' }],
    UNAUTHORIZED: [401, { ar: 'انتهت جلسة تسجيل الدخول أو لم تبدأ بعد. سجّل الدخول بحساب Pi ثم حاول مرة أخرى.', en: 'Your sign-in session is missing or expired. Sign in with Pi and try again.' }],
    FORBIDDEN: [403, { ar: 'ليس لديك صلاحية لتنفيذ هذا الإجراء.', en: 'You do not have permission to perform this action.' }],
    INSUFFICIENT_TOKENS: [402, available <= 0 ? balanceFinished : {
      ar: 'رصيدك غير كافٍ لإتمام الطلب. اشحن رصيدًا إضافيًا ثم حاول مرة أخرى.',
      en: 'Your balance is insufficient to complete the request. Add more balance and try again.'
    }],
    INSUFFICIENT_TOKENS_FOR_REQUEST: [402, insufficientForRequest],
    LOW_BALANCE: [200, {
      ar: `رصيدك أوشك على النفاد: متبقٍ ${formatTokens(available, language)} توكن. اشحن رصيدًا لتجنب توقف الرسائل.`,
      en: `Your balance is running low: ${formatTokens(available, language)} tokens remain. Add balance to avoid interruptions.`
    }],
    PROVIDER_CREDITS_EXHAUSTED: [503, {
      ar: 'رصيد مزود الذكاء الاصطناعي انتهى مؤقتًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay لإعادة شحن الخدمة.',
      en: 'The AI provider balance is temporarily exhausted. Your balance was not charged; contact AiWay support so the service can be topped up.'
    }],
    OPENROUTER_CREDITS_EXHAUSTED: [503, {
      ar: 'رصيد مزود الذكاء الاصطناعي انتهى مؤقتًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay لإعادة شحن الخدمة.',
      en: 'The AI provider balance is temporarily exhausted. Your balance was not charged; contact AiWay support so the service can be topped up.'
    }],
    PROVIDER_AUTH_ERROR: [503, {
      ar: 'إعداد الاتصال بمزود الذكاء الاصطناعي غير صالح حاليًا. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay.',
      en: 'The AI provider connection is not configured correctly right now. Your balance was not charged; contact AiWay support.'
    }],
    PROVIDER_PERMISSION_DENIED: [503, {
      ar: 'مزود الذكاء الاصطناعي رفض تشغيل هذه الخدمة بالحساب الحالي. لن يتم خصم رصيدك؛ تواصل مع إدارة AiWay.',
      en: 'The AI provider rejected this service for the current account. Your balance was not charged; contact AiWay support.'
    }],
    FREE_DAILY_LIMIT: [429, {
      ar: 'استخدمت 30 طلبًا مجانيًا اليوم. اختر نموذجًا آخر للمتابعة، وستتجدد الطلبات المجانية تلقائيًا غدًا.',
      en: 'You have used all 30 free requests for today. Choose another model to continue; your free requests reset automatically tomorrow.'
    }],
    RATE_LIMITED: [429, {
      ar: 'هناك ضغط مرتفع أو تم بلوغ حد الطلبات مؤقتًا. انتظر قليلًا ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.',
      en: 'The service is busy or its request limit was reached temporarily. Wait a moment and try again; your balance was not charged.'
    }],
    REQUEST_TIMEOUT: [504, {
      ar: 'استغرق الطلب وقتًا أطول من المسموح. حاول مرة أخرى برسالة أقصر أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.',
      en: 'The request took too long. Try a shorter message or choose another model; your balance was not charged.'
    }],
    NETWORK_ERROR: [503, {
      ar: 'تعذر الاتصال بالخدمة. تحقق من الإنترنت ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.',
      en: 'Could not connect to the service. Check your internet connection and try again; your balance was not charged.'
    }],
    MODEL_LOCKED: [403, {
      ar: 'هذا النموذج متاح بعد أول عملية شراء. استخدم نموذج التجربة المجانية أو اشحن رصيدًا لفتح جميع النماذج.',
      en: 'This model unlocks after your first purchase. Use the free-trial model or add balance to unlock all models.'
    }],
    MODEL_UNAVAILABLE: [503, {
      ar: 'النموذج المختار غير متاح حاليًا. حدّث قائمة النماذج واختر نموذجًا آخر؛ لم يتم خصم رصيدك.',
      en: 'The selected model is currently unavailable. Refresh the model list and choose another model; your balance was not charged.'
    }],
    MODEL_NOT_AVAILABLE_FREE_TIER: [402, {
      ar: 'هذا النموذج غير متاح ضمن التجربة المجانية لهذا المشروع. فعّل الفوترة في Google AI Studio أو اختر نموذجًا مجانيًا آخر؛ لم يتم خصم رصيدك.',
      en: 'This model is not available on the free tier for this project. Enable billing in Google AI Studio or choose another free-tier model; your balance was not charged.'
    }],
    IMAGE_MODEL_UNAVAILABLE: [503, {
      ar: 'نموذج الصور المختار غير متاح حاليًا. حدّث قائمة النماذج واختر نموذج صور آخر؛ لم يتم خصم رصيدك.',
      en: 'The selected image model is currently unavailable. Refresh the model list and choose another image model; your balance was not charged.'
    }],
    NO_PROVIDER_AVAILABLE: [503, {
      ar: 'لا يوجد مزود متاح لهذا النموذج حاليًا. اختر نموذجًا آخر أو حاول بعد قليل؛ لم يتم خصم رصيدك.',
      en: 'No provider is currently available for this model. Choose another model or try again shortly; your balance was not charged.'
    }],
    PROVIDER_ERROR: [502, {
      ar: 'حدث عطل مؤقت لدى مزود الذكاء الاصطناعي. حاول مرة أخرى أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.',
      en: 'The AI provider had a temporary failure. Try again or choose another model; your balance was not charged.'
    }],
    STREAM_INTERRUPTED: [502, {
      ar: 'انقطع الاتصال أثناء كتابة الإجابة. أعد المحاولة؛ لن يُخصم رصيد عن الرد غير المكتمل.',
      en: 'The connection was interrupted while the answer was being written. Try again; an incomplete response will not be charged.'
    }],
    EMPTY_RESPONSE: [502, {
      ar: 'لم يُرجع النموذج إجابة صالحة. حاول مرة أخرى أو اختر نموذجًا آخر؛ لم يتم خصم رصيدك.',
      en: 'The model did not return a valid answer. Try again or choose another model; your balance was not charged.'
    }],
    CONTENT_BLOCKED: [400, {
      ar: 'رفض مزود الذكاء هذا الطلب بسبب سياسات المحتوى. عدّل صياغة الرسالة أو المرفق ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.',
      en: 'The AI provider blocked this request under its content policies. Revise the message or attachment and try again; your balance was not charged.'
    }],
    CONTEXT_TOO_LONG: [413, {
      ar: 'المحادثة أو المرفقات أكبر من سعة النموذج. اختصر الرسالة، ابدأ محادثة جديدة، أو استخدم مرفقًا أصغر.',
      en: 'The conversation or attachments exceed the model capacity. Shorten the message, start a new chat, or use a smaller attachment.'
    }],
    ATTACHMENT_TOO_LARGE: [413, {
      ar: 'حجم المرفق أكبر من المسموح. قلّل الحجم أو أرسل عددًا أقل من الملفات ثم حاول مرة أخرى.',
      en: 'The attachment is larger than allowed. Reduce its size or send fewer files and try again.'
    }],
    INVALID_ATTACHMENT: [400, {
      ar: 'صيغة أحد المرفقات غير مدعومة أو بياناته غير صالحة. احذف المرفق وأعد رفعه بصيغة أخرى.',
      en: 'An attachment has an unsupported format or invalid data. Remove it and upload it again in another format.'
    }],
    REFERENCE_IMAGE_UNSUPPORTED: [400, {
      ar: 'النموذج المختار لا يدعم الصور المرجعية. اختر نموذج صور يدعم إدخال الصور.',
      en: 'The selected model does not support reference images. Choose an image model that accepts image input.'
    }],
    SEARCH_MODEL_UNSUPPORTED: [400, { ar: 'ميزة البحث غير متوفرة مع النموذج المختار حاليًا. اختر نموذجًا آخر ثم أعد المحاولة؛ لم يتم خصم رصيدك.', en: 'Search is not currently available with the selected model. Choose another model and try again; your balance was not charged.' }],
    SEARCH_BILLING_REQUIRED: [402, { ar: 'ميزة البحث غير متوفرة حاليًا. حاول لاحقًا أو أرسل طلبك بدون البحث؛ لم يتم خصم رصيدك.', en: 'Search is currently unavailable. Try again later or send your request without search; your balance was not charged.' }],
    TRIAL_WEB_LOCKED: [403, { ar: 'بحث الويب متاح بعد أول عملية شراء.', en: 'Web search unlocks after your first purchase.' }],
    TRIAL_ENDED: [402, {
      ar: 'انتهت رسائلك التجريبية. اشحن رصيدًا لفتح جميع النماذج ومتابعة الاستخدام.',
      en: 'Your free-trial messages have ended. Add balance to unlock all models and continue.'
    }],
    MODEL_ROUTE_MISMATCH: [502, {
      ar: 'أعاد المزود نموذجًا مختلفًا عن النموذج المختار، لذلك أُوقف الطلب ولم يتم خصم رصيدك.',
      en: 'The provider returned a different model than the one selected, so the request was stopped and your balance was not charged.'
    }],
    FILE_NOT_FOUND: [404, { ar: 'الملف غير موجود أو لم يعد متاحًا.', en: 'The file was not found or is no longer available.' }],
    IMAGE_NOT_FOUND: [404, { ar: 'الصورة غير موجودة أو لم تعد متاحة.', en: 'The image was not found or is no longer available.' }],
    DATABASE_ERROR: [503, {
      ar: 'تعذر حفظ البيانات حاليًا. حاول مرة أخرى بعد قليل؛ لن يتم خصم رصيدك عن طلب لم يُحفظ.',
      en: 'The data could not be saved right now. Try again shortly; a request that was not saved will not be charged.'
    }],
    MISSING_CONFIGURATION: [503, {
      ar: 'إعدادات الخدمة على الخادم غير مكتملة. تواصل مع إدارة AiWay.',
      en: 'The server configuration is incomplete. Contact AiWay support.'
    }],
    OKX_PRICE_UNAVAILABLE: [503, {
      ar: 'تعذر جلب سعر Pi حاليًا. انتظر قليلًا ثم أعد فتح نافذة الشحن.',
      en: 'The Pi price is currently unavailable. Wait a moment, then reopen the top-up window.'
    }],
    PAYMENT_INVALID: [400, { ar: 'بيانات الدفعة أو الباقة غير صحيحة.', en: 'The payment or package details are invalid.' }],
    PAYMENT_PENDING: [409, {
      ar: 'الدفعة لم تصل إلى الشبكة بعد. أكملها من المحفظة ثم أعد إنهاء الدفعات المعلقة.',
      en: 'The payment has not reached the network yet. Complete it in your wallet, then finish pending payments again.'
    }],
    PI_LOGIN_FAILED: [401, {
      ar: 'تعذر التحقق من حساب Pi. افتح الموقع داخل Pi Browser وسجّل الدخول من جديد.',
      en: 'Could not verify your Pi account. Open the site in Pi Browser and sign in again.'
    }],
    PI_SERVICE_UNAVAILABLE: [503, {
      ar: 'خدمة Pi غير متاحة مؤقتًا. لم يتغير رصيدك؛ حاول مرة أخرى بعد قليل.',
      en: 'The Pi service is temporarily unavailable. Your balance was not changed; try again shortly.'
    }],
    PAYMENT_PROVIDER_AUTH_ERROR: [503, {
      ar: 'إعدادات الدفع عبر Pi على الخادم غير صالحة حاليًا. لم يتغير رصيدك؛ تواصل مع إدارة AiWay.',
      en: 'The server-side Pi payment settings are currently invalid. Your balance was not changed; contact AiWay support.'
    }],
    REQUEST_IN_PROGRESS: [409, { ar: 'يوجد طلب ذكاء قيد التنفيذ بالفعل. انتظر اكتماله ثم أرسل طلبًا جديدًا.', en: 'An AI request is already in progress. Let it finish before sending another.' }],
    REQUEST_ALREADY_PROCESSED: [409, { ar: 'تمت معالجة هذا الطلب من قبل. حدّث المحادثة لعرض النتيجة.', en: 'This request was already processed. Refresh the conversation to view the result.' }],
    PAYMENT_MISMATCH: [400, { ar: 'بيانات عملية الدفع لا تطابق الباقة أو الحساب الحالي، لذلك لم تتم إضافة الرصيد.', en: 'The payment does not match the selected package or current account, so no balance was added.' }],
    PAYMENT_FAILED: [502, {
      ar: 'تعذر إتمام الدفع عبر Pi حاليًا. لم تتم إضافة أو خصم رصيد؛ حاول مرة أخرى.',
      en: 'The Pi payment could not be completed right now. No balance was added or deducted; try again.'
    }]
  };

  const entry = messages[code];
  if (!entry) return null;
  return {
    status: entry[0],
    message: entry[1][language],
    code,
    meta: {
      ...(required ? { requiredTokens: required } : {}),
      ...(available || code === 'INSUFFICIENT_TOKENS' || code === 'INSUFFICIENT_TOKENS_FOR_REQUEST' ? { availableTokens: available } : {}),
      ...(shortfall ? { shortfall } : {})
    }
  };
}

function providerPayloadText(payload) {
  if (typeof payload === 'string') return payload.slice(0, 1000);
  return String(payload?.error?.message || payload?.message || payload?.error_description || payload?.error || '').slice(0, 1000);
}

export function openRouterError(status, payload, options = {}) {
  const message = providerPayloadText(payload);
  const lower = message.toLowerCase();
  const kind = options.kind === 'image' ? 'image' : 'chat';
  let code = 'PROVIDER_ERROR';

  if (status === 401) code = 'PROVIDER_AUTH_ERROR';
  else if (status === 402 || /insufficient credits|credit balance|add more credits|payment required/.test(lower)) code = 'PROVIDER_CREDITS_EXHAUSTED';
  else if (status === 403 && /moderation|policy|content|guardrail|safety|flagged|blocked/.test(lower)) code = 'CONTENT_BLOCKED';
  else if (status === 403) code = 'PROVIDER_PERMISSION_DENIED';
  else if (status === 404) code = kind === 'image' ? 'IMAGE_MODEL_UNAVAILABLE' : 'MODEL_UNAVAILABLE';
  else if (status === 408 || status === 504 || /timed? out|timeout/.test(lower)) code = 'REQUEST_TIMEOUT';
  else if (status === 413 || /payload too large|file too large|attachment too large/.test(lower)) code = 'ATTACHMENT_TOO_LARGE';
  else if (status === 429 || /rate limit|too many requests|requests per minute|requests per day/.test(lower)) code = 'RATE_LIMITED';
  else if (/context length|maximum context|too many tokens|prompt is too long|token limit/.test(lower)) code = 'CONTEXT_TOO_LONG';
  else if (/moderation|content policy|safety|guardrail|flagged|blocked/.test(lower)) code = 'CONTENT_BLOCKED';
  else if (/model .*not found|unknown model|model unavailable|model is unavailable|model.*down/.test(lower)) code = kind === 'image' ? 'IMAGE_MODEL_UNAVAILABLE' : 'MODEL_UNAVAILABLE';
  else if (status === 503 || /no providers available|no available providers|provider unavailable/.test(lower)) code = 'NO_PROVIDER_AVAILABLE';
  else if (status === 400) code = 'INVALID_REQUEST';
  else if (status >= 500) code = 'PROVIDER_ERROR';

  return appError(code, { providerStatus: Number(status) || 0, kind, internalMessage: message });
}

export function piApiError(status, payload, options = {}) {
  const message = providerPayloadText(payload).toLowerCase();
  const operation = options.operation === 'login' ? 'login' : 'payment';
  let code = operation === 'login' ? 'PI_LOGIN_FAILED' : 'PAYMENT_FAILED';
  if (status === 401 || status === 403) code = operation === 'login' ? 'UNAUTHORIZED' : 'PAYMENT_PROVIDER_AUTH_ERROR';
  else if (status === 404) code = operation === 'login' ? 'PI_LOGIN_FAILED' : 'PAYMENT_INVALID';
  else if (status === 408 || status === 504 || /timed? out|timeout/.test(message)) code = 'REQUEST_TIMEOUT';
  else if (operation === 'payment' && (status === 409 || /pending|not completed|not approved|transaction.*missing/.test(message))) code = 'PAYMENT_PENDING';
  else if (status === 429 || /rate limit|too many requests/.test(message)) code = 'RATE_LIMITED';
  else if (status >= 500) code = 'PI_SERVICE_UNAVAILABLE';
  return appError(code, { providerStatus: Number(status) || 0, internalMessage: providerPayloadText(payload) });
}

export function shouldTryModelFallback(error) {
  const code = normalizedErrorCode(error);
  return ['MODEL_UNAVAILABLE', 'NO_PROVIDER_AVAILABLE', 'PROVIDER_ERROR', 'REQUEST_TIMEOUT'].includes(code);
}

export function handleError(error, res, fallback = 'Server error', locale = 'ar') {
  const details = errorDetails(error, locale);
  if (details) {
    const internal = error?.cause?.message || error?.meta?.internalMessage || '';
    console.warn(`[${details.code}]${internal ? ` ${internal}` : ''}`);
    return json(res, details.status, { error: details.message, code: details.code, ...details.meta });
  }
  console.error(error);
  return json(res, 500, { error: fallback, code: 'SERVER_ERROR' });
}

// Each AiWay token represents $0.00001 of the actual provider cost through OpenRouter.
// Purchases keep the original 50/50 split: $1 buys $0.50 of provider capacity.
export const TOKEN_USD = 0.00001;
export const PROVIDER_BUDGET_SHARE = 0.44;
export const MARKUP = 1 / PROVIDER_BUDGET_SHARE;
export const TRIAL_MESSAGE_LIMIT = 10;
export const TRIAL_TOKENS = 10;
export const PI_PRICE_BUFFER = 0.05;
export const TRIAL_MODEL_FALLBACK = 'openrouter/free';
const tokensForUsd = usd => Math.floor(Number(usd) * PROVIDER_BUDGET_SHARE / TOKEN_USD);
export const PACKAGES = {
  lite: { name_ar:'لايت', name_en:'Lite', usd:2, tokens:tokensForUsd(2), recommendedFor:'light' },
  starter: { name_ar:'ستارتر', name_en:'Starter', usd:5, tokens:tokensForUsd(5), recommendedFor:'regular' },
  plus: { name_ar:'بلس', name_en:'Plus', usd:10, tokens:tokensForUsd(10), recommendedFor:'advanced', popular:true },
  pro: { name_ar:'برو', name_en:'Pro', usd:20, tokens:tokensForUsd(20), recommendedFor:'power' }
};

// OpenRouter catalog. Prices are normalized to USD per token; image pricing is USD per request/megapixel when exposed.
const CURATED_MODEL_IDS = [
  'deepseek/deepseek-v4-flash',
  'openai/gpt-5.4', 'openai/gpt-5.4-mini', 'openai/gpt-5.4-nano',
  'google/gemini-3.1-pro-preview', 'google/gemini-3.1-flash-lite-preview',
  'x-ai/grok-4.1-fast', 'x-ai/grok-4',
  'deepseek/deepseek-v4', 'deepseek/deepseek-r1-0528',
  'z-ai/glm-5', 'z-ai/glm-4.7',
  'anthropic/claude-opus-4.6', 'anthropic/claude-sonnet-4.6',
  'qwen/qwen3.5-397b-a17b', 'meta-llama/llama-4-maverick'
];
const FALLBACK_OPENROUTER_MODELS = [
  {id:'deepseek/deepseek-v4-flash',name:'DeepSeek V4 Flash',description:'سريع واقتصادي للبرمجة والتلخيص والكتابة والمهام العامة.',contextLength:1048576,pricing:{prompt:0.08806/1e6,completion:0.1761/1e6},inputModalities:['text'],outputModalities:['text'],provider:'deepseek'},
  {id:'openrouter/free',name:'OpenRouter Free Router',description:'يوجّه الطلب إلى نموذج مجاني متاح يدعم خصائص الطلب.',contextLength:128000,pricing:{prompt:0,completion:0},inputModalities:['text','image','files'],outputModalities:['text'],provider:'openrouter'},
  {id:'openrouter/auto',name:'OpenRouter Auto',description:'اختيار تلقائي ذكي من OpenRouter.',contextLength:128000,pricing:{prompt:1/1e6,completion:3/1e6},inputModalities:['text','image','files'],outputModalities:['text'],provider:'openrouter'}
];

function normalizeOpenRouterModel(model){
  const architecture=model?.architecture||{}; const pricing=model?.pricing||{};
  const num=v=>{const n=Number(v);return Number.isFinite(n)&&n>=0?n:0};
  const provider=String(model?.id||'').split('/')[0]||'openrouter';
  return {
    id:String(model.id), name:String(model.name||model.id), description:String(model.description||''),
    created:Number(model.created||0), contextLength:Number(model.context_length||model.contextLength||0),
    pricing:{prompt:num(pricing.prompt),completion:num(pricing.completion),request:num(pricing.request),image:num(pricing.image),image_output:num(pricing.image_output),output_image:num(pricing.output_image),megapixel:num(pricing.megapixel),web_search:num(pricing.web_search)},
    inputModalities:Array.isArray(architecture.input_modalities)?architecture.input_modalities:['text'],
    outputModalities:Array.isArray(architecture.output_modalities)?architecture.output_modalities:['text'],
    supported_parameters:model.supported_parameters||{}, provider, providerLabel:provider,
    tier:String(model.id).endsWith(':free')?'free':'stable'
  };
}

let modelCatalogCache={expires:0,data:null};
export async function getAvailableModels(){
  if(modelCatalogCache.data&&Date.now()<modelCatalogCache.expires)return modelCatalogCache.data.map(x=>({...x,pricing:{...x.pricing}}));
  try{
    const response=await fetchWithTimeout('https://openrouter.ai/api/v1/models?output_modalities=text',{headers:{Accept:'application/json'}},15000);
    if(!response.ok)throw new Error(`OpenRouter models ${response.status}`);
    const payload=await response.json();
    const all=(Array.isArray(payload?.data)?payload.data:[]).map(normalizeOpenRouterModel).filter(x=>x.id&&x.outputModalities.includes('text'));
    const famous=/^(openai|google|x-ai|deepseek|z-ai|anthropic|qwen|meta-llama|mistralai|moonshotai)\//;
    let selected=all.filter(x=>CURATED_MODEL_IDS.includes(x.id)||famous.test(x.id)||x.id.endsWith(':free'));
    selected=[...new Map([...FALLBACK_OPENROUTER_MODELS,...selected].map(x=>[x.id,x])).values()];
    modelCatalogCache={expires:Date.now()+15*60*1000,data:selected};
    return selected.map(x=>({...x,pricing:{...x.pricing}}));
  }catch(error){console.warn('[OPENROUTER_CATALOG_FALLBACK]',error?.message||error);return FALLBACK_OPENROUTER_MODELS.map(x=>({...x,pricing:{...x.pricing}}));}
}

let imageCatalogCache={expires:0,data:null};
export async function getOpenRouterImageModels(){
  if(imageCatalogCache.data&&Date.now()<imageCatalogCache.expires)return imageCatalogCache.data.map(x=>({...x,pricing:{...x.pricing}}));
  try{
    const response=await fetchWithTimeout('https://openrouter.ai/api/v1/images/models',{headers:{Accept:'application/json'}},15000);
    if(!response.ok)throw new Error(`OpenRouter image models ${response.status}`);
    const payload=await response.json();
    const items=(Array.isArray(payload?.data)?payload.data:[]).map(normalizeOpenRouterModel).filter(x=>x.outputModalities.includes('image'));
    imageCatalogCache={expires:Date.now()+15*60*1000,data:items}; return items.map(x=>({...x,pricing:{...x.pricing}}));
  }catch(error){console.warn('[OPENROUTER_IMAGE_CATALOG_FALLBACK]',error?.message||error);return GEMINI_IMAGE_MODELS.map(x=>({...x,pricing:{...x.pricing}}));}
}

const imageEndpointCache=new Map();
export async function getOpenRouterImageModelEndpoints(modelId){
  const id=String(modelId||'').trim();
  if(!id)return [];
  const cached=imageEndpointCache.get(id);
  if(cached&&Date.now()<cached.expires)return cached.data.map(item=>({...item,pricing:{...(item.pricing||{})}}));
  try{
    const response=await fetchWithTimeout(`https://openrouter.ai/api/v1/images/models/${encodeURIComponent(id).replace(/%2F/g,'/')}/endpoints`,{headers:{Accept:'application/json'}},12000);
    if(!response.ok)throw new Error(`OpenRouter image endpoints ${response.status}`);
    const payload=await response.json();
    const raw=Array.isArray(payload?.data)?payload.data:(Array.isArray(payload?.endpoints)?payload.endpoints:[]);
    const data=raw.map((endpoint,index)=>{
      const normalized=normalizeOpenRouterModel({
        id:endpoint?.id||`${id}#${index}`,
        name:endpoint?.name||endpoint?.provider_name||id,
        architecture:endpoint?.architecture||{},
        pricing:endpoint?.pricing||{},
        supported_parameters:endpoint?.supported_parameters||endpoint?.capabilities||{}
      });
      return {...endpoint,...normalized,modelId:id,providerName:endpoint?.provider_name||endpoint?.provider||normalized.provider};
    });
    imageEndpointCache.set(id,{expires:Date.now()+10*60*1000,data});
    return data.map(item=>({...item,pricing:{...(item.pricing||{})}}));
  }catch(error){console.warn('[OPENROUTER_IMAGE_ENDPOINTS_FALLBACK]',id,error?.message||error);return [];}
}

export const GEMINI_IMAGE_MODELS = [
  {id:'black-forest-labs/flux.2-klein-4b',name:'FLUX.2 Klein 4B',description:'أرخص نموذج FLUX وسريع لتوليد الصور.',pricing:{megapixel:0.014},inputModalities:['text','image'],outputModalities:['image'],supported_parameters:{resolution:{type:'enum',values:['512','1K','2K']},aspect_ratio:{type:'enum',values:['1:1','16:9','9:16','4:3','3:4']},n:{type:'boolean'}},provider:'black-forest-labs'},
  {id:'black-forest-labs/flux.2-pro',name:'FLUX.2 Pro',description:'جودة أعلى للصور والتعديل متعدد المراجع.',pricing:{request:0.03,image:0.03},inputModalities:['text','image'],outputModalities:['image'],supported_parameters:{resolution:{type:'enum',values:['1K','2K','4K']},aspect_ratio:{type:'enum',values:['1:1','16:9','9:16','4:3','3:4']},n:{type:'boolean'}},provider:'black-forest-labs'}
];

export const GEMINI_LIVE_MODELS = [];


export const DEFAULT_AI_TOOLS = [
  {id:'coding',name_ar:'البرمجة',name_en:'Coding',description_ar:'كتابة الكود، إصلاح الأخطاء وشرح الحلول التقنية.',description_en:'Write code, fix bugs, and explain technical solutions.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:10},
  {id:'summary',name_ar:'التلخيص',name_en:'Summarization',description_ar:'تلخيص النصوص والمقالات والملفات مع الحفاظ على أهم النقاط.',description_en:'Summarize text, articles, and files while preserving key points.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:20},
  {id:'ads',name_ar:'الإعلانات',name_en:'Advertising',description_ar:'إنشاء نصوص إعلانية وأفكار حملات وتسويق.',description_en:'Create advertising copy, campaign ideas, and marketing content.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:30},
  {id:'writing',name_ar:'الكتابة',name_en:'Writing',description_ar:'كتابة وإعادة صياغة المحتوى بأساليب مختلفة.',description_en:'Write and rewrite content in different styles.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:40},
  {id:'translate',name_ar:'الترجمة',name_en:'Translation',description_ar:'ترجمة النصوص مع الحفاظ على المعنى والسياق.',description_en:'Translate text while preserving meaning and context.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:50},
  {id:'study',name_ar:'الدراسة',name_en:'Study',description_ar:'شرح الدروس، حل الأسئلة وإنشاء خطط ومراجعات دراسية.',description_en:'Explain lessons, solve questions, and create study plans and reviews.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:60},
  {id:'business',name_ar:'الأعمال',name_en:'Business',description_ar:'تحليل الأفكار وخطط الأعمال والمحتوى المهني.',description_en:'Analyze ideas, business plans, and professional content.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',is_active:true,sort_order:70},
  {id:'all-models',name_ar:'كل نماذج الذكاء الاصطناعي',name_en:'All AI Models',description_ar:'شات عادي مع اختيار النموذج من قائمة مرتبة حسب السعر والمجاني.',description_en:'General chat with a model picker sorted by price and free options.',tool_type:'text',model_id:'deepseek/deepseek-v4-flash',prompt_config:{_ui:{icon_svg:'<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z"/></svg>'}},is_active:true,sort_order:5},
  {id:'image',name_ar:'الصور',name_en:'Images',description_ar:'توليد الصور وتعديلها باستخدام أرخص نموذج FLUX.',description_en:'Generate and edit images with the cheapest FLUX model.',tool_type:'image',model_id:'black-forest-labs/flux.2-klein-4b',is_active:true,sort_order:100}
];

export async function getAiTools({includeInactive=false}={}){
  try{
    let query=db().from('ai_tools').select('id,name_ar,name_en,description_ar,description_en,tool_type,model_id,prompt_config,is_active,sort_order,updated_at').order('sort_order',{ascending:true});
    if(!includeInactive)query=query.eq('is_active',true);
    const {data,error}=await query;
    if(error||!Array.isArray(data)||!data.length)throw error||new Error('NO_AI_TOOLS');
    return data.filter(tool=>!['live_audio','live_translate'].includes(tool.tool_type)&&!['voice-chat','voice-translate'].includes(tool.id));
  }catch{
    return DEFAULT_AI_TOOLS.filter(tool=>(includeInactive||tool.is_active)&&!['live_audio','live_translate'].includes(tool.tool_type)&&!['voice-chat','voice-translate'].includes(tool.id)).map(tool=>({...tool}));
  }
}

export async function getToolModelSettings(){
  const tools=await getAiTools();
  return Object.fromEntries(tools.map(tool=>[tool.id,tool.model_id]));
}

export function isFreeModel(model) {
  return Boolean(model && Number(model?.pricing?.prompt) === 0 && Number(model?.pricing?.completion) === 0);
}


const TASK_MODEL_PROFILES = {
  coding: {
    families: [/deepseek/i, /qwen.*coder/i, /coder/i, /codestral/i, /gemma/i],
    quality: /(?:coder|code|deepseek|qwen|r1|reason|32b|70b|pro)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000
  },
  summary: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 64000
  },
  ads: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 16000
  },
  writing: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000
  },
  translate: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /command/i],
    quality: /(?:flash|qwen|mistral|command|mini|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000
  },
  study: {
    families: [/gemini.*flash/i, /qwen/i, /deepseek/i, /mini/i],
    quality: /(?:flash|qwen|deepseek|reason|r1|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 64000
  },
  business: {
    families: [/gemini.*flash/i, /qwen/i, /mistral/i, /mini/i],
    quality: /(?:flash|qwen|mistral|reason|mini|pro|large)/i,
    weak: /(?:1b|3b|tiny|nano)/i,
    minContext: 32000
  }
};

function modelBlendedCost(model) {
  const prompt = Math.max(0, Number(model?.pricing?.prompt || 0));
  const completion = Math.max(0, Number(model?.pricing?.completion || 0));
  return (prompt + completion * 2) * 1e6;
}

function modelQualityScore(model, profile, { webSearch = false, hasAttachments = false } = {}) {
  const label = `${model?.id || ''} ${model?.name || ''}`.toLowerCase();
  const context = Number(model?.contextLength || 0);
  let quality = 45;

  if (profile?.quality?.test(label)) quality += 18;
  if (/(?:reason|r1|thinking|pro|large|70b|72b|32b|34b|27b)/i.test(label)) quality += 12;
  if (/(?:flash|mini|small|8b|7b)/i.test(label)) quality += 5;
  if (profile?.weak?.test(label)) quality -= 24;
  if (/(?:beta|preview|experimental)/i.test(label)) quality -= 3;

  if (context >= 128000) quality += 10;
  else if (context >= 64000) quality += 7;
  else if (context >= 32000) quality += 4;
  else if (profile?.minContext && context && context < profile.minContext) quality -= 12;

  if ((webSearch || hasAttachments) && context >= 64000) quality += 8;
  if ((webSearch || hasAttachments) && context && context < 32000) quality -= 16;
  return Math.max(0, Math.min(100, quality));
}

function taskComplexity(text = '', { webSearch = false, hasAttachments = false } = {}) {
  const q = String(text || '').toLowerCase();
  let score = 0;
  if (q.length > 1200) score += 1;
  if (q.length > 3500) score += 1;
  if (webSearch) score += 1;
  if (hasAttachments) score += 1;
  if (/(?:حلل|تحليل عميق|قارن|استراتيجية|معمارية|أمان|debug|architecture|security|reason|research|compare|multi-step|رياضيات|برهان)/i.test(q)) score += 2;
  return score >= 3 ? 'complex' : score >= 1 ? 'medium' : 'simple';
}

function modelValueScore(model, profile, options = {}) {
  const cost = modelBlendedCost(model);
  const quality = modelQualityScore(model, profile, options);
  const complexity = options.complexity || 'simple';
  // Paid models only. Simple tasks strongly favor the cheapest acceptable model;
  // harder tasks progressively give more weight to quality and context.
  const qualityWeight = complexity === 'complex' ? 1.35 : complexity === 'medium' ? 1.0 : 0.72;
  const costWeight = complexity === 'complex' ? 8 : complexity === 'medium' ? 14 : 23;
  const costPenalty = Math.log10(1 + Math.max(0, cost)) * costWeight;
  const cheapBonus = cost <= 0.5 ? 18 : cost <= 1.5 ? 12 : cost <= 4 ? 6 : 0;
  const qualityFloorPenalty = quality < 48 ? (48 - quality) * 2.2 : 0;
  return quality * qualityWeight + cheapBonus - costPenalty - qualityFloorPenalty;
}

export async function chooseTaskModel(taskId, text = '', { webSearch = false, hasAttachments = false } = {}) {
  const configured=(await getToolModelSettings())[taskId];
  if(configured){const exact=(await getAvailableModels()).find(model=>model.id===configured);if(exact)return exact;}
  const profile = TASK_MODEL_PROFILES[taskId];
  if (!profile) return chooseAutoModel(text, { webSearch, hasAttachments });

  const models = (await getAvailableModels())
    .filter(model => isTextChatModel(model) && !model.locked && !isFreeModel(model));
  if (!models.length) return null;

  const label = model => `${model.id || ''} ${model.name || ''}`;
  let candidates = [];
  for (const familyPattern of profile.families) {
    const familyMatches = models.filter(model => familyPattern.test(label(model)));
    if (familyMatches.length) candidates.push(...familyMatches);
  }
  candidates = [...new Map(candidates.map(model => [model.id, model])).values()];
  if (!candidates.length) candidates = models;

  const complexity = taskComplexity(text, { webSearch, hasAttachments });
  const needsLargeContext = complexity === 'complex' || hasAttachments || webSearch || String(text || '').length > 3000;
  if (needsLargeContext) {
    const capable = candidates.filter(model => Number(model.contextLength || 0) >= 64000);
    if (capable.length) candidates = capable;
  }

  // For simple work, remove clearly weak candidates and select primarily by price.
  if (complexity === 'simple') {
    const acceptable = candidates.filter(model => modelQualityScore(model, profile, { webSearch, hasAttachments }) >= 48);
    if (acceptable.length) candidates = acceptable;
  }

  return [...candidates].sort((a, b) => {
    const options = { webSearch, hasAttachments, complexity };
    const scoreDiff = modelValueScore(b, profile, options) - modelValueScore(a, profile, options);
    if (Math.abs(scoreDiff) > 0.01) return scoreDiff;
    const costDiff = modelBlendedCost(a) - modelBlendedCost(b);
    if (Math.abs(costDiff) > 0.000001) return costDiff;
    return Number(b.contextLength || 0) - Number(a.contextLength || 0);
  })[0] || chooseAutoModel(text, { webSearch, hasAttachments });
}

export async function chooseAutoModel(text = '', { webSearch = false, hasAttachments = false } = {}) {
  const models = await getAvailableModels();
  const available = models.filter(m => isTextChatModel(m) && !isFreeModel(m));
  const q = String(text || '').toLowerCase();
  const complex = q.length > 1400 || /(?:حلل|تحليل عميق|برمجة|كود|debug|architecture|security|رياضيات|reason|research|compare)/i.test(q);
  const coding = /(?:كود|برمجة|خطأ|بايثون|جافاسكربت|sql|code|debug|function|api)/i.test(q);
  let pool = available;
  if (webSearch || hasAttachments || complex) {
    const capable = available.filter(m => Number(m.contextLength || 0) >= 64000);
    if (capable.length) pool = capable;
  }
  const score = m => {
    const p = Number(m.pricing?.prompt || 0), c = Number(m.pricing?.completion || 0);
    let value = (p + c * 2) * 1e6;
    // Auto mode now prioritizes models known for fast inference before using price as a tie-breaker.
    if (/flash|mini|nano|fast|turbo|instant|haiku/i.test(`${m.id} ${m.name}`)) value -= 120;
    if (/opus|pro|max|reason|r1|large|405b/i.test(`${m.id} ${m.name}`) && !complex) value += 45;
    if (coding && /qwen|deepseek|coder|gemma/i.test(`${m.id} ${m.name}`)) value -= 50;
    if (complex && /reason|r1|pro|large|70b|31b|27b/i.test(`${m.id} ${m.name}`)) value -= 20;
    return value;
  };
  return [...pool].sort((a,b)=>score(a)-score(b))[0] || available[0] || null;
}

export async function claimFreeDailyUse(supabase, userId, kind = 'chat') {
  const limit = 30;
  const { data, error } = await supabase.rpc('claim_free_model_request', { p_user_id:userId, p_kind:kind, p_daily_limit:limit });
  if (error) {
    if (String(error.message || '').toLowerCase().includes('daily free limit')) throw appError('FREE_DAILY_LIMIT', { freeDailyLimit: limit, freeRequestKind: kind });
    throw appError('DATABASE_ERROR', {}, error);
  }
  return data || {};
}

export async function getTrialModelId() {
  // Keep the trial pinned to OpenRouter free routing.
  return TRIAL_MODEL_FALLBACK;
}

export async function getModel(modelId) {
  return (await getAvailableModels()).find(model => model.id === modelId) || null;
}

export function chargeGeminiUsage(price = {}, usageMetadata = {}, { webSearch = false, fallbackUsd = 0 } = {}) {
  const promptBase = Math.max(0, Number(usageMetadata.promptTokenCount || usageMetadata.inputTokenCount || 0));
  const toolPromptTotal = Math.max(0, Number(usageMetadata.toolUsePromptTokenCount || 0));
  const promptTotal = promptBase + toolPromptTotal;
  const responseTotal = Math.max(0, Number(usageMetadata.candidatesTokenCount || usageMetadata.responseTokenCount || usageMetadata.outputTokenCount || 0));
  const thoughtsTotal = Math.max(0, Number(usageMetadata.thoughtsTokenCount || 0));
  const outputTotal = responseTotal + thoughtsTotal;
  const normalizeModality = value => String(value || '').toUpperCase().replace(/^MODALITY_/, '');
  const sumDetails = details => (Array.isArray(details) ? details : []).reduce((map, item) => {
    const key = normalizeModality(item?.modality || item?.type || 'TEXT');
    map[key] = (map[key] || 0) + Math.max(0, Number(item?.tokenCount || 0));
    return map;
  }, {});
  const inputDetails = sumDetails(usageMetadata.promptTokensDetails || usageMetadata.inputTokensDetails);
  const toolInputDetails = sumDetails(usageMetadata.toolUsePromptTokensDetails);
  for (const [modality,count] of Object.entries(toolInputDetails)) inputDetails[modality]=(inputDetails[modality]||0)+count;
  const outputDetails = sumDetails(usageMetadata.candidatesTokensDetails || usageMetadata.responseTokensDetails || usageMetadata.outputTokensDetails);
  const hasInputDetails = Object.keys(inputDetails).length > 0;
  const hasOutputDetails = Object.keys(outputDetails).length > 0;
  const rate = (side, modality) => {
    const input = side === 'input';
    const key = `${modality.toLowerCase()}${input ? 'Input' : 'Output'}`;
    const imageOutputRate = !input && modality === 'IMAGE' ? Number(price.imageOutputPerMillion || 0) / 1e6 : 0;
    return Math.max(0, Number(price[key] || imageOutputRate || (input ? price.prompt : price.completion) || 0));
  };
  const calculate = (details, total, side) => {
    if (!Object.keys(details).length) return total * rate(side, 'TEXT');
    return Object.entries(details).reduce((sum, [modality, count]) => sum + Number(count) * rate(side, modality), 0);
  };
  const inputUsd = calculate(inputDetails, promptTotal, 'input');
  const outputUsd = calculate(outputDetails, responseTotal, 'output') + thoughtsTotal * rate('output', 'TEXT');
  const requestUsd = hasOutputDetails ? 0 : Math.max(0, Number(price.request || 0));
  const webUsd = webSearch ? Math.max(0, Number(price.web_search ?? price.webSearch ?? 0.01)) : 0;
  let providerUsd = inputUsd + outputUsd + requestUsd + webUsd;
  let costSource = (hasInputDetails || hasOutputDetails) ? 'gemini_usage_by_modality' : 'gemini_usage_tokens';
  if (!hasInputDetails && !hasOutputDetails && Number(fallbackUsd) > 0) {
    providerUsd = Number(fallbackUsd);
    costSource = 'model_fixed_price_fallback';
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
    modalityUsage: { input: inputDetails, output: outputDetails }
  };
}

export function chargeTokens(price, usage = {}, webSearch = false) {
  const input = Number(usage.prompt_tokens || usage.input_tokens || 0);
  const output = Number(usage.completion_tokens || usage.output_tokens || 0);
  const reportedCost = Number(usage.cost || 0);
  const webSearchFallbackUsd = webSearch ? Number(price?.webSearch || 0.01) : 0;
  const fallbackCost = input * Number(price?.prompt || 0) + output * Number(price?.completion || 0) + webSearchFallbackUsd;
  const hasReportedCost = Number.isFinite(reportedCost) && reportedCost > 0;
  const providerUsd = hasReportedCost ? reportedCost : fallbackCost;
  return {
    input,
    output,
    providerUsd,
    costSource: hasReportedCost ? 'openrouter_usage' : 'catalog_estimate',
    tokenUsd: TOKEN_USD,
    markup: MARKUP,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / TOKEN_USD))
  };
}


function estimateTextTokens(value = '') {
  const text = String(value || '').trim();
  if (!text) return 0;
  const arabic = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const latinWords = (text.match(/[A-Za-z0-9]+(?:['_-][A-Za-z0-9]+)*/g) || []).length;
  const arabicWords = (text.match(/[\u0600-\u06FF]+/g) || []).length;
  const punctuation = (text.match(/[^\s\p{L}\p{N}]/gu) || []).length;
  const codeLines = (text.match(/```|[{}[\]();<>_=+*/\\|`~]|\b(?:const|let|var|function|class|import|export|SELECT|FROM|WHERE)\b/g) || []).length;
  const urls = (text.match(/https?:\/\/\S+/g) || []).reduce((sum, url) => sum + Math.ceil(url.length / 3), 0);
  const wordEstimate = arabicWords * 1.35 + latinWords * 1.12;
  const characterFloor = text.length / (arabic > text.length * 0.2 ? 2.55 : 3.85);
  return Math.max(1, Math.ceil(Math.max(wordEstimate, characterFloor) + punctuation * 0.18 + codeLines * 0.42 + urls));
}

function attachmentTokenEstimate(attachment = {}) {
  const type = String(attachment.type || attachment.mime_type || '').toLowerCase();
  const size = Math.max(0, Number(attachment.size || attachment.size_bytes || 0));
  if (type.startsWith('image/')) {
    // OpenRouter ultimately reports native multimodal token usage. Before sending,
    // dimensions are not always available, so use a conservative size-based band.
    if (!size) return 1050;
    if (size <= 350_000) return 750;
    if (size <= 1_500_000) return 1250;
    if (size <= 4_000_000) return 1900;
    return 2600;
  }
  if (type.includes('pdf')) return Math.max(900, Math.min(16000, Math.ceil(size / 155)));
  if (type.startsWith('text/') || /json|xml|javascript|typescript|csv|markdown/.test(type)) return Math.max(220, Math.min(14000, Math.ceil(size / 3.2)));
  return Math.max(500, Math.min(9000, Math.ceil(size / 230)));
}

function estimatedContentTokens(value) {
  if (typeof value === 'string') {
    if (value.startsWith('data:')) return 0;
    return estimateTextTokens(value);
  }
  if (Array.isArray(value)) return value.reduce((sum, item) => sum + estimatedContentTokens(item), 0);
  if (!value || typeof value !== 'object') return 0;
  if (value.type === 'image_url') return 1050;
  if (value.type === 'file') return 1500;
  if (value.name || value.mime_type || value.size || value.size_bytes) return attachmentTokenEstimate(value);
  return Object.entries(value).reduce((sum, [key, item]) => {
    if (key === 'file_data' || key === 'url' || key === 'dataUrl') return sum;
    return sum + estimatedContentTokens(item);
  }, 0);
}

function latestUserText(messages = []) {
  const latest = [...messages].reverse().find(message => message?.role === 'user');
  return typeof latest?.content === 'string' ? latest.content : '';
}

function expectedOutputTokens(text, inputTokens, attachmentCount, imageCount, webSearch) {
  const value = String(text || '');
  const latestTokens = Math.max(1, estimateTextTokens(value));
  const asksForCode = /```|\b(code|كود|برمج|برنامج|function|api|html|javascript|python|sql)\b/i.test(value);
  const asksForLong = /\b(explain|detailed|complete|full|report|article|essay|حلل|اشرح|بالتفصيل|كامل|تقرير|مقال)\b/i.test(value);
  const asksForShort = /\b(short|brief|one word|مختصر|باختصار|كلمة واحدة)\b/i.test(value);
  let ratio = asksForCode ? 1.35 : asksForLong ? 1.05 : asksForShort ? 0.30 : 0.72;
  let predicted = 48 + latestTokens * ratio + Math.sqrt(Math.max(1, inputTokens)) * 5.5;
  predicted += attachmentCount * 45 + imageCount * 75 + (webSearch ? 120 : 0);
  return Math.max(64, Math.min(4096, Math.ceil(predicted)));
}

export function estimateChatCharge(price, messages = [], webSearch = false, outputReserve = 0) {
  const safeMessages = Array.isArray(messages) ? messages : [];
  // Message framing differs by native tokenizer; 14 tokens/message plus a small
  // conversation header is a closer preflight approximation than word count alone.
  const inputTokens = Math.max(1, estimatedContentTokens(safeMessages) + 14 * safeMessages.length + 8);
  const attachmentCount = safeMessages.reduce((sum, message) => sum + (Array.isArray(message?.attachments) ? message.attachments.length : 0), 0);
  const imageCount = safeMessages.reduce((sum, message) => sum + (Array.isArray(message?.attachments) ? message.attachments.filter(item => String(item?.type || '').startsWith('image/')).length : 0), 0);
  const automaticOutput = expectedOutputTokens(latestUserText(safeMessages), inputTokens, attachmentCount, imageCount, webSearch);
  const requestedReserve = Number(outputReserve || 0);
  const reservedOutputTokens = Math.max(64, Math.min(4096, Math.ceil(requestedReserve > 0 ? requestedReserve : automaticOutput)));
  const promptRate = Math.max(0, Number(price?.prompt || 0));
  const completionRate = Math.max(0, Number(price?.completion || 0));
  const requestUsd = Math.max(0, Number(price?.request || 0));
  const inputUsd = inputTokens * promptRate;
  const outputUsd = reservedOutputTokens * completionRate;
  // Current OpenRouter web-plugin pricing is normally $0.005/request; use a
  // model-catalog value when supplied and otherwise this documented baseline.
  const webUsd = webSearch ? Math.max(0, Number(price?.web_search ?? price?.webSearch ?? 0.005)) : 0;
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
    chargedTokens: Math.max(1, Math.ceil(providerUsd / TOKEN_USD))
  };
}


export function reservationTokens(estimatedTokens, kind = 'chat') {
  const estimate = Math.max(1, Math.ceil(Number(estimatedTokens) || 1));
  const multiplier = kind === 'image' ? 1.30 : 1.25;
  const minimumBuffer = kind === 'image' ? 250 : 50;
  return Math.max(estimate, Math.ceil(estimate * multiplier), estimate + minimumBuffer);
}

export async function resolveOpenRouterCharge({ usage = {}, generationId = '', price = {}, webSearch = false } = {}) {
  let normalizedUsage = {
    prompt_tokens: Number(usage?.prompt_tokens || usage?.input_tokens || 0),
    completion_tokens: Number(usage?.completion_tokens || usage?.output_tokens || 0),
    total_tokens: Number(usage?.total_tokens || 0),
    cost: Number(usage?.cost || 0)
  };

  // OpenRouter normally returns usage.cost in the completed response. If a provider
  // omits it, query the generation record by ID before falling back to catalog prices.
  if (!(normalizedUsage.cost > 0) && generationId && String(process.env.OPENROUTER_API_KEY || '').trim()) {
    try {
      const response = await fetchWithTimeout(
        `https://openrouter.ai/api/v1/generation?id=${encodeURIComponent(String(generationId))}`,
        { headers: { Authorization: `Bearer ${String(process.env.OPENROUTER_API_KEY).trim()}`, Accept: 'application/json' } },
        12000
      );
      if (response.ok) {
        const payload = await response.json().catch(() => ({}));
        const data = payload?.data || payload || {};
        const fetchedCost = Number(data?.usage?.cost ?? data?.cost ?? data?.total_cost ?? 0);
        normalizedUsage = {
          prompt_tokens: Number(data?.usage?.prompt_tokens ?? data?.tokens_prompt ?? normalizedUsage.prompt_tokens ?? 0),
          completion_tokens: Number(data?.usage?.completion_tokens ?? data?.tokens_completion ?? normalizedUsage.completion_tokens ?? 0),
          total_tokens: Number(data?.usage?.total_tokens ?? data?.tokens_total ?? normalizedUsage.total_tokens ?? 0),
          cost: fetchedCost > 0 ? fetchedCost : normalizedUsage.cost
        };
      }
    } catch (error) {
      console.warn('[OPENROUTER_GENERATION_COST_LOOKUP_FAILED]', error?.message || error);
    }
  }

  return chargeTokens(price, normalizedUsage, webSearch);
}

export function affordableOutputLimit(price, availableTokens, estimate, cap = 16384) {
  const completionPrice = Number(price?.completion || 0);
  if (!(completionPrice > 0)) return Math.max(128, cap);
  const availableUsd = Math.max(0, Number(availableTokens || 0) * TOKEN_USD * 0.9);
  const fixedUsd = Math.max(0, Number(estimate?.inputUsd || 0) + Number(estimate?.webUsd || 0));
  const affordable = Math.floor((availableUsd - fixedUsd) / completionPrice);
  return Math.max(0, Math.min(cap, affordable));
}

export function isLowBalance(remainingTokens, lastCharge = 0) {
  const remaining = Math.max(0, Number(remainingTokens || 0));
  return remaining > 0 && remaining < Math.max(1000, Math.ceil(Number(lastCharge || 0) * 2));
}


export async function classifyTokenChargeFailure(supabase, userId, requiredTokens, cause = null) {
  const required = Math.max(1, Math.ceil(Number(requiredTokens) || 1));
  const { data: profile, error } = await supabase.from('users')
    .select('ai_tokens,trial_messages_remaining,has_purchased')
    .eq('id', userId)
    .single();
  if (error || !profile) return appError('DATABASE_ERROR', {}, error || cause);
  const availableTokens = Math.max(0, Number(profile.ai_tokens || 0));
  if (!profile.has_purchased && Number(profile.trial_messages_remaining || 0) <= 0) {
    return appError('TRIAL_ENDED', { availableTokens }, cause);
  }
  if (availableTokens < required) {
    return appError('INSUFFICIENT_TOKENS_FOR_REQUEST', {
      availableTokens,
      requiredTokens: required,
      shortfall: required - availableTokens
    }, cause);
  }
  return appError('DATABASE_ERROR', {}, cause);
}

let piPriceCache={price:0,expires:0,quotedAt:null};
export async function getPiUsd() {
  if(piPriceCache.price>0&&Date.now()<piPriceCache.expires)return piPriceCache.price;
  const response = await fetchWithTimeout('https://www.okx.com/api/v5/market/ticker?instId=PI-USDT', { headers: { Accept:'application/json', 'User-Agent': 'AiWay/1.0' } }, 10000);
  if (!response.ok) throw appError('OKX_PRICE_UNAVAILABLE',{providerStatus:response.status});
  const payload = await response.json();
  if(String(payload?.code||'0')!=='0')throw appError('OKX_PRICE_UNAVAILABLE',{internalMessage:String(payload?.msg||'OKX ticker failed')});
  const ticker=payload?.data?.[0]||{};
  const last=Number(ticker.last), bid=Number(ticker.bidPx), ask=Number(ticker.askPx);
  const midpoint=bid>0&&ask>0?(bid+ask)/2:0;
  const price=last>0?last:midpoint;
  if (!Number.isFinite(price) || price <= 0) throw appError('OKX_PRICE_UNAVAILABLE');
  piPriceCache={price,expires:Date.now()+60_000,quotedAt:new Date().toISOString()};
  return price;
}

export async function packageQuote(id) {
  const pack = PACKAGES[id];
  if (!pack) return null;
  const piUsd = await getPiUsd();
  const baseAmountPi=pack.usd/piUsd;
  const amountPi=Number((baseAmountPi*(1+PI_PRICE_BUFFER)).toFixed(7));
  return { ...pack, piUsd, baseAmountPi:Number(baseAmountPi.toFixed(7)), priceBufferPercent:PI_PRICE_BUFFER*100, amountPi, quotedAt:new Date().toISOString(), quoteExpiresAt:new Date(Date.now()+5*60_000).toISOString(), pricingSource:'OKX PI-USDT spot ticker' };
}


export async function ensureConversationOwner(supabase, conversationId, userId) {
  const { data, error } = await supabase.from('conversations').select('id,user_id').eq('id', conversationId).eq('user_id', userId).maybeSingle();
  if (error) throw appError('DATABASE_ERROR', {}, error);
  if (!data) throw appError('FORBIDDEN');
  return data;
}

export function normalizeRequestId(value) {
  const id = String(value || '').trim();
  if (!/^[A-Za-z0-9_-]{8,120}$/.test(id)) throw appError('INVALID_REQUEST');
  return id;
}

export async function reserveAiTokens(supabase, userId, requestId, kind, amount) {
  const { data, error } = await supabase.rpc('reserve_ai_tokens', { p_user_id:userId, p_request_id:requestId, p_kind:kind, p_amount:Math.max(1,Math.ceil(Number(amount)||1)) });
  if (error) {
    const m=String(error.message||'').toLowerCase();
    if (m.includes('already in progress')) throw appError('REQUEST_IN_PROGRESS');
    if (m.includes('insufficient')) throw appError('INSUFFICIENT_TOKENS_FOR_REQUEST');
    if (m.includes('trial ended')) throw appError('TRIAL_ENDED');
    throw appError('DATABASE_ERROR',{},error);
  }
  if (data?.status === 'completed' || data?.status === 'released') throw appError('REQUEST_ALREADY_PROCESSED');
  return data || {};
}

export async function finalizeAiTokens(supabase,userId,requestId,actual,meta={}) {
  const { data,error }=await supabase.rpc('finalize_ai_tokens',{p_user_id:userId,p_request_id:requestId,p_actual:Math.max(1,Math.ceil(Number(actual)||1)),p_meta:meta});
  if(error) throw appError('DATABASE_ERROR',{},error);
  return Math.max(0,Number(data||0));
}

export async function releaseAiTokens(supabase,userId,requestId,meta={}) {
  if(!requestId) return;
  const { error }=await supabase.rpc('release_ai_tokens',{p_user_id:userId,p_request_id:requestId,p_meta:meta});
  if(error) console.error('Token reservation release failed:',error.message);
}


export async function claimFreeTrialToken(supabase, userId, requestId, toolId) {
  const { data, error } = await supabase.rpc('claim_aiway_free_trial_token', {
    p_user_id: userId,
    p_request_id: requestId,
    p_tool_id: String(toolId || '').slice(0, 40)
  });
  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (message.includes('trial tool locked')) throw appError('MODEL_LOCKED');
    if (message.includes('trial ended')) throw appError('TRIAL_ENDED');
    if (message.includes('already purchased')) throw appError('INVALID_REQUEST');
    throw appError('DATABASE_ERROR', {}, error);
  }
  return data || {};
}

export async function releaseFreeTrialToken(supabase, userId, requestId) {
  if (!requestId) return;
  const { error } = await supabase.rpc('release_aiway_free_trial_token', {
    p_user_id: userId,
    p_request_id: requestId
  });
  if (error) console.error('Free trial token release failed:', error.message);
}


export function requestIp(req) {
  return String(req?.headers?.['x-forwarded-for'] || req?.headers?.['x-real-ip'] || 'unknown').split(',')[0].trim().slice(0,80);
}
export async function enforceRateLimit(supabase,bucket,limit,windowSeconds) {
  const {data,error}=await supabase.rpc('check_api_rate_limit',{p_bucket:String(bucket).slice(0,180),p_limit:limit,p_window_seconds:windowSeconds});
  if(error) throw appError('DATABASE_ERROR',{},error);
  if(!data) throw appError('RATE_LIMITED');
}
