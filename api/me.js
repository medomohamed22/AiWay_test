import { allowMethods, appError, db, handleError, json, localize, requestLocale, requireUser } from './_lib.js';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET'])) return;
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

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const charged = value => Math.max(0, Number(value?.chargedTokens || value?.charged_tokens || 0));
    let usageSummary = { periodDays:30, consumedTokens:0, lastRequestTokens:0, lastRequestAt:null, lastRequestType:null };
    try {
      const [messagesResult, imagesResult] = await Promise.all([
        supabase.from('messages').select('token_usage,created_at').eq('user_id', user.id).eq('role', 'assistant').gte('created_at', since).order('created_at', { ascending:false }),
        supabase.from('generated_images').select('token_usage,created_at').eq('user_id', user.id).gte('created_at', since).order('created_at', { ascending:false })
      ]);
      const messageRows = messagesResult.error ? [] : (messagesResult.data || []);
      const imageRows = imagesResult.error ? [] : (imagesResult.data || []);
      const consumedTokens = [...messageRows, ...imageRows].reduce((sum, row) => sum + charged(row.token_usage), 0);
      const latest = [
        ...messageRows.map(row => ({ ...row, type:'message' })),
        ...imageRows.map(row => ({ ...row, type:'image' }))
      ].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
      usageSummary = {
        periodDays:30,
        consumedTokens,
        lastRequestTokens:latest ? charged(latest.token_usage) : 0,
        lastRequestAt:latest?.created_at || null,
        lastRequestType:latest?.type || null
      };
    } catch {}
    return json(res, 200, { user: data, usageSummary });
  } catch (error) {
    return handleError(error, res, localize(locale, 'تعذر تحميل بيانات الحساب.', 'Could not load the account details.'), locale);
  }
}
