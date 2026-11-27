    // =========================================================================
    // v9 APP SHELL — 5-tab navigation, back-button routing, Today, Settings
    // Wraps the existing views (learn / studio / cases / quiz / notes / compare / tools) without
    // changing them: each tab owns one or more of those views; Practice and Library get sub-tabs.
    // =========================================================================
    const ICON = {
      today: '<path d="M4 6h16M4 6v13a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V6M8 3v5M16 3v5M8 13l3 3 5-6"/>',
      learn: '<path d="M3 6l9-3 9 3-9 3-9-3zM6 8v5c0 2 3 4 6 4s6-2 6-4V8M21 6v6"/>',
      practice: '<path d="M2 12h4l2-6 4 13 3-9 2 2h5"/>',
      library: '<path d="M4 4h5v16H4zM10 4h4v16h-4zM15.5 5l3.8-1 3 15-3.8 1z"/>',
      studio: '<rect x="3" y="4" width="18" height="13" rx="2"/><path d="M5 11h3l1.5-3 2 6 1.5-3h6M8 21h8M12 17v4"/>',
      settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>'
    };
    const svgIcon = (k) => `<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg>`;
    const NAV = [
      { id: 'today', label: 'Today', modes: ['today'] },
      { id: 'learn', label: 'Learn', modes: ['learn'] },
      { id: 'practice', label: 'Practice', modes: ['cases', 'quiz'], subs: [['cases', 'Real ECGs'], ['quiz', 'Simulated quiz']] },
      { id: 'library', label: 'Library', modes: ['notes', 'compare', 'tools'], subs: [['notes', 'LITFL notes'], ['compare', 'Algorithms'], ['tools', 'Bedside tools']] },
      { id: 'studio', label: 'Studio', modes: ['studio'] }
    ];
    const NAV_OF = {};
    NAV.forEach(n => n.modes.forEach(m => { NAV_OF[m] = n; }));
    const lastSub = { practice: 'cases', library: 'notes' };

    function renderNav() {
      const nav = document.getElementById('appNav');
      if (!nav) return;
      const cur = NAV_OF[appMode];
      nav.innerHTML = NAV.map(n => `<button class="app-nav-btn ${cur && cur.id === n.id ? 'active' : ''}" type="button" data-nav="${n.id}" aria-label="${n.label}" ${cur && cur.id === n.id ? 'aria-current="page"' : ''}>${svgIcon(n.id)}<span>${n.label}</span></button>`).join('');
      nav.querySelectorAll('[data-nav]').forEach(b => b.onclick = () => goNav(b.dataset.nav));
      const sub = document.getElementById('subNav');
      if (cur && cur.subs) {
        sub.hidden = false;
        sub.innerHTML = cur.subs.map(([m, l]) => `<button class="sub-btn ${appMode === m ? 'active' : ''}" type="button" data-sub="${m}">${l}</button>`).join('');
        sub.querySelectorAll('[data-sub]').forEach(b => b.onclick = () => { if (b.dataset.sub === 'cases') rxCurrent = null; switchMode(b.dataset.sub); window.scrollTo(0, 0); });
      } else { sub.hidden = true; sub.innerHTML = ''; }
      const gear = document.getElementById('settingsBtn');
      if (gear) gear.classList.toggle('active', appMode === 'settings');
    }
    function goNav(id) {
      const n = NAV.find(x => x.id === id);
      if (!n) return;
      if (id === 'practice' && appMode === 'cases') rxCurrent = null;
      switchMode(n.subs ? lastSub[id] : n.modes[0]);
      window.scrollTo(0, 0);
    }

    // ---- Routing: every screen has a #/ address, so the phone's back button works ----
    const INITIAL_HASH = location.hash;  // captured before the engine's start-up selects a rhythm
    let routeLock = 0;
    function modeRoute(m) {
      const n = NAV_OF[m];
      if (m === 'cases' && rxCurrent) return '#/case/' + rxCurrent;
      if (m === 'studio' && typeof currentId !== 'undefined') return '#/studio/' + currentId;
      return n && n.subs ? `#/${n.id}/${m}` : '#/' + m;
    }
    function setRoute(r, replace) {
      if (routeLock || location.hash === r) return;
      try { history[replace ? 'replaceState' : 'pushState'](null, '', r); } catch (e) {}
    }
    const modalOpen = () => document.getElementById('lessonModal').classList.contains('open');
    function applyRoute() {
      const p = (location.hash || '').replace(/^#\/?/, '').split('/');
      routeLock++;
      try {
        if (modalOpen() && p[0] !== 'notes' && p[0] !== 'read') { document.getElementById('lessonModal').classList.remove('open'); }
        if (p[0] === 'case' && RCASE_BY_ID[p[1]]) { openCase(p[1]); }
        else if (p[0] === 'notes' && LITFL_NOTES[p[1]]) { if (!document.getElementById('view-' + appMode)) switchMode('notes'); openNotes(p[1]); }
        else if (p[0] === 'read' && TOPIC_BY_ID[p[1]]) { openReader(p[1]); }
        else if (p[0] === 'studio') { if (p[1] && DATA_BY_ID[p[1]]) selectRhythm(p[1]); switchMode('studio'); }
        else if ((p[0] === 'practice' || p[0] === 'library') && NAV_OF[p[1]]) { if (p[1] === 'cases') rxCurrent = null; switchMode(p[1]); }
        else if (['today', 'learn', 'settings'].includes(p[0])) { switchMode(p[0]); }
        else return false;
        return true;
      } finally { routeLock--; }
    }
    window.addEventListener('popstate', applyRoute);

    const _v9SwitchMode = switchMode;
    switchMode = function (mode) {
      if (!document.getElementById('view-' + mode)) return;
      _v9SwitchMode(mode);
      const n = NAV_OF[mode];
      if (n && n.subs) lastSub[n.id] = mode;
      if (mode === 'today') renderToday();
      if (mode === 'settings') renderSettings();
      renderNav();
      setRoute(modeRoute(mode));
    };
    const _v9OpenCase = openCase;
    openCase = function (id) { _v9OpenCase(id); setRoute('#/case/' + id); };
    const _v9RenderCases = renderCases;
    // leaving a case for the list ("← All cases") swaps the address in place; opening the list normally pushes
    renderCases = function () { _v9RenderCases(); if (appMode === 'cases' && !rxCurrent && /^#\/case\//.test(location.hash)) setRoute(modeRoute('cases'), true); };
    const _v9SelectRhythm = selectRhythm;
    selectRhythm = function (id) { _v9SelectRhythm(id); if (appMode === 'studio' && shellReady) setRoute('#/studio/' + id, true); };
    let shellReady = false;
    const _v9OpenNotes = openNotes;
    openNotes = function (slug, fromLink) { _v9OpenNotes(slug, fromLink); setRoute('#/notes/' + slug, !!fromLink && /^#\/notes\//.test(location.hash)); };
    const _v9OpenReader = openReader;
    openReader = function (id) { _v9OpenReader(id); setRoute('#/read/' + id); };
    const _v9CloseReader = closeReader;
    closeReader = function () {
      _v9CloseReader();
      // replace (not history.back): callers often navigate straight after closing
      if (/^#\/(notes|read)\//.test(location.hash)) setRoute(modeRoute(appMode), true);
    };

    // ---- Theme: Auto (follows the phone) / Light / Dark ----
    const THEME_KEY = 'ecgStudio.themePref';
    const themePref = () => { try { return localStorage.getItem(THEME_KEY) || 'auto'; } catch (e) { return 'auto'; } };
    const sysDark = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    function applyThemePref() {
      const p = themePref();
      const t = p === 'light' ? 'paper' : p === 'dark' ? 'dark' : (sysDark && !sysDark.matches ? 'paper' : 'dark');
      if (document.documentElement.getAttribute('data-theme') !== t) applyTheme(t);
    }
    if (sysDark && sysDark.addEventListener) sysDark.addEventListener('change', () => { if (themePref() === 'auto') applyThemePref(); });

    // ---- Settings ----
    const STORE_KEYS = () => Object.keys(localStorage).filter(k => k.startsWith('ecgStudio'));
    function renderSettings() {
      const host = document.getElementById('settingsRoot');
      if (!host) return;
      const p = themePref();
      host.innerHTML = `
        <div class="panel set-card"><h2>Settings</h2>
          <h3>Appearance</h3>
          <div class="seg-choice" role="radiogroup" aria-label="Theme">${[['auto', 'Auto (match phone)'], ['light', 'Light'], ['dark', 'Dark']].map(([k, l]) => `<button type="button" role="radio" aria-checked="${p === k}" class="btn ${p === k ? 'btn-primary' : ''}" data-theme-pref="${k}">${l}</button>`).join('')}</div>
          <p class="muted">Dark suits live strips and night shifts; Light looks like ECG paper.</p>
        </div>
        <div class="panel set-card"><h3>Install & offline</h3><div id="setOffline"></div>
          <p class="muted">After saving, every ECG, case and note works with no signal. The app updates itself next time you open it online.</p></div>
        <div class="panel set-card"><h3>Your progress</h3>
          <p class="muted">Progress (topics, recall cards, quiz and case history, notes) is stored only on this device. Back it up before changing phones or clearing the browser.</p>
          <div class="set-row"><button class="btn btn-primary" type="button" id="setExport">Back up progress (file)</button>
          <label class="btn" for="setImport">Restore from backup…</label><input id="setImport" type="file" accept="application/json,.json" hidden></div>
          <div class="set-row"><button class="btn btn-danger" type="button" id="setReset">Reset all progress…</button></div>
          <p id="setMsg" class="muted" role="status"></p>
        </div>
        <div class="panel set-card"><h3>About & credits</h3>
          <p class="muted">Teaching text, cases and example ECGs from the <a href="https://litfl.com/ecg-library/" target="_blank" rel="noopener noreferrer">LITFL ECG Library</a> (Life in the Fast Lane), <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>. Practice ECGs from <a href="https://physionet.org/content/ptb-xl/1.0.3/" target="_blank" rel="noopener noreferrer">PTB-XL</a> (Wagner et al., Sci Data 2020; PhysioNet), <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Educational use only: check drug doses, energies and protocols against current local guidelines.</p>
        </div>`;
      host.querySelectorAll('[data-theme-pref]').forEach(b => b.onclick = () => { try { localStorage.setItem(THEME_KEY, b.dataset.themePref); } catch (e) {} applyThemePref(); renderSettings(); });
      const off = document.getElementById('setOffline');
      off.innerHTML = offlineBarHtml(); bindOfflineBar(off);
      const msg = (t) => { document.getElementById('setMsg').textContent = t; };
      document.getElementById('setExport').onclick = () => {
        const data = { app: 'ECG Master Studio', exported: new Date().toISOString(), store: {} };
        STORE_KEYS().forEach(k => { data.store[k] = localStorage.getItem(k); });
        const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'ecg-studio-progress-' + new Date().toISOString().slice(0, 10) + '.json';
        document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
        msg('Backup file saved. Keep it somewhere safe (Files, iCloud Drive, Google Drive).');
      };
      document.getElementById('setImport').onchange = async (e) => {
        const f = e.target.files[0]; if (!f) return;
        try {
          const d = JSON.parse(await f.text());
          if (!d || !d.store || typeof d.store !== 'object') throw new Error('not a backup file');
          if (!confirm('Replace the progress on this device with the backup from ' + (d.exported || 'the file').slice(0, 10) + '?')) return;
          STORE_KEYS().forEach(k => localStorage.removeItem(k));
          Object.entries(d.store).forEach(([k, v]) => { if (k.startsWith('ecgStudio') && typeof v === 'string') localStorage.setItem(k, v); });
          location.hash = '#/today'; location.reload();
        } catch (err) { msg('Could not restore: ' + err.message); }
      };
      document.getElementById('setReset').onclick = () => {
        if (!confirm('Erase all progress on this device (topics, recall, quiz and case history, notes)? This cannot be undone unless you have a backup.')) return;
        STORE_KEYS().filter(k => k !== THEME_KEY).forEach(k => localStorage.removeItem(k));
        location.hash = '#/today'; location.reload();
      };
    }

    // ---- Today: what to do now ----
    function renderToday() {
      const host = document.getElementById('todayRoot');
      if (!host) return;
      const now = Date.now();
      const started = TOPICS.filter(t => topicStatus(t.id) !== 'new').length;
      const cont = TOPICS.find(t => topicStatus(t.id) === 'new') || TOPICS[0];
      const quizDue = Object.entries(progress.items).filter(([id, it]) => DATA_BY_ID[id] && it.due && it.due <= now).length;
      const casesDue = RCASES.filter(c => { const s = caseState(c.id); return s && s.due <= now; });
      const recallDue = TOPICS.filter(t => learnState.reviewed[t.id] && recallCardsFor(t.id).some((_, i) => { const r = learnState.recall[t.id + '#' + i]; return !r || r.last !== 'ok'; })).slice(0, 6);
      const attempted = RCASES.filter(c => caseState(c.id)).length;
      const lastCase = RCASES.filter(c => caseState(c.id)).sort((a, b) => caseState(b.id).t - caseState(a.id).t)[0];
      const nextCase = RCASES.find(c => !caseState(c.id) && c.src !== 'ptbxl') || RCASES.find(c => !caseState(c.id));
      const first = !started && !attempted;
      const card = (t, body, btn, act, cls) => `<div class="panel today-card ${cls || ''}"><h3>${t}</h3><div class="muted">${body}</div>${btn ? `<button class="btn ${cls === 'prim' ? 'btn-primary' : ''}" type="button" data-today="${act}">${btn}</button>` : ''}</div>`;
      host.innerHTML = `
        <div class="today-head"><h2>${first ? 'Welcome' : 'Today'}</h2><p class="muted">${first ? 'Start with the Foundations — paper, leads, axis and a systematic read — then move into rhythms and real ECGs.' : `${started} / ${TOPICS.length} topics started · ${attempted} / ${RCASES.length} real ECGs attempted`}</p></div>
        <div class="today-grid">
          ${card(first ? 'Start learning' : 'Continue learning', `Next on your pathway: <strong>${esc(cont.name)}</strong>`, 'Open lesson →', 'continue', 'prim')}
          ${card('Real ECG cases', casesDue.length ? `<strong>${casesDue.length}</strong> case${casesDue.length > 1 ? 's' : ''} due for review` : (nextCase ? `Next unseen: <strong>${esc(nextCase.title)}</strong>` : 'All cases attempted'), casesDue.length ? 'Review due cases' : 'Read a real ECG', casesDue.length ? 'casesdue' : 'nextcase')}
          ${card('Simulated quiz', quizDue ? `<strong>${quizDue}</strong> rhythm${quizDue > 1 ? 's' : ''} due (spaced review)` : 'Read, diagnose and manage live strips', quizDue ? 'Review ' + quizDue + ' due' : 'Start quiz', 'quiz')}
          ${recallDue.length ? card('Recall cards', 'Not yet nailed: ' + recallDue.map(t => `<button class="cat-chip" type="button" data-topic="${t.id}">${esc(t.name)}</button>`).join(' '), '', '') : ''}
          ${lastCase ? card('Last case', `${esc(lastCase.title)} — ${esc(lastCase.label || '')}`, 'Open again', 'lastcase') : ''}
          ${card('10-case blind exam', 'Real ECGs, answers hidden, graded at the end', 'Start exam', 'exam')}
        </div>
        <div class="panel today-card"><h3>Find anything</h3>
          <input id="todaySearch" class="nt-search" type="search" placeholder="Search topics, LITFL notes and cases (e.g. Brugada, aVR, hyperkalaemia)">
          <div id="todayResults"></div></div>
        ${!isStandalone() || !OFF.files || OFF.stored !== (OFF.files || []).length ? `<div class="panel today-card"><h3>Use it offline</h3><div class="muted">Install the app and save all ECGs so it works with no signal.</div><button class="btn" type="button" data-today="settings">Install & offline settings</button></div>` : ''}`;
      const act = {
        continue: () => openTopic(cont.id),
        casesdue: () => { rxCurrent = null; switchMode('cases'); const pool = casesDue; if (pool.length) openCase(pool[0].id); },
        nextcase: () => nextCase && openCase(nextCase.id),
        quiz: () => { document.getElementById('quizOrder').value = 'smart'; switchMode('quiz'); },
        lastcase: () => openCase(lastCase.id),
        exam: () => { rxCurrent = null; switchMode('cases'); document.getElementById('rxExam').click(); },
        settings: () => switchMode('settings')
      };
      host.querySelectorAll('[data-today]').forEach(b => b.onclick = () => act[b.dataset.today]());
      host.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => openTopic(b.dataset.topic));
      bindGlobalSearch(document.getElementById('todaySearch'), document.getElementById('todayResults'));
    }

    // ---- One search across topics, LITFL notes and cases ----
    function globalSearch(q) {
      q = q.trim().toLowerCase();
      if (q.length < 2) return null;
      const topics = TOPICS.filter(t => t.name.toLowerCase().includes(q) || (LEARN[t.id] && v6SearchHit(t.id, q)) ||
        ((FOUND_BY_ID[t.id] || EXT_BY_ID[t.id]) && JSON.stringify(FOUND_BY_ID[t.id] || EXT_BY_ID[t.id]).toLowerCase().includes(q))).slice(0, 12);
      const notes = Object.entries(LITFL_NOTES).filter(([, n]) => notesSearchText(n).includes(q))
        .sort((a, b) => (b[1].title.toLowerCase().includes(q) ? 1 : 0) - (a[1].title.toLowerCase().includes(q) ? 1 : 0)).slice(0, 12);
      // cases: match the vignette only (never the hidden diagnosis) unless already attempted
      const cases = RCASES.filter(c => (c.title + ' ' + c.vignette).toLowerCase().includes(q) || (caseState(c.id) && (c.label || '').toLowerCase().includes(q))).slice(0, 12);
      return { topics, notes, cases };
    }
    function bindGlobalSearch(input, out) {
      if (!input) return;
      const draw = () => {
        const r = globalSearch(input.value);
        if (!r) { out.innerHTML = ''; return; }
        const sec = (t, items) => items ? `<div class="gs-sec"><div class="rx-label">${t}</div>${items}</div>` : '';
        out.innerHTML = (sec('Topics', r.topics.map(t => `<button class="gs-item" type="button" data-gtopic="${t.id}"><span>${esc(t.name)}</span><span class="muted">${t.kind === 'sim' ? 'Live ECG lesson' : 'Reading lesson'}</span></button>`).join('')) +
          sec('LITFL notes', r.notes.map(([s, n]) => `<button class="gs-item" type="button" data-gnotes="${s}"><span>${esc(n.title)}</span><span class="muted">Notes</span></button>`).join('')) +
          sec('Cases', r.cases.map(c => `<button class="gs-item" type="button" data-gcase="${c.id}"><span>${esc(c.title)}</span><span class="muted">${esc(c.vignette.slice(0, 60))}</span></button>`).join(''))) ||
          '<p class="muted">Nothing found.</p>';
        out.querySelectorAll('[data-gtopic]').forEach(b => b.onclick = () => openTopic(b.dataset.gtopic));
        out.querySelectorAll('[data-gnotes]').forEach(b => b.onclick = () => openNotes(b.dataset.gnotes));
        out.querySelectorAll('[data-gcase]').forEach(b => b.onclick = () => openCase(b.dataset.gcase));
      };
      input.oninput = draw;
    }

    // ---- Offline bar now lives in Settings (and a hint on Today), not on every screen ----
    placeOfflineBar = function () {};
    refreshOfflineBars = function () {
      const off = document.getElementById('setOffline');
      if (off && appMode === 'settings') { off.innerHTML = offlineBarHtml(); bindOfflineBar(off); }
    };

    // ---- Start-up: honour the address (#/...), else Today ----
    const _v9Init = v6Init;
    v6Init = function () {
      applyThemePref();
      document.getElementById('settingsBtn').onclick = () => switchMode('settings');
      document.getElementById('searchBtn').onclick = () => openSearch();
      const hadRoute = /^#\//.test(INITIAL_HASH);
      if (hadRoute) { try { history.replaceState(null, '', INITIAL_HASH); } catch (e) {} }
      routeLock++; try { _v9Init(); } finally { routeLock--; }
      if (!(hadRoute && applyRoute())) { routeLock++; switchMode('today'); routeLock--; setRoute('#/today', true); }
      shellReady = true;
      renderNav();
    };

    // ---- Phase 2: lessons — 4 tabs, lesson-first topic pages on phones ----
    const LTAB_GROUP = { learn: ['see', 'why', 'traps', 'act', 'pearls'], real: ['real'], notes: ['notes'], recall: ['recall'] };
    applyLessonTab = function () {
      const panel = document.getElementById('lessonPanel');
      if (!panel) return;
      if (!LTAB_GROUP[learnState.ltab]) learnState.ltab = 'learn';   // old per-card tabs map onto "Learn"
      const tab = learnState.ltab;
      panel.classList.remove('show-all');
      panel.querySelectorAll('.lesson-tab').forEach(b => b.classList.toggle('active', b.dataset.ltab === tab));
      panel.querySelectorAll('.lesson-pane').forEach(p => p.classList.toggle('active', LTAB_GROUP[tab].includes(p.dataset.lpane)));
    };
    const studioSec = () => document.getElementById('view-studio');
    const _v9OpenTopic = openTopic;
    openTopic = function (id) {
      const t = TOPIC_BY_ID[id];
      if (t && t.kind === 'sim') {
        studioSec().classList.add('lesson-first');
        learnState.ltab = 'learn';
        _v9OpenTopic(id);
        applyLessonTab();
        window.scrollTo(0, 0);
      } else _v9OpenTopic(id);
    };
    const _v9GoNav = goNav;
    goNav = function (id) { if (id === 'studio') studioSec().classList.remove('lesson-first'); _v9GoNav(id); };
    const _v9RenderLesson = renderLesson;
    renderLesson = function (id) {
      _v9RenderLesson(id);
      const panel = document.getElementById('lessonPanel');
      if (!panel) return;
      let bar = panel.querySelector('.lesson-titlebar');
      if (!bar) {
        panel.insertAdjacentHTML('afterbegin', '<div class="lesson-titlebar"><h1 class="lesson-title"></h1><button class="btn btn-primary" type="button" data-jump-ecg>Live ECG ↓</button></div>');
        bar = panel.querySelector('.lesson-titlebar');
        bar.querySelector('[data-jump-ecg]').onclick = () => {
          const strip = document.querySelector('#view-studio .main-col > .panel');
          if (strip) strip.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
      }
      bar.querySelector('.lesson-title').textContent = (DATA_BY_ID[id] || TOPIC_BY_ID[id] || { name: '' }).name;
      applyLessonTab();
    };

    // ---- Phase 3: search everything from the header ----
    function openSearch() {
      const modal = document.getElementById('lessonModal');
      const body = document.getElementById('lessonModalBody');
      body.innerHTML = `<div class="modal-head"><h2 class="reader-title" style="margin:0">Search</h2><button class="btn" type="button" data-close>✕ Close</button></div>
        <div class="search-modal"><input id="gsInput" class="nt-search" type="search" placeholder="Topics, LITFL notes, cases — e.g. Wellens, aVR, delta wave" autocomplete="off"><div id="gsOut"></div>
        <p class="muted" style="margin-top:10px;font-size:12.5px">Case results match the clinical vignette only, so diagnoses are not spoiled.</p></div>`;
      body.querySelector('[data-close]').onclick = () => modal.classList.remove('open');
      bindGlobalSearch(document.getElementById('gsInput'), document.getElementById('gsOut'));
      // results open other screens: close the search first
      document.getElementById('gsOut').addEventListener('click', (e) => { if (e.target.closest('[data-gtopic],[data-gcase]')) modal.classList.remove('open'); }, true);
      modal.classList.add('open'); modal.scrollTop = 0;
      setTimeout(() => document.getElementById('gsInput').focus(), 50);
    }
