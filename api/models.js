import {
  allowMethods, json, requestLocale, localize, requireUser, db,
  getAvailableModels, getTrialModelId, packageQuote, getPaymentPackages, getFeatureFlags, getGlobalAnnouncement,
  TOKEN_USD, estimateChatCharge, getToolModelSettings, getAiTools, getOpenRouterImageModels, getOpenRouterImageModelEndpoints, chooseAutoModel, chooseTaskModel, modelSupportsAttachmentTypes, fitMessagesToModelContext
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


function isLyriaModel(model){const label=`${model?.id||''} ${model?.name||''}`.toLowerCase();return /(?:^|[\s\/_-])lyria(?:[\s\/_-]|$)/i.test(label);}

const enumValues=(descriptor,fallback=[])=>Array.isArray(descriptor)?descriptor.map(String):(Array.isArray(descriptor?.values)?descriptor.values.map(String):fallback);
const imageModels = async () => (await getOpenRouterImageModels()).map(model=>({ ...model, shortName:model.name, type:'image', provider:model.provider||model.id.split('/')[0], providerLabel:model.providerLabel||model.id.split('/')[0], supportedAspectRatios:enumValues(model.supported_parameters?.aspect_ratio,['1:1','4:3','3:4','16:9','9:16']), supportedResolutions:enumValues(model.supported_parameters?.resolution,['512','1K','2K','4K']) }));

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const locale = requestLocale(req);
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (body.action !== 'estimate-message') return json(res, 400, { error: localize(locale, 'طلب غير صالح.', 'Invalid request.') });
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
      const estimateMessages = Array.isArray(body.messages) ? body.messages : [];
      const estimateAttachments = Array.isArray(body.attachments) ? body.attachments : [];
      const attachmentTypes = estimateAttachments.map(a=>a?.text?'text':String(a?.type||'')).filter(Boolean);
      const latest = [...estimateMessages].reverse().find(message=>message?.role==='user');
      const latestText = typeof latest?.content === 'string' ? latest.content : (Array.isArray(latest?.content)?latest.content.find(part=>part?.type==='text')?.text||'':'');
      let model = null;
      if (routingTaskId) model = await chooseTaskModel(routingTaskId, latestText, {webSearch:Boolean(body.webSearch),hasAttachments:estimateAttachments.length>0,attachmentTypes});
      else if (body.modelId === 'aiway/auto') model = await chooseAutoModel(latestText, {webSearch:Boolean(body.webSearch),hasAttachments:estimateAttachments.length>0,attachmentTypes});
      if (!model) { const id = (routingTaskId ? settings[routingTaskId] : '') || body.modelId; model = models.find(item => item.id === id && modelSupportsAttachmentTypes(item,attachmentTypes)) || models.find(item=>modelSupportsAttachmentTypes(item,attachmentTypes)) || models[0]; }
      const reserveForServer = estimatePurchased ? 32768 : 16384;
      const fittedEstimateContext = fitMessagesToModelContext(estimateMessages, Number(model.contextLength || model.context_length || 0), reserveForServer, locale);
      if (fittedEstimateContext.tooLarge) return json(res, 413, { error:localize(locale,'المحتوى أكبر من سعة النموذج المختار.','The content exceeds the selected model context capacity.'), code:'CONTEXT_TOO_LONG' });
      const estimate = estimateChatCharge(model.pricing, fittedEstimateContext.messages, Boolean(body.webSearch), reserveForServer);
      return json(res, 200, {
        type:'chat', modelId:model.id, routedModelId:model.id, modelName:model.name,
        ...(estimatePurchased ? estimate : { ...estimate, providerUsd:0, chargedTokens:1 }),
        approximate:true, omittedContextMessages:Number(body.clientOmittedContextMessages||0)+Number(fittedEstimateContext.omittedMessages||0),
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
      .replace(/\b(?:free|preview|experimental)\b/g, ' ')
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
    const packageConfig=await getPaymentPackages(); const packages = {};
    for (const id of Object.keys(packageConfig)) {
      try { packages[id] = await packageQuote(id); }
      catch { packages[id] = { ...packageConfig[id], amountPi:null }; }
    }
    return json(res, 200, {
      name:'AiWay', models,
      chatModelOrders:{ cheapest:models.map(model => model.id), mostExpensive:[...models].reverse().map(model => model.id), free:models.filter(model=>model.costPerMillion===0||model.id.endsWith(':free')||model.id==='openrouter/free').map(model=>model.id) },
      trialModelId:'openrouter/free', packages,
      imageModels:(await imageModels()).map(model => ({ ...model, locked:!unlocked, isFree:false })),
      tokenUsd:TOKEN_USD, tools:await getAiTools(), featureFlags:await getFeatureFlags(), globalAnnouncement:await getGlobalAnnouncement(), providerRouting:{sort:'throughput',allowFallbacks:true,label:'Fastest available provider'}, rankingsSource:'OpenRouter Models API pricing', refreshedAt:new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error:localize(locale, 'تعذر تحميل النماذج والأسعار.', 'Could not load models and pricing.'), code:'SERVER_ERROR' });
  }
}
