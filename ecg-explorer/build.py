#!/usr/bin/env python3
"""Build ECG Master Studio v6 from the v5 engine + the v6 learning layer.

    python3 build.py            -> writes ECG_Master_Explorer_v6.html

The v5 waveform engine is never edited by hand. Every change is an exact-match
patch below; the build fails loudly if a patch target is missing or ambiguous,
so a future v5 edit can't silently drop a correction.
"""
import json
import re
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
OUT = ROOT / "index.html"  # open directly; needs the ecgs/ folder beside it for real ECG images
DATA = SRC / "data"


def patch(html, old, new, label, count=1):
    n = html.count(old)
    if n != count:
        sys.exit(f"[build] patch '{label}': expected {count} match(es), found {n}")
    return html.replace(old, new)


# --------------------------------------------------------------------------
# 1. Clinical content corrections (found in the v6 review)
# --------------------------------------------------------------------------
CONTENT_FIXES = [
    ("STEMI thresholds (4th UDMI age/sex)",
     "'New ST elevation at J-point in ≥ 2 contiguous leads (≥ 1 mm; ≥ 2 mm in V2–V3 men / ≥ 1.5 mm women).'",
     "'New ST elevation at the J-point in ≥ 2 contiguous leads: ≥ 1 mm, except V2–V3 (≥ 2 mm men ≥ 40 y, ≥ 2.5 mm men < 40 y, ≥ 1.5 mm women). These are STEMI criteria — many occlusions (OMI) never meet them.'"),
    ("STE morphology is not convex-only",
     "'Convex (\"tombstone\") STE + reciprocal ST depression in opposite wall (confirms STEMI over pericarditis!).'",
     "'Occlusion STE can be concave, straight or convex — a concave (\"smiley\") shape does NOT exclude OMI. Reciprocal ST depression in the opposite wall strongly favours OMI over pericarditis / BER.'"),
    ("STEMI caption",
     "heartCaption: 'Transmural ischemia creates convex \"tombstone\" ST elevation in infarct leads + mirror reciprocal ST depression opposite.'",
     "heartCaption: 'Transmural injury current elevates the ST segment over the infarct territory, with mirror-image reciprocal ST depression in the opposite wall.'"),
    ("Focal AT adenosine response",
     "'Adenosine usually does NOT terminate AT; instead it causes transient AV block revealing marching ectopic P\\' waves.'",
     "'Adenosine response is variable: some focal ATs terminate, but many only show transient AV block while ectopic P\\' waves march on — persistent P\\' during AV block proves an atrial mechanism.'"),
    ("Torsades magnesium rate",
     "'1st-line drug (even with normal serum Mg!): IV Magnesium Sulfate 2 g over 1–2 min!',",
     "'1st-line drug (even with normal serum Mg!): IV Magnesium Sulfate 2 g — push in pulseless TdP; over ~5–15 min if a pulse is present (repeat or infuse if it recurs).',"),
    ("VF sequence",
     "'Check responsiveness/pulse → Call Code Blue → Immediate high-quality CPR!',",
     "'Confirm pulselessness → call for help → high-quality CPR until the defibrillator is attached, then shock without delay (shock first if monitored/witnessed).',"),
    ("VF drugs timing",
     "'Immediate Unsynchronized Defibrillation (biphasic 120–200 J) → resume CPR 2 min → Epinephrine 1 mg q3–5m, Amiodarone 300 mg.'",
     "'Unsynchronized defibrillation (biphasic 120–200 J per device) → resume CPR 2 min → rhythm check. Epinephrine 1 mg after the 2nd shock, then q3–5 min; Amiodarone 300 mg after the 3rd shock (150 mg after the 5th) or Lidocaine 1–1.5 mg/kg.'"),
    ("AIVR rate boundaries (LITFL)",
     "(50–110 bpm — faster than escape < 40 bpm, slower than VT > 120 bpm)",
     "(50–110 bpm — below 50 = ventricular escape, above 110 = VT)"),
    ("WPW QRS width (LITFL > 110 ms)",
     "'Widened QRS (> 120 ms) + secondary discordant ST-T wave changes.'",
     "'Widened QRS (> 110 ms — less than in BBB, because AV-nodal conduction still fuses in) + secondary discordant ST-T changes. Pseudo-infarct pattern in up to 70%.'"),
    ("LBBB organic disease wording",
     "Almost always indicates underlying structural heart disease (HTN, CAD, CMP, AS).",
     "Rarely occurs without organic disease (HTN, CAD, cardiomyopathy, AS, Lenègre–Lev, hyperkalaemia, digoxin)."),
    ("PE S1Q3T3 accuracy (LITFL)",
     "(specific for RV strain, ~15–25% sensitive).'",
     "(~20% of PE — neither sensitive nor specific; the most specific finding is T inversion in BOTH III and V1).'"),
    ("Hyperkalaemia calcium dose",
     "'1. Stabilize myocardium: IV Calcium Gluconate 1–2 g (if ECG changes!).',",
     "'1. Stabilize myocardium (if ECG changes): IV Calcium Gluconate 10% 10–30 mL (1–3 g), or Calcium Chloride 10% 10 mL via a large/central vein; repeat if changes persist.',"),
    ("Hyperkalaemia insulin & hypoglycaemia",
     "'2. Shift K+ intracellularly: Regular Insulin 10 U + D50W, nebulized Albuterol (bicarb if acidotic).',",
     "'2. Shift K+ intracellularly: Regular Insulin 10 U IV (consider 5 U in ESKD / low glucose) + 25–50 g glucose, monitor glucose hourly (hypoglycaemia is common); nebulized Albuterol 10–20 mg; bicarbonate only if acidotic.',"),
    ("aVR pattern is not a STEMI equivalent",
     "'Urgent Cardiology / Cath Lab activation (high mortality if ACS!).',",
     "'If ACS is likely: urgent cardiology review and early invasive strategy (high mortality). This pattern is diffuse subendocardial ischaemia — not a STEMI-equivalent by itself; true acute left-main occlusion usually presents in shock or arrest.',"),
    ("Bidirectional VT cardioversion",
     "'DEADLY TRAP: Do NOT cardiovert stable digoxin-induced Bidirectional VT unless crashing — electrical shock in severe digoxin toxicity can precipitate refractory VF/asystole!',",
     "'Prefer DigiFab over electricity for STABLE digoxin-induced BVT; if the patient is unstable, do not withhold cardioversion — use the lowest effective energy.',"),
    ("Digoxin 'stone heart' myth",
     "'Do NOT give IV Calcium in digoxin toxicity if hyperkalemic without DigiFab (\"stone heart\" debate — DigiFab is the definitive antidote!).'",
     "'The old \"stone heart\" fear of IV calcium in digoxin-toxic hyperkalaemia is not supported by modern data — but DigiFab is the definitive treatment and also corrects the K+.'"),
    ("Adenosine & asthma wording (data)",
     "Adenosine is contraindicated in asthma; ~1 mg may suffice",
     "Avoid adenosine in severe / active bronchospasm; ~1 mg may suffice"),
    ("Adenosine & asthma wording (algorithm)",
     "and contraindicated in asthma.</li>",
     "and should be avoided in severe / active bronchospasm.</li>"),
    ("STEMI key wording", "rp: 'Tombstone STE' }", "rp: 'STE + reciprocity' }"),
    ("Data header count", "1. COMPREHENSIVE ECG KNOWLEDGE BASE (52 HIGH-YIELD RHYTHMS & PATTERNS)",
     "1. COMPREHENSIVE ECG KNOWLEDGE BASE (60 SIMULATED RHYTHMS & PATTERNS)"),
]

# --------------------------------------------------------------------------
# 2. UI patches
# --------------------------------------------------------------------------
LESSON_PANEL = """        <!-- v6 Lesson panel: bottom line + tabbed learning panes -->
          <div id="lessonPanel" class="lesson-panel">
            <div class="lesson-bl">
              <div class="lesson-bl-head">
                <span id="lessonLvl" class="lvl-badge"></span>
                <span id="lessonSys" class="muted"></span>
                <span class="spacer"></span>
                <button id="lessonDoneBtn" class="btn" type="button">Mark reviewed</button>
                <button id="lessonNextBtn" class="btn btn-primary" type="button">Next →</button>
              </div>
              <div id="lessonBottomLine" class="lesson-bl-text"></div>
            </div>
            <div class="lesson-tabs" role="tablist" aria-label="Lesson sections">
              <button class="lesson-tab active" data-ltab="learn" type="button">Learn</button>
              <button class="lesson-tab" data-ltab="real" type="button">Real ECGs</button>
              <button class="lesson-tab" data-ltab="notes" type="button">LITFL notes</button>
              <button class="lesson-tab" data-ltab="recall" type="button">Recall</button>
            </div>
            <div class="cards-4 lesson-panes">
              <div class="info-card card-crit lesson-pane active" data-lpane="see">
                <h3>Recognise — criteria &amp; intervals</h3>
                <div class="kv-grid" id="kvIntervals"></div>
                <ul id="cardCriteria" style="margin-top:8px;"></ul>
              </div>
              <div class="info-card card-mech lesson-pane" data-lpane="why">
                <h3>Mechanism &amp; electrophysiology</h3>
                <p id="cardMechanism"></p>
              </div>
              <div class="info-card card-trap lesson-pane" data-lpane="traps">
                <h3>Look-alikes &amp; classic traps</h3>
                <ul id="cardTraps"></ul>
                <div id="lessonDuels" class="lesson-duels"></div>
              </div>
              <div class="info-card card-mgmt lesson-pane" data-lpane="act">
                <h3>Acute management &amp; drugs to avoid</h3>
                <ul id="cardMgmt"></ul>
                <div class="mgmt-note">Educational summary — confirm doses and energies against your local protocol and the current AHA/ERC guideline.</div>
              </div>
              <div class="info-card card-pearl lesson-pane" data-lpane="pearls">
                <h3>Learning points — LITFL ECG Library</h3>
                <ul id="cardPearls"></ul>
                <div id="cardPearlSrc"></div>
              </div>
              <div class="info-card card-notes lesson-pane" data-lpane="notes">
                <h3>Full LITFL notes</h3>
                <div id="cardLitflNotes"></div>
              </div>
              <div class="info-card card-real lesson-pane" data-lpane="real">
                <h3>Real ECGs — LITFL cases &amp; examples</h3>
                <div id="cardRealEcg"></div>
              </div>
              <div class="info-card card-recall lesson-pane" data-lpane="recall">
                <h3>Active recall</h3>
                <div id="cardRecall"></div>
              </div>
            </div>
          </div>
        </main>"""

LEARN_SECTION = """    <!-- v9 sub-tabs (Practice / Library) -->
    <div id="subNav" class="subnav" hidden></div>

    <!-- v9 TODAY + SETTINGS -->
    <section id="view-today" class="view-section">
      <div id="todayRoot"></div>
    </section>
    <section id="view-settings" class="view-section">
      <div id="settingsRoot"></div>
    </section>

    <!-- v6 LEARN (PATHWAY) VIEW -->
    <section id="view-learn" class="view-section">
      <div id="learnRoot"></div>
    </section>

    <!-- v7 REAL ECG REVIEW VIEW -->
    <section id="view-cases" class="view-section">
      <div id="casesRoot"></div>
    </section>

    <!-- v8 LITFL NOTES VIEW -->
    <section id="view-notes" class="view-section">
      <div id="notesRoot"></div>
    </section>

    <!-- STUDIO VIEW -->"""

LESSON_MODAL = """    <!-- v6 Reading-lesson modal -->
    <div id="lessonModal" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Reading lesson">
      <div class="modal-card" id="lessonModalBody"></div>
    </div>

    <!-- v7 ECG zoom viewer -->
    <div id="ecgZoomModal" class="modal-backdrop" role="dialog" aria-modal="true" aria-label="Zoomed ECG">
      <div class="zoom-shell">
        <div class="zoom-bar"><span id="ecgZoomCap"></span><span class="spacer"></span>
          <button id="ecgZoomOut" class="btn" type="button" aria-label="Zoom out">−</button>
          <button id="ecgZoomIn" class="btn" type="button" aria-label="Zoom in">+</button>
          <button id="ecgZoomClose" class="btn" type="button">Close (Esc)</button></div>
        <div id="ecgZoomStage"><img id="ecgZoomImg" alt="ECG" draggable="false" referrerpolicy="no-referrer"></div>
      </div>
    </div>

    <footer class="shortcut-bar">"""


def real_ecg_data():
    """LITFL Top-100 cases (+ hand-curated labels/tags) and topic example ECGs."""
    cases = json.loads((DATA / "rcases.json").read_text(encoding="utf-8"))
    cur = {}  # hand-curated labels/tags (override the automatic keyword tagger)
    for f in sorted(DATA.glob("case_curation*.json")):
        cur.update(json.loads(f.read_text(encoding="utf-8")))
    for c in cases:
        if c["id"] in cur:
            c.update(cur[c["id"]])
        c.pop("dx", None); c.pop("thirdParty", None)
    img_map = json.loads((DATA / "img_map.json").read_text(encoding="utf-8"))
    examples = json.loads((DATA / "examples.json").read_text(encoding="utf-8"))
    # Images bundled in ecgs/ work offline; any image not bundled loads from litfl.com in the
    # viewer's browser (no referrer) and falls back to a link to the LITFL page when offline.
    img_map = {k: v for k, v in img_map.items() if (ROOT / "ecgs" / v).exists()}
    all_srcs = set(i["src"] for c in cases for i in c["images"]) | set(e["src"] for v in examples.values() for e in v)
    used = set(img_map[s] for s in all_srcs if s in img_map)
    # Full LITFL teaching pages (tools/parse_notes.py); their images share the same bundle map
    notes_file = DATA / "litfl_notes.json"
    notes = json.loads(notes_file.read_text(encoding="utf-8")) if notes_file.exists() else {}
    note_srcs = set(i["src"] for n in notes.values() for i in n["images"])
    pz_file = DATA / "litfl_puzzles.json"
    if pz_file.exists():  # puzzle-case images are kept in the bundle map the same way
        note_srcs |= set(i["src"] for c in json.loads(pz_file.read_text(encoding="utf-8")) for i in c["images"])
    note_used = set(img_map[s] for s in note_srcs if s in img_map)
    img_map = {k: v for k, v in img_map.items() if v in used or v in note_used}
    # PTB-XL practice ECGs (PhysioNet, CC BY 4.0), rendered locally by tools/ptbxl_build.py
    ptb_file = DATA / "ptbxl_cases.json"
    ptb = json.loads(ptb_file.read_text(encoding="utf-8")) if ptb_file.exists() else []
    ptb = [c for c in ptb if all((ROOT / i["src"]).exists() for i in c["images"])]
    # LITFL "ECG Exigency" puzzles as step-by-step cases (tools/parse_puzzles.py)
    pz_file = DATA / "litfl_puzzles.json"
    puzzles = json.loads(pz_file.read_text(encoding="utf-8")) if pz_file.exists() else []
    global DATA_STATS
    DATA_STATS = (f"{len(cases)} LITFL cases, {sum(len(v) for v in examples.values())} topic examples, "
                  f"{len(used)}/{len(all_srcs)} images bundled (rest load from LITFL when online); "
                  f"{len(puzzles)} ECG Exigency puzzles; {len(ptb)} PTB-XL cases; {len(notes)} LITFL note pages "
                  f"({len(note_srcs & set(img_map))}/{len(note_srcs)} note images bundled)")
    cases = cases + puzzles + ptb
    dump = lambda o: json.dumps(o, ensure_ascii=False, separators=(",", ":"))
    return ["    const RCASES = " + dump(cases) + ";",
            "    const RX_EXAMPLES = " + dump(examples) + ";",
            "    const RX_IMG = " + dump(img_map) + ";",
            "    const LITFL_NOTES = " + dump(notes) + ";"]


DATA_STATS = ""


def write_offline_files(html):
    """offline.json (every bundled image the app can show) + sw.js with a version tied to this build."""
    import hashlib
    files = sorted(set(re.findall(r'"([0-9a-f]{12}\.webp)"', html)))
    files = ["ecgs/" + f for f in files if (ROOT / "ecgs" / f).exists()]
    files += sorted("ecgs/ptbxl/" + f.name for f in (ROOT / "ecgs" / "ptbxl").glob("*.webp")
                    if f'ecgs/ptbxl/{f.name}' in html)
    size = sum((ROOT / f).stat().st_size for f in files)
    (ROOT / "offline.json").write_text(json.dumps({"files": files, "bytes": size}, separators=(",", ":")), encoding="utf-8")
    version = hashlib.sha1(html.encode("utf-8")).hexdigest()[:10]
    (ROOT / "sw.js").write_text((SRC / "sw.js").read_text(encoding="utf-8").replace("__VERSION__", version), encoding="utf-8")
    print(f"[build] offline: {len(files)} images, {size / 1e6:.0f} MB; sw version {version}")


def build():
    html = (SRC / "v5_base.html").read_text(encoding="utf-8")

    for label, old, new in CONTENT_FIXES:
        html = patch(html, old, new, label)

    # Header / branding
    html = patch(html, "60 Resident-Grade ECGs • Dual &amp; 12-Lead 25 mm/s Studio • 2D Calipers, Bedside Tools &amp; Mobile-Ready • v5",
                 "Learning pathway • live 12-lead studio • 599 real ECGs (LITFL + PTB-XL) • LITFL notes • spaced review",
                 "brand sub")
    html = patch(html, '<button class="seg-btn active" data-mode="studio" type="button">',
                 '<button class="seg-btn" data-mode="learn" type="button"><span class="tab-full">Learn Path</span><span class="tab-short">Learn</span></button>\n'
                 '          <button class="seg-btn active" data-mode="studio" type="button">', "learn tab")
    html = patch(html, '<button class="seg-btn" data-mode="compare" type="button">',
                 '<button class="seg-btn" data-mode="cases" type="button"><span class="tab-full">Real ECGs</span><span class="tab-short">Cases</span></button>\n'
                 '          <button class="seg-btn" data-mode="notes" type="button"><span class="tab-full">LITFL Notes</span><span class="tab-short">Notes</span></button>\n'
                 '          <button class="seg-btn" data-mode="compare" type="button">', "cases tab")
    html = patch(html, '<span class="tab-full">Algorithms &amp; Tables</span>', '<span class="tab-full">Algorithms</span>', "short tab label")
    html = patch(html, '<span class="tab-full">Bedside Tools</span>', '<span class="tab-full">Tools</span>', "short tab label 2")
    html = patch(html, "    <!-- STUDIO VIEW -->", LEARN_SECTION, "learn section")
    html = patch(html, '      <div class="topbar-controls">',
                 '      <nav id="appNav" class="app-nav" aria-label="Main"></nav>\n'
                 '      <div class="topbar-controls">\n'
                 '        <button id="searchBtn" class="btn icon-btn" type="button" aria-label="Search" title="Search"><svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>\n'
                 '        <button id="settingsBtn" class="btn icon-btn" type="button" aria-label="Settings" title="Settings">'
                 '<svg class="nav-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
                 '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg></button>', "app nav")
    html = patch(html, '<div class="brand-title">ECG &amp; Arrhythmia Master Studio</div>', '<div class="brand-title">ECG Master Studio</div>', "short title")

    # Replace the 4 static cards with the lesson panel (same element IDs kept)
    start = html.index("          <!-- 4 Structured Breakdown Cards -->")
    end = html.index("        </main>", start) + len("        </main>")
    html = html[:start] + LESSON_PANEL + html[end:]

    html = patch(html, "    <footer class=\"shortcut-bar\">", LESSON_MODAL, "lesson modal")
    html = patch(html, "<div>Self-contained offline ECG trainer v5 (Mobile + Desktop) • 25 mm/s • Auto / 10 / 5 mm/mV</div>",
                 "<div>Offline ECG trainer v7 • Learning points, real ECG cases and examples adapted from the "
                 "<a href=\"https://litfl.com/ecg-library/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--primary)\">LITFL ECG Library</a> "
                 "(<a href=\"https://creativecommons.org/licenses/by-nc-sa/4.0/\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"color:var(--primary)\">CC BY-NC-SA 4.0</a>) • Educational use only</div>",
                 "footer")

    # Library: system-based chips, level/status in list, search learning content
    cats_start = html.index("    const CATS = [")
    cats_end = html.index("];", cats_start) + 2
    html = html[:cats_start] + (
        "    // v6: categories follow the clinical system map (SYS/SYS_OF are defined later, so build lazily)\n"
        "    const CATS = () => [{ id: 'all', label: 'All (60)' }].concat(SYS.filter(s => s.id !== 'found').map(s => ({ id: s.id, label: s.short + ' (' + ECG_DATA.filter(d => SYS_OF[d.id] === s.id).length + ')' })).filter(c => !c.label.endsWith('(0)')));"
    ) + html[cats_end:]
    html = patch(html, "      CATS.forEach(c => {", "      CATS().forEach(c => {", "lazy cats")
    html = patch(html, "if (filterCat !== 'all' && d.cat !== filterCat) return false;",
                 "if (filterCat !== 'all' && (SYS_OF[d.id] || d.cat) !== filterCat) return false;", "library filter")
    html = patch(html, "          d.name.toLowerCase().includes(q) ||\n",
                 "          d.name.toLowerCase().includes(q) || v6SearchHit(d.id, q) ||\n", "library search")
    html = patch(html, '<div class="rhythm-item-sub">${d.hr} • ${d.reg}</div>',
                 '<div class="rhythm-item-sub">${v6ItemSub(d)}</div>', "library item")
    html = patch(html, 'placeholder="Search SVT, Sgarbossa, LAFB, K+, VT..."',
                 'placeholder="Search rhythms & learning points (e.g. aVL, Kosuge, verapamil)"', "search placeholder")

    # CSS
    html = patch(html, "  </style>", (SRC / "v6.css").read_text(encoding="utf-8") + (SRC / "cases.css").read_text(encoding="utf-8") + (SRC / "shell.css").read_text(encoding="utf-8") + "  </style>", "css")

    # Content + learning app, injected before init
    titles = json.loads((SRC / "litfl_titles.json").read_text(encoding="utf-8"))
    js = ["    // ==== v6 content (see ecg-explorer/src) ====",
          "    const LITFL_TITLES = " + json.dumps(titles, ensure_ascii=False) + ";",
          "    const LEARN = {};"]
    for name in ["learn_rhythms_1.js", "learn_rhythms_2.js", "learn_rhythms_3.js", "learn_rhythms_4.js",
                 "learn_rhythms_5.js", "learn_foundations.js", "learn_extend.js"]:
        js.append((SRC / name).read_text(encoding="utf-8"))
    js.extend(real_ecg_data())
    for name in ["learn_app.js", "cases_app.js", "notes_app.js", "offline_app.js", "shell_app.js"]:
        js.append((SRC / name).read_text(encoding="utf-8"))
    html = patch(html, "    // Init + Restore saved preferences", "\n".join(js) + "\n    // Init + Restore saved preferences", "inject js")
    html = patch(html, "    selectRhythm('avnrt');\n    requestAnimationFrame(mainLoop);",
                 "    selectRhythm('nsr');\n    v6Init();\n    requestAnimationFrame(mainLoop);", "init")

    # Phone app: manifest + icons (iOS and Android)
    html = patch(html, "  <title>ECG &amp; Arrhythmia Master Studio</title>",
                 "  <title>ECG &amp; Arrhythmia Master Studio</title>\n"
                 "  <link rel=\"manifest\" href=\"manifest.webmanifest\" />\n"
                 "  <link rel=\"icon\" type=\"image/png\" sizes=\"32x32\" href=\"icons/favicon-32.png\" />\n"
                 "  <link rel=\"apple-touch-icon\" href=\"icons/apple-touch-icon.png\" />\n"
                 "  <meta name=\"apple-mobile-web-app-title\" content=\"ECG Studio\" />\n"
                 "  <meta name=\"mobile-web-app-capable\" content=\"yes\" />", "pwa head")
    if "</script" in "\n".join(js).lower():
        sys.exit("[build] content contains a closing script tag")
    OUT.write_text(html, encoding="utf-8")
    write_offline_files(html)
    print(f"[build] wrote {OUT.name} ({OUT.stat().st_size / 1024:.0f} KB), {len(CONTENT_FIXES)} content fixes applied; {DATA_STATS}")


if __name__ == "__main__":
    build()
