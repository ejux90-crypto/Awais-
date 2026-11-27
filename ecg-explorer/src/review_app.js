    // =========================================================================
    // v10 QUICK REVIEW — every ECG topic, LITFL as the reference
    // Each card is the LITFL page itself, re-laid-out for fast review: the sections that carry the
    // diagnostic teaching (criteria, normal vs abnormal, morphology, causes, differentials) open;
    // background (history, examples, electrophysiology) folded; the app's bottom line on top.
    // =========================================================================
    const REVIEW = REVIEW_GROUPS.map(g => ({ ...g, pages: g.pages.filter(s => LITFL_NOTES[s]) }));
    const REVIEW_ORDER = REVIEW.flatMap(g => g.pages.map(s => ({ slug: s, group: g })));

    // which LITFL sections carry the diagnostic teaching (open) vs background (folded)
    const KEY_SEC = /criteria|feature|characteristic|normal|abnormal|morpholog|cause|differential|diagnos|recogni|types?\b|classification|key|summary|voltage|tips|pearls|significance|look for|appearance|findings|changes|lead|interval|segment|axis|rate|rhythm|wave|block|pattern|overview|definition|what is|ecg/i;
    const FOLD_SEC = /example|history|eponym|reference|further|reading|author|case|quiz|electrophysiology|pathophysiology|mechanism|physiology|management|treatment|epidemiolog|genetics|incidence/i;
    let reviewCur = null;

    // bottom line from the app's own lesson, when a lesson is built on this LITFL page
    // explicit pairs where a page is cited by several lessons; null = no bottom line rather than a misleading one
    const RV_LESSON = {
      'left-axis-deviation-lad-ecg-library': 'f_axis', 'right-axis-deviation-rad-ecg-library': 'f_axis', 'ecg-exam-template': 'f_system',
      'pr-interval-ecg-library': 'f_pwave', 'r-wave-ecg-library': 'f_qrs', 'ecg-rhythm-evaluation': 'f_system', 'lateral-stemi-ecg-library': 'stemi',
      't-wave-ecg-library': 'f_twave', 'u-wave-ecg-library': 'f_twave', 'right-atrial-enlargement-ecg-library': 'x_atrial',
      'low-qrs-voltage-ecg-library': 'x_lowvolt', 'trifascicular-block-ecg-library': 'x_trifasc', 'masquerading-bundle-branch-block-mbbb': 'x_mbbb',
      'premature-junctional-complex-pjc': 'x_pjc', 'right-ventricular-outflow-tract-rvot-tachycardia': 'x_rvot', 'myocardial-ischaemia-ecg-library': 'x_nste',
      'omi-replacing-the-stemi-misnomer': 'x_omi', 'sgarbossa-criteria-ecg-library': 'sgarbossa_stemi', 'dextrocardia-ecg-library': 'x_dextro',
      'osborn-wave-j-wave-ecg-library': 'hypothermia', 'drugs-causing-qt-prolongation': 'x_lqts', 'long-qt-syndrome': 'x_lqts',
      'premature-atrial-complex-pac': null, 'vt-versus-svt-ecg-library': null, 'right-ventricular-strain-ecg-library': null,
      'supraventricular-tachycardia-svt-ecg-library': null, 'ecg-conduction-block-ecg-library': null
    };
    function lessonBl(id) {
      const L = LEARN[id] || FOUND_BY_ID[id] || EXT_BY_ID[id];
      return L && L.bl ? { id, bl: L.bl } : null;
    }
    function reviewBottomLine(slug) {
      if (slug in RV_LESSON) return RV_LESSON[slug] ? lessonBl(RV_LESSON[slug]) : null;
      const all = [...Object.entries(LEARN), ...Object.entries(FOUND_BY_ID), ...Object.entries(EXT_BY_ID)];
      const primary = all.find(([, L]) => (L.src || [])[0] === slug);     // the lesson built mainly on this page
      if (primary) return lessonBl(primary[0]);
      const any = all.filter(([, L]) => (L.src || []).includes(slug));
      return any.length === 1 ? lessonBl(any[0][0]) : null;               // ambiguous: say nothing
    }
    function reviewHtml(slug) {
      const n = LITFL_NOTES[slug];
      const parts = notesFill(n).split(/(?=<h4>)/);
      const intro = parts[0].startsWith('<h4>') ? '' : parts.shift();
      const secs = parts.map(sec => {
        const m = sec.match(/^<h4>(.*?)<\/h4>/);
        if (!m) return { head: '', body: sec, key: true };
        const head = m[1];
        // open everything diagnostic; fold only background, so no teaching is hidden by a missed keyword
        return { head, body: sec.slice(m[0].length), key: !FOLD_SEC.test(head) || KEY_SEC.test(head) && /criteria|feature|morpholog|diagnos|differential/i.test(head) };
      });
      const keyN = secs.filter(s => s.key).length;
      return intro + secs.map(s => s.head
        ? `<details class="nt-sec ${s.key ? 'rv-key' : 'rv-more'}"${s.key || !keyN ? ' open' : ''}><summary>${s.head}</summary>${s.body}</details>`
        : s.body).join('');
    }
    const reviewDone = (slug) => !!((learnState.qr || {})[slug]);
    function renderReview() {
      const host = document.getElementById('reviewRoot');
      if (!host) return;
      if (reviewCur && LITFL_NOTES[reviewCur]) return renderReviewCard(reviewCur);
      const total = REVIEW_ORDER.length, done = REVIEW_ORDER.filter(x => reviewDone(x.slug)).length;
      const next = REVIEW_ORDER.find(x => !reviewDone(x.slug)) || REVIEW_ORDER[0];
      host.innerHTML = `
        <div class="panel learn-hero"><div class="learn-hero-text">
          <h2>Quick review</h2>
          <p class="muted">Every ECG topic, straight from the <strong>LITFL ECG Library</strong>: normal vs abnormal, diagnostic criteria, morphology, causes and differentials up front; background folded away. Flick through with Next, tick off what you know.</p>
          <div class="learn-progress"><span style="width:${Math.round(100 * done / total)}%"></span></div>
          <div class="learn-stats"><span><strong>${done}</strong> / ${total} topics reviewed</span></div>
        </div><div class="learn-hero-actions">
          <button class="btn btn-primary" type="button" data-rv="${next.slug}">${done ? 'Continue' : 'Start'}: ${esc(LITFL_NOTES[next.slug].title)} →</button>
        </div></div>
        ${REVIEW.map(g => {
          const d = g.pages.filter(reviewDone).length;
          return `<section class="panel rv-group"><div class="level-head"><h3>${esc(g.title)}</h3><span class="muted">${d} / ${g.pages.length}</span></div>
            <p class="muted level-blurb">${esc(g.blurb)}</p>
            <div class="rv-list">${g.pages.map(s => `<button class="topic-card" type="button" data-rv="${s}"><i class="tc-dot ${reviewDone(s) ? 'st-mastered' : 'st-new'}"></i><span class="tc-name">${esc(LITFL_NOTES[s].title)}</span></button>`).join('')}</div></section>`;
        }).join('')}
        <div class="muted learn-foot">${NOTES_CC}</div>`;
      host.querySelectorAll('[data-rv]').forEach(b => b.onclick = () => openReview(b.dataset.rv));
    }
    function openReview(slug) {
      reviewCur = slug;
      if (appMode !== 'review') switchMode('review'); else renderReview();
      window.scrollTo(0, 0);
      if (typeof setRoute === 'function') setRoute('#/review/' + slug);
    }
    function renderReviewCard(slug) {
      const host = document.getElementById('reviewRoot');
      const n = LITFL_NOTES[slug];
      const i = REVIEW_ORDER.findIndex(x => x.slug === slug);
      const me = REVIEW_ORDER[i] || { group: REVIEW[0] };
      const prev = REVIEW_ORDER[i - 1], next = REVIEW_ORDER[i + 1];
      const bl = reviewBottomLine(slug);
      const topic = bl && TOPIC_BY_ID[bl.id];
      const cases = topic ? casesForTopic(topic.id).length : 0;
      host.innerHTML = `
        <div class="panel rv-card">
          <div class="rv-top"><button class="btn" type="button" data-rvback>← All topics</button><span class="muted">${esc(me.group.title)} · ${i + 1} / ${REVIEW_ORDER.length}</span></div>
          <h1 class="lesson-title rv-title">${esc(n.title)}</h1>
          ${bl ? `<div class="lesson-bl-text rv-bl"><span class="rx-label">Bottom line</span>${esc(bl.bl)}</div>` : ''}
          <div class="nt-tools"><button class="btn" type="button" data-ntall>Expand all</button></div>
          <div class="nt-body rv-body">${reviewHtml(slug)}</div>
          <div class="rv-actions">
            <button class="btn ${reviewDone(slug) ? 'active' : 'btn-primary'}" type="button" data-rvdone>${reviewDone(slug) ? '✓ Reviewed' : 'Mark reviewed'}</button>
            ${topic ? `<button class="btn" type="button" data-rvlesson>${topic.kind === 'sim' ? 'Live ECG lesson' : 'Reading lesson'}${cases ? ' · ' + cases + ' real ECGs' : ''} →</button>` : ''}
          </div>
          <div class="reader-nav">${prev ? `<button class="btn" type="button" data-rvgo="${prev.slug}">← ${esc(LITFL_NOTES[prev.slug].title)}</button>` : '<span></span>'}${next ? `<button class="btn btn-primary" type="button" data-rvgo="${next.slug}">${esc(LITFL_NOTES[next.slug].title)} →</button>` : ''}</div>
          <div class="pearl-src"><div><strong>LITFL page:</strong> <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${esc(n.title)} ↗</a></div><div class="muted">${NOTES_CC}</div></div>
        </div>`;
      bindNotes(host);
      host.querySelector('[data-rvback]').onclick = () => { reviewCur = null; renderReview(); window.scrollTo(0, 0); if (typeof setRoute === 'function') setRoute('#/learn/review', true); };
      host.querySelectorAll('[data-rvgo]').forEach(b => b.onclick = () => openReview(b.dataset.rvgo));
      host.querySelector('[data-rvdone]').onclick = () => {
        learnState.qr = learnState.qr || {};
        if (learnState.qr[slug]) delete learnState.qr[slug]; else learnState.qr[slug] = Date.now();
        saveLearn(); renderReviewCard(slug);
      };
      const ls = host.querySelector('[data-rvlesson]'); if (ls) ls.onclick = () => openTopic(topic.id);
      const all = host.querySelector('[data-ntall]');
      all.onclick = () => { const ds = host.querySelectorAll('details.nt-sec'); const open = [...ds].some(d => !d.open); ds.forEach(d => { d.open = open; }); all.textContent = open ? 'Collapse all' : 'Expand all'; };
    }
