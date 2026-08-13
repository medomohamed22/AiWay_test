import { allowMethods, db, fetchWithTimeout, handleError, json, localize, requestLocale, requireUser, requireAdmin, requireAdminToken, getAvailableModels, getToolModelSettings, getAiTools, getOpenRouterImageModels, MARKUP, TOKEN_USD, TRIAL_TOKENS, getPiUsd, getPaymentPackages, getFeatureFlags, getGlobalAnnouncement } from './_lib.js';

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


async function audit(admin,action,targetType,targetId,reason='',oldValue=null,newValue=null){
  try{await db().from('admin_audit_log').insert({admin_user_id:admin.id,action,target_type:targetType,target_id:String(targetId),reason:String(reason||''),old_value:oldValue,new_value:newValue});}catch(e){console.warn('Audit log unavailable:',e?.message)}
}
async function controlCenter(req,res,locale,admin){
  const supabase=db(),section=String(req.query?.section||'overview');
  if(req.method==='GET'){
    if(section==='user'){
      const userId=String(req.query?.userId||'');
      const [u,c,p,conv,msg,img]=await Promise.all([
        supabase.from('users').select('id,pi_uid,username,role,ai_tokens,paid_ai_tokens,paid_tokens_expires_at,trial_messages_remaining,free_trial_tokens,has_purchased,last_login_at,created_at,updated_at').eq('id',userId).maybeSingle(),
        supabase.from('admin_user_controls').select('*').eq('user_id',userId).maybeSingle(),
        supabase.from('payments').select('payment_id,txid,status,package_id,amount_pi,usd_amount,ai_tokens,created_at,completed_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(30),
        supabase.from('conversations').select('id,title,model_id,created_at,updated_at').eq('user_id',userId).order('updated_at',{ascending:false}).limit(12),
        supabase.from('messages').select('model_id,token_usage,created_at').eq('user_id',userId).eq('role','assistant').order('created_at',{ascending:false}).limit(500),
        supabase.from('generated_images').select('model_id,token_usage,created_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(200)
      ]);
      if(u.error||!u.data)return json(res,404,{error:'المستخدم غير موجود'});
      const usage=[...(msg.data||[]),...(img.data||[])];const modelCounts={};let consumed=0,lastActivity=u.data.last_login_at||u.data.updated_at||u.data.created_at;
      for(const r of usage){const m=r.model_id||'unknown';modelCounts[m]=(modelCounts[m]||0)+1;consumed+=charged(r.token_usage);if(r.created_at&&new Date(r.created_at)>new Date(lastActivity))lastActivity=r.created_at}
      return json(res,200,{user:u.data,control:c.data||{account_status:'active',chat_blocked:false,payment_blocked:false},payments:p.data||[],conversations:conv.data||[],usage:{consumedTokens:consumed,models:Object.entries(modelCounts).sort((a,b)=>b[1]-a[1]).map(([model,count])=>({model,count})),lastActivity}});
    }
    const migrationProbe=await supabase.from('admin_settings').select('key').limit(1);
    const migrationReady=!migrationProbe.error;
    const migrationError=migrationProbe.error?String(migrationProbe.error.message||migrationProbe.error.code||'ADMIN_UPGRADE_REQUIRED'):'';
    const [payments,controls,packages,audits,versions,settings,errors]=await Promise.all([
      optional(()=>supabase.from('payments').select('payment_id,txid,status,package_id,amount_pi,usd_amount,ai_tokens,user_id,created_at,completed_at').order('created_at',{ascending:false}),[]),
      optional(()=>supabase.from('admin_user_controls').select('*').order('updated_at',{ascending:false}),[]),
      getPaymentPackages({includeInactive:true}),
      optional(()=>supabase.from('admin_audit_log').select('id,admin_user_id,action,target_type,target_id,reason,old_value,new_value,created_at').order('created_at',{ascending:false}),[]),
      optional(()=>supabase.from('ai_tool_versions').select('id,tool_id,version_no,snapshot,created_at').order('created_at',{ascending:false}),[]),
      Promise.all([getFeatureFlags(),getGlobalAnnouncement()]),
      optional(()=>supabase.from('ai_usage_reservations').select('id,user_id,kind,status,response_meta,created_at,updated_at').eq('status','released').order('created_at',{ascending:false}),[])
    ]);
    return json(res,200,{payments:payments.slice(0,500),controls,packages,featureFlags:settings[0],announcement:settings[1],audit:audits.slice(0,300),versions:versions.slice(0,300),errors:errors.slice(0,100).map(r=>({id:r.id,userId:r.user_id,endpoint:r.response_meta?.endpoint||r.kind||'unknown',code:r.response_meta?.code||'REQUEST_RELEASED',model:r.response_meta?.model||r.response_meta?.modelId||'',latency:r.response_meta?.latency_ms||r.response_meta?.latencyMs||0,requestId:r.response_meta?.requestId||r.id,createdAt:r.created_at,meta:r.response_meta||{}})),migrationReady,migrationError});
  }
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{}),action=String(b.action||'');
  if(action==='adjust-balance'){
    const userId=String(b.userId||''),delta=Math.trunc(Number(b.delta||0)),reason=String(b.reason||'').trim();if(!userId||!delta||!reason)return json(res,400,{error:'المستخدم والمبلغ والسبب مطلوبون'});
    const {data:user,error}=await supabase.from('users').select('id,ai_tokens,paid_ai_tokens,has_purchased').eq('id',userId).single();if(error||!user)throw error||new Error('USER_NOT_FOUND');
    const old={ai_tokens:num(user.ai_tokens),paid_ai_tokens:num(user.paid_ai_tokens),has_purchased:Boolean(user.has_purchased)};const next=Math.max(0,old.ai_tokens+delta),nextPaid=Math.max(0,old.paid_ai_tokens+delta);
    const patch={ai_tokens:next,paid_ai_tokens:nextPaid,...(delta>0&&!user.has_purchased?{has_purchased:true}:{})};const up=await supabase.from('users').update(patch).eq('id',userId);if(up.error)throw up.error;await audit(admin,'adjust_balance','user',userId,reason,old,patch);return json(res,200,{ok:true,balance:next});
  }
  if(action==='user-control'){
    const userId=String(b.userId||''),reason=String(b.reason||'').trim();if(!userId||!reason)return json(res,400,{error:'السبب مطلوب'});const old=await supabase.from('admin_user_controls').select('*').eq('user_id',userId).maybeSingle();
    const row={user_id:userId,account_status:b.accountStatus==='suspended'?'suspended':'active',chat_blocked:Boolean(b.chatBlocked),payment_blocked:Boolean(b.paymentBlocked),note:String(b.note||'').slice(0,500),updated_by:admin.id,updated_at:new Date().toISOString()};const q=await supabase.from('admin_user_controls').upsert(row,{onConflict:'user_id'});if(q.error)throw q.error;await audit(admin,'update_user_control','user',userId,reason,old.data,row);return json(res,200,{ok:true,control:row});
  }
  if(action==='save-package'){
    const x=b.package||{},id=String(x.id||'').trim().toLowerCase().replace(/[^a-z0-9_-]/g,'').slice(0,32),reason=String(b.reason||'').trim();if(!id||!reason||!(Number(x.usd)>0)||!(Number(x.tokens)>0))return json(res,400,{error:'بيانات الباقة والسبب مطلوبة'});const old=await supabase.from('payment_packages').select('*').eq('id',id).maybeSingle();const row={id,name_ar:String(x.name_ar||id).slice(0,80),name_en:String(x.name_en||id).slice(0,80),usd:Number(x.usd),tokens:Math.trunc(Number(x.tokens)),recommended_for:String(x.recommendedFor||'regular').slice(0,40),popular:Boolean(x.popular),is_active:x.is_active!==false,sort_order:Math.trunc(Number(x.sort_order||0)),updated_by:admin.id,updated_at:new Date().toISOString()};const q=await supabase.from('payment_packages').upsert(row,{onConflict:'id'});if(q.error)throw q.error;await audit(admin,'save_package','payment_package',id,reason,old.data,row);return json(res,200,{ok:true,packages:await getPaymentPackages({includeInactive:true})});
  }
  if(action==='save-settings'){
    const key=String(b.key||''),reason=String(b.reason||'').trim();if(!['feature_flags','global_announcement'].includes(key)||!reason)return json(res,400,{error:'الإعداد والسبب مطلوبان'});const old=await supabase.from('admin_settings').select('value').eq('key',key).maybeSingle();if(old.error&&['42P01','PGRST205'].includes(String(old.error.code||'')))return json(res,409,{error:'شغّل admin-upgrade.sql مرة واحدة في Supabase أولًا.',code:'ADMIN_UPGRADE_REQUIRED'});const value=b.value&&typeof b.value==='object'?b.value:{};const q=await supabase.from('admin_settings').upsert({key,value,updated_by:admin.id,updated_at:new Date().toISOString()},{onConflict:'key'});if(q.error){if(['42P01','PGRST205'].includes(String(q.error.code||''))||/admin_settings/i.test(String(q.error.message||'')))return json(res,409,{error:'شغّل admin-upgrade.sql مرة واحدة في Supabase أولًا.',code:'ADMIN_UPGRADE_REQUIRED'});throw q.error;}await audit(admin,'save_setting','setting',key,reason,old.data?.value||null,value);return json(res,200,{ok:true,value});
  }
  if(action==='payment-recheck'){
    const paymentId=String(b.paymentId||'').trim(),reason=String(b.reason||'').trim()||'Admin payment recheck';if(!paymentId)return json(res,400,{error:'paymentId مطلوب'});const stored=await supabase.from('payments').select('*').eq('payment_id',paymentId).maybeSingle();if(stored.error||!stored.data)return json(res,404,{error:'الدفعة غير موجودة'});if(!process.env.PI_SECRET_KEY)return json(res,500,{error:'PI_SECRET_KEY غير مضبوط'});
    const headers={Authorization:`Key ${process.env.PI_SECRET_KEY}`,'Content-Type':'application/json'};let r=await fetchWithTimeout(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}`,{headers},20000);let remote=await r.json().catch(()=>({}));if(!r.ok)return json(res,502,{error:'تعذر قراءة الدفعة من Pi',remote});const txid=String(remote?.transaction?.txid||'').trim(),verified=Boolean(remote?.transaction?.verified||remote?.status?.transaction_verified);
    if(stored.data.status!=='completed'&&txid&&verified){if(!remote?.status?.developer_completed){r=await fetchWithTimeout(`https://api.minepi.com/v2/payments/${encodeURIComponent(paymentId)}/complete`,{method:'POST',headers,body:JSON.stringify({txid})},20000);remote=await r.json().catch(()=>remote);if(!r.ok)return json(res,502,{error:'Pi لم يكمل الدفعة',remote});}const done=await supabase.rpc('complete_token_purchase',{p_user_id:stored.data.user_id,p_payment_id:paymentId,p_txid:txid,p_tokens:stored.data.ai_tokens,p_raw:{admin_recheck:true,payment:remote}});if(done.error)throw done.error;}
    const latest=await supabase.from('payments').select('*').eq('payment_id',paymentId).single();await audit(admin,'recheck_payment','payment',paymentId,reason,stored.data,latest.data);return json(res,200,{ok:true,payment:latest.data,remoteStatus:remote?.status||{}});
  }
  return json(res,400,{error:'إجراء إدارة غير معروف'});
}

export default async function handler(req,res){
  if(!allowMethods(req,res,['GET','POST']))return;
  const locale=requestLocale(req);
  try{
    const mode=String(req.query?.mode||'');
    if(mode==='control-center'){const adminUser=await requireUser(req);await requireAdmin(adminUser);return controlCenter(req,res,locale,adminUser);}
    if(mode==='model-settings'){
      const adminUser=await requireUser(req);
      await requireAdmin(adminUser);
      if(req.method==='GET'){
        const models=(await getAvailableModels()).sort((a,b)=>(a.pricing.prompt+a.pricing.completion)-(b.pricing.prompt+b.pricing.completion));
        const imageModels=(await getOpenRouterImageModels()).sort((a,b)=>(a.pricing.request||0)-(b.pricing.request||0));
        return json(res,200,{tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings(),models,imageModels,pricingSource:'OpenRouter Models API pricing',pricingSourceUrl:'https://openrouter.ai/models',refreshedAt:new Date().toISOString(),catalogNote:'يتم ترتيب النماذج حسب مجموع سعر الإدخال والإخراج القياسي لكل مليون توكين'});
      }
      const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
      const action=String(b.action||'bulk-models');
      const validText=new Set((await getAvailableModels()).map(x=>x.id));
      const validImages=new Set((await getOpenRouterImageModels()).map(x=>x.id));
      const clean=v=>String(v??'').trim();
      const safeId=v=>clean(v).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48);
      if(action==='delete'){
        const id=safeId(b.id);
        if(!id)return json(res,400,{error:localize(locale,'معرّف الأداة غير صالح.','Invalid tool id.')});
        const old=await db().from('ai_tools').select('*').eq('id',id).maybeSingle();const {error}=await db().from('ai_tools').delete().eq('id',id);if(error)throw error;await audit(adminUser,'delete_tool','ai_tool',id,String(b.reason||'Delete tool'),old.data,null);
        return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      if(action==='duplicate-tool'){
        const sourceId=safeId(b.id),newId=safeId(b.newId);if(!sourceId||!newId)return json(res,400,{error:'معرّف المصدر والجديد مطلوبان'});
        const old=await db().from('ai_tools').select('*').eq('id',sourceId).maybeSingle();if(old.error||!old.data)return json(res,404,{error:'الأداة الأصلية غير موجودة'});
        const row={...old.data,id:newId,name_ar:`${old.data.name_ar} - نسخة`,name_en:`${old.data.name_en} Copy`,is_active:false,sort_order:num(old.data.sort_order)+1,updated_at:new Date().toISOString()};delete row.created_at;
        const q=await db().from('ai_tools').insert(row);if(q.error)throw q.error;await audit(adminUser,'duplicate_tool','ai_tool',newId,String(b.reason||'Duplicate tool'),null,row);return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      if(action==='rollback-tool'){
        const id=safeId(b.id),versionId=Number(b.versionId);if(!id||!versionId)return json(res,400,{error:'الأداة والنسخة مطلوبتان'});
        const v=await db().from('ai_tool_versions').select('*').eq('id',versionId).eq('tool_id',id).maybeSingle();if(v.error||!v.data)return json(res,404,{error:'النسخة غير موجودة'});
        const current=await db().from('ai_tools').select('*').eq('id',id).maybeSingle();const snap=v.data.snapshot||{};const row={...snap,id,updated_at:new Date().toISOString()};delete row.created_at;const q=await db().from('ai_tools').upsert(row,{onConflict:'id'});if(q.error)throw q.error;await audit(adminUser,'rollback_tool','ai_tool',id,String(b.reason||'Rollback tool'),current.data,row);return json(res,200,{ok:true,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      if(action==='test-tool'){
        const t=b.tool||{},prompt=clean(b.prompt||'اختبار سريع للأداة').slice(0,2000),model=clean(t.model_id),testStarted=Date.now();if(!process.env.OPENROUTER_API_KEY)return json(res,500,{error:'OPENROUTER_API_KEY غير مضبوط'});const headers={'Content-Type':'application/json',Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`,'X-Title':'AiWay Admin Preview'};
        if(t.tool_type==='image'){if(!validImages.has(model))return json(res,400,{error:'نموذج الصور غير صالح'});const r=await fetchWithTimeout('https://openrouter.ai/api/v1/images',{method:'POST',headers,body:JSON.stringify({model,prompt,n:1,provider:{sort:'throughput',allow_fallbacks:true}})},120000);const data=await r.json().catch(()=>({}));if(!r.ok)return json(res,r.status,{error:data?.error?.message||'فشل اختبار نموذج الصور'});const item=data?.data?.[0]||{};return json(res,200,{ok:true,image:item.b64_json?`data:${item.media_type||'image/png'};base64,${item.b64_json}`:(item.url||''),model:data?.model||model,usage:data?.usage||{},latencyMs:Date.now()-testStarted});}
        if(!validText.has(model))return json(res,400,{error:'النموذج غير صالح للاختبار'});const pc=t.prompt_config&&typeof t.prompt_config==='object'?t.prompt_config:{};const system=clean(t.system_prompt||pc.system_prompt||'').slice(0,12000);const body={model,messages:[{role:'system',content:system||'You are testing an AiWay tool configuration.'},{role:'user',content:prompt}],temperature:Math.max(0,Math.min(2,Number(t.temperature??pc?._admin?.temperature??0.7))),max_tokens:Math.max(64,Math.min(2048,Number(t.max_tokens??pc?._admin?.max_tokens??512))),stream:false};const r=await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions',{method:'POST',headers,body:JSON.stringify(body)},60000);const data=await r.json().catch(()=>({}));if(!r.ok)return json(res,r.status,{error:data?.error?.message||'فشل اختبار النموذج'});return json(res,200,{ok:true,text:data?.choices?.[0]?.message?.content||'',model:data?.model||model,usage:data?.usage||{},latencyMs:Date.now()-testStarted});
      }
      if(action==='save-tool'){
        const t=b.tool||{};const id=safeId(t.id);const allowedTypes=new Set(['text','image']);const type=allowedTypes.has(t.tool_type)?t.tool_type:'text';const model=clean(t.model_id);
        if(!id||!clean(t.name_ar)||!clean(t.name_en))return json(res,400,{error:localize(locale,'أدخل معرّفًا واسمًا عربيًا وإنجليزيًا.','Enter an id plus Arabic and English names.')});
        if(!(type==='image'?validImages:validText).has(model))return json(res,400,{error:localize(locale,'النموذج المختار غير صالح لنوع الأداة.','The selected model is invalid for this tool type.')});
        let promptConfig=t.prompt_config;
        if(typeof promptConfig==='string'){try{promptConfig=JSON.parse(promptConfig)}catch{return json(res,400,{error:localize(locale,'كود JSON الخاص بتعليمات الأداة غير صالح.','The tool instruction JSON is invalid.')})}}
        if(!promptConfig||typeof promptConfig!=='object'||Array.isArray(promptConfig))promptConfig={};
        const uiConfig=promptConfig._ui&&typeof promptConfig._ui==='object'&&!Array.isArray(promptConfig._ui)?{...promptConfig._ui}:{};
        try{uiConfig.icon_svg=sanitizeToolSvg(t.icon_svg??uiConfig.icon_svg)}catch{return json(res,400,{error:localize(locale,'ملف الأيقونة SVG غير آمن أو غير صالح.','The SVG icon is invalid or unsafe.')})}
        if(uiConfig.icon_svg)promptConfig._ui=uiConfig;else delete promptConfig._ui;
        const adminConfig=promptConfig._admin&&typeof promptConfig._admin==='object'&&!Array.isArray(promptConfig._admin)?{...promptConfig._admin}:{};
        const fallback=clean(t.fallback_model_id||adminConfig.fallback_model_id);if(fallback&&!(type==='image'?validImages:validText).has(fallback))return json(res,400,{error:'النموذج الاحتياطي غير صالح'});
        adminConfig.fallback_model_id=fallback||'';adminConfig.temperature=Math.max(0,Math.min(2,Number(t.temperature??adminConfig.temperature??0.7)));adminConfig.max_tokens=Math.max(128,Math.min(65536,Math.trunc(Number(t.max_tokens??adminConfig.max_tokens??32768))));adminConfig.publish_status=t.publish_status? (t.publish_status==='draft'?'draft':'published') : (adminConfig.publish_status==='draft'?'draft':'published');promptConfig._admin=adminConfig;
        promptConfig.system_prompt=clean(t.system_prompt??promptConfig.system_prompt).slice(0,12000);
        const promptJson=JSON.stringify(promptConfig);if(promptJson.length>36000)return json(res,400,{error:localize(locale,'تعليمات الأداة أو الأيقونة كبيرة جدًا.','Tool instructions or icon are too large.')});
        const row={id,name_ar:clean(t.name_ar).slice(0,120),name_en:clean(t.name_en).slice(0,120),description_ar:clean(t.description_ar).slice(0,1000),description_en:clean(t.description_en).slice(0,1000),tool_type:type,model_id:model,prompt_config:promptConfig,is_active:adminConfig.publish_status==='published'&&t.is_active!==false,sort_order:Math.max(0,Math.min(9999,Number(t.sort_order)||0)),updated_at:new Date().toISOString()};
        const previous=await db().from('ai_tools').select('*').eq('id',id).maybeSingle();if(previous.data){try{const last=await db().from('ai_tool_versions').select('version_no').eq('tool_id',id).order('version_no',{ascending:false}).limit(1).maybeSingle();await db().from('ai_tool_versions').insert({tool_id:id,version_no:num(last.data?.version_no)+1,snapshot:previous.data,created_by:adminUser.id})}catch(e){console.warn('Prompt versioning unavailable:',e?.message)}}
        const {error}=await db().from('ai_tools').upsert(row,{onConflict:'id'});if(error)throw error;await audit(adminUser,'save_tool','ai_tool',id,String(b.reason||'Tool editor save'),previous.data,row);
        return json(res,200,{ok:true,tool:row,tools:await getAiTools({includeInactive:true}),settings:await getToolModelSettings()});
      }
      const tools=await getAiTools({includeInactive:true});const updates=[];
      for(const tool of tools){const value=b.settings?.[tool.id];const valid=(tool.tool_type==='image'?validImages:validText).has(value);if(typeof value==='string'&&value.length<100&&valid)updates.push({...tool,model_id:value,updated_at:new Date().toISOString()})}
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
