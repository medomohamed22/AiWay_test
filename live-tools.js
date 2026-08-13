(()=>{
let liveToolId='',liveSocket=null,liveStream=null,liveInputContext=null,liveOutputContext=null,liveProcessor=null,liveSource=null,liveNextPlayTime=0,liveStarting=false,liveVoice='Kore',liveSessionId='',liveConfirmed=false,liveStartedAt=0,liveChargedTokens=0,liveTimer=null,liveUsageSequence=0,liveUsageQueue=Promise.resolve(),liveModelId='',livePreserveCloseStatus=false;
const LIVE_VOICES=[['Zephyr','مشرق','Bright'],['Puck','مرح','Upbeat'],['Charon','معلوماتي','Informative'],['Kore','حازم','Firm'],['Fenrir','متحمس','Excitable'],['Leda','شبابي','Youthful'],['Orus','حازم','Firm'],['Aoede','منعش','Breezy'],['Callirrhoe','هادئ','Easy-going'],['Autonoe','مشرق','Bright'],['Enceladus','هامس','Breathy'],['Iapetus','واضح','Clear'],['Umbriel','هادئ','Easy-going'],['Algieba','ناعم','Smooth'],['Despina','ناعم','Smooth'],['Erinome','واضح','Clear'],['Algenib','أجش','Gravelly'],['Rasalgethi','معلوماتي','Informative'],['Laomedeia','مرح','Upbeat'],['Achernar','رقيق','Soft'],['Alnilam','حازم','Firm'],['Schedar','متوازن','Even'],['Gacrux','ناضج','Mature'],['Pulcherrima','مباشر','Forward'],['Achird','ودود','Friendly'],['Zubenelgenubi','عفوي','Casual'],['Vindemiatrix','لطيف','Gentle'],['Sadachbia','حيوي','Lively'],['Sadaltager','خبير','Knowledgeable'],['Sulafat','دافئ','Warm']];
const LIVE_TRANSLATE_LANGUAGES=[
['af','الأفريقانية','Afrikaans'],['ak','الأكانية','Akan'],['sq','الألبانية','Albanian'],['am','الأمهرية','Amharic'],['ar','العربية','Arabic'],['hy','الأرمينية','Armenian'],['az','الأذربيجانية','Azerbaijani'],['eu','الباسكية','Basque'],['be','البيلاروسية','Belarusian'],['bn','البنغالية','Bengali'],['bg','البلغارية','Bulgarian'],['my','البورمية','Burmese'],['ca','الكتالانية','Catalan'],['zh-Hans','الصينية المبسطة','Chinese (Simplified)'],['zh-Hant','الصينية التقليدية','Chinese (Traditional)'],['hr','الكرواتية','Croatian'],['cs','التشيكية','Czech'],['da','الدنماركية','Danish'],['nl','الهولندية','Dutch'],['en','الإنجليزية','English'],['et','الإستونية','Estonian'],['fil','الفلبينية','Filipino'],['fi','الفنلندية','Finnish'],['fr','الفرنسية','French'],['gl','الجاليكية','Galician'],['ka','الجورجية','Georgian'],['de','الألمانية','German'],['el','اليونانية','Greek'],['gu','الغوجاراتية','Gujarati'],['ha','الهوسا','Hausa'],['he','العبرية','Hebrew'],['hi','الهندية','Hindi'],['hu','المجرية','Hungarian'],['is','الآيسلندية','Icelandic'],['id','الإندونيسية','Indonesian'],['it','الإيطالية','Italian'],['ja','اليابانية','Japanese'],['jv','الجاوية','Javanese'],['kn','الكانادا','Kannada'],['kk','الكازاخية','Kazakh'],['km','الخميرية','Khmer'],['rw','الكينيارواندا','Kinyarwanda'],['ko','الكورية','Korean'],['lo','اللاوية','Lao'],['lv','اللاتفية','Latvian'],['lt','الليتوانية','Lithuanian'],['mk','المقدونية','Macedonian'],['ms','الماليزية','Malay'],['ml','المالايالامية','Malayalam'],['mr','الماراثية','Marathi'],['mn','المنغولية','Mongolian'],['ne','النيبالية','Nepali'],['no','النرويجية','Norwegian'],['nb','النرويجية بوكمال','Norwegian Bokmål'],['fa','الفارسية','Persian'],['pl','البولندية','Polish'],['pt-BR','البرتغالية البرازيلية','Portuguese (Brazil)'],['pt-PT','البرتغالية البرتغالية','Portuguese (Portugal)'],['pa','البنجابية','Punjabi'],['ro','الرومانية','Romanian'],['ru','الروسية','Russian'],['sr','الصربية','Serbian'],['sd','السندية','Sindhi'],['si','السنهالية','Sinhala'],['sk','السلوفاكية','Slovak'],['sl','السلوفينية','Slovenian'],['es','الإسبانية','Spanish'],['su','السوندانية','Sundanese'],['sw','السواحيلية','Swahili'],['sv','السويدية','Swedish'],['ta','التاميلية','Tamil'],['te','التيلوغوية','Telugu'],['th','التايلاندية','Thai'],['tr','التركية','Turkish'],['uk','الأوكرانية','Ukrainian'],['ur','الأردية','Urdu'],['uz','الأوزبكية','Uzbek'],['vi','الفيتنامية','Vietnamese'],['zu','الزولو','Zulu']];
let liveTargetLanguage='ar';
const voiceIcon=()=>LIVE_TOOL_ICONS.voice,translateIcon=()=>LIVE_TOOL_ICONS.translate;
function liveText(){return lang==='ar'?{start:'ابدأ المحادثة',stop:'إنهاء',ready:'جاهز للمحادثة',readyTranslate:'اختر اللغة ثم ابدأ الترجمة',connect:'جارٍ الاتصال بـ Gemini Live…',listen:'أنا أستمع الآن…',ended:'تم إنهاء الجلسة',login:'سجّل الدخول بحساب Pi أولًا لاستخدام الأدوات الصوتية.',mic:'اسمح بالوصول إلى الميكروفون للبدء.',model:'النموذج',target:'لغة الإخراج',voice:'الصوت',chooseVoice:'اختر الصوت',empty:'سيظهر نص المحادثة أو الترجمة هنا أثناء الجلسة.',error:'تعذر بدء الجلسة الصوتية.',duration:'مدة الجلسة',charged:'التوكينات المخصومة',balanceEnded:'تم إنهاء الجلسة لأن الرصيد لا يكفي لاستهلاك Gemini الفعلي التالي.'}:{start:'Start conversation',stop:'End',ready:'Ready for a live conversation',readyTranslate:'Choose a language, then start translating',connect:'Connecting to Gemini Live…',listen:'Listening now…',ended:'Session ended',login:'Sign in with Pi first to use live audio tools.',mic:'Allow microphone access to begin.',model:'Model',target:'Output language',voice:'Voice',chooseVoice:'Choose voice',empty:'Live transcript or translation will appear here during the session.',error:'Could not start the live session.',duration:'Session duration',charged:'Tokens deducted',balanceEnded:'The session ended because the balance is insufficient for the next actual Gemini usage charge.'}}
function renderVoiceMenu(){const menu=$('liveVoiceMenu');if(!menu)return;menu.innerHTML=LIVE_VOICES.map(([name,ar,en])=>`<button type="button" class="live-voice-option ${name===liveVoice?'selected':''}" data-live-voice="${name}" role="option" aria-selected="${name===liveVoice}"><b>${name}</b><small>${lang==='ar'?ar:en}</small></button>`).join('');menu.querySelectorAll('[data-live-voice]').forEach(btn=>btn.onclick=()=>{liveVoice=btn.dataset.liveVoice;storageSet('aiway_live_voice',liveVoice);$('liveVoiceValue').textContent=liveVoice;menu.classList.remove('open');$('liveVoiceTrigger').setAttribute('aria-expanded','false');renderVoiceMenu()})}
function closeVoiceMenu(){$('liveVoiceMenu')?.classList.remove('open');$('liveVoiceTrigger')?.setAttribute('aria-expanded','false')}
function languageLabel(code){const item=LIVE_TRANSLATE_LANGUAGES.find(x=>x[0]===code)||LIVE_TRANSLATE_LANGUAGES.find(x=>x[0]==='ar');return lang==='ar'?item[1]:item[2]}
function renderLanguageMenu(){const select=$('liveTargetLanguage'),menu=$('liveLanguageMenu');if(!select||!menu)return;select.innerHTML=LIVE_TRANSLATE_LANGUAGES.map(([code,ar,en])=>`<option value="${code}" ${code===liveTargetLanguage?'selected':''}>${lang==='ar'?ar:en}</option>`).join('');menu.innerHTML=LIVE_TRANSLATE_LANGUAGES.map(([code,ar,en])=>`<button type="button" class="live-lang-option ${code===liveTargetLanguage?'selected':''}" data-live-lang="${code}" role="option" aria-selected="${code===liveTargetLanguage}"><b>${lang==='ar'?ar:en}</b><small>${code}</small></button>`).join('');$('liveLanguageValue').textContent=languageLabel(liveTargetLanguage);menu.querySelectorAll('[data-live-lang]').forEach(btn=>btn.onclick=()=>{liveTargetLanguage=btn.dataset.liveLang;select.value=liveTargetLanguage;storageSet('aiway_live_target_language',liveTargetLanguage);$('liveLanguageValue').textContent=languageLabel(liveTargetLanguage);closeLanguageMenu();renderLanguageMenu()})}
function closeLanguageMenu(){$('liveLanguageMenu')?.classList.remove('open');$('liveLanguageTrigger')?.setAttribute('aria-expanded','false')}
window.openLiveTool=function(id){liveToolId=id;const task=TASKS[id];if(!task)return;const isTranslate=task.tool_type==='live_translate',t=taskText(id),x=liveText();$('liveToolIcon').innerHTML=isTranslate?translateIcon():voiceIcon();$('liveOrbIcon').innerHTML=isTranslate?translateIcon():voiceIcon();$('liveToolTitle').textContent=t[0];$('liveToolDescription').textContent=t[1];$('liveLanguageRow').classList.toggle('show',isTranslate);$('liveVoiceRow').classList.toggle('show',!isTranslate);$('liveTargetLabel').textContent=x.target;$('liveVoiceLabel').textContent=x.voice;liveVoice=storageGet('aiway_live_voice')||'Kore';if(!LIVE_VOICES.some(v=>v[0]===liveVoice))liveVoice='Kore';liveTargetLanguage=storageGet('aiway_live_target_language')||'ar';if(!LIVE_TRANSLATE_LANGUAGES.some(v=>v[0]===liveTargetLanguage))liveTargetLanguage='ar';$('liveVoiceValue').textContent=liveVoice;renderVoiceMenu();renderLanguageMenu();closeVoiceMenu();closeLanguageMenu();$('liveStartBtn').textContent=x.start;$('liveStopBtn').textContent=x.stop;$('liveStatus').textContent=isTranslate?x.readyTranslate:x.ready;$('liveStatusSub').textContent=x.mic;$('liveTranscript').textContent=x.empty;$('liveModelLabel').textContent=x.model;$('liveModelId').textContent=task.model_id||'';$('liveDurationLabel').textContent=x.duration;$('liveChargedLabel').textContent=x.charged;resetLiveUsage();$('liveToolModal').classList.add('open');$('liveToolModal').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';try{$('prompt')?.blur()}catch{}};
function closeLiveTool(){stopLiveSession();$('liveToolModal').classList.remove('open');$('liveToolModal').setAttribute('aria-hidden','true');document.body.style.overflow=''}
function b64FromBytes(bytes){let binary='',chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
function bytesFromB64(value){const binary=atob(value),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes}
function downsampleTo16k(input,rate){if(rate===16000)return input;const ratio=rate/16000,length=Math.round(input.length/ratio),out=new Float32Array(length);for(let i=0;i<length;i++){const start=Math.round(i*ratio),end=Math.min(input.length,Math.round((i+1)*ratio));let sum=0;for(let j=start;j<end;j++)sum+=input[j];out[i]=sum/Math.max(1,end-start)}return out}
function floatToPcm16(float32){const out=new Int16Array(float32.length);for(let i=0;i<float32.length;i++){const v=Math.max(-1,Math.min(1,float32[i]));out[i]=v<0?v*32768:v*32767}return new Uint8Array(out.buffer)}
function playPcm24(base64){const bytes=bytesFromB64(base64),view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),samples=new Float32Array(Math.floor(bytes.byteLength/2));for(let i=0;i<samples.length;i++)samples[i]=view.getInt16(i*2,true)/32768;if(!liveOutputContext)liveOutputContext=new (window.AudioContext||window.webkitAudioContext)({sampleRate:24000});if(liveOutputContext.state==='suspended')liveOutputContext.resume().catch(()=>{});const buffer=liveOutputContext.createBuffer(1,samples.length,24000);buffer.copyToChannel(samples,0);const src=liveOutputContext.createBufferSource();src.buffer=buffer;src.connect(liveOutputContext.destination);liveNextPlayTime=Math.max(liveOutputContext.currentTime+.02,liveNextPlayTime);src.start(liveNextPlayTime);liveNextPlayTime+=buffer.duration}
function appendTranscript(text){if(!text)return;const box=$('liveTranscript');if(box.textContent===liveText().empty)box.textContent='';box.textContent+=(box.textContent?' ':'')+text;box.scrollTop=box.scrollHeight}
function formatLiveDuration(ms){const total=Math.max(0,Math.floor(ms/1000)),m=Math.floor(total/60),sec=total%60;return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`}
function renderLiveUsage(){if($('liveDuration'))$('liveDuration').textContent=formatLiveDuration(liveStartedAt?Date.now()-liveStartedAt:0);if($('liveCharged'))$('liveCharged').textContent=String(liveChargedTokens);$('liveUsageMeter')?.classList.toggle('show',Boolean(liveConfirmed||liveStarting||liveSessionId))}
function resetLiveUsage(){clearInterval(liveTimer);liveTimer=null;liveSessionId='';liveConfirmed=false;liveStartedAt=0;liveChargedTokens=0;liveUsageSequence=0;liveUsageQueue=Promise.resolve();liveModelId='';if($('liveDuration'))$('liveDuration').textContent='00:00';if($('liveCharged'))$('liveCharged').textContent='0';$('liveUsageMeter')?.classList.remove('show')}
async function releaseLiveReservation(reason='setup_failed'){if(!liveSessionId)return;try{await api('/api/apps?mode=live-token',{method:'POST',body:JSON.stringify({action:liveConfirmed?'finish':'release',sessionId:liveSessionId,reason})})}catch(err){console.warn('[LIVE_RELEASE]',err)}}
function submitLiveUsage(usageMetadata){
  if(!liveConfirmed||!liveSessionId||!liveModelId||!usageMetadata)return;
  const sequence=++liveUsageSequence;
  liveUsageQueue=liveUsageQueue.then(async()=>{
    const result=await api('/api/apps?mode=live-token',{method:'POST',body:JSON.stringify({action:'usage',sessionId:liveSessionId,modelId:liveModelId,sequence,usageMetadata})});
    liveChargedTokens+=Math.max(0,Number(result.chargedTokens||0));
    renderLiveUsage();
    refreshMe().catch(()=>{});
  }).catch(err=>{
    const detail=friendlyClientError(err,liveText().balanceEnded);
    $('liveStatus').textContent=err?.code==='INSUFFICIENT_TOKENS_FOR_REQUEST'?liveText().balanceEnded:detail.message;
    $('liveStatus').classList.add('live-error');
    stopLiveSession(true);
  });
}
function startLiveBillingClock(){clearInterval(liveTimer);renderLiveUsage();liveTimer=setInterval(renderLiveUsage,1000)}
async function startLiveSession(){
  if(liveStarting||liveSocket)return;
  if(!auth){toast(liveText().login);return}
  liveStarting=true;
  resetLiveUsage();
  liveSessionId=`live_${newRequestId()}`;
  renderLiveUsage();
  $('liveStartBtn').disabled=true;
  $('liveOrb').classList.add('connecting');
  $('liveStatus').classList.remove('live-error');
  $('liveStatus').textContent=liveText().connect;
  try{
    // Ask for microphone permission from the original user gesture before any
    // long network operation. This is more reliable in mobile/Pi browsers.
    liveStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true,channelCount:1},video:false});
    const info=await api('/api/apps?mode=live-token',{method:'POST',body:JSON.stringify({action:'start',sessionId:liveSessionId,toolId:liveToolId,targetLanguage:liveTargetLanguage,voiceName:liveToolId==='voice-chat'?liveVoice:undefined})});liveSessionId=info.sessionId||liveSessionId;liveModelId=info.model||'';
    const endpoint=`wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(info.token)}`;
    liveSocket=new WebSocket(endpoint);
    let setupReady=false;
    const beginAudioInput=async()=>{
      if(setupReady||!liveSocket||liveSocket.readyState!==WebSocket.OPEN)return;
      setupReady=true;
      liveInputContext=new (window.AudioContext||window.webkitAudioContext)();
      if(liveInputContext.state==='suspended')await liveInputContext.resume();
      liveSource=liveInputContext.createMediaStreamSource(liveStream);
      liveProcessor=liveInputContext.createScriptProcessor(4096,1,1);
      liveProcessor.onaudioprocess=e=>{
        if(!liveSocket||liveSocket.readyState!==WebSocket.OPEN)return;
        const mono=e.inputBuffer.getChannelData(0);
        const pcm=floatToPcm16(downsampleTo16k(mono,liveInputContext.sampleRate));
        liveSocket.send(JSON.stringify({realtimeInput:{audio:{mimeType:'audio/pcm;rate=16000',data:b64FromBytes(pcm)}}}));
      };
      liveSource.connect(liveProcessor);
      // ScriptProcessor needs an output connection to keep firing. A zero-gain
      // node prevents microphone monitoring/echo through the speakers.
      const silentGain=liveInputContext.createGain();
      silentGain.gain.value=0;
      liveProcessor.connect(silentGain);
      silentGain.connect(liveInputContext.destination);
      $('liveOrb').classList.remove('connecting');
      $('liveOrb').classList.add('active');
      $('liveStatus').textContent=liveText().listen;
      $('liveStatusSub').textContent='';
      $('liveStopBtn').disabled=false;
      $('liveVoiceTrigger').disabled=true;$('liveLanguageTrigger').disabled=true;
      closeVoiceMenu();closeLanguageMenu();
    };
    liveSocket.onopen=()=>{
      // Prefer a server-constrained token. If Gemini rejected constraints for
      // this project, the API returns the exact server-built setup object.
      const setup=info.setupLocked?{model:`models/${info.model}`}:(info.setup||{model:`models/${info.model}`});
      liveSocket.send(JSON.stringify({setup}));
    };
    liveSocket.onmessage=async e=>{
      try{
        const raw=typeof e.data==='string'?e.data:await e.data.text();
        const msg=JSON.parse(raw);
        if(msg.setupComplete){const billing=await api('/api/apps?mode=live-token',{method:'POST',body:JSON.stringify({action:'confirm',sessionId:liveSessionId})});liveConfirmed=true;liveStartedAt=Date.parse(billing.startedAt||'')||Date.now();liveChargedTokens=0;startLiveBillingClock();await beginAudioInput();return}
        if(msg.error)throw new Error(msg.error.message||'Gemini Live error');
        if(msg.usageMetadata)submitLiveUsage(msg.usageMetadata);
        const content=msg.serverContent||{};
        const parts=content.modelTurn?.parts||[];
        for(const part of parts){
          if(part.inlineData?.data&&String(part.inlineData.mimeType||'').includes('audio'))playPcm24(part.inlineData.data);
          if(part.text)appendTranscript(part.text);
        }
        appendTranscript(content.inputTranscription?.text||'');
        appendTranscript(content.outputTranscription?.text||'');
      }catch(err){console.warn('[GEMINI_LIVE_MESSAGE]',err)}
    };
    liveSocket.onerror=()=>{
      $('liveStatus').textContent=liveText().error;
      $('liveStatus').classList.add('live-error');
    };
    liveSocket.onclose=e=>{
      releaseLiveReservation(liveConfirmed?'socket_closed':'socket_closed_before_setup');
      clearInterval(liveTimer);liveTimer=null;
      cleanupLiveAudio();
      const reason=String(e.reason||'').trim();
      if(!livePreserveCloseStatus){$('liveStatus').textContent=e.code===1000?liveText().ended:(reason||`${liveText().error} (${e.code})`);if(e.code!==1000)$('liveStatus').classList.add('live-error')}
      livePreserveCloseStatus=false;
      $('liveOrb').classList.remove('active','connecting');
      $('liveStartBtn').disabled=false;
      $('liveStopBtn').disabled=true;
      $('liveVoiceTrigger').disabled=false;$('liveLanguageTrigger').disabled=false;
      liveSocket=null;
    };
  }catch(err){
    console.error('[GEMINI_LIVE_START]',err);
    await releaseLiveReservation('start_failed');
    clearInterval(liveTimer);liveTimer=null;
    cleanupLiveAudio();
    try{liveSocket?.close()}catch{}
    liveSocket=null;
    const message=err?.name==='NotAllowedError'?liveText().mic:friendlyClientError(err,liveText().error).message;
    $('liveStatus').textContent=message;
    $('liveStatus').classList.add('live-error');
    $('liveStartBtn').disabled=false;
    $('liveOrb').classList.remove('active','connecting');
    $('liveVoiceTrigger').disabled=false;$('liveLanguageTrigger').disabled=false;
  }finally{liveStarting=false}
}
function cleanupLiveAudio(){try{liveProcessor?.disconnect();liveSource?.disconnect();liveStream?.getTracks().forEach(t=>t.stop());liveInputContext?.close()}catch{}try{liveOutputContext?.close()}catch{}liveProcessor=liveSource=liveStream=liveInputContext=liveOutputContext=null;liveNextPlayTime=0}
function stopLiveSession(preserveStatus=false){livePreserveCloseStatus=Boolean(preserveStatus);clearInterval(liveTimer);liveTimer=null;releaseLiveReservation(liveConfirmed?'client_finish':'client_stop_before_setup');try{if(liveSocket?.readyState===WebSocket.OPEN)liveSocket.send(JSON.stringify({realtimeInput:{audioStreamEnd:true}}))}catch{}cleanupLiveAudio();try{liveSocket?.close(1000,'client stop')}catch{}liveSocket=null;$('liveOrb')?.classList.remove('active','connecting');if(!preserveStatus&&$('liveStatus'))$('liveStatus').textContent=liveText().ended;if($('liveStartBtn'))$('liveStartBtn').disabled=false;if($('liveStopBtn'))$('liveStopBtn').disabled=true;if($('liveVoiceTrigger'))$('liveVoiceTrigger').disabled=false;closeVoiceMenu();renderLiveUsage()}
$('liveToolClose').onclick=()=>{closeLiveTool();openTaskScreen()};$('liveVoiceTrigger').onclick=e=>{e.stopPropagation();if($('liveVoiceTrigger').disabled)return;const menu=$('liveVoiceMenu'),open=!menu.classList.contains('open');closeVoiceMenu();if(open){menu.classList.add('open');$('liveVoiceTrigger').setAttribute('aria-expanded','true')}};$('liveLanguageTrigger').onclick=e=>{e.stopPropagation();if($('liveLanguageTrigger').disabled)return;const menu=$('liveLanguageMenu'),open=!menu.classList.contains('open');closeLanguageMenu();if(open){menu.classList.add('open');$('liveLanguageTrigger').setAttribute('aria-expanded','true')}};document.addEventListener('click',e=>{if(!e.target.closest('#liveVoiceRow'))closeVoiceMenu();if(!e.target.closest('#liveLanguageRow'))closeLanguageMenu()});$('liveStartBtn').onclick=startLiveSession;$('liveStopBtn').onclick=stopLiveSession;$('liveOrb').onclick=()=>liveSocket?stopLiveSession():startLiveSession();$('liveToolModal').addEventListener('click',e=>{if(e.target.id==='liveToolModal')closeLiveTool()});
})();
