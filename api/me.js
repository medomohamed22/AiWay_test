import { allowMethods, appError, appSessionToken, clearAppSessionCookie, db, handleError, json, localize, requestLocale, requireUser } from './_lib.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'DELETE'])) return;
  if (req.method === 'DELETE') {
    clearAppSessionCookie(res);
    return json(res, 200, { signedOut: true });
  }
  const locale = requestLocale(req);
  try {
    const user = await requireUser(req);
    const supabase = db();
    const expired = await supabase.rpc('expire_paid_tokens', { p_user_id: user.id });
    if (expired.error) throw appError('DATABASE_ERROR', {}, expired.error);
    const { data, error } = await supabase.from('users')
      .select('id,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,created_at')
      .eq('id', user.id).single();
    if (error || !data) throw appError('DATABASE_ERROR', {}, error);
    const restoreToken = String(req.query?.restore || '') === '1' ? appSessionToken(req) : '';
    return json(res, 200, { user: data, ...(restoreToken ? { token: restoreToken } : {}) });
  } catch (error) {
    return handleError(error, res, localize(locale, 'تعذر تحميل بيانات الحساب.', 'Could not load the account details.'), locale);
  }
}
