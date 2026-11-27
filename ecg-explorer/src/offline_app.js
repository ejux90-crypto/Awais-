    // =========================================================================
    // v8 PHONE APP — install prompt + "save everything for offline"
    // sw.js caches the app shell; ECG images are cached when viewed, or all at once here.
    // =========================================================================
    const OFF = { files: null, bytes: 0, done: 0, total: 0, busy: false, stored: null, installEvt: null };
    const IMG_CACHE = 'ecg-images-v1';
    const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
    const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const canOffline = () => 'serviceWorker' in navigator && 'caches' in window && location.protocol !== 'file:';

    if (canOffline()) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); OFF.installEvt = e; refreshOfflineBars(); });
    window.addEventListener('appinstalled', () => { OFF.installEvt = null; refreshOfflineBars(); });

    async function offlineManifest() {
      if (!OFF.files) {
        const m = await (await fetch('offline.json', { cache: 'no-cache' })).json();
        OFF.files = m.files; OFF.bytes = m.bytes;
      }
      return OFF.files;
    }
    async function countStored() {
      const files = await offlineManifest();
      const c = await caches.open(IMG_CACHE);
      const keys = new Set((await c.keys()).map(r => new URL(r.url).pathname.split('/ecgs/')[1]));
      OFF.stored = files.filter(f => keys.has(f.split('ecgs/')[1])).length;
      return OFF.stored;
    }
    async function saveAllOffline() {
      if (OFF.busy) return;
      OFF.busy = true;
      try {
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
        const files = await offlineManifest();
        const c = await caches.open(IMG_CACHE);
        const have = new Set((await c.keys()).map(r => new URL(r.url).pathname.split('/ecgs/')[1]));
        const todo = files.filter(f => !have.has(f.split('ecgs/')[1]));
        OFF.total = files.length; OFF.done = files.length - todo.length;
        refreshOfflineBars();
        let i = 0, failed = 0;
        const worker = async () => {
          while (i < todo.length) {
            const f = todo[i++];
            try { const r = await fetch(f); if (r.ok) await c.put(f, r); else failed++; } catch (e) { failed++; }
            OFF.done++;
            if (OFF.done % 10 === 0 || OFF.done === OFF.total) refreshOfflineBars();
          }
        };
        await Promise.all([worker(), worker(), worker(), worker()]);
        OFF.stored = OFF.done - failed;
        if (failed) OFF.error = failed + ' files could not be saved; tap again when you have a good connection.';
        else OFF.error = '';
      } catch (e) {
        OFF.error = 'Could not save for offline (' + (e && e.message || 'error') + ').';
      }
      OFF.busy = false;
      refreshOfflineBars();
    }
    function offlineBarHtml() {
      const mb = OFF.bytes ? Math.round(OFF.bytes / 1e6) : 0;
      let inner = '';
      if (!canOffline()) {
        inner = '<span class="muted">Open the app from its web address to install it and use it offline.</span>';
      } else {
        if (!isStandalone()) {
          if (OFF.installEvt) inner += '<button class="btn btn-primary" type="button" data-off="install">Install app</button>';
          else if (isIOS()) inner += '<span class="off-tip">Install: tap <strong>Share</strong> <span aria-hidden="true">⬆︎</span> then <strong>Add to Home Screen</strong>.</span>';
        }
        if (OFF.busy) {
          const pct = OFF.total ? Math.round(100 * OFF.done / OFF.total) : 0;
          inner += `<span class="off-prog"><span style="width:${pct}%"></span></span><span class="muted">Saving ECGs for offline… ${OFF.done} / ${OFF.total}</span>`;
        } else if (OFF.files && OFF.stored === OFF.files.length) {
          inner += `<span class="off-ok">✓ All ${OFF.files.length} ECG images saved — works with no signal</span>`;
        } else {
          inner += `<button class="btn" type="button" data-off="save">Save all ECGs for offline${mb ? ' (' + mb + ' MB)' : ''}</button>`;
          if (OFF.files && OFF.stored) inner += `<span class="muted">${OFF.stored} / ${OFF.files.length} saved</span>`;
        }
        if (OFF.error) inner += `<span class="off-err">${esc(OFF.error)}</span>`;
        if (isIOS() && !isStandalone()) inner += '<span class="muted off-note">On iPhone, save offline from the installed app (its storage is separate from Safari).</span>';
      }
      return `<div class="off-bar">${inner}</div>`;
    }
    function bindOfflineBar(el) {
      el.querySelectorAll('[data-off="save"]').forEach(b => b.onclick = saveAllOffline);
      el.querySelectorAll('[data-off="install"]').forEach(b => b.onclick = async () => { if (OFF.installEvt) { OFF.installEvt.prompt(); await OFF.installEvt.userChoice; OFF.installEvt = null; refreshOfflineBars(); } });
    }
    function placeOfflineBar(hostId) {
      const host = document.getElementById(hostId);
      if (!host) return;
      const hero = host.querySelector('.learn-hero .learn-hero-text');
      if (!hero) return;
      const old = hero.querySelector('.off-bar'); if (old) old.remove();
      hero.insertAdjacentHTML('beforeend', offlineBarHtml());
      bindOfflineBar(hero);
    }
    function refreshOfflineBars() { ['learnRoot', 'casesRoot', 'notesRoot'].forEach(placeOfflineBar); }

    const _v8RenderLearn = renderLearn;
    renderLearn = function () { _v8RenderLearn(); placeOfflineBar('learnRoot'); };
    const _v8RenderCases = renderCases;
    renderCases = function () { _v8RenderCases(); placeOfflineBar('casesRoot'); };
    const _v8RenderNotes = renderNotes;
    renderNotes = function () { _v8RenderNotes(); placeOfflineBar('notesRoot'); };
    if (canOffline()) offlineManifest().then(countStored).then(refreshOfflineBars).catch(() => {});
