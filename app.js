const ICONS={
 pi:'<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="28" fill="white" opacity=".16"/><path d="M19 22h29M26 22v26M42 22c0 8-3 13-10 13h-6M38 35l7 13" stroke="white" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="14" r="3" fill="#f4b942"/><circle cx="44" cy="14" r="3" fill="#f4b942"/></svg>',
 plus:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',history:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.6M4 4v4.6h4.6M12 8v4l2.8 1.8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',login:'<svg viewBox="0 0 24 24" fill="none"><path d="M14 8l4 4-4 4M18 12H8M11 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',wallet:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11H6a2 2 0 0 1-2-2V7.5Zm0 1h14M16 12h4v4h-4a2 2 0 1 1 0-4Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',menu:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',sparkles:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 3l1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3ZM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14ZM5 13l.8 2.2L8 16l-2.2.8L5 19l-.8-2.2L2 16l2.2-.8L5 13Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',coin:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M8 9h8M10 9v7M15 9c0 3-1.5 4-5 4M14 13l2 3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',download:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',globe:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/><path d="M3 12h18M12 3c3 3.4 3 14.6 0 18M12 3c-3 3.4-3 14.6 0 18" stroke="currentColor" stroke-width="1.5"/></svg>',send:'<svg viewBox="0 0 24 24" fill="none"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',stop:'<svg viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor"/></svg>',close:'<svg viewBox="0 0 24 24" fill="none"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',chat:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 15a3 3 0 0 1-3 3H9l-5 3v-6a3 3 0 0 1-1-2V7a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3v8Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>',user:'<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',bot:'<svg viewBox="0 0 24 24" fill="none"><rect x="4" y="7" width="16" height="13" rx="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 3v4M8 12h.01M16 12h.01M9 16h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',copy:'<svg viewBox="0 0 24 24" fill="none"><rect x="8" y="8" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" stroke="currentColor" stroke-width="1.7"/></svg>',camera:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 7h3l1.3-2h7.4L17 7h3v12H4V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="12" cy="13" r="3.5" stroke="currentColor" stroke-width="1.8"/></svg>',mic:'<svg viewBox="0 0 24 24" fill="none"><rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" stroke-width="1.8"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',redo:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',search:'<svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4 4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',continue:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h12m-4-4 4 4-4 4" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 5v14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>'};
const MODEL_ICONS={chat:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 14.5a3.5 3.5 0 0 1-3.5 3.5H9l-5 3v-6.5A3.5 3.5 0 0 1 3 12V7.5A3.5 3.5 0 0 1 6.5 4h10A3.5 3.5 0 0 1 20 7.5v7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M8 9h8M8 13h5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',image:'<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="16" rx="3" stroke="currentColor" stroke-width="1.8"/><circle cx="8.5" cy="9" r="1.5" stroke="currentColor" stroke-width="1.6"/><path d="m5 17 4.2-4.2 3.1 3.1 2.2-2.2L19 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
function safeToolSvg(value){const raw=String(value||'').trim();if(!raw||raw.length>24000||!/^<svg\b[\s\S]*<\/svg>$/i.test(raw))return '';if(/<\s*(script|style|foreignObject|iframe|object|embed|audio|video|canvas|link|meta|base)\b/i.test(raw)||/\son[a-z]+\s*=/i.test(raw)||/javascript\s*:/i.test(raw)||/data\s*:\s*text\/html/i.test(raw))return '';const doc=new DOMParser().parseFromString(raw,'image/svg+xml');if(doc.querySelector('parsererror'))return '';for(const el of [...doc.querySelectorAll('*')]){for(const attr of [...el.attributes]){const n=attr.name.toLowerCase(),v=attr.value.trim();if(n.startsWith('on')||n==='style'||((n==='href'||n==='xlink:href')&&!v.startsWith('#')))el.removeAttribute(attr.name)}}return new XMLSerializer().serializeToString(doc.documentElement)}
const $=id=>document.getElementById(id);document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=ICONS[el.dataset.icon]||'');
function storageGet(key,fallback=null){try{const value=localStorage.getItem(key);return value===null?fallback:value}catch{return fallback}}function storageSet(key,value){try{localStorage.setItem(key,value)}catch{}}function storageRemove(key){try{localStorage.removeItem(key)}catch{}}function storedJson(key){try{return JSON.parse(storageGet(key,'null'))}catch{return null}}function authStoredJson(){try{const current=sessionStorage.getItem('pi_ai_auth');if(current)return JSON.parse(current);const legacy=localStorage.getItem('pi_ai_auth');if(!legacy)return null;const parsed=JSON.parse(legacy);sessionStorage.setItem('pi_ai_auth',legacy);localStorage.removeItem('pi_ai_auth');return parsed}catch{try{localStorage.removeItem('pi_ai_auth')}catch{}return null}}function storeAuthSession(value){try{if(value)sessionStorage.setItem('pi_ai_auth',JSON.stringify(value));else sessionStorage.removeItem('pi_ai_auth')}catch{}try{localStorage.removeItem('pi_ai_auth')}catch{}}let lang=storageGet('aiway_lang',sessionStorage.getItem('aiway_intro_lang')||'en');if(!['ar','en'].includes(lang))lang='en';let auth=authStoredJson(),current=null,history=[],streaming=false,webSearch=false,controller=null,piReady=false,userProfile=null;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._x);t._x=setTimeout(()=>t.classList.remove('show'),4200)}
let aiwayDialogResolver=null;
function closeAiwayDialog(result=false){
  const overlay=$('aiwayDialogOverlay');
  if(!overlay)return;
  const resolve=aiwayDialogResolver;
  aiwayDialogResolver=null;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  document.body.classList.remove('dialog-open');
  if(resolve)setTimeout(()=>resolve(Boolean(result)),0);
}
function dialogIconMarkup(type){
  if(type==='danger')return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return ICONS.sparkles||'';
}
function showAiwayDialog(options={}){
  const overlay=$('aiwayDialogOverlay'),dialog=$('aiwayDialog');
  if(!overlay||!dialog)return Promise.resolve(false);
  if(aiwayDialogResolver)closeAiwayDialog(false);
  const isAr=lang==='ar',type=options.type||'info';
  const brand=$('aiwayDialogBrandText'),title=$('aiwayDialogTitle'),message=$('aiwayDialogMessage');
  const note=$('aiwayDialogNote'),cancel=$('aiwayDialogCancel'),confirmBtn=$('aiwayDialogConfirm'),iconBox=$('aiwayDialogIcon');
  if(!brand||!title||!message||!note||!cancel||!confirmBtn||!iconBox)return Promise.resolve(false);
  dialog.classList.toggle('danger',type==='danger');
  dialog.classList.toggle('loading',Boolean(options.loading));
  brand.textContent=isAr?'مساعدك الذكي':'Your smart AI assistant';
  title.textContent=options.title||(isAr?'تأكيد الإجراء':'Confirm action');
  message.textContent=options.message||'';
  note.textContent=options.note||'';
  note.classList.toggle('show',Boolean(options.note));
  cancel.textContent=options.cancelText||(isAr?'إلغاء':'Cancel');
  confirmBtn.textContent=options.confirmText||(isAr?'موافق':'Confirm');
  confirmBtn.classList.toggle('danger',type==='danger');
  iconBox.classList.toggle('loading',Boolean(options.loading));iconBox.classList.remove('coin-icon','tool-icon');
  iconBox.innerHTML=options.loading?'':dialogIconMarkup(type);
  cancel.style.display=options.loading?'none':'';
  confirmBtn.style.display=options.loading?'none':'';
  overlay.setAttribute('aria-hidden','false');
  overlay.classList.add('open');
  document.body.classList.add('dialog-open');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{try{confirmBtn.focus({preventScroll:true})}catch{confirmBtn.focus()}}));
  return new Promise(resolve=>{aiwayDialogResolver=resolve});
}
function aiwayConfirm(message,options={}){return showAiwayDialog({...options,message})}
function showCostEstimateLoading(){
  return showAiwayDialog({loading:true,title:I18N[lang].costEstimateCalculating,message:I18N[lang].costEstimateCalculatingHint});
}
function activeToolDialogIcon(){
  const icon=TASK_ICONS?.[activeTask]||ICONS.image||ICONS.bot;
  return icon;
}
function updateCostEstimateDialog(message){
  const dialog=$('aiwayDialog'),iconBox=$('aiwayDialogIcon'),cancel=$('aiwayDialogCancel'),confirmBtn=$('aiwayDialogConfirm'),title=$('aiwayDialogTitle'),note=$('aiwayDialogNote'),messageBox=$('aiwayDialogMessage');
  if(!dialog||!iconBox||!cancel||!confirmBtn||!title||!note||!messageBox)return;
  dialog.classList.remove('loading');iconBox.classList.remove('loading','coin-icon');iconBox.classList.add('tool-icon');iconBox.innerHTML=activeToolDialogIcon();
  title.textContent=I18N[lang].costEstimateTitle;messageBox.textContent=message;
  note.textContent=I18N[lang].costEstimateNote;note.classList.add('show');
  cancel.textContent=I18N[lang].costEstimateCancel;confirmBtn.textContent=I18N[lang].costEstimateContinue;
  cancel.style.display='';confirmBtn.style.display='';
  requestAnimationFrame(()=>{try{confirmBtn.focus({preventScroll:true})}catch{confirmBtn.focus()}});
}

function statusMessage(status){const ar={400:'بيانات الطلب غير صحيحة.',401:'انتهت جلسة تسجيل الدخول. سجّل الدخول مرة أخرى.',402:'رصيدك غير كافٍ. اشحن رصيدًا إضافيًا.',403:'ليس لديك صلاحية لتنفيذ هذا الإجراء.',404:'العنصر المطلوب غير موجود.',408:'انتهت مهلة الطلب. حاول مرة أخرى.',413:'حجم الرسالة أو المرفق أكبر من المسموح.',429:'هناك ضغط مرتفع. انتظر قليلًا ثم حاول مرة أخرى.',500:'حدث عطل مؤقت في الخادم.',502:'حدث عطل مؤقت لدى مزود الخدمة.',503:'الخدمة غير متاحة مؤقتًا.',504:'استغرق الطلب وقتًا أطول من المسموح.'};const en={400:'The request data is invalid.',401:'Your session expired. Sign in again.',402:'Your balance is insufficient. Add more balance.',403:'You do not have permission to perform this action.',404:'The requested item was not found.',408:'The request timed out. Try again.',413:'The message or attachment is too large.',429:'The service is busy. Wait a moment and try again.',500:'A temporary server error occurred.',502:'The provider had a temporary failure.',503:'The service is temporarily unavailable.',504:'The request took too long.'};return (lang==='ar'?ar:en)[status]||(lang==='ar'?'حدث خطأ غير متوقع. حاول مرة أخرى.':'An unexpected error occurred. Try again.')}
function makeUiError(message,code='SERVER_ERROR',meta={}){const error=new Error(message);error.code=code;error.isLocalized=true;Object.assign(error,meta||{});return error}
function friendlyClientError(error,fallback){if(error?.isLocalized&&error?.message)return error;const raw=String(error?.message||error||'');if(error?.name==='AbortError')return error;if(/failed to fetch|networkerror|load failed|internet disconnected|econn|socket/i.test(raw))return makeUiError(lang==='ar'?'تعذر الاتصال بالخدمة. تحقق من الإنترنت ثم حاول مرة أخرى؛ لم يتم خصم رصيدك.':'Could not connect to the service. Check your internet connection and try again; your balance was not charged.','NETWORK_ERROR');if(/json|unexpected end|stream|decoder/i.test(raw))return makeUiError(lang==='ar'?'انقطع الاتصال أثناء استلام الرد. أعد المحاولة؛ لن يُخصم رصيد عن رد غير مكتمل.':'The connection was interrupted while receiving the response. Try again; an incomplete response will not be charged.','STREAM_INTERRUPTED');return makeUiError(fallback||statusMessage(500),'SERVER_ERROR')}
function showLowBalance(remaining){const value=Math.max(0,Number(remaining||0));$('creditsButton')?.classList.toggle('empty',value<=0);if(value<=0)$('creditsButton')?.animate?.([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:650});toast(lang==='ar'?`رصيدك أوشك على النفاد: متبقٍ ${value.toLocaleString('en-US')} توكن. اشحن رصيدًا لتجنب توقف الرسائل.`:`Your balance is running low: ${value.toLocaleString('en-US')} tokens remain. Add balance to avoid interruptions.`)}
function handleActionableError(error){if(['INSUFFICIENT_TOKENS','INSUFFICIENT_TOKENS_FOR_REQUEST','TRIAL_ENDED'].includes(error?.code)&&auth)setTimeout(()=>$('payModal')?.classList.add('open'),250)}
async function fetchWithClientTimeout(url,options={},timeoutMs=30000){
  const timeout=Math.max(1000,Number(timeoutMs)||30000),timeoutController=new AbortController(),callerSignal=options.signal;
  let timedOut=false,relayAbort=null;const timer=setTimeout(()=>{timedOut=true;timeoutController.abort()},timeout);
  let signal=timeoutController.signal;
  if(callerSignal){if(typeof AbortSignal.any==='function')signal=AbortSignal.any([callerSignal,timeoutController.signal]);else{relayAbort=()=>timeoutController.abort();if(callerSignal.aborted)relayAbort();else callerSignal.addEventListener('abort',relayAbort,{once:true})}}
  try{return await fetch(url,{...options,signal})}catch(error){if(timedOut)throw makeUiError(lang==='ar'?'انتهت مهلة الاتصال بالخدمة. حاول مرة أخرى.':'The service request timed out. Please try again.','REQUEST_TIMEOUT');throw error}finally{clearTimeout(timer);if(callerSignal&&relayAbort)callerSignal.removeEventListener('abort',relayAbort)}
}
async function readStreamWithIdleTimeout(reader,timeoutMs=60000){
  let timer;try{return await Promise.race([reader.read(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(makeUiError(lang==='ar'?'توقف الاتصال عن إرسال البيانات. حاول مرة أخرى.':'The connection stopped sending data. Please try again.','REQUEST_TIMEOUT')),Math.max(5000,Number(timeoutMs)||60000))})])}catch(error){if(error?.code==='REQUEST_TIMEOUT')try{await reader.cancel('idle-timeout')}catch{}throw error}finally{clearTimeout(timer)}
}
async function api(url,opt={}){const request={...opt};const timeoutMs=Number(request.timeoutMs||30000);delete request.timeoutMs;let requestUrl=url;const method=String(request.method||'GET').toUpperCase();if(method==='GET'){const join=requestUrl.includes('?')?'&':'?';requestUrl+=`${join}locale=${encodeURIComponent(lang)}`}else if(typeof request.body==='string'){try{const body=JSON.parse(request.body);if(body&&typeof body==='object'&&!Array.isArray(body)&&!body.locale)request.body=JSON.stringify({...body,locale:lang})}catch{}}request.headers={...(request.headers||{}),'Content-Type':'application/json','X-UI-Language':lang,...(auth?.token?{Authorization:`Bearer ${auth.token}`}:{})};let r;try{r=await fetchWithClientTimeout(requestUrl,request,timeoutMs)}catch(error){throw friendlyClientError(error,lang==='ar'?'تعذر الاتصال بالخدمة. حاول مرة أخرى.':'Could not connect to the service. Try again.')}const d=await r.json().catch(()=>({}));if(!r.ok){if(r.status===401&&auth)logout(false);throw makeUiError(d.error||statusMessage(r.status),d.code||`HTTP_${r.status}`,{status:r.status,availableTokens:d.availableTokens,requiredTokens:d.requiredTokens,shortfall:d.shortfall})}return d}
const PI_SIGNIN_CLIENT_ID='2T7p8-x_UQY_PRUKKZIlweepyn8wuS8jk6BG3lfRp4Y';
function piSigninRedirectUri(){return `${location.origin}/signin-callback.html`}
const I18N={en:{copy:'Copy',redo:'Regenerate',continueResponse:'Continue response',continueConfirm:'This sends a new request to continue the answer and may charge additional tokens based on actual usage. Continue?',thinking:'Thinking',analyzing:'Analyzing your question',searching:'Searching the web',writing:'Writing the answer',tokensUsed:'tokens charged',modelUsed:'Model',downloadFile:'Download file',previewFile:'Preview',downloadProject:'Download ZIP',modelsChat:'Chat',modelsImages:'Images',modelsExpensive:'Most expensive',modelsCheap:'Cheapest',modelsFree:'Free',costEstimateToggle:'Approximate cost before sending',costEstimateHint:'Show a quick estimate based on message length and enabled features',costEstimateTitle:'Approximate message cost',costEstimateContinue:'Continue',costEstimateCancel:'Cancel',costEstimateCalculating:'Calculating estimated cost',costEstimateCalculatingHint:'Please wait while the message, conversation context, attachments, and enabled features are analyzed…',costEstimateNote:'Only the estimated AiWay token deduction is shown. The final deduction is based on actual usage after the response.',fallbackUsed:'Fallback model used',tagline:'AI for everyone',newChat:'New chat',chats:'Chats',guest:'Guest',signPi:'Sign in with Pi',login:'Sign in',connected:'Connected',balance:'Balance',webSearch:'Web search',buyBalance:'Buy balance with Pi',choosePack:'Choose a package and pay with Pi. The balance is valid for 30 days.',allModels:'All models unlocked',trial:n=>`Free trial: ${n} messages left`,piBrowserRequired:'Payments are available through Pi Browser.',piSigninTitle:'Sign in with Pi',piSigninText:'Keep this browser page open. You will move to Pi Browser to approve your account; when you return here, AiWay will sign in automatically.',piSigninContinue:'Continue to Pi Sign-in',piSigninCancel:'Cancel',piSigninNote:'AiWay never asks for your Pi password. After approval, return manually to this browser tab; the session will be completed automatically.',imageExpiryNotice:'This image will be deleted from the site database after 3 days. Download it now to avoid losing it.',storageFallbackNotice:'Storage is temporarily full. This image is available in this session only—download it now before closing or refreshing the page.',imageGenerating:'Creating your image',imageGeneratingHint:'AI is turning your idea into pixels…',freeLimitTitle:'Your 30 free requests are used for today',freeLimitText:'Choose another available model to continue. Your free allowance resets automatically tomorrow.',freeLimitAction:'Choose another model'},ar:{copy:'نسخ',redo:'إعادة',continueResponse:'أكمل الرد',continueConfirm:'سيتم إرسال طلب جديد لاستكمال الإجابة وقد تُخصم توكنات إضافية حسب الاستخدام الفعلي. هل تريد المتابعة؟',thinking:'يفكر',analyzing:'يحلل السؤال',searching:'يبحث في الويب',writing:'يكتب الإجابة',tokensUsed:'توكن مخصوم',modelUsed:'النموذج',downloadFile:'تنزيل الملف',previewFile:'معاينة',downloadProject:'تنزيل ZIP',modelsChat:'الشات',modelsImages:'الصور',modelsExpensive:'الأغلى',modelsCheap:'الأرخص',modelsFree:'مجاني',costEstimateToggle:'حساب تقريبي لتكلفة كل رسالة',costEstimateHint:'إظهار تقدير سريع حسب طول الرسالة والمرفقات والميزات المفعلة',costEstimateTitle:'حساب تقريبي لتكلفة الرسالة',costEstimateContinue:'أكمل',costEstimateCancel:'إلغاء',costEstimateCalculating:'يتم حساب التكلفة التقديرية',costEstimateCalculatingHint:'يرجى الانتظار أثناء تحليل الرسالة وسياق المحادثة والمرفقات والميزات المفعلة…',costEstimateNote:'يظهر هنا الخصم التقريبي بتوكن AiWay فقط، ويُحسب الخصم النهائي حسب الاستخدام الفعلي بعد اكتمال الرد.',fallbackUsed:'تم استخدام نموذج احتياطي',tagline:'ذكاء اصطناعي للجميع',newChat:'محادثة جديدة',chats:'المحادثات',guest:'زائر',signPi:'سجّل الدخول بحساب Pi',login:'دخول',connected:'متصل',balance:'الرصيد',webSearch:'بحث الويب',buyBalance:'شراء رصيد بعملة Pi',choosePack:'اختر الباقة وادفع بعملة Pi. الرصيد صالح لمدة 30 يومًا.',allModels:'جميع النماذج مفتوحة',trial:n=>`تجربة مجانية: ${n} رسائل متبقية`,piBrowserRequired:'الدفع متاح من خلال متصفح Pi.',piSigninTitle:'تسجيل الدخول بحساب Pi',piSigninText:'اترك صفحة المتصفح هذه مفتوحة. ستنتقل إلى Pi Browser لتأكيد حسابك، وعندما ترجع هنا ستجد AiWay مسجلًا تلقائيًا.',piSigninContinue:'الانتقال وتسجيل الدخول',piSigninCancel:'إلغاء',piSigninNote:'لن يطلب منك AiWay كلمة مرور Pi. بعد الموافقة ارجع يدويًا إلى تبويب المتصفح الأصلي، وسيكتمل الدخول تلقائيًا.',imageExpiryNotice:'سيتم حذف الصورة من قاعدة بيانات الموقع بعد 3 أيام. حمّل الصورة الآن حتى لا تفقدها.',storageFallbackNotice:'مساحة التخزين ممتلئة مؤقتًا. هذه الصورة متاحة في الجلسة الحالية فقط؛ نزّلها الآن قبل إغلاق الصفحة أو تحديثها.',imageGenerating:'يتم إنشاء الصورة',imageGeneratingHint:'يحوّل الذكاء الاصطناعي فكرتك إلى صورة الآن…',freeLimitTitle:'استخدمت 30 طلبًا مجانيًا اليوم',freeLimitText:'اختر نموذجًا آخر متاحًا للمتابعة. ستتجدد حصتك المجانية تلقائيًا غدًا.',freeLimitAction:'اختيار نموذج آخر'}};
function setBalanceDisplay(value){
  const amount=Math.max(0,Math.floor(Number(value||0)));
  const formatted=amount.toLocaleString('en-US');
  const button=$('creditsButton');
  const credits=$('credits');
  const previous=credits?Number(String(credits.textContent||'0').replace(/[^0-9]/g,''))||0:0;
  if(credits)credits.textContent=formatted;
  if($('payBalance'))$('payBalance').textContent=formatted;
  if(button){
    button.classList.toggle('empty',amount<=0);
    button.classList.toggle('balance-long',formatted.length>=8&&formatted.length<11);
    button.classList.toggle('balance-xlong',formatted.length>=11);
    button.title=(lang==='ar'?'الرصيد المتاح: ':'Available balance: ')+formatted;
    if(amount>previous&&previous>0){button.classList.remove('balance-pop');void button.offsetWidth;button.classList.add('balance-pop');setTimeout(()=>button.classList.remove('balance-pop'),700)}
  }
}
function setAuthProgress(stage,visible=true){
  const box=$('authProgress'),title=$('authProgressTitle'),text=$('authProgressText');if(!box)return;
  const copy=lang==='ar'?{connect:['تسجيل الدخول بأمان','جارٍ الاتصال بحساب Pi…'],account:['تم تأكيد Pi','جارٍ تحميل الحساب والرصيد…'],sync:['تجهيز حسابك','جارٍ مزامنة المحادثات والنماذج…'],done:['تم تسجيل الدخول','حسابك جاهز للاستخدام.']}:{connect:['Signing in securely','Connecting to your Pi account…'],account:['Pi verified','Loading your account and balance…'],sync:['Preparing your account','Syncing chats and models…'],done:['Signed in','Your account is ready.']};
  const pair=copy[stage]||copy.connect;if(title)title.textContent=pair[0];if(text)text.textContent=pair[1];box.classList.toggle('show',Boolean(visible));box.setAttribute('aria-hidden',visible?'false':'true');
}
const PAYMENT_STEP_ORDER=['prepare','pi','verify','credit'];
function setPaymentFlow(stage,state='busy'){
  const modal=$('payModal'),box=$('paymentFlow'),title=$('paymentFlowTitle'),text=$('paymentFlowText');if(!box||!modal)return;
  const copy=lang==='ar'?{prepare:['تجهيز عملية الدفع','نتحقق من السعر الآمن قبل فتح Pi.'],pi:['أكد الدفع في Pi','أكمل الموافقة داخل Pi واترك AiWay مفتوحًا.'],verify:['تم استلام الدفع','جارٍ التحقق من المعاملة بأمان…'],credit:['جارٍ إضافة الرصيد','تم التحقق من الدفع، نحدّث حسابك الآن.'],success:['تمت إضافة الرصيد','تمت العملية بنجاح وحسابك جاهز للاستخدام.'],cancel:['تم إلغاء الدفع','لم يتم خصم أو إضافة أي رصيد.'],error:['تعذر إكمال الدفع','راجع اتصالك وحاول مرة أخرى.']}:{prepare:['Preparing payment','Verifying the secure quote before opening Pi.'],pi:['Confirm in Pi','Approve the payment in Pi and keep AiWay open.'],verify:['Payment received','Securely verifying the transaction…'],credit:['Adding your balance','Payment verified. Updating your account now.'],success:['Balance added','Payment completed and your account is ready.'],cancel:['Payment cancelled','No balance was charged or added.'],error:['Payment could not complete','Check your connection and try again.']};
  const key=stage||'prepare',pair=copy[key]||copy.prepare;if(title)title.textContent=pair[0];if(text)text.textContent=pair[1];box.classList.add('show');box.classList.toggle('success',state==='success');box.classList.toggle('error',state==='error');box.setAttribute('aria-hidden','false');modal.classList.toggle('payment-busy',state==='busy');
  const idx=PAYMENT_STEP_ORDER.indexOf(key);box.querySelectorAll('[data-pay-step]').forEach((el,i)=>{el.classList.toggle('done',state==='success'||(idx>=0&&i<idx));el.classList.toggle('active',state==='busy'&&i===Math.max(0,idx))});
}
function resetPaymentFlow(){const modal=$('payModal'),box=$('paymentFlow');modal?.classList.remove('payment-busy');if(box){box.classList.remove('show','success','error');box.setAttribute('aria-hidden','true')}}
function showChatsSkeleton(){const box=$('chats');if(!box||box.querySelector('.chat-item'))return;box.classList.add('is-loading');box.setAttribute('aria-busy','true');box.innerHTML=Array.from({length:5},()=>`<div class="chat-skeleton" aria-hidden="true"><span class="chat-skeleton-icon"></span><span class="chat-skeleton-lines"><i class="chat-skeleton-line"></i><i class="chat-skeleton-line short"></i></span></div>`).join('')}
function clearChatsLoading(){const box=$('chats');if(!box)return;box.classList.remove('is-loading');box.removeAttribute('aria-busy')}
function routedTaskId(){return activeTask||null}
function taskRoutedModelId(){
  if(userProfile && !userProfile.has_purchased && activeTask!=='image') return 'openrouter/free';
  const selected=selectedModel();
  const shouldAutoRoute=activeTask&&activeTask!=='all-models'&&selected?.type!=='image';
  return shouldAutoRoute?'aiway/auto':($('model').value||'openrouter/auto');
}

function renderAccountState(){
  if(auth&&userProfile){
    $('profileName').textContent='@'+(userProfile.username||'Pi');
    $('profileState').textContent=userProfile.has_purchased?I18N[lang].allModels:I18N[lang].trial(userProfile.free_trial_tokens ?? userProfile.trial_messages_remaining);
    $('userAvatar').textContent=(userProfile.username||'π').slice(0,1).toUpperCase();
    const availableTokens=Math.max(0,Number(userProfile.has_purchased?userProfile.ai_tokens:(userProfile.free_trial_tokens??userProfile.trial_messages_remaining??0)));setBalanceDisplay(availableTokens);if($('creditBuyLabel'))$('creditBuyLabel').textContent=lang==='ar'?'اشتري رصيد':'Buy balance';
    $('loginBtn').querySelector('span:last-child').textContent=I18N[lang].connected;
  }else{
    $('profileName').textContent=I18N[lang].guest;
    $('profileState').textContent=I18N[lang].signPi;
    $('userAvatar').textContent='π';
    if(!auth){setBalanceDisplay(0);if($('creditBuyLabel'))$('creditBuyLabel').textContent=lang==='ar'?'اشتري رصيد':'Buy balance'}
    $('loginBtn').querySelector('span:last-child').textContent=auth?I18N[lang].connected:(lang==='ar'?'تسجيل Pi Browser':'Sign in with Pi Browser');if($('piSignInLabel'))$('piSignInLabel').textContent=lang==='ar'?'تسجيل Pi':'Pi Sign In';
  }
  if($('topLoginBtn')){$('topLoginBtn').classList.toggle('authenticated',Boolean(auth));$('topLoginLabel').textContent=auth?(lang==='ar'?'متصل':'Connected'):(lang==='ar'?'تسجيل الدخول':'Sign in')}
  if($('introLoginLabel'))$('introLoginLabel').textContent=auth?(lang==='ar'?'متصل بحساب Pi':'Pi connected'):(lang==='ar'?'تسجيل الدخول':'Sign in');
}
function applyLanguage(){document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';document.querySelector('[data-legal="privacy"]')&&(document.querySelector('[data-legal="privacy"]').textContent=lang==='ar'?'سياسة الخصوصية':'Privacy Policy');document.querySelector('[data-legal="terms"]')&&(document.querySelector('[data-legal="terms"]').textContent=lang==='ar'?'شروط الاستخدام':'Terms of Service');document.querySelectorAll('[data-i18n]').forEach(el=>{if(!['profileName','profileState'].includes(el.id))el.textContent=I18N[lang][el.dataset.i18n]||el.textContent});$('languageLabel').textContent=lang==='en'?'العربية':'English';$('prompt').placeholder=lang==='ar'?'اسأل أي شيء...':'Ask anything...';if($('attachBtn')){$('attachBtn').setAttribute('aria-label',lang==='ar'?'إرفاق صورة أو ملف':'Attach image or file');$('attachBtn').title=$('attachBtn').getAttribute('aria-label')}renderUsageSummary();if($('creditBuyLabel'))$('creditBuyLabel').textContent=lang==='ar'?'اشتري رصيد':'Buy balance';if($('creditsButton')){$('creditsButton').title=lang==='ar'?'فتح باقات الرصيد':'Open balance packages';$('creditsButton').setAttribute('aria-label',$('creditsButton').title)}if($('piBrowserLoginLabel'))$('piBrowserLoginLabel').textContent=auth?I18N[lang].connected:(lang==='ar'?'تسجيل Pi Browser':'Sign in with Pi Browser');if($('piSignInLabel'))$('piSignInLabel').textContent=lang==='ar'?'تسجيل Pi':'Pi Sign In';renderTaskScreen();updateTaskContext();updatePiSigninModal();renderPackages();if(window.aiwayModels)renderModelSelect($('model').value);renderAccountState();updateSupportLabels();updateIntroLanguage();refreshGlobalAnnouncement();render()}
function toggleLanguage(){
 lang=lang==='en'?'ar':'en';
 storageSet('aiway_lang',lang);
 try{sessionStorage.setItem('aiway_intro_lang',lang)}catch{}
 closeMenu();
 applyLanguage();
 if(auth)loadChats().catch(()=>{});
 requestAnimationFrame(()=>applyLanguage());
}
async function deleteChat(id){conversationCoreCache.delete(id);conversationCoreRequests.delete(id);const ok=await aiwayConfirm(lang==='ar'?'سيتم حذف هذه الدردشة ورسائلها نهائيًا، ولا يمكن التراجع عن هذا الإجراء.':'This chat and all of its messages will be permanently deleted. This action cannot be undone.',{title:lang==='ar'?'حذف الدردشة؟':'Delete this chat?',confirmText:lang==='ar'?'حذف نهائي':'Delete permanently',cancelText:lang==='ar'?'احتفاظ بالدردشة':'Keep chat',type:'danger'});if(!ok)return;try{await api('/api/conversations?id='+encodeURIComponent(id),{method:'DELETE'});if(current===id){current=null;history=[];render()}await loadChats();toast(lang==='ar'?'تم حذف الدردشة':'Chat deleted')}catch(e){toast(friendlyClientError(e,lang==='ar'?'لم نتمكن من حذف الدردشة. حاول مرة أخرى.':'We could not delete the chat. Please try again.').message)}}
function isPiBrowser(){
  const ua=String(navigator.userAgent||'');
  return /(?:PiBrowser|Pi Browser)/i.test(ua);
}
function requirePiBrowser(){
  if(isPiBrowser())return true;
  const message=I18N[lang].piBrowserRequired;
  $('profileState').textContent=message;
  toast(message);
  return false;
}
function updatePiSigninModal(){
  if(!$('piSigninTitle'))return;
  $('piSigninTitle').textContent=I18N[lang].piSigninTitle;
  $('piSigninText').textContent=I18N[lang].piSigninText;
  $('continuePiSigninText').textContent=I18N[lang].piSigninContinue;
  $('cancelPiSignin').textContent=I18N[lang].piSigninCancel;
  $('piSigninNote').textContent=I18N[lang].piSigninNote;
}
function openPiSigninModal(){updatePiSigninModal();$('piSigninModal').classList.add('open')}
function closePiSigninModal(){$('piSigninModal').classList.remove('open')}
const PI_BRIDGE_STORAGE_KEY='pi_login_bridge';
let piBridgePollTimer=null;
function savePiBridge(value){
  if(value)storageSet(PI_BRIDGE_STORAGE_KEY,JSON.stringify(value));else storageRemove(PI_BRIDGE_STORAGE_KEY);
}
function readPiBridge(){
  try{return JSON.parse(storageGet(PI_BRIDGE_STORAGE_KEY)||'null')}catch{return null}
}
function showPiBridgeCompleted(username=''){
  closePiSigninModal();
  const title=lang==='ar'?'تم تأكيد حساب Pi':'Pi account confirmed';
  const message=lang==='ar'
    ?`تم تأكيد ${username?'@'+username:'حسابك'} بنجاح. ارجع الآن إلى المتصفح الأصلي؛ ستجد AiWay مسجلًا تلقائيًا.`
    :`${username?'@'+username:'Your account'} was confirmed. Return to the original browser; AiWay will sign in automatically.`;
  document.body.innerHTML=`<main class="pi-bridge-complete"><section class="pi-bridge-complete-card"><img src="/aiway-logo.png" alt="AiWay" class="pi-bridge-complete-logo"><h1 class="pi-bridge-complete-title">${esc(title)}</h1><p class="pi-bridge-complete-message">${esc(message)}</p><div class="pi-bridge-complete-check">✓</div></section></main>`;
}
async function startExternalPiSignIn(){
  setLoginBusy(true);
  try{
    const bridge=await api('/api/pi-login',{method:'POST',body:JSON.stringify({action:'bridge-start'})});
    savePiBridge({requestId:bridge.requestId,pollToken:bridge.pollToken,expiresAt:bridge.expiresAt});
    startPiBridgePolling();
    const redirectUri=piSigninRedirectUri();
    closePiSigninModal();
    // Use the standards-based OAuth URL in ordinary browsers. Calling Pi.signIn
    // from Chrome can hand the request to Pi Browser through an Android app-link
    // before the full authorize URL is preserved on some devices.
    const url=new URL('https://accounts.pinet.com/oauth/authorize');
    url.searchParams.set('response_type','token');
    url.searchParams.set('client_id',PI_SIGNIN_CLIENT_ID);
    url.searchParams.set('redirect_uri',redirectUri);
    url.searchParams.set('scope','username');
    url.searchParams.set('state',bridge.state);
    location.assign(url.toString());
  }catch(error){
    console.error(error);toast(friendlyClientError(error,lang==='ar'?'تعذر بدء تسجيل الدخول بحساب Pi. حاول مرة أخرى.':'Could not start Pi sign-in. Try again.').message);
  }finally{setLoginBusy(false)}
}
async function finishExternalPiSignIn(){
  const params=new URLSearchParams(location.hash.slice(1));
  if(!params.has('access_token')&&!params.has('error'))return false;
  const returned=params.get('state')||'';
  const oauthError=params.get('error');
  const accessToken=params.get('access_token');
  history.replaceState(null,'',location.pathname+location.search);
  if(oauthError)throw makeUiError(lang==='ar'?'تم إلغاء تسجيل الدخول أو انتهت صلاحيته. حاول مرة أخرى.':'Pi sign-in was cancelled or expired. Try again.','PI_LOGIN_FAILED');
  if(!accessToken||!returned)throw makeUiError(lang==='ar'?'لم تصل بيانات تسجيل الدخول كاملة من Pi. حاول مرة أخرى.':'Pi did not return complete sign-in data. Try again.','PI_LOGIN_FAILED');
  const data=await api('/api/pi-login',{method:'POST',body:JSON.stringify({action:'bridge-complete',accessToken,state:returned})});
  showPiBridgeCompleted(data.username||'');
  return true;
}
async function pollPiBridgeOnce(bridge){
  const status=await api('/api/pi-login',{method:'POST',body:JSON.stringify({action:'bridge-status',requestId:bridge.requestId,pollToken:bridge.pollToken})});
  if(status.status!=='completed'||!status.exchangeCode)return false;
  const data=await api('/api/pi-login',{method:'POST',body:JSON.stringify({action:'bridge-exchange',requestId:bridge.requestId,pollToken:bridge.pollToken,exchangeCode:status.exchangeCode})});
  auth=data;storeAuthSession(auth);savePiBridge(null);
  if(piBridgePollTimer){clearInterval(piBridgePollTimer);piBridgePollTimer=null}
  await Promise.all([refreshMe(),loadModels(),loadChats()]);startSupportPolling();render();
  toast(lang==='ar'?'تم تسجيل الدخول بحساب Pi بنجاح':'Signed in with Pi successfully');
  return true;
}
function startPiBridgePolling(){
  const bridge=readPiBridge();
  if(!bridge||auth)return;
  if(new Date(bridge.expiresAt||0).getTime()<=Date.now()){savePiBridge(null);return}
  if(piBridgePollTimer)clearInterval(piBridgePollTimer);
  const run=async()=>{try{await pollPiBridgeOnce(bridge)}catch(error){if(error?.code==='PI_LOGIN_BRIDGE_EXPIRED'||error?.status===410){savePiBridge(null);clearInterval(piBridgePollTimer);piBridgePollTimer=null;toast(lang==='ar'?'انتهت صلاحية محاولة تسجيل الدخول. ابدأ مرة أخرى.':'The sign-in attempt expired. Start again.')}else console.warn('Pi bridge polling:',error)}};
  run();piBridgePollTimer=setInterval(run,2000);
}
let piSdkPromise=null,richTextPromise=null;
function loadExternalScript(src,test){
  if(test())return Promise.resolve();
  return new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-aiway-src="${src}"]`);if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const script=document.createElement('script');script.src=src;script.async=true;script.dataset.aiwaySrc=src;script.onload=()=>test()?resolve():reject(Error('Library unavailable'));script.onerror=()=>reject(Error('Library unavailable'));document.head.appendChild(script)});
}
function ensurePiSdk(){if(window.Pi)return Promise.resolve();if(!piSdkPromise)piSdkPromise=loadExternalScript('https://sdk.minepi.com/pi-sdk.js',()=>Boolean(window.Pi));return piSdkPromise}
function ensureRichTextLibraries(){if(window.marked&&window.DOMPurify)return Promise.resolve();if(!richTextPromise)richTextPromise=Promise.all([loadExternalScript('https://cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js',()=>Boolean(window.marked)),loadExternalScript('https://cdn.jsdelivr.net/npm/dompurify@3.2.6/dist/purify.min.js',()=>Boolean(window.DOMPurify))]).then(()=>{if(history.some(m=>m.role==='assistant'&&m.content))render()}).catch(e=>console.warn('Rich text libraries:',e));return richTextPromise}
async function initPi(){
  try{await ensurePiSdk();Pi.init({version:'2.0',sandbox:false});piReady=true;if(!auth)$('profileState').textContent=isPiBrowser()?(lang==='ar'?'جاهز لتسجيل الدخول':'Ready to sign in'):I18N[lang].signPi}catch(e){console.warn('Pi SDK:',e);if(!auth)$('profileState').textContent=I18N[lang].signPi}
}
function modelProviderKey(m){return String(m?.provider||m?.family||m?.id?.split('/')[0]||'ai').toLowerCase()}
function modelLogo(m){const key=modelProviderKey(m),label={aiway:'AW',openai:'◎',google:'G',anthropic:'A','deepseek':'DS',meta:'∞',xai:'𝕏',grok:'𝕏',kimi:'K',moonshotai:'K',mistralai:'M','black-forest-labs':'BFL','bytedance-seed':'BD',recraft:'R',ideogram:'ID'}[key]||key.slice(0,2).toUpperCase();const safeKey=key.replace(/[^a-z0-9-]/g,'');return `<span class="model-brand-logo provider-${safeKey}" aria-hidden="true" title="${esc(m.providerLabel||m.familyLabel||key)}">${esc(label)}</span>`}
function pricingNumber(value){const n=Number(value);return Number.isFinite(n)&&n>=0?n:null}
function chatCostPerMillion(m){const prompt=pricingNumber(m?.pricing?.prompt),completion=pricingNumber(m?.pricing?.completion);if(prompt===null&&completion===null)return Number.POSITIVE_INFINITY;return ((prompt||0)+(completion||0))*1000000}
function imageUnitCost(m){const values=[m?.pricing?.image,m?.pricing?.image_output,m?.pricing?.request].map(pricingNumber).filter(v=>v!==null);return values.length?Math.min(...values):Number.POSITIVE_INFINITY}
function modelCostValue(m){return m?.type==='image'?imageUnitCost(m):chatCostPerMillion(m)}
function isUnsupportedOpenRouterImageModel(m){const id=String(m?.id||'').toLowerCase(),name=String(m?.name||'').trim().toLowerCase();return id==='openrouter/auto'||id==='openrouter/auto:beta'||id==='openrouter/auto-beta'||/(^|\/)openrouter[\s:_-]*(auto)?[\s:_-]*beta$/.test(id)||/^openrouter(?:\s+auto)?(?:\s+beta)?$/.test(name)}
function compareCostAsc(a,b){const av=modelCostValue(a),bv=modelCostValue(b);return av-bv||String(a.name||a.id).localeCompare(String(b.name||b.id))}
function compareCostDesc(a,b){const av=modelCostValue(a),bv=modelCostValue(b);return bv-av||String(a.name||a.id).localeCompare(String(b.name||b.id))}
function tokenUsageBadge(m){if(isFreeModel(m)||m?.isFree)return {text:lang==='ar'?'استهلاك منخفض للتوكين':'Low token cost',level:'low'};const cost=chatCostPerMillion(m);if(!Number.isFinite(cost))return null;if(cost>15)return {text:lang==='ar'?'استهلاك عالي جدًا للتوكين':'Very high token cost',level:'very-high'};if(cost>5)return {text:lang==='ar'?'استهلاك عالي للتوكين':'High token cost',level:'high'};return {text:lang==='ar'?'استهلاك منخفض للتوكين':'Low token cost',level:'low'}}
function modelPriceLabel(m){const cost=modelCostValue(m);if(!Number.isFinite(cost))return '';if(m.type==='image')return lang==='ar'?`التكلفة تبدأ من $${cost.toFixed(cost<0.01?4:2)} للصورة`:`From $${cost.toFixed(cost<0.01?4:2)} per image`;return lang==='ar'?`التكلفة التقريبية: $${cost.toFixed(cost<1?3:2)} لكل مليون توكن`:`Approx. cost: $${cost.toFixed(cost<1?3:2)} per 1M tokens`}
function rankTier(rank){if(!Number.isFinite(Number(rank)))return null;const n=Number(rank);if(n<=10)return 'top10';if(n<=25)return 'top25';if(n<=50)return 'top50';return null}
function officialModelBadges(m){
 const badges=[],intel=rankTier(m?.intelligenceRank),speed=rankTier(m?.throughputRank),latency=rankTier(m?.latencyRank),coding=rankTier(m?.codingRank);
 if(intel)badges.push({text:lang==='ar'?(intel==='top10'?'من أذكى 10 نماذج':intel==='top25'?'من أذكى 25 نموذجًا':'ذكاء متقدم'):(intel==='top10'?'Top 10 intelligence':intel==='top25'?'Top 25 intelligence':'Advanced intelligence'),level:'smart'});
 if(coding&&badges.length<2)badges.push({text:lang==='ar'?(coding==='top10'?'من أفضل 10 للبرمجة':'متميز في البرمجة'):(coding==='top10'?'Top 10 for coding':'Strong for coding'),level:'coding'});
 if(speed&&badges.length<2)badges.push({text:lang==='ar'?(speed==='top10'?'من أسرع 10 نماذج':speed==='top25'?'سريع جدًا':'سريع'):(speed==='top10'?'Top 10 speed':speed==='top25'?'Very fast':'Fast'),level:'speed'});
 else if(latency&&badges.length<2)badges.push({text:lang==='ar'?(latency==='top10'?'استجابة فورية تقريبًا':'استجابة سريعة'):(latency==='top10'?'Very low latency':'Low latency'),level:'speed'});

 return badges;
}
function renderModelSelect(selected=''){
  const select=$('model'),chatModels=window.aiwayModels||[],imageModels=window.aiwayImageModels||[],all=[...chatModels,...imageModels];
  if(!all.length){select.innerHTML=`<option value="">${lang==='ar'?'لا توجد نماذج متاحة':'No models available'}</option>`;updateModelTrigger();return}
  const forcedTrial=Boolean(userProfile&&!userProfile.has_purchased);
  const preferred=forcedTrial&&chatModels.some(m=>m.id==='openrouter/free')?'openrouter/free':(selected&&all.some(m=>m.id===selected&&!m.locked)?selected:(chatModels.find(m=>m.id==='openrouter/free')||chatModels.find(m=>m.trial&&!m.locked)||chatModels.find(m=>!m.locked)||all.find(m=>!m.locked)||all[0]).id);
  select.innerHTML=all.map(m=>`<option value="${esc(m.id)}" ${m.locked?'disabled':''}>${esc(shortModelName(m.shortName||m.name||m.id))}</option>`).join('');select.value=preferred;
  renderModelMenu('cheap');updateModelTrigger();syncModelMode();
}
const ONLY_FREE_MODEL_ID='openrouter/free';
function isFreeModel(m){return Boolean(m&&m.type!=='image'&&(m.id===ONLY_FREE_MODEL_ID||m.isFree))}
function modelsByBackendOrder(models,orderIds,fallbackCompare){
 const list=[...models],order=Array.isArray(orderIds)?orderIds:[];
 if(!order.length)return list.sort(fallbackCompare);
 const rank=new Map(order.map((id,index)=>[id,index]));
 return list.sort((a,b)=>(rank.get(a.id)??Number.MAX_SAFE_INTEGER)-(rank.get(b.id)??Number.MAX_SAFE_INTEGER)||fallbackCompare(a,b));
}
const COST_ESTIMATE_STORAGE_KEY='aiway_cost_estimate_enabled';
function costEstimateEnabled(){return localStorage.getItem(COST_ESTIMATE_STORAGE_KEY)!=='0'}
function setCostEstimateEnabled(enabled){localStorage.setItem(COST_ESTIMATE_STORAGE_KEY,enabled?'1':'0');syncCostEstimateToggle()}
function syncCostEstimateToggle(){const b=$('costEstimateQuickToggle');if(!b)return;const enabled=costEstimateEnabled();b.classList.toggle('active',enabled);b.setAttribute('aria-pressed',enabled?'true':'false');b.title=enabled?(lang==='ar'?'إظهار الحساب التقريبي قبل الإرسال':'Show estimated cost before sending'):(lang==='ar'?'الإرسال المباشر بدون حساب تقريبي':'Send immediately without an estimate');const label=b.querySelector('.estimate-label');if(label)label.textContent=enabled?(lang==='ar'?'الحساب التقريبي':'Cost estimate'):(lang==='ar'?'إرسال مباشر':'Send directly')}
function renderModelMenu(filter='cheap'){
 const menu=$('modelMenu');if(!menu)return;const all=[...(window.aiwayModels||[]),...(window.aiwayImageModels||[])],paid=all.filter(m=>!isFreeModel(m)),orders=window.aiwayChatModelOrders||{};let items=[];
 const imageTask=activeTask==='image',paidChat=paid.filter(m=>m.type!=='image'),paidImages=paid.filter(m=>m.type==='image');
 if(imageTask&&!['image-cheap','image-expensive'].includes(filter))filter='image-cheap';
 if(filter==='image-cheap'||filter==='images')items=paidImages.sort(compareCostAsc);
 if(filter==='image-expensive')items=paidImages.sort(compareCostDesc);
 if(filter==='expensive')items=modelsByBackendOrder(paidChat,orders.mostExpensive,compareCostDesc);
 if(filter==='cheap')items=modelsByBackendOrder(paidChat,orders.cheapest,compareCostAsc);
 if(filter==='free')items=modelsByBackendOrder(all.filter(isFreeModel),orders.free,compareCostAsc);
 const labels={images:I18N[lang].modelsImages,'image-cheap':lang==='ar'?'الأرخص':'Cheapest','image-expensive':lang==='ar'?'الأغلى':'Most expensive',expensive:I18N[lang].modelsExpensive,cheap:I18N[lang].modelsCheap,free:I18N[lang].modelsFree};
 const tabKeys=imageTask?['image-cheap','image-expensive']:['cheap','images','expensive','free'];
 const tabs=tabKeys.map(k=>`<button type="button" class="model-tab ${k===filter?'active':''}" data-model-filter="${k}">${labels[k]}</button>`).join('');
 const setting='';
 menu.innerHTML=setting+`<div class="model-tabs">${tabs}</div>`+items.map(m=>{const usage=m.type==='image'?{text:imageUnitCost(m)>0.08?(lang==='ar'?'استهلاك عالي جدًا للتوكين':'Very high token usage'):imageUnitCost(m)>0.03?(lang==='ar'?'استهلاك عالي للتوكين':'High token usage'):(lang==='ar'?'استهلاك منخفض للتوكين':'Low token usage'),level:imageUnitCost(m)>0.08?'very-high':imageUnitCost(m)>0.03?'high':'low'}:tokenUsageBadge(m),official=m.type==='image'?[]:officialModelBadges(m),badges=[...official,isFreeModel(m)?{text:lang==='ar'?'مجاني':'Free',level:'free'}:null,usage].filter(Boolean);const detail=m.providerLabel||m.familyLabel||m.provider||'AI';return `<button type="button" class="model-option ${m.id===$('model').value?'selected':''}" data-model-id="${esc(m.id)}" ${m.locked?'disabled':''}>${modelLogo(m)}<span class="model-option-copy"><b>${esc(shortModelName(m.shortName||m.name||m.id))}</b><small>${esc(detail)}</small><span class="model-badges">${badges.map(x=>`<i class="model-badge ${x.level==='very-high'?'token-very-high':x.level==='high'?'token-high':x.level==='low'?'token-low':x.level==='smart'?'smart':x.level==='speed'?'speed':x.level==='coding'?'coding':x.level==='popular'?'popular':''}" title="${esc(lang==='ar'?'الترتيب محدث رسميًا من OpenRouter':'Ranking updated from OpenRouter')}">${esc(x.text)}</i>`).join('')}</span></span><span class="model-lock">${m.locked?'🔒':''}</span><span class="model-option-check" aria-hidden="true"></span></button>`}).join('')||`<div class="model-menu-empty">${lang==='ar'?'لا توجد نماذج في هذه الفئة.':'No models in this category.'}</div>`;
 $('costEstimateToggle')&&($('costEstimateToggle').onchange=e=>setCostEstimateEnabled(e.target.checked));menu.querySelectorAll('[data-model-filter]').forEach(b=>b.onclick=e=>{e.stopPropagation();renderModelMenu(b.dataset.modelFilter)});menu.querySelectorAll('[data-model-id]').forEach(b=>b.onclick=()=>{selectModel(b.dataset.modelId);closeModelMenu()});
}
function ensureModelMenuScrim(){let scrim=$('modelMenuScrim');if(!scrim){scrim=document.createElement('div');scrim.id='modelMenuScrim';scrim.className='model-menu-scrim';scrim.setAttribute('aria-hidden','true');document.body.appendChild(scrim);scrim.addEventListener('click',closeModelMenu);scrim.addEventListener('touchend',e=>{e.preventDefault();closeModelMenu()},{passive:false})}return scrim}
function positionModelMenu(){const menu=$('modelMenu'),trigger=$('modelTrigger');if(!menu||!trigger||!menu.classList.contains('open'))return;const r=trigger.getBoundingClientRect(),gap=8,pad=10,vw=document.documentElement.clientWidth||window.innerWidth,vh=window.visualViewport?.height||window.innerHeight,mobile=vw<=700;if(mobile){menu.style.setProperty('left',pad+'px','important');menu.style.setProperty('right',pad+'px','important');menu.style.setProperty('top',Math.max(68,r.bottom+gap)+'px','important');menu.style.setProperty('bottom',pad+'px','important');menu.style.setProperty('width','auto','important');menu.style.setProperty('max-height','none','important')}else{const width=Math.min(430,vw-pad*2),left=Math.max(pad,Math.min(r.left,vw-width-pad)),top=Math.min(r.bottom+gap,vh-100);menu.style.setProperty('left',left+'px','important');menu.style.setProperty('right','auto','important');menu.style.setProperty('top',top+'px','important');menu.style.setProperty('bottom','auto','important');menu.style.setProperty('width',width+'px','important');menu.style.setProperty('max-height',Math.max(220,vh-top-pad)+'px','important')}}
function openModelMenu(){const menu=$('modelMenu'),trigger=$('modelTrigger');if(!menu||!trigger)return;if(menu.parentElement!==document.body)document.body.appendChild(menu);try{renderModelMenu(activeTask==='image'?'image-cheap':'cheap')}catch(err){console.error('Model menu render failed',err);menu.innerHTML=`<div class="model-menu-empty">${lang==='ar'?'تعذر عرض النماذج. أعد المحاولة.':'Could not display models. Please try again.'}</div>`}menu.classList.add('model-menu-portal','open');const scrim=ensureModelMenuScrim();scrim.classList.add('open');document.body.classList.add('model-menu-open');trigger.classList.add('open');trigger.setAttribute('aria-expanded','true');positionModelMenu();requestAnimationFrame(()=>{positionModelMenu();menu.scrollTop=0})}
function selectModel(id){
  const model=[...(window.aiwayModels||[]),...(window.aiwayImageModels||[])].find(m=>m.id===id);
  if(!model||model.locked){toast(lang==='ar'?'هذا النموذج مقفول':'This model is locked');renderModelSelect($('model').value);return}
  $('model').value=id;updateModelTrigger();syncModelMode();
}
function updateModelTrigger(){
  const m=selectedModel(),isImage=m?.type==='image';
  $('modelTriggerIcon').innerHTML=isImage?MODEL_ICONS.image:MODEL_ICONS.chat;
  $('modelTriggerIcon').classList.toggle('image',isImage);
  $('modelTriggerName').textContent=m?shortModelName(m.shortName||m.name||m.id):(lang==='ar'?'اختر نموذجًا':'Choose a model');
  const typeLabel=$('modelTriggerType');if(typeLabel)typeLabel.textContent=isImage?'AI Images':'AI Chat';
}
function closeModelMenu(){const trigger=$('modelTrigger'),menu=$('modelMenu'),scrim=$('modelMenuScrim');if(menu){menu.classList.remove('open');['left','right','top','bottom','width','max-height'].forEach(x=>menu.style.removeProperty(x))}if(scrim)scrim.classList.remove('open');document.body.classList.remove('model-menu-open');if(trigger){trigger.classList.remove('open');trigger.setAttribute('aria-expanded','false')}}
function shortModelName(name){
  let value=String(name||'').trim();
  const original=value;
  value=value
    .replace(/^[^:]{1,40}:\s*/,'')
    .replace(/^(OpenAI|Google|Anthropic|Meta|xAI|Microsoft|ByteDance(?: Seed)?|Black Forest Labs|Stability AI|Recraft|Ideogram)[·:\s-]+/i,'')
    .replace(/\s+\((?:Fast|Preview|Experimental)[^)]*\)$/i,'')
    .replace(/\s+(Preview|Experimental)(?:\s+\d{2}-\d{2})?$/i,'')
    .trim();

  // Some providers return only the version after their prefix, for example
  // "DeepSeek: V3". Keep the model family so the visible name is meaningful.
  if (/^deepseek\s*[:·-]/i.test(original) && /^(?:v|r)\d/i.test(value)) value=`DeepSeek ${value}`;
  if (/^qwen\s*[:·-]/i.test(original) && /^\d/i.test(value)) value=`Qwen ${value}`;
  if (/^mistral\s*[:·-]/i.test(original) && /^(?:large|medium|small|nemo|codestral|ministral)/i.test(value) && !/^mistral/i.test(value)) value=`Mistral ${value}`;

  return value.slice(0,40);
}
function applyFeatureFlags(flags={}){window.aiwayFeatureFlags=flags||{};if(activeTask&&!isTaskVisible(activeTask)){activeTask='';storageRemove('aiway_active_task');updateTaskContext?.()}if($('taskScreen')?.classList.contains('open'))renderTaskScreen();for(const id of ['creditsButton','introHeroPackagesBtn','introHeroPackages']){const el=document.getElementById(id);if(el){el.hidden=flags.payments===false;el.setAttribute('aria-disabled',flags.payments===false?'true':'false')}}for(const id of ['topLoginBtn','piSignInBtn','piBrowserLoginBtn']){const el=document.getElementById(id);if(el&&flags.login===false){el.setAttribute('aria-disabled','true');el.classList.add('feature-disabled')}else el?.classList.remove('feature-disabled')}document.body.classList.toggle('maintenance-active',Boolean(flags.maintenance))}
function globalAnnouncementContext(){if($('payModal')?.classList.contains('open'))return 'payments';const intro=$('introScreen');if(intro&&!intro.classList.contains('hide'))return 'home';if(activeTask==='image'&&!$('taskScreen')?.classList.contains('open'))return 'images';if($('taskScreen')?.classList.contains('open'))return 'tools';return 'chat'}
function shouldShowGlobalAnnouncement(value){if(!value?.enabled)return false;const now=Date.now(),starts=value.starts_at?Date.parse(value.starts_at):0,ends=value.ends_at?Date.parse(value.ends_at):0;if(starts&&Number.isFinite(starts)&&now<starts)return false;if(ends&&Number.isFinite(ends)&&now>=ends)return false;const pages=Array.isArray(value.pages)?value.pages.filter(Boolean):[];return !pages.length||pages.includes(globalAnnouncementContext())}
function leaveAnnouncementContext(context){if(context==='images'||context==='chat'){openTaskScreen();return}if(context==='payments'){$('payModal')?.classList.remove('open');refreshGlobalAnnouncement();return}if(context==='tools'){closeTaskScreen();return}if(context==='home'){document.getElementById('aiwayAnnouncement')?.remove()}}
function renderGlobalAnnouncement(value){let el=document.getElementById('aiwayAnnouncement');if(!shouldShowGlobalAnnouncement(value)){el?.remove();document.body.classList.remove('announcement-blocked');return}const pages=Array.isArray(value.pages)?value.pages.filter(Boolean):[],siteWide=!pages.length,context=globalAnnouncementContext(),level=['warning','danger'].includes(value.level)?value.level:'info',message=(lang==='ar'?value.text_ar:value.text_en)||value.text_ar||value.text_en||'';if(!el){el=document.createElement('div');el.id='aiwayAnnouncement';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.innerHTML='<div class="announcement-backdrop" aria-hidden="true"></div><section class="announcement-panel"><div class="announcement-mark" aria-hidden="true">!</div><div class="announcement-copy"><span class="announcement-kicker"></span><h2 class="announcement-title"></h2><p class="announcement-text"></p></div><button class="announcement-action" type="button"></button></section>';document.body.appendChild(el)}el.className=`aiway-announcement ${level} ${siteWide?'site-wide':'scoped'}`;document.body.classList.add('announcement-blocked');el.querySelector('.announcement-kicker').textContent=lang==='ar'?(siteWide?'تنبيه مهم من AiWay':'الخدمة غير متاحة مؤقتًا'):(siteWide?'Important AiWay notice':'Service temporarily unavailable');el.querySelector('.announcement-title').textContent=lang==='ar'?(level==='danger'?'صيانة مؤقتة':'تحديث للخدمة'):(level==='danger'?'Temporary maintenance':'Service update');el.querySelector('.announcement-text').textContent=message;const action=el.querySelector('.announcement-action');if(siteWide){action.hidden=true;action.onclick=null}else{action.hidden=false;action.textContent=lang==='ar'?'العودة':'Go back';action.onclick=()=>leaveAnnouncementContext(context)}}
function refreshGlobalAnnouncement(){if(window.aiwayGlobalAnnouncement)renderGlobalAnnouncement(window.aiwayGlobalAnnouncement)}
async function loadModels(){
  const selected=$('model').value;
  const data=await api('/api/models');
  window.aiwayPackages=data.packages||{};window.aiwayTokenUsd=Number(data.tokenUsd||0.00001);
  window.aiwayFeatureFlags=data.featureFlags||{};window.aiwayGlobalAnnouncement=data.globalAnnouncement||{};applyFeatureFlags(window.aiwayFeatureFlags);renderGlobalAnnouncement(window.aiwayGlobalAnnouncement);
  window.aiwayModels=data.models||[];
  window.aiwayChatModelOrders=data.chatModelOrders||{};
  window.aiwayImageModels=(data.imageModels||[]).filter(m=>m&&m.id&&!isUnsupportedOpenRouterImageModel(m)).sort(compareCostAsc);
  const serverTools=(data.tools||[]).filter(tool=>tool?.id&&!['live_audio','live_translate'].includes(tool.tool_type)&&!['voice-chat','voice-translate'].includes(tool.id));
  visibleTaskIds=new Set(serverTools.map(tool=>tool.id));
  for(const tool of serverTools){
    const cleanToolDescription=(value,type,locale)=>type==='image'?(locale==='ar'?'أنشئ صورًا احترافية من وصفك واختر الجودة والأبعاد المناسبة.':'Create professional images from your description and choose the preferred quality and dimensions.'):String(value||'').trim();
    const arDescription=cleanToolDescription(tool.description_ar,tool.tool_type,'ar');
    const enDescription=cleanToolDescription(tool.description_en,tool.tool_type,'en');
    TASKS[tool.id]={ar:[tool.name_ar||tool.id,arDescription,arDescription],en:[tool.name_en||tool.id,enDescription,enDescription],tool_type:tool.tool_type,model_id:tool.model_id};
    const customToolIcon=safeToolSvg(tool.prompt_config?._ui?.icon_svg);if(customToolIcon)TASK_ICONS[tool.id]=customToolIcon;else if(!TASK_ICONS[tool.id])TASK_ICONS[tool.id]=tool.tool_type==='image'?TASK_ICONS.image:ICONS.sparkles;
  }
  if(activeTask&&!isTaskVisible(activeTask)){activeTask='';storageRemove('aiway_active_task')}
  if($('taskScreen')?.classList.contains('open'))renderTaskScreen();
  renderModelSelect(selected||data.trialModelId||'');
  renderPackages();
  return data;
}

let supportPoll=null;
function supportText(){return lang==='ar'?{label:'الدعم',title:'تواصل مع الدعم',sub:'أرسل أي مشكلة وسيرد عليك فريق الدعم هنا.',placeholder:'اكتب مشكلتك هنا...',login:'سجّل الدخول بحساب Pi لبدء محادثة مع الدعم.',empty:'ابدأ بكتابة المشكلة التي تواجهك.'}:{label:'Support',title:'Contact support',sub:'Send any issue and the support team will reply here.',placeholder:'Describe your issue...',login:'Sign in with Pi to start a support conversation.',empty:'Start by describing the issue you are facing.'}}
function updateSupportLabels(){const t=supportText();if($('supportLabel'))$('supportLabel').textContent=t.label;if($('supportTitle'))$('supportTitle').textContent=t.title;if($('supportSubtitle'))$('supportSubtitle').textContent=t.sub;if($('supportInput'))$('supportInput').placeholder=t.placeholder;if($('supportBtn')){$('supportBtn').title=t.title;$('supportBtn').setAttribute('aria-label',t.title)}}
function setSupportBadge(n){n=Number(n||0);for(const id of ['supportBadge','menuBadge']){const el=$(id);if(!el)continue;el.textContent=n>99?'99+':String(n);el.classList.toggle('show',n>0)}}
function renderSupportMessages(messages=[]){const box=$('supportMessages'),t=supportText();if(!auth){box.innerHTML=`<div class="support-empty">${esc(t.login)}</div>`;return}if(!messages.length){box.innerHTML=`<div class="support-empty">${esc(t.empty)}</div>`;return}box.innerHTML=messages.map(m=>`<div class="support-msg ${m.sender_role==='admin'?'admin':'user'}"><span>${esc(m.message)}</span><small>${new Date(m.created_at).toLocaleString(lang==='ar'?'ar-EG-u-nu-latn':'en-US')}</small></div>`).join('');box.scrollTop=box.scrollHeight}
async function loadSupport({markRead=false,silent=false}={}){if(!auth){setSupportBadge(0);renderSupportMessages([]);return}try{const d=await api('/api/conversations?mode=support');renderSupportMessages(d.messages||[]);setSupportBadge(d.unread||0);if(markRead&&d.unread){await api('/api/conversations?mode=support',{method:'POST',body:JSON.stringify({mode:'support',action:'mark-read'})});setSupportBadge(0)}}catch(e){if(!silent)toast(friendlyClientError(e,lang==='ar'?'تعذر تحميل رسائل الدعم.':'Could not load support messages.').message)}}
async function openSupport(){if(!auth){toast(lang==='ar'?'سجّل الدخول أولًا للتواصل مع الدعم':'Sign in first to contact support');return}updateSupportLabels();$('supportModal').classList.add('open');await loadSupport({markRead:true})}
async function sendSupport(){if(!auth)return openSupport();const input=$('supportInput'),message=String(input.value||'').trim();if(!message)return;const btn=$('supportSend');btn.disabled=true;try{await api('/api/conversations?mode=support',{method:'POST',body:JSON.stringify({mode:'support',message})});input.value='';await loadSupport({markRead:true})}catch(e){toast(friendlyClientError(e,lang==='ar'?'تعذر إرسال رسالة الدعم.':'Could not send the support message.').message)}finally{btn.disabled=false}}
function startSupportPolling(){clearInterval(supportPoll);if(auth&&!document.hidden){loadSupport({silent:true});supportPoll=setInterval(()=>{if(!document.hidden)loadSupport({silent:true})},30000)}else if(!auth)setSupportBadge(0)}
document.addEventListener('visibilitychange',()=>{if(auth)startSupportPolling()});

const INTRO_CONTENT={
  ar:{
    eyebrow:'✦ ابدأ مجانًا واكتشف أدوات إنتاج عملية',title:'100 استخدام مجاني.<br><span>حوّل أفكارك إلى نتائج.</span>',copy:'AiWay مساحة واحدة تجمع أدوات للكتابة والتلخيص والدراسة والترجمة والتسويق والأعمال. يحصل الحساب الجديد على 100 توكين مجاني؛ كل استخدام متاح في التجربة يخصم توكينًا واحدًا فقط.',start:'جرّب 100 استخدام مجاني',watch:'شاهد كيف يعمل الموقع',languageLabel:'لغة الموقع',demoTitle:'مثال حي لاستخدام الأدوات',
    scenarios:[
      {tab:'كتابة محتوى',prompt:'اكتب وصفًا جذابًا لمنتج جديد',results:[['مساعد الكتابة','وصف واضح وجذاب يبرز الفائدة الأساسية ويقود العميل إلى اتخاذ خطوة.','جاهز للاستخدام'],['مساعد التسويق','رسالة مختصرة تركّز على المشكلة والحل والقيمة التي يحصل عليها العميل.','مقنع'],['مساعد الأعمال','صياغة عملية مناسبة لصفحة المنتج أو العرض التجاري.','احترافي']]},
      {tab:'الدراسة',prompt:'اشرح درسًا صعبًا بطريقة بسيطة',results:[['مساعد الدراسة','شرح تدريجي يبدأ بالفكرة الأساسية ثم مثال ثم سؤال للتأكد من الفهم.','مبسّط'],['مساعد التلخيص','أهم النقاط في خطوات قصيرة يسهل مراجعتها وحفظها.','منظم'],['مساعد الأسئلة','أسئلة قصيرة تساعدك على تثبيت المعلومة بعد الشرح.','تفاعلي']]},
      {tab:'تلخيص ملف',prompt:'حوّل تقريرًا طويلًا إلى قرارات وخطوات',results:[['مساعد التلخيص','استخراج القرارات الأساسية والخطوات والمسؤوليات والمواعيد المقترحة.','واضح'],['مساعد الأعمال','ترتيب النتائج حسب الأولوية والأثر وسهولة التنفيذ.','عملي'],['مساعد الكتابة','صياغة ملخص تنفيذي مناسب للمشاركة مع الفريق.','جاهز للمشاركة']]}
    ],
    goals:{kicker:'أدوات إنتاج في مكان واحد',title:'اختر الأداة المناسبة لمهمتك',copy:'كل أداة مجهزة لغرض واضح حتى تصل إلى نتيجة مفيدة بسرعة.',items:[[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='3' stroke='currentColor' stroke-width='1.8'/><circle cx='8' cy='9' r='1.5' fill='currentColor'/><path d='m5 17 4.5-4 3 2.5 2.5-2 4 3.5' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'إنشاء الصور','حوّل وصفك إلى صور أصلية، وعدّل الأفكار بصريًا بعد فتح الأدوات المدفوعة.'],[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d='m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'البرمجة','كتابة الأكواد وإصلاح الأخطاء وشرح الحلول التقنية بصورة منظمة.'],['✎','الكتابة وصناعة المحتوى','مقالات ورسائل ووصف منتجات وصياغة احترافية.'],[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d='M4 5h16v14H4zM7 9h10M7 13h7' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'التلخيص وتحليل الملفات','اختصار النصوص والمستندات إلى نقاط وقرارات واضحة.'],['⌕','الدراسة والشرح','شرح مبسط وأسئلة مراجعة وخطط مذاكرة.'],['◎','الترجمة والتسويق والأعمال','ترجمة طبيعية وأفكار وخطط ورسائل عملية.']]},
    compare:{kicker:'تجربة مجانية حقيقية',title:'100 توكين = حتى 100 استخدام مجاني',copy:'بعد إنشاء الحساب تحصل مرة واحدة على 100 توكين مجاني. كل طلب ناجح داخل الأدوات المتاحة في التجربة يخصم توكينًا واحدًا فقط، لتجرب الموقع قبل أي دفع.',empty:'اختر مثالًا لترى شكل النتيجة.',thinking:'يحلل الطلب ويجهز النتيجة',modelLabel:'الأداة',speedLabel:'حالة النتيجة',choices:[{label:'كتابة إعلان',prompt:'اكتب إعلانًا قصيرًا لمشروع منزلي.',answer:'حوّل شغفك إلى تجربة تصل لعملائك: جودة مصنوعة بعناية، تفاصيل مميزة، وطلب سهل من أول رسالة.',model:'أداة التسويق',speed:'جاهزة'},{label:'شرح درس',prompt:'اشرح مفهومًا دراسيًا بطريقة سهلة.',answer:'نبدأ بالفكرة الأساسية بكلمات بسيطة، ثم نربطها بمثال من الحياة، وبعدها نختبر الفهم بسؤال قصير.',model:'أداة الدراسة',speed:'جاهزة'},{label:'تلخيص تقرير',prompt:'لخّص تقريرًا إلى قرارات واضحة.',answer:'القرار الأول، سبب اتخاذه، الخطوة التالية، المسؤول عنها، والموعد المقترح للتنفيذ.',model:'أداة التلخيص',speed:'جاهزة'}]},
    how:{kicker:'بسيط وواضح',title:'كيف يعمل AiWay؟',copy:'ثلاث خطوات من الفكرة إلى نتيجة قابلة للاستخدام.',steps:[['أنشئ حسابك','سجّل الدخول لتحصل على 100 توكين مجاني لأول مرة.'],['اختر أداة واكتب طلبك','اختر الكتابة أو التلخيص أو الدراسة أو الترجمة أو غيرها، ثم اشرح ما تحتاجه.'],['راجع النتيجة واستمر','انسخ النتيجة أو عدّل طلبك أو أكمل المحادثة من نفس المكان.']]},
    cases:{kicker:'الأدوات المتاحة',title:'مساعد متخصص لكل نوع من العمل',copy:'واجهة منظمة تساعدك على الانتقال مباشرة إلى المهمة التي تريد إنجازها.',items:[['الكتابة والمحتوى','صياغة مقالات ورسائل وأفكار ووصف منتجات.'],['التلخيص','تحويل النصوص والملفات الطويلة إلى نقاط مركزة.'],['الدراسة والشرح','شرح الدروس وإنشاء أسئلة وخطط مراجعة.'],['الترجمة','ترجمة النصوص مع الحفاظ على المعنى والأسلوب.'],['الإعلانات والتسويق','منشورات وإعلانات وأفكار حملات ورسائل بيع.'],['الأعمال والأفكار','خطط ومقترحات وعروض وخطوات تنفيذية.']]},
    pricing:{kicker:'بعد التجربة المجانية',title:'خصم عادل حسب استخدامك الفعلي',copy:'بعد شراء الرصيد لأول مرة، لا تُحسب كل الرسائل بنفس القيمة؛ يتحدد الخصم بصورة شفافة حسب العمل المطلوب.',points:[['تكلفة نموذج الذكاء الاصطناعي','يختلف الخصم وفق الأداة والنموذج الذي ينفذ الطلب.'],['حجم الطلب والمرفقات','النص الأطول والصور والملفات تحتاج معالجة أكبر.'],['طول النتيجة الفعلية','يتم اعتماد الاستهلاك الحقيقي بعد وصول الرد، وليس تقديرًا مبالغًا فيه.']]},
    ctaTitle:'ابدأ قبل أن تدفع',ctaCopy:'أنشئ حسابك واحصل على 100 توكين مجاني، واستخدم كل توكين في طلب ناجح واحد داخل الأدوات المتاحة بالتجربة.',ctaButton:'ابدأ تجربتك المجانية',footer:'AiWay — أدوات إنتاج ذكية، وتجربة عربية وإنجليزية سهلة.'
  },
  en:{
    eyebrow:'✦ Start free with practical productivity tools',title:'100 free uses.<br><span>Turn ideas into results.</span>',copy:'AiWay brings writing, summarization, study, translation, marketing, and business tools into one organized workspace. New accounts receive 100 free tokens, and each available trial use costs only one token.',start:'Try 100 uses free',watch:'See how it works',languageLabel:'Site language',demoTitle:'A live tools example',
    scenarios:[
      {tab:'Write content',prompt:'Write an appealing description for a new product',results:[['Writing assistant','A clear product description that highlights the main benefit and guides the customer toward action.','Ready to use'],['Marketing assistant','A concise message focused on the problem, solution, and customer value.','Persuasive'],['Business assistant','A practical version suitable for a product page or proposal.','Professional']]},
      {tab:'Study',prompt:'Explain a difficult lesson in a simple way',results:[['Study assistant','A step-by-step explanation with the core idea, an example, and a quick understanding check.','Simple'],['Summary assistant','The key points organized into short, memorable steps.','Organized'],['Question assistant','Short review questions to reinforce the lesson.','Interactive']]},
      {tab:'Summarize file',prompt:'Turn a long report into decisions and actions',results:[['Summary assistant','Extract the key decisions, action items, owners, and suggested deadlines.','Clear'],['Business assistant','Sort findings by priority, impact, and ease of execution.','Practical'],['Writing assistant','Create an executive summary ready to share with a team.','Shareable']]}
    ],
    goals:{kicker:'PRODUCTIVITY TOOLS IN ONE PLACE',title:'Choose the right tool for your task',copy:'Each tool is prepared for a clear purpose so you can reach a useful result faster.',items:[[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><rect x='3' y='4' width='18' height='16' rx='3' stroke='currentColor' stroke-width='1.8'/><circle cx='8' cy='9' r='1.5' fill='currentColor'/><path d='m5 17 4.5-4 3 2.5 2.5-2 4 3.5' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'Image creation','Turn descriptions into original images and refine visual ideas after paid tools are unlocked.'],[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d='m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'Coding','Write code, fix bugs, and explain technical solutions in a structured way.'],['✎','Writing and content','Articles, messages, product descriptions, and polished copy.'],[`<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'><path d='M4 5h16v14H4zM7 9h10M7 13h7' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/></svg>`,'Summaries and file analysis','Turn long text and documents into clear points and decisions.'],['⌕','Study and explanation','Simple explanations, review questions, and study plans.'],['◎','Translation, marketing, and business','Natural translation, ideas, plans, and practical messages.']]},
    compare:{kicker:'A REAL FREE TRIAL',title:'100 tokens = up to 100 free uses',copy:'After creating an account, you receive 100 free tokens once. Every successful request in a trial-enabled tool costs only one token, so you can explore the experience before paying.',empty:'Choose an example to preview the result.',thinking:'Analyzing the request and preparing the result',modelLabel:'Tool',speedLabel:'Result status',choices:[{label:'Write an ad',prompt:'Write a short ad for a home business.',answer:'Turn your passion into an experience customers remember: carefully made quality, distinctive details, and easy ordering from the first message.',model:'Marketing tool',speed:'Ready'},{label:'Explain a lesson',prompt:'Explain a study concept in a simple way.',answer:'Start with the core idea in plain words, connect it to a real-life example, then check understanding with one short question.',model:'Study tool',speed:'Ready'},{label:'Summarize report',prompt:'Summarize a report into clear decisions.',answer:'List each decision, why it matters, the next step, the owner, and a suggested deadline.',model:'Summary tool',speed:'Ready'}]},
    how:{kicker:'SIMPLE AND CLEAR',title:'How AiWay works',copy:'Three steps from an idea to a result you can use.',steps:[['Create your account','Sign in to receive 100 free tokens for your first trial.'],['Choose a tool and write','Pick writing, summarization, study, translation, or another tool and describe what you need.'],['Review and continue','Copy the result, refine your request, or continue the conversation.']]},
    cases:{kicker:'AVAILABLE TOOLS',title:'A focused assistant for every kind of work',copy:'An organized interface that takes you directly to the task you want to complete.',items:[['Writing and content','Create articles, messages, ideas, and product copy.'],['Summarization','Turn long text and files into focused key points.'],['Study and explanation','Explain lessons and create questions and study plans.'],['Translation','Translate while preserving meaning and tone.'],['Ads and marketing','Create posts, campaigns, and persuasive sales messages.'],['Business and ideas','Build plans, proposals, presentations, and action steps.']]},
    pricing:{kicker:'AFTER THE FREE TRIAL',title:'Fair charging based on actual usage',copy:'After your first balance purchase, requests are not charged at one flat rate. The deduction is calculated transparently from the work performed.',points:[['AI model cost','The charge varies according to the tool and model used for the request.'],['Request and attachment size','Longer text, images, and files require more processing.'],['Actual response length','The final deduction uses real consumption after the response, rather than an inflated estimate.']]},
    ctaTitle:'Start before you pay',ctaCopy:'Create your account, receive 100 free tokens, and use each token for one successful request in a trial-enabled tool.',ctaButton:'Start your free trial',footer:'AiWay — smart productivity tools in a smooth Arabic and English experience.'
  }
};
let introScenarioIndex=0,introTypingTimers=[];
function clearIntroTyping(){introTypingTimers.forEach(clearTimeout);introTypingTimers=[]}
function introType(el,text,speed=13,done){if(!el)return;el.textContent='';el.classList.add('typing-caret');let i=0;const tick=()=>{if(i<=text.length){el.textContent=text.slice(0,i++);introTypingTimers.push(setTimeout(tick,speed))}else{el.classList.remove('typing-caret');done&&done()}};tick()}
function modelInitial(){return 'Ai'}
function renderCompareDemo(){
  const c=INTRO_CONTENT[lang].compare,picks=$('comparePicks'),chat=$('compareChat');if(!picks||!chat)return;
  clearCompareDemoTimers();compareDemoRun++;
  picks.innerHTML=c.choices.map((x,i)=>`<button type="button" class="compare-pick" data-compare-choice="${i}">${esc(x.label)}</button>`).join('');
  chat.innerHTML=`<div class="compare-empty">${esc(c.empty)}</div>`;
  picks.querySelectorAll('[data-compare-choice]').forEach(button=>button.addEventListener('click',()=>playCompareDemo(Number(button.dataset.compareChoice))));
}
function playCompareDemo(index){
  const c=INTRO_CONTENT[lang].compare,item=c.choices[index],picks=$('comparePicks'),chat=$('compareChat');if(!item||!picks||!chat)return;
  clearCompareDemoTimers();const run=++compareDemoRun;
  picks.querySelectorAll('[data-compare-choice]').forEach((b,i)=>b.classList.toggle('active',i===index));
  chat.innerHTML=`<div class="compare-message user">${esc(item.prompt)}</div><div class="compare-thinking"><span class="thinking-dots"><i></i><i></i><i></i></span><span>${esc(c.thinking)}</span></div>`;
  const delay=window.matchMedia('(prefers-reduced-motion: reduce)').matches?120:650;
  compareDemoTimers.push(setTimeout(()=>{
    if(run!==compareDemoRun||!chat.isConnected)return;
    chat.innerHTML=`<div class="compare-message user">${esc(item.prompt)}</div><div class="compare-message assistant"><div class="compare-answer-text" id="compareAnswerText"></div><div class="compare-answer-meta"><span>${esc(c.modelLabel)}: <b>${esc(item.model)}</b></span><span>•</span><span>${esc(c.speedLabel)}: <b>${esc(item.speed)}</b></span></div></div>`;
    compareType($('compareAnswerText'),item.answer,run,10);
  },delay));
}
function updateIntroLanguage(){
  const ar=lang==='ar',set=(id,text)=>{const el=$(id);if(el)el.textContent=text};
  const intro=$('introScreen');if(intro){intro.setAttribute('aria-label',ar?'مرحبًا بك في AiWay':'Welcome to AiWay');intro.dir=ar?'rtl':'ltr'}
  set('introEyebrow',ar?'✦ مساحة ذكاء اصطناعي واحدة لكل ما تريد إنجازه':'✦ Practical AI tools powered by Pi');
  const title=$('introTitle');if(title)title.innerHTML=ar?'كل قوة الذكاء الاصطناعي<br><span>بطريقة أبسط وأذكى.</span>':'The power of AI<br><span>made beautifully simple.</span>';
  set('introCopy',ar?'ابدأ بما تريد إنجازه — دردشة، صور، ملفات، ترجمة أو برمجة — ودع AiWay يحول فكرتك إلى نتيجة بسرعة.':'Write, summarize, code, analyze files, and create images with the right model for your task.');
  set('introStartText',ar?'استعراض الأدوات':'Explore tools');set('introHeroPackagesText',ar?'عرض الباقات':'View packages');
  set('introFreeNote',ar?'10 استخدامات مجانية عند تسجيل الدخول لأول مرة — بدون دفع':'10 free uses on your first sign-in — no payment required');
  set('introToolHead',ar?'ابدأ بالمهمة التي تريدها':'Start with the task you need');set('introToolSub',ar?'الموقع يختار نموذجًا مناسبًا وموفرًا تلقائيًا':'AiWay automatically chooses a suitable, cost-efficient model');
  set('howTitle',ar?'كيف يعمل؟':'How it works');set('compactStep1',ar?'اختر الأداة':'Choose a tool');set('compactStep2',ar?'اكتب طلبك':'Write your request');set('compactStep3',ar?'استلم النتيجة وادفع حسب الاستخدام الفعلي':'Get the result and pay by actual usage');
  set('ctaTitle',ar?'ابدأ مجانًا بحساب Pi':'Start free with your Pi account');set('ctaCopy',ar?'تسجيل دخول واحد للمستخدم الجديد والقديم، بدون نموذج إنشاء حساب منفصل.':'One Pi sign-in for new and returning users, with no separate sign-up form.');set('ctaButton',ar?'استعراض كل الأدوات':'Explore all tools');set('introFooter',ar?'AiWay — أدوات متعددة، تجربة واحدة بسيطة.':'AiWay — multiple tools, one simple experience.');
  set('introToolsLink',ar?'الأدوات':'Tools');set('introPackagesLink',ar?'الباقات':'Packages');set('introLoginLabel',auth?(ar?'متصل بحساب Pi':'Pi connected'):(ar?'تسجيل الدخول':'Sign in'));
  set('topToolsLabel',ar?'كل الأدوات':'All tools');set('topLoginLabel',auth?(ar?'متصل':'Connected'):(ar?'تسجيل الدخول':'Sign in'));
  const b=$('introLanguageBtn');if(b){b.textContent=ar?'EN':'AR';b.setAttribute('aria-label',ar?'Switch to English':'التبديل إلى العربية')}
}

const TASK_ICONS={
 coding:`<svg viewBox="0 0 48 48" fill="none"><path d="m17 14-10 10 10 10M31 14l10 10-10 10M28 8 20 40" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 summary:`<svg viewBox="0 0 48 48" fill="none"><rect x="9" y="6" width="30" height="36" rx="6" stroke="currentColor" stroke-width="3"/><path d="M16 17h16M16 24h16M16 31h10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="m29 34 3 3 6-7" stroke="currentColor" stroke-width="2.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 image:`<svg viewBox="0 0 48 48" fill="none"><rect x="6" y="8" width="36" height="32" rx="7" stroke="currentColor" stroke-width="3"/><circle cx="17" cy="18" r="4" stroke="currentColor" stroke-width="3"/><path d="m10 35 10-10 7 7 5-5 7 8" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M36 5v8M32 9h8" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
 ads:`<svg viewBox="0 0 48 48" fill="none"><path d="M8 28V16l27-8v28L8 28Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M35 17h5a4 4 0 0 1 0 8h-5M13 29l3 12h9l-5-10" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M11 20h11" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/></svg>`,
 writing:`<svg viewBox="0 0 48 48" fill="none"><path d="M10 37h8L39 16a5 5 0 0 0-7-7L11 30l-1 7Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="m28 13 7 7M9 42h30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>`,
 translate:`<svg viewBox="0 0 48 48" fill="none"><path d="M7 10h21M17 6v4M12 15c4 8 9 13 17 17M25 15c-3 8-9 14-17 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="m28 40 7-18 7 18M31 33h9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 study:`<svg viewBox="0 0 48 48" fill="none"><path d="m5 18 19-10 19 10-19 10L5 18Z" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M12 23v10c7 6 17 6 24 0V23M43 19v13" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 business:`<svg viewBox="0 0 48 48" fill="none"><rect x="7" y="14" width="34" height="27" rx="5" stroke="currentColor" stroke-width="3"/><path d="M17 14V9h14v5M7 24h34M20 24v4h8v-4" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};
const TASKS={
 coding:{ar:['البرمجة','اكتب الكود، أصلح الأخطاء واشرح الحلول التقنية.','مساعد برمجة اقتصادي ودقيق'],en:['Coding','Write code, fix bugs, and explain technical solutions.','Cost-efficient coding assistant']},
 summary:{ar:['التلخيص','لخّص الملفات والنصوص إلى نقاط وقرارات واضحة.','تلخيص وتحليل المستندات'],en:['Summarization','Turn files and long text into clear points and decisions.','Document summary and analysis']},
 image:{ar:['إنشاء الصور','حوّل وصفك إلى صورة بالذكاء الاصطناعي.','إنشاء صور بالذكاء الاصطناعي'],en:['Image creation','Turn your description into an AI-generated image.','AI image generation']},
 ads:{ar:['الإعلانات والتسويق','أنشئ إعلانات ومنشورات وخططًا تسويقية مقنعة.','كتابة إعلانية وتسويق'],en:['Ads & marketing','Create persuasive ads, posts, and marketing plans.','Marketing and ad copy']},
 writing:{ar:['الكتابة وصناعة المحتوى','اكتب مقالات ورسائل ووصف منتجات بأسلوب احترافي.','كتابة احترافية'],en:['Writing & content','Create articles, messages, and product descriptions.','Professional writing']},
 translate:{ar:['الترجمة','ترجم النصوص مع الحفاظ على المعنى والأسلوب.','ترجمة دقيقة وطبيعية'],en:['Translation','Translate while preserving meaning, tone, and context.','Natural accurate translation']},
 study:{ar:['الدراسة والشرح','اشرح الدروس، جهّز أسئلة وساعدك على الفهم.','مدرس ذكي مبسط'],en:['Study & explain','Explain lessons, create questions, and help you learn.','Clear AI tutor']},
 business:{ar:['الأعمال والأفكار','طوّر أفكار المشاريع والخطط والعروض العملية.','مساعد أعمال وتخطيط'],en:['Business & ideas','Develop business ideas, plans, and practical proposals.','Business planning assistant']},
 'all-models':{ar:['وضع المحترف','اختر نموذج الذكاء الاصطناعي بنفسك وتحكم في تجربتك.','اختيار يدوي للنموذج'],en:['Pro Mode','Choose the AI model yourself and take full control.','Manual model selection']}
};
let visibleTaskIds=null;
function isTaskVisible(id){return Boolean(TASKS[id])&&(!visibleTaskIds||visibleTaskIds.has(id))&&!(id==='image'&&window.aiwayFeatureFlags?.images===false)}
let activeTask=storageGet('aiway_active_task','');if(activeTask==='smart'){activeTask='';storageRemove('aiway_active_task');}storageRemove('aiway_smart_profile');function taskText(id){return TASKS[id]?.[lang]||TASKS[id]?.en||['AiWay','','']}
function renderTaskScreen(){
  const grid=$('taskGrid');if(!grid)return;
  const core=['writing','coding','image','summary'].filter(isTaskVisible);
  const more=Object.keys(TASKS).filter(id=>isTaskVisible(id)&&!core.includes(id)&&id!=='all-models');
  const card=id=>{const t=taskText(id),locked=Boolean((!userProfile||!userProfile.has_purchased)&&['coding','image'].includes(id));return `<button class="task-card ${locked?'trial-locked '+(lang==='ar'?'lock-left':'lock-right'):''}" type="button" data-task="${id}" aria-disabled="${locked}"><span class="task-card-icon">${TASK_ICONS[id]||ICONS.sparkles}</span><span class="task-card-copy"><b>${esc(t[0])}</b><small>${esc(t[1])}</small></span></button>`};
  const pro=isTaskVisible('all-models')?`<button class="task-pro-card" type="button" data-task="all-models"><span class="task-pro-badge">PRO</span><span class="task-card-icon">${ICONS.sparkles||''}</span><span class="task-card-copy"><b>${esc(taskText('all-models')[0])}</b><small>${esc(taskText('all-models')[1])}</small></span><span class="task-pro-arrow">›</span></button>`:'';
  grid.innerHTML=`<div class="task-core-grid">${core.map(card).join('')}</div>${more.length?`<button class="task-more-toggle" id="taskMoreToggle" type="button" aria-expanded="false"><span>${lang==='ar'?'عرض كل الأدوات':'Show all tools'}</span><b>⌄</b></button><div class="task-more-grid" id="taskMoreGrid">${more.map(card).join('')}</div>`:''}<div class="task-pro-wrap"><div class="task-section-label">${lang==='ar'?'للمستخدم المتقدم':'For advanced users'}</div>${pro}</div>`;
  $('taskMoreToggle')?.addEventListener('click',()=>{const btn=$('taskMoreToggle'),moreGrid=$('taskMoreGrid'),open=moreGrid?.classList.toggle('open');btn?.setAttribute('aria-expanded',open?'true':'false');if(btn)btn.querySelector('span').textContent=open?(lang==='ar'?'إخفاء الأدوات':'Hide tools'):(lang==='ar'?'عرض كل الأدوات':'Show all tools')});
  $('taskKicker').textContent=lang==='ar'?'✦ اختر المهمة واترك اختيار النموذج لـ AiWay':'✦ Pick a task and let AiWay choose the model';
  $('taskTitle').innerHTML=lang==='ar'?'ماذا تريد أن <span>تنجز؟</span>':'What do you want to <span>get done?</span>';
  $('taskCopy').textContent=lang==='ar'?'ابدأ بأداة بسيطة. AiWay يختار النموذج المناسب تلقائيًا، أو استخدم وضع المحترف للاختيار بنفسك.':'Start with a simple tool. AiWay chooses a suitable model automatically, or use Pro Mode to choose it yourself.';
  $('taskFooter').textContent=lang==='ar'?'اختر الأداة المناسبة، أو استخدم وضع المحترف عندما تريد اختيار النموذج بنفسك.':'Choose the right tool, or use Pro Mode when you want to select the model yourself.';
  if($('taskLanguageBtn')){$('taskLanguageBtn').textContent=lang==='ar'?'EN':'AR';$('taskLanguageBtn').setAttribute('aria-label',lang==='ar'?'Switch to English':'التبديل إلى العربية')}
  updateTaskContext()
}
function openTaskScreen(){$('taskScreen')?.classList.add('open');document.body.classList.add('task-mode');closeMenu();renderTaskScreen();refreshGlobalAnnouncement()}
function closeTaskScreen(){$('taskScreen')?.classList.remove('open');document.body.classList.remove('task-mode');try{$('prompt')?.blur()}catch{}refreshGlobalAnnouncement()}
function chooseTaskModel(id){if(userProfile&&!userProfile.has_purchased&&id!=='image')return 'openrouter/free';if(id==='image'){const list=(window.aiwayImageModels||[]).filter(m=>!m.locked&&!m.isFree).sort(compareCostAsc);return list[0]?.id||''}return 'aiway/auto'}
function selectTask(id){if(!isTaskVisible(id))return;if((!userProfile||!userProfile.has_purchased)&&['coding','image'].includes(id)){toast(lang==='ar'?'هذه الأداة تتفعل بعد أول عملية شراء.':'This tool unlocks after your first purchase.');return;}activeTask=id;storageSet('aiway_active_task',id);const modelId=chooseTaskModel(id);if(modelId&&$('model')){$('model').value=modelId;updateModelTrigger();syncModelMode()}current=null;history=[];closeTaskScreen();updateTaskContext();render();setTimeout(()=>{try{$('prompt')?.blur()}catch{}},50)}
function updateTaskContext(){const t=taskText(activeTask),allModels=activeTask==='all-models',imageTask=activeTask==='image';document.body.classList.toggle('all-models-active',allModels);document.body.classList.toggle('image-task-active',imageTask);if($('taskContext'))$('taskContext').style.setProperty('display',allModels?'none':'flex','important');if($('modelWrap'))$('modelWrap').style.setProperty('display',allModels?'block':'none','important');if($('taskContextName'))$('taskContextName').textContent=activeTask?t[0]:'AiWay';if($('taskContextHint'))$('taskContextHint').textContent=activeTask?t[2]:(lang==='ar'?'اختر مهمة للبدء':'Choose a task to start');if($('taskContextIcon'))$('taskContextIcon').innerHTML=TASK_ICONS[activeTask]||ICONS.sparkles;if($('taskChangeBtn'))$('taskChangeBtn').textContent=lang==='ar'?'تغيير الأداة':'Change tool';if($('prompt')&&activeTask)$('prompt').placeholder=activeTask==='image'?(lang==='ar'?'صف الصورة التي تريد إنشاءها...':'Describe the image you want to create...'):(lang==='ar'?`اكتب طلبك في ${t[0]}...`:`Enter your ${t[0].toLowerCase()} request...`)}

function positionSigninGuide(){const guide=$('signinGuide'),menu=$('menuBtn');if(!guide||!menu)return;const r=menu.getBoundingClientRect();guide.style.top=Math.round(r.bottom+12)+'px';const width=guide.offsetWidth||280;let left=Math.min(Math.max(8,r.right-width),window.innerWidth-width-8);guide.style.left=Math.round(left)+'px';const arrow=Math.min(Math.max(18,r.left+r.width/2-left),width-18);guide.style.setProperty('--guide-arrow-left',Math.round(arrow)+'px')}
function dismissSigninGuide(){clearTimeout(showSigninGuide._timer);$('signinGuide')?.classList.remove('show');$('menuBtn')?.classList.remove('signin-pulse')}
function showSigninGuide(){if(auth)return;const guide=$('signinGuide'),menu=$('menuBtn');if(!guide||!menu)return;updateIntroLanguage();guide.classList.add('show');menu.classList.add('signin-pulse');requestAnimationFrame(positionSigninGuide);clearTimeout(showSigninGuide._timer);showSigninGuide._timer=setTimeout(()=>guide.classList.remove('show'),9000)}
function enterChat(){const intro=$('introScreen');intro?.classList.add('hide');setTimeout(()=>intro?.remove(),650);openTaskScreen();if(!auth)setTimeout(showSigninGuide,500)}
async function init(){
  applyLanguage();updateSupportLabels();render();
  const startOptionalServices=()=>{initPi();startPiBridgePolling()};if('requestIdleCallback' in window)requestIdleCallback(startOptionalServices,{timeout:1200});else setTimeout(startOptionalServices,250);
  let externalSignedIn=false;
  try{externalSignedIn=await finishExternalPiSignIn();if(externalSignedIn)return}catch(e){console.error(e);toast(friendlyClientError(e,lang==='ar'?'تعذر إكمال تسجيل الدخول بحساب Pi. حاول مرة أخرى.':'Could not complete Pi sign-in. Try again.').message)}
  const modelsTask=loadModels().catch(e=>toast(friendlyClientError(e,lang==='ar'?'تعذر تحميل النماذج الآن. حاول مرة أخرى.':'Models could not be loaded right now. Please try again.').message));
  if(auth){
    $('signinGuide')?.classList.remove('show');$('menuBtn')?.classList.remove('signin-pulse');
    const accountTask=refreshMe().catch(e=>{throw e});
    const chatsTask=new Promise(resolve=>setTimeout(resolve,0)).then(()=>loadChats());
    try{await Promise.all([accountTask,chatsTask]);startSupportPolling()}catch(e){toast(friendlyClientError(e,lang==='ar'?'تعذر تحميل بيانات حسابك. تحقق من الاتصال ثم أعد المحاولة.':'Your account data could not be loaded. Check your connection and try again.').message)}
  }
  await modelsTask;
}

async function recoverIncompletePayment(payment,{silent=false}={}){
  const paymentId=payment?.identifier||payment?.paymentId||payment?.id;
  const txid=payment?.transaction?.txid||payment?.txid;
  if(!paymentId){if(!silent)toast(lang==='ar'?'لم يتم العثور على معرّف الدفعة':'Payment ID was not found');return false}
  try{
    const result=await api('/api/payment-complete',{method:'POST',body:JSON.stringify({paymentId,txid:txid||null,resolvePending:true})});
    await Promise.all([refreshMe(),loadModels()]);
    if(!silent)toast(result?.cancelled?(lang==='ar'?'تم إلغاء الدفعة القديمة غير المدفوعة ويمكنك المحاولة من جديد':'The old unpaid payment was cancelled; you can try again'):(lang==='ar'?'تم إنهاء الدفعة المعلقة وإضافة الرصيد':'Pending payment completed and balance added'));
    return true;
  }catch(e){
    console.warn('Incomplete payment recovery:',e);
    if(!silent)toast(friendlyClientError(e,lang==='ar'?'تعذر إنهاء الدفعة المعلقة. حاول مرة أخرى.':'Could not resolve the pending payment. Try again.').message);
    return false;
  }
}
async function authenticatePiForPayments({refreshSession=true,silentRecovery=true,requirePendingResolved=false}={}){
  if(!piReady||!window.Pi?.authenticate)throw makeUiError(lang==='ar'?'افتح الموقع من Pi Browser وانتظر اكتمال تحميل خدمة Pi.':'Open the site in Pi Browser and wait for the Pi service to finish loading.','PI_BROWSER_REQUIRED');
  const pendingPayments=[];
  const result=await Pi.authenticate(['username','payments'],payment=>{if(payment)pendingPayments.push(payment)});
  if(!result?.accessToken)throw makeUiError(lang==='ar'?'لم تُرجع Pi بيانات تسجيل الدخول. أعد فتح الموقع داخل Pi Browser وحاول مرة أخرى.':'Pi did not return sign-in data. Reopen the site in Pi Browser and try again.','PI_LOGIN_FAILED');
  if(refreshSession){const data=await api('/api/pi-login',{method:'POST',body:JSON.stringify({accessToken:result.accessToken,user:result.user||null})});auth=data;storeAuthSession(auth);startSupportPolling()}
  const outcomes=[];
  for(const payment of pendingPayments){
    try{outcomes.push(await recoverIncompletePayment(payment,{silent:silentRecovery}))}
    catch(error){console.warn('Pending payment resolution failed:',error);outcomes.push(false)}
  }
  const resolved=outcomes.filter(Boolean).length;
  const unresolved=outcomes.length-resolved;
  if(requirePendingResolved&&unresolved>0)throw makeUiError(lang==='ar'?'تعذر إنهاء الدفعة السابقة بأمان. أعد فتح Pi Browser ثم حاول مرة أخرى.':'The previous payment could not be safely resolved. Reopen Pi Browser and try again.','PAYMENT_PENDING');
  return {result,recovered:resolved,pendingFound:outcomes.length};
}
function setLoginBusy(busy){
 const ids=['loginBtn','topLoginBtn','introLoginBtn','continuePiSignin','piSignInBtn'];
 ids.forEach(id=>{const el=$(id);if(!el)return;el.classList.toggle('login-busy',Boolean(busy));el.disabled=Boolean(busy);el.setAttribute('aria-busy',busy?'true':'false')});
 const labels=['topLoginLabel','introLoginLabel','continuePiSigninText','piBrowserLoginLabel'];
 if(busy)labels.forEach(id=>{const el=$(id);if(el){el.dataset.beforeBusy=el.textContent;el.textContent=lang==='ar'?'جارٍ قراءة بيانات الحساب…':'Reading account data…'}});
 else labels.forEach(id=>{const el=$(id);if(el&&el.dataset.beforeBusy){el.textContent=el.dataset.beforeBusy;delete el.dataset.beforeBusy}});
}
async function login(){
 if(auth){toast(lang==='ar'?'أنت مسجل بالفعل':'You are already signed in');return true}
 setLoginBusy(true);setAuthProgress('connect',true);
 try{
  if(!isPiBrowser()){setAuthProgress('connect',false);openPiSigninModal();return false}
  $('profileState').innerHTML='<span class="loading-dot"></span> <span class="loading-dot"></span> <span class="loading-dot"></span>';
  await authenticatePiForPayments({refreshSession:true,silentRecovery:true});setAuthProgress('account',true);showChatsSkeleton();
  const refreshPromise=refreshMe().then(v=>{setAuthProgress('sync',true);return v});
  await Promise.all([refreshPromise,loadModels(),loadChats()]);dismissSigninGuide();setAuthProgress('done',true);setTimeout(()=>setAuthProgress('done',false),850);
  toast(userProfile?.has_purchased?(lang==='ar'?'تم تسجيل الدخول بنجاح':'Signed in successfully'):(lang==='ar'?`مرحبًا بك — لديك ${userProfile?.free_trial_tokens ?? userProfile?.trial_messages_remaining ?? 0} توكين مجاني`:`Welcome — you have ${userProfile?.free_trial_tokens ?? userProfile?.trial_messages_remaining ?? 0} free tokens`));
  return true;
 }catch(e){console.error(e);setAuthProgress('connect',false);$('profileState').textContent=lang==='ar'?'تعذر تسجيل الدخول':'Could not sign in';toast(friendlyClientError(e,lang==='ar'?'تعذر تسجيل الدخول بحساب Pi. أعد المحاولة داخل Pi Browser.':'Pi sign-in failed. Try again inside Pi Browser.').message);return false}
 finally{setLoginBusy(false);renderAccountState()}
}
const LOCAL_CACHE_DB='aiway-smart-cache',LOCAL_CACHE_VERSION=1,MAX_LOCAL_IMAGES=80,MAX_LOCAL_IMAGE_BYTES=150*1024*1024,MAX_LOCAL_CONVERSATIONS=40;
let localCacheDbPromise=null;const localImageObjectUrls=new Set();
function localCacheUser(){return String(userProfile?.username||'').trim().toLowerCase()||null}
function openLocalCache(){
  if(!('indexedDB'in window))return Promise.reject(new Error('IndexedDB unavailable'));
  if(localCacheDbPromise)return localCacheDbPromise;
  localCacheDbPromise=new Promise((resolve,reject)=>{const q=indexedDB.open(LOCAL_CACHE_DB,LOCAL_CACHE_VERSION);q.onupgradeneeded=()=>{const db=q.result;if(!db.objectStoreNames.contains('conversations'))db.createObjectStore('conversations',{keyPath:'key'});if(!db.objectStoreNames.contains('images'))db.createObjectStore('images',{keyPath:'key'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)});
  return localCacheDbPromise;
}
async function localCacheGet(store,key){try{const db=await openLocalCache();return await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readonly'),q=tx.objectStore(store).get(key);q.onsuccess=()=>resolve(q.result||null);q.onerror=()=>reject(q.error)})}catch{return null}}
async function localCachePut(store,value){try{const db=await openLocalCache();await new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});return true}catch{return false}}
async function localCacheDeleteUser(username){if(!username)return;try{const db=await openLocalCache();for(const storeName of ['conversations','images'])await new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite'),store=tx.objectStore(storeName),q=store.openCursor();q.onsuccess=()=>{const cursor=q.result;if(!cursor)return;String(cursor.value?.user||'')===username?cursor.delete():null;cursor.continue()};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}catch{}}
async function pruneLocalCache(){const username=localCacheUser();if(!username)return;try{const db=await openLocalCache();const trim=async(storeName,maxCount,maxBytes=Infinity)=>new Promise((resolve,reject)=>{const tx=db.transaction(storeName,'readwrite'),store=tx.objectStore(storeName),items=[],q=store.openCursor();q.onsuccess=()=>{const cursor=q.result;if(cursor){if(cursor.value?.user===username)items.push(cursor.value);cursor.continue();return}items.sort((a,b)=>(b.accessed||0)-(a.accessed||0));let bytes=0;items.forEach((item,index)=>{bytes+=Number(item.size||0);if(index>=maxCount||bytes>maxBytes)store.delete(item.key)})};tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)});await trim('conversations',MAX_LOCAL_CONVERSATIONS);await trim('images',MAX_LOCAL_IMAGES,MAX_LOCAL_IMAGE_BYTES)}catch{}}
function conversationLocalKey(id){const user=localCacheUser();return user?`${user}:conversation:${id}`:null}
function imageLocalKey(id){const user=localCacheUser();return user&&id?`${user}:image:${id}`:null}
async function readLocalConversation(id){const key=conversationLocalKey(id);if(!key)return null;const item=await localCacheGet('conversations',key);if(item){item.accessed=Date.now();localCachePut('conversations',item)}return item||null}
async function saveLocalConversation(id,data,images){const key=conversationLocalKey(id);if(!key||!data?.conversation)return;let storedImages=Array.isArray(images)?images:null;if(storedImages===null){const previous=await localCacheGet('conversations',key);storedImages=Array.isArray(previous?.images)?previous.images:[]}localCachePut('conversations',{key,user:localCacheUser(),conversationId:id,data,images:storedImages,updated:Date.now(),accessed:Date.now()}).then(()=>pruneLocalCache())}
async function readLocalImage(imageId){const key=imageLocalKey(imageId);if(!key)return null;const item=await localCacheGet('images',key);if(item?.blob){item.accessed=Date.now();localCachePut('images',item);return item.blob}return null}
function saveLocalImage(imageId,blob){const key=imageLocalKey(imageId);if(!key||!blob||!blob.size)return;localCachePut('images',{key,user:localCacheUser(),imageId,blob,size:blob.size,accessed:Date.now(),created:Date.now()}).then(()=>pruneLocalCache())}
function clearLocalImageUrls(){for(const url of localImageObjectUrls)URL.revokeObjectURL(url);localImageObjectUrls.clear()}
function logout(show=true){const username=localCacheUser();conversationCoreCache.clear();conversationCoreRequests.clear();clearLocalImageUrls();localCacheDeleteUser(username);auth=null;userProfile=null;current=null;history=[];storeAuthSession(null);$('profileName').textContent=I18N[lang].guest;$('profileState').textContent=I18N[lang].signPi;setBalanceDisplay(0);$('chats').innerHTML='';$('loginBtn').querySelector('span:last-child').textContent=I18N[lang].login;render();if(show)toast(lang==='ar'?'تم تسجيل الخروج':'Signed out')}
async function refreshMe(){const d=await api('/api/me');userProfile=d.user;window.aiwayUsageSummary=d.usageSummary||{};renderAccountState();renderUsageSummary()}
const conversationCoreCache=new Map(),conversationCoreRequests=new Map();
function fetchConversationCore(id,{force=false}={}){
  if(!force&&conversationCoreCache.has(id))return Promise.resolve(conversationCoreCache.get(id));
  if(!force&&conversationCoreRequests.has(id))return conversationCoreRequests.get(id);
  const request=api('/api/conversations?id='+encodeURIComponent(id)+'&includeImages=0').then(data=>{conversationCoreCache.set(id,data);saveLocalConversation(id,data);return data}).finally(()=>conversationCoreRequests.delete(id));
  conversationCoreRequests.set(id,request);return request;
}
function prefetchConversationCore(id){
  const run=()=>fetchConversationCore(id).catch(()=>{});
  if('requestIdleCallback'in window)requestIdleCallback(run,{timeout:900});else setTimeout(run,120);
}
async function loadChats(){
  showChatsSkeleton();
  try{
    const d=await api('/api/conversations');
    const box=$('chats');
    box.innerHTML=(d.conversations||[]).map(c=>{const imageChat=c.taskId==='image';const badge=imageChat?`<small class="chat-kind-badge">${lang==='ar'?'صور':'Images'}</small>`:'';return `<div class="chat-item ${imageChat?'image-chat':''} ${c.id===current?'active':''}" data-id="${esc(c.id)}" data-task="${esc(c.taskId||'')}"><span class="chat-kind-icon">${TASK_ICONS[c.taskId]||ICONS.chat}</span><span class="chat-title-wrap"><span>${esc(c.title)}</span>${badge}</span><button class="chat-delete" data-delete="${esc(c.id)}" title="${lang==='ar'?'حذف الدردشة':'Delete chat'}">×</button></div>`}).join('');
    box.querySelectorAll('.chat-item').forEach(b=>{b.onclick=e=>{if(!e.target.closest('[data-delete]')){if(TASKS[b.dataset.task]){activeTask=b.dataset.task;storageSet('aiway_active_task',activeTask);updateTaskContext()}openChat(b.dataset.id)}};b.onpointerenter=()=>prefetchConversationCore(b.dataset.id)});
    box.querySelectorAll('[data-delete]').forEach(b=>b.onclick=e=>{e.stopPropagation();deleteChat(b.dataset.delete)});
  }catch(error){
    const box=$('chats');if(box&&!box.querySelector('.chat-item'))box.innerHTML=`<div class="chat-load-error">${lang==='ar'?'تعذر تحميل المحادثات':'Could not load chats'}</div>`;throw error;
  }finally{clearChatsLoading()}
}
async function newChat(){current=null;history=[];render();closeMenu();openTaskScreen();try{if(auth)await loadChats()}catch(e){toast(friendlyClientError(e,lang==='ar'?'تعذر تحديث قائمة الدردشات. يمكنك بدء المحادثة الآن.':'The chat list could not be refreshed. You can still start chatting.').message)}}
let chatOpenSequence=0,deferHistoricalImages=false;
function applyConversationCore(data,sequence){
  if(sequence!==chatOpenSequence||!data?.conversation)return false;
  history=(data.conversation.messages||[]).map(m=>({...m,attachments:m.token_usage?.attachments||[],usedWebSearch:Boolean(m.token_usage?.webSearch),generatedImage:null}));
  const savedTask=(data.conversation.messages||[]).find(m=>m.token_usage?.taskId)?.token_usage?.taskId;
  if(TASKS[savedTask]){activeTask=savedTask;storageSet('aiway_active_task',activeTask);updateTaskContext()}
  $('model').value=data.conversation.model_id||$('model').value;
  render();return true;
}
async function openChat(id){
  const sequence=++chatOpenSequence;
  const cached=conversationCoreCache.get(id);
  clearLocalImageUrls();current=id;history=[];closeMenu();
  if(cached)applyConversationCore(cached,sequence);else render();
  document.querySelectorAll('.chat-item').forEach(item=>item.classList.toggle('active',item.dataset.id===id));
  const localTask=readLocalConversation(id);
  if(!cached){
    const local=await Promise.race([localTask,new Promise(resolve=>setTimeout(()=>resolve(null),90))]);
    if(local?.data&&sequence===chatOpenSequence){conversationCoreCache.set(id,local.data);applyConversationCore(local.data,sequence);if(local.images?.length)applyConversationImages(local.images,id,sequence,true)}
  }
  try{
    const d=await fetchConversationCore(id,{force:true});
    if(!applyConversationCore(d,sequence))return;
    loadConversationImages(id,sequence);
    loadChats().catch(e=>console.warn('Chat list refresh failed',e));
  }catch(e){if(sequence===chatOpenSequence&&!history.length)toast(friendlyClientError(e,lang==='ar'?'تعذر فتح الدردشة. حاول مرة أخرى.':'The chat could not be opened. Please try again.').message)}
}
function applyConversationImages(images,id,sequence,fromCache=false){
  if(sequence!==chatOpenSequence||current!==id)return false;
  const byMessage=new Map();for(const image of images||[]){if(!byMessage.has(image.message_id))byMessage.set(image.message_id,image)}
  let changed=false;history=history.map(message=>{const image=byMessage.get(message.id);if(!image)return message;changed=true;return {...message,generatedImage:image}});
  if(!changed)return false;deferHistoricalImages=true;render();deferHistoricalImages=false;hydrateDeferredChatImages(sequence);return true;
}
async function loadConversationImages(id,sequence){
  try{
    const d=await api('/api/conversations?id='+encodeURIComponent(id)+'&imagesOnly=1');
    if(sequence!==chatOpenSequence||current!==id)return;
    const core=conversationCoreCache.get(id);saveLocalConversation(id,core,d.images||[]);
    applyConversationImages(d.images||[],id,sequence);
  }catch(e){console.warn('Conversation images could not be loaded',e)}
}
const TASK_SUGGESTIONS={
 coding:{ar:[['إنشاء صفحة ويب','اكتب صفحة HTML متجاوبة لمشروع...'],['إصلاح خطأ','راجع هذا الكود وحدد سبب الخطأ:'],['شرح كود','اشرح هذا الكود خطوة بخطوة:']],en:[['Build a web page','Create a responsive HTML page for...'],['Fix a bug','Review this code and find the issue:'],['Explain code','Explain this code step by step:']]},
 summary:{ar:[['تلخيص مستند','لخص المستند في نقاط رئيسية وقرارات.'],['ملخص تنفيذي','أنشئ ملخصًا تنفيذيًا قصيرًا للنص التالي:'],['استخراج المهام','استخرج المهام والمواعيد والأسماء من النص:']],en:[['Summarize a document','Summarize the document into key points and decisions.'],['Executive summary','Create a short executive summary of:'],['Extract action items','Extract tasks, dates, and names from:']]},
 image:{ar:[['صورة إعلان','أنشئ صورة إعلان احترافية لمنتج...'],['شعار بسيط','صمم شعارًا عصريًا وبسيطًا لمشروع...'],['منشور اجتماعي','أنشئ صورة لمنشور سوشيال ميديا عن...']],en:[['Ad image','Create a professional advertising image for...'],['Simple logo','Design a modern minimalist logo for...'],['Social post','Create a social media visual about...']]},
 ads:{ar:[['إعلان منتج','اكتب إعلانًا مقنعًا لمنتج...'],['خطة حملة','أنشئ خطة حملة تسويقية لمدة 7 أيام لـ...'],['منشورات اجتماعية','اكتب 3 منشورات مختلفة للترويج لـ...']],en:[['Product ad','Write a persuasive ad for...'],['Campaign plan','Create a 7-day marketing campaign for...'],['Social posts','Write 3 different promotional posts for...']]},
 writing:{ar:[['مقال احترافي','اكتب مقالًا منظمًا عن...'],['وصف منتج','اكتب وصف منتج واضحًا ومقنعًا لـ...'],['إعادة صياغة','أعد صياغة النص التالي بأسلوب احترافي:']],en:[['Professional article','Write a structured article about...'],['Product description','Write a clear persuasive description for...'],['Rewrite text','Rewrite the following professionally:']]},
 translate:{ar:[['ترجمة للعربية','ترجم النص التالي إلى العربية الطبيعية:'],['ترجمة للإنجليزية','ترجم النص التالي إلى الإنجليزية الطبيعية:'],['ترجمة رسمية','ترجم النص التالي بأسلوب رسمي مع الحفاظ على المعنى:']],en:[['Translate to Arabic','Translate the following into natural Arabic:'],['Translate to English','Translate the following into natural English:'],['Formal translation','Translate formally while preserving meaning:']]},
 study:{ar:[['شرح درس','اشرح لي هذا الموضوع ببساطة وبالأمثلة:'],['أسئلة تدريبية','أنشئ 10 أسئلة تدريبية مع الإجابات عن...'],['خطة مذاكرة','أنشئ خطة مذاكرة لمدة أسبوع لمادة...']],en:[['Explain a lesson','Explain this topic simply with examples:'],['Practice questions','Create 10 practice questions with answers about...'],['Study plan','Create a one-week study plan for...']]},
 business:{ar:[['فكرة مشروع','حلل فكرة المشروع التالية وحدد المخاطر:'],['خطة عمل','أنشئ خطة عمل مختصرة لمشروع...'],['تحليل منافسين','أنشئ إطارًا لتحليل منافسي مشروع...']],en:[['Business idea','Analyze this business idea and identify risks:'],['Business plan','Create a concise business plan for...'],['Competitor analysis','Create a competitor-analysis framework for...']]}
};
function taskSuggestions(){return TASK_SUGGESTIONS[activeTask]?.[lang]||TASK_SUGGESTIONS.business[lang]}
function welcome(){const en=lang==='en',t=taskText(activeTask),suggestions=taskSuggestions();return `<div class="welcome"><div class="hero-icon">${activeTask?(TASK_ICONS[activeTask]||ICONS.sparkles):'<img src="/aiway-logo.png" alt="AiWay">'}</div>${activeTask?`<span class="welcome-task-label">${esc(t[0])}</span>`:''}<h1>${activeTask?(en?`What would you like to do with ${esc(t[0])}?`:`كيف أساعدك في ${esc(t[0])}؟`):(en?'How can I help you today?':'كيف أقدر أساعدك اليوم؟')}</h1><p>${activeTask?esc(t[1]):(en?'Choose a task and AiWay will select a suitable paid model automatically.':'اختر مهمة وسيختار AiWay تلقائيًا نموذجًا مدفوعًا مناسبًا بأقل تكلفة ممكنة.')}</p><div class="suggestions">${suggestions.map((x,i)=>`<button class="suggestion" data-prompt="${esc(x[1])}"><span class="sicon">${TASK_ICONS[activeTask]||ICONS.sparkles}</span><span><b>${esc(x[0])}</b><small>${esc(x[1])}</small></span></button>`).join('')}</div></div>`}


function enhanceRenderedCodeBlocks(root=$('messages')){
  root.querySelectorAll('pre').forEach(pre=>{
    if(pre.dataset.enhanced)return;
    pre.dataset.enhanced='1';
    const code=pre.querySelector('code');
    const match=(code?.className||'').match(/language-([^\s]+)/);
    const rawLanguage=match?.[1]||'code';const fileMatch=rawLanguage.match(/^file-(.+)$/);const isPptx=rawLanguage==='pptx-json';
    const language=pre.dataset.codeLabel||(fileMatch?'code':(isPptx?'PowerPoint':rawLanguage));
    const head=document.createElement('div');
    head.className='code-head';
    const label=document.createElement('span');
    label.textContent=language;
    const button=document.createElement('button');
    button.type='button';
    button.className='code-copy';
    button.textContent=lang==='ar'?'نسخ':'Copy';
    button.onclick=async()=>{
      try{
        await navigator.clipboard.writeText(code?.textContent||pre.textContent||'');
        button.textContent=lang==='ar'?'تم النسخ':'Copied';
        setTimeout(()=>button.textContent=lang==='ar'?'نسخ':'Copy',1300);
      }catch{toast(lang==='ar'?'تعذر نسخ الكود':'Could not copy code')}
    };
    head.append(label,button);if(fileMatch||isPptx){const download=document.createElement('button');download.type='button';download.className='file-download';download.textContent=I18N[lang].downloadFile;download.onclick=()=>isPptx?downloadPptx(code?.textContent||''):downloadTextFile(fileMatch[1],code?.textContent||'');head.append(download)}
    pre.prepend(head);
  });
}
function bindMessageActions(){
  $('messages').querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>copyMsg(Number(b.dataset.copy)));
  $('messages').querySelectorAll('[data-redo]').forEach(b=>b.onclick=regenerate);
  $('messages').querySelectorAll('[data-continue]').forEach(b=>b.onclick=()=>continueResponse(Number(b.dataset.continue)));
  enhanceRenderedCodeBlocks();
}
function attachmentMarkup(m){
  const list=m.attachments||[];
  if(!list.length)return '';
  return `<div class="message-attachments">${list.map(a=>`<span class="message-attachment">${a.type?.startsWith('image/')?(lang==='ar'?'صورة':'Image'):(lang==='ar'?'ملف':'File')}: ${esc(a.name||'')}</span>`).join('')}</div>`;
}
function modelExecutionMarkup(m){
  if(m.role!=='assistant')return '';
  const routed=m.routedModelId||m.token_usage?.routedModelId||m.model_id;
  const modelName=m.selectedModelName||m.token_usage?.selectedModelName||routed;
  const charged=Number(m.chargedTokens??m.token_usage?.chargedTokens);
  const usedWebSearch=Boolean(m.usedWebSearch??m.token_usage?.webSearch);
  if(!routed&&!Number.isFinite(charged)&&!usedWebSearch)return '';
  const parts=[];
  if(modelName)parts.push(`<span>${I18N[lang].modelUsed}: <b>${esc(shortModelName(String(modelName).split('/').pop()||modelName))}</b></span>`);
  if(Number.isFinite(charged))parts.push(`<span><b>${charged.toLocaleString('en-US')}</b> ${I18N[lang].tokensUsed}</span>`);
  if(usedWebSearch){const searchLabel=lang==='ar'?'تم استخدام بحث الويب':'Web search was used';parts.push(`<span class="web-search-meta" title="${searchLabel}" aria-label="${searchLabel}" role="img">${ICONS.globe}</span>`);}
  return `${m.fallbackUsed||m.token_usage?.fallbackUsed?`<div class="fallback-note">${I18N[lang].fallbackUsed}: ${esc(shortModelName(routed||''))}</div>`:''}<div class="message-meta">${parts.join('<span class="meta-dot">•</span>')}</div>`;
}
function imageMarkup(m,i){
  const img=m.generatedImage;
  if(!img?.display_url&&!img?.thumbnail_data)return '';
  const fallback=img.storage_status==='client_only';
  const notice=fallback?I18N[lang].storageFallbackNotice:I18N[lang].imageExpiryNotice;
  const src=esc(img.display_url||img.thumbnail_data),deferred=deferHistoricalImages;
  return `<div class="generated-image-card${fallback?' storage-fallback':''}"><div class="image-expiry-note" role="note">${ICONS.clock||'⏱'}<span>${esc(notice)}</span></div><img ${deferred?`data-src="${src}" data-image-cache-id="${esc(img.id||'')}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9'/%3E" class="deferred-image"`:`src="${src}" loading="lazy" decoding="async"`} alt="${lang==='ar'?'صورة مولدة':'Generated image'}" data-image-cache-id="${esc(img.id||'')}" data-preview-image="${i}" tabindex="0"><div class="generated-image-actions"><span>${esc(img.model_id||'AI image')}</span><button type="button" class="download-image" data-download-image="${i}">${lang==='ar'?'تنزيل':'Download'}</button></div></div>`;
}

async function hydrateDeferredChatImages(sequence){
  const images=[...$('messages').querySelectorAll('img[data-src]')];
  for(const image of images){
    if(sequence!==chatOpenSequence||!image.isConnected)return;
    const src=image.dataset.src,imageId=image.dataset.imageCacheId;if(!src)continue;
    let localBlob=imageId?await readLocalImage(imageId):null;
    if(sequence!==chatOpenSequence||!image.isConnected)return;
    let displaySrc=src;
    if(localBlob){displaySrc=URL.createObjectURL(localBlob);localImageObjectUrls.add(displaySrc)}
    await new Promise(resolve=>{const done=()=>{image.classList.add('loaded');image.removeAttribute('data-src');resolve()};image.onload=done;image.onerror=done;image.src=displaySrc});
    if(!localBlob&&imageId){fetch(src,{credentials:'omit'}).then(r=>r.ok?r.blob():null).then(blob=>blob&&saveLocalImage(imageId,blob)).catch(()=>{})}
    await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,20)));
  }
}
function cacheRenderedGeneratedImages(){
  for(const image of $('messages').querySelectorAll('img[data-image-cache-id]:not([data-src])')){
    const imageId=image.dataset.imageCacheId;if(!imageId||image.dataset.localCacheQueued==='1')continue;image.dataset.localCacheQueued='1';
    const cache=()=>{const src=image.currentSrc||image.src;if(!src||src.startsWith('blob:'))return;readLocalImage(imageId).then(found=>{if(found)return;fetch(src,{credentials:'omit'}).then(r=>r.ok?r.blob():null).then(blob=>blob&&saveLocalImage(imageId,blob)).catch(()=>{})})};
    image.complete?cache():image.addEventListener('load',cache,{once:true});
  }
}
function codePreviewDocument(language,source){
  if(/^(html?|svg)$/.test(language))return source;
  if(language==='css')return `<!doctype html><html><head><meta charset="utf-8"><style>${source}</style></head><body><main><h1>CSS Preview</h1><p>معاينة تنسيق CSS داخل صفحة تجريبية.</p><button>Button</button></main></body></html>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui;padding:20px}pre{white-space:pre-wrap;background:#f4f4f5;padding:12px;border-radius:10px}</style></head><body><pre id="out">Running…</pre><script>const out=document.getElementById('out');const logs=[];['log','warn','error'].forEach(k=>{const old=console[k];console[k]=(...a)=>{logs.push(a.map(v=>typeof v==='string'?v:JSON.stringify(v,null,2)).join(' '));out.textContent=logs.join('\\n')||'تم التشغيل بدون مخرجات';old(...a)}});window.onerror=(m)=>{out.textContent='Error: '+m};try{${source}\nsetTimeout(()=>{if(!logs.length)out.textContent='تم التشغيل بدون مخرجات'},0)}catch(e){out.textContent=e.stack||e.message}<\/script></body></html>`;
}
function normalizeCodeLanguage(language){const value=String(language||'text').trim().toLowerCase();return ({htm:'html',js:'javascript',jsx:'javascript',mjs:'javascript',ts:'typescript',py:'python',cs:'csharp','c#':'csharp',sh:'bash',shell:'bash',yml:'yaml'})[value]||value}
function codeExtension(language){return ({html:'html',css:'css',javascript:'js',typescript:'ts',json:'json',python:'py',java:'java',c:'c',cpp:'cpp',csharp:'cs',php:'php',ruby:'rb',go:'go',rust:'rs',sql:'sql',bash:'sh',xml:'xml',svg:'svg',markdown:'md',yaml:'yml',text:'txt'})[normalizeCodeLanguage(language)]||'txt'}
function codeMimeType(language){return ({html:'text/html',css:'text/css',javascript:'text/javascript',typescript:'text/typescript',json:'application/json',python:'text/x-python',java:'text/x-java-source',c:'text/x-c',cpp:'text/x-c++src',csharp:'text/plain',php:'application/x-httpd-php',ruby:'text/x-ruby',go:'text/x-go',rust:'text/plain',sql:'application/sql',bash:'application/x-sh',xml:'application/xml',svg:'image/svg+xml',markdown:'text/markdown',yaml:'application/yaml',text:'text/plain'})[normalizeCodeLanguage(language)]||'text/plain'}
function codeDownloadName(language,source){const normalized=normalizeCodeLanguage(language),ext=codeExtension(normalized);let base='aiway-code';if(normalized==='html'){const title=String(source||'').match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();if(title)base=title}else if(normalized==='python'){const name=String(source||'').match(/(?:^|\n)\s*(?:class|def)\s+([A-Za-z_]\w*)/)?.[1];if(name)base=name}else if(normalized==='java'){const name=String(source||'').match(/\bpublic\s+class\s+([A-Za-z_]\w*)/)?.[1];if(name)base=name}else if(normalized==='javascript'||normalized==='typescript'){const name=String(source||'').match(/(?:^|\n)\s*(?:export\s+)?(?:function|class)\s+([A-Za-z_$][\w$]*)/)?.[1];if(name)base=name}return `${safeDownloadName(base,'aiway-code')}.${ext}`}
function codeCardSource(button){const card=button.closest('.code-card');return {card,language:normalizeCodeLanguage(card?.dataset.codeLanguage||'text'),source:card?.querySelector('pre code')?.textContent||card?.querySelector('pre')?.textContent||''}}
async function handleCodeAction(button){
  const {language,source}=codeCardSource(button);if(!source)return;
  const action=button.dataset.codeAction;
  if(action==='copy'){try{await navigator.clipboard.writeText(source);const old=button.textContent;button.textContent=lang==='ar'?'تم النسخ':'Copied';setTimeout(()=>button.textContent=old,1100)}catch{toast(lang==='ar'?'تعذر نسخ الكود':'Could not copy code')}return}
  if(action==='download'){
    try{
      const filename=codeDownloadName(language,source),mime=codeMimeType(language);
      const content=/^(text\/|application\/(json|xml|sql|yaml|x-|javascript)|image\/svg\+xml)/.test(mime)?'\uFEFF'+source:source;
      await triggerPiCompatibleDownload(new Blob([content],{type:`${mime};charset=utf-8`}),filename);
      const old=button.textContent;button.textContent=lang==='ar'?'تم التنزيل':'Downloaded';setTimeout(()=>button.textContent=old,1200)
    }catch(error){console.error('Code download failed',error);toast(lang==='ar'?'تعذر تنزيل ملف الكود':'Could not download the code file')}
    return
  }
  if(action==='preview'&&codeCanPreview(language)){$('previewTitle').textContent=lang==='ar'?'معاينة وتشغيل الكود':'Code preview & run';$('previewFrame').srcdoc=codePreviewDocument(language,source);$('previewModal').classList.add('open')}
}
function extractGeneratedFiles(text){
  const files=[];const re=/```file-([^\n`]+)\n([\s\S]*?)```/g;let match;
  while((match=re.exec(String(text||'')))&&files.length<8){files.push({name:match[1].trim(),content:match[2].replace(/\n$/,'')})}
  return files;
}
function generatedFilesMarkup(m,i){
  if(m.role!=='assistant')return '';
  const files=extractGeneratedFiles(m.content);if(!files.length)return '';
  return files.map((f,j)=>`<div class="file-card"><span>${ICONS.download}</span><div class="file-card-info"><b>${esc(f.name)}</b><small>${lang==='ar'?'ملف جاهز':'File ready'}</small></div><div class="file-card-actions">${/\.html?$/i.test(f.name)?`<button type="button" class="file-preview" data-preview-ai-file="${i}:${j}">${I18N[lang].previewFile}</button>`:''}<button type="button" class="file-download" data-download-ai-file="${i}:${j}">${I18N[lang].downloadFile}</button>${files.length>1&&j===0?`<button type="button" class="project-download" data-download-project="${i}">${I18N[lang].downloadProject}</button>`:''}</div></div>`).join('');
}
function progressLanguage(m){return m?.requestLanguage||(/[\u0600-\u06FF]/.test(String(history.slice().reverse().find(x=>x.role==='user')?.content||''))?'ar':'en')}
function progressMarkup(m){
  const l=progressLanguage(m),t=I18N[l],stage=m?.streamStage||'analyzing';
  const stages=[['analyzing',t.analyzing],...(m?.usedWebSearch?[['searching',t.searching]]:[]),['writing',t.writing]];
  const current=Math.max(0,stages.findIndex(x=>x[0]===stage));
  return `<div class="response-progress"><div class="progress-head"><span class="thinking-spinner"></span><span>${stages[current]?.[1]||t.thinking}</span></div><div class="stage-list">${stages.map((x,n)=>`<span class="stage-chip ${n<current?'done':n===current?'active':''}">${x[1]}</span>`).join('')}</div><div class="answer-skeleton"><i></i><i></i><i></i></div></div>`;
}

function imageProgressMarkup(m){
  const t=I18N[progressLanguage(m)];
  const toolIcon=TASK_ICONS?.[activeTask]||ICONS.image||ICONS.bot;
  const modelLabel=m?.selectedModelName||m?.modelName||'';
  return `<div class="image-generation-progress" role="status" aria-live="polite"><div class="image-generation-head"><span class="image-generation-icon">${toolIcon}</span><span class="image-generation-copy"><b>${esc(t.imageGenerating)}</b><small>${esc(modelLabel||t.imageGeneratingHint)}</small></span></div><div class="image-generation-canvas" aria-hidden="true"><i class="image-generation-line one"></i><i class="image-generation-line two"></i><span class="image-generation-dots"><span><i></i><i></i><i></i></span></span></div></div>`;
}
function specialUiCardMarkup(m){
  if(m?.uiCard!=='free-daily-limit')return '';
  const t=I18N[m?.requestLanguage||lang]||I18N[lang];
  return `<div class="free-image-limit-card" role="alert"><div class="free-image-limit-head"><span>!</span><b>${esc(t.freeLimitTitle)}</b></div><p>${esc(t.freeLimitText)}</p><button type="button" class="free-limit-action" data-open-models="1">${esc(t.freeLimitAction)}</button></div>`;
}
function enhancePromptSections(html){
  const host=document.createElement('div');host.innerHTML=html;
  const labelPattern=/^(?:prompt|image prompt|system prompt|user prompt|negative prompt|برومبت|البرومبت|برومبت الصورة|وصف الصورة|تعليمات النظام)\s*[:：]?$/i;
  const blocks=[...host.children];
  for(let i=0;i<blocks.length;i++){
    const node=blocks[i];
    if(node.matches?.('pre'))continue;
    let label='',bodyNodes=[];
    const text=(node.textContent||'').trim();
    const strong=node.querySelector?.(':scope > strong:first-child');
    const strongText=(strong?.textContent||'').trim();
    if(labelPattern.test(text)){
      label=text.replace(/[:：]\s*$/,'');
      for(let j=i+1;j<blocks.length;j++){
        const next=blocks[j],nextText=(next.textContent||'').trim();
        if(!nextText||/^[-—]{3,}$/.test(nextText)||/^الخيار\s|^option\s/i.test(nextText)||next.matches('h1,h2,h3,h4,h5,h6,hr,pre'))break;
        bodyNodes.push(next);
      }
    }else if(strong&&labelPattern.test(strongText)){
      label=strongText.replace(/[:：]\s*$/,'');
      const clone=node.cloneNode(true);clone.querySelector(':scope > strong:first-child')?.remove();
      if((clone.textContent||'').trim())bodyNodes=[clone];
      else if(blocks[i+1]&&!blocks[i+1].matches('h1,h2,h3,h4,h5,h6,hr,pre'))bodyNodes=[blocks[i+1]];
    }
    if(!label||!bodyNodes.length)continue;
    const promptText=bodyNodes.map(n=>(n.innerText||n.textContent||'').trim()).filter(Boolean).join('\n\n').trim();
    if(!promptText)continue;
    const pre=document.createElement('pre');
    pre.dataset.codeLabel=label;
    const code=document.createElement('code');
    code.className='language-prompt';
    code.textContent=promptText;
    pre.appendChild(code);
    node.replaceWith(pre);
    bodyNodes.forEach(n=>n.remove());
  }
  return host.innerHTML;
}
function codeLanguageFromNode(code){
  const match=String(code?.className||'').match(/language-([\w.+-]+)/i);
  return (match?.[1]||'text').toLowerCase();
}
function codeCanPreview(language){return /^(html?|svg|css|javascript|js)$/.test(language)}
function enhanceCodeBlocks(html,completedFencePairs=Infinity){
  const host=document.createElement('div');host.innerHTML=html;let index=0;
  [...host.querySelectorAll('pre')].forEach(pre=>{
    if(index>=completedFencePairs){pre.classList.add('raw-stream-code');index++;return}
    const code=pre.querySelector(':scope > code')||pre.querySelector('code');
    if(!code||code.classList.contains('language-prompt')){index++;return}
    const language=codeLanguageFromNode(code),card=document.createElement('div');card.className='code-card';card.dataset.codeLanguage=language;
    const toolbar=document.createElement('div');toolbar.className='code-card-toolbar';
    const label=document.createElement('span');label.className='code-card-language';label.textContent=language==='text'?'code':language;
    toolbar.appendChild(label);
    const actions=[['copy',lang==='ar'?'نسخ':'Copy'],...(codeCanPreview(language)?[['preview',lang==='ar'?'عرض وتشغيل':'Preview & run']]:[]),['download',lang==='ar'?'تنزيل':'Download']];
    actions.forEach(([action,title])=>{const b=document.createElement('button');b.type='button';b.className='code-action';b.dataset.codeAction=action;b.textContent=title;toolbar.appendChild(b)});
    pre.replaceWith(card);card.append(toolbar,pre);index++;
  });
  return host.innerHTML;
}
function completedFencePairs(text){return Math.floor(((String(text||'').match(/```/g)||[]).length)/2)}
function renderMarkdown(text){
  if(!window.marked||!window.DOMPurify){ensureRichTextLibraries();return esc(text||'').replace(/\n/g,'<br>')}
  const raw=window.marked.parse(text||'',{gfm:true,breaks:true});
  const safe=window.DOMPurify.sanitize(raw,{ADD_ATTR:['target','rel']});
  return enhanceCodeBlocks(enhancePromptSections(safe));
}
function balanceStreamingMarkdown(text){
  let value=String(text||'');
  // Close constructs that are commonly split between stream chunks.
  // These temporary markers are rendered only and are never stored.
  const fences=(value.match(/```/g)||[]).length;
  if(fences%2)value+='\n```';
  const withoutFences=value.replace(/```[\s\S]*?```/g,'');
  const bold=(withoutFences.match(/(?<!\*)\*\*(?!\*)/g)||[]).length;
  if(bold%2)value+='**';
  const inline=(withoutFences.match(/(?<!`)`(?!`)/g)||[]).length;
  if(inline%2)value+='`';
  return value;
}
function renderStreamingMarkdown(text){
  const value=balanceStreamingMarkdown(text);
  if(!window.marked||!window.DOMPurify){
    ensureRichTextLibraries();
    return esc(value)
      .replace(/^######\s+(.+)$/gm,'<h6>$1</h6>')
      .replace(/^#####\s+(.+)$/gm,'<h5>$1</h5>')
      .replace(/^####\s+(.+)$/gm,'<h4>$1</h4>')
      .replace(/^###\s+(.+)$/gm,'<h3>$1</h3>')
      .replace(/^##\s+(.+)$/gm,'<h2>$1</h2>')
      .replace(/^#\s+(.+)$/gm,'<h1>$1</h1>')
      .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>')
      .replace(/\n/g,'<br>');
  }
  const raw=window.marked.parse(value,{gfm:true,breaks:true});
  const safe=window.DOMPurify.sanitize(raw,{ADD_ATTR:['target','rel']});
  return enhanceCodeBlocks(safe,completedFencePairs(text));
}
function isNearBottom(threshold=96){const box=$('messages');return box.scrollHeight-box.scrollTop-box.clientHeight<=threshold}
function scrollToLatest(behavior='smooth'){const box=$('messages');box.scrollTo({top:box.scrollHeight,behavior});userPinnedToBottom=true;updateScrollLatestButton()}
let scrollLatestHideTimer=null;
function updateScrollLatestButton(){const btn=$('scrollLatest');if(!btn)return;const show=history.length>0&&!isNearBottom(110);btn.classList.toggle('show',show);btn.setAttribute('aria-label',lang==='ar'?'الانتقال لآخر المحادثة':'Go to latest message');btn.title=btn.getAttribute('aria-label');clearTimeout(scrollLatestHideTimer);if(show)scrollLatestHideTimer=setTimeout(()=>btn.classList.remove('show'),5000)}
function wakeScrollLatestButton(){clearTimeout(scrollLatestHideTimer);updateScrollLatestButton()}
let userPinnedToBottom=true;
function render(){
  const box=$('messages'),stick=userPinnedToBottom||isNearBottom();
  if(!history.length){box.innerHTML=welcome();box.querySelectorAll('[data-prompt]').forEach(b=>b.onclick=()=>{$('prompt').value=b.dataset.prompt;$('prompt').focus();autoSize()});updateScrollLatestButton();return}
  box.innerHTML=history.map((m,i)=>{const isLive=streaming&&m.role==='assistant'&&i===history.length-1&&!m.generatedImage;return `<article class="msg ${m.role}${isLive?' streaming-msg':''}" data-message-index="${i}"><span class="avatar">${m.role==='user'?ICONS.user:ICONS.bot}</span><div class="bubble">${attachmentMarkup(m)}<div class="bubble-content${isLive&&m.content&&!m.streamComplete?' streaming':''}">${m.role==='assistant'?(m.uiCard?specialUiCardMarkup(m):(m.content?(isLive&&!m.streamComplete?renderStreamingMarkdown(m.content):renderMarkdown(m.content)):(m.imageGenerating?imageProgressMarkup(m):(isLive?progressMarkup(m):'')))):esc(m.content||'').replace(/\n/g,'<br>')}</div>${generatedFilesMarkup(m,i)}${imageMarkup(m,i)}${modelExecutionMarkup(m)}<div class="msg-actions" dir="${lang==='ar'?'rtl':'ltr'}"><button class="mini-btn" data-copy="${i}">${ICONS.copy} ${I18N[lang].copy}</button>${m.role==='assistant'?`<button class="mini-btn" data-redo="1">${ICONS.redo} ${I18N[lang].redo}</button>${i===history.length-1&&m.content&&!m.generatedImage?`<button class="mini-btn" data-continue="${i}">${ICONS.continue} ${I18N[lang].continueResponse}</button>`:''}`:''}</div></div></article>`}).join('');
  bindMessageActions();cacheRenderedGeneratedImages();box.querySelectorAll('[data-download-image]').forEach(b=>b.onclick=()=>downloadGeneratedImage(Number(b.dataset.downloadImage)));box.querySelectorAll('[data-preview-image]').forEach(img=>{const open=()=>openImagePreview(Number(img.dataset.previewImage));img.onclick=open;img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}}});box.querySelectorAll('[data-download-ai-file]').forEach(b=>b.onclick=()=>{const [mi,fi]=b.dataset.downloadAiFile.split(':').map(Number);downloadGeneratedFile(mi,fi)});box.querySelectorAll('[data-preview-ai-file]').forEach(b=>b.onclick=()=>{const [mi,fi]=b.dataset.previewAiFile.split(':').map(Number);previewGeneratedFile(mi,fi)});box.querySelectorAll('[data-download-project]').forEach(b=>b.onclick=()=>downloadGeneratedProject(Number(b.dataset.downloadProject)));
  requestAnimationFrame(()=>{if(stick)scrollToLatest('auto');else updateScrollLatestButton()});
}
let streamQueue='',streamTimer=0,streamDrainResolve=null,firstStreamChunkSeen=false;
function setSendButtonState(state='idle'){
  const button=$('sendBtn');if(!button)return;
  const isStop=state==='streaming';
  button.dataset.state=state;
  button.classList.toggle('sending',isStop);
  button.classList.toggle('preparing',state==='preparing');
  button.disabled=state==='preparing';
  button.setAttribute('aria-busy',state==='preparing'?'true':'false');
  button.setAttribute('aria-label',isStop?(lang==='ar'?'إيقاف الإجابة':'Stop response'):(state==='preparing'?(lang==='ar'?'جاري تجهيز الرسالة':'Preparing message'):(lang==='ar'?'إرسال':'Send')));
  button.innerHTML=isStop?ICONS.stop:ICONS.send;
}
function streamStageLabel(message){
  const l=progressLanguage(message),t=I18N[l]||I18N[lang],stage=message?.streamStage||'analyzing';
  if(stage==='searching')return t.searching;
  if(stage==='writing')return t.writing;
  return t.analyzing;
}
function syncComposerStreamStatus(message){
  const status=$('status');if(!status)return;
  if(!streaming){status.textContent='';status.classList.remove('stream-status');return}
  status.textContent=streamStageLabel(message);
  status.classList.add('stream-status');
}
function scheduleStreamPaint(){
  if(streamTimer)return;
  streamTimer=requestAnimationFrame(()=>{
    streamTimer=0;
    if(streamQueue){
      const message=history[history.length-1];
      if(message)message.content=(message.content||'')+streamQueue;
      streamQueue='';
      updateStreamingBubble();
    }
    if(streamDrainResolve){streamDrainResolve();streamDrainResolve=null}
  });
}
function enqueueStreamText(text){
  if(!text)return;
  const message=history[history.length-1];
  if(!firstStreamChunkSeen&&message?.role==='assistant'&&!message.content){
    firstStreamChunkSeen=true;message.content=text;message.streamStage='writing';updateStreamingBubble(true);return;
  }
  streamQueue+=text;scheduleStreamPaint();
}
function drainStreamQueue(){if(!streamQueue&&!streamTimer)return Promise.resolve();return new Promise(resolve=>{streamDrainResolve=resolve;scheduleStreamPaint()})}
function updateStreamingBubble(firstChunk=false){
  const box=$('messages'),article=box.querySelector('.msg.assistant:last-of-type'),content=article?.querySelector('.bubble-content');
  if(!content)return;
  const message=history.at(-1),text=message?.content||'',stick=userPinnedToBottom||isNearBottom(180);
  syncComposerStreamStatus(message);
  content.classList.toggle('streaming',Boolean(text)&&!message?.streamComplete);
  if(firstChunk){article?.classList.add('first-chunk');setTimeout(()=>article?.classList.remove('first-chunk'),320)}
  if(text){
    const html=renderStreamingMarkdown(text);
    if(content.dataset.streamHtml!==html){content.innerHTML=html;content.dataset.streamHtml=html}
  }else content.innerHTML=progressMarkup(message);
  if(stick){box.scrollTo({top:box.scrollHeight,behavior:'auto'});userPinnedToBottom=true}
  else{userPinnedToBottom=false;updateScrollLatestButton()}
}

let pendingAttachments=[];
const MAX_FILE_BYTES=2*1024*1024,MAX_TOTAL_BYTES=Math.floor(2.5*1024*1024),MAX_ATTACHMENTS=3;
function dbOpen(){return new Promise((resolve,reject)=>{const q=indexedDB.open('aiway-local-files',1);q.onupgradeneeded=()=>q.result.createObjectStore('files',{keyPath:'id'});q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function saveLocalAttachment(a){try{const d=await dbOpen(),tx=d.transaction('files','readwrite');tx.objectStore('files').put(a);await new Promise((r,j)=>{tx.oncomplete=r;tx.onerror=()=>j(tx.error)});d.close()}catch{}}
function fileToDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
async function compressImage(file){const url=await fileToDataUrl(file);return new Promise(resolve=>{const img=new Image();img.onload=()=>{const max=1600,scale=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);resolve(c.toDataURL('image/jpeg',.82))};img.onerror=()=>resolve(url);img.src=url})}
async function addFiles(files){for(const file of [...files]){if(pendingAttachments.length>=MAX_ATTACHMENTS){toast(lang==='ar'?'الحد الأقصى 3 ملفات في الرسالة.':'A message can contain up to 3 files.');break}if(file.size>MAX_FILE_BYTES){toast(lang==='ar'?`الملف ${file.name} أكبر من 2 ميجابايت.`:`${file.name} is larger than 2 MB.`);continue}const current=pendingAttachments.reduce((n,a)=>n+(a.size||0),0);if(current+file.size>MAX_TOTAL_BYTES){toast(lang==='ar'?'إجمالي الملفات يجب ألا يتجاوز 2.5 ميجابايت.':'The combined file size must not exceed 2.5 MB.');break}try{const isImage=file.type.startsWith('image/');const dataUrl=isImage?await compressImage(file):await fileToDataUrl(file);if(typeof dataUrl!=='string'||!dataUrl.startsWith('data:'))throw Error('Invalid file data');const item={id:crypto.randomUUID(),name:file.name,type:file.type||'application/octet-stream',size:file.size,dataUrl,createdAt:Date.now()};pendingAttachments.push(item);saveLocalAttachment(item)}catch(error){console.error('Attachment read failed',error);toast(lang==='ar'?`تعذر قراءة الملف ${file.name}. اختر ملفًا آخر أو أعد المحاولة.`:`Could not read ${file.name}. Choose another file or try again.`)}}renderAttachmentStrip();$('fileInput').value=''}
function renderAttachmentStrip(){const box=$('attachmentStrip');box.classList.toggle('show',pendingAttachments.length>0);box.innerHTML=pendingAttachments.map((a,i)=>`<div class="attachment-chip">${a.type.startsWith('image/')?`<img src="${a.dataUrl}" alt="">`:ICONS.chat}<span>${esc(a.name)}</span><button class="remove-attachment" data-remove-attachment="${i}">×</button></div>`).join('');box.querySelectorAll('[data-remove-attachment]').forEach(b=>b.onclick=()=>{pendingAttachments.splice(Number(b.dataset.removeAttachment),1);renderAttachmentStrip()})}
function isImageRequest(text){return /(?:اعمل|أنشئ|ارسم|ولد|صمم|generate|create|draw)\s+(?:لي\s+)?(?:صورة|image|photo|poster|logo)/i.test(text)}
function imageModelGuidance(text){const useArabic=/[\u0600-\u06FF]/.test(text)||lang==='ar';return useArabic?'طلبك يبدو طلب توليد صورة. من فضلك افتح قائمة النماذج واختر نموذجًا من قسم AI Images ثم أرسل الطلب مرة أخرى.':'Your request looks like an image-generation request. Please open the model list, choose a model from AI Images, then send your request again.'}
function safeDownloadName(name,fallback='AiWay-download'){try{return decodeURIComponent(String(name||fallback)).split(/[\/]/).pop().replace(/[\u0000-\u001f<>:\"|?*]/g,'_').slice(0,160)||fallback}catch{return fallback}}
function blobToDataUrl(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||new Error('File conversion failed'));reader.readAsDataURL(blob)})}
async function triggerPiCompatibleDownload(blob,filename){const safeName=safeDownloadName(filename);const dataUrl=await blobToDataUrl(blob);const a=document.createElement('a');a.href=dataUrl;a.download=safeName;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1200)}
async function secureDownload(url){const r=await fetch(url,{headers:{Authorization:`Bearer ${auth.token}`,'X-UI-Language':lang}});if(!r.ok)throw friendlyClientError(await r.json().catch(()=>({})),lang==='ar'?'تعذر تنزيل الملف':'Could not download file');const blob=await r.blob(),cd=r.headers.get('content-disposition')||'';const rawName=(cd.match(/filename\*=UTF-8''([^;]+)/i)||cd.match(/filename="?([^";]+)/i)||[])[1]||'AiWay-download';await triggerPiCompatibleDownload(blob,rawName)}
async function startNativeFileDownload(payload){const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth.token}`,'X-UI-Language':lang},body:JSON.stringify({action:'prepare-download',...payload})});if(!r.ok)throw friendlyClientError(await r.json().catch(()=>({})),lang==='ar'?'تعذر تجهيز التنزيل':'Could not prepare download');const data=await r.json();if(!data?.url)throw makeUiError(lang==='ar'?'لم يتم إنشاء رابط التنزيل':'Download link was not created','DOWNLOAD_FAILED');const a=document.createElement('a');a.href=data.url;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1500)}
function submitNativeAttachmentDownload(action,fields={}){
  if(!auth?.token)throw makeUiError(lang==='ar'?'انتهت جلسة تسجيل الدخول. سجّل الدخول ثم حاول مرة أخرى.':'Your sign-in session has expired. Sign in and try again.','UNAUTHORIZED');
  let frame=document.getElementById('aiwayDownloadFrame');
  if(!frame){frame=document.createElement('iframe');frame.id='aiwayDownloadFrame';frame.name='aiwayDownloadFrame';frame.hidden=true;frame.setAttribute('aria-hidden','true');document.body.appendChild(frame)}
  const form=document.createElement('form');form.method='POST';form.action='/api/chat';form.target=frame.name;form.style.display='none';form.acceptCharset='UTF-8';
  const payload={action,authToken:auth.token,locale:lang,...fields};
  Object.entries(payload).forEach(([name,value])=>{const input=document.createElement('input');input.type='hidden';input.name=name;input.value=String(value??'');form.appendChild(input)});
  document.body.appendChild(form);
  // Native form submission keeps the browser's real download pipeline and works in Pi Browser.
  form.submit();
  setTimeout(()=>form.remove(),1500);
}
function newRequestId(){return (crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(36).slice(2)}`).replace(/[^A-Za-z0-9_-]/g,'_')}
async function downloadGeneratedImage(i){const img=history[i]?.generatedImage;if(!img?.id||!auth?.token)return toast(lang==='ar'?'الصورة غير متاحة':'Image is unavailable');try{if(img.storage_status==='client_only'&&img.thumbnail_data){const blob=await (await fetch(img.thumbnail_data)).blob();await triggerPiCompatibleDownload(blob,`AiWay-${img.id}.${String(img.media_type||'').includes('png')?'png':String(img.media_type||'').includes('webp')?'webp':'jpg'}`);return;}const r=await fetch('/api/image',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${auth.token}`,'X-UI-Language':lang},body:JSON.stringify({action:'prepare-download',imageId:img.id})});if(!r.ok)throw friendlyClientError(await r.json().catch(()=>({})),lang==='ar'?'تعذر تجهيز التنزيل':'Could not prepare download');const data=await r.json();if(!data?.url)throw makeUiError(lang==='ar'?'لم يتم إنشاء رابط التنزيل':'Download link was not created','DOWNLOAD_FAILED');const a=document.createElement('a');a.href=data.url;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1500)}catch(e){console.error(e);toast(e.message|| (lang==='ar'?'تعذر تنزيل الصورة':'Could not download image'))}}
let imagePreviewScale=1,imagePreviewX=0,imagePreviewY=0,imagePreviewDragging=false,imagePreviewStartX=0,imagePreviewStartY=0,imagePreviewBaseX=0,imagePreviewBaseY=0,imagePreviewPinchDistance=0,imagePreviewPinchScale=1;
function applyImagePreviewTransform(){const img=$('imagePreviewImg');if(!img)return;img.style.transform=`translate(${imagePreviewX}px,${imagePreviewY}px) scale(${imagePreviewScale})`;$('imageZoomLabel').textContent=Math.round(imagePreviewScale*100)+'%'}
function setImagePreviewScale(next){imagePreviewScale=Math.min(5,Math.max(1,Number(next)||1));if(imagePreviewScale===1){imagePreviewX=0;imagePreviewY=0}applyImagePreviewTransform()}
document.addEventListener('click',e=>{const button=e.target.closest?.('[data-code-action]');if(button){e.preventDefault();handleCodeAction(button)}});
document.addEventListener('click',async e=>{const btn=e.target.closest?.('[data-copy-prompt]');if(!btn)return;const body=btn.closest('.prompt-copy-block')?.querySelector('.prompt-copy-body');const text=(body?.innerText||body?.textContent||'').trim();if(!text)return;try{await navigator.clipboard.writeText(text);const label=btn.querySelector('span');const old=label?.textContent;if(label)label.textContent=lang==='ar'?'تم النسخ':'Copied';setTimeout(()=>{if(label)label.textContent=old||I18N[lang].copy},1200)}catch{toast(lang==='ar'?'تعذر نسخ البرومبت':'Could not copy the prompt')}});
document.addEventListener('click',e=>{const btn=e.target.closest?.('[data-open-models]');if(!btn)return;const trigger=document.querySelector('.model-trigger,[data-model-trigger],#modelButton');if(trigger)trigger.click();else document.getElementById('model')?.focus();});
function openImagePreview(i){const image=history[i]?.generatedImage,src=image?.display_url||image?.thumbnail_data;if(!src)return;imagePreviewScale=1;imagePreviewX=0;imagePreviewY=0;$('imagePreviewImg').src=src;$('imagePreviewImg').alt=lang==='ar'?'معاينة الصورة المولدة':'Generated image preview';$('imagePreviewHint').textContent=lang==='ar'?'قرّب بإصبعين أو استخدم أزرار التكبير':'Pinch or use the zoom controls';applyImagePreviewTransform();$('imagePreviewModal').classList.add('open');$('imagePreviewModal').setAttribute('aria-hidden','false')}
function closeImagePreview(){$('imagePreviewModal').classList.remove('open');$('imagePreviewModal').setAttribute('aria-hidden','true');$('imagePreviewImg').src='';imagePreviewDragging=false}

function selectedModel(){return [...(window.aiwayModels||[]),...(window.aiwayImageModels||[])].find(m=>m.id===$('model').value)}
function selectedImageModelForTask(){const routed=taskRoutedModelId();return (window.aiwayImageModels||[]).find(m=>m.id===routed)||selectedModel()}
function enhanceImageSelect(selectId,wrapId){
  const select=$(selectId),wrap=$(wrapId);if(!select||!wrap)return;
  let button=wrap.querySelector('.image-choice-button'),menu=wrap.querySelector('.image-choice-menu');
  if(!button){button=document.createElement('button');button.type='button';button.className='image-choice-button';button.onclick=e=>{e.stopPropagation();document.querySelectorAll('.ratio-wrap.open').forEach(x=>x!==wrap&&x.classList.remove('open'));wrap.classList.toggle('open')};wrap.appendChild(button)}
  if(!menu){menu=document.createElement('div');menu.className='image-choice-menu';wrap.appendChild(menu)}
  button.textContent=select.value||'—';menu.innerHTML=[...select.options].map(o=>`<button type="button" class="image-choice-option${o.value===select.value?' active':''}" data-value="${esc(o.value)}">${esc(o.textContent)}</button>`).join('');
  menu.querySelectorAll('[data-value]').forEach(option=>option.onclick=e=>{e.stopPropagation();select.value=option.dataset.value;select.dispatchEvent(new Event('change',{bubbles:true}));wrap.classList.remove('open');enhanceImageSelect(selectId,wrapId)});
}
document.addEventListener('click',()=>document.querySelectorAll('.ratio-wrap.open').forEach(x=>x.classList.remove('open')));
function syncImageOptions(){
  const model=selectedImageModelForTask();
  const ratios=Array.isArray(model?.supportedAspectRatios)?model.supportedAspectRatios:[];
  const resolutions=Array.isArray(model?.supportedResolutions)?model.supportedResolutions:[];
  const ratioSelect=$('aspectRatio'),resolutionSelect=$('imageResolution');
  const previousRatio=ratioSelect.value,previousResolution=resolutionSelect.value;
  const visibleRatios=ratios;
  ratioSelect.innerHTML=visibleRatios.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
  ratioSelect.value=visibleRatios.includes(previousRatio)?previousRatio:(visibleRatios.includes('1:1')?'1:1':visibleRatios[0]||'');
  resolutionSelect.innerHTML=resolutions.map(value=>`<option value="${esc(value)}">${esc(value)}</option>`).join('');
  resolutionSelect.value=resolutions.includes(previousResolution)?previousResolution:(resolutions.find(value=>/^1k$/i.test(value))||resolutions[0]||'');
  $('ratioWrap').classList.toggle('show',model?.type==='image'&&visibleRatios.length>0);
  $('resolutionWrap').classList.toggle('show',model?.type==='image'&&resolutions.length>0);
  enhanceImageSelect('aspectRatio','ratioWrap');enhanceImageSelect('imageResolution','resolutionWrap');
}
function syncModelMode(){const isImage=selectedImageModelForTask()?.type==='image';updateModelTrigger();syncImageOptions();$('webPill').style.display=isImage?'none':'';$('prompt').placeholder=isImage?(lang==='ar'?'صف الصورة التي تريد إنشاءها...':'Describe the image you want to create...'):(lang==='ar'?'اسأل أي شيء...':'Ask anything...')}
async function persistGeneratedImage(image){if(!image?.id||!image?.thumbnail_data)return;try{const result=await api('/api/image',{method:'POST',body:JSON.stringify({action:'persist',imageId:image.id,imageData:image.thumbnail_data})});image.storage_status=result?.storageStatus||(result?.fallback?'client_only':'ready');image.fallback_reason=result?.reason||null;if(result?.fallback)toast(I18N[lang].storageFallbackNotice);render()}catch(e){console.error('Background image save failed',e);image.storage_status='failed';render()}}
async function generateImageMessage(text,attachments,overrideModelId='',overrideTaskId=''){const modelId=overrideModelId||taskRoutedModelId();const previewModel=(window.aiwayImageModels||[]).find(m=>m.id===modelId);history.push({role:'assistant',content:'',generatedImage:null,imageGenerating:true,selectedModelName:previewModel?.name||previewModel?.shortName||'',requestLanguage:/[\u0600-\u06FF]/.test(text)?'ar':'en'});render();await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));const r=await api('/api/image',{method:'POST',timeoutMs:180000,body:JSON.stringify({conversationId:current,prompt:text,referenceImage:attachments.find(a=>a.type.startsWith('image/'))?.dataUrl||null,modelId,aspectRatio:$('aspectRatio').value,resolution:$('imageResolution').value,requestId:newRequestId(),locale:lang,taskId:overrideTaskId||routedTaskId()})});const actualModelId=r.routedModelId||r.modelId||modelId;history[history.length-1]={role:'assistant',content:lang==='ar'?'تم إنشاء الصورة المطلوبة.':'The requested image has been generated.',generatedImage:r.image,model_id:actualModelId,routedModelId:actualModelId,chargedTokens:Number(r.chargedTokens||0),providerUsd:Number(r.providerUsd||0),selectedModelName:r.selectedModelName||actualModelId,token_usage:{chargedTokens:Number(r.chargedTokens||0),routedModelId:actualModelId,providerUsd:Number(r.providerUsd||0),selectedModelName:r.selectedModelName||actualModelId}};render();persistGeneratedImage(r.image);await Promise.all([refreshMe(),loadChats()]);if(r.lowBalance)showLowBalance(r.remainingTokens)}

function estimateMessagesForBackend(text,attachments){
 const pending={role:'user',content:text||(lang==='ar'?'حلل الملفات المرفقة':'Analyze the attached files')};
 if(attachments?.length)pending.attachments=attachments.map(({name,type,size})=>({name,type,size}));
 return [...history.filter(m=>m.role==='user'||m.role==='assistant').map(m=>({role:m.role,content:m.content||''})),pending];
}
function formatApproximateCost(estimate){
 const tokens=Math.max(1,Number(estimate?.chargedTokens||0));
 const isFreeTrial=Boolean(estimate?.billingMode==='free_trial'||(userProfile&&!userProfile.has_purchased));
 const chosen=selectedModel();
 const chosenName=chosen?shortModelName(chosen.shortName||chosen.name||chosen.id):$('model').value;
 const model=isFreeTrial
  ? (lang==='ar'?'OpenRouter المجاني':'OpenRouter Free')
  : (activeTask==='all-models'?chosenName:(estimate?.modelName||estimate?.routedModelId||chosenName));
 const formatted=tokens.toLocaleString(lang==='ar'?'ar-EG':'en-US');
 const names=Array.isArray(estimate?.attachmentNames)?estimate.attachmentNames.filter(Boolean):[];
 const fileLine=names.length?(lang==='ar'?`\n\nالملف المتضمن: ${names.join('، ')}`:`\n\nIncluded file${names.length>1?'s':''}: ${names.join(', ')}`):'';
 const billing=estimate?.billingMode||(isFreeTrial?'free_trial':'paid');const costLine=billing==='free_trial'?(lang==='ar'?'سيُستخدم طلب مجاني واحد من التجربة، ولن يُخصم من الرصيد المدفوع.':'One free-trial request will be used; no paid balance will be deducted.'):(lang==='ar'?`الخصم التقريبي: ${formatted} توكن AiWay`:`Estimated deduction: ${formatted} AiWay tokens`);const detail=estimate?.type==='image'?(lang==='ar'?`\nالدقة: ${estimate.resolution||$('imageResolution').value||'تلقائي'} — الأبعاد: ${estimate.aspectRatio||$('aspectRatio').value||'تلقائي'}${estimate.pricingBasis==='per_megapixel'?`\nالحساب حسب ${Number(estimate.megapixels||0).toFixed(2)} ميجابكسل × $${Number(estimate.unitPrice||0).toFixed(4)} لكل ميجابكسل`:estimate.pricingBasis==='per_image'?`\nالسعر المعلن: $${Number(estimate.unitPrice||0).toFixed(4)} لكل صورة`:''}`:`\nResolution: ${estimate.resolution||$('imageResolution').value||'Auto'} — Aspect ratio: ${estimate.aspectRatio||$('aspectRatio').value||'Auto'}${estimate.pricingBasis==='per_megapixel'?`\nCalculated as ${Number(estimate.megapixels||0).toFixed(2)} MP × $${Number(estimate.unitPrice||0).toFixed(4)} per MP`:estimate.pricingBasis==='per_image'?`\nPublished price: $${Number(estimate.unitPrice||0).toFixed(4)} per image`:''}`):'';return lang==='ar'?`النموذج الذي سينفذ المهمة: ${model}\n\n${costLine}${detail}${fileLine}`:`Model selected for this task: ${model}\n\n${costLine}${detail}${fileLine}`;
}
async function confirmEstimatedMessageCost(modelId,text,attachments){
 if(!costEstimateEnabled())return true;
 const imageMode=selectedImageModelForTask()?.type==='image';
 const decision=showCostEstimateLoading();
 try{
  const estimate=await api('/api/models',{method:'POST',body:JSON.stringify({action:'estimate-message',modelId,messages:estimateMessagesForBackend(text,attachments),attachments,taskId:routedTaskId(),webSearch:imageMode?false:webSearch,outputReserve:0,resolution:imageMode?$('imageResolution').value:'',hasReferenceImage:imageMode&&attachments.some(a=>String(a.type||'').startsWith('image/')),aspectRatio:imageMode?$('aspectRatio').value:'',locale:lang})});
  estimate.attachmentNames=(attachments||[]).map(file=>file?.name).filter(Boolean);
  updateCostEstimateDialog(formatApproximateCost(estimate));
  return await decision;
 }catch(error){
  closeAiwayDialog(false);
  throw error;
 }
}


let sendInteractionLocked=false;
async function sendMessage(){
  if(streaming){controller?.abort();return}
  if(sendInteractionLocked)return;
  sendInteractionLocked=true;setSendButtonState('preparing');
  let stageTimer=0;
  try{
    if(!auth){await login();return}
    if(userProfile&&Number(userProfile.has_purchased?userProfile.ai_tokens:(userProfile.free_trial_tokens??userProfile.trial_messages_remaining??0))<=0)throw makeUiError(lang==='ar'?'رصيدك انتهى. اشحن رصيدًا جديدًا ثم أعد إرسال الرسالة.':'Your balance has run out. Add more balance, then send the message again.','INSUFFICIENT_TOKENS',{availableTokens:0});
    const text=$('prompt').value.trim();
    if(!text&&!pendingAttachments.length){toast(lang==='ar'?'اكتب رسالة أولًا':'Write a message first');return}
    let modelId=taskRoutedModelId();
    if(!modelId){
      await loadModels();
      modelId=taskRoutedModelId();
      if(!modelId)throw makeUiError(lang==='ar'?'لا يوجد نموذج ذكاء اصطناعي متاح حاليًا. حدّث الصفحة وحاول مرة أخرى.':'No AI model is currently available. Refresh the page and try again.','MODEL_UNAVAILABLE');
    }
    let effectiveWebSearch=webSearch;
    if(isImageRequest(text)&&selectedModel()?.isAuto){
      const freeImage=(window.aiwayImageModels||[]).find(m=>m.isFree&&!m.locked)||(window.aiwayImageModels||[]).find(m=>!m.locked);
      if(freeImage){$('model').value=freeImage.id;updateModelTrigger();syncModelMode();}
    }
    if(isImageRequest(text)&&selectedModel()?.type!=='image'){
      const guidance=imageModelGuidance(text);
      history.push({role:'user',content:text,attachments:pendingAttachments.map(({name,type,size,dataUrl})=>({name,type,size,dataUrl}))});
      history.push({role:'assistant',content:guidance});
      render();toast(guidance);openModelMenu();return;
    }
    const estimateAttachments=pendingAttachments.map(({name,type,size})=>({name,type,size}));
    if(!await confirmEstimatedMessageCost(taskRoutedModelId(),text,estimateAttachments))return;
    if(!current){
      const firstTitle=(text||(pendingAttachments?.[0]?.name)|| (lang==='ar'?'محادثة جديدة':'New chat')).replace(/\s+/g,' ').trim().slice(0,80);const d=await api('/api/conversations',{method:'POST',body:JSON.stringify({title:firstTitle,modelId,taskId:routedTaskId()})});
      current=d.conversation.id;
    }
    const sentAttachments=pendingAttachments.map(({name,type,size,dataUrl})=>({name,type,size,dataUrl}));
    pendingAttachments=[];renderAttachmentStrip();streamQueue='';if(streamTimer){cancelAnimationFrame(streamTimer);streamTimer=0}streamDrainResolve=null;firstStreamChunkSeen=false;streaming=true;controller=new AbortController();
    history.push({role:'user',content:text||(lang==='ar'?'حلل الملفات المرفقة':'Analyze the attached files'),attachments:sentAttachments});
    $('prompt').value='';autoSize();render();$('status').textContent='';setSendButtonState('streaming');
    if(selectedModel()?.type==='image'){await generateImageMessage(text,sentAttachments);return}
    const requestLanguage=/[\u0600-\u06FF]/.test(text)?'ar':'en';history.push({role:'assistant',content:'',requestLanguage,usedWebSearch:effectiveWebSearch,streamStage:'analyzing'});render();stageTimer=setTimeout(()=>{const m=history.at(-1);if(streaming&&m?.role==='assistant'&&!m.content){m.streamStage=effectiveWebSearch?'searching':'writing';updateStreamingBubble();syncComposerStreamStatus(m)}},650);
    let r;try{r=await fetchWithClientTimeout('/api/chat',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-UI-Language':lang,Authorization:`Bearer ${auth.token}`},body:JSON.stringify({conversationId:current,modelId,messages:history.slice(0,-1),temperature:.7,webSearch:effectiveWebSearch,attachments:sentAttachments,requestId:newRequestId(),locale:lang,taskId:routedTaskId()})},45000)}catch(error){throw friendlyClientError(error,lang==='ar'?'تعذر الاتصال بخدمة المحادثة. تحقق من الإنترنت ثم حاول مرة أخرى.':'Could not connect to the chat service. Check your internet connection and try again.')}
    if(!r.ok){const d=await r.json().catch(()=>({}));throw makeUiError(d.error||statusMessage(r.status),d.code||`HTTP_${r.status}`,{status:r.status,availableTokens:d.availableTokens,requiredTokens:d.requiredTokens,shortfall:d.shortfall})}
    if(!r.body)throw makeUiError(lang==='ar'?'تعذر بدء بث الإجابة في هذا المتصفح. حدّث المتصفح وحاول مرة أخرى.':'Could not start response streaming in this browser. Update the browser and try again.','STREAM_INTERRUPTED');
    const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='',completed=false,lowBalanceInfo=null;
    while(true){const {done,value}=await readStreamWithIdleTimeout(reader,60000);if(done)break;buffer+=decoder.decode(value,{stream:true});const parts=buffer.split('\n\n');buffer=parts.pop()||'';for(const part of parts){const line=part.split('\n').find(x=>x.startsWith('data:'));if(!line)continue;let d;try{d=JSON.parse(line.slice(5))}catch{continue}if(d.type==='delta'){const m=history.at(-1);if(m)m.streamStage='writing';enqueueStreamText(d.text)}if(d.type==='done'){completed=true;lowBalanceInfo=d.lowBalance?d:null;const m=history[history.length-1];m.streamComplete=true;m.routedModelId=d.routedModelId;m.requestedModelId=d.requestedModelId;m.fallbackUsed=Boolean(d.fallbackUsed);m.generationId=d.generationId;m.id=d.messageId||m.id;m.chargedTokens=Number(d.chargedTokens||0);m.selectedModelName=d.selectedModelName||'';m.providerUsd=Number(d.providerUsd||0);m.autoSelected=Boolean(d.autoSelected);m.token_usage={...(m.token_usage||{}),...(d.usage||{}),webSearch:Boolean(m.usedWebSearch),chargedTokens:Number(d.chargedTokens||0),remainingTokens:Number(d.remainingTokens||0),fallbackUsed:Boolean(d.fallbackUsed),routedModelId:d.routedModelId,requestedModelId:d.requestedModelId,selectedModelName:d.selectedModelName||'',providerUsd:Number(d.providerUsd||0),autoSelected:Boolean(d.autoSelected)}}if(d.type==='error')throw makeUiError(d.error||statusMessage(500),d.code||'SERVER_ERROR',{availableTokens:d.availableTokens,requiredTokens:d.requiredTokens,shortfall:d.shortfall})}}
    if(!completed)throw makeUiError(lang==='ar'?'انقطع الاتصال قبل اكتمال الإجابة. أعد المحاولة؛ لن يُخصم رصيد عن رد غير مكتمل.':'The connection ended before the answer was complete. Try again; an incomplete response will not be charged.','STREAM_INTERRUPTED');
    clearTimeout(stageTimer);await drainStreamQueue();streaming=false;render();await Promise.all([refreshMe(),loadChats()]);if(lowBalanceInfo)showLowBalance(lowBalanceInfo.remainingTokens);
  }catch(e){
    if(streamTimer){cancelAnimationFrame(streamTimer);streamTimer=0}streamQueue='';if(streamDrainResolve){streamDrainResolve();streamDrainResolve=null}streaming=false;
    if(e.name==='AbortError'){if(!history.at(-1)?.content)history.pop();toast(lang==='ar'?'تم إيقاف الإجابة':'Response stopped')}
    else{if(e?.code==='FREE_DAILY_LIMIT'){const requestLanguage=history.at(-1)?.requestLanguage||lang;history[history.length-1]={role:'assistant',content:'',generatedImage:null,uiCard:'free-daily-limit',requestLanguage};const t=I18N[requestLanguage]||I18N[lang];toast(t.freeLimitTitle)}else{const friendly=friendlyClientError(e,lang==='ar'?'حدث عطل مؤقت. حاول مرة أخرى؛ لم يتم خصم رصيدك.':'A temporary error occurred. Try again; your balance was not charged.');if(history.at(-1)?.role==='assistant'&&!history.at(-1)?.content)history.at(-1).content=friendly.message;toast(friendly.message);handleActionableError(friendly)}}
    render();
  }finally{
    if(stageTimer)clearTimeout(stageTimer);streaming=false;controller=null;sendInteractionLocked=false;$('status').textContent='';$('status').classList.remove('stream-status');setSendButtonState('idle');
  }
}
async function continueResponse(index){
  if(streaming)return;
  const target=history[index];
  if(!target||target.role!=='assistant'||!target.content||target.generatedImage)return;
  if(index!==history.length-1){toast(lang==='ar'?'يمكن استكمال آخر رد فقط':'Only the latest response can be continued');return}
  if(!await aiwayConfirm(I18N[lang].continueConfirm,{title:lang==='ar'?'استكمال الرد؟':'Continue the response?',confirmText:lang==='ar'?'أكمل الرد':'Continue response',cancelText:lang==='ar'?'إلغاء':'Cancel',note:lang==='ar'?'سيُحسب الاستكمال كطلب جديد، وتُخصم التكلفة الفعلية فقط حسب النموذج والاستخدام.':'Continuation is a new request. Only its actual model usage will be charged.'}))return;
  let stageTimer=0;
  try{
    if(!auth){await login();return}
    if(userProfile&&Number(userProfile.has_purchased?userProfile.ai_tokens:(userProfile.free_trial_tokens??userProfile.trial_messages_remaining??0))<=0)throw makeUiError(lang==='ar'?'رصيدك انتهى. اشحن رصيدًا جديدًا ثم حاول مرة أخرى.':'Your balance has run out. Add more balance, then try again.','INSUFFICIENT_TOKENS',{availableTokens:0});
    if(!current||!target.id){toast(lang==='ar'?'احفظ المحادثة أولًا ثم حاول مرة أخرى':'Save the conversation first, then try again');return}
    const modelId=activeTask&&activeTask!=='all-models'?'aiway/auto':($('model').value||target.model_id||target.routedModelId||target.token_usage?.activeModelId||'openrouter/auto');
    streamQueue='';if(streamTimer){cancelAnimationFrame(streamTimer);streamTimer=0}streamDrainResolve=null;firstStreamChunkSeen=false;streaming=true;controller=new AbortController();
    target.requestLanguage=target.requestLanguage||lang;target.streamStage='writing';render();$('status').textContent=I18N[lang].continueResponse;setSendButtonState('streaming');
    let r;try{r=await fetchWithClientTimeout('/api/chat',{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-UI-Language':lang,Authorization:`Bearer ${auth.token}`},body:JSON.stringify({conversationId:current,modelId,messages:history,temperature:.7,webSearch:false,attachments:[],requestId:newRequestId(),locale:lang,continueFromMessageId:target.id,taskId:routedTaskId()})},45000)}catch(error){throw friendlyClientError(error,lang==='ar'?'تعذر الاتصال بخدمة المحادثة. تحقق من الإنترنت ثم حاول مرة أخرى.':'Could not connect to the chat service. Check your internet connection and try again.')}
    if(!r.ok){const d=await r.json().catch(()=>({}));throw makeUiError(d.error||statusMessage(r.status),d.code||`HTTP_${r.status}`,{status:r.status,availableTokens:d.availableTokens,requiredTokens:d.requiredTokens,shortfall:d.shortfall})}
    if(!r.body)throw makeUiError(lang==='ar'?'تعذر بدء استكمال الإجابة في هذا المتصفح.':'Could not start continuing the response in this browser.','STREAM_INTERRUPTED');
    const reader=r.body.getReader(),decoder=new TextDecoder();let buffer='',completed=false,lowBalanceInfo=null;
    while(true){const {done,value}=await readStreamWithIdleTimeout(reader,60000);if(done)break;buffer+=decoder.decode(value,{stream:true});const parts=buffer.split('\n\n');buffer=parts.pop()||'';for(const part of parts){const line=part.split('\n').find(x=>x.startsWith('data:'));if(!line)continue;let d;try{d=JSON.parse(line.slice(5))}catch{continue}if(d.type==='delta')enqueueStreamText(d.text);if(d.type==='done'){completed=true;lowBalanceInfo=d.lowBalance?d:null;target.streamComplete=true;target.routedModelId=d.routedModelId;target.requestedModelId=d.requestedModelId;target.fallbackUsed=Boolean(d.fallbackUsed);target.generationId=d.generationId;target.id=d.messageId||target.id;target.chargedTokens=Number(d.totalChargedTokens??d.chargedTokens??target.chargedTokens??0);target.token_usage={...(target.token_usage||{}),...(d.usage||{}),chargedTokens:target.chargedTokens,remainingTokens:Number(d.remainingTokens||0),continuations:Number(d.continuations||1),routedModelId:d.routedModelId,requestedModelId:d.requestedModelId}}if(d.type==='error')throw makeUiError(d.error||statusMessage(500),d.code||'SERVER_ERROR',{availableTokens:d.availableTokens,requiredTokens:d.requiredTokens,shortfall:d.shortfall})}}
    if(!completed)throw makeUiError(lang==='ar'?'انقطع الاتصال قبل اكتمال الاستكمال. لم يتم تثبيت خصم للجزء غير المكتمل.':'The connection ended before continuation completed. No charge was finalized for the incomplete part.','STREAM_INTERRUPTED');
    await drainStreamQueue();streaming=false;render();await Promise.all([refreshMe(),loadChats()]);if(lowBalanceInfo)showLowBalance(lowBalanceInfo.remainingTokens);
  }catch(e){
    if(streamTimer){cancelAnimationFrame(streamTimer);streamTimer=0}streamQueue='';if(streamDrainResolve){streamDrainResolve();streamDrainResolve=null}streaming=false;
    if(e.name==='AbortError')toast(lang==='ar'?'تم إيقاف الاستكمال':'Continuation stopped');else{const friendly=friendlyClientError(e,lang==='ar'?'تعذر استكمال الرد. حاول مرة أخرى.':'Could not continue the response. Try again.');toast(friendly.message);handleActionableError(friendly)}render();
  }finally{if(stageTimer)clearTimeout(stageTimer);streaming=false;controller=null;$('status').textContent='';$('status').classList.remove('stream-status');setSendButtonState('idle')}
}
function regenerate(){if(streaming)return;const idx=[...history].map(x=>x.role).lastIndexOf('user');if(idx<0)return;const text=history[idx].content;history=history.slice(0,idx);$('prompt').value=text;sendMessage()}
async function copyMsg(i){
  const message=history[i];
  if(!message)return;
  try{
    const article=$('messages').querySelector(`[data-message-index="${i}"]`);
    const source=article?.querySelector('.bubble-content');
    const holder=document.createElement('div');
    holder.dir=lang==='ar'?'rtl':'ltr';
    holder.style.cssText='font-family:Arial,Tahoma,sans-serif;line-height:1.7;color:#21162d;';
    if(source)holder.innerHTML=source.innerHTML;
    else holder.innerHTML=message.role==='assistant'?renderMarkdown(message.content||''):esc(message.content||'').replace(/\n/g,'<br>');
    holder.querySelectorAll('.code-head,.file-download,button,script,style').forEach(el=>el.remove());
    const html=`<div dir="${holder.dir}" style="${holder.getAttribute('style')}">${holder.innerHTML}</div>`;
    const plain=(holder.innerText||holder.textContent||message.content||'').replace(/\n{3,}/g,'\n\n').trim();
    if(navigator.clipboard?.write&&window.ClipboardItem){
      await navigator.clipboard.write([new window.ClipboardItem({'text/html':new Blob([html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})]);
    }else if(navigator.clipboard?.writeText){
      await navigator.clipboard.writeText(plain);
    }else{
      const area=document.createElement('textarea');area.value=plain;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();document.execCommand('copy');area.remove();
    }
    toast(lang==='ar'?'تم نسخ الرد بالتنسيق النهائي':'Response copied with final formatting');
  }catch(error){console.error('Copy failed',error);toast(lang==='ar'?'تعذر النسخ':'Could not copy')}
}
let pptxLoaderPromise=null;
function ensurePptxLibrary(){if(window.PptxGenJS)return Promise.resolve();if(pptxLoaderPromise)return pptxLoaderPromise;pptxLoaderPromise=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';script.async=true;script.onload=()=>window.PptxGenJS?resolve():reject(Error('PowerPoint library unavailable'));script.onerror=()=>reject(Error('PowerPoint library unavailable'));document.head.appendChild(script)});return pptxLoaderPromise}
async function downloadPptx(jsonText){try{await ensurePptxLibrary();const data=JSON.parse(jsonText),pptx=new PptxGenJS();pptx.layout='LAYOUT_WIDE';pptx.author='AiWay';for(const item of (data.slides||[])){const slide=pptx.addSlide();slide.addText(String(item.title||''),{x:.6,y:.45,w:12.1,h:.55,fontSize:26,bold:true,margin:0});const bullets=Array.isArray(item.bullets)?item.bullets:[];slide.addText(bullets.map(x=>({text:String(x),options:{bullet:{indent:18}}})),{x:.8,y:1.35,w:11.7,h:5.3,fontSize:18,breakLine:true,margin:.08,valign:'top'})}await pptx.writeFile({fileName:String(data.filename||'AiWay-presentation.pptx').replace(/[^\w.() -]/g,'_')})}catch(e){console.error(e);toast(lang==='ar'?'تعذر إنشاء ملف PowerPoint. تحقق من صيغة المحتوى وحاول مرة أخرى.':'Could not create the PowerPoint file. Check the content format and try again.')}}
function buildHtmlProject(files,entry){let html=entry.content;for(const f of files){if(/\.css$/i.test(f.name))html=html.replace(new RegExp(`<link[^>]+href=["']${f.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*>`,'i'),`<style>${f.content}
/* AiWay introduction experience */
.intro-screen{position:fixed;inset:0;z-index:2147483640;overflow:auto;background:radial-gradient(circle at 12% 15%,rgba(244,185,66,.16),transparent 24%),radial-gradient(circle at 88% 12%,rgba(143,82,214,.22),transparent 32%),linear-gradient(145deg,#fbf8fe 0%,#f4eafa 52%,#fff 100%);display:grid;place-items:center;padding:28px 18px;transition:opacity .55s ease,visibility .55s ease}.intro-screen.hide{opacity:0;visibility:hidden;pointer-events:none}
.intro-lang{position:fixed;z-index:3;top:max(14px,env(safe-area-inset-top));right:max(14px,env(safe-area-inset-right));width:44px;height:44px;border:1px solid rgba(111,45,189,.22);border-radius:50%;background:rgba(255,255,255,.9);color:var(--pi);font-weight:900;cursor:pointer;box-shadow:0 10px 28px rgba(74,34,104,.14);backdrop-filter:blur(12px);transition:.2s ease}.intro-lang:hover{transform:translateY(-2px);box-shadow:0 14px 30px rgba(74,34,104,.2)}.intro-orb{position:absolute;border-radius:50%;filter:blur(2px);opacity:.55;animation:introFloat 7s ease-in-out infinite}.intro-orb.one{width:190px;height:190px;background:linear-gradient(145deg,#6f2dbd,#a76be6);top:-65px;right:-45px}.intro-orb.two{width:140px;height:140px;background:linear-gradient(145deg,#f4b942,#ffe5a3);bottom:7%;left:-45px;animation-delay:-2.2s}.intro-card{position:relative;width:min(1040px,100%);border:1px solid rgba(255,255,255,.86);border-radius:34px;padding:clamp(26px,5vw,58px);background:rgba(255,255,255,.78);backdrop-filter:blur(22px);box-shadow:0 32px 90px rgba(67,31,93,.18);overflow:hidden}.intro-grid{display:grid;grid-template-columns:1.08fr .92fr;align-items:center;gap:clamp(28px,5vw,68px)}.intro-logo{width:78px;height:78px;border-radius:25px;box-shadow:0 18px 38px rgba(111,45,189,.22);margin-bottom:22px}.intro-eyebrow{display:inline-flex;align-items:center;gap:8px;border:1px solid #e4d1f1;background:#f6effb;color:var(--pi);border-radius:999px;padding:8px 13px;font-weight:800;font-size:13px}.intro-title{font-size:clamp(37px,6vw,68px);line-height:1.05;margin:18px 0 16px;letter-spacing:-1.7px}.intro-title span{background:linear-gradient(135deg,var(--pi),#a65ce8);-webkit-background-clip:text;background-clip:text;color:transparent}.intro-copy{font-size:clamp(15px,2vw,18px);line-height:1.95;color:var(--muted);max-width:650px}.intro-actions{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:27px}.intro-start{border:0;border-radius:17px;padding:14px 24px;color:#fff;background:linear-gradient(135deg,var(--pi),var(--pi2));font-weight:900;cursor:pointer;box-shadow:0 14px 32px rgba(111,45,189,.28);display:flex;align-items:center;gap:10px;transition:.22s ease}.intro-start:hover{transform:translateY(-3px);box-shadow:0 19px 38px rgba(111,45,189,.34)}.intro-note{font-size:12px;color:var(--muted)}.intro-features{display:grid;grid-template-columns:1fr 1fr;gap:13px}.intro-feature{min-height:145px;padding:19px;border-radius:23px;background:rgba(255,255,255,.86);border:1px solid #eadff1;box-shadow:0 12px 28px rgba(76,39,102,.07);transition:.22s ease}.intro-feature:hover{transform:translateY(-4px) rotate(-.3deg);border-color:#d5bbe7}.intro-feature-icon{width:43px;height:43px;border-radius:14px;background:var(--pi3);color:var(--pi);display:grid;place-items:center;font-size:21px;margin-bottom:13px}.intro-feature b{display:block;margin-bottom:7px;font-size:15px}.intro-feature small{color:var(--muted);line-height:1.65}.signin-guide{position:fixed;z-index:45;top:78px;left:18px;display:flex;align-items:center;gap:10px;opacity:0;transform:translateY(-8px);pointer-events:none;transition:.35s ease}.signin-guide.show{opacity:1;transform:translateY(0)}.signin-guide-text{position:relative;background:#2b1d34;color:#fff;padding:10px 13px;border-radius:13px;font-size:13px;font-weight:800;box-shadow:0 12px 28px rgba(43,29,52,.24);white-space:nowrap}.signin-guide-text:before{content:"";position:absolute;left:18px;top:-7px;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:8px solid #2b1d34}.mobile-menu.signin-pulse{animation:menuSigninPulse 1.5s ease-in-out infinite;box-shadow:0 0 0 0 rgba(111,45,189,.35)}@keyframes menuSigninPulse{0%,100%{transform:scale(1);box-shadow:0 0 0 0 rgba(111,45,189,.34)}50%{transform:scale(1.07);box-shadow:0 0 0 12px rgba(111,45,189,0)}}@keyframes introFloat{0%,100%{transform:translate3d(0,0,0) rotate(0)}50%{transform:translate3d(12px,18px,0) rotate(7deg)}}@media(max-width:780px){.intro-screen{padding:12px}.intro-card{border-radius:26px;padding:25px 19px}.intro-grid{grid-template-columns:1fr}.intro-features{grid-template-columns:1fr 1fr}.intro-feature{min-height:125px}.intro-logo{width:64px;height:64px}.signin-guide{top:68px;left:8px}.signin-guide-text{font-size:12px;padding:9px 11px}}@media(max-width:440px){.intro-features{grid-template-columns:1fr}.intro-feature{min-height:auto}.intro-title{font-size:40px}.intro-actions{align-items:stretch}.intro-start{width:100%;justify-content:center}.intro-note{text-align:center;width:100%}}

/* All-models mobile header: menu, model picker, balance — no overlap */
@media(max-width:620px){
 body.all-models-active .topbar{
  display:grid!important;
  grid-template-columns:72px minmax(0,1fr) 44px!important;
  grid-template-areas:"credits model menu"!important;
  align-items:center!important;
  gap:7px!important;
  padding:7px 9px!important;
  height:64px!important;min-height:64px!important;
 }
 body.all-models-active .mobile-menu{grid-area:menu!important;display:grid!important;width:44px!important;min-width:44px!important;height:48px!important;margin:0!important}
 body.all-models-active .model-wrap{grid-area:model!important;position:static!important;transform:none!important;width:100%!important;max-width:none!important;min-width:0!important;margin:0!important}
 body.all-models-active .model-trigger{width:100%!important;min-width:0!important;height:48px!important;padding:6px 9px!important;border-radius:15px!important}
 body.all-models-active .model-trigger-icon{display:none!important}
 body.all-models-active .model-trigger-copy{min-width:0!important}
 body.all-models-active .model-trigger-copy b{font-size:12px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
 body.all-models-active .credits{grid-area:credits!important;width:72px!important;max-width:72px!important;min-width:0!important;height:48px!important;padding:7px 6px!important;justify-content:center!important;gap:4px!important;margin:0!important;overflow:hidden!important}
 body.all-models-active .credits .credit-coin,body.all-models-active .credits .label,body.all-models-active .credits .credit-buy-label{display:none!important}
 body.all-models-active .top-tools-btn,body.all-models-active .top-login-btn,body.all-models-active .task-context,body.all-models-active .spacer,body.all-models-active .export{display:none!important}
}
@media(max-width:350px){
 body.all-models-active .topbar{grid-template-columns:58px minmax(0,1fr) 42px!important;padding-inline:6px!important;gap:5px!important}
 body.all-models-active .credits{width:58px!important;max-width:58px!important;font-size:12px!important}
 body.all-models-active .mobile-menu{width:42px!important;min-width:42px!important}
 body.all-models-active .model-trigger-copy b{font-size:11px!important}
}

/* Final compact mobile headers and visible sign-in progress */
.login-busy{position:relative!important;pointer-events:none!important;opacity:.78!important}
.login-busy svg,.login-busy [data-icon]{visibility:hidden!important}
.login-busy::before{content:"";width:17px;height:17px;flex:0 0 17px;border:2px solid currentColor;border-inline-end-color:transparent;border-radius:50%;animation:spin .7s linear infinite}
.intro-login-btn{min-width:112px;justify-content:center}.intro-login-btn.login-busy{display:inline-flex!important;align-items:center!important;gap:8px!important;min-width:176px}.intro-login-btn.login-busy::before{width:16px;height:16px;flex-basis:16px}.intro-login-btn.login-busy #introLoginLabel{white-space:nowrap}
@media(max-width:620px){
  body.all-models-active .topbar{display:grid!important;grid-template-columns:64px minmax(0,1fr) 44px!important;grid-template-areas:"credits model menu"!important;padding:7px 8px!important;gap:6px!important;overflow:visible!important}
  body.all-models-active .topbar>:not(.mobile-menu):not(.model-wrap):not(.credits){display:none!important}
  body.all-models-active .model-wrap{grid-area:model!important;display:block!important;position:static!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important}
  body.all-models-active .model-trigger{width:100%!important;min-width:0!important;max-width:none!important;height:48px!important;padding:6px 9px!important}
  body.all-models-active .model-trigger-copy b{font-size:12px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  body.all-models-active .mobile-menu{grid-area:menu!important;position:static!important;width:44px!important;min-width:44px!important;height:48px!important}
  body.all-models-active .credits{grid-area:credits!important;position:static!important;width:64px!important;min-width:64px!important;max-width:64px!important;height:48px!important;margin:0!important;padding:6px!important;justify-content:center!important;overflow:hidden!important}
  body.all-models-active .credits .credit-coin,body.all-models-active .credits .label,body.all-models-active .credits .credit-buy-label{display:none!important}

  body:not(.all-models-active) .topbar{display:grid!important;grid-template-columns:74px minmax(0,1fr) 44px!important;grid-template-areas:"credits task menu"!important;padding:7px 8px!important;gap:7px!important}
  body:not(.all-models-active) .mobile-menu{grid-area:menu!important;position:static!important;width:44px!important;min-width:44px!important;height:48px!important}
  body:not(.all-models-active) .task-context{grid-area:task!important;position:static!important;transform:none!important;display:flex!important;width:100%!important;min-width:0!important;max-width:none!important;margin:0!important;justify-content:center!important;gap:8px!important}
  body:not(.all-models-active) .task-context-copy{display:block!important;min-width:0!important;max-width:calc(100% - 48px)!important}
  body:not(.all-models-active) .task-context-copy b{display:block!important;font-size:13px!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  body:not(.all-models-active) .task-context-copy small,body:not(.all-models-active) .task-change{display:none!important}
  body:not(.all-models-active) .task-context-icon{width:40px!important;height:40px!important;flex:0 0 40px!important}
  body:not(.all-models-active) .credits{grid-area:credits!important;position:static!important;width:74px!important;min-width:74px!important;max-width:74px!important;height:48px!important;margin:0!important;padding:7px 6px!important;justify-content:center!important}
  body:not(.all-models-active) .credits .credit-coin,body:not(.all-models-active) .credits .label,body:not(.all-models-active) .credits .credit-buy-label{display:none!important}
  body:not(.all-models-active) .top-tools-btn,body:not(.all-models-active) .top-login-btn,body:not(.all-models-active) .model-wrap,body:not(.all-models-active) .spacer,body:not(.all-models-active) .export{display:none!important}
}
@media(max-width:350px){
 body.all-models-active .topbar{grid-template-columns:56px minmax(0,1fr) 42px!important;padding-inline:5px!important;gap:5px!important}
 body.all-models-active .credits{width:56px!important;min-width:56px!important;max-width:56px!important;font-size:12px!important}
 body:not(.all-models-active) .topbar{grid-template-columns:60px minmax(0,1fr) 42px!important;padding-inline:5px!important;gap:5px!important}
 body:not(.all-models-active) .credits{width:60px!important;min-width:60px!important;max-width:60px!important;font-size:12px!important}
 body:not(.all-models-active) .task-context-copy b{font-size:12px!important}
}
</style>`);if(/\.js$/i.test(f.name))html=html.replace(new RegExp(`<script[^>]+src=["']${f.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}["'][^>]*><\\/script>`,'i'),`<script>${f.content}<\\/script>`)}return html}
function previewGeneratedFile(messageIndex,fileIndex){const files=extractGeneratedFiles(history[messageIndex]?.content),file=files[fileIndex];if(!file||!/\.html?$/i.test(file.name))return;const html=buildHtmlProject(files,file);$('previewTitle').textContent=file.name;$('previewFrame').srcdoc=html;$('previewModal').classList.add('open')}
async function downloadGeneratedProject(messageIndex){const message=history[messageIndex],files=extractGeneratedFiles(message?.content);if(!files.length)return;if(!message?.id||!auth?.token)return toast(lang==='ar'?'احفظ المحادثة ثم حاول مرة أخرى':'Save the conversation and try again');try{await startNativeFileDownload({kind:'project',messageId:message.id})}catch(e){console.error(e);toast(e.message|| (lang==='ar'?'تعذر تنزيل المشروع':'Could not download the project'))}}
async function downloadGeneratedFile(messageIndex,fileIndex){const message=history[messageIndex],file=extractGeneratedFiles(message?.content)[fileIndex];if(!file)return toast(lang==='ar'?'الملف غير متاح':'File is unavailable');if(!message?.id||!auth?.token)return toast(lang==='ar'?'احفظ المحادثة ثم حاول مرة أخرى':'Save the conversation and try again');try{await startNativeFileDownload({kind:'file',messageId:message.id,fileIndex})}catch(e){console.error(e);toast(e.message|| (lang==='ar'?'تعذر تنزيل الملف':'Could not download the file'))}}
async function downloadTextFile(filename,content){
  try{
    const name=safeDownloadName(filename,'AiWay-file.txt');
    const ext=(name.split('.').pop()||'').toLowerCase();
    const mime={html:'text/html',htm:'text/html',css:'text/css',js:'text/javascript',json:'application/json',md:'text/markdown',txt:'text/plain',csv:'text/csv',xml:'application/xml'}[ext]||'text/plain';
    await triggerPiCompatibleDownload(new Blob([String(content??'')],{type:`${mime};charset=utf-8`}),name);
  }catch(error){console.error('Text file download failed',error);toast(lang==='ar'?'تعذر تنزيل الملف':'Could not download the file')}
}
async function exportChat(){if(!history.length)return toast(lang==='ar'?'لا توجد محادثة لتصديرها':'There is no conversation to export');const text=history.map(m=>`${m.role==='user'?'أنت':'AiWay'}:\n${m.content}`).join('\n\n');try{await triggerPiCompatibleDownload(new Blob([text],{type:'text/plain;charset=utf-8'}),'pi-ai-chat.txt')}catch(error){console.error('Chat export failed',error);toast(lang==='ar'?'تعذر تصدير المحادثة':'Could not export the conversation')}}
function toggleWeb(){if(userProfile&&!userProfile.has_purchased)return toast(lang==='ar'?'بحث الويب متاح بعد أول عملية شراء.':'Web search unlocks after your first purchase.');webSearch=!webSearch;const webButton=$('webPill');webButton.classList.toggle('on',webSearch);webButton.setAttribute('aria-pressed',webSearch?'true':'false');toast(webSearch?(lang==='ar'?'تم تفعيل بحث الويب':'Web search enabled'):(lang==='ar'?'تم إيقاف بحث الويب':'Web search disabled'))}
function relativeUsageTime(value){if(!value)return lang==='ar'?'لا يوجد استخدام بعد':'No usage yet';const seconds=Math.max(0,Math.floor((Date.now()-new Date(value).getTime())/1000));if(seconds<60)return lang==='ar'?'منذ لحظات':'Just now';const minutes=Math.floor(seconds/60);if(minutes<60)return lang==='ar'?`منذ ${minutes} دقيقة`:`${minutes} min ago`;const hours=Math.floor(minutes/60);if(hours<24)return lang==='ar'?`منذ ${hours} ساعة`:`${hours} hr ago`;const days=Math.floor(hours/24);return lang==='ar'?`منذ ${days} يوم`:`${days} d ago`}
function renderUsageSummary(){const u=window.aiwayUsageSummary||{};const remaining=Math.max(0,Number(userProfile?.has_purchased?userProfile?.ai_tokens:(userProfile?.free_trial_tokens??userProfile?.trial_messages_remaining)||0));const consumed=Math.max(0,Number(u.consumedTokens||0));const last=Math.max(0,Number(u.lastRequestTokens||0));const total=remaining+consumed;const percent=total>0?Math.min(100,Math.round(consumed/total*100)):0;const set=(id,text)=>{const el=$(id);if(el)el.textContent=text};set('payUsageTitle',lang==='ar'?'تفاصيل الاستهلاك':'Usage details');set('payUsagePeriod',lang==='ar'?'آخر 30 يومًا':'Last 30 days');set('payRemainingLabel',lang==='ar'?'المتبقي':'Remaining');set('payConsumedLabel',lang==='ar'?'المستهلك':'Consumed');set('payLastLabel',lang==='ar'?'آخر رسالة / طلب':'Last message / request');set('payBalance',remaining.toLocaleString('en-US'));set('payConsumed',consumed.toLocaleString('en-US'));set('payLastUsage',last.toLocaleString('en-US'));set('payUsageProgressText',lang==='ar'?`${percent}% مستخدم`:`${percent}% used`);set('payLastUsageTime',relativeUsageTime(u.lastRequestAt));const bar=$('payUsageProgress');if(bar)bar.style.width=percent+'%'}
function openPay(){if(!auth)return login();resetPaymentFlow();renderPackages();renderAccountState();renderUsageSummary();$('payModal').classList.add('open');refreshGlobalAnnouncement()}
function toggleValidityNote(id,button){const note=document.getElementById(`validity-note-${id}`);if(!note)return;const show=!note.classList.contains('show');document.querySelectorAll('.validity-note.show').forEach(x=>x.classList.remove('show'));document.querySelectorAll('.validity-help[aria-expanded="true"]').forEach(x=>x.setAttribute('aria-expanded','false'));note.classList.toggle('show',show);button?.setAttribute('aria-expanded',String(show))}
function renderPackages(){const box=document.querySelector('.packs');if(!box||!window.aiwayPackages)return;const labels=lang==='ar'?{lite:'تجربة خفيفة',starter:'أساسية',plus:'الأكثر توفيرًا',pro:'احترافية'}:{lite:'Light use',starter:'Starter',plus:'Best value',pro:'Pro'};const validity=lang==='ar'?'الرصيد صالح لمدة 30 يومًا':'Balance valid for 30 days';box.innerHTML=Object.entries(window.aiwayPackages).map(([id,p])=>{const exactPi=Number(p.amountPi||0);const displayPi=exactPi>0?Math.floor(exactPi).toLocaleString('en-US'):'--';const exactTitle=exactPi>0?(lang==='ar'?`قيمة الدفع الدقيقة: ${exactPi.toLocaleString('en-US',{maximumFractionDigits:7})} Pi`:`Exact payment: ${exactPi.toLocaleString('en-US',{maximumFractionDigits:7})} Pi`):'';return `<div class="pack ${id==='plus'?'featured':''}"><small>${labels[id]||id}</small><span class="pi-estimate" data-exact-pi="${exactPi||''}" title="${exactTitle}">${displayPi} Pi</span><b>${Number(p.tokens).toLocaleString('en-US')}</b><span class="pack-token-label">AiWay Tokens</span><span class="pack-validity-simple">${validity}</span><button class="btn ${id==='plus'?'primary':'soft'}" data-buy-pack="${esc(id)}">${lang==='ar'?'شراء بـ Pi':'Buy with Pi'}</button></div>`}).join('');box.querySelectorAll('[data-buy-pack]').forEach(btn=>btn.onclick=()=>buy(btn.dataset.buyPack))}
async function buy(packageId){
  if(!piReady||!window.Pi?.createPayment)return toast(lang==='ar'?'الدفع متاح داخل Pi Browser فقط':'Payments are available in Pi Browser only');
  let pkg=window.aiwayPackages?.[packageId];
  const quoteExpiry=new Date(pkg?.quoteExpiresAt||0).getTime();
  if(!pkg?.quoteToken||!Number.isFinite(quoteExpiry)||quoteExpiry-Date.now()<30000){try{setPaymentFlow('prepare');await loadModels();pkg=window.aiwayPackages?.[packageId]}catch(e){console.warn('Secure quote refresh:',e)}}
  if(!pkg?.amountPi||!pkg?.quoteToken){resetPaymentFlow();return toast(lang==='ar'?'تعذر جلب سعر Pi الآمن الآن. حدّث الصفحة وحاول مرة أخرى.':'Could not retrieve a secure Pi quote. Refresh and try again.')}
  const btn=document.querySelector(`[data-buy-pack="${CSS.escape(String(packageId))}"]`),original=btn?.textContent;
  if(btn){btn.disabled=true;btn.classList.add('loading');btn.textContent=lang==='ar'?'جاري التجهيز':'Preparing'}
  setPaymentFlow('prepare');
  try{
    await authenticatePiForPayments({refreshSession:true,silentRecovery:false,requirePendingResolved:true});setPaymentFlow('pi');
    await Pi.createPayment({amount:Number(pkg.amountPi),memo:`${Number(pkg.tokens).toLocaleString('en-US')} AiWay Tokens`,metadata:{packageId,usd:pkg.usd,tokens:pkg.tokens,piUsd:pkg.piUsd,quoteToken:pkg.quoteToken}}, {
      onReadyForServerApproval:async paymentId=>{setPaymentFlow('verify');return api('/api/payment-approve',{method:'POST',body:JSON.stringify({paymentId,packageId,quoteToken:pkg.quoteToken})})},
      onReadyForServerCompletion:async(paymentId,txid)=>{setPaymentFlow('credit');await api('/api/payment-complete',{method:'POST',body:JSON.stringify({paymentId,txid,packageId})});await Promise.all([refreshMe(),loadModels()]);const balanceButton=$('creditsButton');if(balanceButton){balanceButton.classList.remove('balance-pop');void balanceButton.offsetWidth;balanceButton.classList.add('balance-pop');setTimeout(()=>balanceButton.classList.remove('balance-pop'),700)}setPaymentFlow('success','success');toast(lang==='ar'?'تمت إضافة الرصيد وفتح جميع النماذج':'Balance added and all models unlocked');setTimeout(()=>{resetPaymentFlow();$('payModal')?.classList.remove('open');refreshGlobalAnnouncement()},1400)},
      onCancel:()=>{setPaymentFlow('cancel','error');toast(lang==='ar'?'تم إلغاء الدفع':'Payment cancelled');setTimeout(resetPaymentFlow,1300)},
      onError:e=>{setPaymentFlow('error','error');toast(friendlyClientError(e,lang==='ar'?'تعذر إتمام الدفع عبر Pi. حاول مرة أخرى.':'The Pi payment could not be completed. Try again.').message);setTimeout(resetPaymentFlow,1800)}
    })
  }catch(e){setPaymentFlow('error','error');toast(friendlyClientError(e,lang==='ar'?'تعذر بدء الدفع عبر Pi. حاول مرة أخرى.':'Could not start the Pi payment. Try again.').message);setTimeout(resetPaymentFlow,1800)}
  finally{if(btn){btn.disabled=false;btn.classList.remove('loading');btn.textContent=original}}
}
function autoSize(){const t=$('prompt');t.style.height='auto';t.style.height=Math.min(t.scrollHeight,180)+'px'}function closeMenu(){$('sidebar').classList.remove('open');$('backdrop').classList.remove('open');$('menuBtn')?.setAttribute('aria-expanded','false')}
const messagesBox=$('messages');
messagesBox.addEventListener('scroll',()=>{userPinnedToBottom=isNearBottom(48);wakeScrollLatestButton()},{passive:true});
messagesBox.addEventListener('wheel',e=>{if(e.deltaY<0)userPinnedToBottom=false},{passive:true});
messagesBox.addEventListener('touchstart',()=>{userPinnedToBottom=false;wakeScrollLatestButton()},{passive:true});messagesBox.addEventListener('touchmove',()=>{userPinnedToBottom=false;wakeScrollLatestButton()},{passive:true});
$('taskGrid')?.addEventListener('click',e=>{const card=e.target.closest('[data-task]');if(card)selectTask(card.dataset.task)});$('taskLanguageBtn').onclick=toggleLanguage;$('taskChangeBtn').onclick=openTaskScreen;$('topToolsBtn').onclick=openTaskScreen;$('introStart').onclick=enterChat;$('introCtaStart').onclick=enterChat;$('introLanguageBtn').onclick=toggleLanguage;$('introBrandTools').onclick=enterChat;$('introToolsLink').onclick=enterChat;const introPiLogin=async()=>{if(auth){enterChat();return}await login();if(auth)enterChat()};$('introLoginBtn').onclick=introPiLogin;$('topLoginBtn').onclick=()=>auth?null:login();const introPackages=()=>{enterChat();setTimeout(openPay,180)};$('introPackagesLink').onclick=introPackages;$('introHeroPackages').onclick=introPackages;document.querySelectorAll('[data-landing-task]').forEach(button=>button.onclick=()=>{const map={'all-models':'writing',files:'summary',translation:'translate'},id=map[button.dataset.landingTask]||button.dataset.landingTask;enterChat();setTimeout(()=>selectTask(id),120)});$('scrollLatest').onclick=()=>scrollToLatest('smooth');
// Accessible modal behavior: focus trapping, Escape-to-close, and focus restoration.
let lastModalFocus=null;
function visibleOverlay(){return [...document.querySelectorAll('.overlay.open[role="dialog"],.overlay.open[role="alertdialog"]')].pop()||null}
function focusableIn(root){return [...root.querySelectorAll('button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')].filter(el=>!el.hidden&&el.getClientRects().length)}
function closeOverlayAccessible(overlay){
  if(!overlay)return;
  if(overlay.id==='previewModal'){$('previewFrame').srcdoc=''}
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  const target=lastModalFocus;lastModalFocus=null;
  if(target?.isConnected)requestAnimationFrame(()=>target.focus({preventScroll:true}));
}
const modalObserver=new MutationObserver(entries=>entries.forEach(entry=>{
  const overlay=entry.target;if(!overlay.classList.contains('overlay'))return;
  const isOpen=overlay.classList.contains('open');
  overlay.setAttribute('aria-hidden',isOpen?'false':'true');
  if(isOpen){lastModalFocus=document.activeElement;requestAnimationFrame(()=>{const items=focusableIn(overlay);(items[0]||overlay.querySelector('.modal')||overlay).focus?.({preventScroll:true})})}
  else if(lastModalFocus?.isConnected){const target=lastModalFocus;lastModalFocus=null;requestAnimationFrame(()=>target.focus?.({preventScroll:true}))}
}));
document.querySelectorAll('.overlay[role="dialog"],.overlay[role="alertdialog"]').forEach(overlay=>{overlay.setAttribute('aria-hidden',overlay.classList.contains('open')?'false':'true');modalObserver.observe(overlay,{attributes:true,attributeFilter:['class']})});
document.addEventListener('keydown',e=>{
  const overlay=visibleOverlay();if(!overlay)return;
  if(e.key==='Escape'){
    if(overlay.id==='imagePreviewModal'&&typeof closeImagePreview==='function')closeImagePreview();
    else if(overlay.id==='aiwayDialog'&&typeof closeAiwayDialog==='function')closeAiwayDialog(false);
    else closeOverlayAccessible(overlay);
    e.preventDefault();return;
  }
  if(e.key!=='Tab')return;
  const items=focusableIn(overlay);if(!items.length){e.preventDefault();overlay.querySelector('.modal')?.focus();return}
  const first=items[0],last=items[items.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
});
$('model').onchange=e=>selectModel(e.target.value);$('modelTrigger').removeAttribute('aria-hidden');$('modelTrigger').tabIndex=0;const toggleModelMenu=e=>{e.preventDefault();e.stopPropagation();const menu=$('modelMenu');menu&&menu.classList.contains('open')?closeModelMenu():openModelMenu()};$('modelTrigger').addEventListener('click',toggleModelMenu);$('modelTrigger').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '||e.key==='ArrowDown'){toggleModelMenu(e)}});document.addEventListener('click',e=>{if(!$('modelMenu')?.contains(e.target)&&!$('modelTrigger')?.contains(e.target))closeModelMenu()});window.addEventListener('resize',()=>{positionModelMenu();positionSigninGuide()});window.visualViewport?.addEventListener('resize',positionModelMenu);window.visualViewport?.addEventListener('scroll',positionModelMenu);$('newChatBtn').onclick=newChat;$('loginBtn').onclick=()=>auth?logout():login();$('continuePiSignin').onclick=startExternalPiSignIn;if($('piSignInBtn'))$('piSignInBtn').onclick=startExternalPiSignIn;$('cancelPiSignin').onclick=closePiSigninModal;$('piSigninModal').onclick=e=>{if(e.target===$('piSigninModal'))closePiSigninModal()};$('creditsButton').onclick=openPay;$('supportBtn').onclick=openSupport;$('closeSupport').onclick=()=>$('supportModal').classList.remove('open');$('supportModal').onclick=e=>{if(e.target===$('supportModal'))$('supportModal').classList.remove('open')};$('supportSend').onclick=sendSupport;$('supportInput').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendSupport()}};$('languageBtn').onclick=toggleLanguage;$('menuBtn').onclick=()=>{dismissSigninGuide();const opening=!$('sidebar').classList.contains('open');$('sidebar').classList.toggle('open',opening);$('backdrop').classList.toggle('open',opening);$('menuBtn').setAttribute('aria-expanded',opening?'true':'false')};$('backdrop').onclick=closeMenu;$('exportBtn').onclick=exportChat;$('webPill').onclick=toggleWeb;const estimateToggle=$('costEstimateQuickToggle');if(estimateToggle){estimateToggle.onclick=()=>setCostEstimateEnabled(!costEstimateEnabled());syncCostEstimateToggle()};$('attachBtn').onclick=()=>$('fileInput').click();$('fileInput').onchange=e=>addFiles(e.target.files);$('sendBtn').onclick=sendMessage;$('prompt').oninput=autoSize;$('prompt').onkeydown=e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage()}};$('aiwayDialogCancel').onclick=()=>closeAiwayDialog(false);
$('aiwayDialogConfirm').onclick=()=>closeAiwayDialog(true);
$('aiwayDialogOverlay').addEventListener('click',event=>{if(event.target===$('aiwayDialogOverlay'))closeAiwayDialog(false)});
document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if($('imagePreviewModal')?.classList.contains('open'))closeImagePreview();else if($('aiwayDialogOverlay')?.classList.contains('open'))closeAiwayDialog(false)});
$('closePay').onclick=()=>{if(!$('payModal').classList.contains('payment-busy')){$('payModal').classList.remove('open');refreshGlobalAnnouncement()}};$('payModal').onclick=e=>{if(e.target===$('payModal')&&!$('payModal').classList.contains('payment-busy')){$('payModal').classList.remove('open');refreshGlobalAnnouncement()}};document.querySelectorAll('.buy').forEach(b=>b.onclick=()=>buy(b.dataset.pack));$('closePreview').onclick=()=>{$('previewModal').classList.remove('open');$('previewFrame').srcdoc=''};$('previewModal').onclick=e=>{if(e.target===$('previewModal'))$('closePreview').click()};$('closeImagePreview').onclick=closeImagePreview;$('imagePreviewModal').onclick=e=>{if(e.target===$('imagePreviewModal'))closeImagePreview()};$('imageZoomIn').onclick=()=>setImagePreviewScale(imagePreviewScale+.25);$('imageZoomOut').onclick=()=>setImagePreviewScale(imagePreviewScale-.25);$('imageZoomReset').onclick=()=>setImagePreviewScale(1);$('imagePreviewStage').addEventListener('wheel',e=>{e.preventDefault();setImagePreviewScale(imagePreviewScale+(e.deltaY<0?.2:-.2))},{passive:false});$('imagePreviewStage').addEventListener('pointerdown',e=>{if(imagePreviewScale<=1)return;imagePreviewDragging=true;imagePreviewStartX=e.clientX;imagePreviewStartY=e.clientY;imagePreviewBaseX=imagePreviewX;imagePreviewBaseY=imagePreviewY;$('imagePreviewStage').setPointerCapture?.(e.pointerId)});$('imagePreviewStage').addEventListener('pointermove',e=>{if(!imagePreviewDragging)return;imagePreviewX=imagePreviewBaseX+(e.clientX-imagePreviewStartX);imagePreviewY=imagePreviewBaseY+(e.clientY-imagePreviewStartY);applyImagePreviewTransform()});['pointerup','pointercancel'].forEach(name=>$('imagePreviewStage').addEventListener(name,()=>imagePreviewDragging=false));$('imagePreviewStage').addEventListener('touchstart',e=>{if(e.touches.length===2){imagePreviewPinchDistance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);imagePreviewPinchScale=imagePreviewScale}},{passive:true});$('imagePreviewStage').addEventListener('touchmove',e=>{if(e.touches.length===2&&imagePreviewPinchDistance){const distance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);setImagePreviewScale(imagePreviewPinchScale*distance/imagePreviewPinchDistance)}},{passive:true});function syncViewportHeight(){
  const vv=window.visualViewport;
  const visualHeight=vv&&Number(vv.height)>320?Number(vv.height):0;
  const fallbackHeight=Math.max(Number(window.innerHeight)||0,Number(document.documentElement.clientHeight)||0,480);
  const h=visualHeight||fallbackHeight;
  document.documentElement.style.setProperty('--app-height',Math.round(h)+'px');
}
syncViewportHeight();
window.addEventListener('resize',syncViewportHeight,{passive:true});
window.addEventListener('orientationchange',function(){setTimeout(syncViewportHeight,150)},{passive:true});
if(window.visualViewport){window.visualViewport.addEventListener('resize',syncViewportHeight,{passive:true})}
let introAutoTimer=null;
if(document.readyState==='loading'){window.addEventListener('DOMContentLoaded',init)}else{init()}
