    // =========================================================================
    // v11 TRAINING — structured reads with automatic marking, LITFL flashcards,
    // a daily mixed session and a weakness map.
    // =========================================================================

    // ---- 1. Findings taxonomy -------------------------------------------------
    const RHYTHMS = [['sinus', 'Sinus rhythm'], ['sbrad', 'Sinus bradycardia'], ['stach', 'Sinus tachycardia'], ['af', 'Atrial fibrillation'],
      ['flutter', 'Atrial flutter'], ['svt', 'SVT / atrial tachycardia'], ['junct', 'Junctional'], ['vent', 'Ventricular (VT, VF, AIVR, escape)'], ['paced', 'Paced'], ['other', 'Other']];
    const AXES = [['normal', 'Normal'], ['left', 'Left'], ['right', 'Right'], ['extreme', 'Extreme']];
    const FGROUPS = [
      { id: 'cond', label: 'Conduction', items: [['avb1', '1st-degree AV block'], ['avb2', '2nd-degree AV block'], ['avb3', 'Complete heart block'], ['rbbb', 'RBBB'], ['irbbb', 'Incomplete RBBB'], ['lbbb', 'LBBB'], ['lafb', 'LAFB'], ['lpfb', 'LPFB'], ['ivcd', 'Non-specific IVCD'], ['wpw', 'Pre-excitation (WPW)']] },
      { id: 'hyp', label: 'Hypertrophy & voltage', items: [['atrial', 'Atrial enlargement'], ['lvh', 'LVH'], ['rvh', 'RVH'], ['lowv', 'Low QRS voltage']] },
      { id: 'isch', label: 'Ischaemia & infarction', items: [['mi_ant', 'Anterior / anteroseptal MI'], ['mi_inf', 'Inferior MI'], ['mi_lat', 'Lateral MI'], ['mi_post', 'Posterior MI'], ['omi', 'OMI equivalent (hyperacute T, Wellens, de Winter…)'], ['avr', 'STE aVR + diffuse ST depression'], ['isch', 'Ischaemic ST depression / T inversion'], ['qwave', 'Pathological Q waves'], ['aneur', 'LV aneurysm pattern']] },
      { id: 'ect', label: 'Ectopy', items: [['pac', 'PACs'], ['pvc', 'PVCs']] },
      { id: 'oth', label: 'Other', items: [['normal', 'Normal ECG'], ['longqt', 'Long QT'], ['hyperk', 'Hyperkalaemia'], ['hypok', 'Hypokalaemia'], ['lytes', 'Other electrolyte (Ca, Mg)'], ['dig', 'Digoxin effect / toxicity'], ['nablock', 'Na-channel blocker toxicity'], ['peric', 'Pericarditis'], ['ber', 'Benign early repolarisation'], ['brugada', 'Brugada pattern'], ['pe', 'PE / RV strain']] }
    ];
    const FNAME = Object.fromEntries(FGROUPS.flatMap(g => g.items));
    const FGROUP_OF = Object.fromEntries(FGROUPS.flatMap(g => g.items.map(([k]) => [k, g.id])));
    const RNAME = Object.fromEntries(RHYTHMS), ANAME = Object.fromEntries(AXES);

    // PTB-XL SCP code -> rhythm / finding (form & rhythm statements carry likelihood 0 = asserted)
    const PTB_RHY = { SR: 'sinus', SARRH: 'sinus', SBRAD: 'sbrad', STACH: 'stach', AFIB: 'af', AFLT: 'flutter', SVTAC: 'svt', PSVT: 'svt', PACE: 'paced', SVARR: 'other' };
    const PTB_F = { '1AVB': ['avb1'], '2AVB': ['avb2'], '3AVB': ['avb3'], CRBBB: ['rbbb'], IRBBB: ['irbbb'], CLBBB: ['lbbb'], ILBBB: ['lbbb', 1], LAFB: ['lafb'], LPFB: ['lpfb'],
      IVCD: ['ivcd'], WPW: ['wpw'], 'LAO/LAE': ['atrial'], 'RAO/RAE': ['atrial'], LVH: ['lvh'], VCLVH: ['lvh', 1], HVOLT: ['lvh', 1], SEHYP: ['lvh', 1], RVH: ['rvh'], LVOLT: ['lowv'],
      IMI: ['mi_inf'], ASMI: ['mi_ant'], AMI: ['mi_ant'], ALMI: ['mi_ant', 'mi_lat'], LMI: ['mi_lat'], ILMI: ['mi_inf', 'mi_lat'], IPMI: ['mi_inf', 'mi_post'], IPLMI: ['mi_inf', 'mi_post', 'mi_lat'], PMI: ['mi_post'],
      INJAS: ['isch'], INJAL: ['isch'], INJIL: ['isch'], INJLA: ['isch'], INJIN: ['isch'], ISCAL: ['isch'], ISCAS: ['isch'], ISCIN: ['isch'], ISCIL: ['isch'], ISCLA: ['isch'], ISCAN: ['isch'], ISC_: ['isch'],
      STD_: ['isch', 1], NST_: ['isch', 1], NDT: ['isch', 1], NT_: ['isch', 1], LOWT: ['isch', 1], INVT: ['isch', 1], TAB_: ['isch', 1],
      QWAVE: ['qwave'], ANEUR: ['aneur'], LNGQT: ['longqt'], DIG: ['dig'], EL: ['lytes', 1], PVC: ['pvc'], PAC: ['pac'], BIGU: ['pvc', 1], TRIGU: ['pvc', 1], NORM: ['normal'] };
    const PTB_AXIS = { MID: 'normal', LAD: 'left', ALAD: 'left', RAD: 'right', ARAD: 'right' };

    // LITFL topic tag -> rhythm / findings. Only the case's FIRST tag (its key diagnosis) is required;
    // the other tags are related topics (sometimes contrasts), so choosing them is never penalised.
    const TAG_RHY = { afib: 'af', preexcited_afib: 'af', afib_lbbb: 'af', flutter: 'flutter', avnrt: 'svt', atypical_avnrt: 'svt', ortho_avrt: 'svt', anti_avrt: 'svt', focal_at: 'svt', mat: 'other',
      vt: 'vent', torsades: 'vent', vf: 'vent', aivr: 'vent', bidir_vt: 'vent', x_fascvt: 'vent', x_rvot: 'vent', x_vflutter: 'vent', x_ventescape: 'vent', junctional: 'junct', x_ajr: 'junct',
      paced: 'paced', pacer_fail: 'paced', pacer_undersense: 'paced', sinus_brady: 'sbrad', sinus_tach: 'stach', nsr: 'sinus', x_sinusarr: 'sinus', tachy_brady: 'other' };
    const TAG_F = { avb1: ['avb1'], mobitz1: ['avb2'], mobitz2: ['avb2'], avb2_2to1: ['avb2'], x_highgrade: ['avb2'], avb3: ['avb3'], rbbb: ['rbbb'], lbbb: ['lbbb'], afib_lbbb: ['lbbb'],
      lafb: ['lafb'], x_lpfb: ['lpfb'], bifascicular: ['rbbb', 'lafb'], x_trifasc: ['rbbb', 'lafb'], x_mbbb: ['rbbb', 'lafb'], wpw_sinus: ['wpw'], preexcited_afib: ['wpw'], anti_avrt: ['wpw'],
      lvh: ['lvh'], rvh: ['rvh'], x_atrial: ['atrial'], x_lowvolt: ['lowv'], tamponade: ['lowv'], post_stemi: ['mi_post'], x_rvmi: ['mi_inf'], x_highlat: ['mi_lat'],
      hyperacute_t: ['omi'], x_omi: ['omi'], wellens: ['omi'], dewinter: ['omi'], x_aslanger: ['omi'], sgarbossa_stemi: ['omi'], left_main_avr: ['avr'], x_nste: ['isch'],
      x_lvaneurysm: ['aneur'], hyperk: ['hyperk'], hypok: ['hypok'], hypoca: ['lytes'], hyperca: ['lytes'], x_hypomg: ['lytes'], digoxin: ['dig'], tca_tox: ['nablock'],
      x_lqts: ['longqt'], pericarditis: ['peric'], early_repol: ['ber'], brugada: ['brugada'], pe_s1q3t3: ['pe'], pvc: ['pvc'], pac_aberrant: ['pac'], nsr: ['normal'] };
    function stemiTerritories(label) {
      const l = (label || '').toLowerCase(), t = [];
      if (/anter|septal/.test(l)) t.push('mi_ant');
      if (/infer/.test(l)) t.push('mi_inf');
      if (/later/.test(l)) t.push('mi_lat');
      if (/poster/.test(l)) t.push('mi_post');
      return t.length ? t : ['omi'];
    }
    // truth: {rhythm, axis, req:Set, opt:Set, graded, source}
    function caseTruth(c) {
      const T = { rhythm: null, axis: null, req: new Set(), opt: new Set(), source: c.src === 'ptbxl' ? 'ptbxl' : 'litfl' };
      if (c.src === 'ptbxl' && c.scp) {
        // most specific rhythm wins (sinus bradycardia over sinus rhythm, AF over sinus, …)
        const RHY_PRI = ['PACE', 'AFLT', 'AFIB', 'SVTAC', 'PSVT', 'SBRAD', 'STACH', 'SVARR', 'SARRH', 'SR'];
        const rc = RHY_PRI.find(k => k in c.scp);
        if (rc) T.rhythm = PTB_RHY[rc];
        Object.entries(c.scp).forEach(([code, v]) => {
          const m = PTB_F[code];
          if (!m) return;
          const optional = m[m.length - 1] === 1 || (v > 0 && v < 100);
          m.filter(x => typeof x === 'string').forEach(f => (optional ? T.opt : T.req).add(f));
        });
        T.axis = PTB_AXIS[c.axis] || null;
        T.opt.forEach(f => { if (T.req.has(f)) T.opt.delete(f); });
      } else if (!c.steps) {
        const tags = c.tags || [];
        tags.forEach((t, i) => {
          const fs = t === 'stemi' ? stemiTerritories(c.label) : (TAG_F[t] || []);
          fs.forEach(f => (i === 0 ? T.req : T.opt).add(f));
          if (TAG_RHY[t]) { if (i === 0) T.rhythm = TAG_RHY[t]; else T.optRhythm = T.optRhythm || TAG_RHY[t]; }
        });
        T.opt.forEach(f => { if (T.req.has(f)) T.opt.delete(f); });
        // LITFL label says it explicitly is NOT this ("… — not inferior OMI"): choosing it is an over-call
        if (/\bnot\b[^—.;]*\bOMI\b/i.test(c.label || '')) T.opt.delete('omi');
      }
      T.graded = T.req.size > 0 || !!T.rhythm;
      return T;
    }

    // ---- stats (feed the weakness map) ----
    function stats() { learnState.stats = learnState.stats || { f: {}, rhy: [0, 0], axis: [0, 0], fc: {} }; return learnState.stats; }
    function bump(obj, k, ok) { const a = obj[k] = obj[k] || [0, 0]; a[0] += ok ? 1 : 0; a[1] += 1; }

    function markRead(c, read) {
      const T = caseTruth(c);
      const chosen = new Set(read.f || []);
      const hits = [...T.req].filter(f => chosen.has(f));
      const missed = [...T.req].filter(f => !chosen.has(f));
      const over = [...chosen].filter(f => !T.req.has(f) && !T.opt.has(f));
      const bonus = [...chosen].filter(f => T.opt.has(f));
      const rhyOk = T.rhythm && read.r ? (read.r === T.rhythm || read.r === T.optRhythm) : null;
      const axOk = T.axis && read.a ? read.a === T.axis : null;
      const S = stats();
      T.req.forEach(f => bump(S.f, f, chosen.has(f)));
      over.forEach(f => { S.fp = S.fp || {}; S.fp[f] = (S.fp[f] || 0) + 1; });
      if (rhyOk !== null) { S.rhy[0] += rhyOk ? 1 : 0; S.rhy[1]++; }
      if (axOk !== null) { S.axis[0] += axOk ? 1 : 0; S.axis[1]++; }
      let grade = 'ok';
      if (missed.length || over.length || rhyOk === false) grade = (hits.length && hits.length >= missed.length) ? 'part' : 'miss';
      if (!T.req.size && rhyOk === false) grade = 'miss';
      return { T, hits, missed, over, bonus, rhyOk, axOk, grade, read };
    }

    // ---- 1. structured read UI inside the case viewer ----
    let srDraft = {};
    function srHtml(c, T) {
      const d = srDraft[c.id] || { f: [] };
      const chip = (k, l, on, attr) => `<button type="button" class="cat-chip sr-chip ${on ? 'active' : ''}" ${attr}="${k}" aria-pressed="${on}">${esc(l)}</button>`;
      return `<div class="sr-panel">
        <div class="rx-label">Your structured read — tap what you see, then check it</div>
        ${T.source === 'ptbxl' ? '' : '<p class="muted sr-note">LITFL cases are marked on their key diagnosis; the full LITFL answer covers the rest.</p>'}
        <div class="sr-row"><span class="sr-h">Rhythm</span><div class="sr-chips">${RHYTHMS.map(([k, l]) => chip(k, l, d.r === k, 'data-sr-r')).join('')}</div></div>
        ${T.source === 'ptbxl' ? `<div class="sr-row"><span class="sr-h">Axis</span><div class="sr-chips">${AXES.map(([k, l]) => chip(k, l, d.a === k, 'data-sr-a')).join('')}</div></div>` : ''}
        ${FGROUPS.map(g => `<details class="sr-group" ${g.items.some(([k]) => (d.f || []).includes(k)) || g.id === 'cond' ? 'open' : ''}><summary>${g.label}</summary><div class="sr-chips">${g.items.map(([k, l]) => chip(k, l, (d.f || []).includes(k), 'data-sr-f')).join('')}</div></details>`).join('')}
        <button class="btn btn-primary" type="button" id="srCheck">Check my read</button>
      </div>`;
    }
    function srResultHtml(m) {
      const li = (arr, cls, ic) => arr.map(f => `<li class="${cls}">${ic} ${esc(FNAME[f] || f)}</li>`).join('');
      const pct = m.T.req.size ? Math.round(100 * m.hits.length / m.T.req.size) : null;
      return `<div class="sr-result sr-${m.grade}">
        <div class="sr-score">${m.grade === 'ok' ? '✓ Spot on' : m.grade === 'part' ? '◐ Partly right' : '✗ Key findings missed'}${pct !== null ? ` · ${m.hits.length}/${m.T.req.size} key findings` : ''}</div>
        <ul class="sr-list">
          ${m.rhyOk !== null ? `<li class="${m.rhyOk ? 'ok' : 'bad'}">${m.rhyOk ? '✓' : '✗'} Rhythm: ${esc(RNAME[m.read.r])}${m.rhyOk ? '' : ' — answer: <strong>' + esc(RNAME[m.T.rhythm]) + '</strong>'}</li>` : (m.T.rhythm ? `<li class="bad">✗ Rhythm not chosen — answer: <strong>${esc(RNAME[m.T.rhythm])}</strong></li>` : '')}
          ${m.axOk !== null ? `<li class="${m.axOk ? 'ok' : 'bad'}">${m.axOk ? '✓' : '✗'} Axis: ${esc(ANAME[m.read.a])}${m.axOk ? '' : ' — answer: <strong>' + esc(ANAME[m.T.axis]) + '</strong>'}</li>` : (m.T.axis ? `<li class="bad">✗ Axis not chosen — answer: <strong>${esc(ANAME[m.T.axis])}</strong></li>` : '')}
          ${li(m.hits, 'ok', '✓')}${li(m.missed, 'bad', '✗ Missed:')}${li(m.over, 'warn', '⚠ Not on this ECG:')}${li(m.bonus, 'ok', '✓ Also acceptable:')}
        </ul>
        <div class="muted sr-foot">Suggested grade: <strong>${m.grade === 'ok' ? 'Nailed it' : m.grade === 'part' ? 'Partly' : 'Missed'}</strong> (already applied — change it below if you disagree).</div>
      </div>`;
    }
    const _v11RenderCaseViewer = renderCaseViewer;
    renderCaseViewer = function (id) {
      _v11RenderCaseViewer(id);
      const c = RCASE_BY_ID[id];
      if (!c || c.steps) return;
      const T = caseTruth(c);
      if (!T.graded) return;
      const work = document.querySelector('.rx-work');
      if (!work || work.querySelector('.sr-panel')) return;
      work.classList.add('has-sr');
      work.insertAdjacentHTML('afterbegin', srHtml(c, T));
      const d = srDraft[id] = srDraft[id] || { f: [] };
      work.querySelectorAll('[data-sr-r]').forEach(b => b.onclick = () => { d.r = d.r === b.dataset.srR ? null : b.dataset.srR; work.querySelectorAll('[data-sr-r]').forEach(x => x.classList.toggle('active', x.dataset.srR === d.r)); });
      work.querySelectorAll('[data-sr-a]').forEach(b => b.onclick = () => { d.a = d.a === b.dataset.srA ? null : b.dataset.srA; work.querySelectorAll('[data-sr-a]').forEach(x => x.classList.toggle('active', x.dataset.srA === d.a)); });
      work.querySelectorAll('[data-sr-f]').forEach(b => b.onclick = () => {
        const k = b.dataset.srF, i = d.f.indexOf(k);
        if (i >= 0) d.f.splice(i, 1); else d.f.push(k);
        if (k === 'normal' && i < 0) d.f = ['normal']; else if (k !== 'normal') d.f = d.f.filter(x => x !== 'normal');
        work.querySelectorAll('[data-sr-f]').forEach(x => x.classList.toggle('active', d.f.includes(x.dataset.srF)));
      });
      document.getElementById('srCheck').onclick = () => {
        const m = markRead(c, { r: d.r, a: d.a, f: [...d.f] });
        setCaseState(id, m.grade);                  // spaced repetition + session/exam hooks
        learnState.caseRead = learnState.caseRead || {};
        learnState.caseRead[id] = { r: d.r, a: d.a, f: [...d.f], g: m.grade, t: Date.now() };
        saveLearn();
        renderCaseViewer(id);
        const a = document.getElementById('rxAnswer');
        a.hidden = false; const rv = document.getElementById('rxReveal'); if (rv) rv.hidden = true;
        a.insertAdjacentHTML('afterbegin', srResultHtml(m));
        const sp = document.querySelector('.sr-panel'); if (sp) sp.classList.add('sr-done');
        a.querySelectorAll('[data-grade]').forEach(b => b.classList.toggle('suggested', b.dataset.grade === m.grade));
        bindFigs(a);
        a.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };
    };

    // ---- 2. LITFL flashcards ----
    const FC_BOX_MS = [0, 10 * 60e3, 24 * 3600e3, 3 * 24 * 3600e3, 7 * 24 * 3600e3, 21 * 24 * 3600e3, 60 * 24 * 3600e3];
    const CARD_BY_ID = Object.fromEntries(LITFL_CARDS.map(c => [c.id, c]));
    const fcState = (id) => (learnState.fc || {})[id] || null;
    function gradeCard(id, g) {
      learnState.fc = learnState.fc || {};
      const st = learnState.fc[id] || { n: 0, box: 0 };
      st.n++; st.last = g; st.t = Date.now();
      st.box = g === 'easy' ? Math.min(6, st.box + 2) : g === 'good' ? Math.min(6, st.box + 1) : 1;
      st.due = Date.now() + FC_BOX_MS[st.box];
      learnState.fc[id] = st;
      bump(stats().fc, CARD_BY_ID[id].group, g !== 'again');
      saveLearn();
    }
    const cardsDue = (group) => LITFL_CARDS.filter(c => (!group || c.group === group) && fcState(c.id) && fcState(c.id).due <= Date.now());
    const cardsNew = (group) => LITFL_CARDS.filter(c => (!group || c.group === group) && !fcState(c.id));
    function cardFrontHtml(c) {
      const page = LITFL_NOTES[c.slug];
      return `<div class="fc-ctx">${esc(page ? page.title : '')}${c.kind === 'cloze' ? ' · ' + esc(c.sec) : ''}</div>
        <div class="fc-q">${c.kind === 'list' ? esc(c.sec) + '<span class="muted fc-hint"> — recall the ' + c.n + ' points, then reveal</span>' : c.front.replace('[ ? ]', '<span class="fc-blank">[ ? ]</span>')}</div>`;
    }
    function cardBackHtml(c) {
      return `<div class="fc-a nt-body">${c.kind === 'list' ? c.back : `<p><strong class="fc-ans">${c.answer}</strong></p><p>${c.back}</p>`}</div>
        <div class="fc-src"><button class="btn" type="button" data-fcnotes="${c.slug}">LITFL page ↗</button></div>`;
    }
    // renders one card into host; onGraded(g) after a grade
    function renderCard(host, c, onGraded, extraTop) {
      host.innerHTML = `${extraTop || ''}<div class="panel fc-card">${cardFrontHtml(c)}
        <div class="fc-back" hidden>${cardBackHtml(c)}</div>
        <div class="fc-actions"><button class="btn btn-primary" type="button" data-fcshow>Show answer</button>
        <span class="fc-grades" hidden><button class="btn btn-danger" type="button" data-fcg="again">Again</button><button class="btn btn-primary" type="button" data-fcg="good">Good</button><button class="btn" type="button" data-fcg="easy">Easy</button></span></div></div>`;
      host.querySelector('[data-fcshow]').onclick = (e) => { e.currentTarget.hidden = true; host.querySelector('.fc-back').hidden = false; host.querySelector('.fc-grades').hidden = false; bindNotes(host); };
      host.querySelectorAll('[data-fcnotes]').forEach(b => b.onclick = () => openNotes(b.dataset.fcnotes));
      host.querySelectorAll('[data-fcg]').forEach(b => b.onclick = () => { gradeCard(c.id, b.dataset.fcg); onGraded(b.dataset.fcg); });
    }
    let deck = null;   // {group, queue:[ids], i, done}
    function renderCards() {
      const host = document.getElementById('cardsRoot');
      if (!host) return;
      if (deck && deck.i < deck.queue.length) {
        const c = CARD_BY_ID[deck.queue[deck.i]];
        renderCard(host, c, () => { deck.i++; renderCards(); window.scrollTo(0, 0); },
          `<div class="sess-bar"><button class="btn" type="button" data-deckend>← Decks</button><span class="muted">${deck.title} · ${deck.i + 1} / ${deck.queue.length}</span></div>`);
        host.querySelector('[data-deckend]').onclick = () => { deck = null; renderCards(); };
        return;
      }
      if (deck) { const n = deck.queue.length; deck = null; host.dataset.flash = 'Deck done: ' + n + ' cards.'; }
      const total = LITFL_CARDS.length, seen = LITFL_CARDS.filter(c => fcState(c.id)).length, due = cardsDue().length;
      host.innerHTML = `
        <div class="panel learn-hero"><div class="learn-hero-text"><h2>Flashcards</h2>
          <p class="muted">${total} cards made from LITFL's own criteria, thresholds, causes and differentials. Recall first, then reveal; "Again" brings a card back in minutes, "Good" in days.</p>
          ${host.dataset.flash ? `<p class="sr-ok-msg">${esc(host.dataset.flash)}</p>` : ''}
          <div class="learn-stats"><span><strong>${seen}</strong> / ${total} studied</span><span><strong>${due}</strong> due now</span></div></div>
          <div class="learn-hero-actions"><button class="btn btn-primary" type="button" data-deck="__due">${due ? 'Review ' + due + ' due' : 'Study 10 new cards'}</button></div></div>
        ${REVIEW.map(g => { const gc = LITFL_CARDS.filter(c => c.group === g.id); const gd = cardsDue(g.id).length, gs = gc.filter(c => fcState(c.id)).length;
          return gc.length ? `<button class="panel fc-deck" type="button" data-deck="${g.id}"><span><strong>${esc(g.title)}</strong><br><span class="muted">${gs} / ${gc.length} studied${gd ? ' · ' + gd + ' due' : ''}</span></span><span class="muted">›</span></button>` : ''; }).join('')}
        <div class="muted learn-foot">${NOTES_CC}</div>`;
      delete host.dataset.flash;
      host.querySelectorAll('[data-deck]').forEach(b => b.onclick = () => startDeck(b.dataset.deck));
    }
    function startDeck(g) {
      let ids;
      if (g === '__due') { const d = cardsDue(); ids = (d.length ? d : cardsNew().slice(0, 10)).map(c => c.id); }
      else { ids = cardsDue(g).concat(cardsNew(g)).slice(0, 15).map(c => c.id); }
      if (!ids.length) ids = LITFL_CARDS.filter(c => !g || g === '__due' || c.group === g).sort(() => Math.random() - 0.5).slice(0, 10).map(c => c.id);
      const title = g === '__due' ? 'Due & new' : (REVIEW.find(x => x.id === g) || {}).title;
      deck = { queue: ids, i: 0, title };
      if (appMode !== 'cards') switchMode('cards'); else renderCards();
      window.scrollTo(0, 0);
    }

    // ---- 3. Daily session: due-first, weak-first, mixed ----
    let sess = null;  // {items:[{t:'card'|'case', id}], i, res:[]}
    function weakFindings() {
      const S = stats();
      return Object.entries(S.f).filter(([, a]) => a[1] >= 2).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([k]) => k);
    }
    function buildSession(focus) {
      const items = [];
      const now = Date.now();
      const wantCards = focus && focus.kind === 'cases' ? 0 : 8, wantCases = focus && focus.kind === 'cards' ? 0 : 5;
      // cards: due first, then new from the weakest groups (or the chosen focus group)
      let cards = cardsDue(focus && focus.group);
      const S = stats();
      const weakGroups = REVIEW.map(g => g.id).sort((a, b) => { const x = S.fc[a] || [1, 1], y = S.fc[b] || [1, 1]; return x[0] / x[1] - y[0] / y[1]; });
      for (const g of focus && focus.group ? [focus.group] : weakGroups) { if (cards.length >= wantCards) break; cards = cards.concat(cardsNew(g).slice(0, 3)); }
      cards.slice(0, wantCards).forEach(c => items.push({ t: 'card', id: c.id }));
      // cases: due first, then unseen cases containing the weakest findings (or the focus finding), then unseen
      let pool = RCASES.filter(c => !c.steps && caseState(c.id) && caseState(c.id).due <= now);
      const weak = focus && focus.finding ? [focus.finding] : weakFindings();
      const fresh = RCASES.filter(c => !c.steps && !caseState(c.id) && caseTruth(c).graded);
      for (const f of weak) { if (pool.length >= wantCases) break; pool = pool.concat(fresh.filter(c => caseTruth(c).req.has(f) && !pool.includes(c)).slice(0, 2)); }
      if (focus && focus.finding) pool = pool.filter(c => caseTruth(c).req.has(focus.finding)).concat(pool.filter(c => !caseTruth(c).req.has(focus.finding)));
      if (pool.length < wantCases) pool = pool.concat(fresh.filter(c => !pool.includes(c)).sort(() => Math.random() - 0.5));
      pool.slice(0, wantCases).forEach(c => items.push({ t: 'case', id: c.id }));
      // interleave: card, card, case, …
      const cs = items.filter(x => x.t === 'card'), xs = items.filter(x => x.t === 'case'), mixed = [];
      while (cs.length || xs.length) { if (cs.length) mixed.push(cs.shift()); if (cs.length) mixed.push(cs.shift()); if (xs.length) mixed.push(xs.shift()); }
      return mixed;
    }
    function startSession(focus) {
      const items = buildSession(focus);
      if (!items.length) { alert('Nothing to practise yet for this focus.'); return; }
      sess = { items, i: 0, res: [], title: focus && focus.title ? focus.title : 'Daily session' };
      runSession();
    }
    function sessBar() { return `<div class="sess-bar"><span><strong>${esc(sess.title)}</strong> · ${sess.i + 1} / ${sess.items.length}</span><button class="btn" type="button" data-sessend>End</button></div>`; }
    function runSession() {
      if (!sess) return;
      if (sess.i >= sess.items.length) return endSession();
      const it = sess.items[sess.i];
      if (it.t === 'card') {
        rxCurrent = null;
        if (appMode !== 'session') { routeLock++; switchMode('session'); routeLock--; }
        setRoute('#/session', /^#\/session/.test(location.hash));
        const host = document.getElementById('sessionRoot');
        renderCard(host, CARD_BY_ID[it.id], (g) => { sess.res.push({ t: 'card', id: it.id, ok: g !== 'again' }); sess.i++; runSession(); window.scrollTo(0, 0); }, sessBar());
        host.querySelector('[data-sessend]').onclick = endSession;
      } else {
        openCase(it.id);
        document.getElementById('casesRoot').insertAdjacentHTML('afterbegin', sessBar());
        document.querySelector('#casesRoot [data-sessend]').onclick = endSession;
      }
      window.scrollTo(0, 0);
    }
    // a graded case advances the session
    const _v11SetCaseState = setCaseState;
    setCaseState = function (id, grade) {
      _v11SetCaseState(id, grade);
      if (sess && sess.items[sess.i] && sess.items[sess.i].t === 'case' && sess.items[sess.i].id === id) {
        sess.res.push({ t: 'case', id, ok: grade === 'ok', grade });
        // after the marking/answer renders, offer the next item
        setTimeout(() => {
          const a = document.getElementById('rxAnswer');
          if (a && !a.querySelector('.sess-next')) { a.insertAdjacentHTML('afterbegin', `<div class="sess-next"><button class="btn btn-primary" type="button">Next in session →</button></div>`); a.querySelector('.sess-next .btn').onclick = () => { sess.i++; runSession(); }; }
        }, 50);
      }
    };
    function endSession() {
      const s = sess; sess = null;
      if (!s) return;
      routeLock++; switchMode('session'); routeLock--;
      const host = document.getElementById('sessionRoot');
      const cardsOk = s.res.filter(r => r.t === 'card' && r.ok).length, cardsN = s.res.filter(r => r.t === 'card').length;
      const casesOk = s.res.filter(r => r.t === 'case' && r.ok).length, casesN = s.res.filter(r => r.t === 'case').length;
      host.innerHTML = `<div class="panel today-card"><h2>Session complete</h2>
        <p>Flashcards: <strong>${cardsOk} / ${cardsN}</strong> recalled · Real ECGs: <strong>${casesOk} / ${casesN}</strong> nailed</p>
        <div class="set-row"><button class="btn btn-primary" type="button" data-again>Another session</button><button class="btn" type="button" data-home>Back to Today</button></div></div>`;
      host.querySelector('[data-again]').onclick = () => startSession();
      host.querySelector('[data-home]').onclick = () => switchMode('today');
    }

    // ---- 4. Weakness map ----
    function weaknessHtml() {
      const S = stats();
      const rows = FGROUPS.map(g => {
        let h = 0, n = 0; g.items.forEach(([k]) => { const a = S.f[k]; if (a) { h += a[0]; n += a[1]; } });
        return { kind: 'read', id: g.id, label: g.label, h, n };
      });
      if (S.rhy[1]) rows.unshift({ kind: 'read', id: 'rhy', label: 'Rhythm', h: S.rhy[0], n: S.rhy[1] });
      if (S.axis[1]) rows.splice(1, 0, { kind: 'read', id: 'axis', label: 'Axis', h: S.axis[0], n: S.axis[1] });
      const know = REVIEW.map(g => { const a = S.fc[g.id] || [0, 0]; return { kind: 'know', id: g.id, label: g.title, h: a[0], n: a[1] }; });
      const bar = (r) => {
        const pct = r.n ? Math.round(100 * r.h / r.n) : null;
        const cls = pct === null ? 'na' : pct >= 80 ? 'good' : pct >= 60 ? 'mid' : 'low';
        return `<button class="wk-row" type="button" data-wk="${r.kind}:${r.id}" ${r.n ? '' : 'disabled'}><span class="wk-l">${esc(r.label)}</span><span class="wk-bar"><span class="wk-${cls}" style="width:${pct || 0}%"></span></span><span class="wk-p">${pct === null ? '—' : pct + '%'}<span class="muted"> ${r.n ? '(' + r.n + ')' : ''}</span></span></button>`;
      };
      const worst = weakFindings().filter(f => S.f[f][0] / S.f[f][1] < 0.8).slice(0, 4);
      const anyRead = rows.some(r => r.n), anyKnow = know.some(r => r.n);
      return `<div class="panel today-card wk"><h3>Your strengths & weak spots</h3>
        ${anyRead || anyKnow ? '' : '<p class="muted">Do a few structured reads and flashcards — your accuracy by area will appear here, and tapping an area starts practice targeted at it.</p>'}
        ${anyRead ? `<div class="rx-label">Reading real ECGs (structured reads)</div>${rows.map(bar).join('')}` : ''}
        ${worst.length ? `<div class="wk-worst muted">Most missed: ${worst.map(f => `<button class="cat-chip" type="button" data-wkf="${f}">${esc(FNAME[f] || f)} ${Math.round(100 * stats().f[f][0] / stats().f[f][1])}%</button>`).join(' ')}</div>` : ''}
        ${anyKnow ? `<div class="rx-label" style="margin-top:10px">Knowledge (LITFL flashcards)</div>${know.filter(r => r.n).map(bar).join('')}` : ''}
      </div>`;
    }
    function bindWeakness(host) {
      host.querySelectorAll('[data-wk]').forEach(b => b.onclick = () => {
        const [kind, id] = b.dataset.wk.split(':');
        if (kind === 'know') return startSession({ kind: 'cards', group: id, title: 'Focus: ' + (REVIEW.find(g => g.id === id) || {}).title });
        const g = FGROUPS.find(x => x.id === id);
        const fs = g ? g.items.map(([k]) => k) : [];
        const worstIn = weakFindings().find(f => fs.includes(f)) || fs.find(f => stats().f[f]);
        startSession({ kind: 'cases', finding: worstIn, title: 'Focus: ' + (g ? g.label : b.textContent) });
      });
      host.querySelectorAll('[data-wkf]').forEach(b => b.onclick = () => startSession({ kind: 'cases', finding: b.dataset.wkf, title: 'Focus: ' + FNAME[b.dataset.wkf] }));
    }
