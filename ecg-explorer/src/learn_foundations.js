// ============================================================================
// LEVEL 1 — FOUNDATIONS. Build the reading machinery before pattern recognition.
// Each lesson ends with a "Try it" task that drives the live simulator or a tool.
// Adapted from LITFL ECG Library (CC BY-NC-SA 4.0).
// ============================================================================
const FOUNDATIONS = [
  { id: 'f_paper', title: 'Paper, calibration & rate',
    bl: 'At 25 mm/s one small box is 40 ms and one big box is 200 ms. Rate = 300 ÷ big boxes, 1500 ÷ small boxes, or QRS count in 10 s × 6.',
    lp: [
      'Check calibration first: the standard pulse is 10 mm tall (= 1 mV) and 5 mm wide. Half-standard (5 mm/mV) is used when voltages are huge, and it changes every amplitude criterion.',
      'A 10 s strip = 250 small = 50 big boxes. One minute = 1500 small = 300 big boxes.',
      'Use 300/big boxes for regular rhythms, 1500/small boxes for fast regular rhythms, and QRS × 6 for slow or irregular rhythms.',
      'Calculate atrial and ventricular rates separately when they differ (e.g., CHB). Machines miscount peaked T waves or low-amplitude QRS.',
      'At 50 mm/s everything looks twice as wide (1 small box = 20 ms), which helps reveal flutter waves and P waves.'
    ],
    src: ['ecg-rate-interpretation', 'ecg-exam-template'],
    tryIt: { label: 'Open NSR, turn calipers on and measure one R–R: convert it to a rate both ways.', sim: 'nsr', calipers: true },
    rc: [['R–R = 4 big boxes. Rate?', '300 ÷ 4 = 75 bpm.'], ['Irregular rhythm with 13 QRS on a 10 s strip. Rate?', '13 × 6 = 78 bpm.']] },

  { id: 'f_leads', title: 'Leads, placement & territories',
    bl: 'Ten electrodes give twelve views. Know where each lead looks, and which extra leads (V4R, V7–9, Lewis) answer which question.',
    lp: [
      'V1: 4th ICS right sternal edge. V2: 4th ICS left. V4: 5th ICS mid-clavicular. V3 is midway between V2 and V4. V5 anterior axillary and V6 mid-axillary, both level with V4.',
      'Territories: inferior II, III, aVF; lateral I, aVL, V5–6; septal V1–2; anterior V3–4.',
      'V4R (5th right ICS, MCL) is the best single lead for RV infarction (sens 88%, spec 78%). V7–9 sit on the back in the V6 plane: posterior axillary line, scapular tip, paraspinal.',
      'The Lewis lead (RA on manubrium, LA at 5th right ICS) magnifies atrial activity, which helps find flutter waves or AV dissociation in a WCT.',
      'On a 3-electrode monitor, place electrodes equidistant from the heart on the torso.'
    ],
    src: ['ecg-lead-positioning'],
    tryIt: { label: 'Open Acute STEMI in 12-lead view and switch territories with the controls above the strip: watch which leads elevate and which mirror.', sim: 'stemi', lead: '12' },
    rc: [['Which leads face the inferior wall?', 'II, III, aVF.'], ['Which extra lead confirms RV infarction?', 'V4R.']] },

  { id: 'f_system', title: 'The systematic read (never skip a step)',
    bl: 'Rate → rhythm → axis → P → PR → QRS (width, Q, R progression, voltage) → ST → T → QT → U → extra waves → chambers → "lethal don\'t-miss" list → synthesis.',
    lp: [
      'Seven-step rhythm approach: rate; QRS regularity; QRS width; P waves; P–QRS relationship; onset/offset (abrupt = re-entry, gradual = automaticity); response to vagal manoeuvres.',
      'Vagal response: sinus or atrial tachycardia slows gradually then resumes; AVNRT/AVRT stop abruptly or do nothing; AF/flutter slow gradually; VT does not respond.',
      'Look for the extra waves: Delta (WPW), Osborn (J, hypothermia), Epsilon (ARVC).',
      'Don\'t-miss syncope list ("Quick BRAD Walk Home"): long/short QT, Brugada, RV infarction, ARVC, DCM, WPW, HCM, plus PE, electrolytes and toxins.',
      'Write the synthesis first: a unifying diagnosis, differentials and life threats.'
    ],
    src: ['ecg-exam-template', 'ecg-rhythm-evaluation'],
    tryIt: { label: 'Switch on Blind mode in the library, then read three unknown strips out loud with the 12-step sequence before revealing.', blind: true },
    rc: [['Abrupt onset and offset suggests which mechanism?', 'Re-entry.'], ['VT\'s response to vagal manoeuvres?', 'None.']] },

  { id: 'f_axis', title: 'Axis in 10 seconds',
    bl: 'Normal axis is −30° to +90°. Leads I and aVF give the quadrant; lead II separates physiological from pathological left axis.',
    lp: [
      'LAD < −30°, RAD > +90°, extreme ("north-west") −90° to 180°.',
      'Quadrant method: I+ aVF+ is normal; I+ aVF− is left axis (check II: positive means within normal to −30°, negative means true LAD); I− aVF+ is RAD; I− aVF− is extreme.',
      'Isoelectric-lead method: the axis is perpendicular to the most equiphasic limb lead. This refines the angle.',
      'In neonates the axis is +30 to +190° and moves leftward with age.',
      'LAD causes: LAFB, LBBB, LVH, inferior MI, ventricular ectopy, paced rhythm, WPW. RAD causes: LPFB, lateral MI, RVH, PE, COPD, ventricular ectopy, hyperkalaemia, Na-channel blockers, WPW, and normal in children or thin adults.'
    ],
    src: ['ecg-axis-interpretation', 'left-axis-deviation-lad-ecg-library', 'right-axis-deviation-rad-ecg-library'],
    tryIt: { label: 'Open the Axis Explorer and set I+/aVF− then I−/aVF−: name the causes of each.', tool: 'axis' },
    rc: [['I positive, aVF negative, II negative — axis?', 'Pathological LAD (beyond −30°), e.g. LAFB.'], ['Normal axis range?', '−30° to +90°.']] },

  { id: 'f_pwave', title: 'P wave & PR interval',
    bl: 'The P is atrial depolarisation (< 120 ms, < 2.5 mm). The PR (120–200 ms) is AV conduction: short means pre-excitation or junctional origin, long means AV delay.',
    lp: [
      'Normal sinus P: smooth, monophasic in II, biphasic in V1, axis 0 to +75°. Upright in I and II, inverted in aVR.',
      'In V1 the RA (first, positive) and LA (second, negative) components separate, so atrial enlargement is easiest to read in V1 and the inferior leads.',
      'Short PR (< 120 ms): WPW (delta wave), LGL (very short PR without delta), or junctional rhythm with a retrograde P.',
      'Long PR (> 200 ms): first-degree block; it may coexist with Mobitz I or bifascicular block. PR depression is a pericarditis sign.'
    ],
    src: ['p-wave-ecg-library', 'pr-interval-ecg-library', 'pr-segment-ecg-library'],
    tryIt: { label: 'Open 1st-degree AV block, pause, and measure the PR with calipers (expect ~280 ms = 7 small boxes).', sim: 'avb1', calipers: true },
    rc: [['Normal PR range?', '120–200 ms (3–5 small boxes).'], ['Short PR without delta wave — eponym?', 'Lown–Ganong–Levine pattern.']] },

  { id: 'f_qrs', title: 'QRS: width, Q waves, R progression, voltage',
    bl: 'Narrow (< 100–110 ms) is supraventricular. Wide is ventricular, aberrant, or metabolic/toxic. Q, R progression and voltage tell you about scar and chambers.',
    lp: [
      'Normal QRS 70–100 ms (110 occasionally in health). A wide QRS can also come from hyperkalaemia or Na-channel blockade, not only BBB or a ventricular origin.',
      'Pathological Q: > 40 ms wide, > 2 mm deep, > 25% of the QRS, or any Q in V1–3. Deep Q in III and aVR can be normal. LOSS of septal q in V5–6 suggests LBBB.',
      'Q-wave differential: MI, HCM and infiltration, extreme rotation, lead misplacement.',
      'R progression: transition at V3–4; PRWP = R ≤ 3 mm in V3. Dominant R in V1 and dominant R in aVR each have their own differential.',
      'R-wave peak time (QRS onset to R peak) is prolonged in LBBB (V5–6 > 60 ms) and fascicular blocks (aVL or aVF > 45 ms).'
    ],
    src: ['qrs-interval-ecg-library', 'q-wave-ecg-library', 'r-wave-ecg-library', 'r-wave-peak-time-rwpt-ecg-library'],
    tryIt: { label: 'Open the Comparator and put RBBB next to LBBB: describe V1 and V6 in each.', compare: ['rbbb', 'lbbb'] },
    rc: [['Four criteria for a pathological Q wave?', '> 40 ms, > 2 mm deep, > 25% of QRS depth, or any Q in V1–3.'], ['Dominant R in aVR — three causes?', 'Na-channel blocker toxicity, LA/RA reversal, dextrocardia (also VT).']] },

  { id: 'f_st', title: 'ST segment & J point',
    bl: 'Measure ST deviation at the J point against the TP (or PR) baseline. Shape, distribution, reciprocity and change over time matter more than the millimetres.',
    lp: [
      'The J point is where the QRS ends and the ST begins. A J WAVE (Osborn) is a separate deflection before it.',
      'STE differential: OMI, vasospasm (Prinzmetal, transient), pericarditis, BER, LBBB, LVH, LV aneurysm, Brugada, paced rhythm, raised ICP, Takotsubo.',
      'STEMI STE can be concave, convex or straight. A concave ("smiley") shape does NOT exclude occlusion.',
      'Ischaemic STD: horizontal or downsloping ≥ 0.5 mm in 2 contiguous leads. Upsloping is non-specific, except in de Winter.'
    ],
    src: ['st-segment-ecg-library', 'j-point-ecg-library', 'myocardial-ischaemia-ecg-library'],
    tryIt: { label: 'Compare Pericarditis vs Early Repolarisation in the Comparator; then open STEMI and look for the reciprocal change.', compare: ['pericarditis', 'early_repol'] },
    rc: [['Name 6 causes of ST elevation that are not OMI.', 'Pericarditis, BER, LBBB, LVH, LV aneurysm, Brugada (also paced, ICP, Takotsubo, vasospasm).']] },

  { id: 'f_twave', title: 'T & U waves',
    bl: 'T is upright in every lead except aVR and V1 (III may be inverted). Size it against its own QRS. A U wave is normal if it is small and follows the T direction.',
    lp: [
      'Normal T: < 5 mm limb leads, < 10 mm precordial. A new upright T in V1, especially if taller than T in V6, is abnormal.',
      'TWI differential: children/persistent juvenile pattern (shallow, V1–3), ischaemia (dynamic) or old infarct (fixed with Q), BBB, strain, PE, HCM, raised ICP.',
      'Pathological TWI is usually symmetric and > 3 mm; any NEW TWI is abnormal.',
      'U waves become visible below ~65 bpm and should be < 25% of the T. Prominent U: bradycardia, hypokalaemia, hypoCa/hypoMg, hypothermia, ICP, LVH, digoxin, class IA/III drugs.',
      'Inverted U waves are highly specific for heart disease and can be the earliest sign of ischaemia.'
    ],
    src: ['t-wave-ecg-library', 'u-wave-ecg-library'],
    tryIt: { label: 'Open Hypokalaemia and Hyperkalaemia side by side ("push–pull" of the T wave).', compare: ['hypok', 'hyperk'] },
    rc: [['Which lead can normally show an inverted T in adults besides aVR and V1?', 'Lead III.'], ['When are U waves abnormal?', '> 1–2 mm or > 25% of the T, or inverted.']] },

  { id: 'f_qt', title: 'QT & QTc done properly',
    bl: 'Measure in the lead with the longest QT using the tangent method. Correct with Fridericia when the rate is outside 60–100. In poisoning, plot the absolute QT on the nomogram.',
    lp: [
      'QT = QRS onset to T end. Use lead II or V5–6 (whichever is longest) over several beats, and include large (> 1 mm) U waves fused to T.',
      'T end = where the steepest downslope tangent crosses the baseline (maximum-slope intercept). With notched T, use the second notch.',
      'Formulas: Bazett QT/√RR, Fridericia QT/∛RR, Framingham QT + 0.154(1 − RR), Hodges QT + 1.75(HR − 60), with RR in seconds.',
      'Bazett over-corrects above 100 bpm and under-corrects below 60 bpm.',
      'The QT shortens with fast rates and lengthens with slow rates.'
    ],
    src: ['qt-interval-ecg-library', 'bazett-formula', 'fridericia-formula'],
    tryIt: { label: 'Open the QTc tool: enter QT 400 ms at HR 120 and compare Bazett vs Fridericia.', tool: 'qtc' },
    rc: [['Which QTc formula over-corrects at fast heart rates?', 'Bazett.'], ['In a TCA or other QT-drug overdose, how do you judge TdP risk?', 'Absolute QT vs HR on the QT nomogram.']] },

  { id: 'f_maps', title: 'Differential maps: brady, narrow & wide tachycardia',
    bl: 'Every arrhythmia question reduces to a small set of branches: rate, width, regularity and the P–QRS relationship.',
    lp: [
      'Bradycardia with every P followed by a QRS points to sinus-node problems (sinus brady, exit block, arrest). If not every P conducts, it is AV block. If there are no P waves, it is an escape rhythm (junctional if narrow, ventricular if wide) or slow AF.',
      'Narrow regular: sinus tach, AT, flutter, AVNRT, AVRT, junctional tach. Narrow irregular: AF, flutter with variable block, MAT.',
      'Wide regular: VT (assume this), antidromic AVRT, SVT with aberrancy or metabolic widening. Wide irregular: VF, polymorphic VT/TdP, pre-excited AF, AF with BBB.'
    ],
    src: ['ecg-rhythm-evaluation', 'supraventricular-tachycardia-svt-ecg-library', 'vt-versus-svt-ecg-library'],
    tryIt: { label: 'Open Algorithms & Tables and work Step 1 → 4 on Monomorphic VT and Pre-Excited AF.', tables: true },
    rc: [['Four wide irregular tachycardias?', 'Pre-excited AF, AF with BBB/aberrancy, polymorphic VT/TdP, VF.']] }
];
