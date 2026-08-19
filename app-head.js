// AiWay deployment freshness controller.
// Ensures returning users receive the newest UI instead of stale browser/CDN assets.
(() => {
  const BUILD = '20260819-8';
  const VERSION_KEY = 'aiway_deployment_version';
  const RELOAD_KEY = 'aiway_last_forced_reload';

  async function clearAiWayCaches() {
    if (!('caches' in window)) return;
    try {
      const keys = await caches.keys();
      await Promise.all(keys.filter(k => k.startsWith('aiway-') || k.startsWith('aiway-shell-')).map(k => caches.delete(k)));
    } catch {}
  }

  async function refreshServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const reg = await navigator.serviceWorker.register(`/sw.js?v=${BUILD}`, { updateViaCache: 'none' });
      await reg.update().catch(() => {});
    } catch {}
  }

  async function forceFreshReload(version) {
    const stamp = String(version || BUILD);
    if (sessionStorage.getItem(RELOAD_KEY) === stamp) return;
    sessionStorage.setItem(RELOAD_KEY, stamp);
    await clearAiWayCaches();
    await refreshServiceWorker();
    const url = new URL(location.href);
    url.searchParams.set('__aiway_v', stamp.slice(0, 16));
    location.replace(url.toString());
  }

  async function checkDeployment({ forceOnMismatch = true } = {}) {
    try {
      const response = await fetch(`/api/apps?mode=version&_=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'cache-control': 'no-cache' }
      });
      if (!response.ok) return;
      const data = await response.json();
      const version = String(data?.version || '');
      if (!version) return;
      const old = localStorage.getItem(VERSION_KEY);
      localStorage.setItem(VERSION_KEY, version);
      if (old && old !== version && forceOnMismatch) await forceFreshReload(version);
    } catch {}
  }

  window.addEventListener('load', () => {
    const run = async () => {
      await refreshServiceWorker();
      await checkDeployment({ forceOnMismatch: true });
    };
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 1800 });
    else setTimeout(run, 500);

    // Tabs left open for a long time also notice a new deployment.
    setInterval(() => checkDeployment({ forceOnMismatch: document.visibilityState !== 'hidden' }), 180000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkDeployment({ forceOnMismatch: true });
    });
  }, { once: true });
})();
