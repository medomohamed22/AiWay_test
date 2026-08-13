(()=>{
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const intro=document.getElementById('introScreen');
  if(!intro||reduce)return;
  let raf=0;
  intro.addEventListener('pointermove',e=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{
      const x=Math.round((e.clientX/innerWidth)*100),y=Math.round((e.clientY/innerHeight)*100);
      intro.style.setProperty('--mx',x+'%');intro.style.setProperty('--my',y+'%');raf=0;
    });
  },{passive:true});
  const panel=document.getElementById('introToolPanel');
  if(panel&&matchMedia('(hover:hover) and (pointer:fine)').matches){
    panel.addEventListener('pointermove',e=>{
      const r=panel.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
      panel.style.transform=`perspective(900px) rotateY(${x*3}deg) rotateX(${-y*2.4}deg) translateY(-2px)`;
    },{passive:true});
    panel.addEventListener('pointerleave',()=>panel.style.transform='perspective(900px) rotateY(-1.5deg) rotateX(.5deg)');
  }
})();
