// Keep first paint independent from deployment checks and Service Worker updates.
// Pi Browser can be noticeably delayed when these network operations run in <head>.
window.addEventListener('load',()=>{
  const run=async()=>{
    try{
      if('serviceWorker' in navigator){
        const registration=await navigator.serviceWorker.register('/sw.js?v=8',{updateViaCache:'none'});
        registration.update().catch(()=>{});
        // Remove the old app-shell caches that could return an empty navigation response in Pi Browser.
        if('caches' in window){
          const keys=await caches.keys();
          await Promise.all(keys.filter(key=>key.startsWith('aiway-shell-')).map(key=>caches.delete(key)));
        }
      }
      const response=await fetch('/api/apps?mode=version',{cache:'no-store'});
      if(!response.ok)return;
      const {version}=await response.json();
      if(!version)return;
      const old=localStorage.getItem('aiway_deployment_version');
      localStorage.setItem('aiway_deployment_version',version);
      // Do not clear caches or force a reload while the user is opening the app.
      // The Service Worker refreshes the shell in the background for the next visit.
      if(old&&old!==version)navigator.serviceWorker?.controller?.postMessage?.({type:'AIWAY_REFRESH_SHELL'});
    }catch{}
  };
  if('requestIdleCallback' in window)requestIdleCallback(run,{timeout:2500});
  else setTimeout(run,1200);
},{once:true});
