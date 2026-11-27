// LEARNING LAYER — part 2 (AIVR, AV blocks, escape, pacing, WPW, BBB, STEMI)
Object.assign(LEARN, {
  aivr: {
    lvl: 3,
    bl: 'Wide regular rhythm at 50–110 bpm, often with fusion beats, after reperfusion is AIVR: a sign the artery is open, so leave it alone.',
    lp: [
      'The rate defines it: < 50 bpm is a ventricular escape rhythm and > 110 bpm is VT.',
      'Causes: reperfusion (commonest, including post-thrombolysis and after ROSC), β-sympathomimetics, digoxin, cocaine, volatile anaesthetics (desflurane), electrolyte disturbance, cardiomyopathy/myocarditis, athletes.',
      'Antiarrhythmics can cause abrupt haemodynamic collapse. Treat the cause. If the patient depends on atrial kick, atropine may restore sinus capture.',
      'Isorhythmic AV dissociation: sinus and ventricular rates are nearly identical, so P waves seem related to QRS complexes. Do not call it complete heart block (in CHB the atrial rate is faster).'
    ],
    src: ['accelerated-idioventricular-rhythm-aivr'],
    rc: [
      ['Wide regular rhythm at 95 bpm 20 min after thrombolysis — next step?', 'Observe: it is AIVR (reperfusion). Do not give lidocaine or amiodarone.'],
      ['How does isorhythmic AV dissociation differ from complete heart block?', 'The atrial and ventricular rates are about equal (interference); in CHB the atrial rate exceeds the ventricular rate.']
    ]
  },
  avb1: {
    lvl: 2,
    bl: 'PR > 200 ms with every P conducted is delay, not block; it is benign in isolation, but read it in context (inferior MI, Lyme, drugs, bifascicular block).',
    lp: [
      '"Marked" first-degree block is PR > 300 ms, which can cause pacemaker-syndrome-like AV dyssynchrony.',
      'Causes: vagal tone and athletes, inferior MI, mitral valve surgery, myocarditis (Lyme), hyperkalaemia, AV-nodal drugs (β-blockers, CCBs, digoxin, amiodarone), or a normal variant.',
      'As an isolated finding it needs no specific treatment.'
    ],
    src: ['first-degree-heart-block-ecg-library'],
    rc: [
      ['PR 240 ms in a young man with a target-shaped rash and fatigue — think?', 'Lyme carditis (it can progress quickly to high-grade AV block).'],
      ['When does a long PR stop being "just" first-degree block?', 'When combined with bifascicular block, or when PR > 300 ms causes AV dyssynchrony and symptoms.']
    ]
  },
  mobitz1: {
    lvl: 2,
    bl: 'PR grows until a P drops; PR is longest before the drop and shortest after it. The block is in the AV node, so it is usually benign and responds to atropine.',
    lp: [
      'The biggest PR increment is between the 1st and 2nd beats of the cycle. Because the increments shrink, the R–R intervals progressively SHORTEN before the pause.',
      'P–P stays constant, and groups repeat in ratios like 3:2, 4:3, 5:4 ("group beating").',
      'AV-nodal cells fatigue progressively; His-Purkinje cells fail suddenly (Mobitz II). This is the mechanistic difference.',
      'Causes: AV-nodal drugs, vagal tone/athletes, inferior MI, myocarditis, after mitral or tetralogy repair. Pacing is rarely needed.'
    ],
    src: ['av-block-2nd-degree-mobitz-i-wenckebach-phenomenon'],
    rc: [
      ['In Wenckebach, what happens to the R–R intervals before the dropped beat?', 'They progressively shorten (the PR increments decrease).'],
      ['Where is the PR interval shortest?', 'In the first conducted beat after the dropped P.']
    ]
  },
  mobitz2: {
    lvl: 2,
    bl: 'Constant PR, then a sudden dropped P: His-Purkinje disease with a ~35%/yr risk of asystole. Pads on, admit, and plan a pacemaker.',
    lp: [
      'The R–R spanning a dropped beat is an exact multiple of the baseline R–R.',
      'About 75% of blocks are infra-Hisian (wide QRS) and about 25% intra-Hisian (narrow QRS), so a narrow QRS does not exclude Mobitz II.',
      'Typical substrate is pre-existing LBBB or bifascicular block with intermittent failure of the last fascicle ("bilateral bundle branch block").',
      'Causes: anterior MI (septal necrosis), Lenègre–Lev fibrosis, septal surgery, myocarditis/Lyme/rheumatic fever, SLE/scleroderma, amyloid/sarcoid/haemochromatosis, hyperkalaemia, drugs.'
    ],
    src: ['av-block-2nd-degree-mobitz-ii-hay-block'],
    rc: [
      ['Does a narrow QRS rule out Mobitz II?', 'No: about 25% are intra-Hisian with a narrow QRS.'],
      ['Approximate annual risk of asystole in Mobitz II?', 'About 35% per year, so it mandates monitoring, backup pacing and usually a permanent pacemaker.']
    ]
  },
  avb3: {
    lvl: 2,
    bl: 'Independent regular P waves and an independent, slower escape rhythm = complete heart block. Escape width tells you the level, and the level tells you the risk.',
    lp: [
      'CHB is the end-point of either a Mobitz I mechanism (nodal, e.g. inferior MI with vagal tone; more atropine-responsive and better prognosis) or a Mobitz II mechanism (His-Purkinje, e.g. anterior MI, Lenègre–Lev).',
      'Do not confuse it with high-grade AV block (some occasional conduction persists) or with AV dissociation from a faster lower pacemaker (AIVR, VT, junctional tachycardia).',
      'Ventricular standstill causes Stokes–Adams syncope or sudden death. Admit with backup temporary pacing.'
    ],
    src: ['av-block-3rd-degree-complete-heart-block'],
    rc: [
      ['AV dissociation with a ventricular rate faster than the atrial rate — CHB?', 'No: that is interference dissociation from a competing faster lower pacemaker (AIVR, VT, junctional tachycardia).'],
      ['Which CHB has the better prognosis: inferior or anterior MI?', 'Inferior (AV-nodal, often transient, atropine-responsive).']
    ]
  },
  avb2_2to1: {
    lvl: 3,
    bl: 'In 2:1 block you cannot see whether PR would lengthen, so it cannot be labelled Mobitz I or II from one strip. Use QRS width, a long strip and the response to atropine or exercise.',
    lp: [
      'Fixed-ratio blocks (2:1, 3:1, 4:1) can arise from either mechanism; ≥ 3:1 with a slow rate is "high-grade" AV block.',
      'Narrow QRS favours the AV node (improves with atropine, benign). Wide QRS with pre-existing BBB favours infranodal block (worsens with atropine, progresses).',
      'This is not infallible: 25% of Mobitz II blocks are intra-Hisian and narrow, and Mobitz I can coexist with BBB. Watch the monitor for Wenckebach sequences or Mobitz II runs.',
      'The non-conducted P often sits on the end of the T wave, so march out the P–P interval.'
    ],
    src: ['av-block-2nd-degree-fixed-ratio-blocks'],
    rc: [
      ['2:1 block that improves with atropine — likely level?', 'AV node (Mobitz I mechanism).'],
      ['What single bedside action best classifies a 2:1 block?', 'Record a long rhythm strip to catch 3:2 conduction (or any change in PR).']
    ]
  },
  junctional: {
    lvl: 2,
    bl: 'Narrow regular rhythm at 40–60 bpm with absent or retrograde P waves is a junctional escape rhythm: a life-saver that tells you the sinus node or AV conduction has failed.',
    lp: [
      'Pacemaker hierarchy: SA 60–100, atria < 60, AV junction 40–60, ventricles 20–40 bpm. Escape rhythms emerge when impulses from above fall below that intrinsic rate.',
      'Naming by rate: junctional bradycardia < 40, escape 40–60, accelerated junctional 60–100, junctional tachycardia > 100.',
      'Causes: severe sinus bradycardia or arrest, SA exit block, high-grade or complete AV block, hyperkalaemia, β-blocker/CCB/digoxin poisoning.'
    ],
    src: ['junctional-escape-rhythm-ecg-library'],
    rc: [
      ['Junctional rhythm at 80 bpm — name?', 'Accelerated junctional rhythm (60–100 bpm).'],
      ['Intrinsic rate of ventricular escape?', '20–40 bpm.']
    ]
  },
  paced: {
    lvl: 3,
    bl: 'Spike then wide QRS with LBBB-like morphology and appropriate discordance is normal RV pacing; know the code (AAI/VVI/DDD) and what a magnet does.',
    lp: [
      'NBG code: I = chamber paced, II = chamber sensed, III = response to sensing (I inhibit, T trigger, D dual), IV = rate modulation, V = multisite pacing.',
      'AAI suits sinus-node dysfunction with intact AV conduction; VVI suits permanent AF; DDD is the commonest mode.',
      'A magnet usually forces asynchronous pacing (AOO/VOO/DOO), with the behaviour depending on the manufacturer. In ICDs it suspends tachy-therapy but does not usually change pacing.',
      'Apply the same discordance logic as LBBB: Smith-modified Sgarbossa works in RV-paced rhythms.',
      'Expert note: conduction-system pacing (His or left-bundle-branch area) gives a much narrower paced QRS, often with RBBB-like V1 morphology. Do not call it "failure to capture".'
    ],
    src: ['pacemaker-rhythms-normal-patterns'],
    rc: [
      ['What does the third letter of the pacing code mean?', 'Response to sensing: I = inhibit, T = trigger, D = both.'],
      ['Magnet on a pacemaker (not ICD) — usual effect?', 'Asynchronous fixed-rate pacing (e.g., VOO/DOO).']
    ]
  },
  wpw_sinus: {
    lvl: 2,
    bl: 'Short PR, delta wave, wide QRS with discordant ST-T = pre-excitation; it mimics infarction in up to 70%, and it changes which drugs are safe.',
    lp: [
      'Incidence is 0.1–3 per 1000. "WPW syndrome" means pre-excitation plus tachyarrhythmia, and carries a small risk of sudden death.',
      'Pseudo-infarction pattern occurs in up to 70%: negative delta waves look like Q waves (inferior/anterior), or tall R in V1–3 mimics posterior MI.',
      'Pathway location: left-sided (type A) gives a positive delta wave across the precordium and R/S > 1 in V1; right-sided (type B) gives a negative delta wave in V1–V2.',
      'Pathways conduct in both directions (most), retrograde-only (~15%, "concealed") or anterograde-only (rare). Pre-excitation may be intermittent, and becomes more obvious with vagal manoeuvres or AV-nodal blockade.',
      'The QRS is widened, but less than in BBB, because AV-nodal conduction still fuses in.'
    ],
    src: ['pre-excitation-syndromes-ecg-library', 'delta-wave-ecg-library'],
    rc: [
      ['Tall R in V1 with short PR — which WPW type and pathway side?', 'Type A, left-sided accessory pathway.'],
      ['Intermittent pre-excitation on a Holter — reassuring or worrying?', 'Reassuring: it suggests a pathway with a long refractory period (lower risk of rapid AF conduction).']
    ]
  },
  rbbb: {
    lvl: 2,
    bl: 'QRS ≥ 120 ms, RSR′ in V1–3, wide slurred S in I/aVL/V5–6; the axis stays normal, and STEMI can still be diagnosed in RBBB.',
    lp: [
      'The LV and septum activate normally, so the early QRS is unchanged; late RV activation adds R′ in V1 and the slurred lateral S wave.',
      'V1 may show a broad monophasic R or qR instead of an RSR′. Appropriate discordance gives STD/TWI in V1–3.',
      'Causes: RVH/cor pulmonale, PE, IHD, rheumatic or congenital disease (ASD), myocarditis, cardiomyopathy, Lenègre–Lev.',
      'With chest pain, a NEW RBBB (± LAFB) is highly concerning for LAD occlusion (OMI), because the right bundle is supplied by LAD septal perforators.',
      'Incomplete RBBB (RSR′ with QRS < 120 ms) is a common normal variant in children. Always consider Brugada when you see an RSR′ in V1.'
    ],
    src: ['right-bundle-branch-block-rbbb-ecg-library'],
    rc: [
      ['Does isolated RBBB shift the axis?', 'No: LV activation is normal. Axis deviation suggests an added fascicular block.'],
      ['Chest pain + new RBBB + LAFB — concern?', 'Proximal LAD occlusion (OMI). Treat as a reperfusion candidate.']
    ]
  },
  lbbb: {
    lvl: 2,
    bl: 'QRS ≥ 120 ms, dominant S in V1, broad notched R in I/aVL/V5–6 with no septal Q waves; ST-T is discordant by design, so judge ischaemia by proportion (Smith-Sgarbossa).',
    lp: [
      'Full criteria: dominant S in V1, broad monophasic R in lateral leads, ABSENT lateral Q waves, and R-wave peak time > 60 ms in V5–6.',
      'Septal activation is reversed (right to left), which removes the normal lateral q waves.',
      'LBBB rarely occurs without organic disease: AS, IHD, hypertension, DCM, anterior MI, Lenègre–Lev, hyperkalaemia, digoxin toxicity.',
      'New LBBB alone is no longer a STEMI equivalent: chest-pain patients with new LBBB have little added MI risk. Look for concordance or excessive discordance.',
      'Mimics: RV pacing (look for spikes) and LVH (QRS widening with lateral STD/TWI).'
    ],
    src: ['left-bundle-branch-block-lbbb-ecg-library', 'sgarbossa-criteria-ecg-library'],
    rc: [
      ['Which lateral finding is absent in true LBBB?', 'Septal q waves in I, aVL, V5–6.'],
      ['Is new LBBB by itself a cath-lab activation criterion?', 'No. Use Smith-modified Sgarbossa, haemodynamics and the clinical picture.']
    ]
  },
  stemi: {
    lvl: 2,
    bl: 'Map the ST elevation to an artery, confirm with reciprocity, and remember: the target is the occluded artery (OMI), and millimetre criteria miss many occlusions.',
    lp: [
      'Anterior (LAD) MI has the worst prognosis: in-hospital mortality ~12% vs ~3% for inferior, with more heart failure and lower EF.',
      'Reciprocal inferior STD in anterior MI depends on STE in I/aVL, so it may be absent if the high lateral leads are not involved.',
      'Inferior MI (40–50% of MIs): RCA in ~80%, LCx ~18%, occasionally a wraparound LAD (simultaneous anterior + inferior STE).',
      'RCA vs LCx: STE III > II, STD in I and RV involvement (STE V1, V4R) favour RCA; STE II ≈ III, no STD in I and lateral STE favour LCx.',
      'aVL is the only lead truly reciprocal to the inferior wall: STD in aVL is seen in ~91% of subtle inferior OMIs that miss STEMI criteria.',
      'Inferior MI complications: RV infarct (~40%, nitrate-induced hypotension), 2nd/3rd-degree AV block (~20%; AV-nodal artery from RCA in 80%, plus Bezold–Jarisch reflex), posterior extension.',
      'Isolated lateral STEMI (D1, OM or ramus occlusion) is a stand-alone reperfusion indication.'
    ],
    src: ['anterior-myocardial-infarction-ecg-library', 'inferior-stemi-ecg-library', 'lateral-stemi-ecg-library', 'omi-replacing-the-stemi-misnomer'],
    rc: [
      ['Inferior STE with STE III > II and STD in I — culprit?', 'RCA (check V4R for RV infarction).'],
      ['Subtle inferior STE below threshold — which single lead helps most?', 'aVL: any new ST depression or T inversion suggests inferior OMI.'],
      ['Why might an anterior STEMI show no inferior reciprocal change?', 'Inferior reciprocity mirrors STE in I/aVL; without high lateral involvement it may be absent.']
    ]
  }
});
