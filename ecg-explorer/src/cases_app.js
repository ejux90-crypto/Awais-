    // =========================================================================
    // v7 REAL ECG REVIEW — LITFL Top-100 cases + topic example ECGs
    // RCASES / RX_EXAMPLES / RX_IMG are injected by build.py (CC BY-NC-SA 4.0, attributed)
    // =========================================================================
    const IMG_BASE = 'ecgs/';
    const RCASE_BY_ID = Object.fromEntries(RCASES.map(c => [c.id, c]));
    const imgUrl = (src) => RX_IMG[src] ? IMG_BASE + RX_IMG[src] : src; // falls back to LITFL if not bundled
    const CASE_BOX_MS = [0, 10 * 60e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 21 * 24 * 3600e3];
    const CC_NOTE = 'ECG, case and interpretation © Life in the Fast Lane (Ed Burns, Robert Buttner et al.), <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>; reproduced unchanged except formatting. Non-commercial educational use.';

    const PTB_NOTE = 'ECG signal from <a href="https://physionet.org/content/ptb-xl/1.0.3/" target="_blank" rel="noopener noreferrer">PTB-XL</a> (Wagner P, Strodthoff N, Bousseljot R-D, et al. PTB-XL, a large publicly available electrocardiography dataset. <em>Sci Data</em> 2020;7:154), via PhysioNet, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0</a>. Drawn as a 12-lead printout by this app; statements are PTB-XL\'s cardiologist-validated SCP-ECG labels.';
    const isPtb = c => c.src === 'ptbxl';
    const SRC_NAME = c => isPtb(c) ? 'PTB-XL practice ECG' : c.steps ? 'LITFL ECG Exigency (step-by-step)' : 'LITFL Top 100 ECG';
    const OLD_NOTE = 'Puzzle cases were written over several years: check any drug doses, energies and resuscitation steps against current ALS / local guidelines.';
    const rxStepShown = {};  // case id -> how many step answers are revealed
    const stepFill = (c, h) => h.replace(/<figure data-img="(\d+)"><\/figure>/g, (m, k) => c.images[+k] ? figHtml(c.images[+k].src, c.images[+k].cap) : '');
    function renderSteps(c, onDone) {
      const host = document.getElementById('rxSteps');
      if (!host) return;
      const n = rxStepShown[c.id] || 0, S = c.steps;
      let h = '';
      for (let i = 0; i < S.length && i <= n; i++) {
        const s = S[i];
        h += `<div class="rx-stepblk">${s.pre ? `<div class="rx-step-pre nt-body">${stepFill(c, s.pre)}</div>` : ''}
          ${s.q ? `<div class="rx-step-q"><span class="rx-label">Question ${i + 1} of ${S.length}</span>${esc(s.q)}</div>` : ''}
          ${i < n ? `<div class="rx-step-a nt-body">${stepFill(c, s.a)}</div>`
                  : `<button class="btn btn-primary" type="button" data-step="${i}">${s.q ? 'Reveal answer' : 'Show the rest'}</button>`}</div>`;
      }
      host.innerHTML = h;
      bindNotes(host);
      host.querySelectorAll('[data-step]').forEach(b => b.onclick = () => {
        rxStepShown[c.id] = +b.dataset.step + 1;
        renderSteps(c, onDone);
        const blk = host.querySelectorAll('.rx-stepblk')[+b.dataset.step];
        if (blk) blk.querySelector('.rx-step-a').scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      if (n >= S.length) onDone();
    }

    function caseState(id) { return (learnState.cases || {})[id] || null; }
    function setCaseState(id, grade) {
      learnState.cases = learnState.cases || {};
      const st = learnState.cases[id] || { n: 0, box: 0 };
      st.n++; st.last = grade; st.t = Date.now();
      st.box = grade === 'ok' ? Math.min(5, st.box + 1) : grade === 'part' ? Math.max(1, st.box) : 1;
      st.due = Date.now() + CASE_BOX_MS[st.box];
      learnState.cases[id] = st;
      // a correct real-ECG read counts as reviewing every topic it exercises
      if (grade === 'ok') (RCASE_BY_ID[id].tags || []).forEach(t => { learnState.reviewed[t] = learnState.reviewed[t] || Date.now(); });
      saveLearn();
    }
    function caseStatus(id) {
      const st = caseState(id);
      if (!st) return 'new';
      if (st.last === 'miss') return 'shaky';
      if (st.due && st.due <= Date.now()) return 'practising';
      return st.last === 'ok' ? 'mastered' : 'reviewed';
    }
    function casesForTopic(id) { return RCASES.filter(c => (c.tags || []).includes(id)); }
    function examplesForTopic(id) {
      const L = LEARN[id] || EXT_BY_ID[id] || FOUND_BY_ID[id];
      const src = (L && L.src) || [];
      const seen = new Set(), out = [];
      src.forEach(s => (RX_EXAMPLES[s] || []).forEach(e => { if (!seen.has(e.src)) { seen.add(e.src); out.push({ ...e, slug: s }); } }));
      return out;
    }

    // ---- Zoom viewer (pinch / wheel / drag) ----
    const zoom = { s: 1, x: 0, y: 0 };
    function openZoom(src, caption) {
      const m = document.getElementById('ecgZoomModal');
      const img = document.getElementById('ecgZoomImg');
      img.src = src; img.alt = caption || 'ECG';
      document.getElementById('ecgZoomCap').textContent = caption || '';
      zoom.s = 1; zoom.x = 0; zoom.y = 0; applyZoom();
      m.classList.add('open');
    }
    function applyZoom() { document.getElementById('ecgZoomImg').style.transform = `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.s})`; }
    (function bindZoom() {
      const stage = document.getElementById('ecgZoomStage');
      const pts = new Map(); let last = null, pinch0 = null;
      stage.addEventListener('wheel', e => { e.preventDefault(); zoom.s = Math.min(6, Math.max(1, zoom.s * (e.deltaY < 0 ? 1.15 : 0.87))); if (zoom.s === 1) { zoom.x = 0; zoom.y = 0; } applyZoom(); }, { passive: false });
      stage.addEventListener('pointerdown', e => { stage.setPointerCapture(e.pointerId); pts.set(e.pointerId, e); last = { x: e.clientX, y: e.clientY }; });
      stage.addEventListener('pointermove', e => {
        if (!pts.has(e.pointerId)) return;
        pts.set(e.pointerId, e);
        if (pts.size === 2) {
          const [a, b] = [...pts.values()];
          const d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
          if (pinch0) { zoom.s = Math.min(6, Math.max(1, zoom.s * d / pinch0)); applyZoom(); }
          pinch0 = d;
        } else if (last && zoom.s > 1) {
          zoom.x += e.clientX - last.x; zoom.y += e.clientY - last.y; last = { x: e.clientX, y: e.clientY }; applyZoom();
        }
      });
      const up = e => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = null; last = null; };
      stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
      stage.addEventListener('dblclick', () => { zoom.s = zoom.s > 1 ? 1 : 2.5; if (zoom.s === 1) { zoom.x = 0; zoom.y = 0; } applyZoom(); });
      document.getElementById('ecgZoomClose').onclick = () => document.getElementById('ecgZoomModal').classList.remove('open');
      document.getElementById('ecgZoomIn').onclick = () => { zoom.s = Math.min(6, zoom.s * 1.4); applyZoom(); };
      document.getElementById('ecgZoomOut').onclick = () => { zoom.s = Math.max(1, zoom.s / 1.4); if (zoom.s === 1) { zoom.x = 0; zoom.y = 0; } applyZoom(); };
      document.addEventListener('keydown', e => { if (e.key === 'Escape') document.getElementById('ecgZoomModal').classList.remove('open'); });
    })();

    function figHtml(src, cap, extraClass) {
      return `<figure class="rx-fig ${extraClass || ''}"><img loading="lazy" referrerpolicy="no-referrer" data-orig="${esc(src)}" src="${esc(imgUrl(src))}" alt="${esc(cap || 'ECG')}" data-zoom="${esc(imgUrl(src))}" data-cap="${esc(cap || '')}"><figcaption>${esc(cap || '')}<span class="rx-zoom-hint">Tap to zoom</span></figcaption></figure>`;
    }
    function bindFigs(host) {
      host.querySelectorAll('img[data-zoom]').forEach(i => {
        i.onclick = () => openZoom(i.dataset.zoom, i.dataset.cap);
        const fail = () => {
          const f = i.closest('figure');
          if (!f || f.classList.contains('rx-offline')) return;
          f.classList.add('rx-offline');
          f.innerHTML = `<div class="rx-offline-box">This ECG image loads from Life in the Fast Lane when you are online.<br><a href="${esc(i.dataset.orig)}" target="_blank" rel="noopener noreferrer">Open the image on LITFL ↗</a></div>`;
        };
        if (i.complete && i.naturalWidth === 0 && i.src) fail(); else i.addEventListener('error', fail, { once: true });
      });
    }

    // ---- Case library & viewer ----
    let rxQuery = '', rxSrc = 'all', rxFilter = 'all', rxSys = 'all', rxCurrent = null, rxExam = null;
    const READ_STEPS = ['Rate', 'Rhythm', 'Axis', 'PR', 'QRS', 'ST', 'T / U', 'QT', 'Final dx'];

    function renderCases() {
      const host = document.getElementById('casesRoot');
      if (!host) return;
      if (rxCurrent) { renderCaseViewer(rxCurrent); return; }
      const now = Date.now();
      const st = id => caseStatus(id);
      const POOL = RCASES.filter(c => rxSrc === 'all' || (rxSrc === 'ptbxl') === isPtb(c));
      const nL = RCASES.filter(c => !isPtb(c)).length, nP = RCASES.length - nL, nX = RCASES.filter(c => c.steps).length;
      const counts = { done: POOL.filter(c => caseState(c.id)).length, due: POOL.filter(c => { const s = caseState(c.id); return s && s.due <= now; }).length, missed: POOL.filter(c => st(c.id) === 'shaky').length };
      const sysOfCase = c => { const t = (c.tags || [])[0]; return t ? (SYS_OF[t] || (EXT_BY_ID[t] || {}).group || 'tech') : 'tech'; };
      const list = POOL.filter(c => {
        if (rxFilter === 'new' && caseState(c.id)) return false;
        if (rxFilter === 'due' && !(caseState(c.id) && caseState(c.id).due <= now)) return false;
        if (rxFilter === 'missed' && st(c.id) !== 'shaky') return false;
        if (rxSys !== 'all' && sysOfCase(c) !== rxSys) return false;
        if (rxQuery.trim()) {  // vignette/title only; the diagnosis is searchable once attempted (no spoilers)
          const q = rxQuery.trim().toLowerCase();
          if (!((c.title + ' ' + c.vignette).toLowerCase().includes(q) || (caseState(c.id) && (c.label || '').toLowerCase().includes(q)))) return false;
        }
        return true;
      });
      const rxView = learnState.rxView || 'list';
      const sysChips = SYS.filter(s => s.id !== 'found' && POOL.some(c => sysOfCase(c) === s.id));
      host.innerHTML = `
        <div class="panel learn-hero">
          <div class="learn-hero-text">
            <h2>Real ECGs</h2>
            <p class="muted rx-counts">${nL - nX} LITFL Top 100 cases${nX ? ' · ' + nX + ' step-by-step puzzles' : ''}${nP ? ' · ' + nP + ' PTB-XL practice ECGs' : ''}</p>
            <details class="howto"><summary>How it works</summary><p class="muted">Real 12-leads. <strong>Commit to your read first</strong> (the checklist keeps you systematic), then reveal the interpretation and grade yourself honestly. Misses come back sooner (spaced repetition).${nP ? ' LITFL cases come with a clinical vignette and a full teaching answer; PTB-XL ECGs are real recordings with cardiologist-validated labels, good for volume practice.' : ''}</p></details>
            <div class="learn-progress"><span style="width:${Math.round(100 * counts.done / Math.max(1, POOL.length))}%"></span></div>
            <div class="learn-stats"><span><strong>${counts.done}</strong> / ${POOL.length} attempted</span><span><strong>${counts.due}</strong> due for review</span><span><strong>${counts.missed}</strong> missed last time</span></div>
          </div>
          <div class="learn-hero-actions">
            <button class="btn btn-primary" type="button" id="rxNextNew">Next unseen case →</button>
            <button class="btn btn-warn" type="button" id="rxDue">${counts.due ? 'Review ' + counts.due + ' due' : 'Random case'}</button>
            <button class="btn" type="button" id="rxExam">10-case blind exam (spoilers hidden)</button>
          </div>
        </div>
        <div class="rx-searchrow">
          <input id="rxSearch" class="nt-search" type="search" placeholder="Search cases (vignette, e.g. syncope, chest pain)" value="${esc(rxQuery)}">
          <div class="rx-viewtog" role="group" aria-label="View"><button class="btn ${rxView === 'list' ? 'btn-primary' : ''}" type="button" data-rxview="list" aria-label="Compact list">☰ List</button><button class="btn ${rxView === 'cards' ? 'btn-primary' : ''}" type="button" data-rxview="cards" aria-label="Cards with ECG thumbnails">▦ Cards</button></div>
        </div>
        <div class="rx-filters">
          ${nP ? [['all', 'All sources'], ['litfl', 'LITFL cases'], ['ptbxl', 'PTB-XL practice']].map(([k, l]) => `<button class="cat-chip ${rxSrc === k ? 'active' : ''}" type="button" data-rxsrc="${k}">${l}</button>`).join('') + '<span class="rx-sep"></span>' : ''}
          ${[['all', 'All'], ['new', 'Unseen'], ['due', 'Due'], ['missed', 'Missed']].map(([k, l]) => `<button class="cat-chip ${rxFilter === k ? 'active' : ''}" type="button" data-rxf="${k}">${l}</button>`).join('')}
          <span class="rx-sep"></span>
          <select id="rxSysSel" class="rx-sel" aria-label="Topic area (reveals the answer category)"><option value="all">Any topic area (honest practice)</option>${sysChips.map(s => `<option value="${s.id}" ${rxSys === s.id ? 'selected' : ''}>${esc(s.label || s.short)}</option>`).join('')}</select>
        </div>
        <p class="muted rx-spoiler-note">${list.length} case${list.length === 1 ? '' : 's'}${rxSys !== 'all' ? ' · topic filter reveals the answer category' : ''}</p>
        <div class="rx-grid ${rxView === 'list' ? 'rx-list' : ''}">${list.map(c => {
          const s = caseState(c.id);
          return `<button class="rx-card" type="button" data-case="${c.id}">
            ${rxView === 'list' ? '' : (() => { const q = c.images.find(i => i.where === 'q') || c.images[0]; return q ? `<img loading="lazy" referrerpolicy="no-referrer" src="${esc(imgUrl(q.src))}" alt="ECG thumbnail" onerror="this.style.visibility='hidden'">` : '<div class="rx-card-noimg">ECG case</div>'; })()}
            <div class="rx-card-body"><div class="rx-card-title"><i class="tc-dot st-${caseStatus(c.id)}"></i>${esc(c.title)}</div>
            <div class="rx-card-vig">${esc(c.vignette.slice(0, 110))}${c.vignette.length > 110 ? '…' : ''}</div>
            ${s ? `<div class="rx-card-dx">${esc(c.label)}</div>` : ''}</div></button>`;
        }).join('') || '<p class="muted">No cases match this filter.</p>'}</div>
        <div class="muted learn-foot">Cases from the <a href="https://litfl.com/top-100/ecg/" target="_blank" rel="noopener noreferrer">LITFL Top 100 ECG</a> series by Ed Burns, Robert Buttner and colleagues, licensed CC BY-NC-SA 4.0. Images and interpretations are LITFL's; this app adds the checklist, grading and topic links.${nP ? '<br>' + PTB_NOTE : ''}</div>`;
      host.querySelectorAll('[data-case]').forEach(b => b.onclick = () => openCase(b.dataset.case));
      host.querySelectorAll('[data-rxsrc]').forEach(b => b.onclick = () => { rxSrc = b.dataset.rxsrc; renderCases(); });
      host.querySelectorAll('[data-rxf]').forEach(b => b.onclick = () => { rxFilter = b.dataset.rxf; renderCases(); });
      document.getElementById('rxSysSel').onchange = (e) => { rxSys = e.target.value; renderCases(); };
      host.querySelectorAll('[data-rxview]').forEach(b => b.onclick = () => { learnState.rxView = b.dataset.rxview; saveLearn(); renderCases(); });
      const rs = document.getElementById('rxSearch');
      rs.oninput = () => { rxQuery = rs.value; const pos = rs.selectionStart; renderCases(); const r2 = document.getElementById('rxSearch'); if (r2) { r2.focus(); r2.setSelectionRange(pos, pos); } };
      document.getElementById('rxNextNew').onclick = () => { const c = POOL.find(x => !caseState(x.id)) || POOL[0]; openCase(c.id); };
      document.getElementById('rxDue').onclick = () => {
        const due = POOL.filter(c => { const s = caseState(c.id); return s && s.due <= Date.now(); });
        const pool = due.length ? due : POOL;
        openCase(pool[Math.floor(Math.random() * pool.length)].id);
      };
      document.getElementById('rxExam').onclick = () => {
        const fresh = POOL.filter(c => !caseState(c.id)), seen = POOL.filter(c => caseState(c.id));
        const pool = fresh.sort(() => Math.random() - 0.5).concat(seen);
        const pick = pool.slice(0, 40).sort(() => Math.random() - 0.5).slice(0, 10).map(c => c.id);
        rxExam = { ids: pick, i: 0, grades: {} };
        openCase(pick[0]);
      };
    }

    function openCase(id) {
      rxCurrent = id;
      if (appMode !== 'cases') switchMode('cases'); else renderCaseViewer(id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function renderCaseViewer(id) {
      const c = RCASE_BY_ID[id];
      const host = document.getElementById('casesRoot');
      const qImgs = c.images.filter(i => i.where === 'q');
      const aImgs = c.images.filter(i => i.where === 'a');
      const st = caseState(id);
      const idx = RCASES.findIndex(x => x.id === id);
      const draft = (learnState.caseNotes || {})[id] || '';
      const examBar = rxExam ? `<div class="exam-banner visible rx-exam">Blind exam: case ${rxExam.i + 1} / ${rxExam.ids.length} • graded ${Object.keys(rxExam.grades).length}<button class="btn" type="button" id="rxExamEnd" style="padding:2px 8px;font-size:11.5px;">End exam</button></div>` : '';
      host.innerHTML = `
        ${examBar}
        <div class="panel rx-viewer">
          <div class="rx-head">
            <button class="btn" type="button" id="rxBack">← All cases</button>
            <div class="rx-title"><strong>${esc(c.title)}</strong> <span class="muted">${SRC_NAME(c)}</span> ${st ? `<i class="tc-dot st-${caseStatus(id)}"></i>` : ''}</div>
            <div class="rx-nav">${!rxExam ? `<button class="btn" type="button" data-go="${idx - 1}" ${idx === 0 ? 'disabled' : ''}>◀</button><button class="btn" type="button" data-go="${idx + 1}" ${idx === RCASES.length - 1 ? 'disabled' : ''}>▶</button>` : ''}</div>
          </div>
          ${c.steps ? `<p class="muted rx-spoiler-note">Work through it like the real thing: answer each question in your head (or below), then reveal. Later ECGs only appear when the story gets there.</p><div id="rxSteps" class="rx-stepwrap"></div>` : `<div class="rx-vignette"><span class="rx-label">Clinical context</span>${esc(c.vignette || 'Describe and interpret this ECG.')}</div>
          <div class="rx-figs">${qImgs.map(i => figHtml(i.src, i.cap)).join('')}</div>`}
          <div class="rx-work">
            ${c.steps ? '' : `<div class="rx-check"><span class="rx-label">Systematic read — tick as you go</span>
              <div class="rx-steps">${READ_STEPS.map(s => `<label class="rx-step"><input type="checkbox"> ${s}</label>`).join('')}</div>
            </div>`}
            <label class="rx-label" for="rxNote">Your interpretation (saved on this device)</label>
            <textarea id="rxNote" rows="3" placeholder="e.g. Sinus rhythm 84, normal axis, PR 220 ms; STE II, III, aVF with III > II, STE V1; reciprocal STD I, aVL → inferior STEMI with RV involvement">${esc(draft)}</textarea>
            ${c.steps ? '' : `<button class="btn btn-primary" type="button" id="rxReveal">Reveal ${isPtb(c) ? 'PTB-XL diagnosis' : 'LITFL interpretation'}</button>`}
          </div>
          <div id="rxAnswer" class="rx-answer" hidden>
            <div class="rx-dxline"><span class="rx-label">Key diagnosis</span>${esc(c.label)}</div>
            ${c.steps ? `<div class="mgmt-note">${OLD_NOTE}</div>` : ''}
            <div class="rx-answer-body">${(c.answer || '').replace(/<span data-aimg="(\d+)"><\/span>/g, (m, k) => aImgs[+k] ? figHtml(aImgs[+k].src, aImgs[+k].cap, 'rx-fig-a') : '')}</div>
            ${aImgs.length && !c.steps && !/data-aimg/.test(c.answer) ? `<div class="rx-figs">${aImgs.map(i => figHtml(i.src, i.cap, 'rx-fig-a')).join('')}</div>` : ''}
            <div class="rx-grade"><span class="rx-label">How did you do?</span>
              <button class="btn btn-primary" type="button" data-grade="ok">Nailed it</button>
              <button class="btn btn-warn" type="button" data-grade="part">Partly — missed a finding</button>
              <button class="btn btn-danger" type="button" data-grade="miss">Missed the diagnosis</button>
            </div>
            ${(c.tags || []).length ? `<div class="rx-related"><span class="rx-label">Study the related topics</span>${c.tags.map(t => { const tp = TOPIC_BY_ID[t]; return tp ? `<button class="cat-chip" type="button" data-topic="${t}">${tp.kind === 'sim' ? '▶' : '☰'} ${esc(tp.name)}</button>` : ''; }).join('')}</div>` : ''}
            <div class="pearl-src">${isPtb(c) ? `<div class="muted">${PTB_NOTE}</div>` : `<div><strong>Source:</strong> <a href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">${esc(c.title)} — LITFL</a> (comments and discussion on the original page)</div><div class="muted">${CC_NOTE}</div>`}</div>
          </div>
        </div>`;
      bindFigs(host);
      document.getElementById('rxBack').onclick = () => { rxCurrent = null; renderCases(); };
      host.querySelectorAll('[data-go]').forEach(b => b.onclick = () => openCase(RCASES[+b.dataset.go].id));
      const note = document.getElementById('rxNote');
      note.oninput = () => { learnState.caseNotes = learnState.caseNotes || {}; learnState.caseNotes[id] = note.value.slice(0, 2000); saveLearn(); };
      if (c.steps) renderSteps(c, () => { const a = document.getElementById('rxAnswer'); if (a.hidden) { a.hidden = false; bindFigs(a); } });
      const rv = document.getElementById('rxReveal');
      if (rv) rv.onclick = (e) => { e.currentTarget.hidden = true; const a = document.getElementById('rxAnswer'); a.hidden = false; bindFigs(a); a.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
      host.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { rxCurrent = null; openTopic(b.dataset.topic); });
      host.querySelectorAll('[data-grade]').forEach(b => b.onclick = () => {
        setCaseState(id, b.dataset.grade);
        if (rxExam) {
          rxExam.grades[id] = b.dataset.grade;
          rxExam.i++;
          if (rxExam.i < rxExam.ids.length) { openCase(rxExam.ids[rxExam.i]); return; }
          const g = Object.values(rxExam.grades);
          const okN = g.filter(x => x === 'ok').length, partN = g.filter(x => x === 'part').length;
          const missed = rxExam.ids.filter(x => rxExam.grades[x] !== 'ok');
          rxExam = null; rxCurrent = null; renderCases();
          const r = document.createElement('div');
          r.className = 'panel rx-exam-report';
          r.innerHTML = `<h3 style="margin:0 0 6px;">Exam complete: ${okN} nailed, ${partN} partial, ${g.length - okN - partN} missed</h3><p class="muted" style="margin:0 0 8px;">Re-read these, then open the linked topics:</p>${missed.map(x => `<button class="cat-chip" type="button" data-case="${x}">${esc(RCASE_BY_ID[x].title)} — ${esc(RCASE_BY_ID[x].label)}</button>`).join(' ') || 'Clean sweep.'}`;
          document.getElementById('casesRoot').prepend(r);
          r.querySelectorAll('[data-case]').forEach(bb => bb.onclick = () => openCase(bb.dataset.case));
          return;
        }
        if (c.steps) rxStepShown[id] = c.steps.length;
        renderCaseViewer(id);
        const a = document.getElementById('rxAnswer'); a.hidden = false; const rv2 = document.getElementById('rxReveal'); if (rv2) rv2.hidden = true; bindFigs(a);
      });
      const end = document.getElementById('rxExamEnd'); if (end) end.onclick = () => { rxExam = null; rxCurrent = null; renderCases(); };
      if (st && !rxExam) { /* already attempted: keep answer collapsed until asked, but show grade state */ }
    }

    // ---- Lesson-panel tab + reader integration ----
    function realEcgHtml(id) {
      const ex = examplesForTopic(id), cs = casesForTopic(id);
      if (!ex.length && !cs.length) return '<p class="muted">No real ECG examples linked to this topic yet.</p>';
      let h = '';
      if (cs.length) h += `<div class="lesson-sub">Practise on real cases (vignette first, answer hidden):</div><div class="rx-chiprow">${cs.map(c => `<button class="cat-chip" type="button" data-case="${c.id}"><i class="tc-dot st-${caseStatus(c.id)}"></i>${esc(c.title)}</button>`).join('')}</div>`;
      if (ex.length) h += `<div class="lesson-sub">Annotated examples from the LITFL ECG Library:</div><div class="rx-examples">${ex.slice(0, 12).map(e => `<div class="rx-ex">${figHtml(e.src, (e.cap || e.heading) + (LITFL_TITLES[e.slug] ? ' — ' + LITFL_TITLES[e.slug] : ''))}${e.notes && e.notes.length ? `<ul>${e.notes.slice(0, 5).map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}</div>`).join('')}</div>
        <div class="muted" style="font-size:11.5px;margin-top:6px;">Example ECGs and annotations © Life in the Fast Lane, <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a> — see the linked LITFL pages for full context.</div>`;
      return h;
    }
    function bindRealEcg(host) {
      bindFigs(host);
      host.querySelectorAll('[data-case]').forEach(b => b.onclick = () => { closeReaderSilently(); openCase(b.dataset.case); });
    }
    function closeReaderSilently() { document.getElementById('lessonModal').classList.remove('open'); }

    const _v6RenderLesson = renderLesson;
    renderLesson = function (id) {
      _v6RenderLesson(id);
      const host = document.getElementById('cardRealEcg');
      if (!host) return;
      host.innerHTML = realEcgHtml(id);
      bindRealEcg(host);
      const tab = document.querySelector('.lesson-tab[data-ltab="real"]');
      const n = casesForTopic(id).length + examplesForTopic(id).length;
      if (tab) tab.textContent = 'Real ECGs' + (n ? ' (' + n + ')' : '');
    };
