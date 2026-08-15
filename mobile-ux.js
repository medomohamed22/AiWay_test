(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const mobile=()=>matchMedia('(max-width:768px)').matches;
  const app=()=>window.AiWayApp||{};
  const labels={
    ar:{tools:'الأدوات',chats:'المحادثات',images:'الصور',credits:'الرصيد',account:'الحساب',search:'ابحث عن أداة',all:'كل الأدوات',newChat:'محادثة جديدة',newImage:'إنشاء صورة',balance:'رصيدك الحالي',packs:'عرض وشراء الباقات',login:'تسجيل الدخول بحساب Pi',logout:'تسجيل الخروج',language:'اللغة',support:'الدعم والمساعدة',emptyChats:'لا توجد محادثات بعد.',emptyImages:'لا توجد صور بعد.',imageTitle:'صورك',imageCopy:'أنشئ صورة جديدة أو افتح صورك السابقة.',loading:'جارٍ التحميل…',loadError:'تعذر تحميل المحتوى. حاول مرة أخرى.',privacy:'سياسة الخصوصية',terms:'شروط الاستخدام',creditsNote:'الدفع يتم بأمان عبر Pi Network باستخدام نظام الدفع الحالي.'},
    en:{tools:'Tools',chats:'Chats',images:'Images',credits:'Credits',account:'Account',search:'Search tools',all:'All Tools',newChat:'New chat',newImage:'Create image',balance:'Current balance',packs:'View & buy packages',login:'Sign in with Pi',logout:'Sign out',language:'Language',support:'Support & Help',emptyChats:'No conversations yet.',emptyImages:'No images yet.',imageTitle:'Your images',imageCopy:'Create a new image or open one from your history.',loading:'Loading…',loadError:'Could not load content. Try again.',privacy:'Privacy Policy',terms:'Terms of Service',creditsNote:'Payments are securely handled through Pi Network.'}
  };
  let activeTab='tools';
  let imageLoadToken=0;
  const isAr=()=>document.documentElement.lang==='ar'||document.documentElement.dir==='rtl';
  const t=()=>labels[isAr()?'ar':'en'];
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const menuIcon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 7h14M5 12h14M5 17h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  const backIcon='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="m14.5 5-7 7 7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function syncHeader(){
    if(!mobile())return;
    if($('mobileTaskName'))$('mobileTaskName').textContent='AiWay';
    const button=$('menuBtn');if(!button)return;
    const workspace=document.body.classList.contains('mobile-workspace');
    button.innerHTML=workspace?backIcon:menuIcon;
    button.classList.toggle('mobile-back-mode',workspace);
    button.setAttribute('aria-label',workspace?(isAr()?'الرجوع إلى الأدوات':'Back to tools'):(isAr()?'القائمة':'Menu'));
  }
  function syncText(){
    const x=t();
    document.querySelectorAll('[data-mobile-label]').forEach(el=>{const key=el.dataset.mobileLabel;if(x[key])el.textContent=x[key]});
    [['mobileToolsHeading','tools'],['mobileChatsHeading','chats'],['mobileImagesHeading','images'],['mobileCreditsHeading','credits'],['mobileAccountHeading','account'],['mobileAllToolsTitle','all'],['mobileBalanceLabel','balance'],['mobileImageHeroTitle','imageTitle'],['mobileImageHeroCopy','imageCopy']].forEach(([id,key])=>{if($(id))$(id).textContent=x[key]});
    if($('mobileToolSearch'))$('mobileToolSearch').placeholder=x.search;
    if($('mobileNewChat')?.querySelector('span'))$('mobileNewChat').querySelector('span').textContent=x.newChat;
    if($('mobileNewImage')?.querySelector('span'))$('mobileNewImage').querySelector('span').textContent=x.newImage;
    if($('mobileOpenPackages'))$('mobileOpenPackages').textContent=x.packs;
    if($('mobileLanguageButtonText'))$('mobileLanguageButtonText').textContent=x.language;
    if($('mobileAccountSupport'))$('mobileAccountSupport').textContent=x.support;
    if($('mobilePrivacyLink'))$('mobilePrivacyLink').textContent=x.privacy;if($('mobileTermsLink'))$('mobileTermsLink').textContent=x.terms;if($('mobileCreditsNote'))$('mobileCreditsNote').textContent=x.creditsNote;
    syncAccount();syncLanguagePopover();syncHeader();
  }
  function setWorkspace(on){
    document.body.classList.toggle('mobile-workspace',Boolean(on&&mobile()));
    if(on)document.querySelectorAll('.mobile-hub-screen').forEach(screen=>screen.classList.remove('active'));
    syncHeader();
  }
  function showTab(tab){
    if(!mobile())return;
    activeTab=tab;setWorkspace(false);closeLanguagePopover();
    document.querySelectorAll('[data-mobile-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mobileTab===tab));
    document.querySelectorAll('[data-mobile-screen]').forEach(screen=>screen.classList.toggle('active',screen.dataset.mobileScreen===tab));
    if(tab==='tools')renderTools();
    else if(tab==='chats')renderChats();
    else if(tab==='images')renderImages();
    else syncAccount();
  }
  function openTool(id){
    const action=app().selectTask;
    const opened=typeof action==='function'?action(id):false;
    if(opened===false)return;
    setWorkspace(true);
    requestAnimationFrame(()=>$('prompt')?.focus({preventScroll:true}));
  }
  function toolCardFrom(source){
    const id=source.dataset.task,name=source.querySelector('b')?.textContent||id,desc=source.querySelector('small')?.textContent||'';
    const card=document.createElement('button');card.type='button';card.className='mobile-tool-card';card.dataset.mobileTool=id;card.dataset.search=(name+' '+desc).toLocaleLowerCase();
    card.innerHTML=`<span class="task-card-icon">${source.querySelector('.task-card-icon')?.innerHTML||'✦'}</span><b></b><small></small>`;
    card.querySelector('b').textContent=name;card.querySelector('small').textContent=desc;card.addEventListener('click',()=>openTool(id));return card;
  }
  function renderTools(){
    try{window.renderTaskScreen?.()}catch{}
    const target=$('mobileAllToolsGrid');if(!target)return;target.replaceChildren();
    document.querySelectorAll('#taskGrid [data-task]').forEach(source=>target.appendChild(toolCardFrom(source)));filterTools();
  }
  function filterTools(){
    const query=($('mobileToolSearch')?.value||'').trim().toLocaleLowerCase();
    document.querySelectorAll('#mobileAllToolsGrid .mobile-tool-card').forEach(card=>card.hidden=Boolean(query&&!card.dataset.search.includes(query)));
  }
  function formatChatTime(raw){
    if(!raw)return '';const d=new Date(raw);if(Number.isNaN(d.getTime()))return '';
    const now=new Date(),sameDay=d.toDateString()===now.toDateString();const yesterday=new Date(now);yesterday.setDate(now.getDate()-1);
    if(sameDay)return d.toLocaleTimeString(isAr()?'ar-EG':'en-US',{hour:'numeric',minute:'2-digit'});
    if(d.toDateString()===yesterday.toDateString())return isAr()?'أمس':'Yesterday';
    if(now-d<6*86400000)return d.toLocaleDateString(isAr()?'ar-EG':'en-US',{weekday:'short'});
    return d.toLocaleDateString(isAr()?'ar-EG':'en-US',{day:'numeric',month:'short'});
  }
  function renderChats(){
    const target=$('mobileChatList'),source=$('chats');if(!target||!source)return;
    const rows=[...source.querySelectorAll('.chat-item')];
    if(!rows.length){target.innerHTML=source.querySelector('.chat-load-error')?`<div class="mobile-empty-state">${escapeHtml(source.textContent.trim()||t().loadError)}</div>`:`<div class="mobile-empty-state">${t().emptyChats}</div>`;return}
    target.replaceChildren();
    rows.forEach(row=>{
      const wrap=document.createElement('div');wrap.className='mobile-chat-row';wrap.dataset.id=row.dataset.id;
      const open=document.createElement('button');open.type='button';open.className='mobile-chat-open';
      const title=row.querySelector('.chat-title-wrap > span')?.textContent||row.textContent.trim();
      const preview=row.dataset.preview||(row.dataset.task==='image'?(isAr()?'محادثة صور':'Image chat'):(isAr()?'محادثة AiWay':'AiWay chat'));
      const when=formatChatTime(row.dataset.updated);
      open.innerHTML=`<span class="chat-kind-icon">${row.querySelector('.chat-kind-icon')?.innerHTML||'◌'}</span><span class="mobile-chat-copy"><b></b><small>${escapeHtml(preview)}</small></span><time>${escapeHtml(when)}</time>`;open.querySelector('b').textContent=title;
      open.addEventListener('click',()=>{const action=app().openConversation;if(typeof action==='function')action(row.dataset.id);else row.click();setWorkspace(true)});
      const menu=document.createElement('button');menu.type='button';menu.className='mobile-chat-options';menu.setAttribute('aria-label',isAr()?'خيارات المحادثة':'Chat options');menu.textContent='⋮';
      menu.addEventListener('click',()=>row.querySelector('[data-delete]')?.click());
      wrap.append(open,menu);target.appendChild(wrap);
    });
  }
  async function renderImages(){
    const target=$('mobileImageHistory');if(!target)return;const token=++imageLoadToken;
    target.innerHTML='<div class="mobile-skeleton-grid"><i></i><i></i><i></i><i></i></div>';
    try{
      const images=await app().loadRecentImages?.(24);if(token!==imageLoadToken)return;
      if(!images?.length){target.innerHTML=`<div class="mobile-empty-state">${t().emptyImages}</div>`;return}
      target.replaceChildren();images.forEach(image=>{
        const src=image.display_url||image.thumbnail_data||image.source_url;if(!src)return;
        const button=document.createElement('button');button.type='button';button.className='mobile-image-item';button.innerHTML=`<img loading="lazy" decoding="async" alt="${isAr()?'صورة مولدة':'Generated image'}">`;button.querySelector('img').src=src;
        button.addEventListener('click',()=>app().openImageUrlPreview?.(src,isAr()?'معاينة الصورة المولدة':'Generated image preview'));target.appendChild(button);
      });
    }catch(error){if(token===imageLoadToken)target.innerHTML=`<div class="mobile-empty-state">${t().loadError}</div>`}
  }
  function syncAccount(){
    if($('mobileBalanceValue'))$('mobileBalanceValue').textContent=$('credits')?.textContent||'0';
    if($('mobileProfileName'))$('mobileProfileName').textContent=$('profileName')?.textContent||'Guest';
    if($('mobileProfileState'))$('mobileProfileState').textContent=$('profileState')?.textContent||'';
    if($('mobileProfileAvatar'))$('mobileProfileAvatar').textContent=$('userAvatar')?.textContent||'π';
    if($('mobileAccountLogin'))$('mobileAccountLogin').textContent=app().isAuthenticated?.()?t().logout:t().login;
  }
  function syncViewport(){
    if(!mobile()){document.body.classList.remove('mobile-workspace');return}
    document.documentElement.style.setProperty('--mobile-vvh',`${window.visualViewport?.height||innerHeight}px`);
  }
  function syncLanguagePopover(){
    const current=isAr()?'ar':'en';$('mobileLanguagePopover')?.querySelectorAll('[data-mobile-language]').forEach(btn=>{const active=btn.dataset.mobileLanguage===current;btn.classList.toggle('active',active);btn.setAttribute('aria-current',active?'true':'false')});
  }
  function closeLanguagePopover(){const pop=$('mobileLanguagePopover'),btn=$('mobileAccountLanguage');pop?.classList.remove('open');pop?.setAttribute('aria-hidden','true');btn?.setAttribute('aria-expanded','false')}
  function toggleLanguagePopover(){const pop=$('mobileLanguagePopover'),btn=$('mobileAccountLanguage');if(!pop||!btn)return;const open=!pop.classList.contains('open');pop.classList.toggle('open',open);pop.setAttribute('aria-hidden',open?'false':'true');btn.setAttribute('aria-expanded',open?'true':'false');if(open)syncLanguagePopover()}
  function chooseLanguage(value){closeLanguagePopover();app().setLanguage?.(value)}

  // The main header button is a real back control inside a tool; on hub screens it keeps the legacy menu available.
  document.addEventListener('click',event=>{if(!mobile()||!document.body.classList.contains('mobile-workspace'))return;const button=event.target.closest?.('#menuBtn');if(!button)return;event.preventDefault();event.stopPropagation();event.stopImmediatePropagation();showTab('tools')},true);

  const sheet=$('mobileToolsSheet'),more=$('composerMoreBtn');
  const syncSheet=()=>{const ar=isAr(),web=$('webPill'),estimate=$('costEstimateQuickToggle');[['mobileToolsTitle',ar?'أدوات الرسالة':'Message tools'],['mobileToolsSubtitle',ar?'أظهر فقط ما تحتاجه الآن':'Only show what you need now'],['mobileAttachLabel',ar?'إرفاق ملف':'Attach file'],['mobileWebLabel',ar?'بحث الويب':'Web search'],['mobileEstimateLabel',ar?'تقدير التكلفة':'Cost estimate'],['mobileTaskActionLabel',ar?'تغيير الأداة':'Change tool']].forEach(([id,value])=>{if($(id))$(id).textContent=value});$('mobileWebState')?.classList.toggle('on',Boolean(web?.classList.contains('on')||web?.classList.contains('active')||web?.getAttribute('aria-pressed')==='true'));$('mobileEstimateState')?.classList.toggle('on',Boolean(estimate?.classList.contains('active')||estimate?.getAttribute('aria-pressed')==='true'))};
  const openSheet=()=>{sheet?.classList.add('open');sheet?.setAttribute('aria-hidden','false');more?.setAttribute('aria-expanded','true');syncSheet()};
  const closeSheet=()=>{sheet?.classList.remove('open');sheet?.setAttribute('aria-hidden','true');more?.setAttribute('aria-expanded','false')};

  document.querySelectorAll('[data-mobile-tab]').forEach(btn=>btn.addEventListener('click',()=>showTab(btn.dataset.mobileTab)));
  $('mobileToolSearch')?.addEventListener('input',filterTools);
  $('mobileNewChat')?.addEventListener('click',async()=>{await app().newChat?.({openPicker:false});showTab('tools')});
  $('mobileNewImage')?.addEventListener('click',()=>openTool('image'));
  $('mobileOpenPackages')?.addEventListener('click',()=>app().openPayments?.());
  $('mobileAccountLogin')?.addEventListener('click',()=>app().toggleAuth?.());
  $('mobileAccountLanguage')?.addEventListener('click',event=>{event.stopPropagation();toggleLanguagePopover()});
  $('mobileAccountSupport')?.addEventListener('click',()=>app().openSupport?.());
  document.querySelectorAll('[data-mobile-language]').forEach(btn=>btn.addEventListener('click',event=>{event.stopPropagation();chooseLanguage(btn.dataset.mobileLanguage)}));
  document.addEventListener('click',event=>{if(!event.target.closest?.('#mobileLanguageControl'))closeLanguagePopover()});
  $('introHeroLogin')?.addEventListener('click',()=>app().signIn?.());
  more?.addEventListener('click',openSheet);$('mobileToolsClose')?.addEventListener('click',closeSheet);$('mobileToolsScrim')?.addEventListener('click',closeSheet);
  $('mobileAttachAction')?.addEventListener('click',()=>{closeSheet();setTimeout(()=>app().openAttachmentPicker?.(),20)});
  $('mobileWebAction')?.addEventListener('click',()=>{app().toggleWebSearch?.();syncSheet()});$('mobileEstimateAction')?.addEventListener('click',()=>{app().toggleCostEstimate?.();syncSheet()});
  $('mobileTaskAction')?.addEventListener('click',()=>{closeSheet();showTab('tools')});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){closeLanguagePopover();if(sheet?.classList.contains('open'))closeSheet()}});

  const chatsObserver=new MutationObserver(()=>{if(activeTab==='chats')renderChats()});if($('chats'))chatsObserver.observe($('chats'),{childList:true,subtree:true});
  const accountObserver=new MutationObserver(syncAccount);['credits','profileName','profileState','userAvatar'].forEach(id=>{if($(id))accountObserver.observe($(id),{childList:true,subtree:true,characterData:true})});
  const langObserver=new MutationObserver(()=>{syncText();renderTools();renderChats();if(activeTab==='images')renderImages()});langObserver.observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  window.addEventListener('resize',()=>{syncViewport();if(!mobile())closeSheet()},{passive:true});window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});

  function init(){syncText();syncViewport();syncAccount();setTimeout(()=>{renderTools();renderChats();if(mobile()&&!document.body.classList.contains('intro-mode')&&!$('introScreen')?.classList.contains('open'))showTab('tools')},100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
