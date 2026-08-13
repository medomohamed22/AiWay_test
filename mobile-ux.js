(()=>{
 const $id=id=>document.getElementById(id);
 const sheet=$id('mobileToolsSheet'),more=$id('composerMoreBtn');
 const openSheet=()=>{if(!sheet)return;sheet.classList.add('open');sheet.setAttribute('aria-hidden','false');more?.setAttribute('aria-expanded','true');syncSheet();setTimeout(()=>$id('mobileToolsClose')?.focus(),30)};
 const closeSheet=()=>{if(!sheet)return;sheet.classList.remove('open');sheet.setAttribute('aria-hidden','true');more?.setAttribute('aria-expanded','false');more?.focus({preventScroll:true})};
 function copyOptions(src,dst){if(!src||!dst)return;const val=src.value;dst.innerHTML=[...src.options].map(o=>`<option value="${String(o.value).replace(/"/g,'&quot;')}">${o.textContent}</option>`).join('');dst.value=val}
 function syncSheet(){
   const ar=document.documentElement.dir==='rtl';
   const web=$id('webPill'),estimate=$id('costEstimateQuickToggle');
   $id('mobileToolsTitle').textContent=ar?'أدوات الرسالة':'Message tools';$id('mobileToolsSubtitle').textContent=ar?'أظهر فقط ما تحتاجه الآن':'Only show what you need now';$id('mobileAttachLabel').textContent=ar?'إرفاق ملف':'Attach file';$id('mobileWebLabel').textContent=ar?'بحث الويب':'Web search';$id('mobileEstimateLabel').textContent=ar?'تقدير التكلفة':'Cost estimate';$id('mobileTaskActionLabel').textContent=ar?'تغيير الأداة':'Change tool';if($id('mobileAllToolsLabel'))$id('mobileAllToolsLabel').textContent=ar?'كل الأدوات':'All tools';if($id('mobileAllToolsBtn')){$id('mobileAllToolsBtn').setAttribute('aria-label',ar?'عرض كل الأدوات':'Show all tools');$id('mobileAllToolsBtn').title=ar?'عرض كل الأدوات':'Show all tools';}
   $id('mobileWebState')?.classList.toggle('on',Boolean(web?.classList.contains('on')||web?.classList.contains('active')||web?.getAttribute('aria-pressed')==='true'));$id('mobileEstimateState')?.classList.toggle('on',Boolean(estimate?.classList.contains('active')||estimate?.getAttribute('aria-pressed')==='true'));
 }
 more?.addEventListener('click',openSheet);$id('mobileToolsClose')?.addEventListener('click',closeSheet);$id('mobileToolsScrim')?.addEventListener('click',closeSheet);
 $id('mobileAttachAction')?.addEventListener('click',()=>{closeSheet();setTimeout(()=>$id('attachBtn')?.click(),20)});
 $id('mobileWebAction')?.addEventListener('click',()=>{$id('webPill')?.click();syncSheet()});
 $id('mobileEstimateAction')?.addEventListener('click',()=>{$id('costEstimateQuickToggle')?.click();syncSheet()});
 $id('mobileTaskAction')?.addEventListener('click',()=>{closeSheet();setTimeout(()=>typeof openTaskScreen==='function'&&openTaskScreen(),20)});
 $id('mobileAllToolsBtn')?.addEventListener('click',()=>typeof openTaskScreen==='function'&&openTaskScreen());
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sheet?.classList.contains('open'))closeSheet()});
 const obs=new MutationObserver(()=>syncSheet());['webPill','costEstimateQuickToggle'].forEach(id=>{const el=$id(id);if(el)obs.observe(el,{attributes:true,attributeFilter:['class','aria-pressed']})});
 window.addEventListener('resize',()=>{if(innerWidth>700&&sheet?.classList.contains('open'))closeSheet()});
 setTimeout(syncSheet,250);
})();
