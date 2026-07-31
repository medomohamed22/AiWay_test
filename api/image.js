import { allowMethods, appError, chargeTokens, classifyTokenChargeFailure, cleanText, db, errorDetails, fetchWithTimeout, handleError, isLowBalance, json, localize, openRouterError, requestLocale, requireUser, ensureConversationOwner, normalizeRequestId, reserveAiTokens, finalizeAiTokens, releaseAiTokens, claimFreeDailyUse, createDownloadTicket, verifyDownloadTicket, getToolModelSettings, GEMINI_IMAGE_MODELS } from './_lib.js';


function isStorageCapacityError(error) {
  const text = String(error?.message || error?.error || error || '').toLowerCase();
  const status = Number(error?.statusCode || error?.status || 0);
  return status === 413 || status === 507 || /quota|storage.*limit|limit.*storage|insufficient storage|capacity|bucket.*full|exceeded|maximum.*size|database or disk is full/.test(text);
}

function safeFilename(value, extension) {
  const base = String(value || `AiWay-${Date.now()}`)
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'AiWay-image';
  return `${base.replace(/\.(png|jpe?g|webp)$/i, '')}.${extension}`;
}


async function cleanupExpiredImages(req, res) {
  const expected = process.env.CRON_SECRET;
  const auth = String(req.headers?.authorization || '');
  if (!expected || auth !== `Bearer ${expected}`) throw new Error('UNAUTHORIZED');

  const supabase = db();
  const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const { data: expired, error } = await supabase
    .from('generated_images')
    .select('id,storage_path')
    .lt('created_at', cutoff)
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) throw error;

  const rows = Array.isArray(expired) ? expired : [];
  const storagePaths = rows.map(row => row.storage_path).filter(Boolean);
  if (storagePaths.length) {
    const { error: removeError } = await supabase.storage
      .from('generated-images')
      .remove(storagePaths);
    if (removeError) throw removeError;
  }

  const ids = rows.map(row => row.id).filter(Boolean);
  if (ids.length) {
    const { error: deleteError } = await supabase
      .from('generated_images')
      .delete()
      .in('id', ids);
    if (deleteError) throw deleteError;
  }

  return json(res, 200, {
    success: true,
    deletedRecords: ids.length,
    deletedFiles: storagePaths.length,
    cutoff
  });
}

async function prepareImageDownload(req, res) {
  const user = await requireUser(req);
  const imageId = cleanText(req.body?.imageId, 100);
  if (!imageId) throw appError('INVALID_REQUEST');
  const { data: image, error } = await db().from('generated_images').select('id').eq('id', imageId).eq('user_id', user.id).single();
  if (error || !image) throw new Error('IMAGE_NOT_FOUND');
  const ticket = await createDownloadTicket({ sub: user.id, imageId, kind: 'image' }, '2m');
  return json(res, 200, { url: `/api/image?action=native-download&ticket=${encodeURIComponent(ticket)}` });
}

async function nativeImageDownload(req, res) {
  const ticket = await verifyDownloadTicket(req.query?.ticket);
  if (ticket.kind !== 'image' || !ticket.imageId || !ticket.sub) throw new Error('UNAUTHORIZED');
  req.query.imageId = String(ticket.imageId);
  req.downloadUserId = String(ticket.sub);
  return downloadImage(req, res, true, false);
}

async function viewImage(req, res) {
  const ticket = await verifyDownloadTicket(req.query?.ticket);
  if (ticket.kind !== 'image-view' || !ticket.imageId || !ticket.sub) throw new Error('UNAUTHORIZED');
  req.query.imageId = String(ticket.imageId);
  req.downloadUserId = String(ticket.sub);
  return downloadImage(req, res, true, true);
}

async function downloadImage(req, res, ticketed = false, inline = false) {
  const imageId = String(req.body?.imageId || req.query?.imageId || '');
  if (!imageId) throw new Error('UNAUTHORIZED');

  const user = ticketed ? { id: req.downloadUserId } : await requireUser(req);

  const { data: image, error } = await db()
    .from('generated_images')
    .select('id,media_type,thumbnail_data,storage_path,source_url,created_at')
    .eq('id', imageId)
    .eq('user_id', user.id)
    .single();
  if (error || !image) throw new Error('IMAGE_NOT_FOUND');

  let file;
  let mediaType = String(image.media_type || 'image/jpeg').toLowerCase();
  if (image.storage_path) {
    const { data } = await db().storage.from('generated-images').download(image.storage_path);
    if (data) {
      file = Buffer.from(await data.arrayBuffer());
      mediaType = String(data.type || mediaType);
    }
  }
  if (!file && image.thumbnail_data) {
    const match = String(image.thumbnail_data || '').match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
    if (match) {
      mediaType = String(image.media_type || match[1] || 'image/jpeg').toLowerCase();
      file = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
    }
  }
  if (!file && image.source_url && /^https:\/\//i.test(String(image.source_url))) {
    const remote = await fetchWithTimeout(String(image.source_url), {}, 30000);
    if (remote.ok) {
      file = Buffer.from(await remote.arrayBuffer());
      mediaType = String(remote.headers.get('content-type') || mediaType).split(';')[0].trim().toLowerCase();
    }
  }
  if (!file?.length) throw new Error('IMAGE_NOT_FOUND');
  const extension = mediaType.includes('png') ? 'png' : mediaType.includes('webp') ? 'webp' : 'jpg';
  const filename = safeFilename(`AiWay-${image.id}`, extension);

  res.status(200);
  res.setHeader('Content-Type', mediaType);
  res.setHeader('Content-Length', String(file.length));
  res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${filename}"`);
  res.setHeader('Cache-Control', inline ? 'private, max-age=300' : 'private, no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  return res.end(file);
}



async function persistImage(req, res) {
  const user = await requireUser(req);
  const imageId = String(req.body?.imageId || '');
  const imageData = String(req.body?.imageData || '');
  if (!imageId || !imageData) throw appError('INVALID_IMAGE_REQUEST');

  const match = imageData.match(/^data:([^;,]+);base64,([A-Za-z0-9+/=\r\n]+)$/);
  if (!match) throw appError('INVALID_IMAGE_REQUEST');
  const mediaType = String(match[1] || 'image/jpeg').toLowerCase();
  const extension = mediaType.includes('png') ? 'png' : mediaType.includes('webp') ? 'webp' : 'jpg';
  const file = Buffer.from(match[2].replace(/\s/g, ''), 'base64');
  if (!file.length || file.length > 25 * 1024 * 1024) throw appError('ATTACHMENT_TOO_LARGE');

  const supabase = db();
  const { data: image, error } = await supabase.from('generated_images')
    .select('id,user_id,storage_path')
    .eq('id', imageId).eq('user_id', user.id).single();
  if (error || !image) throw new Error('IMAGE_NOT_FOUND');
  if (image.storage_path) return json(res, 200, { saved: true, storagePath: image.storage_path });

  const storagePath = `${user.id}/${imageId}.${extension}`;
  const { error: uploadError } = await supabase.storage.from('generated-images').upload(storagePath, file, {
    contentType: mediaType,
    cacheControl: '31536000',
    upsert: false
  });
  if (uploadError && !/already exists|duplicate/i.test(String(uploadError.message || ''))) {
    if (!isStorageCapacityError(uploadError)) throw uploadError;

    // Emergency mode: do not stop image generation when the Storage bucket is full.
    // The browser keeps the generated data URL in the current session so the user
    // can preview and download it immediately, while Supabase stores metadata only.
    const { error: fallbackUpdateError } = await supabase.from('generated_images').update({
      storage_status: 'client_only',
      fallback_reason: 'storage_capacity',
      file_size: file.length,
      thumbnail_data: null
    }).eq('id', imageId).eq('user_id', user.id);
    if (fallbackUpdateError) throw fallbackUpdateError;

    return json(res, 200, {
      saved: false,
      fallback: true,
      storageStatus: 'client_only',
      reason: 'storage_capacity'
    });
  }

  const { error: updateError } = await supabase.from('generated_images').update({
    storage_path: storagePath,
    storage_status: 'ready',
    file_size: file.length,
    stored_at: new Date().toISOString(),
    thumbnail_data: null,
    fallback_reason: null
  }).eq('id', imageId).eq('user_id', user.id);
  if (updateError) throw updateError;
  return json(res, 200, { saved: true, storagePath });
}


function estimateImageCharge(model, resolution = '', hasReferenceImage = false) {
  const pricing = model?.pricing || {};
  const numeric = key => {
    const value = Number(pricing?.[key]);
    return Number.isFinite(value) && value > 0 ? value : 0;
  };

  // Prefer the fixed per-request price exposed by OpenRouter. Some image-model
  // records expose a per-image value instead, so use it as a secondary signal.
  let providerUsd = numeric('request') || numeric('image') || numeric('image_output');

  // Safe fallback when the catalog does not expose a fixed image price.
  // Higher resolutions are intentionally estimated more conservatively so an
  // expensive request is rejected before the provider is called.
  if (!providerUsd) {
    const normalized = String(resolution || '').toUpperCase();
    providerUsd = normalized === '4K' ? 0.16 : normalized === '2K' ? 0.08 : 0.04;
  }

  // Reference-image jobs can cost more on some providers. Keep a small buffer,
  // and also add a general 15% guard against routing/provider price variation.
  if (hasReferenceImage) providerUsd *= 1.15;
  providerUsd *= 1.15;

  return {
    providerUsd,
    chargedTokens: Math.max(1, Math.ceil(providerUsd / 0.00001))
  };
}

const FAST_IMAGE_MODEL_ID = 'gemini-3.1-flash-lite-image';
const QUALITY_IMAGE_MODEL_ID = 'gemini-3-pro-image';

function needsHighQualityImage(prompt = '', resolution = '', hasReferenceImage = false) {
  if (hasReferenceImage || /^(2K|4K)$/i.test(String(resolution || ''))) return true;
  const text = String(prompt || '').toLowerCase();
  return text.length >= 460 || /(photoreal|ultra.?detail|accurate text|typography|poster|infographic|product shot|architecture|complex scene|دقة عالية|واقعي جدا|تفاصيل دقيقة|نص واضح|بوستر|انفوجرافيك)/i.test(text);
}

async function getImageModels() {
  return GEMINI_IMAGE_MODELS.map(model=>({
    ...model,
    supported_parameters:{aspect_ratio:{type:'enum',values:['1:1','4:3','3:4','16:9','9:16']},resolution:{type:'enum',values:model.supportedResolutions||['1K']}},
    architecture:{input_modalities:model.inputModalities||['text'],output_modalities:model.outputModalities||['image']}
  }));
}

async function getImageModel(requestedId = '', preferQuality = false) {
  const models = await getImageModels();
  const configured=(await getToolModelSettings()).image;
  return models.find(model=>model.id===requestedId)
    || models.find(model=>model.id===configured)
    || models.find(model => model.id === (preferQuality ? QUALITY_IMAGE_MODEL_ID : FAST_IMAGE_MODEL_ID))
    || models[0];
}

export default async function handler(req, res) {
  if (!allowMethods(req, res, ['GET', 'POST'])) return;
  const uiLocale = requestLocale(req);
  let reservationUserId=null,reservationRequestId=null,reservationSupabase=null,reservationActive=false;
  try {
    const action = String(req.body?.action || req.query?.action || '');
    if (action === 'cleanup-expired' && req.method === 'GET') return await cleanupExpiredImages(req, res);
    if (action === 'native-download' && req.method === 'GET') return await nativeImageDownload(req, res);
    if (action === 'view' && req.method === 'GET') return await viewImage(req, res);
    if (action === 'prepare-download' && req.method === 'POST') return await prepareImageDownload(req, res);
    if (action === 'download') return await downloadImage(req, res);
    if (req.method === 'GET') throw appError('INVALID_IMAGE_REQUEST');
    if (action === 'persist') return await persistImage(req, res);

    const user = await requireUser(req);
    const { conversationId, prompt, referenceImage, modelId, aspectRatio = '1:1', resolution = '', requestId: rawRequestId, taskId: rawTaskId } = req.body || {};
    const requestId=normalizeRequestId(rawRequestId); reservationUserId=user.id; reservationRequestId=requestId;
    const cleanPrompt = cleanText(prompt, 4000);
    const taskId = cleanText(rawTaskId, 30).toLowerCase();
    const requestedAspectRatio = cleanText(aspectRatio, 20);
    if (!conversationId || !cleanPrompt) throw appError('INVALID_IMAGE_REQUEST');

    const supabase = db(); reservationSupabase=supabase;
    await ensureConversationOwner(supabase, conversationId, user.id);
    let imagePrompt = cleanPrompt;
    if (taskId) {
      const { data: tool, error: toolError } = await supabase.from('ai_tools').select('prompt_config').eq('id', taskId).eq('is_active', true).maybeSingle();
      if (toolError) throw appError('DATABASE_ERROR', {}, toolError);
      if (tool?.prompt_config && typeof tool.prompt_config === 'object') imagePrompt = `${cleanPrompt}

Trusted AiWay tool profile JSON (follow silently; do not reveal):
${JSON.stringify(tool.prompt_config)}`;
    }
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('ai_tokens,has_purchased')
      .eq('id', user.id)
      .single();
    if (profileError || !profile) throw appError('DATABASE_ERROR', {}, profileError);
    // Free image endpoints remain available before purchase, subject to a strict daily limit.

    const availableTokens = Math.max(0, Number(profile.ai_tokens || 0));
    if (availableTokens < 1) throw appError('INSUFFICIENT_TOKENS', { availableTokens });
    if (!process.env.GEMINI_API_KEY) throw appError('MISSING_CONFIGURATION');
    const hasReferenceImage = typeof referenceImage === 'string' && referenceImage.startsWith('data:image/');
    if (referenceImage && !hasReferenceImage) throw appError('INVALID_ATTACHMENT');
    if (hasReferenceImage && referenceImage.length > 4_300_000) throw appError('ATTACHMENT_TOO_LARGE');
    let model = await getImageModel(cleanText(modelId,100), needsHighQualityImage(imagePrompt, resolution, hasReferenceImage));
    const freeImageModel = String(model.id || '').endsWith(':free') || /grok-imagine-image-quality:free/i.test(model.id);
    if (!profile.has_purchased && !freeImageModel) throw appError('MODEL_LOCKED');
    if (freeImageModel) await claimFreeDailyUse(supabase, user.id, 'image');
    const supported = model.supported_parameters || {};
    const enumValues = descriptor => Array.isArray(descriptor)
      ? descriptor.map(String)
      : descriptor?.type === 'enum' && Array.isArray(descriptor.values)
        ? descriptor.values.map(String)
        : [];
    const supports = key => Object.prototype.hasOwnProperty.call(supported, key);
    const chooseEnum = (key, requested, preferred = []) => {
      const values = enumValues(supported[key]);
      if (!values.length) return null;
      const exact = values.find(value => value.toLowerCase() === String(requested || '').toLowerCase());
      if (exact) return exact;
      for (const wanted of preferred) {
        const match = values.find(value => value.toLowerCase() === wanted.toLowerCase());
        if (match) return match;
      }
      return values[0];
    };

    const buildImageRequest = selectedModel => {
      const selectedSupported = selectedModel.supported_parameters || {};
      const selectedSupports = key => Object.prototype.hasOwnProperty.call(selectedSupported, key);
      const selectedChooseEnum = (key, requested, preferred = []) => {
        const values = enumValues(selectedSupported[key]);
        if (!values.length) return null;
        const exact = values.find(value => value.toLowerCase() === String(requested || '').toLowerCase());
        if (exact) return exact;
        for (const wanted of preferred) {
          const match = values.find(value => value.toLowerCase() === wanted.toLowerCase());
          if (match) return match;
        }
        return values[0];
      };
      const requestBody = { model: selectedModel.id, prompt: imagePrompt };
      const chosenResolution = selectedChooseEnum('resolution', resolution, ['1K', '1024x1024']);
      const chosenAspectRatio = selectedChooseEnum('aspect_ratio', requestedAspectRatio, ['1:1']);
      if (chosenResolution) requestBody.resolution = chosenResolution;
      if (chosenAspectRatio) requestBody.aspect_ratio = chosenAspectRatio;
      if (selectedSupports('n')) requestBody.n = 1;
      if (hasReferenceImage) {
        if (!selectedModel.architecture?.input_modalities?.includes('image')) throw appError('REFERENCE_IMAGE_UNSUPPORTED');
        requestBody.input_references = [{ type: 'image_url', image_url: { url: referenceImage } }];
      }
      return { requestBody, chosenResolution, chosenAspectRatio };
    };

    let { requestBody: body, chosenResolution: selectedResolution, chosenAspectRatio: selectedAspectRatio } = buildImageRequest(model);
    let estimatedCharge = estimateImageCharge(model, selectedResolution, hasReferenceImage);
    if (availableTokens < estimatedCharge.chargedTokens) {
      throw appError('INSUFFICIENT_TOKENS_FOR_REQUEST', {
        availableTokens,
        requiredTokens: estimatedCharge.chargedTokens,
        shortfall: estimatedCharge.chargedTokens - availableTokens
      });
    }

    await reserveAiTokens(supabase,user.id,requestId,'image',availableTokens);
    reservationActive=true;

    const parts=[{text:cleanPrompt}];
    if(hasReferenceImage){const match=referenceImage.match(/^data:([^;]+);base64,(.+)$/);if(match)parts.push({inlineData:{mimeType:match[1],data:match[2]}});}
    const response=await fetchWithTimeout(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model.id)}:generateContent?key=${encodeURIComponent(process.env.GEMINI_API_KEY)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{responseModalities:['TEXT','IMAGE'],imageConfig:{aspectRatio:selectedAspectRatio||'1:1',imageSize:selectedResolution||'1K'}}})},120000);
    const payload=await response.json().catch(()=>({}));
    if(!response.ok)throw appError('PROVIDER_ERROR',{status:response.status,provider:'gemini',details:payload?.error?.message||''});
    const imagePart=(payload.candidates?.[0]?.content?.parts||[]).find(part=>part.inlineData?.data);
    if(!imagePart)throw appError('EMPTY_RESPONSE');
    const mediaType=imagePart.inlineData.mimeType||'image/png';
    const thumbnailData=`data:${mediaType};base64,${imagePart.inlineData.data}`; const sourceUrl=null;
    const imageUsage={prompt_tokens:Number(payload.usageMetadata?.promptTokenCount||0),completion_tokens:Number(payload.usageMetadata?.candidatesTokenCount||0),cost:estimatedCharge.providerUsd};
    const charge=chargeTokens({},imageUsage,false);
    if(charge.chargedTokens>availableTokens)throw appError('INSUFFICIENT_TOKENS_FOR_REQUEST',{availableTokens,requiredTokens:charge.chargedTokens,shortfall:charge.chargedTokens-availableTokens});
    const item={width:null,height:null};

    let savedUser = null;
    let savedAssistant = null;
    let savedImage = null;
    try {
      const userInsert = await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'user',
        content: cleanPrompt,
        token_usage: { image_request: true, reference_image: hasReferenceImage }
      }).select('id').single();
      if (userInsert.error || !userInsert.data) throw appError('DATABASE_ERROR', {}, userInsert.error);
      savedUser = userInsert.data;

      const assistantInsert = await supabase.from('messages').insert({
        conversation_id: conversationId,
        user_id: user.id,
        role: 'assistant',
        content: localize(uiLocale, 'تم إنشاء الصورة المطلوبة.', 'The requested image has been generated.'),
        model_id: model.id,
        token_usage: { ...payload.usage, ...charge, type: 'image' }
      }).select('id').single();
      if (assistantInsert.error || !assistantInsert.data) throw appError('DATABASE_ERROR', {}, assistantInsert.error);
      savedAssistant = assistantInsert.data;

      const imageInsert = await supabase.from('generated_images').insert({
        message_id: savedAssistant.id,
        conversation_id: conversationId,
        user_id: user.id,
        model_id: model.id,
        prompt: cleanPrompt,
        media_type: mediaType,
        thumbnail_data: thumbnailData,
        source_url: sourceUrl,
        storage_status: 'pending',
        width: Number(item.width) || null,
        height: Number(item.height) || null,
        token_usage: {
          ...payload.usage,
          ...charge,
          aspectRatio: selectedAspectRatio || null,
          resolution: selectedResolution || null
        }
      }).select('*').single();
      if (imageInsert.error || !imageInsert.data) throw appError('DATABASE_ERROR', {}, imageInsert.error);
      savedImage = imageInsert.data;
    } catch (saveError) {
      if (savedImage?.id) await supabase.from('generated_images').delete().eq('id', savedImage.id).eq('user_id', user.id);
      if (savedAssistant?.id) await supabase.from('messages').delete().eq('id', savedAssistant.id).eq('user_id', user.id);
      if (savedUser?.id) await supabase.from('messages').delete().eq('id', savedUser.id).eq('user_id', user.id);
      throw saveError;
    }

    const remainingTokens=await finalizeAiTokens(supabase,user.id,requestId,charge.chargedTokens,{imageId:savedImage.id,modelId:model.id});
    reservationActive=false;
    const conversationUpdate = await supabase.from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)
      .eq('user_id', user.id);
    if (conversationUpdate.error) console.warn('Conversation timestamp update failed:', conversationUpdate.error.message);

    return json(res, 200, {
      image: savedImage,
      chargedTokens: charge.chargedTokens,
      providerUsd: charge.providerUsd,
      selectedModelName: model.name || model.id,
      remainingTokens,
      lowBalance: isLowBalance(remainingTokens, charge.chargedTokens)
    });
  } catch (error) {
    if(reservationActive&&reservationSupabase&&reservationUserId&&reservationRequestId){await releaseAiTokens(reservationSupabase,reservationUserId,reservationRequestId,{code:String(error?.code||'SERVER_ERROR')});reservationActive=false;}
    const action = String(req.body?.action || req.query?.action || '');
    if (action === 'download' && error?.message === 'IMAGE_NOT_FOUND') {
      const details = errorDetails(error, uiLocale);
      res.status(404).setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end(details?.message || localize(uiLocale, 'الصورة غير موجودة.', 'Image not found.'));
    }
    return handleError(
      error,
      res,
      action === 'download'
        ? localize(uiLocale, 'تعذر تنزيل الصورة. حاول مرة أخرى.', 'Could not download the image. Try again.')
        : localize(uiLocale, 'حدث عطل مؤقت أثناء إنشاء الصورة. حاول مرة أخرى؛ لم يتم خصم رصيدك.', 'A temporary error occurred while generating the image. Try again; your balance was not charged.'),
      uiLocale
    );
  }
}
