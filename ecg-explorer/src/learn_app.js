    // =========================================================================
    // v6 LEARNING LAYER — pathway, lesson panel, recall, mastery
    // =========================================================================
    const LVL_NAME = { 1: 'Foundations', 2: 'Core', 3: 'Advanced', 4: 'Expert' };
    const LVL_BLURB = {
      1: 'Build the reading machinery: paper, leads, axis, intervals and a read you never skip.',
      2: 'What every resident must recognise and act on, on any shift.',
      3: 'Senior-resident and board level: subtle patterns, mechanisms and look-alikes.',
      4: 'Specialist level: OMI patterns, channelopathies, rare rhythms and edge cases.'
    };
    const SYS = [
      { id: 'found', label: 'Reading machinery', short: 'Basics' },
      { id: 'atrial', label: 'Sinus & atrial rhythms', short: 'Sinus/atrial' },
      { id: 'svt', label: 'AV-nodal re-entry & pre-excitation', short: 'AVNRT/WPW' },
      { id: 'brady', label: 'Bradycardia, AV block & escape', short: 'Brady/AV block' },
      { id: 'cond', label: 'Bundle branches & fascicles', short: 'BBB/fascicles' },
      { id: 'vent', label: 'Ventricular arrhythmias', short: 'Ventricular' },
      { id: 'pace', label: 'Pacemakers', short: 'Pacing' },
      { id: 'isch', label: 'Ischaemia & occlusion MI', short: 'Ischaemia/OMI' },
      { id: 'mimic', label: 'ST & T-wave mimics', short: 'ST-T mimics' },
      { id: 'channel', label: 'Channelopathies & cardiomyopathies', short: 'Channel/CMP' },
      { id: 'lytes', label: 'Electrolytes & temperature', short: 'Lytes/temp' },
      { id: 'tox', label: 'Toxicology', short: 'Tox' },
      { id: 'struct', label: 'Right heart, pericardium & chambers', short: 'Right heart/chambers' },
      { id: 'tech', label: 'Technical & artefact', short: 'Technical' }
    ];
    const SYS_LABEL = Object.fromEntries(SYS.map(s => [s.id, s.label]));
    const SYS_OF = {
      nsr: 'atrial', sinus_brady: 'atrial', sinus_tach: 'atrial', tachy_brady: 'atrial', focal_at: 'atrial', mat: 'atrial', flutter: 'atrial', afib: 'atrial', pac_aberrant: 'atrial',
      avnrt: 'svt', atypical_avnrt: 'svt', ortho_avrt: 'svt', anti_avrt: 'svt', wpw_sinus: 'svt', preexcited_afib: 'svt', afib_lbbb: 'svt',
      avb1: 'brady', mobitz1: 'brady', mobitz2: 'brady', avb2_2to1: 'brady', avb3: 'brady', junctional: 'brady',
      rbbb: 'cond', lbbb: 'cond', lafb: 'cond', bifascicular: 'cond',
      pvc: 'vent', vt: 'vent', torsades: 'vent', vf: 'vent', aivr: 'vent', bidir_vt: 'vent',
      paced: 'pace', pacer_fail: 'pace', pacer_undersense: 'pace',
      stemi: 'isch', hyperacute_t: 'isch', post_stemi: 'isch', wellens: 'isch', dewinter: 'isch', left_main_avr: 'isch', sgarbossa_stemi: 'isch',
      pericarditis: 'mimic', early_repol: 'mimic', lvh: 'mimic', cerebral_t: 'mimic',
      brugada: 'channel', hocm: 'channel', arvc: 'channel',
      hyperk: 'lytes', hypok: 'lytes', hypoca: 'lytes', hyperca: 'lytes', hypothermia: 'lytes',
      digoxin: 'tox', tca_tox: 'tox',
      pe_s1q3t3: 'struct', rvh: 'struct', tamponade: 'struct',
      lead_reversal: 'tech'
    };
    const EXT_BY_ID = Object.fromEntries(EXTEND.map(e => [e.id, e]));
    const FOUND_BY_ID = Object.fromEntries(FOUNDATIONS.map(f => [f.id, f]));
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    // Unified topic list in pathway order (level → system → source order)
    function buildTopics() {
      const t = [];
      FOUNDATIONS.forEach(f => t.push({ id: f.id, kind: 'read', lvl: 1, sys: 'found', name: f.title }));
      ECG_DATA.forEach(d => { const L = LEARN[d.id]; t.push({ id: d.id, kind: 'sim', lvl: L ? L.lvl : 2, sys: SYS_OF[d.id] || 'tech', name: d.name }); });
      EXTEND.forEach(e => t.push({ id: e.id, kind: 'read', lvl: e.lvl, sys: e.group, name: e.title }));
      const sysIdx = Object.fromEntries(SYS.map((s, i) => [s.id, i]));
      return t.map((x, i) => ({ ...x, i })).sort((a, b) => a.lvl - b.lvl || sysIdx[a.sys] - sysIdx[b.sys] || a.i - b.i);
    }
    const TOPICS = buildTopics();
    const TOPIC_BY_ID = Object.fromEntries(TOPICS.map(t => [t.id, t]));

    // ---- Learner state (per browser) ----
    const LEARN_KEY = 'ecgStudio.learn.v1';
    function loadLearn() {
      try { const s = JSON.parse(localStorage.getItem(LEARN_KEY) || 'null'); if (s && s.reviewed) return s; } catch (e) {}
      return { reviewed: {}, recall: {}, ltab: 'see', showAll: false, visited: false, lastMode: 'learn' };
    }
    let learnState = loadLearn();
    function saveLearn() { try { localStorage.setItem(LEARN_KEY, JSON.stringify(learnState)); } catch (e) {} }

    function recallCardsFor(id) {
      if (LEARN[id]) return LEARN[id].rc || [];
      if (EXT_BY_ID[id]) return EXT_BY_ID[id].rc || [];
      if (FOUND_BY_ID[id]) return FOUND_BY_ID[id].rc || [];
      return [];
    }
    function topicStatus(id) {
      const t = TOPIC_BY_ID[id];
      const rev = !!learnState.reviewed[id];
      const cards = recallCardsFor(id);
      const recallOk = cards.length > 0 && cards.every((_, i) => (learnState.recall[id + '#' + i] || {}).last === 'ok');
      if (t && t.kind === 'sim') {
        const it = progress.items[id];
        if (it && it.box >= 4) return 'mastered';
        if (it && it.box <= 1 && it.seen) return 'shaky';
        if (it && it.seen) return 'practising';
      } else if (rev && recallOk) return 'mastered';
      if (rev) return 'reviewed';
      return 'new';
    }
    const STATUS_LABEL = { new: 'Not started', reviewed: 'Reviewed', practising: 'In quiz rotation', shaky: 'Missed recently', mastered: 'Mastered' };

    function litflLinks(src, notRead) {
      if (!src || !src.length) return '';
      const links = src.map(s => `<a href="https://litfl.com/${s}/" target="_blank" rel="noopener noreferrer">${esc(LITFL_TITLES[s] || s)}</a>`).join(' · ');
      const note = notRead
        ? 'Written for this app from standard references — the LITFL page could not be retrieved, so these points are <strong>not</strong> adapted from it (except where marked). Link provided for further reading.'
        : 'Adapted (condensed &amp; paraphrased) from the <a href="https://litfl.com/ecg-library/" target="_blank" rel="noopener noreferrer">LITFL ECG Library</a> by Life in the Fast Lane, licensed <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>. This adaptation is shared under the same licence.';
      return `<div class="pearl-src"><div><strong>Read the source:</strong> ${links}</div><div class="muted">${note}</div></div>`;
    }

    function recallHtml(id) {
      const cards = recallCardsFor(id);
      if (!cards.length) return '<p class="muted">No recall cards for this topic yet.</p>';
      return `<p class="muted" style="margin:0 0 8px;">Answer in your head first, then reveal and grade yourself honestly — this is what moves knowledge into long-term memory.</p>` +
        cards.map((c, i) => {
          const st = learnState.recall[id + '#' + i] || {};
          const badge = st.last ? `<span class="rc-badge rc-${st.last}">${st.last === 'ok' ? '✓ got it' : '✗ missed'}${st.n > 1 ? ' ×' + st.n : ''}</span>` : '';
          return `<div class="rc-card" data-rc="${esc(id)}#${i}">
            <div class="rc-q"><span class="rc-num">Q${i + 1}</span> ${esc(c[0])} ${badge}</div>
            <button class="btn rc-show" type="button">Show answer</button>
            <div class="rc-a" hidden><div>${esc(c[1])}</div>
              <div class="rc-grade"><button class="btn btn-primary rc-ok" type="button">Got it</button><button class="btn btn-warn rc-miss" type="button">Missed it</button></div>
            </div></div>`;
        }).join('');
    }
    function bindRecall(host, onChange) {
      host.querySelectorAll('.rc-card').forEach(card => {
        const key = card.dataset.rc;
        card.querySelector('.rc-show').onclick = (e) => { e.currentTarget.hidden = true; card.querySelector('.rc-a').hidden = false; };
        const grade = (ok) => {
          const st = learnState.recall[key] || { n: 0 };
          st.n = (st.n || 0) + 1; st.last = ok ? 'ok' : 'miss'; st.t = Date.now();
          learnState.recall[key] = st;
          const id = key.split('#')[0];
          if (ok && recallCardsFor(id).every((_, i) => (learnState.recall[id + '#' + i] || {}).last === 'ok')) learnState.reviewed[id] = learnState.reviewed[id] || Date.now();
          saveLearn();
          if (onChange) onChange();
        };
        card.querySelector('.rc-ok').onclick = () => grade(true);
        card.querySelector('.rc-miss').onclick = () => grade(false);
      });
    }

    // ---- Studio lesson panel ----
    function setLessonTab(tab) {
      if (tab === 'all') { learnState.showAll = !learnState.showAll; }
      else { learnState.ltab = tab; learnState.showAll = false; }
      saveLearn();
      applyLessonTab();
    }
    function applyLessonTab() {
      const panel = document.getElementById('lessonPanel');
      if (!panel) return;
      panel.classList.toggle('show-all', !!learnState.showAll);
      panel.querySelectorAll('.lesson-tab').forEach(b => {
        b.classList.toggle('active', b.dataset.ltab === 'all' ? !!learnState.showAll : (!learnState.showAll && b.dataset.ltab === learnState.ltab));
      });
      panel.querySelectorAll('.lesson-pane').forEach(p => p.classList.toggle('active', p.dataset.lpane === learnState.ltab));
      const allBtn = panel.querySelector('.lesson-tab-all');
      if (allBtn) allBtn.textContent = learnState.showAll ? 'Tabs view' : 'Show all';
    }
    function nextInPath(id) {
      const i = TOPICS.findIndex(t => t.id === id);
      return TOPICS.slice(i + 1).find(t => !learnState.reviewed[t.id]) || TOPICS[(i + 1) % TOPICS.length];
    }
    function openTopic(id) {
      const t = TOPIC_BY_ID[id];
      if (!t) return;
      if (t.kind === 'sim') { switchMode('studio'); selectRhythm(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }
      else openReader(id);
    }
    function renderLesson(id) {
      const L = LEARN[id];
      const panel = document.getElementById('lessonPanel');
      if (!panel) return;
      const lvl = L ? L.lvl : 2;
      const lvlEl = document.getElementById('lessonLvl');
      lvlEl.textContent = 'L' + lvl + ' · ' + LVL_NAME[lvl];
      lvlEl.className = 'lvl-badge lvl-' + lvl;
      document.getElementById('lessonSys').textContent = SYS_LABEL[SYS_OF[id]] || '';
      document.getElementById('lessonBottomLine').textContent = L ? L.bl : '';
      const doneBtn = document.getElementById('lessonDoneBtn');
      const syncDone = () => {
        const rev = !!learnState.reviewed[id];
        doneBtn.textContent = rev ? '✓ Reviewed' : 'Mark reviewed';
        doneBtn.classList.toggle('active', rev);
      };
      syncDone();
      doneBtn.onclick = () => {
        if (learnState.reviewed[id]) delete learnState.reviewed[id]; else learnState.reviewed[id] = Date.now();
        saveLearn(); syncDone();
      };
      const nx = nextInPath(id);
      const nextBtn = document.getElementById('lessonNextBtn');
      nextBtn.textContent = 'Next in pathway: ' + (nx ? nx.name : '') + ' →';
      nextBtn.onclick = () => nx && openTopic(nx.id);

      document.getElementById('cardPearls').innerHTML = L ? L.lp.map(x => `<li>${esc(x)}</li>`).join('') : '';
      document.getElementById('cardPearlSrc').innerHTML = L ? litflLinks(L.src, L.litflNotRead) : '';
      const recallHost = document.getElementById('cardRecall');
      const drawRecall = () => { recallHost.innerHTML = recallHtml(id); bindRecall(recallHost, () => { drawRecall(); syncDone(); }); };
      drawRecall();

      // Look-alike duels involving this topic + extension lessons that simulate here
      const duels = DUEL_PRESETS.filter(p => p.a === id || p.b === id);
      const exts = EXTEND.filter(e => e.sim === id);
      let html = '';
      if (duels.length) html += '<div class="lesson-sub">Compare side-by-side:</div>' + duels.map(p => `<button class="cat-chip" type="button" data-duel="${p.a}|${p.b}">${esc(p.label)}</button>`).join('');
      if (exts.length) html += '<div class="lesson-sub">Related reading lessons:</div>' + exts.map(e => `<button class="cat-chip" type="button" data-read="${e.id}">${esc(e.title)}</button>`).join('');
      const dHost = document.getElementById('lessonDuels');
      dHost.innerHTML = html;
      dHost.querySelectorAll('[data-duel]').forEach(b => b.onclick = () => { const [a, c] = b.dataset.duel.split('|'); openCompare(a, c); });
      dHost.querySelectorAll('[data-read]').forEach(b => b.onclick = () => openReader(b.dataset.read));
      applyLessonTab();
    }
    function openCompare(a, b) {
      compIdA = a; compIdB = b;
      const sa = document.getElementById('compSelectA'), sb = document.getElementById('compSelectB');
      if (sa) sa.value = a; if (sb) sb.value = b;
      switchMode('compare');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ---- Reading-lesson modal (foundations + expert extensions) ----
    function runTryIt(f) {
      closeReader();
      if (f.sim) {
        switchMode('studio'); selectRhythm(f.sim);
        if (f.lead === '12') setLeadView('12');
        if (f.calipers && !calipersOn) document.getElementById('caliperBtn').click();
      } else if (f.blind) {
        switchMode('studio');
        if (!blindMode) document.getElementById('blindModeBtn').click();
      } else if (f.tool) {
        switchMode('tools');
        const anchor = f.tool === 'axis' ? document.getElementById('hexaxialSvg') : document.getElementById('qtcQtIn');
        setTimeout(() => anchor && anchor.closest('.tool-card').scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
      } else if (f.compare) {
        openCompare(f.compare[0], f.compare[1]);
      } else if (f.tables) {
        switchMode('compare');
        setTimeout(() => { const g = document.querySelector('.algo-grid'); g && g.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 60);
      }
    }
    function openReader(id) {
      const f = FOUND_BY_ID[id], e = EXT_BY_ID[id];
      const L = f || e;
      if (!L) return;
      const t = TOPIC_BY_ID[id];
      const lvl = t.lvl;
      const modal = document.getElementById('lessonModal');
      const body = document.getElementById('lessonModalBody');
      const sameLevel = TOPICS.filter(x => x.lvl === lvl);
      const idx = sameLevel.findIndex(x => x.id === id);
      const prev = sameLevel[idx - 1], next = sameLevel[idx + 1];
      const draw = () => {
        const rev = !!learnState.reviewed[id];
        body.innerHTML = `
          <div class="modal-head">
            <div><span class="lvl-badge lvl-${lvl}">L${lvl} · ${LVL_NAME[lvl]}</span> <span class="muted" style="font-size:12px;">${esc(SYS_LABEL[t.sys] || '')} • Reading lesson</span>
              <h2 class="reader-title">${esc(L.title)}</h2></div>
            <button class="btn" type="button" data-close>Close (Esc)</button>
          </div>
          <div class="lesson-bl-text">${esc(L.bl)}</div>
          <div class="reader-grid">
            <div class="info-card card-pearl"><h3>Learning points</h3><ul>${L.lp.map(x => `<li>${esc(x)}</li>`).join('')}</ul>${litflLinks(L.src, L.litflNotRead)}</div>
            <div class="info-card card-recall"><h3>Active recall</h3><div class="reader-recall">${recallHtml(id)}</div></div>
          </div>
          <div class="reader-actions">
            ${f && f.tryIt ? `<button class="btn btn-primary" type="button" data-try>Try it: ${esc(f.tryIt.label)}</button>` : ''}
            ${e && e.sim ? `<button class="btn btn-primary" type="button" data-sim>Open nearest live ECG: ${esc(DATA_BY_ID[e.sim].name)} →</button>` : ''}
            <button class="btn ${rev ? 'active' : ''}" type="button" data-rev>${rev ? '✓ Reviewed' : 'Mark reviewed'}</button>
          </div>
          <div class="reader-nav">
            ${prev ? `<button class="btn" type="button" data-go="${prev.id}">← ${esc(prev.name)}</button>` : '<span></span>'}
            ${next ? `<button class="btn" type="button" data-go="${next.id}">${esc(next.name)} →</button>` : ''}
          </div>`;
        body.querySelector('[data-close]').onclick = closeReader;
        const tryB = body.querySelector('[data-try]'); if (tryB) tryB.onclick = () => runTryIt(f.tryIt);
        const simB = body.querySelector('[data-sim]'); if (simB) simB.onclick = () => { closeReader(); openTopic(e.sim); };
        body.querySelector('[data-rev]').onclick = () => { if (learnState.reviewed[id]) delete learnState.reviewed[id]; else learnState.reviewed[id] = Date.now(); saveLearn(); draw(); };
        body.querySelectorAll('[data-go]').forEach(b => b.onclick = () => { closeReader(); openTopic(b.dataset.go); });
        bindRecall(body.querySelector('.reader-recall'), draw);
      };
      draw();
      modal.classList.add('open');
      modal.scrollTop = 0;
    }
    function closeReader() {
      document.getElementById('lessonModal').classList.remove('open');
      if (appMode === 'learn') renderLearn();
    }

    // ---- Learn (pathway) view ----
    function renderLearn() {
      const host = document.getElementById('learnRoot');
      if (!host) return;
      const now = Date.now();
      const counts = { total: TOPICS.length, reviewed: 0, mastered: 0 };
      TOPICS.forEach(t => { const s = topicStatus(t.id); if (s !== 'new') counts.reviewed++; if (s === 'mastered') counts.mastered++; });
      const due = Object.entries(progress.items).filter(([id, it]) => DATA_BY_ID[id] && it.due && it.due <= now).length;
      const cont = TOPICS.find(t => topicStatus(t.id) === 'new') || TOPICS[0];
      const pct = Math.round(100 * counts.reviewed / counts.total);

      let html = `
        <div class="panel learn-hero">
          <div class="learn-hero-text">
            <h2>Your ECG pathway</h2>
            <p class="muted">Foundations → Core → Advanced → Expert. For each topic: read the <strong>bottom line</strong>, study the <strong>live ECG</strong>, test yourself with <strong>recall cards</strong>, then prove it under pressure in the <strong>Quiz</strong>. Spaced repetition brings missed topics back.</p>
            <div class="learn-progress" role="img" aria-label="${pct}% of topics started"><span style="width:${pct}%"></span></div>
            <div class="learn-stats">
              <span><strong>${counts.reviewed}</strong> / ${counts.total} topics started</span>
              <span><strong>${counts.mastered}</strong> mastered</span>
              <span><strong>${due}</strong> quiz reviews due</span>
            </div>
          </div>
          <div class="learn-hero-actions">
            <button class="btn btn-primary" type="button" id="learnContinue">Continue: ${esc(cont.name)} →</button>
            <button class="btn btn-warn" type="button" id="learnDue">${due ? 'Review ' + due + ' due case' + (due > 1 ? 's' : '') : 'Quiz drill (spaced)'}</button>
            <button class="btn" type="button" id="learnBlind">Blind reading drill</button>
          </div>
        </div>
        <div class="learn-legend">
          <span><i class="tc-dot st-new"></i>Not started</span><span><i class="tc-dot st-reviewed"></i>Reviewed</span>
          <span><i class="tc-dot st-practising"></i>In quiz rotation</span><span><i class="tc-dot st-shaky"></i>Missed recently</span><span><i class="tc-dot st-mastered"></i>Mastered</span>
          <span class="muted">▶ live ECG · ☰ reading lesson</span>
        </div>
        <div class="level-jump">${[1, 2, 3, 4].map(l => `<button class="cat-chip" type="button" data-jump="${l}">L${l} ${LVL_NAME[l]}</button>`).join('')}</div>`;

      [1, 2, 3, 4].forEach(lvl => {
        const lv = TOPICS.filter(t => t.lvl === lvl);
        const done = lv.filter(t => topicStatus(t.id) !== 'new').length;
        html += `<section class="panel level-sec" id="level-${lvl}">
          <div class="level-head"><h3><span class="lvl-badge lvl-${lvl}">L${lvl}</span> ${LVL_NAME[lvl]}</h3><span class="muted">${done} / ${lv.length} started</span></div>
          <p class="muted level-blurb">${LVL_BLURB[lvl]}</p>`;
        SYS.forEach(s => {
          const items = lv.filter(t => t.sys === s.id);
          if (!items.length) return;
          html += `<div class="module"><h4>${esc(s.label)}</h4><div class="topic-grid">` +
            items.map(t => {
              const st = topicStatus(t.id);
              return `<button class="topic-card" type="button" data-open="${t.id}" title="${esc(STATUS_LABEL[st])}">
                <i class="tc-dot st-${st}"></i><span class="tc-name">${esc(t.name)}</span><span class="tc-kind">${t.kind === 'sim' ? '▶' : '☰'}</span></button>`;
            }).join('') + '</div></div>';
        });
        html += '</section>';
      });
      html += `<div class="muted learn-foot">Learning points adapted from the <a href="https://litfl.com/ecg-library/" target="_blank" rel="noopener noreferrer">LITFL ECG Library</a> (CC BY-NC-SA 4.0); progress is saved only in this browser. Educational use only — drug doses and energies must be checked against your local protocol.</div>`;
      host.innerHTML = html;
      host.querySelectorAll('[data-open]').forEach(b => b.onclick = () => openTopic(b.dataset.open));
      host.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => document.getElementById('level-' + b.dataset.jump).scrollIntoView({ behavior: 'smooth', block: 'start' }));
      document.getElementById('learnContinue').onclick = () => openTopic(cont.id);
      document.getElementById('learnDue').onclick = () => { document.getElementById('quizOrder').value = 'smart'; switchMode('quiz'); };
      document.getElementById('learnBlind').onclick = () => runTryIt({ blind: true });
    }

    // ---- Library + search integrations ----
    function v6ItemSub(d) {
      const L = LEARN[d.id];
      const st = topicStatus(d.id);
      return `<i class="tc-dot st-${st}"></i>${L ? 'L' + L.lvl + ' ' + LVL_NAME[L.lvl] : ''} • ${d.hr}`;
    }
    function v6SearchHit(id, q) {
      const L = LEARN[id];
      return !!L && (L.bl.toLowerCase().includes(q) || L.lp.some(x => x.toLowerCase().includes(q)));
    }

    // ---- Wrap core functions (keeps v5 engine untouched) ----
    const _v5SelectRhythm = selectRhythm;
    selectRhythm = function (id) { _v5SelectRhythm(id); renderLesson(id); };
    const _v5SwitchMode = switchMode;
    switchMode = function (mode) {
      _v5SwitchMode(mode);
      learnState.lastMode = mode; saveLearn();
      if (mode === 'learn') renderLearn();
    };

    document.querySelectorAll('#lessonPanel .lesson-tab').forEach(b => b.onclick = () => setLessonTab(b.dataset.ltab));
    document.getElementById('lessonModal').addEventListener('click', (e) => { if (e.target.id === 'lessonModal') closeReader(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && document.getElementById('lessonModal').classList.contains('open')) closeReader(); });
    document.querySelectorAll('.seg-btn[data-mode]').forEach(btn => { btn.onclick = () => switchMode(btn.dataset.mode); });

    function v6Init() {
      const first = !learnState.visited;
      learnState.visited = true; saveLearn();
      const start = first ? 'learn' : (['learn', 'studio', 'compare', 'quiz', 'tools'].includes(learnState.lastMode) ? learnState.lastMode : 'learn');
      switchMode(start === 'quiz' ? 'learn' : start);
    }
