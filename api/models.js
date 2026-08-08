// Boot-safe model catalog entrypoint.
// Keep this file dependency-free so /api/models can still answer GET requests
// even if a transitive dependency fails during module initialization.

function sendJson(res, status, body) {
  res.status(status);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(JSON.stringify(body));
}

function bootFallback() {
  const models = [
    {
      id: 'openrouter/free', name: 'OpenRouter Free Router', type: 'chat', isFree: true,
      locked: false, trial: true, contextLength: 128000, pricing: { prompt: 0, completion: 0 },
      inputModalities: ['text', 'image', 'files'], outputModalities: ['text'], provider: 'openrouter', costPerMillion: 0
    }
  ];
  return {
    name: 'AiWay', models,
    chatModelOrders: { cheapest: ['openrouter/free'], mostExpensive: ['openrouter/free'], free: ['openrouter/free'] },
    trialModelId: 'openrouter/free', packages: {}, tokenUsd: 0.00001,
    imageModels: [
      { id:'google/gemini-2.5-flash-image', name:'Gemini 2.5 Flash Image', shortName:'Gemini 2.5 Flash Image', type:'image', provider:'google', providerLabel:'google', locked:false, isFree:false, pricing:{image:0.04}, supportedAspectRatios:['1:1','4:3','3:4','16:9','9:16'], supportedResolutions:['512','1K','2K'] }
    ],
    videoModels: [
      { id:'bytedance/seedance-1.5-pro', name:'Seedance 1.5 Pro', shortName:'Seedance 1.5 Pro', type:'video', provider:'bytedance', providerLabel:'bytedance', locked:false, isFree:false, pricing:{video_second:0.02306}, pricePerSecond:0.02306, supportedAspectRatios:['16:9','9:16','1:1'], supportedResolutions:['720p','1080p'], supportedDurations:['4','5','6','8','10'] }
    ],
    tools: [],
    providerRouting: { sort:'throughput', allowFallbacks:true, label:'Fastest available provider' },
    rankingsSource: 'Boot-safe built-in fallback', refreshedAt: new Date().toISOString(), degraded: true
  };
}

export default async function handler(req, res) {
  try {
    const runtime = await import('./_models-runtime.js');
    return await runtime.default(req, res);
  } catch (error) {
    console.error('[MODELS_BOOT_FALLBACK]', error?.stack || error?.message || error);
    if (req.method === 'GET') {
      const data = bootFallback();
      data.degradedReason = 'MODEL_RUNTIME_IMPORT_FAILED';
      return sendJson(res, 200, data);
    }
    return sendJson(res, 503, {
      error: 'تعذر تشغيل خدمة النماذج مؤقتًا. حاول مرة أخرى.',
      code: 'MODEL_RUNTIME_IMPORT_FAILED'
    });
  }
}
