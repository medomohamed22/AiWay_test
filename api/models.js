import {
  allowMethods, json, requestLocale, localize, requireUser, db,
  getAvailableModels, getTrialModelId, PACKAGES, packageQuote,
  TOKEN_USD, estimateChatCharge, getToolModelSettings, getAiTools, getOpenRouterImageModels
} from './_lib.js';


function imageEstimate(model, resolution = '', hasReferenceImage = false) {
  const pricing=model?.pricing||{};
  const values=['request','image','image_output','output_image'].map(k=>Number(pricing[k])).filter(n=>Number.isFinite(n)&&n>0);
  let usd=values.length?Math.min(...values):0;
  const tier=String(resolution||'1K').toUpperCase();
  const multiplier=tier==='4K'?4:tier==='2K'?2:tier==='512'?0.5:1;
  if(!usd){const mp=Number(pricing.megapixel||0);usd=mp>0?mp*multiplier:0.04*multiplier;}
  else if(!Number(pricing.request||0)&&tier!=='1K')usd*=multiplier;
  if(hasReferenceImage)usd*=1.12;
  usd*=1.08;
  return {providerUsd:usd,chargedTokens:Math.max(1,Math.ceil(usd/TOKEN_USD))};
}

const enumValues=(descriptor,fallback=[])=>Array.isArray(descriptor)?descriptor.map(String):(Array.isArray(descriptor?.values)?descriptor.values.map(String):fallback);
const imageModels = async () => (await getOpenRouterImageModels()).map(model=>({ ...model, shortName:model.name, type:'image', provider:model.provider||model.id.split('/')[0], providerLabel:model.providerLabel||model.id.split('/')[0], supportedAspectRatios:enumValues(model.supported_parameters?.aspect_ratio,['1:1','4:3','3:4','16:9','9:16']), supportedResolutions:enumValues(model.supported_parameters?.resolution,['512','1K','2K','4K']) }));

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const locale = requestLocale(req);
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (body.action !== 'estimate-message') return json(res, 400, { error: localize(locale, 'طلب غير صالح.', 'Invalid request.') });
      let estimatePurchased = true;
      try {
        const estimateUser = await requireUser(req);
        const { data: estimateProfile } = await db().from('users').select('has_purchased').eq('id', estimateUser.id).single();
        estimatePurchased = Boolean(estimateProfile?.has_purchased);
      } catch {}
      const models = await getAvailableModels();
      const IMAGE_MODELS=await imageModels();
      const settings = await getToolModelSettings();
      const taskId = String(body.taskId || '').trim().toLowerCase();
      const configuredImageId = taskId === 'image' ? String(settings.image || '').trim() : '';
      const image = (configuredImageId && IMAGE_MODELS.find(model => model.id === configuredImageId))
        || IMAGE_MODELS.find(model => model.id === body.modelId)
        || null;
      if (image) {
        const estimate=imageEstimate(image,body.resolution,Boolean(body.hasReferenceImage));
        return json(res, 200, { type:'image', modelId:image.id, routedModelId:image.id, modelName:image.name, ...(estimatePurchased?estimate:{providerUsd:0,chargedTokens:1}), approximate:true, freeTrial:!estimatePurchased, billingMode:estimatePurchased?'paid':'free_trial', resolution:String(body.resolution||''), aspectRatio:String(body.aspectRatio||'') });
      }
      const id = settings[taskId] || body.modelId;
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
      return !imageOnly && !knownImageName;
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
      tokenUsd:TOKEN_USD, tools:await getAiTools(), providerRouting:{sort:'price',allowFallbacks:true,label:'Lowest-price provider'}, rankingsSource:'OpenRouter Models API pricing', refreshedAt:new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error:localize(locale, 'تعذر تحميل النماذج والأسعار.', 'Could not load models and pricing.'), code:'SERVER_ERROR' });
  }
}
