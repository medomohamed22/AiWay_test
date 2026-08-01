import { allowMethods, appError, chargeGeminiUsage, db, errorDetails, finalizeAiTokens, json, localize, normalizeRequestId, releaseAiTokens, requestLocale, requireUser, reserveAiTokens, getAiTools, GEMINI_LIVE_MODELS, geminiFetchJson, getGeminiApiKeys, TOKEN_USD } from './_lib.js';

const LIVE_MINIMUM_START_TOKENS = 100; // Minimum balance required to open a paid Live session.
const LIVE_MAX_USAGE_EVENTS = 1000;

const APP_FIELDS = 'id,name,slug,category,network,short_description,website_url,icon_url,screenshot_urls,rating,ratings_count,views_count,get_clicks_count,is_verified,is_featured,featured_until,developer_name,created_at';

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET','POST'])) return;
  const locale = requestLocale(req);
  try {
    if (String(req.query?.mode || '') === 'live-token') {
      if(req.method!=='POST') return json(res,405,{error:localize(locale,'طريقة الطلب غير مسموحة.','Method not allowed.')});
      const user=await requireUser(req);
      const body=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
      const action=String(body.action||'start');
      const supabase=db();
      const sessionId=normalizeRequestId(body.sessionId || body.requestId);
      const usageRequestId=sequence=>normalizeRequestId(`${sessionId}_u${sequence}`);
      const readReservation=async requestId=>{
        const {data,error}=await supabase.from('ai_usage_reservations')
          .select('request_id,status,reserved_tokens,charged_tokens')
          .eq('user_id',user.id).eq('request_id',requestId).maybeSingle();
        if(error) throw appError('DATABASE_ERROR',{},error);
        return data||null;
      };
      const readBalance=async()=>{
        const {data,error}=await supabase.from('users').select('ai_tokens,has_purchased').eq('id',user.id).single();
        if(error||!data) throw appError('DATABASE_ERROR',{},error);
        if(!data.has_purchased) throw appError('MODEL_LOCKED');
        return Math.max(0,Number(data.ai_tokens||0));
      };
      const sanitizeUsage=raw=>{
        const source=raw&&typeof raw==='object'?raw:{};
        const cleanDetails=value=>(Array.isArray(value)?value:[]).slice(0,12).map(item=>({
          modality:String(item?.modality||item?.type||'TEXT').toUpperCase().replace(/^MODALITY_/, '').slice(0,20),
          tokenCount:Math.max(0,Math.floor(Number(item?.tokenCount||0)))
        })).filter(item=>item.tokenCount>0);
        return {
          promptTokenCount:Math.max(0,Math.floor(Number(source.promptTokenCount||source.inputTokenCount||0))),
          candidatesTokenCount:Math.max(0,Math.floor(Number(source.candidatesTokenCount||source.responseTokenCount||source.outputTokenCount||0))),
          totalTokenCount:Math.max(0,Math.floor(Number(source.totalTokenCount||0))),
          thoughtsTokenCount:Math.max(0,Math.floor(Number(source.thoughtsTokenCount||0))),
          promptTokensDetails:cleanDetails(source.promptTokensDetails||source.inputTokensDetails),
          candidatesTokensDetails:cleanDetails(source.candidatesTokensDetails||source.responseTokensDetails||source.outputTokensDetails)
        };
      };

      if(action==='confirm'){
        // Do not create a database reservation before Gemini confirms the Live
        // session. The provider connection must remain independent from a
        // temporary billing write; actual usage is charged idempotently below.
        return json(res,200,{confirmed:true,chargedTokens:0,remainingTokens:await readBalance(),startedAt:new Date().toISOString(),billing:'gemini_usage_metadata'});
      }

      if(action==='usage'){
        const sequence=Math.floor(Number(body.sequence)||0);
        if(sequence<1||sequence>LIVE_MAX_USAGE_EVENTS) throw appError('INVALID_REQUEST');
        const model=GEMINI_LIVE_MODELS.find(item=>item.id===String(body.modelId||''));
        if(!model) throw appError('MODEL_UNAVAILABLE');
        const usage=sanitizeUsage(body.usageMetadata);
        if(!usage.promptTokenCount&&!usage.candidatesTokenCount&&!usage.promptTokensDetails.length&&!usage.candidatesTokensDetails.length){
          return json(res,200,{chargedTokens:0,totalChargedTokens:Math.max(0,Number(body.clientTotalCharged||0)),remainingTokens:await readBalance(),sequence,ignored:true});
        }
        const charge=chargeGeminiUsage(model.pricing,usage);
        const requiredTokens=Math.max(1,charge.chargedTokens);
        const requestId=usageRequestId(sequence);
        const existing=await readReservation(requestId);
        if(existing?.status==='completed') return json(res,200,{chargedTokens:Number(existing.charged_tokens||0),remainingTokens:await readBalance(),sequence,idempotent:true,cost:charge});
        if(existing?.status==='reserved') throw appError('REQUEST_IN_PROGRESS');

        const availableTokens=await readBalance();
        if(availableTokens<requiredTokens) throw appError('INSUFFICIENT_TOKENS_FOR_REQUEST',{availableTokens,requiredTokens,shortfall:requiredTokens-availableTokens});
        // Each provider usage event has its own idempotent reservation. Nothing
        // is written before setupComplete, so a transient database write cannot
        // prevent the microphone/WebSocket session from starting.
        await reserveAiTokens(supabase,user.id,requestId,'live_audio_usage',requiredTokens);
        const remainingTokens=await finalizeAiTokens(supabase,user.id,requestId,requiredTokens,{sessionId,sequence,modelId:model.id,kind:'gemini_live_usage',usage,cost:charge,pricingSource:'Google Gemini Developer API pricing'});
        return json(res,200,{chargedTokens:requiredTokens,remainingTokens,sequence,cost:{providerUsd:charge.providerUsd,inputUsd:charge.inputUsd,outputUsd:charge.outputUsd,costSource:charge.costSource,modalityUsage:charge.modalityUsage,tokenUsd:TOKEN_USD}});
      }

      if(action==='release'||action==='finish'){
        // There is no pre-session hold. Completed usage events have already
        // been finalized individually and cannot be charged twice.
        return json(res,200,{released:false,remainingTokens:await readBalance()});
      }

      if(action!=='start') throw appError('INVALID_REQUEST');
      const availableTokens=await readBalance();
      if(availableTokens<LIVE_MINIMUM_START_TOKENS) throw appError('INSUFFICIENT_TOKENS_FOR_REQUEST',{availableTokens,requiredTokens:LIVE_MINIMUM_START_TOKENS,shortfall:LIVE_MINIMUM_START_TOKENS-availableTokens});
      // Starting Gemini Live performs no billing write. Billing starts only
      // after setupComplete when Gemini reports real usageMetadata.
      try {
        const toolId=String(body.toolId||'');
        const targetLanguage=String(body.targetLanguage||'en').slice(0,16);
        const supportedVoices=['Zephyr','Puck','Charon','Kore','Fenrir','Leda','Orus','Aoede','Callirrhoe','Autonoe','Enceladus','Iapetus','Umbriel','Algieba','Despina','Erinome','Algenib','Rasalgethi','Laomedeia','Achernar','Alnilam','Schedar','Gacrux','Pulcherrima','Achird','Zubenelgenubi','Vindemiatrix','Sadachbia','Sadaltager','Sulafat'];
        const requestedVoice=String(body.voiceName||'Kore');
        const voiceName=supportedVoices.includes(requestedVoice)?requestedVoice:'Kore';
        const tools=await getAiTools();
        const tool=tools.find(x=>x.id===toolId&&['live_audio','live_translate'].includes(x.tool_type));
        if(!tool)throw appError('MODEL_UNAVAILABLE');
        const model=GEMINI_LIVE_MODELS.find(x=>x.id===tool.model_id);
        if(!model)throw appError('MODEL_UNAVAILABLE');
        if(!getGeminiApiKeys().length)throw appError('MISSING_CONFIGURATION');
        const now=Date.now(),expireTime=new Date(now+30*60*1000).toISOString(),newSessionExpireTime=new Date(now+60*1000).toISOString();
        const tokenRequest={uses:1,expireTime,newSessionExpireTime};
        const geminiResult=await geminiFetchJson('/v1beta/auth_tokens',{method:'POST',headers:{'Content-Type':'application/json'},geminiKeyMode:'header',body:JSON.stringify(tokenRequest)},12000);
        const {response,payload:data}=geminiResult;
        if(!response.ok) throw appError('PROVIDER_ERROR',{status:response.status,provider:'gemini',details:data?.error?.message||''});
        return json(res,200,{token:data.name,model:model.id,kind:model.liveKind,voiceName:model.liveKind==='dialog'?voiceName:undefined,targetLanguage:model.liveKind==='translate'?targetLanguage:undefined,expiresAt:expireTime,sessionId,reservedTokens:0,billing:'gemini_usage_metadata',tokenUsd:TOKEN_USD,pricing:model.pricing});
      } catch(error) {
        throw error;
      }
    }
    if (String(req.query?.mode || '') === 'version') {
      const version = process.env.VERCEL_GIT_COMMIT_SHA || process.env.VERCEL_DEPLOYMENT_ID || process.env.APP_VERSION || 'local-development';
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      return json(res, 200, { version });
    }
    const supabase = db();
    const now = new Date().toISOString();
    // Keep expired promotions visually inactive without blocking reads if cleanup fails.
    supabase.from('apps').update({ is_featured: false }).eq('is_featured', true).lt('featured_until', now).then(()=>{}).catch(()=>{});

    const params = req.query || {};
    const enhanced = Boolean(params.id || params.q || params.network || params.category || params.sort || params.limit || params.cursor);
    let query = supabase.from('apps').select(APP_FIELDS, enhanced ? { count: 'exact' } : undefined).eq('status', 'published');

    if (params.id) query = query.eq('id', params.id).limit(1);
    if (params.network && ['mainnet','testnet'].includes(String(params.network))) query = query.eq('network', params.network);
    if (params.category && params.category !== 'All') query = query.eq('category', String(params.category).slice(0, 50));
    if (params.q) {
      const q = String(params.q).trim().replace(/[,%()]/g, ' ').slice(0, 80);
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
    if (!enhanced) return json(res, 200, { apps: data || [] });
    const apps = data || [];
    if (params.id) return json(res, 200, { app: apps[0] || null });
    return json(res, 200, { apps, total: count ?? apps.length, nextCursor: apps.length === limit ? apps[apps.length - 1]?.created_at || null : null });
  } catch (error) {
    console.error(error);
    if (String(req.query?.mode || '') === 'live-token') {
      const details=errorDetails(error,locale);
      return json(res,details.status||500,{error:details.message,code:details.code,...(details.meta||{})});
    }
    return json(res, 500, { error: localize(locale, 'تعذر تحميل التطبيقات حاليًا.', 'Could not load the apps right now.'), code: 'SERVER_ERROR' });
  }
}
