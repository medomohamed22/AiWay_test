(()=>{
 const updateDropText=()=>{const el=document.getElementById('desktopDropText');if(el)el.textContent=document.documentElement.lang==='ar'||document.documentElement.dir==='rtl'?'اسحب الملفات هنا لإضافتها إلى المحادثة':'Drop files here to attach them to the conversation'};
 new MutationObserver(updateDropText).observe(document.documentElement,{attributes:true,attributeFilter:['lang','dir']});
 updateDropText();
})();
