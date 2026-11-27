# ECG Master Studio — Deep Review & v6 Overhaul

**Files:** `ECG_Master_Explorer_v6.html` is the app: one offline file that opens in any browser and works on a phone. `build.py` regenerates it from `src/`.

---

## 1. What v5 does well (kept untouched)

- **The waveform engine is the real asset.** It runs a live 25 mm/s sweep, a synthesised 12-lead, calipers, adenosine/atropine responses, a K+ slider and STEMI territories. The VT 12-lead shows capture beats, Brugada shows coving, and anterior STEMI shows reciprocity. None of this was rewritten.
- The **content is resident-grade**, with good traps (posterior MI, cerebral T vs Wellens, AIVR suppression, Sgarbossa).
- The **quiz is well designed**: systematic read → diagnosis → next step, plus spaced repetition.

## 2. What was wrong

### Format (the biggest problem)
1. **It was an encyclopaedia, not a curriculum.** There were 60 items in a flat list, each given the same depth and the same 4 cards. Nothing ran from foundation to expert, and nothing taught the reading machinery (paper, leads, axis, intervals, a systematic read).
2. **The categories were muddled.** Brugada, HOCM and LVH sat under "STEMI/Mimics". PE, tamponade, lead reversal and RVH sat under "Electrolytes". WPW sat under "Blocks". The quiz filter counts did not match the library chips.
3. **It was passive.** Reading 4 cards builds familiarity, not recall. There was no self-testing at topic level, and no record of what you had studied.
4. **Layout bug on phones:** the Studio page rendered about 770 px wide on a 390 px phone. A wrapping flexbox let the toolbar strip widen the whole layout, so the page scrolled sideways and content slid under the bottom nav.
5. **Content and engine were tangled** in one 6,500-line script, which made content edits risky.

### Content corrections (20 applied automatically by `build.py`)
| Topic | v5 said | Corrected to |
|---|---|---|
| STEMI | "Convex tombstone STE … confirms STEMI" | Occlusion STE can be concave, straight or convex; concave does **not** exclude OMI |
| STEMI | V2–V3 ≥ 2 mm men | Age/sex thresholds (≥ 2.5 mm men < 40), plus a note that many OMIs never meet STEMI criteria |
| Torsades | Mg 2 g over 1–2 min | Push in pulseless TdP; give over ~5–15 min if there is a pulse |
| VF | "Check responsiveness → Code Blue → CPR" before the shock; no drug timing | CPR until the defibrillator is on, then shock without delay; adrenaline after the 2nd shock, amiodarone after the 3rd |
| aVR / left main | Cath-lab activation | Diffuse subendocardial ischaemia, **not** a STEMI-equivalent by itself; often demand ischaemia |
| Bidirectional VT / digoxin | "Never cardiovert"; "no IV calcium (stone heart)" | Prefer DigiFab when stable but don't withhold a shock when unstable; the stone-heart fear isn't supported by modern data |
| Focal AT | Adenosine "does NOT terminate" | Variable response: some terminate, many show transient AV block with persisting P′ |
| PE | S1Q3T3 "specific for RV strain" | Seen in ~20%, neither sensitive nor specific; TWI in **both III and V1** is the specific sign (Kosuge) |
| Hyperkalaemia | Ca gluconate 1–2 g; insulin 10 U | 10% Ca gluconate 10–30 mL or CaCl₂; insulin 5–10 U with a hypoglycaemia warning |
| AIVR | VT > 120 | Escape < 50, VT > 110 (LITFL) |
| WPW | QRS > 120 ms | > 110 ms; pseudo-infarct pattern in up to 70% |
| LBBB | "Almost always structural" | Rarely without organic disease, with the list of causes |
| Adenosine | "Contraindicated in asthma" | Avoid in severe or active bronchospasm |

**Still for you to verify:** the "2025 AHA" cardioversion energies (AF/flutter ≥ 200 J). I left these as written. Check them against the guideline document you use locally.

## 3. What v6 changes

### New format: Learn → Practise → Prove
- **Learn Path (new home tab):** 97 topics across **4 levels**: L1 Foundations (11), L2 Core (35), L3 Advanced, L4 Expert. They are grouped into **13 clinical systems** (e.g., "Ischaemia & occlusion MI", "Channelopathies & cardiomyopathies"). Each topic shows a status dot: not started → reviewed → in quiz rotation → missed recently → mastered.
- **Foundations module (new):** 10 reading lessons: paper & rate, leads & territories, the systematic read, axis, P/PR, QRS, ST/J point, T/U, QT/QTc, and differential maps. Each ends with a **"Try it"** button that drives the simulator, for example by opening 1st-degree block with calipers on, or putting RBBB beside LBBB in the comparator.
- **27 expert extension lessons (new)** cover patterns the engine doesn't simulate yet: OMI paradigm, RV infarction, South African flag, Aslanger, LV aneurysm (T/QRS 0.36), Takotsubo, myocarditis, LPFB, trifascicular myth, masquerading BBB, SA exit block, fascicular & RVOT VT, LQTS/SQTS, dextrocardia, low voltage, atrial enlargement, hypoMg, β-blocker/CCB toxicity, PRWP, ischaemic STD/TWI, and artefact. Each one links to the **nearest live ECG** for comparison.

### New lesson panel in Studio (replaces the 4 static cards)
- A **bottom line** sits at the top: the one sentence to remember.
- Tabs: **Recognise · Mechanism · Mimics & traps · Manage · LITFL pearls · Recall** (or "Show all").
- **Mimics** links directly to side-by-side comparisons.
- **Recall cards:** you reveal the answer, then grade yourself. Getting all of a topic's cards right marks it reviewed.
- "Next in pathway →" moves you to the next unstarted topic.

### LITFL learning points
- **All 60 simulated topics** have 3–7 learning points adapted from the matching LITFL ECG Library page(s), with links to the source pages.
- **101 LITFL pages were read.** Seven pages refused automated access (flutter, de Winter, LMCA/aVR, ARVC, Takotsubo, artefact, IVCD). For those topics the points were written from standard references and are **clearly labelled as not adapted from LITFL**.
- **Licence:** LITFL is **CC BY-NC-SA 4.0**. The app attributes it on every topic and in the footer. ⚠️ **Non-commercial only:** if MedPulse is ever monetised, the LITFL-derived text would have to be removed or rewritten. Any copy you share must carry the same licence.

### Other
- Library chips use the clinical systems, items show level and status, and **search covers learning points** (e.g., "Kosuge" finds PE).
- The phone overflow bug is fixed, and the bottom bar now has 5 tabs.
- First visit opens the Learn Path; after that the app reopens the last tab used.

## 4. Recommended next steps (in priority order)

1. **Clinical sign-off.** Have a consultant or cardiologist read the `Manage` tabs and the 20 corrections. This is a teaching tool, but doses get copied.
2. **Simulate the top expert lessons.** The most valuable next additions to the engine are RV infarction (V4R), high lateral OMI, LV aneurysm vs acute STEMI, fascicular VT, LQTS T-wave morphologies and Takotsubo.
3. **Real ECGs.** Synthetic traces teach patterns; real tracings teach noise. Link each topic to the LITFL Top-100 cases.
4. **Expand recall to 4–6 cards per topic**, including "what is the next step" cards, and feed recall misses into the spaced-repetition queue alongside quiz misses.
5. **Integrate with MedPulse** (this repo's quiz app): serve the file from `static/` and add a link. That would also let progress sync to a server instead of one browser.

## 5. Rebuilding

```
cd ecg-explorer
python3 build.py      # -> ECG_Master_Explorer_v6.html
```
Edit content in `src/learn_*.js` and add clinical corrections to `CONTENT_FIXES` in `build.py`. The build stops if any patch target is missing or ambiguous, so a correction cannot silently fail to apply.
