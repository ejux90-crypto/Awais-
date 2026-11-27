// ============================================================================
// LEARNING LAYER — part 1 (sinus, SVT, pre-excitation, ventricular)
// lvl: 2 = Core (every resident), 3 = Advanced (senior / boards), 4 = Expert
// bl:  bottom line — the one sentence to remember
// lp:  learning points adapted from LITFL ECG Library (CC BY-NC-SA 4.0)
// src: LITFL page slugs (https://litfl.com/<slug>/)
// rc:  active-recall cards [question, answer]
// ============================================================================
Object.assign(LEARN, {
  nsr: {
    lvl: 2,
    bl: 'Sinus = P upright in I and II, inverted in aVR, every P followed by a QRS at a constant PR — learn this so well that every deviation jumps out.',
    lp: [
      'The P-wave axis is the proof of sinus origin: upright in I and II, inverted in aVR. A "regular narrow rhythm" without that P axis is not sinus.',
      'QRS < 100 ms is normal; 100–119 ms is an incomplete / non-specific intraventricular conduction delay, not "normal".',
      'Normal rates are age-dependent: newborn 110–150, 2 yrs 85–125, 4 yrs 75–115, ≥ 6 yrs 60–100 bpm. A paediatric "tachycardia" may be normal.',
      'Sinus arrhythmia (beat-to-beat P–P variation with breathing) is still sinus rhythm and is normal, especially in the young.'
    ],
    src: ['normal-sinus-rhythm-ecg-library'],
    rc: [
      ['Which two leads prove a sinus P-wave axis?', 'Upright P in I and II (and inverted in aVR).'],
      ['QRS 110 ms with normal morphology — normal?', 'No: 100–119 ms is a non-specific / incomplete conduction delay.']
    ]
  },
  sinus_brady: {
    lvl: 2,
    bl: 'Sinus bradycardia is a finding, not a diagnosis — the job is to find the cause (drug, vagal, ischaemic, metabolic, neurological) and decide if it is causing hypoperfusion.',
    lp: [
      'Non-drug causes worth remembering: sleep, athletes, inferior MI, sinus-node disease, hypothyroidism, hypothermia, anorexia nervosa, hyperkalaemia, hypermagnesaemia, myocarditis and the Cushing reflex.',
      'Drug causes go beyond β-blockers/CCBs/digoxin: clonidine and dexmedetomidine, amiodarone, opioids, GABA-ergic agents (benzodiazepines, barbiturates, baclofen, GHB) and organophosphates.',
      'On a surface ECG sinus bradycardia can be indistinguishable from 2:1 sino-atrial exit block — the clue is an abrupt halving or doubling of rate.'
    ],
    src: ['sinus-bradycardia-ecg-library'],
    rc: [
      ['Name four non-cardiac-drug toxins that cause sinus bradycardia.', 'Clonidine/dexmedetomidine, opioids, GABA-ergic agents (benzodiazepines, GHB, baclofen), organophosphates.'],
      ['Sudden heart-rate halving with identical P waves — what should you suspect?', '2:1 sino-atrial exit block.']
    ]
  },
  sinus_tach: {
    lvl: 2,
    bl: 'Sinus tachycardia is almost always secondary — treat the cause, never the number.',
    lp: [
      'Inappropriate sinus tachycardia is a diagnosis of exclusion, made only after secondary causes are ruled out.',
      'Important secondary causes: hypovolaemia, hypoxia/hypercarbia, acidaemia, sepsis, anaemia, PE, tamponade, thyrotoxicosis, alcohol withdrawal.',
      'Drug causes: β-agonists (salbutamol, adrenaline, dobutamine), sympathomimetics (cocaine, amphetamines), antimuscarinics (TCAs, antihistamines, carbamazepine), caffeine, theophylline.'
    ],
    src: ['sinus-tachycardia-ecg-library'],
    rc: [
      ['Sinus tach 130 in a hypotensive patient — should you give a β-blocker to "control the rate"?', 'No. It is compensatory; find and treat the cause (volume, sepsis, PE, tamponade, bleeding).'],
      ['Which drug classes cause sinus tachycardia via an antimuscarinic effect?', 'TCAs, antihistamines, carbamazepine, atropine.']
    ]
  },
  avnrt: {
    lvl: 2,
    bl: 'Regular narrow tachycardia with no visible P (or a pseudo-r′ in V1 / pseudo-S in II) = typical AVNRT; it lives inside the AV node, so vagal manoeuvres and adenosine terminate it.',
    lp: [
      'AVNRT is the commonest cause of palpitations in a structurally normal heart; about 75% of patients are women.',
      'Rate is typically 140–280 bpm. Triggers include exertion, caffeine, alcohol, salbutamol and sympathomimetics.',
      'Two functional pathways: slow (α) conducts slowly with a SHORT refractory period; fast (β) conducts quickly with a LONG refractory period. A well-timed PAC blocks in the fast pathway, goes down the slow one and returns up the fast one.',
      'AVNRT is a functional circuit inside the node; AVRT uses an anatomical circuit (accessory pathway). That is why RP is shorter in AVNRT.'
    ],
    src: ['supraventricular-tachycardia-svt-ecg-library'],
    rc: [
      ['Slow vs fast pathway: which has the long refractory period?', 'The fast (β) pathway — so a premature beat blocks there and goes down the slow pathway.'],
      ['What is the RP interval in typical AVNRT?', 'Very short (< 70 ms): P′ is buried in or just after the QRS (pseudo-r′ in V1, pseudo-S in inferior leads).']
    ]
  },
  atypical_avnrt: {
    lvl: 3,
    bl: 'A long-RP narrow tachycardia has three main causes — sinus/atrial tachycardia, atypical AVNRT and PJRT; adenosine response helps separate them.',
    lp: [
      'In atypical (fast–slow) AVNRT the retrograde limb is the slow pathway, so the retrograde P′ appears late (RP > PR) and is inverted in II, III, aVF.',
      'Termination with a P′ (last event is an atrial beat) argues against atrial tachycardia; termination with a QRS is non-discriminatory.',
      'Classify SVTs by site of origin and regularity, not QRS width — width is changed by bundle-branch block, rate-related aberrancy or an accessory pathway.'
    ],
    src: ['supraventricular-tachycardia-svt-ecg-library'],
    rc: [
      ['Name three causes of a long-RP tachycardia.', 'Sinus / focal atrial tachycardia, atypical (fast–slow) AVNRT, PJRT (slow-conducting accessory pathway).'],
      ['Why is QRS width a poor way to classify SVT?', 'Pre-existing BBB, rate-related aberrancy or an accessory pathway can widen any SVT.']
    ]
  },
  ortho_avrt: {
    lvl: 3,
    bl: 'Orthodromic AVRT: down the AV node, back up an accessory pathway — narrow QRS, P′ visible in the ST segment (RP > 70 ms), and no delta wave during tachycardia.',
    lp: [
      'It can occur with a concealed pathway (retrograde-only), so the resting sinus ECG may be completely normal.',
      'RP > 70 ms separates it from typical AVNRT: look for a notch at the start of the T wave in V1.',
      'QRS alternans (beat-to-beat variation with normal amplitude) occurs in AVRT/AVNRT and is not the electrical alternans of a pericardial effusion.',
      'Any AV-nodal blocker carries a small risk of triggering AF in a patient with an accessory pathway; LITFL suggests observing for ≥ 4 h if verapamil is used.'
    ],
    src: ['atrioventricular-re-entry-tachycardia-avrt'],
    rc: [
      ['Normal sinus ECG, recurrent narrow regular SVT with RP 110 ms — can this be WPW-related?', 'Yes: orthodromic AVRT via a concealed (retrograde-only) accessory pathway.'],
      ['How do QRS alternans in SVT differ from electrical alternans of tamponade?', 'In SVT the amplitude is normal and it is rate-related; in tamponade the voltages are low with sinus tachycardia.']
    ]
  },
  anti_avrt: {
    lvl: 3,
    bl: 'Antidromic AVRT is a regular wide-complex tachycardia that looks like VT — so treat it as VT unless you have proof.',
    lp: [
      'Anterograde conduction is down the accessory pathway, so the ventricles are maximally pre-excited and the QRS is wide.',
      'It is usually triggered by a PAC or PVC.',
      'Pre-excitation features (short PR, delta wave) disappear during the tachycardia, so the diagnosis is often made only after conversion.'
    ],
    src: ['atrioventricular-re-entry-tachycardia-avrt', 'vt-versus-svt-ecg-library'],
    rc: [
      ['A regular WCT in a young patient with known WPW — safest assumption?', 'Treat as VT: synchronised cardioversion if unstable, procainamide if stable; avoid AV-nodal blockers.'],
      ['Why is the QRS wide in antidromic AVRT?', 'The ventricles are activated entirely through the accessory pathway (maximal pre-excitation).']
    ]
  },
  preexcited_afib: {
    lvl: 3,
    bl: 'Fast, Broad, Irregular (FBI) = AF down an accessory pathway; AV-nodal blockers can push it into VF — cardiovert or give procainamide.',
    lp: [
      'AF occurs in ~20% and atrial flutter in ~7% of patients with a WPW pattern.',
      'Rates exceed 200 bpm and reach ~300 bpm in places — faster than the AV node could conduct.',
      'QRS morphology varies subtly beat to beat but the axis stays stable, unlike polymorphic VT.',
      'Why blockers are lethal: normally AV-nodal and pathway wavefronts fuse, and the AV node acts as a brake. Block the node and every impulse goes down the pathway (whose refractory period is shorter).',
      'Procainamide (class I) acts on the pathway with no AV-nodal effect and can both slow and revert. Flutter with WPW is regular and is easily mistaken for VT.'
    ],
    src: ['atrial-fibrillation-in-pre-excitation'],
    rc: [
      ['Pre-excited AF vs polymorphic VT: one discriminating feature?', 'In pre-excited AF the axis stays stable while width varies; polymorphic VT changes axis.'],
      ['Why does adenosine make pre-excited AF worse?', 'It removes the AV-nodal "brake" (fusion), funnelling every impulse down the short-refractory pathway → faster rate → VF.']
    ]
  },
  focal_at: {
    lvl: 3,
    bl: 'One ectopic atrial focus: identical abnormal P waves with an isoelectric baseline between them (unlike flutter); "PAT with block" means digoxin until proven otherwise.',
    lp: [
      'Focal AT, atrial flutter and MAT are all "atrial tachycardias", and they are managed differently, so naming the right one matters.',
      'Isoelectric baseline between P′ waves separates focal AT from flutter.',
      'AV block during AT is usually a physiological response to a fast atrial rate; with digoxin toxicity the block is vagotonic and the ventricular rate is slow.',
      'Sustained incessant AT can cause tachycardia-induced cardiomyopathy, and that is reversible.',
      'Adenosine response varies: some focal ATs (especially reentrant / triggered) terminate, while others show only transient AV block with persisting P′ waves.'
    ],
    src: ['atrial-tachycardia-ecg-library'],
    rc: [
      ['Atrial tachycardia vs flutter on one lead?', 'AT has an isoelectric baseline between P′ waves; flutter has continuous undulation.'],
      ['Atrial tachycardia with 2:1 block in an elderly patient on a cardiac glycoside — diagnosis?', 'Digoxin toxicity ("PAT with block").']
    ]
  },
  mat: {
    lvl: 3,
    bl: 'Three or more P-wave shapes, irregular, rate > 100, isoelectric baseline — treat the lungs, magnesium and potassium, not the rhythm.',
    lp: [
      'MAT is typically a transitional rhythm between frequent PACs and atrial flutter/fibrillation.',
      'There is no single dominant atrial pacemaker (that would be sinus rhythm with frequent PACs).',
      'Drivers: RA dilatation (cor pulmonale), sympathetic drive, hypoxia/hypercarbia, β-agonists, theophylline, hypokalaemia/hypomagnesaemia.',
      'MAT in acute illness carries ~60% in-hospital mortality, but patients die of the underlying illness, not the arrhythmia.'
    ],
    src: ['multifocal-atrial-tachycardia-mat-ecg-library'],
    rc: [
      ['Minimum criteria for MAT?', 'Rate > 100, ≥ 3 distinct P-wave morphologies in one lead, irregular PP/PR/RR, isoelectric baseline.'],
      ['Why doesn\'t DC cardioversion work for MAT?', 'It is an automatic (not re-entrant) rhythm driven by a metabolic/respiratory milieu.']
    ]
  },
  flutter: {
    lvl: 2,
    bl: 'Any regular narrow tachycardia at ~150 bpm is 2:1 flutter until you have hunted for the second flutter wave.',
    lp: [
      'Features: regular atrial activity at ~300 bpm (range 200–400), loss of the isoelectric baseline, inverted sawtooth flutter waves in II, III, aVF and upright flutter waves in V1 that can look like P waves.',
      'That pattern is anticlockwise (typical) re-entry around the right atrium, which is 90% of flutter. The atrial rate is predictable because the circuit length matches RA size.',
      'Ventricular rate = atrial rate ÷ ratio: 2:1 ≈ 150, 3:1 ≈ 100, 4:1 ≈ 75. Variable conduction (alternating 2:1, 3:1, 4:1) makes it irregular and can mimic AF.',
      '"Block" in flutter is a misnomer: it is the normal AV node protecting the ventricles. 1:1 conduction (sympathetic surge, accessory pathway, AV-nodal blockers in WPW) causes severe instability and can degenerate to VF.',
      'Stroke risk and anticoagulation follow the same rules as AF.'
    ],
    src: ['atrial-flutter-ecg-library'],
    rc: [
      ['Ventricular rate 150, regular, narrow — top three diagnoses?', 'Atrial flutter 2:1, AVNRT/AVRT, sinus tachycardia (and focal AT).'],
      ['Why give an AV-nodal blocker before flecainide in flutter?', 'IC drugs slow the flutter rate and can allow 1:1 AV conduction with very fast ventricular rates.'],
      ['Which flutter-wave polarity in II/III/aVF and V1 marks typical (anticlockwise) flutter?', 'Negative sawtooth inferiorly and positive flutter waves in V1.']
    ]
  },
  afib: {
    lvl: 2,
    bl: 'Irregularly irregular with no P waves and no isoelectric baseline is AF; the next questions are stability, rate, rhythm strategy and stroke prevention.',
    lp: [
      'AF is the commonest sustained arrhythmia, with a lifetime risk of about 25% after age 40.',
      'f-waves can be fine (< 0.5 mm) or coarse (> 0.5 mm). Coarse f-waves can mimic P waves or flutter.',
      'Typical ventricular response is 110–160. "Slow AF" (< 60) suggests hypothermia, digoxin toxicity, AV-nodal drugs or conduction disease.',
      'Wide beats in AF are often Ashman phenomenon (long–short cycle, RBBB morphology), not PVCs.',
      'AF needs a trigger (often pulmonary-vein foci) and a substrate (a dilated LA). Sinus-node dysfunction and AF frequently coexist.'
    ],
    src: ['atrial-fibrillation-ecg-library'],
    rc: [
      ['AF with a ventricular rate of 45 and no AV-nodal drugs — what three things do you check?', 'Temperature (hypothermia), digoxin level/toxicity, and conduction-system disease (consider pacing).'],
      ['Coarse f-waves in V1 regular at ~300 — AF or flutter?', 'If regular and uniform, flutter (or "fib-flutter"); AF f-waves vary in timing and shape.']
    ]
  },
  pvc: {
    lvl: 2,
    bl: 'Premature, wide, bizarre, no preceding P, discordant ST-T, full compensatory pause; QRS morphology tells you where it came from.',
    lp: [
      'RV-origin PVCs have LBBB morphology (dominant S in V1); LV-origin PVCs have RBBB morphology (dominant R in V1).',
      'Appropriate discordance: ST/T opposite to the main QRS vector is expected after abnormal depolarisation.',
      '"Frequent" means > 5 PVCs per minute on a resting ECG, or > 10–30 per hour on ambulatory monitoring.',
      'Retrograde atrial capture shows as an inverted P after the PVC. Patterns: bigeminy, trigeminy, couplets; ≥ 3 in a row is NSVT.'
    ],
    src: ['premature-ventricular-complex-pvc-ecg-library'],
    rc: [
      ['PVC with a dominant R in V1 — RV or LV origin?', 'LV origin (RBBB morphology).'],
      ['Define a full compensatory pause.', 'The R–R spanning the PVC equals twice the baseline R–R (the sinus node is not reset).']
    ]
  },
  vt: {
    lvl: 2,
    bl: 'A regular wide-complex tachycardia is VT until proven otherwise; AV dissociation, capture and fusion beats prove it, and a history of MI makes it overwhelmingly likely.',
    lp: [
      'Features favouring VT: QRS > 160 ms, no typical RBBB/LBBB morphology, north-west axis (positive aVR, negative I and aVF), AV dissociation, capture and fusion beats, precordial concordance.',
      'Brugada sign: RS interval (R onset to S nadir) > 100 ms. Josephson sign: notching near the S-wave nadir.',
      'An RSR′ with a taller LEFT rabbit ear is the most specific single finding for VT (in RBBB the right ear is taller).',
      'Clinical factors: age > 35 (PPV ~85%), structural/ischaemic heart disease, prior MI, family history of sudden death.',
      'SVT with aberrancy is favoured only by an identical BBB morphology on an old ECG, known WPW, or prior adenosine-terminated episodes.',
      'Sustained = > 30 s or needing intervention; non-sustained = ≥ 3 beats ending within 30 s.'
    ],
    src: ['ventricular-tachycardia-monomorphic-ecg-library', 'vt-versus-svt-ecg-library'],
    rc: [
      ['Most specific single morphology clue for VT in an RBBB-like WCT?', 'Taller left rabbit ear (Rsr′) in V1.'],
      ['Three non-arrhythmic things that widen the QRS of an SVT?', 'Hyperkalaemia, sodium-channel-blocker toxicity, severe acidosis.']
    ]
  },
  torsades: {
    lvl: 2,
    bl: 'Polymorphic VT plus a long QT = torsades: magnesium, remove QT drugs, raise K+, speed the heart up. Polymorphic VT with a normal QT is ischaemia until proven otherwise.',
    lp: [
      'Diagnosing TdP requires both polymorphic VT and QT prolongation. The commonest cause of polymorphic VT overall is myocardial ischaemia.',
      'Mechanism: long repolarisation leads to early after-depolarisations (seen as giant T-U waves), then an R-on-T PVC triggers TdP. Onset is often "pause-dependent" (short–long–short).',
      'Bigeminy in a patient with long QT, or giant T-U waves, can herald TdP. Runs > 220 bpm last longer and degenerate to VF more often.',
      'In poisoning, TdP risk is better predicted by plotting the absolute QT against heart rate (QT nomogram) than by QTc.',
      'Magnesium dosing: 2 g IV pushed in arrest; in a patient with a pulse give it over ~5–15 min.'
    ],
    src: ['polymorphic-vt-and-torsades-de-pointes-tdp'],
    rc: [
      ['In an overdose, which QT measure best predicts TdP risk?', 'Absolute QT plotted against heart rate on the QT nomogram.'],
      ['What R–R sequence classically precedes TdP?', 'Short–long–short (pause-dependent onset).']
    ]
  },
  vf: {
    lvl: 2,
    bl: 'VF = no output: shock first and fast, high-quality CPR between shocks; adrenaline after the 2nd shock and amiodarone after the 3rd.',
    lp: [
      'Chaotic deflections at 150–500/min with no identifiable P, QRS or T.',
      'Amplitude decays with time (coarse → fine → asystole) as myocardial energy runs out, so early defibrillation matters most.',
      'Warning rhythms in ischaemia: PVCs, R-on-T, QT prolongation, VT, sinus pauses.',
      'Remember non-coronary causes: channelopathies (LQTS, Brugada), cardiomyopathy, commotio cordis, tension pneumothorax, PE, hypothermia, electrocution, and verapamil given in WPW-AF.'
    ],
    src: ['ventricular-fibrillation-vf-ecg-library'],
    rc: [
      ['When are adrenaline and amiodarone given in a shockable arrest?', 'Adrenaline 1 mg after the 2nd shock (then q3–5 min); amiodarone 300 mg after the 3rd shock (150 mg after the 5th).'],
      ['Why does fine VF predict a worse outcome?', 'It reflects prolonged ischaemia and myocardial energy depletion.']
    ]
  }
});
