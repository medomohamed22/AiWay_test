(()=>{
  const byId=id=>document.getElementById(id), desktop=()=>matchMedia('(min-width:1024px)').matches;
  const state={tabs:[],contextChat:null};
  try{state.tabs=JSON.parse(localStorage.getItem('aiway_desktop_tabs')||'[]')}catch{}
  const saveTabs=()=>localStorage.setItem('aiway_desktop_tabs',JSON.stringify(state.tabs.slice(-8)));
  const currentChatTitle=()=>document.querySelector('.chat-item.active span')?.textContent?.trim()||'محادثة جديدة';
  function addCurrentTab(id,title){if(!id)return;state.tabs=state.tabs.filter(t=>t.id!==id);state.tabs.push({id,title:title||currentChatTitle()});saveTabs();renderTabs()}
  function renderTabs(){const box=byId('desktopTabs');if(!box)return;box.innerHTML=state.tabs.map(t=>`<div class="desktop-tab ${String(window.current||'')===t.id||document.querySelector('.chat-item.active')?.dataset.id===t.id?'active':''}" data-tab="${esc(t.id)}"><span>${String(t.title||'محادثة').replace(/[<>]/g,'')}</span><button type="button" data-close-tab="${esc(t.id)}" aria-label="إغلاق">×</button></div>`).join('');box.querySelectorAll('[data-tab]').forEach(el=>el.onclick=e=>{if(e.target.closest('[data-close-tab]'))return;document.querySelector(`.chat-item[data-id="${CSS.escape(el.dataset.tab)}"]`)?.click()});box.querySelectorAll('[data-close-tab]').forEach(b=>b.onclick=e=>{e.stopPropagation();state.tabs=state.tabs.filter(t=>t.id!==b.dataset.closeTab);saveTabs();renderTabs()})}
  const setText=(id,value)=>{const el=byId(id);if(el&&el.textContent!==String(value))el.textContent=String(value)};
  function bindChatItems(){document.querySelectorAll('#chats .chat-item').forEach(el=>{if(el.dataset.desktopBound)return;el.dataset.desktopBound='1';el.addEventListener('click',()=>setTimeout(()=>addCurrentTab(el.dataset.id,el.querySelector('span')?.textContent),80));el.addEventListener('contextmenu',e=>{if(!desktop())return;e.preventDefault();state.contextChat=el;showContext(e.clientX,e.clientY)})})}
  let refreshQueued=false;function refreshDesktopChats(){if(refreshQueued)return;refreshQueued=true;requestAnimationFrame(()=>{refreshQueued=false;bindChatItems();renderTabs()})}
  const chatsRoot=byId('chats');if(chatsRoot){new MutationObserver(refreshDesktopChats).observe(chatsRoot,{childList:true});bindChatItems()}
  let dragDepth=0;addEventListener('dragenter',e=>{if(!desktop()||!e.dataTransfer?.types?.includes('Files'))return;dragDepth++;byId('desktopDropZone')?.classList.add('open')});addEventListener('dragleave',()=>{if(--dragDepth<=0){dragDepth=0;byId('desktopDropZone')?.classList.remove('open')}});addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('Files'))e.preventDefault()});addEventListener('drop',e=>{dragDepth=0;byId('desktopDropZone')?.classList.remove('open');if(!desktop()||!e.dataTransfer?.files?.length)return;e.preventDefault();if(typeof addFiles==='function')addFiles(e.dataTransfer.files)});
  const commands=()=>[{label:'محادثة جديدة',hint:'Ctrl+N',run:()=>byId('newChatBtn')?.click()},{label:'التركيز على مربع الكتابة',hint:'/',run:()=>byId('prompt')?.focus()},{label:'إرفاق ملف',hint:'',run:()=>byId('fileInput')?.click()},{label:'تصدير المحادثة',hint:'',run:()=>byId('exportBtn')?.click()},{label:'تغيير اللغة',hint:'',run:()=>byId('languageBtn')?.click()},...Array.from(document.querySelectorAll('.chat-item')).map(el=>({label:'فتح: '+(el.querySelector('span')?.textContent||'محادثة'),hint:'محادثة',run:()=>el.click()}))];
  function renderCommands(){const q=(byId('commandInput')?.value||'').trim().toLowerCase(),items=commands().filter(x=>x.label.toLowerCase().includes(q)).slice(0,20);byId('commandResults').innerHTML=items.map((x,i)=>`<button class="command-item ${i===0?'active':''}" data-command="${i}"><span>${x.label}</span><small>${x.hint}</small></button>`).join('');byId('commandResults').querySelectorAll('[data-command]').forEach(b=>b.onclick=()=>{items[Number(b.dataset.command)]?.run();closeCommands()})}
  function openCommands(){if(!desktop())return;byId('commandPalette').classList.add('open');byId('commandInput').value='';renderCommands();setTimeout(()=>byId('commandInput').focus(),0)}function closeCommands(){byId('commandPalette').classList.remove('open')}byId('commandBtn')?.addEventListener('click',openCommands);byId('commandInput')?.addEventListener('input',renderCommands);byId('commandPalette')?.addEventListener('click',e=>{if(e.target===byId('commandPalette'))closeCommands()});
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommands()}else if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='n'){e.preventDefault();byId('newChatBtn')?.click()}else if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();byId('sendBtn')?.click()}else if(e.key==='Escape'){closeCommands();hideContext();byId('desktopPreviewPane')?.classList.remove('open')}else if(e.key==='/'&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)){e.preventDefault();byId('prompt')?.focus()}});
  function showContext(x,y){const m=byId('desktopContextMenu');m.innerHTML='<button data-act="open">فتح</button><button data-act="tab">فتح في تبويب</button><button data-act="copy">نسخ الاسم</button><button data-act="delete">حذف</button>';m.style.left=Math.min(x,innerWidth-210)+'px';m.style.top=Math.min(y,innerHeight-190)+'px';m.classList.add('open');m.querySelectorAll('button').forEach(b=>b.onclick=async()=>{const el=state.contextChat;if(b.dataset.act==='open')el?.click();if(b.dataset.act==='tab')addCurrentTab(el?.dataset.id,el?.querySelector('span')?.textContent);if(b.dataset.act==='copy')await navigator.clipboard?.writeText(el?.querySelector('span')?.textContent||'');if(b.dataset.act==='delete')el?.querySelector('[data-delete]')?.click();hideContext()})}function hideContext(){byId('desktopContextMenu')?.classList.remove('open')}addEventListener('click',e=>{if(!e.target.closest('#desktopContextMenu'))hideContext()});
  document.addEventListener('click',e=>{if(!desktop())return;const img=e.target.closest('.message-image,.generated-image,img[data-preview],.bubble img');if(!img)return;const src=img.currentSrc||img.src;if(!src)return;e.preventDefault();const pane=byId('desktopPreviewPane');byId('desktopPreviewTitle').textContent=img.alt||'معاينة الصورة';byId('desktopPreviewBody').innerHTML='';const clone=new Image();clone.src=src;clone.alt=img.alt||'';byId('desktopPreviewBody').appendChild(clone);pane.classList.add('open')},true);byId('desktopPreviewClose')?.addEventListener('click',()=>byId('desktopPreviewPane').classList.remove('open'));
  renderTabs();
})();

/* AiWay professional UX layer: task search/filter, offline state, lazy media, adaptive polish */
(()=>{
  const $=id=>document.getElementById(id);
  const copy={
    ar:{search:'ابحث عن أداة أو مهمة...',all:'الكل',productivity:'إنتاجية',creative:'إبداع',study:'دراسة',business:'أعمال',results:n=>`${n} أداة متاحة`,emptyTitle:'لا توجد أداة مطابقة',emptyCopy:'جرّب كلمة بحث أخرى أو اختر تصنيفًا مختلفًا.',offline:'أنت غير متصل بالإنترنت — بعض المزايا قد لا تعمل.'},
    en:{search:'Search tools or tasks...',all:'All',productivity:'Productivity',creative:'Creative',study:'Study',business:'Business',results:n=>`${n} tools available`,emptyTitle:'No matching tool',emptyCopy:'Try another search term or choose a different category.',offline:'You are offline — some features may be unavailable.'}
  };
  const groups={all:[],productivity:['writing','summary','translate','coding'],creative:['image','ads','writing'],study:['study','summary','translate'],business:['business','ads','writing','summary']};
  let activeFilter='all';
  const lang=()=>document.documentElement.lang==='ar'||document.documentElement.dir==='rtl'?'ar':'en';
  const current=()=>copy[lang()];
  function ensureFilters(){
    const box=$('taskFilters'), input=$('taskSearch'); if(!box||!input)return;
    const c=current(); input.placeholder=c.search; input.setAttribute('aria-label',c.search);
    box.innerHTML=['all','productivity','creative','study','business'].map(k=>`<button type="button" class="task-filter ${activeFilter===k?'active':''}" data-filter="${k}" aria-pressed="${activeFilter===k?'true':'false'}">${c[k]}</button>`).join('');
    box.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{activeFilter=b.dataset.filter;ensureFilters();applyTaskFilter()}));
  }
  function normalize(s){return (s||'').toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F]/g,'').trim()}
  function applyTaskFilter(){
    const grid=$('taskGrid'), input=$('taskSearch'), empty=$('taskEmpty'), meta=$('taskResultMeta');if(!grid||!input)return;
    const q=normalize(input.value), allowed=groups[activeFilter]||[]; let visible=0;
    grid.querySelectorAll('.task-card').forEach(card=>{
      const id=card.dataset.task||'', text=normalize(card.textContent), categoryOk=activeFilter==='all'||allowed.includes(id), queryOk=!q||text.includes(q);
      const show=categoryOk&&queryOk; card.hidden=!show; if(show)visible++;
    });
    const pro=grid.querySelector('.task-pro-wrap'); if(pro)pro.hidden=Boolean(q)||activeFilter!=='all';
    const more=grid.querySelector('#taskMoreToggle'); if(more)more.hidden=Boolean(q)||activeFilter!=='all';
    const moreGrid=grid.querySelector('#taskMoreGrid'); if(moreGrid&&(q||activeFilter!=='all'))moreGrid.classList.add('open');
    if(empty){empty.hidden=visible!==0;const b=empty.querySelector('b'),s=empty.querySelector('small');if(b)b.textContent=current().emptyTitle;if(s)s.textContent=current().emptyCopy}
    if(meta)meta.textContent=current().results(visible);
  }
  function initTaskDiscovery(){ensureFilters();const input=$('taskSearch');if(input&&!input.dataset.bound){input.dataset.bound='1';input.addEventListener('input',applyTaskFilter)}applyTaskFilter()}
  const grid=$('taskGrid');if(grid)new MutationObserver(()=>requestAnimationFrame(initTaskDiscovery)).observe(grid,{childList:true,subtree:false});
  initTaskDiscovery();
  addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'&&$('taskScreen')?.classList.contains('open')){e.preventDefault();$('taskSearch')?.focus();$('taskSearch')?.select()}});

  function offlineBanner(){let b=$('networkBanner');if(!b){b=document.createElement('div');b.id='networkBanner';b.className='network-banner';b.setAttribute('role','status');document.body.appendChild(b)}b.textContent=current().offline;b.classList.toggle('show',!navigator.onLine)}
  addEventListener('online',offlineBanner);addEventListener('offline',offlineBanner);offlineBanner();

  const lazy=(root=document)=>root.querySelectorAll('img:not([loading])').forEach(img=>{if(!img.closest('.intro-brand,.brand-mark,.task-brand,.aiway-dialog-brand')){img.loading='lazy';img.decoding='async'}});
  lazy();new MutationObserver(m=>m.forEach(x=>x.addedNodes.forEach(n=>{if(n.nodeType===1)lazy(n)}))).observe(document.body,{childList:true,subtree:true});

  // Improve focus visibility for keyboard users and mark touch/desktop mode for responsive CSS.
  const syncMode=()=>{document.documentElement.dataset.viewport=innerWidth>=1024?'desktop':innerWidth>=700?'tablet':'phone'};syncMode();addEventListener('resize',syncMode,{passive:true});
})();
