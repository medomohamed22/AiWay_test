(()=>{
  'use strict';
  const d=document;
  const reduce=()=>window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const main=d.querySelector('.main');
  const messages=d.getElementById('messages');
  const body=d.body;
  let wasTaskMode=body.classList.contains('task-mode');
  let mainTimer=0;

  requestAnimationFrame(()=>body.classList.add('motion-ready'));

  // Re-run a short app entrance when the tool chooser closes.
  if(window.MutationObserver&&main){
    new MutationObserver(()=>{
      const isTaskMode=body.classList.contains('task-mode');
      if(wasTaskMode&&!isTaskMode&&!reduce()){
        main.classList.remove('motion-main-enter');
        // Force a class-based restart without layout measurements.
        requestAnimationFrame(()=>{
          main.classList.add('motion-main-enter');
          clearTimeout(mainTimer);
          mainTimer=setTimeout(()=>main.classList.remove('motion-main-enter'),420);
        });
      }
      wasTaskMode=isTaskMode;
    }).observe(body,{attributes:true,attributeFilter:['class']});
  }

  // Animate only a genuinely new trailing message index. Full render() calls may recreate
  // old DOM nodes, so node identity alone is not a reliable signal.
  let lastMessageIndex=-1;
  const readLastIndex=()=>{
    const nodes=messages?messages.querySelectorAll('.msg[data-message-index]'):[];
    if(!nodes.length)return -1;
    const value=Number(nodes[nodes.length-1].getAttribute('data-message-index'));
    return Number.isFinite(value)?value:-1;
  };
  if(messages)lastMessageIndex=readLastIndex();
  if(window.MutationObserver&&messages){
    new MutationObserver(()=>{
      const next=readLastIndex();
      if(next<0){lastMessageIndex=-1;return;}
      if(next<lastMessageIndex){lastMessageIndex=next;return;}
      if(next>lastMessageIndex&&!reduce()){
        const el=messages.querySelector('.msg[data-message-index="'+next+'"]');
        if(el){
          el.classList.add('motion-new');
          setTimeout(()=>el.classList.remove('motion-new'),300);
        }
      }
      lastMessageIndex=next;
    }).observe(messages,{childList:true});
  }

  // Pi Browser and mobile WebViews can resize when the keyboard opens.
  // Keep the existing --app-height contract synchronized with visualViewport.
  const syncViewport=()=>{
    const h=Math.round(window.visualViewport?window.visualViewport.height:window.innerHeight);
    if(h>0)d.documentElement.style.setProperty('--app-height',h+'px');
  };
  syncViewport();
  window.addEventListener('resize',syncViewport,{passive:true});
  if(window.visualViewport){
    window.visualViewport.addEventListener('resize',syncViewport,{passive:true});
  }
})();
