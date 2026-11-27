// ============================================================================
// EXPERT EXTENSION TOPICS — patterns not yet simulated by the waveform engine.
// Each is a reading lesson + "nearest simulation" (sim) the learner can open to compare.
// Adapted from LITFL ECG Library (CC BY-NC-SA 4.0) unless litflNotRead is set.
// ============================================================================
const EXTEND = [
  { id: 'x_omi', group: 'isch', lvl: 4, title: 'OMI: Occlusion MI vs "STEMI"', sim: 'hyperacute_t',
    bl: 'The decision that matters is whether a coronary artery is occluded right now. Millimetre STEMI criteria are only a proxy, and they miss about a quarter of occlusions.',
    lp: [
      'On delayed angiography, 25–30% of "NSTEMI" patients have a totally occluded artery. Expert ECG reading reclassified 28% of NSTEMIs as acute occlusion, and that group had about double the mortality (DIFOCCULT).',
      'OMI = near or total occlusion with insufficient collaterals, causing active infarction that benefits from emergent reperfusion. NOMI = no occlusion, or sufficient collaterals.',
      'OMI signs beyond STE: hyperacute T waves, reciprocal STD alone (e.g., aVL in inferior OMI), posterior pattern in V1–3, de Winter, South African flag, Aslanger pattern, new RBBB + LAFB, Smith-Sgarbossa positivity.',
      'Reading habit: STE that is small but disproportionate to its QRS, has reciprocity, or is evolving on serial ECGs matters more than whether it crosses 1 or 2 mm.'
    ],
    src: ['omi-replacing-the-stemi-misnomer'],
    rc: [['Roughly what fraction of NSTEMIs have an occluded artery at delayed angiography?', 'About 25–30%.']] },

  { id: 'x_rvmi', group: 'isch', lvl: 3, title: 'Right Ventricular Infarction', sim: 'stemi',
    bl: 'Look for RV infarction in every inferior STEMI: STE in V1 (especially with STD in V2), STE III > II, then confirm with V4R. Give fluids, and do not give nitrates.',
    lp: [
      'It complicates up to 40% of inferior STEMIs; isolated RV MI is very rare.',
      'Clues: STE in V1 (the only standard lead facing the RV), STE V1 with STD V2 (highly specific), STE III > II.',
      'V4R (5th right ICS, mid-clavicular line) STE: sensitivity 88%, specificity 78%. Right-sided STE is transient (gone within 10 h in half of patients).',
      'These patients are preload-dependent. Treat hypotension with fluids; nitrates and other preload reducers are contraindicated.'
    ],
    src: ['right-ventricular-infarction-ecg-library'],
    rc: [['Inferior STEMI with STE in V1 and STD in V2 — what do you add?', 'Right-sided leads (V4R). Suspect RV infarction: avoid nitrates and give fluids for hypotension.']] },

  { id: 'x_highlat', group: 'isch', lvl: 4, title: 'High Lateral OMI — "South African Flag"', sim: 'stemi',
    bl: 'STE in I, aVL and V2 with STD in III makes the flag shape on a 4×3 layout: first-diagonal (D1) occlusion. The STE is often tiny and the inferior reciprocity is the loud part.',
    lp: [
      'STE mainly in I and aVL (± V2), with reciprocal STD and/or TWI inferiorly, most marked in III.',
      'D1 occlusion gives isolated I/aVL STE; LCx occlusion gives I, aVL plus V5–6.',
      'Isolated lateral OMI is a stand-alone reperfusion indication even when it fails millimetre criteria.'
    ],
    src: ['high-lateral-stemi-ecg-library', 'lateral-stemi-ecg-library'],
    rc: [['Isolated STD in III with subtle STE in aVL — what to look for next?', 'High lateral OMI (D1): check I, aVL and V2 for STE.']] },

  { id: 'x_aslanger', group: 'isch', lvl: 4, title: 'Aslanger Pattern', sim: 'stemi',
    bl: 'Inferior OMI hidden by multivessel disease: STE only in III, STD in V4–6 with terminally upright T, and ST in V1 > V2.',
    lp: [
      'Criteria: (1) STE isolated to III; (2) STD in any of V4–V6 with a positive or terminally positive T; (3) ST in V1 > V2.',
      'Mechanism: the inferior OMI vector (down and right) sums with the diffuse subendocardial vector (toward aVR), leaving STE only in III and aVR.',
      'Found in ~13% of inferior MIs, which can be wrongly labelled NSTEMI. It was also present in 0.5% of patients without MI. Evidence is from a single retrospective study.'
    ],
    src: ['aslanger-pattern'],
    rc: [['Three criteria of the Aslanger pattern?', 'STE only in III; STD in V4–6 with positive/terminally positive T; ST in V1 > V2.']] },

  { id: 'x_lvaneurysm', group: 'isch', lvl: 4, title: 'LV Aneurysm (persistent STE)', sim: 'stemi',
    bl: 'STE more than 2 weeks after MI with deep Q/QS waves and small T waves is old scar, not new occlusion. Use the T/QRS ratio.',
    lp: [
      'Some STE persists in 60% of anterior and 5% of inferior STEMIs. Persistent anterior STE + Q waves: sensitivity 38%, specificity 84% for aneurysm.',
      'Favours aneurysm: identical to old ECGs, static, no reciprocity, well-formed Q waves. Favours acute STEMI: new or dynamic changes, reciprocity, an unwell patient.',
      'T/QRS amplitude ratio < 0.36 in ALL precordial leads favours aneurysm; > 0.36 in ANY lead favours acute anterior STEMI.',
      'Risks: VT/SCD (scar), heart failure, mural thrombus and embolism.'
    ],
    src: ['left-ventricular-aneursym-ecg-library'],
    rc: [['T/QRS ratio threshold separating LV aneurysm from acute anterior STEMI?', '0.36: < 0.36 in all precordial leads = aneurysm; > 0.36 in any = acute STEMI.']] },

  { id: 'x_takotsubo', group: 'isch', lvl: 4, title: 'Takotsubo Cardiomyopathy', sim: 'cerebral_t', litflNotRead: true,
    bl: 'Takotsubo can look exactly like an anterior OMI on the ECG. It is a diagnosis made at angiography, never at the bedside.',
    lp: [
      'Non-LITFL summary: the acute phase shows STE (often anterior, sometimes with less reciprocity and frequent aVR STD with V1 sparing). Over days it evolves to deep, widespread TWI with marked QT prolongation (TdP risk).',
      'Classic triggers are emotional or physical stress, mostly in post-menopausal women. Apical ballooning is the commonest variant.',
      'ECG rules cannot safely exclude OMI, so these patients still need angiography.'
    ],
    src: ['tako-tsubo-cardiomyopathy-ecg-library'],
    rc: [['Can you diagnose Takotsubo from the ECG alone?', 'No. OMI must be excluded angiographically.']] },

  { id: 'x_myocarditis', group: 'struct', lvl: 3, title: 'Myocarditis', sim: 'pericarditis',
    bl: 'Sinus tachycardia with non-specific ST-T change is the commonest ECG. Conduction disease or ventricular arrhythmia means the myocardium is badly involved.',
    lp: [
      'Variable findings: QRS or QT prolongation, diffuse TWI, ventricular arrhythmias, AV block, and pericarditic changes (myopericarditis).',
      'Causes: viral (coxsackie B, influenza, adenovirus, HSV, HIV, SARS-CoV-2), bacterial (mycoplasma, rickettsia, leptospira), immune (sarcoid, SLE, scleroderma, Kawasaki), drugs and toxins (clozapine, amphetamines).',
      'Usually benign, but it can cause heart failure, shock, death or later DCM.'
    ],
    src: ['myocarditis-ecg-library'],
    rc: [['New AV block in a young patient with a viral prodrome and troponin rise — think?', 'Myocarditis (also Lyme or giant-cell); needs monitoring.']] },

  { id: 'x_lpfb', group: 'cond', lvl: 3, title: 'Left Posterior Fascicular Block', sim: 'bifascicular',
    bl: 'RAD with rS in I/aVL and qR in II/III/aVF is LPFB only after you exclude every other cause of RAD.',
    lp: [
      'Criteria: RAD > +90°, rS in I and aVL, qR in II, III, aVF, R-wave peak time in aVF > 45 ms, QRS 80–110 ms.',
      'It is rare in isolation (a broad, dual-supply fascicle) and usually occurs with RBBB as bifascicular block.',
      'Exclude first: RVH, acute PE, TCA toxicity, lateral STEMI, lead reversal.'
    ],
    src: ['left-posterior-fascicular-block-lpfb-ecg-library', 'right-axis-deviation-rad-ecg-library'],
    rc: [['Name four causes of RAD to exclude before calling LPFB.', 'RVH, acute PE, sodium-channel (TCA) toxicity, lateral MI (also LA/RA reversal, dextrocardia).']] },

  { id: 'x_trifasc', group: 'cond', lvl: 3, title: '"Trifascicular" Block — a misnomer', sim: 'bifascicular',
    bl: 'True trifascicular block is bifascicular block plus CHB. "Bifascicular + long PR" is usually AV-nodal delay and is not a pacing indication on its own.',
    lp: [
      'True trifascicular block: 3rd-degree AVB with RBBB + LAFB or RBBB + LPFB escape morphology.',
      'Impending trifascicular failure: alternating LBBB/RBBB, or RBBB with beat-to-beat alternating fascicular block.',
      'Bifascicular + 1st-degree AVB or Mobitz I carries no higher CHB risk (~1%/yr); AHA/ACC/HRS advise against using "trifascicular" for it.',
      'Pacing: required for true trifascicular block. Bifascicular + syncope: admit and likely pace. Asymptomatic bifascicular + 1st-degree AVB: no pacing (class III).'
    ],
    src: ['trifascicular-block-ecg-library'],
    rc: [['Asymptomatic RBBB + LAFB + PR 240 — pacemaker?', 'No (class III); the risk is the same as bifascicular block alone (~1%/yr).']] },

  { id: 'x_mbbb', group: 'cond', lvl: 4, title: 'Masquerading Bundle Branch Block', sim: 'bifascicular',
    bl: 'RBBB in V1 but an LBBB-looking limb-lead pattern with no S wave in I/aVL is masquerading BBB: diffuse conduction disease with a high CHB risk.',
    lp: [
      'Standard type: RBBB in precordial leads, LBBB in limb leads, small or absent S in I. Precordial type: RBBB in V1–3, LBBB in V4–6, absent S in V5–6.',
      'CHB progression was 59% over 4 yrs (vs 11% over 5 yrs for RBBB + LAFB). In a 600,000-ECG review, 4-yr mortality was 41% and 39% received a pacemaker.',
      'Associations: severe triple-vessel disease, Lenègre–Lev, Chagas. Consider a PPM even if asymptomatic.'
    ],
    src: ['masquerading-bundle-branch-block-mbbb'],
    rc: [['What separates MBBB from ordinary RBBB + LAFB?', 'Absence of a prominent S wave in I and aVL.']] },

  { id: 'x_highgrade', group: 'cond', lvl: 3, title: 'High-Grade AV Block', sim: 'avb2_2to1',
    bl: 'Ratio 3:1 or worse with some P–QRS relationship still present: a very slow ventricular rate, treated like CHB.',
    lp: [
      'P:QRS ≥ 3:1 with occasional conduction, unlike CHB where there is none.',
      'It can arise from Mobitz I or II mechanisms; a broad QRS favours infranodal block.',
      'Example: atrial ~140, ventricular ~35 at 4:1.'
    ],
    src: ['av-block-2nd-degree-high-grade-av-block'],
    rc: [['High-grade AVB vs CHB — key difference?', 'Some P waves still conduct (consistent PR on conducted beats) in high-grade block.']] },

  { id: 'x_saexit', group: 'brady', lvl: 3, title: 'Sino-atrial Exit Block', sim: 'tachy_brady',
    bl: 'The sinus node fires but the impulse cannot leave. Type II drops a P with a pause that is an exact multiple of the P–P interval; type I mimics sinus arrhythmia.',
    lp: [
      'P cells generate the impulse, T cells transmit it. P-cell failure gives sinus arrest; T-cell failure gives exit block.',
      'Only 2nd-degree SA block is diagnosable on the ECG. Type I: P–P shortens before a dropped P, with grouping. Type II: pause = exact multiple of P–P.',
      '3rd-degree SA block is indistinguishable from sinus arrest without an EP study.',
      'Causes: SSS, vagal tone, inferior MI, myocarditis, digoxin, β-blockers, CCBs, amiodarone.'
    ],
    src: ['sinoatrial-exit-block-ecg-library'],
    rc: [['A pause that is exactly 2× the P–P interval with no P — diagnosis?', '2nd-degree SA exit block, type II.']] },

  { id: 'x_sinusarr', group: 'atrial', lvl: 1, title: 'Sinus Arrhythmia', sim: 'nsr',
    bl: 'P–P varies by more than 120 ms cyclically with breathing, with the same P shape and constant PR: normal physiology in the young.',
    lp: [
      'Inspiration lowers vagal tone and the rate rises; expiration restores vagal tone and the rate falls.',
      'Non-respiratory sinus arrhythmia in the elderly is more likely pathological (heart disease, digoxin).',
      'Differentials for an irregular sinus-looking rhythm: frequent PACs, Mobitz I, type I SA exit block.'
    ],
    src: ['sinus-arrhythmia-ecg-library'],
    rc: [['Minimum P–P variation for sinus arrhythmia?', '> 120 ms (3 small squares).']] },

  { id: 'x_ajr', group: 'brady', lvl: 3, title: 'Accelerated Junctional Rhythm', sim: 'junctional',
    bl: 'Narrow junctional rhythm at 60–100 bpm, often with retrograde P or AV dissociation (V rate > A rate). Digoxin toxicity is the classic cause.',
    lp: [
      'Retrograde P (inverted in II, III, aVF; upright in aVR and V1) may fall before, during or after the QRS.',
      'Causes: digoxin toxicity (classic), β-agonists, ischaemia, myocarditis, post-cardiac surgery.',
      'Automatic junctional rhythms show irregularity and heart-rate variability and do not convert with vagal manoeuvres; re-entrant ones (AVNRT/AVRT) terminate abruptly.',
      'If aberrant, fusion or capture beats point to AIVR rather than AJR.'
    ],
    src: ['accelerated-junctional-rhythm-ajr', 'premature-junctional-complex-pjc'],
    rc: [['Classic cause of accelerated junctional rhythm?', 'Digoxin toxicity.']] },

  { id: 'x_ventescape', group: 'brady', lvl: 2, title: 'Ventricular Escape Rhythm', sim: 'avb3',
    bl: 'Wide regular rhythm at 20–40 bpm is the last pacemaker in the hierarchy. Never suppress it; pace.',
    lp: [
      'Broad QRS (≥ 120 ms) with LBBB or RBBB morphology; also called idioventricular escape.',
      'It appears after severe sinus bradycardia or arrest, SA exit block, high-grade or complete AVB, hyperkalaemia, or β-blocker/CCB/digoxin poisoning.',
      'Compare with AIVR (50–110) and VT (> 110).'
    ],
    src: ['ventricular-escape-rhythm-ecg-library'],
    rc: [['Wide regular rhythm at 32 bpm — give lidocaine?', 'Never. It is an escape rhythm; pace and treat the cause.']] },

  { id: 'x_bbccb', group: 'tox', lvl: 3, title: 'β-Blocker & CCB Toxicity', sim: 'avb1',
    bl: 'Bradycardia and AV block; a lengthening PR is the early warning. Propranolol behaves like a TCA and sotalol like a QT drug.',
    lp: [
      'ECG: sinus bradycardia, 1st/2nd/3rd-degree AVB, junctional or ventricular bradycardia.',
      'PR prolongation is an early sign of toxicity, even before significant bradycardia.',
      'Propranolol blocks fast Na channels: QRS widening and a terminal R in aVR predict coma, seizures, hypotension and VT.',
      'Sotalol blocks K channels: QT prolongation and TdP.'
    ],
    src: ['beta-blocker-and-calcium-channel-blocker-toxicity'],
    rc: [['Which β-blocker overdose widens the QRS and why?', 'Propranolol, through sodium-channel blockade (TCA-like).']] },

  { id: 'x_lqts', group: 'channel', lvl: 4, title: 'Long QT: Congenital & Drug-Induced', sim: 'torsades',
    bl: 'Measure QT in the lead where it is longest, include large fused U waves, correct with Fridericia at extreme rates, and know the drug list.',
    lp: [
      'Romano–Ward is autosomal dominant LQTS without deafness (Jervell–Lange-Nielsen has congenital deafness). Mainstay is β-blockade; ICD/ablation after syncope or sustained VA.',
      'QT drug classes: antipsychotics (haloperidol, droperidol, quetiapine, olanzapine, amisulpride, chlorpromazine), class IA/IC/III antiarrhythmics, TCAs, citalopram/escitalopram, venlafaxine, bupropion, antihistamines (diphenhydramine, loratadine), chloroquine/HCQ, quinine, macrolides.',
      'Measurement: lead II or V5–6 (use the longest), several beats, tangent (maximum-slope intercept) for T end, and include U waves > 1 mm that are fused to T.',
      'Bazett over-corrects above 100 and under-corrects below 60 bpm. One study found automated Bazett had 54% sensitivity vs 100% for Fridericia.'
    ],
    src: ['romano-ward-syndrome', 'drugs-causing-qt-prolongation', 'qt-interval-ecg-library'],
    rc: [['Congenital LQTS with deafness — eponym?', 'Jervell and Lange-Nielsen syndrome (autosomal recessive).']] },

  { id: 'x_sqts', group: 'channel', lvl: 4, title: 'Short QT Syndrome', sim: 'hyperca',
    bl: 'QT < 320–340 ms that does not lengthen at slow rates, with peaked T and an absent ST segment, in a young person with AF or arrest is SQTS.',
    lp: [
      'It is an inherited channelopathy on the spectrum with LQTS, Brugada and CPVT; median presentation age is 30, and it is a possible cause of SIDS.',
      'Cardiac arrest is the first presentation in about a third; AF was documented in 80% of one series.',
      'Mechanism: very short refractory periods plus transmural dispersion of repolarisation.',
      'There are no formal diagnostic criteria; the diagnosis combines ECG, symptoms and family history.'
    ],
    src: ['short-qt-syndrome-ecg-library'],
    rc: [['Name two ECG features of SQTS besides a short QT.', 'Lack of QT adaptation to heart rate; tall peaked T with absent ST segment.']] },

  { id: 'x_fascvt', group: 'vent', lvl: 4, title: 'Fascicular VT (Belhassen, verapamil-sensitive)', sim: 'vt',
    bl: 'RBBB + LAD wide-ish (100–140 ms) tachycardia in a healthy young male that ignores adenosine but responds to verapamil is fascicular VT. It is the one VT where verapamil is the drug.',
    lp: [
      'Features: monomorphic VT with a relatively narrow QRS (100–140 ms) and a short RS interval (60–80 ms); posterior fascicular type (90–95%) is RBBB + LAD.',
      '~10% of monomorphic VT is idiopathic: 75–90% from the RV (RVOT), 10–25% from the LV (mostly fascicular).',
      'It is often misdiagnosed as SVT with RBBB; look for AV dissociation, fusion and capture beats.',
      'Digoxin toxicity can produce a similar pattern via automaticity.'
    ],
    src: ['idiopathic-fascicular-left-ventricular-tachycardia'],
    rc: [['Which VT is verapamil-sensitive?', 'Idiopathic fascicular (Belhassen) VT.']] },

  { id: 'x_rvot', group: 'vent', lvl: 4, title: 'RVOT VT', sim: 'vt',
    bl: 'LBBB morphology with an inferior axis in a structurally normal heart is RVOT VT. Adenosine often terminates it; ARVC must be excluded.',
    lp: [
      '80% of outflow-tract VAs arise in the RVOT. ECG: LBBB, inferior axis, rS in V1, R in V6, transition usually ≥ V3.',
      'It usually presents as repetitive non-sustained monomorphic VT (60–90%) or exercise-induced sustained VT.',
      'Stable idiopathic RVOT VT: vagal manoeuvres or adenosine 6 → 24 mg, or verapamil if BP allows. If unstable, or there is doubt between SVT and VT, cardiovert.'
    ],
    src: ['right-ventricular-outflow-tract-rvot-tachycardia'],
    rc: [['LBBB + inferior axis VT — which two entities?', 'Idiopathic RVOT VT and ARVC-related VT.']] },

  { id: 'x_dextro', group: 'tech', lvl: 3, title: 'Dextrocardia', sim: 'lead_reversal',
    bl: 'Global negativity in I, positive aVR, RAD AND absent R progression across V1–V6. Reverse the arm leads and record right-sided chest leads to "correct" it.',
    lp: [
      'The limb-lead picture is identical to LA/RA reversal; the chest leads separate them.',
      'Look for associations (e.g., Kartagener syndrome).'
    ],
    src: ['dextrocardia-ecg-library'],
    rc: [['How do you record a "normal" ECG in dextrocardia?', 'Reverse the arm electrodes and place chest leads mirror-image on the right.']] },

  { id: 'x_lowvolt', group: 'struct', lvl: 2, title: 'Low QRS Voltage', sim: 'tamponade',
    bl: 'All limb QRS < 5 mm or all precordial < 10 mm. Think fluid, fat, air, infiltration or lost myocardium, and rule out effusion first.',
    lp: [
      'Mechanisms: damping (fluid, fat, air), loss of viable myocardium, infiltration or myxoedema.',
      'Causes: pericardial or pleural effusion, obesity, emphysema, pneumothorax, myxoedema, amyloid/sarcoid/haemochromatosis, constriction, scleroderma, massive old MI, end-stage DCM.',
      'Amyloid clue (expert): low voltage despite a thick LV wall on echo, a voltage-mass mismatch.'
    ],
    src: ['low-qrs-voltage-ecg-library'],
    rc: [['Low voltage + thick LV on echo — think?', 'Infiltrative cardiomyopathy, especially amyloidosis.']] },

  { id: 'x_atrial', group: 'struct', lvl: 2, title: 'Atrial Enlargement (P mitrale / P pulmonale)', sim: 'rvh',
    bl: 'Right atrium makes the P tall (> 2.5 mm in II); left atrium makes it long and bifid (> 110–120 ms) with a deep, wide terminal V1 component.',
    lp: [
      'The first third of the P wave is RA, the last third LA. In V1 they separate: the positive part is RA and the negative part is LA.',
      'LAE: bifid P in II with > 40 ms between peaks, P > 110 ms; V1 terminal negativity > 40 ms or > 1 mm deep. Seen in mitral stenosis, HTN, AS, MR, HCM; often precedes AF.',
      'RAE: P > 2.5 mm in II/III/aVF or > 1.5 mm in V1–2. Causes: pulmonary hypertension (cor pulmonale, primary), tricuspid stenosis, congenital disease.',
      'Normal P: < 120 ms, < 2.5 mm limb leads, < 1.5 mm precordial, axis 0 to +75°.'
    ],
    src: ['left-atrial-enlargement-ecg-library', 'right-atrial-enlargement-ecg-library', 'p-wave-ecg-library'],
    rc: [['V1 P wave terminal negative portion 50 ms and 1.5 mm deep — meaning?', 'Left atrial enlargement.']] },

  { id: 'x_hypomg', group: 'lytes', lvl: 3, title: 'Hypomagnesaemia', sim: 'torsades',
    bl: 'Low Mg rarely shows a pure pattern, but it is the multiplier behind refractory hypokalaemia, ectopy and TdP. Aim for Mg > 1.0 and K > 4.0.',
    lp: [
      'Normal Mg 0.8–1.0 mmol/L. Features: longer PR and QT, atrial and ventricular ectopy, VT/TdP predisposition.',
      'Usually coexists with low K/Ca, so the "pure" ECG signs are uncertain.',
      'Correcting Mg > 1.0 with K > 4.0 often suppresses ectopy and SVTs; 2 g IV bolus is standard for TdP.'
    ],
    src: ['hypomagnesaemia-ecg-library'],
    rc: [['Target Mg2+ for arrhythmia suppression?', '> 1.0 mmol/L (with K+ > 4.0).']] },

  { id: 'x_prwp', group: 'struct', lvl: 2, title: 'Poor R-Wave Progression', sim: 'lvh',
    bl: 'R ≤ 3 mm in V3 is a finding with a differential (old anteroseptal MI, LVH, RVH, DCM, lead misplacement, normal variant), not a diagnosis of infarction.',
    lp: [
      'Normal transition (R = S) is at V3–V4.',
      'Check lead placement first: V1/V3 transposition shows a biphasic P in "V3".',
      'Absent R progression with dominant S throughout suggests dextrocardia.'
    ],
    src: ['poor-r-wave-progression-prwp-ecg-library', 'r-wave-ecg-library'],
    rc: [['Definition of poor R-wave progression?', 'R wave ≤ 3 mm in V3.']] },

  { id: 'x_nste', group: 'isch', lvl: 2, title: 'Ischaemic ST Depression & T Inversion', sim: 'left_main_avr',
    bl: 'Horizontal or downsloping STD ≥ 0.5 mm in 2 contiguous leads is ischaemic, especially if dynamic. STD that localises to one territory is often reciprocal to an OMI you have not found yet.',
    lp: [
      'STD ≥ 1 mm is more specific; ≥ 2 mm in ≥ 3 leads predicts ~35% 30-day mortality. Upsloping STD is non-specific (de Winter is the exception).',
      'Subendocardial STD is widespread (I, II, V4–6 …) and does NOT localise the culprit.',
      'Ischaemic TWI: ≥ 1 mm deep, ≥ 2 contiguous leads with dominant R, and dynamic. TWI in III alone is a normal variant.',
      'U-wave inversion is a subtle but very specific ischaemia sign (LAD/LMCA ≥ 75% stenosis).'
    ],
    src: ['myocardial-ischaemia-ecg-library', 'u-wave-ecg-library', 't-wave-ecg-library'],
    rc: [['STD only in II, III, aVF — what should you hunt for?', 'Reciprocal change: a high lateral OMI (STE in I/aVL).']] },

  { id: 'x_artefact', group: 'tech', lvl: 2, title: 'Motion & Tremor Artefact', sim: 'vf', litflNotRead: true,
    bl: 'If the "VT" or "VF" has normal QRS complexes marching through it at the underlying rate, it is artefact. Look at the patient before the monitor.',
    lp: [
      'Non-LITFL summary: tooth-brushing, tremor (Parkinsonian ~4–6 Hz), shivering and electrode movement can mimic VT/VF or flutter.',
      'Clue: native QRS complexes visible "through" the artefact at the expected R–R ("notches"), artefact confined to some leads, and a well, talking patient.',
      'Shivering artefact (hypothermia) and Parkinsonian tremor both give baseline "fuzziness" (LITFL hypothermia page).'
    ],
    src: ['ecg-motion-artefacts-ecg-library', 'hypothermia-ecg-library'],
    rc: [['"VT" on telemetry in a patient brushing their teeth — the tell?', 'Native QRS complexes marching through at the baseline rate; the patient is well.']] }
];
