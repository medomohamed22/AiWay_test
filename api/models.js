import {
  allowMethods, json, requestLocale, localize, requireUser, db,
  getAvailableModels, getTrialModelId, PACKAGES, packageQuote,
  TOKEN_USD, estimateChatCharge, getToolModelSettings, getAiTools, getOpenRouterImageModels, getOpenRouterImageModelEndpoints
} from './_lib.js';


function parseAspectRatio(value='1:1') {
  const match=String(value||'1:1').match(/(\d+(?:\.\d+)?)\s*[:xX/]\s*(\d+(?:\.\d+)?)/);
  const w=Number(match?.[1]||1),h=Number(match?.[2]||1);
  return w>0&&h>0?{w,h}:{w:1,h:1};
}
function imageMegapixels(resolution='',aspectRatio='1:1'){
  const text=String(resolution||'1K').trim().toUpperCase();
  const explicit=text.match(/(\d+)\s*[X×]\s*(\d+)/i);
  if(explicit)return Math.max(.01,(Number(explicit[1])*Number(explicit[2]))/1e6);
  const side=text==='4K'?4096:text==='2K'?2048:text==='512'?512:1024;
  const {w,h}=parseAspectRatio(aspectRatio);
  const width=w>=h?side:Math.max(1,Math.round(side*w/h));
  const height=h>=w?side:Math.max(1,Math.round(side*h/w));
  return Math.max(.01,(width*height)/1e6);
}
function pricingNumber(value){const n=Number(value);return Number.isFinite(n)&&n>0?n:0}
function imageEstimateFromPricing(pricing={},resolution='',aspectRatio='1:1',hasReferenceImage=false){
  const megapixels=imageMegapixels(resolution,aspectRatio);
  const fixed=pricingNumber(pricing.request)||pricingNumber(pricing.image)||pricingNumber(pricing.image_output)||pricingNumber(pricing.output_image);
  const perMegapixel=pricingNumber(pricing.megapixel)||pricingNumber(pricing.image_megapixel)||pricingNumber(pricing.output_image_megapixel);
  let usd=fixed||(perMegapixel?perMegapixel*megapixels:0);
  if(!usd)usd=.04*Math.max(1,megapixels);
  if(hasReferenceImage)usd*=1.08;
  usd*=1.05;
  return {providerUsd:usd,chargedTokens:Math.max(1,Math.ceil(usd/TOKEN_USD)),megapixels,pricingBasis:fixed?'per_image':perMegapixel?'per_megapixel':'fallback',unitPrice:fixed||perMegapixel||0};
}
async function imageEstimate(model,resolution='',aspectRatio='1:1',hasReferenceImage=false){
  const endpoints=await getOpenRouterImageModelEndpoints(model?.id);
  const candidates=[model,...endpoints].map(item=>({item,estimate:imageEstimateFromPricing(item?.pricing||{},resolution,aspectRatio,hasReferenceImage)}));
  const priced=candidates.filter(x=>x.estimate.unitPrice>0).sort((a,b)=>a.estimate.providerUsd-b.estimate.providerUsd);
  return (priced[0]||candidates[0]).estimate;
}


function smartIntent(text='', attachments=[]) {
  const q=String(text||'').toLowerCase();
  const hasImageAttachment=(attachments||[]).some(a=>String(a?.type||'').startsWith('image/'));
  const image=/(?:أنشئ|اعمل|صمم|ارسم|ولد|ولّد).{0,28}(?:صورة|لوجو|شعار|بوستر|poster|logo|image|photo)|(?:generate|create|draw|design).{0,24}(?:image|photo|logo|poster)/i.test(q);
  const coding=/(?:كود|برمج|بايثون|جافاسكربت|جافا|sql|api|debug|bug|function|react|node(?:\.js)?|typescript|python|code)/i.test(q);
  const translate=/(?:ترجم|ترجمة|translate|translation)/i.test(q);
  const summary=/(?:لخص|تلخيص|اختصر|summari[sz]e|summary)/i.test(q);
  const study=/(?:اشرح|درس|ذاكر|اختبرني|مسألة|رياضيات|فيزياء|كيمياء|explain|study|quiz|homework)/i.test(q);
  const business=/(?:مشروع|خطة عمل|دراسة جدوى|business|startup|strategy|market plan)/i.test(q);
  const ads=/(?:إعلان|تسويق|منشور|سوشيال|ad copy|marketing|social post)/i.test(q);
  const writing=/(?:اكتب|مقال|رسالة|صياغة|rewrite|article|email|write)/i.test(q);
  const web=/(?:اليوم|الآن|حاليًا|احدث|أحدث|آخر أخبار|سعر|أسعار|نتيجة|موعد|current|latest|today|news|price|weather|score|schedule|202[5-9])/i.test(q);
  const task=image?'image':coding?'coding':translate?'translate':summary?'summary':study?'study':business?'business':ads?'ads':writing?'writing':'general';
  const complex=q.length>1400||/(?:تحليل عميق|قارن بالتفصيل|معمارية|أمان|استراتيجية|برهان|multi-step|deep analysis|architecture|security|reasoning|research)/i.test(q)||(attachments||[]).length>0;
  return {task,webSearch:web&&!image,hasAttachments:(attachments||[]).length>0,hasImageAttachment,complex};
}
function smartCost(model){return Math.max(0,Number(model?.pricing?.prompt||0))+Math.max(0,Number(model?.pricing?.completion||0));}
function isLyriaModel(model){const label=`${model?.id||''} ${model?.name||''}`.toLowerCase();return /(?:^|[\s\/_-])lyria(?:[\s\/_-]|$)/i.test(label);}
function smartQuality(model,intent){
  const label=`${model?.id||''} ${model?.name||''}`.toLowerCase();
  let score=45;
  const context=Number(model?.contextLength||model?.context_length||0);
  if(context>=200000)score+=18;else if(context>=128000)score+=14;else if(context>=64000)score+=8;else if(context>=32000)score+=4;
  if(/(?:gpt-5|gpt-4\.1|claude.*(?:opus|sonnet)|gemini.*(?:pro|3)|deepseek.*r1|grok.*4)/i.test(label))score+=18;
  if(/(?:flash|mini|small|nano|8b|7b)/i.test(label))score-=6;
  if(intent.task==='coding'&&/(?:claude|gpt|deepseek|qwen|coder|gemini)/i.test(label))score+=14;
  if(['writing','translate','ads'].includes(intent.task)&&/(?:claude|gpt|gemini)/i.test(label))score+=10;
  if(intent.complex&&/(?:reason|thinking|pro|opus|sonnet|r1|gpt-5)/i.test(label))score+=10;
  if(intent.hasAttachments&&context>=64000)score+=8;
  return Math.max(0,Math.min(100,score));
}
function chooseSmartChatModel(models,intent,mode='balanced'){
  let pool=(models||[]).filter(m=>m&&!m.locked&&!isLyriaModel(m)&&!(String(m.id||'').endsWith(':free')||m.id==='openrouter/free'));
  const isText=m=>{const out=m?.architecture?.output_modalities||m?.output_modalities||[];return !Array.isArray(out)||out.includes('text')||!out.length};
  pool=pool.filter(isText);
  if(intent.webSearch){const webCapable=pool.filter(m=>/^google\/gemini-(?:3|[4-9])(?:[.-]|$)/i.test(String(m.id||'')));if(webCapable.length)pool=webCapable;else intent.webSearch=false;}
  if(intent.hasAttachments){const large=pool.filter(m=>Number(m.contextLength||m.context_length||0)>=64000);if(large.length)pool=large;}
  if(!pool.length)return null;
  const costs=pool.map(smartCost).filter(x=>x>0).sort((a,b)=>a-b);const mid=costs[Math.floor(costs.length/2)]||1;
  return [...pool].sort((a,b)=>{
    const qa=smartQuality(a,intent),qb=smartQuality(b,intent),ca=smartCost(a),cb=smartCost(b);
    const normCost=c=>Math.log10(1+(c/(mid||1))*10);
    const score=(q,c)=>mode==='economy'?q*.52-normCost(c)*30:mode==='quality'?q*1.28-normCost(c)*5:q*.92-normCost(c)*15;
    return score(qb,cb)-score(qa,ca)||(ca-cb);
  })[0];
}
function smartReasons(intent,mode,model,locale='en'){
  const ar=locale==='ar',reasons=[];
  const push=(a,e)=>reasons.push(ar?a:e);
  if(intent.task==='coding')push('قوي في البرمجة والتحليل التقني','Strong fit for coding and technical analysis');
  else if(intent.task==='translate')push('مناسب للترجمة والحفاظ على السياق','Well suited to translation and context preservation');
  else if(intent.task==='summary')push('مناسب للتلخيص والسياقات الطويلة','Well suited to summarization and longer context');
  else if(intent.task==='image')push('مخصص لإنشاء الصور','Designed for image generation');
  else push('مناسب لنوع الطلب الذي كتبته','Good match for the request you wrote');
  if(intent.webSearch)push('تم تفعيل بحث الويب لأن الطلب يحتاج معلومات حديثة','Web search was enabled because the request appears time-sensitive');
  if(intent.hasAttachments)push('يراعي وجود الملفات أو الصور المرفقة','Selected with your attachments in mind');
  if(mode==='economy')push('أولوية لأقل تكلفة مع جودة مناسبة','Prioritizes lower cost while keeping acceptable quality');
  if(mode==='balanced')push('توازن بين الجودة والسرعة والتكلفة','Balances quality, speed, and cost');
  if(mode==='quality')push('أولوية لأعلى جودة وقدرات أقوى','Prioritizes stronger capabilities and higher quality');
  return reasons.slice(0,4);
}

const enumValues=(descriptor,fallback=[])=>Array.isArray(descriptor)?descriptor.map(String):(Array.isArray(descriptor?.values)?descriptor.values.map(String):fallback);
const imageModels = async () => (await getOpenRouterImageModels()).map(model=>({ ...model, shortName:model.name, type:'image', provider:model.provider||model.id.split('/')[0], providerLabel:model.providerLabel||model.id.split('/')[0], supportedAspectRatios:enumValues(model.supported_parameters?.aspect_ratio,['1:1','4:3','3:4','16:9','9:16']), supportedResolutions:enumValues(model.supported_parameters?.resolution,['512','1K','2K','4K']) }));

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const locale = requestLocale(req);
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (!['estimate-message','smart-plan'].includes(body.action)) return json(res, 400, { error: localize(locale, 'طلب غير صالح.', 'Invalid request.') });
      let estimatePurchased = true, estimateAvailableTokens = 0;
      try {
        const estimateUser = await requireUser(req);
        const { data: estimateProfile } = await db().from('users').select('has_purchased,ai_tokens').eq('id', estimateUser.id).single();
        estimatePurchased = Boolean(estimateProfile?.has_purchased);
        estimateAvailableTokens = Math.max(0, Number(estimateProfile?.ai_tokens || 0));
      } catch {}
      const models = await getAvailableModels();
      const IMAGE_MODELS=await imageModels();
      const settings = await getToolModelSettings();
      if (body.action === 'smart-plan') {
        const mode=['economy','balanced','quality'].includes(String(body.smartMode||''))?String(body.smartMode):'balanced';
        const attachments=Array.isArray(body.attachments)?body.attachments.slice(0,3):[];
        const messageText=Array.isArray(body.messages)?String([...body.messages].reverse().find(m=>m?.role==='user')?.content||''):String(body.text||'');
        const intent=smartIntent(messageText,attachments);
        if (!estimatePurchased) {
          const free=models.find(m=>m.id==='openrouter/free')||models.find(m=>!isLyriaModel(m)&&String(m.id||'').endsWith(':free'))||models.find(m=>!isLyriaModel(m));
          return json(res,200,{action:'smart-plan',type:'chat',mode,task:intent.task,webSearch:false,modelId:free?.id||'openrouter/free',routedModelId:free?.id||'openrouter/free',modelName:free?.name||'OpenRouter Free',providerUsd:0,chargedTokens:1,billingMode:'free_trial',approximate:true,reasons:smartReasons(intent,mode,free,locale)});
        }
        if(intent.task==='image'){
          const availableImages=IMAGE_MODELS.filter(m=>!m.locked);
          const scored=[];for(const m of availableImages){const est=await imageEstimate(m,String(body.resolution||'1K'),String(body.aspectRatio||'1:1'),Boolean(body.hasReferenceImage));const label=`${m.id||''} ${m.name||''}`.toLowerCase();let q=50;if(/(?:pro|ultra|max|flux|imagen|seedream)/i.test(label))q+=20;if(/(?:fast|turbo|flash)/i.test(label))q-=4;scored.push({m,est,q});}
          scored.sort((a,b)=>mode==='economy'?(a.est.providerUsd-b.est.providerUsd):mode==='quality'?(b.q-a.q||b.est.providerUsd-a.est.providerUsd):((b.q-b.est.providerUsd*180)-(a.q-a.est.providerUsd*180)));
          let pick=scored[0];if(!pick)return json(res,503,{error:localize(locale,'لا يوجد نموذج صور متاح حاليًا.','No image model is currently available.')});
          let budgetAdjusted=false;if(estimateAvailableTokens>0&&pick.est.chargedTokens>estimateAvailableTokens){const affordable=scored.filter(x=>x.est.chargedTokens<=estimateAvailableTokens).sort((a,b)=>a.est.providerUsd-b.est.providerUsd)[0];if(affordable){pick=affordable;budgetAdjusted=true;}}
          const reasons=smartReasons(intent,mode,pick.m,locale);if(budgetAdjusted)reasons.push(localize(locale,'تم اختيار بديل مناسب لرصيدك الحالي.','An affordable alternative was selected for your current balance.'));
          return json(res,200,{action:'smart-plan',type:'image',mode,task:'image',webSearch:false,modelId:pick.m.id,routedModelId:pick.m.id,modelName:pick.m.name,...pick.est,billingMode:'paid',approximate:true,reasons:reasons.slice(0,4),budgetAdjusted,availableTokens:estimateAvailableTokens,overBudget:estimateAvailableTokens>0&&pick.est.chargedTokens>estimateAvailableTokens,resolution:String(body.resolution||'1K'),aspectRatio:String(body.aspectRatio||'1:1')});
        }
        let model=chooseSmartChatModel(models,intent,mode);if(!model)return json(res,503,{error:localize(locale,'لا يوجد نموذج مناسب متاح حاليًا.','No suitable model is currently available.')});
        const reserve=mode==='economy'?1536:mode==='quality'?6144:3072;
        let estimate=estimateChatCharge(model.pricing,Array.isArray(body.messages)?body.messages:[],Boolean(intent.webSearch),reserve),budgetAdjusted=false;
        if(estimateAvailableTokens>0&&estimate.chargedTokens>estimateAvailableTokens){const candidates=(models||[]).filter(m=>m&&!m.locked&&!isLyriaModel(m)&&m.id!=='openrouter/free'&&!String(m.id||'').endsWith(':free')).sort((a,b)=>smartCost(a)-smartCost(b));for(const candidate of candidates){if(intent.webSearch&&!/^google\/gemini-(?:3|[4-9])(?:[.-]|$)/i.test(String(candidate.id||'')))continue;const trial=estimateChatCharge(candidate.pricing,Array.isArray(body.messages)?body.messages:[],Boolean(intent.webSearch),Math.min(reserve,1536));if(trial.chargedTokens<=estimateAvailableTokens){model=candidate;estimate=trial;budgetAdjusted=true;break;}}}
        const reasons=smartReasons(intent,mode,model,locale);if(budgetAdjusted)reasons.push(localize(locale,'تم اختيار بديل يناسب رصيدك الحالي.','An alternative was selected to fit your current balance.'));
        return json(res,200,{action:'smart-plan',type:'chat',mode,task:intent.task,webSearch:Boolean(intent.webSearch),modelId:model.id,routedModelId:model.id,modelName:model.name,...estimate,billingMode:'paid',approximate:true,reasons:reasons.slice(0,4),budgetAdjusted,availableTokens:estimateAvailableTokens,overBudget:estimateAvailableTokens>0&&estimate.chargedTokens>estimateAvailableTokens});
      }
      const taskId = String(body.taskId || '').trim().toLowerCase();
      // Keep estimate routing identical to /api/chat: the 'all-models' workspace
      // must honor the exact model explicitly selected by the user.
      const routingTaskId = taskId === 'all-models' ? '' : taskId;
      const configuredImageId = routingTaskId === 'image' ? String(settings.image || '').trim() : '';
      const image = (configuredImageId && IMAGE_MODELS.find(model => model.id === configuredImageId))
        || IMAGE_MODELS.find(model => model.id === body.modelId)
        || null;
      if (image) {
        const estimate=await imageEstimate(image,body.resolution,body.aspectRatio,Boolean(body.hasReferenceImage));
        return json(res, 200, { type:'image', modelId:image.id, routedModelId:image.id, modelName:image.name, ...(estimatePurchased?estimate:{providerUsd:0,chargedTokens:1}), approximate:true, freeTrial:!estimatePurchased, billingMode:estimatePurchased?'paid':'free_trial', resolution:String(body.resolution||''), aspectRatio:String(body.aspectRatio||''), megapixels:estimate.megapixels, pricingBasis:estimate.pricingBasis, unitPrice:estimate.unitPrice });
      }
      const id = (routingTaskId ? settings[routingTaskId] : '') || body.modelId;
      const model = models.find(item => item.id === id) || models[0];
      const estimate = estimateChatCharge(model.pricing, Array.isArray(body.messages) ? body.messages : [], Boolean(body.webSearch), Number(body.outputReserve || 0));
      return json(res, 200, {
        type:'chat', modelId:model.id, routedModelId:model.id, modelName:model.name,
        ...(estimatePurchased ? estimate : { ...estimate, providerUsd:0, chargedTokens:1 }),
        approximate:true,
        freeTrial:!estimatePurchased, billingMode:estimatePurchased?'paid':'free_trial'
      });
    }

    let unlocked = false;
    try {
      const user = await requireUser(req);
      const { data } = await db().from('users').select('has_purchased').eq('id', user.id).single();
      unlocked = Boolean(data?.has_purchased);
    } catch {}

    const catalog = await getAvailableModels();
    const freeModels = catalog.filter(model =>
      !isLyriaModel(model) &&
      (model.id === 'openrouter/free' ||
      model.id.endsWith(':free') ||
      (Number(model.pricing?.prompt || 0) === 0 && Number(model.pricing?.completion || 0) === 0)) &&
      !((model?.architecture?.output_modalities || model?.output_modalities || []).includes?.('image') && !(model?.architecture?.output_modalities || model?.output_modalities || []).includes?.('text'))
    );
    const isChatOnlyModel = model => {
      const id = String(model?.id || '').toLowerCase();
      const name = String(model?.name || '').toLowerCase();
      const outputModalities = model?.architecture?.output_modalities || model?.output_modalities || [];
      const outputs = Array.isArray(outputModalities) ? outputModalities.map(value => String(value).toLowerCase()) : [];
      const imageOnly = outputs.includes('image') && !outputs.includes('text');
      const knownImageName = /nano[\s-]*banana|image[\s-]*(generation|preview)|gemini.*image|imagen|flash-image/.test(`${id} ${name}`);
      const knownAudioMusicModel = /(?:^|[\s\/_-])lyria(?:[\s\/_-]|$)/.test(`${id} ${name}`);
      return !imageOnly && !knownImageName && !knownAudioMusicModel;
    };
    const normalizedModelName = model => String(model?.name || model?.id || '')
      .toLowerCase()
      .replace(/\([^)]*\)/g, ' ')
      .replace(/(?:free|preview|experimental)/g, ' ')
      .replace(/[^a-z0-9.]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const latestFive = matcher => {
      const seen = new Set();
      return catalog
        .filter(model => isChatOnlyModel(model) && matcher(model) && !freeModels.some(free => free.id === model.id))
        .sort((a,b) => Number(b.created || 0) - Number(a.created || 0) || String(a.name).localeCompare(String(b.name)))
        .filter(model => {
          const key = normalizedModelName(model);
          if (!key || seen.has(key)) return false;
          seen.add(key);
          return true;
        })
        .slice(0, 5);
    };
    const featuredPaid = [
      ...latestFive(model => /^openai\/(?:gpt|chatgpt)/i.test(model.id) || /\bGPT\b/i.test(model.name)),
      ...latestFive(model => /^google\/gemini/i.test(model.id) || /\bGemini\b/i.test(model.name)),
      ...latestFive(model => /^anthropic\/claude/i.test(model.id) || /\bClaude\b/i.test(model.name)),
      ...latestFive(model => /^x-ai\/grok/i.test(model.id) || /\bGrok\b/i.test(model.name)),
      ...latestFive(model => /^deepseek\/deepseek/i.test(model.id) || /\bDeepSeek\b/i.test(model.name))
    ];
    const visibleCatalog = [...new Map([...featuredPaid, ...freeModels].map(model => [model.id, model])).values()];
    const models = visibleCatalog.map(model => {
      const isFree = model.id === 'openrouter/free' || model.id.endsWith(':free') ||
        (Number(model.pricing?.prompt || 0) === 0 && Number(model.pricing?.completion || 0) === 0);
      return {
        ...model,
        type:'chat',
        isFree,
        locked:!unlocked && model.id !== 'openrouter/free',
        trial:model.id === 'openrouter/free',
        costPerMillion:(Number(model.pricing?.prompt || 0) + Number(model.pricing?.completion || 0)) * 1e6
      };
    }).sort((a,b)=>a.costPerMillion-b.costPerMillion||a.name.localeCompare(b.name));
    const packages = {};
    for (const id of Object.keys(PACKAGES)) {
      try { packages[id] = await packageQuote(id); }
      catch { packages[id] = { ...PACKAGES[id], amountPi:null }; }
    }
    return json(res, 200, {
      name:'AiWay', models,
      chatModelOrders:{ cheapest:models.map(model => model.id), mostExpensive:[...models].reverse().map(model => model.id), free:models.filter(model=>model.costPerMillion===0||model.id.endsWith(':free')||model.id==='openrouter/free').map(model=>model.id) },
      trialModelId:'openrouter/free', packages,
      imageModels:(await imageModels()).map(model => ({ ...model, locked:!unlocked, isFree:false })),
      tokenUsd:TOKEN_USD, tools:await getAiTools(), providerRouting:{sort:'throughput',allowFallbacks:true,label:'Fastest available provider'}, rankingsSource:'OpenRouter Models API pricing', refreshedAt:new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error:localize(locale, 'تعذر تحميل النماذج والأسعار.', 'Could not load models and pricing.'), code:'SERVER_ERROR' });
  }
}
