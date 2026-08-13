(() => {
  'use strict';
  const title=document.getElementById('title');
  const message=document.getElementById('message');
  const icon=document.getElementById('icon');
  const closeBtn=document.getElementById('closeBtn');
  const isAr=(navigator.language||'').toLowerCase().startsWith('ar');
  document.documentElement.lang=isAr?'ar':'en';
  document.documentElement.dir=isAr?'rtl':'ltr';
  function show(ok,text){
    icon.className=ok?'ok':'bad';icon.textContent=ok?'✓':'!';
    title.textContent=ok?(isAr?'تم تأكيد حسابك':'Account confirmed'):(isAr?'تعذر تسجيل الدخول':'Sign-in failed');
    message.textContent=text;
    closeBtn.textContent=isAr?'العودة إلى AiWay':'Return to AiWay';
    closeBtn.style.display='block';
  }
  closeBtn.onclick=()=>{
    try{window.close()}catch{}
    setTimeout(()=>location.replace('/?pi_signin=completed'),120);
  };
  async function run(){
    const params=new URLSearchParams(location.hash.slice(1));
    const state=params.get('state')||'';
    const accessToken=params.get('access_token')||'';
    const oauthError=params.get('error')||'';
    history.replaceState(null,'',location.pathname);
    if(oauthError){show(false,isAr?'ألغيت الموافقة أو انتهت صلاحية الطلب. ارجع للمتصفح الأصلي وابدأ محاولة جديدة.':'Approval was cancelled or expired. Return to the original browser and start again.');return;}
    if(!state||!accessToken){show(false,isAr?'لم ترجع Pi بيانات الدخول كاملة. ارجع للمتصفح الأصلي وابدأ محاولة جديدة.':'Pi did not return complete sign-in data. Return to the original browser and try again.');return;}
    try{
      const response=await fetch('/api/pi-login',{method:'POST',headers:{'Content-Type':'application/json','Accept-Language':isAr?'ar':'en'},body:JSON.stringify({action:'bridge-complete',accessToken,state})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||data.code||`HTTP ${response.status}`);
      show(true,isAr?`تم تأكيد ${data.username?'@'+data.username:'حسابك'}. ارجع الآن إلى المتصفح الأصلي وستجد نفسك مسجلًا تلقائيًا.`:`${data.username?'@'+data.username:'Your account'} was confirmed. Return to the original browser and you will be signed in automatically.`);
    }catch(error){
      console.error('[PI_CALLBACK_FAILED]',error);
      show(false,isAr?`لم يتمكن AiWay من إكمال الربط: ${error.message||'خطأ غير معروف'}`:`AiWay could not complete the bridge: ${error.message||'Unknown error'}`);
    }
  }
  run();
})();
