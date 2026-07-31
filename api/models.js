import {
  allowMethods, json, requestLocale, localize, requireUser, db,
  getAvailableModels, getTrialModelId, PACKAGES, packageQuote,
  TOKEN_USD, estimateChatCharge, getToolModelSettings, getAiTools, GEMINI_IMAGE_MODELS, GEMINI_LIVE_MODELS
} from './_lib.js';

const IMAGE_MODELS = GEMINI_IMAGE_MODELS.map(model=>({ ...model, shortName:model.name, type:'image', provider:'google', providerLabel:'Google', supportedAspectRatios:['1:1','4:3','3:4','16:9','9:16'] }));

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const locale = requestLocale(req);
  try {
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      if (body.action !== 'estimate-message') return json(res, 400, { error: localize(locale, 'طلب غير صالح.', 'Invalid request.') });
      const models = await getAvailableModels();
      const image = IMAGE_MODELS.find(model => model.id === body.modelId) || (body.taskId === 'image' ? IMAGE_MODELS[0] : null);
      if (image) {
        const providerUsd = Number(image.pricing.request);
        return json(res, 200, { type:'image', modelId:image.id, routedModelId:image.id, modelName:image.name, providerUsd, chargedTokens:Math.max(1, Math.ceil(providerUsd / TOKEN_USD)), approximate:true });
      }
      const settings = await getToolModelSettings();
      const id = settings[String(body.taskId || '')] || body.modelId;
      const model = models.find(item => item.id === id) || models[0];
      return json(res, 200, {
        type:'chat', modelId:model.id, routedModelId:model.id, modelName:model.name,
        ...estimateChatCharge(model.pricing, Array.isArray(body.messages) ? body.messages : [], Boolean(body.webSearch), Number(body.outputReserve || 0)),
        approximate:true
      });
    }

    let unlocked = false;
    try {
      const user = await requireUser(req);
      const { data } = await db().from('users').select('has_purchased').eq('id', user.id).single();
      unlocked = Boolean(data?.has_purchased);
    } catch {}

    const models = (await getAvailableModels()).map(model => ({
      ...model,
      type:'chat',
      locked:!unlocked && model.id !== 'gemini-3.1-flash-lite',
      trial:model.id === 'gemini-3.1-flash-lite',
      costPerMillion:(model.pricing.prompt + model.pricing.completion) * 1e6
    }));
    const packages = {};
    for (const id of Object.keys(PACKAGES)) {
      try { packages[id] = await packageQuote(id); }
      catch { packages[id] = { ...PACKAGES[id], amountPi:null }; }
    }
    return json(res, 200, {
      name:'AiWay', models,
      chatModelOrders:{ cheapest:models.map(model => model.id), mostExpensive:[...models].reverse().map(model => model.id), free:[] },
      trialModelId:await getTrialModelId(), packages,
      liveModels:GEMINI_LIVE_MODELS.map(model=>({...model,type:model.liveKind==='translate'?'live_translate':'live_audio',provider:'google',providerLabel:'Google'})),
      imageModels:IMAGE_MODELS.map(model => ({ ...model, locked:!unlocked, isFree:false })),
      tokenUsd:TOKEN_USD, tools:await getAiTools(), rankingsSource:'Google Gemini API pricing', refreshedAt:new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    return json(res, 500, { error:localize(locale, 'تعذر تحميل النماذج والأسعار.', 'Could not load models and pricing.'), code:'SERVER_ERROR' });
  }
}
