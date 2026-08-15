(()=>{
  const $=id=>document.getElementById(id);
  const mobile=()=>matchMedia('(max-width:768px)').matches;
  const labels={
    ar:{tools:'الأدوات',chats:'المحادثات',images:'الصور',credits:'الرصيد',account:'الحساب',search:'ابحث عن أداة',most:'الأكثر استخدامًا',all:'كل الأدوات',newChat:'جديدة',newImage:'إنشاء',balance:'رصيدك الحالي',packs:'عرض وشراء الباقات',accountLogin:'تسجيل الدخول / الخروج',language:'اللغة',support:'الدعم والمساعدة',emptyImages:'لا توجد صور حديثة بعد.',imageTitle:'حوّل فكرتك إلى صورة',imageCopy:'ابدأ وصفًا جديدًا أو افتح آخر الصور التي أنشأتها.',piSign:'تسجيل الدخول بحساب Pi'},
    en:{tools:'Tools',chats:'Chats',images:'Images',credits:'Credits',account:'Account',search:'Search tools',most:'Most Used',all:'All Tools',newChat:'New',newImage:'Create',balance:'Current balance',packs:'View & buy packages',accountLogin:'Sign in / out',language:'Language',support:'Support & Help',emptyImages:'No recent images yet.',imageTitle:'Turn your idea into an image',imageCopy:'Start a new prompt or open a recent image.',piSign:'Sign in with Pi'}
  };
  let activeTab='tools';
  const isAr=()=>document.documentElement.dir==='rtl'||document.documentElement.lang==='ar';
  const t=()=>labels[isAr()?'ar':'en'];

  function syncText(){
    const x=t();
    document.querySelectorAll('[data-mobile-label]').forEach(el=>{const k=el.dataset.mobileLabel;if(x[k])el.textContent=x[k]});
    [['mobileToolsHeading','tools'],['mobileChatsHeading','chats'],['mobileImagesHeading','images'],['mobileCreditsHeading','credits'],['mobileAccountHeading','account'],['mobileMostUsedTitle','most'],['mobileAllToolsTitle','all'],['mobileBalanceLabel','balance'],['mobileImageHeroTitle','imageTitle'],['mobileImageHeroCopy','imageCopy'],['introHeroLoginText','piSign']].forEach(([id,k])=>{if($(id))$(id).textContent=x[k]});
    if($('mobileToolSearch'))$('mobileToolSearch').placeholder=x.search;
    if($('mobileNewChat')?.querySelector('span'))$('mobileNewChat').querySelector('span').textContent=x.newChat;
    if($('mobileNewImage')?.querySelector('span'))$('mobileNewImage').querySelector('span').textContent=x.newImage;
    if($('mobileOpenPackages'))$('mobileOpenPackages').textContent=x.packs;
    if($('mobileAccountLogin'))$('mobileAccountLogin').textContent=x.accountLogin;
    if($('mobileAccountLanguage'))$('mobileAccountLanguage').textContent=x.language;
    if($('mobileAccountSupport'))$('mobileAccountSupport').textContent=x.support;
  }

  function setWorkspace(on){
    document.body.classList.toggle('mobile-workspace',Boolean(on&&mobile()));
    if(on) document.querySelectorAll('.mobile-hub-screen').forEach(s=>s.classList.remove('active'));
  }
  function showTab(tab){
    if(!mobile())return;
    activeTab=tab;
    setWorkspace(false);
    document.querySelectorAll('[data-mobile-tab]').forEach(b=>b.classList.toggle('active',b.dataset.mobileTab===tab));
    document.querySelectorAll('[data-mobile-screen]').forEach(s=>s.classList.toggle('active',s.dataset.mobileScreen===tab));
    if(tab==='tools')renderTools();
    if(tab==='chats')renderChats();
    if(tab==='images')renderImages();
    if(tab==='credits')syncAccount();
    if(tab==='account')syncAccount();
  }

  function openTool(id){
    if(typeof window.selectTask==='function')window.selectTask(id);
    else document.querySelector(`#taskGrid [data-task="${CSS.escape(id)}"]`)?.click();
    setWorkspace(true);
    requestAnimationFrame(()=>$('prompt')?.focus({preventScroll:true}));
  }

  function toolCardFrom(btn){
    const id=btn.dataset.task;
    const icon=btn.querySelector('.task-card-icon')?.innerHTML||'✦';
    const name=btn.querySelector('b')?.textContent||id;
    const desc=btn.querySelector('small')?.textContent||'';
    const card=document.createElement('button');
    card.type='button';card.className='mobile-tool-card';card.dataset.mobileTool=id;card.dataset.search=(name+' '+desc).toLowerCase();
    card.innerHTML=`<span class="task-card-icon">${icon}</span><b></b><small></small>`;
    card.querySelector('b').textContent=name;card.querySelector('small').textContent=desc;
    card.addEventListener('click',()=>openTool(id));
    return card;
  }
  function renderTools(){
    try{typeof window.renderTaskScreen==='function'&&window.renderTaskScreen()}catch{}
    const source=[...document.querySelectorAll('#taskGrid [data-task]')];
    const all=$('mobileAllToolsGrid'),most=$('mobileMostUsed');if(!all||!most)return;
    all.innerHTML='';most.innerHTML='';
    source.forEach(btn=>all.appendChild(toolCardFrom(btn)));
    const preferred=['writing','summary','image','coding'];
    preferred.forEach(id=>{const src=source.find(b=>b.dataset.task===id);if(src)most.appendChild(toolCardFrom(src))});
    filterTools();
  }
  function filterTools(){
    const q=($('mobileToolSearch')?.value||'').trim().toLowerCase();
    document.querySelectorAll('#mobileAllToolsGrid .mobile-tool-card').forEach(c=>c.hidden=Boolean(q&&!c.dataset.search.includes(q)));
  }

  function renderChats(){
    const target=$('mobileChatList'),src=$('chats');if(!target||!src)return;
    const rows=[...src.querySelectorAll('.chat-item')];
    if(!rows.length){target.innerHTML=src.querySelector('.chat-load-error')?`<div class="mobile-empty-state">${src.textContent}</div>`:'<div class="mobile-skeleton-list"><i></i><i></i><i></i></div>';return}
    target.innerHTML='';
    rows.forEach((row,index)=>{
      const item=document.createElement('button');item.type='button';item.className='mobile-chat-row';item.dataset.id=row.dataset.id;
      const icon=row.querySelector('.chat-kind-icon')?.innerHTML||'◌';
      const title=row.querySelector('.chat-title-wrap > span')?.textContent||row.textContent.trim();
      const preview=row.dataset.preview|| (row.dataset.task==='image'?(isAr()?'محادثة صور':'Image chat'):(isAr()?'محادثة AiWay':'AiWay chat'));const rawTime=row.dataset.updated;let when='';try{if(rawTime){const d=new Date(rawTime);when=d.toLocaleTimeString(isAr()?'ar-EG':'en-US',{hour:'numeric',minute:'2-digit'});}}catch{}
      item.innerHTML=`<span class="chat-kind-icon">${icon}</span><span class="mobile-chat-copy"><b></b><small>${preview}${when?' · '+when:''}</small></span><span class="mobile-chat-delete" role="button" aria-label="Delete">×</span>`;
      item.querySelector('b').textContent=title;
      item.addEventListener('click',e=>{if(e.target.closest('.mobile-chat-delete')){row.querySelector('[data-delete]')?.click();return}row.click();setWorkspace(true)});
      target.appendChild(item);
    });
  }

  function renderImages(){
    const box=$('mobileImageHistory');if(!box)return;
    const imgs=[...document.querySelectorAll('#messages .generated-image-card img')];
    if(!imgs.length){box.innerHTML=`<div class="mobile-empty-state">${t().emptyImages}</div>`;return}
    box.innerHTML='';imgs.slice().reverse().slice(0,12).forEach(img=>{
      const b=document.createElement('button');b.type='button';b.className='mobile-image-item';
      const clone=img.cloneNode();clone.removeAttribute('tabindex');b.appendChild(clone);b.addEventListener('click',()=>img.click());box.appendChild(b)
    });
  }

  function syncAccount(){
    const credits=$('credits')?.textContent||'0';if($('mobileBalanceValue'))$('mobileBalanceValue').textContent=credits;
    if($('mobileProfileName'))$('mobileProfileName').textContent=$('profileName')?.textContent||'Guest';
    if($('mobileProfileState'))$('mobileProfileState').textContent=$('profileState')?.textContent||'';
    if($('mobileProfileAvatar'))$('mobileProfileAvatar').textContent=$('userAvatar')?.textContent||'π';
  }

  function syncViewport(){
    if(!mobile()){document.body.classList.remove('mobile-workspace');return}
    const vv=window.visualViewport;const h=vv?.height||innerHeight;document.documentElement.style.setProperty('--mobile-vvh',`${h}px`);
  }

  // Existing message-tools bottom sheet
  const sheet=$('mobileToolsSheet'),more=$('composerMoreBtn');
  const syncSheet=()=>{const ar=isAr(),web=$('webPill'),estimate=$('costEstimateQuickToggle');
    if($('mobileToolsTitle'))$('mobileToolsTitle').textContent=ar?'أدوات الرسالة':'Message tools';if($('mobileToolsSubtitle'))$('mobileToolsSubtitle').textContent=ar?'أظهر فقط ما تحتاجه الآن':'Only show what you need now';
    [['mobileAttachLabel',ar?'إرفاق ملف':'Attach file'],['mobileWebLabel',ar?'بحث الويب':'Web search'],['mobileEstimateLabel',ar?'تقدير التكلفة':'Cost estimate'],['mobileTaskActionLabel',ar?'تغيير الأداة':'Change tool']].forEach(([id,v])=>{if($(id))$(id).textContent=v});
    $('mobileWebState')?.classList.toggle('on',Boolean(web?.classList.contains('on')||web?.classList.contains('active')||web?.getAttribute('aria-pressed')==='true'));$('mobileEstimateState')?.classList.toggle('on',Boolean(estimate?.classList.contains('active')||estimate?.getAttribute('aria-pressed')==='true'));
  };
  const openSheet=()=>{if(!sheet)return;sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');more?.setAttribute('aria-expanded','true');syncSheet()};
  const closeSheet=()=>{if(!sheet)return;sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');more?.setAttribute('aria-expanded','false')};

  document.querySelectorAll('[data-mobile-tab]').forEach(b=>b.addEventListener('click',()=>showTab(b.dataset.mobileTab)));
  $('mobileToolSearch')?.addEventListener('input',filterTools);
  $('mobileNewChat')?.addEventListener('click',()=>{ $('newChatBtn')?.click(); setTimeout(()=>showTab('tools'),0)});
  $('mobileNewImage')?.addEventListener('click',()=>openTool('image'));
  $('mobileOpenPackages')?.addEventListener('click',()=>$('creditsButton')?.click());
  $('mobileAccountLogin')?.addEventListener('click',()=>$('loginBtn')?.click());
  $('mobileAccountLanguage')?.addEventListener('click',()=>$('languageBtn')?.click());
  $('mobileAccountSupport')?.addEventListener('click',()=>$('supportBtn')?.click());
  $('mobileWorkspaceBack')?.addEventListener('click',()=>showTab(activeTab==='images'?'images':'tools'));
  $('introHeroLogin')?.addEventListener('click',()=>$('introLoginBtn')?.click());
  more?.addEventListener('click',openSheet);$('mobileToolsClose')?.addEventListener('click',closeSheet);$('mobileToolsScrim')?.addEventListener('click',closeSheet);
  $('mobileAttachAction')?.addEventListener('click',()=>{closeSheet();setTimeout(()=>$('attachBtn')?.click(),20)});
  $('mobileWebAction')?.addEventListener('click',()=>{$('webPill')?.click();syncSheet()});$('mobileEstimateAction')?.addEventListener('click',()=>{$('costEstimateQuickToggle')?.click();syncSheet()});
  $('mobileTaskAction')?.addEventListener('click',()=>{closeSheet();showTab('tools')});$('mobileAllToolsBtn')?.addEventListener('click',()=>showTab('tools'));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheet?.classList.contains('open'))closeSheet()});

  const chatsObs=new MutationObserver(()=>{if(activeTab==='chats')renderChats()});if($('chats'))chatsObs.observe($('chats'),{childList:true,subtree:true});
  const msgObs=new MutationObserver(()=>{if(activeTab==='images')renderImages()});if($('messages'))msgObs.observe($('messages'),{childList:true,subtree:true});
  const accountObs=new MutationObserver(syncAccount);['credits','profileName','profileState','userAvatar'].forEach(id=>{if($(id))accountObs.observe($(id),{childList:true,subtree:true,characterData:true})});
  const langObs=new MutationObserver(()=>{syncText();renderTools();renderChats();renderImages()});langObs.observe(document.documentElement,{attributes:true,attributeFilter:['dir','lang']});
  window.addEventListener('resize',()=>{syncViewport();if(!mobile())closeSheet()},{passive:true});window.visualViewport?.addEventListener('resize',syncViewport,{passive:true});

  function init(){syncText();syncViewport();syncAccount();setTimeout(()=>{renderTools();renderChats();renderImages();if(mobile()&&!document.body.classList.contains('intro-mode')&&!$('introScreen')?.classList.contains('open'))showTab('tools')},250)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
