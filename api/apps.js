import { allowMethods, appError, cleanText, db, errorDetails, handleError, json, localize, requestLocale, requireUser, enforceRateLimit, requestIp, safeHttpUrl } from './_lib.js';


const APP_FIELDS = 'id,name,slug,category,network,short_description,website_url,icon_url,screenshot_urls,rating,ratings_count,views_count,get_clicks_count,is_verified,is_featured,featured_until,developer_name,created_at';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET','POST'])) return;
  const locale = requestLocale(req);
  try {
    const route=String(req.query?.route||'');
    if(route==='me'){
      if(req.method!=='GET')return json(res,405,{error:localize(locale,'الطريقة غير مسموحة.','Method not allowed.'),code:'METHOD_NOT_ALLOWED'});
      const user=await requireUser(req),supabase=db();
      const expired=await supabase.rpc('expire_paid_tokens',{p_user_id:user.id});if(expired.error)throw appError('DATABASE_ERROR',{},expired.error);
      const {data,error}=await supabase.from('users').select('id,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,created_at').eq('id',user.id).single();
      if(error||!data)throw appError('DATABASE_ERROR',{},error);
      const since=new Date(Date.now()-30*24*60*60*1000).toISOString();
      const charged=value=>Math.max(0,Number(value?.chargedTokens||value?.charged_tokens||0));
      let usageSummary={periodDays:30,consumedTokens:0,lastRequestTokens:0,lastRequestAt:null,lastRequestType:null};
      try{
        const [messagesResult,imagesResult]=await Promise.all([
          supabase.from('messages').select('token_usage,created_at').eq('user_id',user.id).eq('role','assistant').gte('created_at',since).order('created_at',{ascending:false}),
          supabase.from('generated_images').select('token_usage,created_at').eq('user_id',user.id).gte('created_at',since).order('created_at',{ascending:false})
        ]);
        const messageRows=messagesResult.error?[]:(messagesResult.data||[]),imageRows=imagesResult.error?[]:(imagesResult.data||[]);
        const consumedTokens=[...messageRows,...imageRows].reduce((sum,row)=>sum+charged(row.token_usage),0);
        const latest=[...messageRows.map(row=>({...row,type:'message'})),...imageRows.map(row=>({...row,type:'image'}))].sort((a,b)=>new Date(b.created_at).getTime()-new Date(a.created_at).getTime())[0];
        usageSummary={periodDays:30,consumedTokens,lastRequestTokens:latest?charged(latest.token_usage):0,lastRequestAt:latest?.created_at||null,lastRequestType:latest?.type||null};
      }catch{}
      return json(res,200,{user:data,usageSummary});
    }
    if(route==='interactions'){
      const supabase=db(),appId=String(req.query?.appId||req.body?.appId||'');
      if(!appId)return json(res,400,{error:localize(locale,'معرّف التطبيق مطلوب.','App id is required.'),code:'INVALID_REQUEST'});
      if(req.method==='GET'){const user=await requireUser(req);const {data,error}=await supabase.from('app_ratings').select('stars').eq('app_id',appId).eq('user_id',user.id).maybeSingle();if(error)throw error;return json(res,200,{stars:data?.stars||0});}
      const action=String(req.body?.action||'');const {data:app,error:appError}=await supabase.from('apps').select('id,status').eq('id',appId).maybeSingle();if(appError)throw appError;if(!app||app.status!=='published')return json(res,404,{error:localize(locale,'التطبيق غير موجود أو غير منشور.','The app was not found or is not published.'),code:'FILE_NOT_FOUND'});
      if(action==='view'||action==='get_click'){await enforceRateLimit(supabase,`app-event:${requestIp(req)}`,120,60);const visitorId=cleanText(req.body?.visitorId,100);if(!/^[a-zA-Z0-9_-]{16,100}$/.test(visitorId))return json(res,400,{error:localize(locale,'معرّف الزائر غير صالح.','The visitor id is invalid.'),code:'INVALID_REQUEST'});const {error}=await supabase.from('app_events').insert({app_id:appId,visitor_id:visitorId,event_type:action});if(error&&error.code!=='23505')throw error;const {data:counts}=await supabase.from('apps').select('views_count,get_clicks_count').eq('id',appId).single();return json(res,200,{recorded:!error,counts});}
      const user=await requireUser(req);if(action==='rate'){const stars=Number(req.body?.stars);if(!Number.isInteger(stars)||stars<1||stars>5)return json(res,400,{error:localize(locale,'اختر تقييمًا من نجمة واحدة إلى خمس نجوم.','Choose a rating from 1 to 5 stars.'),code:'INVALID_REQUEST'});const {error}=await supabase.from('app_ratings').upsert({app_id:appId,user_id:user.id,stars},{onConflict:'app_id,user_id'});if(error)throw error;const {data:rating}=await supabase.from('apps').select('rating,ratings_count').eq('id',appId).single();return json(res,200,{rating,userStars:stars});}
      if(action==='report'){const allowed=['not_working','scam','wrong_link','impersonation','inappropriate','other'],reason=String(req.body?.reason||'');if(!allowed.includes(reason))return json(res,400,{error:localize(locale,'اختر سببًا صحيحًا للإبلاغ.','Choose a valid report reason.'),code:'INVALID_REQUEST'});const details=cleanText(req.body?.details,500);const {error}=await supabase.from('app_reports').upsert({app_id:appId,reporter_id:user.id,reason,details,status:'open',reviewed_by:null,reviewed_at:null},{onConflict:'app_id,reporter_id'});if(error)throw error;return json(res,200,{reported:true});}
      return json(res,400,{error:localize(locale,'الإجراء المطلوب غير صالح.','The requested action is invalid.'),code:'INVALID_REQUEST'});
    }

    if (String(req.query?.mode || '') === 'version') {
      const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || process.env.APP_VERSION || 'local-development';
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return json(res, 200, { version });
    }
    const supabase = db();
    const now = new Date().toISOString();
    const params = req.query || {};
    const enhanced = Boolean(params.id || params.q || params.network || params.category || params.sort || params.limit || params.cursor);
    let query = supabase.from('apps').select(APP_FIELDS, enhanced ? { count: 'exact' } : undefined).eq('status', 'published');

    if (params.id) query = query.eq('id', params.id).limit(1);
    if (params.network && ['mainnet','testnet'].includes(String(params.network))) query = query.eq('network', params.network);
    if (params.category && params.category !== 'All') query = query.eq('category', String(params.category).slice(0, 50));
    if (params.q) {
      const q = String(params.q).trim().replace(/[^\p{L}\p{N}\s_-]/gu, ' ').replace(/\s+/g,' ').slice(0, 80);
      if (q) query = query.or(`name.ilike.%${q}%,short_description.ilike.%${q}%,category.ilike.%${q}%`);
    }
    if (params.cursor) query = query.lt('created_at', params.cursor);

    query = query.order('is_featured', { ascending: false }).order('featured_until', { ascending: false, nullsFirst: false });
    const sort = String(params.sort || 'newest');
    if (sort === 'rating') query = query.order('rating', { ascending: false }).order('ratings_count', { ascending: false });
    else if (sort === 'views') query = query.order('views_count', { ascending: false });
    else if (sort === 'clicks') query = query.order('get_clicks_count', { ascending: false });
    else query = query.order('created_at', { ascending: false });

    const limit = enhanced ? Math.min(Math.max(Number(params.limit) || 20, 1), 50) : null;
    if (limit) query = query.limit(limit);
    const { data, error, count } = await query;
    if (error) throw error;

    res.setHeader('Cache-Control', enhanced ? 's-maxage=45, stale-while-revalidate=240' : 's-maxage=60, stale-while-revalidate=300');
    const apps = (data || []).map(app => ({
      ...app,
      website_url:safeHttpUrl(app.website_url),
      icon_url:safeHttpUrl(app.icon_url),
      screenshot_urls:Array.isArray(app.screenshot_urls)?app.screenshot_urls.map(url=>safeHttpUrl(url)).filter(Boolean):[],
      is_featured: Boolean(app.is_featured && (!app.featured_until || app.featured_until > now))
    }));
    if (!enhanced) return json(res,200,{apps});
    if (params.id) return json(res, 200, { app: apps[0] || null });
    return json(res, 200, { apps, total: count ?? apps.length, nextCursor: apps.length === limit ? apps[apps.length - 1]?.created_at || null : null });
  } catch (error) {
    console.error(error);
    const route=String(req.query?.route||'');
    if(route==='me'||route==='interactions')return handleError(error,res,localize(locale,'تعذر تنفيذ الطلب.','Could not complete the request.'),locale);
    if (String(req.query?.mode || '') === 'live-token') {
      const details=errorDetails(error,locale);
      return json(res,details.status||500,{error:details.message,code:details.code,...(details.meta||{})});
    }
    return json(res, 500, { error: localize(locale, 'تعذر تحميل التطبيقات حاليًا.', 'Could not load the apps right now.'), code: 'SERVER_ERROR' });
  }
}
