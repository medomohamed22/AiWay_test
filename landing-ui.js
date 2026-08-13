(()=>{
 const landing={ar:{chat:['الشات الذكي','اسأل أي نموذج'],image:['إنشاء الصور','حوّل فكرتك لصورة'],summary:['التلخيص','اختصر النصوص والملفات'],coding:['البرمجة','اكتب وراجع الكود'],files:['تحليل الملفات','اسأل عن مستنداتك'],translate:['الترجمة','ترجمة طبيعية ودقيقة']},en:{chat:['Smart chat','Ask any model'],image:['Image generation','Turn ideas into images'],summary:['Summarization','Condense text and files'],coding:['Coding','Write and review code'],files:['File analysis','Ask about your documents'],translate:['Translation','Natural, accurate translation']}};
 function refreshLandingCards(){document.querySelectorAll('[data-landing-key]').forEach(btn=>{const t=landing[lang||'ar']?.[btn.dataset.landingKey];if(!t)return;btn.querySelector('b').textContent=t[0];btn.querySelector('small').textContent=t[1]})}
 function refreshMobileIdentity(){const task=activeTask||'all-models',icon=document.getElementById('mobileTaskIcon'),name=document.getElementById('mobileTaskName');if(icon)icon.innerHTML=TASK_ICONS[task]||ICONS.sparkles||'';if(name){const pair=typeof taskText==='function'?taskText(task):null;name.textContent=pair?.[0]||(lang==='ar'?'كل النماذج':'All models')}}
 const oldIntro=updateIntroLanguage;updateIntroLanguage=function(){oldIntro?.();refreshLandingCards();refreshMobileIdentity()};
 const oldContext=updateTaskContext;updateTaskContext=function(){oldContext?.();refreshMobileIdentity()};
 refreshLandingCards();refreshMobileIdentity();
 let lastTop=0,lastAt=0;const box=document.getElementById('messages'),button=document.getElementById('scrollLatest');
 box?.addEventListener('scroll',()=>{const now=performance.now(),top=box.scrollTop,down=top>lastTop+1;if(down&&now-lastAt<220)button?.classList.add('user-reading');else if(!down||Math.abs(top-lastTop)<1)button?.classList.remove('user-reading');lastTop=top;lastAt=now;clearTimeout(window.__aiwayReadTimer);window.__aiwayReadTimer=setTimeout(()=>button?.classList.remove('user-reading'),500)},{passive:true});
})();
