    // =========================================================================
    // v8 LITFL NOTES — full teaching text of LITFL ECG Library pages
    // LITFL_NOTES is injected by build.py from src/data/litfl_notes.json (CC BY-NC-SA 4.0, attributed)
    // =========================================================================
    const NOTES_CC = 'Text and ECGs © <a href="https://litfl.com/ecg-library/" target="_blank" rel="noopener noreferrer">Life in the Fast Lane ECG Library</a> (Ed Burns, Robert Buttner et al.), <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-NC-SA 4.0</a>. Reproduced for non-commercial study; formatting adapted, references and comments omitted — see the original page.';
    let notesQuery = '', notesTrail = [];

    // sections become collapsible: intro always shown; mode 'first' opens only the first section
    function notesHtml(slug, mode) {
      const n = LITFL_NOTES[slug];
      if (!n) return '';
      const parts = notesFill(n).split(/(?=<h4>)/);
      const intro = parts[0].startsWith('<h4>') ? '' : parts.shift();
      return intro + parts.map((sec, i) => {
        const m = sec.match(/^<h4>(.*?)<\/h4>/);
        if (!m) return sec;
        const open = mode === 'open' || (mode === 'first' && i === 0) ? ' open' : '';
        return `<details class="nt-sec"${open}><summary>${m[1]}</summary>${sec.slice(m[0].length)}</details>`;
      }).join('');
    }
    function notesFill(n) {
      return n.html.replace(/<figure data-img="(\d+)"><\/figure>/g, (m, k) => n.images[+k] ? figHtml(n.images[+k].src, n.images[+k].cap, 'nt-fig') : '');
    }
    function bindNotes(host) {
      bindFigs(host);
      // LITFL's older addresses for pages the app has under their current address
      const ALIAS = { 'hypomagnesaemia': 'hypomagnesaemia-ecg-library', 'arrhythmogenic-right-ventricular-dysplasia-arvd': 'arrhythmogenic-right-ventricular-cardiomyopathy-arvc', 'dressler-beat': 'fusion-beat-dressler-beat-ecg-library' };
      host.querySelectorAll('a[data-litfl]').forEach(a => {
        const s = ALIAS[a.dataset.litfl] || a.dataset.litfl;
        const go = (fn) => { a.href = '#'; a.classList.add('nt-inapp'); a.onclick = (e) => { e.preventDefault(); fn(); }; };
        const caseId = /^ecg-case-/.test(s) ? 'c' + s.slice(9) : (RCASE_BY_ID['x' + s] ? 'x' + s : null);
        if (LITFL_NOTES[s]) go(() => openNotes(s, true));
        else if (caseId && RCASE_BY_ID[caseId]) go(() => { document.getElementById('lessonModal').classList.remove('open'); rxCurrent = null; openCase(caseId); });   // LITFL case or puzzle already in the app
        else if (s === 'ecg-library') go(() => { document.getElementById('lessonModal').classList.remove('open'); switchMode('notes'); window.scrollTo(0, 0); });
        else { a.href = 'https://litfl.com/' + s + '/'; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.classList.add('nt-ext'); }
      });
      host.querySelectorAll('[data-notes]').forEach(b => b.onclick = () => openNotes(b.dataset.notes));
    }
    function notesSlugsFor(src) { return (src || []).filter(s => LITFL_NOTES[s]); }
    // buttons used in the lesson panel and reading lessons
    function notesButtonsHtml(src) {
      const sl = notesSlugsFor(src);
      return sl.length ? `<div class="nt-open">${sl.map(s => `<button class="btn btn-primary" type="button" data-notes="${s}">📖 Full LITFL notes: ${esc(LITFL_NOTES[s].title)}</button>`).join('')}</div>` : '';
    }

    function openNotes(slug, fromLink) {
      const n = LITFL_NOTES[slug];
      if (!n) return;
      if (!fromLink) notesTrail = [];
      const modal = document.getElementById('lessonModal');
      const body = document.getElementById('lessonModalBody');
      const back = notesTrail.length ? notesTrail[notesTrail.length - 1] : null;
      body.innerHTML = `
        <div class="modal-head">
          <div><span class="muted" style="font-size:12px;">LITFL ECG Library • full notes</span>
            <h2 class="reader-title">${esc(n.title)}</h2></div>
          <div class="nt-headbtns">${back ? `<button class="btn" type="button" data-back>← ${esc(LITFL_NOTES[back].title)}</button>` : ''}<button class="btn" type="button" data-close>✕ Close</button></div>
        </div>
        <div class="nt-tools"><button class="btn" type="button" data-ntall>Expand all</button></div>
        <div class="nt-body">${notesHtml(slug, 'first')}</div>
        <div class="pearl-src"><div><strong>Original page:</strong> <a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${esc(n.title)} — LITFL ↗</a> (references, further reading and discussion)</div><div class="muted">${NOTES_CC}</div></div>`;
      body.querySelector('[data-close]').onclick = closeReader;
      const bk = body.querySelector('[data-back]');
      if (bk) bk.onclick = () => openNotes(notesTrail.pop(), true);
      body.querySelectorAll('a[data-litfl]').forEach(a => a.addEventListener('click', () => { notesTrail.push(slug); }, true));
      bindNotes(body);
      const all = body.querySelector('[data-ntall]');
      if (all) all.onclick = () => { const ds = body.querySelectorAll('details.nt-sec'); const open = [...ds].some(d => !d.open); ds.forEach(d => { d.open = open; }); all.textContent = open ? 'Collapse all' : 'Expand all'; };
      modal.classList.add('open');
      modal.scrollTop = 0;
    }

    // ---- LITFL Notes library view ----
    function notesSearchText(n) { return (n._t = n._t || (n.title + ' ' + n.html.replace(/<[^>]+>/g, ' ')).toLowerCase()); }
    function renderNotes() {
      const host = document.getElementById('notesRoot');
      if (!host) return;
      const all = Object.entries(LITFL_NOTES).sort((a, b) => a[1].title.localeCompare(b[1].title));
      const q = notesQuery.trim().toLowerCase();
      const list = q ? all.filter(([, n]) => notesSearchText(n).includes(q)) : all;
      const words = Object.values(LITFL_NOTES).reduce((s, n) => s + n.html.replace(/<[^>]+>/g, ' ').split(/\s+/).length, 0);
      const groups = {};
      list.forEach(([s, n]) => { const L = n.title[0].toUpperCase(); (groups[/[A-Z]/.test(L) ? L : '#'] = groups[/[A-Z]/.test(L) ? L : '#'] || []).push([s, n]); });
      host.innerHTML = `
        <div class="panel learn-hero">
          <div class="learn-hero-text">
            <h2>LITFL ECG Library <span class="muted" style="font-size:13px;font-weight:500;">— ${all.length} full teaching pages, ~${Math.round(words / 1000)}k words, offline</span></h2>
            <p class="muted">The complete LITFL notes for each topic: ECG features, mechanism, causes, management and annotated example ECGs. Blue links jump between pages. Use it alongside the Learn path; every lesson links to its LITFL page.</p>
            <input id="ntSearch" class="nt-search" type="search" placeholder="Search all LITFL notes (e.g. Sgarbossa, delta wave, hyperkalaemia, aVR)" value="${esc(notesQuery)}">
          </div>
        </div>
        ${q ? `<p class="muted">${list.length} page${list.length === 1 ? '' : 's'} mention “${esc(notesQuery)}”.</p>` : ''}
        <div class="nt-list">${Object.keys(groups).sort().map(L => `<div class="nt-group"><div class="nt-letter">${L}</div>${groups[L].map(([s, n]) => `<button class="nt-item" type="button" data-notes="${s}"><span>${esc(n.title)}</span>${n.images.length ? `<span class="muted">${n.images.length} ECG${n.images.length > 1 ? 's' : ''}</span>` : ''}</button>`).join('')}</div>`).join('') || '<p class="muted">No pages match.</p>'}</div>
        <div class="muted learn-foot">${NOTES_CC}</div>`;
      host.querySelectorAll('[data-notes]').forEach(b => b.onclick = () => openNotes(b.dataset.notes));
      const inp = document.getElementById('ntSearch');
      inp.oninput = () => { notesQuery = inp.value; const pos = inp.selectionStart; renderNotes(); const i2 = document.getElementById('ntSearch'); i2.focus(); i2.setSelectionRange(pos, pos); };
    }

    // ---- Lesson panel: "LITFL notes" tab ----
    const _v7RenderLesson = renderLesson;
    renderLesson = function (id) {
      _v7RenderLesson(id);
      const host = document.getElementById('cardLitflNotes');
      if (!host) return;
      const L = LEARN[id];
      const sl = notesSlugsFor(L && L.src);
      host.innerHTML = sl.length
        ? sl.map(s => `<div class="nt-inline"><div class="nt-inline-head"><strong>${esc(LITFL_NOTES[s].title)}</strong> <button class="btn" type="button" data-notes="${s}">Open full page ⤢</button></div><div class="nt-body">${notesHtml(s, 'first')}</div></div>`).join('') + `<div class="pearl-src"><div class="muted">${NOTES_CC}</div></div>`
        : '<p class="muted">No LITFL page is linked to this topic yet. Browse the LITFL Notes tab.</p>';
      bindNotes(host);
      const tab = document.querySelector('.lesson-tab[data-ltab="notes"]');
      if (tab) tab.style.display = sl.length ? '' : 'none';
    };
