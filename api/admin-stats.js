import { allowMethods, db, fetchWithTimeout, handleError, json, localize, requestLocale, requireUser, requireAdmin, requireAdminToken, getAvailableModels, getToolModelSettings, getAiTools, getOpenRouterImageModels, GEMINI_LIVE_MODELS, MARKUP, TOKEN_USD, TRIAL_TOKENS, getPiUsd } from './_lib.js';

const num=v=>{const n=Number(v||0);return Number.isFinite(n)?n:0};
const isoDay=v=>new Date(v).toISOString().slice(0,10);
const sinceDays=d=>new Date(Date.now()-d*86400000).toISOString();
const pct=(a,b)=>b?Math.round((a/b)*1000)/10:0;
function sanitizeToolSvg(value){
  let svg=String(value||'').trim();
  if(!svg)return '';
  if(svg.length>24000||!/^<svg\b[\s\S]*<\/svg>$/i.test(svg))throw new Error('INVALID_TOOL_ICON');
  if(/<\s*(script|style|foreignObject|iframe|object|embed|audio|video|canvas|link|meta|base)\b/i.test(svg))throw new Error('INVALID_TOOL_ICON');
  if(/\son[a-z]+\s*=/i.test(svg)||/javascript\s*:/i.test(svg)||/data\s*:\s*text\/html/i.test(svg))throw new Error('INVALID_TOOL_ICON');
  svg=svg.replace(/<\?xml[\s\S]*?\?>/gi,'').replace(/<!DOCTYPE[\s\S]*?>/gi,'');
  svg=svg.replace(/\s(?:href|xlink:href)\s*=\s*(["'])(?!#)[\s\S]*?\1/gi,'');
  svg=svg.replace(/\sstyle\s*=\s*(["'])[\s\S]*?\1/gi,'');
  svg=svg.replace(/\s(?:width|height)\s*=\s*(["'])[^"']*\1/gi,'');
  if(!/\bviewBox\s*=/.test(svg))svg=svg.replace(/^<svg\b/i,'<svg viewBox="0 0 48 48"');
  svg=svg.replace(/^<svg\b/i,'<svg aria-hidden="true" focusable="false"');
  return svg;
}
async function fetchAll(factory,size=1000){const rows=[];for(let from=0;;from+=size){const {data,error}=await factory().range(from,from+size-1);if(error)throw error;rows.push(...(data||[]));if((data||[]).length<size)return rows}}
async function optional(factory,fallback=[]){try{return await fetchAll(factory)}catch(e){console.warn('Optional admin source unavailable:',e?.message);return fallback}}
function cost(u){return u&&typeof u==='object'?Math.max(0,num(u.providerUsd||u.cost)):0}
function charged(u){return u&&typeof u==='object'?Math.max(0,num(u.chargedTokens||u.tokens_charged)):0}
function latency(u){return u&&typeof u==='object'?Math.max(0,num(u.latency_ms||u.latencyMs||u.generation_time_ms||u.generationTimeMs)):0}
function tokens(u){if(!u||typeof u!=='object')return 0;const total=num(u.total_tokens||u.totalTokens);return total>0?total:num(u.prompt_tokens||u.promptTokens)+num(u.completion_tokens||u.completionTokens)}
function groupDaily(rows,dateKey,days=30){const out=[];for(let i=days-1;i>=0;i--){const d=new Date(Date.now()-i*86400000).toISOString().slice(0,10);out.push({date:d,value:0})}const map=new Map(out.map(x=>[x.date,x]));for(const r of rows){const raw=r[dateKey];if(!raw)continue;const x=map.get(isoDay(raw));if(x)x.value++}return out}
async function gemini(){
  const apiKey=String(process.env.OPENROUTER_API_KEY||'').trim();
  const managementKey=String(process.env.OPENROUTER_MANAGEMENT_API_KEY||apiKey).trim();
  if(!apiKey)return {configured:false,status:'missing',credits:null,key:{label:'OpenRouter API'},modelsApi:false,billingNote:'أضف OPENROUTER_API_KEY في متغيرات البيئة.'};
  const headers={Accept:'application/json','Authorization':`Bearer ${apiKey}`};
  const managementHeaders={Accept:'application/json','Authorization':`Bearer ${managementKey}`};
  const fetchJson=async(url,h)=>{const r=await fetchWithTimeout(url,{headers:h},10000);const body=await r.json().catch(()=>({}));if(!r.ok)throw new Error(body?.error?.message||`OpenRouter ${r.status}`);return body};
  const [modelsResult,keyResult,creditsResult]=await Promise.allSettled([
    fetchJson('https://openrouter.ai/api/v1/models',headers),
    fetchJson('https://openrouter.ai/api/v1/key',headers),
    fetchJson('https://openrouter.ai/api/v1/credits',managementHeaders)
  ]);
  const modelsBody=modelsResult.status==='fulfilled'?modelsResult.value:null;
  const keyData=keyResult.status==='fulfilled'?(keyResult.value?.data||{}):{};
  const creditsData=creditsResult.status==='fulfilled'?(creditsResult.value?.data||{}):null;
  const totalCredits=creditsData?Math.max(0,num(creditsData.total_credits)):null;
  const totalUsage=creditsData?Math.max(0,num(creditsData.total_usage)):Math.max(0,num(keyData.usage));
  const remaining=totalCredits==null?(keyData.limit_remaining==null?null:Math.max(0,num(keyData.limit_remaining))):Math.max(0,totalCredits-totalUsage);
  const credits=remaining==null?null:{remaining,totalCredits,totalUsage,source:creditsData?'openrouter-credits-api':'openrouter-key-api'};
  const errors=[modelsResult,keyResult,creditsResult].filter(x=>x.status==='rejected').map(x=>String(x.reason?.message||x.reason));
  return {configured:true,status:(modelsBody||Object.keys(keyData).length||creditsData)?'ok':'error',credits,key:{label:keyData.label||'OpenRouter API',limit:keyData.limit??null,limitRemaining:keyData.limit_remaining??null,limitReset:keyData.limit_reset??null,isFreeTier:Boolean(keyData.is_free_tier),usage:Math.max(0,num(keyData.usage)),usageDaily:Math.max(0,num(keyData.usage_daily)),usageWeekly:Math.max(0,num(keyData.usage_weekly)),usageMonthly:Math.max(0,num(keyData.usage_monthly)),byokUsage:Math.max(0,num(keyData.byok_usage))},modelsApi:Boolean(modelsBody),availableModels:Array.isArray(modelsBody?.data)?modelsBody.data.length:0,creditsApi:Boolean(creditsData),accountType:'admin',errors,error:errors[0]||'',billingNote:creditsData?'الرصيد والشحن والاستخدام مقروءة مباشرة من OpenRouter بعملة الدولار.':'أضف OPENROUTER_MANAGEMENT_API_KEY لقراءة إجمالي الشحن والرصيد؛ تم عرض بيانات مفتاح API المتاحة.'};
}

export default async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  const locale=requestLocale(req);
  try{
    const mode=String(req.query?.mode||'');
    if(mode==='model-settings'){
      const adminUser=await requireUser(req);
      await requireAdmin(adminUser);
      if(req.method==='GET'){
        const models=(await getAvailableModels()).sort((a,b)=>(a.pricing.prompt+a.pricing.completion)-(b.pricing.prompt+b.pricing.completion));
        const liveModels=GEMINI_LIVE_MODELS.map(x=>({...x}));
        const imageModels=(await getOpenRouterImageModels()).sort((a,b)=>(a.pricing.request||0)-(b.pricing.request||0));
        return json(res,200,{tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings(),models,imageModels,liveModels,pricingSource:'OpenRouter Models API pricing',pricingSourceUrl:'https://openrouter.ai/models',refreshedAt:new Date().toISOString(),catalogNote:'يتم ترتيب النماذج حسب مجموع سعر الإدخال والإخراج القياسي لكل مليون توكين'});
      }
      const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
      const action=String(b.action||'bulk-models');
      const validText=new Set((await getAvailableModels()).map(x=>x.id));
      const validImages=new Set((await getOpenRouterImageModels()).map(x=>x.id));
      const validLive=new Set(GEMINI_LIVE_MODELS.map(x=>x.id));
      const clean=v=>String(v??'').trim();
      const safeId=v=>clean(v).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
      if(action==='delete'){
        const id=safeId(b.id);
        if(!id)return json(res,400,{error:localize(locale,'معرّف الأداة غير صالح.','Invalid tool id.')});
        const {error}=await db().from('ai_tools').delete().eq('id',id);if(error)throw error;
        return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      if(action==='save-tool'){
        const t=b.tool||{};const id=safeId(t.id);const allowedTypes=new Set(['text','image','live_audio','live_translate']);const type=allowedTypes.has(t.tool_type)?t.tool_type:'text';const model=clean(t.model_id);
        if(!id||!clean(t.name_ar)||!clean(t.name_en))return json(res,400,{error:localize(locale,'أدخل معرّفًا واسمًا عربيًا وإنجليزيًا.','Enter an id plus Arabic and English names.')});
        if(!(type==='image'?validImages:(type==='live_audio'||type==='live_translate'?validLive:validText)).has(model))return json(res,400,{error:localize(locale,'النموذج المختار غير صالح لنوع الأداة.','The selected model is invalid for this tool type.')});
        let promptConfig=t.prompt_config;
        if(typeof promptConfig==='string'){try{promptConfig=JSON.parse(promptConfig)}catch{return json(res,400,{error:localize(locale,'كود JSON الخاص بتعليمات الأداة غير صالح.','The tool instruction JSON is invalid.')})}}
        if(!promptConfig||typeof promptConfig!=='object'||Array.isArray(promptConfig))promptConfig={};
        const uiConfig=promptConfig._ui&&typeof promptConfig._ui==='object'&&!Array.isArray(promptConfig._ui)?{...promptConfig._ui}:{};
        try{uiConfig.icon_svg=sanitizeToolSvg(t.icon_svg??uiConfig.icon_svg)}catch{return json(res,400,{error:localize(locale,'ملف الأيقونة SVG غير آمن أو غير صالح.','The SVG icon is invalid or unsafe.')})}
        if(uiConfig.icon_svg)promptConfig._ui=uiConfig;else delete promptConfig._ui;
        const promptJson=JSON.stringify(promptConfig);if(promptJson.length>36000)return json(res,400,{error:localize(locale,'تعليمات الأداة أو الأيقونة كبيرة جدًا.','Tool instructions or icon are too large.')});
        const row={id,name_ar:clean(t.name_ar).slice(0,120),name_en:clean(t.name_en).slice(0,120),description_ar:clean(t.description_ar).slice(0,1000),description_en:clean(t.description_en).slice(0,1000),tool_type:type,model_id:model,prompt_config:promptConfig,is_active:t.is_active!==false,sort_order:Math.max(0,Math.min(9999,Number(t.sort_order)||0)),updated_at:new Date().toISOString()};
        const {error}=await db().from('ai_tools').upsert(row,{onConflict:'id'});if(error)throw error;
        return json(res,200,{ok:true,tool:row,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      const tools=await getAiTools({includeInactive:true});const updates=[];
      for(const tool of tools){const value=b.settings?.[tool.id];const valid=(tool.tool_type==='image'?validImages:(tool.tool_type==='live_audio'||tool.tool_type==='live_translate'?validLive:validText)).has(value);if(typeof value==='string'&&value.length<100&&valid)updates.push({...tool,model_id:value,updated_at:new Date().toISOString()})}
      if(!updates.length)return json(res,400,{error:localize(locale,'لم يتم إرسال إعدادات صالحة.','No valid settings were submitted.')});
      const {error}=await db().from('ai_tools').upsert(updates,{onConflict:'id'});if(error)throw error;
      return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
    }
    if(req.method!=='GET')return json(res,405,{error:localize(locale,'طريقة الطلب غير مسموحة.','Method not allowed.')});
    const admin=await requireUser(req);await requireAdmin(admin);const s=db();
    const expirySweep=await s.rpc('expire_all_paid_tokens');if(expirySweep.error)throw expirySweep.error;
    const [users,payments,messages,images,conversations,reservations,geminiInfo]=await Promise.all([
      fetchAll(()=>s.from('users').select('id,pi_uid,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,last_login_at,created_at,updated_at').eq('role','user').order('created_at',{ascending:false})),
      fetchAll(()=>s.from('payments').select('id,user_id,amount_pi,usd_amount,status,package_id,ai_tokens,created_at,completed_at').order('created_at',{ascending:false})),
      fetchAll(()=>s.from('messages').select('id,user_id,conversation_id,role,model_id,token_usage,created_at').order('created_at',{ascending:false})),
      optional(()=>s.from('generated_images').select('id,user_id,model_id,width,height,token_usage,created_at').order('created_at',{ascending:false})),
      fetchAll(()=>s.from('conversations').select('id,user_id,model_id,created_at,updated_at').order('updated_at',{ascending:false})),
      optional(()=>s.from('ai_usage_reservations').select('id,user_id,kind,reserved_tokens,charged_tokens,status,response_meta,created_at,completed_at').order('created_at',{ascending:false})),
      gemini()
    ]);
    const now=Date.now(), day1=now-86400000, day7=now-7*86400000, day30=now-30*86400000;
    const assistants=messages.filter(x=>x.role==='assistant');const userMsgs=messages.filter(x=>x.role==='user');
    const completed=payments.filter(x=>x.status==='completed');
    const userMap=new Map(users.map(u=>[u.id,{...u,messages:0,images:0,costUsd:0,chargedTokens:0,models:new Map(),lastActivity:u.last_login_at||u.updated_at||u.created_at}]));
    for(const m of assistants){const u=userMap.get(m.user_id);if(!u)continue;u.messages++;u.costUsd+=cost(m.token_usage);u.chargedTokens+=charged(m.token_usage);if(m.model_id)u.models.set(m.model_id,(u.models.get(m.model_id)||0)+1);if(new Date(m.created_at)>new Date(u.lastActivity))u.lastActivity=m.created_at}
    for(const im of images){const u=userMap.get(im.user_id);if(u){u.images++;u.costUsd+=cost(im.token_usage);u.chargedTokens+=charged(im.token_usage);if(im.model_id)u.models.set(im.model_id,(u.models.get(im.model_id)||0)+1);if(new Date(im.created_at)>new Date(u.lastActivity))u.lastActivity=im.created_at}}
    const paidByUser=new Map();for(const p of completed)paidByUser.set(p.user_id,(paidByUser.get(p.user_id)||0)+num(p.usd_amount));
    const usersTable=[...userMap.values()].map(u=>{const paidUsd=paidByUser.get(u.id)||0;const geminiReserveUsd=paidUsd/MARKUP;const paidBalanceTokens=Math.max(0,num(u.paid_ai_tokens));const trialBalanceTokens=Math.max(0,num(u.free_trial_tokens??u.trial_messages_remaining));const accountBalanceTokens=Math.max(0,num(u.ai_tokens));const freeBalanceTokens=u.has_purchased?Math.max(0,accountBalanceTokens-paidBalanceTokens):trialBalanceTokens;const totalAvailableTokens=u.has_purchased?accountBalanceTokens:trialBalanceTokens;return {id:u.id,pi_uid:u.pi_uid,username:u.username,balance:totalAvailableTokens,totalAvailableTokens,freeBalanceTokens,paidBalanceTokens,paidTokensExpireAt:u.paid_tokens_expires_at,purchased:!!u.has_purchased,trialRemaining:trialBalanceTokens,registeredAt:u.created_at,lastLoginAt:u.last_login_at,lastActivity:u.lastActivity,messages:u.messages,images:u.images,providerCostUsd:u.costUsd,chargedTokens:u.chargedTokens,paidUsd,geminiReserveUsd,profitUsd:paidUsd-geminiReserveUsd,topModel:[...u.models.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'}});
    const modelMap=new Map();for(const m of assistants){const id=m.model_id||'غير محدد';const x=modelMap.get(id)||{model:id,requests:0,users:new Set(),costUsd:0,chargedTokens:0,inputTokens:0,outputTokens:0,totalTokens:0,latencyTotal:0,latencyCount:0};x.requests++;x.users.add(m.user_id);x.costUsd+=cost(m.token_usage);x.chargedTokens+=charged(m.token_usage);x.inputTokens+=num(m.token_usage?.prompt_tokens||m.token_usage?.promptTokens);x.outputTokens+=num(m.token_usage?.completion_tokens||m.token_usage?.completionTokens);x.totalTokens+=tokens(m.token_usage);const l=latency(m.token_usage);if(l){x.latencyTotal+=l;x.latencyCount++}modelMap.set(id,x)}
    const models=[...modelMap.values()].map(x=>({model:x.model,requests:x.requests,users:x.users.size,costUsd:x.costUsd,chargedTokens:x.chargedTokens,inputTokens:x.inputTokens,outputTokens:x.outputTokens,totalTokens:x.totalTokens,avgCostUsd:x.requests?x.costUsd/x.requests:0,avgLatencyMs:x.latencyCount?x.latencyTotal/x.latencyCount:0,revenueUsd:x.chargedTokens*TOKEN_USD*MARKUP,profitUsd:x.chargedTokens*TOKEN_USD*MARKUP-x.costUsd})).sort((a,b)=>b.requests-a.requests);
    const imageModels=new Map();for(const im of images){const id=im.model_id||'غير محدد';const x=imageModels.get(id)||{model:id,requests:0,costUsd:0,chargedTokens:0,sizes:new Map()};x.requests++;x.costUsd+=cost(im.token_usage);x.chargedTokens+=charged(im.token_usage);const size=im.width&&im.height?`${im.width}×${im.height}`:(im.token_usage?.resolution||im.token_usage?.aspectRatio||'غير محدد');x.sizes.set(size,(x.sizes.get(size)||0)+1);imageModels.set(id,x)}
    const imageAnalytics=[...imageModels.values()].map(x=>({model:x.model,requests:x.requests,costUsd:x.costUsd,avgCostUsd:x.requests?x.costUsd/x.requests:0,chargedTokens:x.chargedTokens,profitUsd:x.chargedTokens*TOKEN_USD*MARKUP-x.costUsd,topSize:[...x.sizes.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||'—'})).sort((a,b)=>b.requests-a.requests);
    const messageProviderCostUsd=assistants.reduce((a,m)=>a+cost(m.token_usage),0);const imageProviderCostUsd=images.reduce((a,i)=>a+cost(i.token_usage),0);const providerCostUsd=messageProviderCostUsd+imageProviderCostUsd;const totalUsd=completed.reduce((a,p)=>a+num(p.usd_amount),0);const totalPi=completed.reduce((a,p)=>a+num(p.amount_pi),0);const issuedPaidTokens=completed.reduce((a,p)=>a+num(p.ai_tokens),0);const remainingUserTokens=usersTable.reduce((a,u)=>a+num(u.totalAvailableTokens),0);const paidUsersRemainingTokens=usersTable.reduce((a,u)=>a+num(u.paidBalanceTokens),0);const purchasedUsersAccountRemainingTokens=usersTable.filter(u=>u.purchased).reduce((a,u)=>a+num(u.totalAvailableTokens),0);const freeUsersRemainingTokens=usersTable.reduce((a,u)=>a+num(u.freeBalanceTokens),0);
    const active=(ms)=>users.filter(u=>new Date(userMap.get(u.id)?.lastActivity||0).getTime()>=ms).length;
    const newUsers=(ms)=>users.filter(u=>new Date(u.created_at).getTime()>=ms).length;
    const errors=reservations.filter(r=>r.status==='released');const successful=reservations.filter(r=>r.status==='completed');
    const dailyMessages=groupDaily(assistants,'created_at');const dailyImages=groupDaily(images,'created_at');const dailyUsers=[];for(let i=29;i>=0;i--){const date=new Date(now-i*86400000).toISOString().slice(0,10);const set=new Set(messages.filter(m=>isoDay(m.created_at)===date).map(m=>m.user_id));dailyUsers.push({date,value:set.size})}
    const hourCounts=Array.from({length:24},(_,hour)=>({hour,value:0}));for(const m of messages){hourCounts[new Date(m.created_at).getUTCHours()].value++}
    const retentionBase=users.filter(u=>new Date(u.created_at).getTime()<day7);const retained7=retentionBase.filter(u=>new Date(userMap.get(u.id)?.lastActivity||0).getTime()>=new Date(u.created_at).getTime()+7*86400000).length;
    let currentPiUsd=null;try{currentPiUsd=await getPiUsd()}catch{}
    const providerSharePercent=100/MARKUP;const ownerProfitPercent=100-providerSharePercent;const geminiReserveFromSalesUsd=totalUsd/MARKUP;const ownerGrossProfitFromSalesUsd=totalUsd-geminiReserveFromSalesUsd;const geminiAvailableUsd=geminiInfo.credits?.remaining??null;const geminiRequiredForBalancesUsd=paidUsersRemainingTokens*TOKEN_USD;const geminiTopUpRequiredUsd=geminiAvailableUsd==null?null:Math.max(0,geminiRequiredForBalancesUsd-geminiAvailableUsd);const geminiCoveragePercent=geminiRequiredForBalancesUsd?Math.min(100,pct(geminiAvailableUsd||0,geminiRequiredForBalancesUsd)):100;
    const pending=payments.filter(p=>p.status==='approved').length,failedPayments=payments.filter(p=>['failed','cancelled'].includes(p.status)).length;
    return json(res,200,{
      generatedAt:new Date().toISOString(), users:users.length,buyers:users.filter(u=>u.has_purchased).length,purchaseRequests:payments.length,completedPurchases:completed.length,totalPi,totalUsd,currentPiUsd,markup:MARKUP,expectedMarkupPercent:(MARKUP-1)*100,expectedMarginPercent:ownerProfitPercent,providerSharePercent,ownerProfitPercent,tokenUsd:TOKEN_USD,issuedPaidTokens,soldProviderCapacityUsd:issuedPaidTokens*TOKEN_USD,geminiReserveFromSalesUsd,ownerGrossProfitFromSalesUsd,providerCostUsd,messageProviderCostUsd,imageProviderCostUsd,remainingUserTokens,paidUsersRemainingTokens,purchasedUsersAccountRemainingTokens,excludedTrialTokens:freeUsersRemainingTokens,remainingProviderLiabilityUsd:geminiRequiredForBalancesUsd,geminiRequiredForBalancesUsd,geminiAvailableUsd,geminiTopUpRequiredUsd,geminiCoveragePercent,expectedGrossProfitUsd:ownerGrossProfitFromSalesUsd,realizedGrossProfitUsd:ownerGrossProfitFromSalesUsd,realizedGrossProfitPi:totalUsd&&totalPi?ownerGrossProfitFromSalesUsd*(totalPi/totalUsd):0,
      overview:{activeToday:active(day1),active7d:active(day7),active30d:active(day30),newToday:newUsers(day1),new7d:newUsers(day7),messagesToday:assistants.filter(m=>new Date(m.created_at).getTime()>=day1).length,imagesToday:images.filter(i=>new Date(i.created_at).getTime()>=day1).length,requestsToday:reservations.filter(r=>new Date(r.created_at).getTime()>=day1).length,errorRate:pct(errors.length,reservations.length)},
      usersTable,models,imageAnalytics,
      usage:{dailyMessages,dailyImages,dailyUsers,hourCounts,dau:active(day1),wau:active(day7),mau:active(day30),retention7d:pct(retained7,retentionBase.length),returningUsers:users.filter(u=>new Date(u.created_at).getTime()<day30&&new Date(userMap.get(u.id)?.lastActivity||0).getTime()>=day30).length},
      messages:{count:assistants.length,costUsd:messageProviderCostUsd,avgCostUsd:assistants.length?messageProviderCostUsd/assistants.length:0,avgChargedTokens:assistants.length?assistants.reduce((a,m)=>a+charged(m.token_usage),0)/assistants.length:0,avgLatencyMs:(()=>{const a=assistants.map(m=>latency(m.token_usage)).filter(Boolean);return a.length?a.reduce((x,y)=>x+y,0)/a.length:0})()},
      images:{count:images.length,costUsd:images.reduce((a,i)=>a+cost(i.token_usage),0),avgCostUsd:images.length?images.reduce((a,i)=>a+cost(i.token_usage),0)/images.length:0},
      finance:{pendingPayments:pending,failedPayments,topSpenders:usersTable.slice().sort((a,b)=>b.paidUsd-a.paidUsd).slice(0,10),totalBalances:remainingUserTokens,paidUsersRemainingTokens,purchasedUsersAccountRemainingTokens,excludedTrialTokens:freeUsersRemainingTokens,providerSharePercent,ownerProfitPercent,geminiReserveFromSalesUsd,ownerGrossProfitFromSalesUsd,geminiRequiredForBalancesUsd,geminiAvailableUsd,geminiTopUpRequiredUsd,geminiCoveragePercent},
      api:{gemini:{...geminiInfo,trackedUsage:{textRequests:assistants.length,imageRequests:images.length,inputTokens:models.reduce((a,m)=>a+num(m.inputTokens),0),outputTokens:models.reduce((a,m)=>a+num(m.outputTokens),0),providerCostUsd,period:'all-time',source:'AiWay database'}},database:{status:'ok',rowsRead:users.length+payments.length+messages.length+images.length+conversations.length+reservations.length},requests:reservations.length,success:successful.length,errors:errors.length,recentErrors:errors.slice(0,20).map(r=>({kind:r.kind,createdAt:r.created_at,code:r.response_meta?.code||'REQUEST_RELEASED',userId:r.user_id}))},
      alerts:[
        ...(geminiInfo.credits&&geminiInfo.credits.remaining<5?[{level:'danger',title:'رصيد OpenRouter منخفض',message:`المتبقي $${geminiInfo.credits.remaining.toFixed(2)}`}]:[]),
        ...(pct(errors.length,reservations.length)>5?[{level:'danger',title:'ارتفاع نسبة الأخطاء',message:`نسبة الأخطاء ${pct(errors.length,reservations.length)}٪`}]:[]),
        ...(pending>0?[{level:'warning',title:'مدفوعات معلقة',message:`يوجد ${pending} طلب دفع معلق`}]:[]),
        ...(geminiRequiredForBalancesUsd>(geminiInfo.credits?.remaining||Infinity)?[{level:'warning',title:'التزام الرصيد أعلى من رصيد المزود',message:'راجع رصيد OpenRouter ورصيد المستخدمين.'}]:[])
      ],
      reports:{today:{newUsers:newUsers(day1),activeUsers:active(day1),messages:assistants.filter(m=>new Date(m.created_at).getTime()>=day1).length,images:images.filter(i=>new Date(i.created_at).getTime()>=day1).length},week:{newUsers:newUsers(day7),activeUsers:active(day7),messages:assistants.filter(m=>new Date(m.created_at).getTime()>=day7).length,images:images.filter(i=>new Date(i.created_at).getTime()>=day7).length}}
    });
  }catch(error){return handleError(error,res,localize(locale,'تعذر تحميل إحصاءات الإدارة.','Could not load admin analytics.'),locale)}
}
