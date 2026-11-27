// LEARNING LAYER — part 4 (BER, LVH, posterior, Brugada, SND, pacer malfunction, T waves, TCA, HCM, RVH, Sgarbossa, fascicles, Ashman)
Object.assign(LEARN, {
  early_repol: {
    lvl: 3,
    bl: 'Concave STE in V2–5 with a notched "fish-hook" J point, big concordant T waves, no reciprocity, in someone under 50. Never use BER to explain STE in an older patient with risk factors.',
    lp: [
      'BER appears on the ECG of 10–15% of ED chest-pain patients. It is less common after 50 and rare after 70, when STE is more likely ischaemic.',
      'Morphology: J-point elevation, an upward-concave ST segment running into a peaked, slightly asymmetric T wave whose descending limb is steeper than the ascending limb.',
      'ST/T ratio in V6 < 0.25 favours BER over pericarditis.',
      'BER is not static. It falls with sympathetic tone, exercise or tachycardia and rises with bradycardia, and it fades with age (up to 30% resolve over years).',
      'A global early-repolarisation pattern (inferolateral J waves) has been linked to idiopathic VF ("early repolarisation syndrome"), so "benign" is a description, not a promise.'
    ],
    src: ['benign-early-repolarisation-ecg-library'],
    rc: [
      ['ST elevation in V2–V4 of a 62-year-old diabetic — "probably BER"?', 'No. Avoid diagnosing BER over 50 with risk factors; treat as possible OMI and get serial ECGs.'],
      ['What happens to BER ST elevation with tachycardia?', 'It diminishes (sympathetic tone reduces it).']
    ]
  },
  lvh: {
    lvl: 2,
    bl: 'LVH voltage is specific but insensitive; the repolarisation "strain" pattern and discordant right-precordial STE are what trick you into false STEMI calls.',
    lp: [
      'There is no single accepted ECG definition. Sokolow-Lyon (SV1 + max RV5/V6 ≥ 35 mm) and Cornell (R aVL + S V3 > 28 mm men / > 20 mm women) are the most used.',
      'Non-voltage supporting features: LA enlargement, left axis deviation, discordant STE in V1–3, prominent U waves, longer R-wave peak time and lateral ST-T "strain".',
      'Causes: hypertension (commonest), aortic stenosis or regurgitation, mitral regurgitation, coarctation, HCM.',
      'A normal ECG does not exclude echo-proven LVH. Confirm anatomy with echo or MRI.',
      'In LAFB, aVL R > 11 mm may falsely meet voltage criteria; there is no strain pattern.'
    ],
    src: ['left-ventricular-hypertrophy-lvh-ecg-library'],
    rc: [
      ['Cornell voltage criterion?', 'R aVL + S V3 > 28 mm (men) or > 20 mm (women).'],
      ['Why does LVH cause STE in V1–V3?', 'Appropriate discordance to very deep S waves; judge by proportion to S depth, not absolute mm.']
    ]
  },
  post_stemi: {
    lvl: 2,
    bl: 'Horizontal STD in V1–3 with tall broad R and upright T in a chest-pain patient is posterior OMI until V7–9 prove otherwise. Only 0.5 mm STE is needed posteriorly.',
    lp: [
      'Posterior involvement accompanies 15–20% of STEMIs (usually inferior or lateral); isolated posterior MI is 5–10% and is often missed.',
      'V1–3 changes: horizontal STD, tall broad R (> 30 ms), upright T, dominant R in V2 (R/S > 1). The tall R is the "Q-wave equivalent" that develops over time.',
      'Posterior extension means a larger infarct with more LV dysfunction and death, so look for it in every inferior or lateral MI.',
      'V7 is at the posterior axillary line, V8 at the scapular tip and V9 paraspinal, all in the V6 horizontal plane. STE ≥ 0.5 mm is diagnostic.'
    ],
    src: ['posterior-myocardial-infarction-ecg-library'],
    rc: [
      ['How much STE in V7–9 confirms posterior MI?', '≥ 0.5 mm.'],
      ['What is the posterior "Q-wave equivalent" in V1–V2?', 'A tall, broad R wave (> 30 ms, R/S > 1 in V2).']
    ]
  },
  brugada: {
    lvl: 3,
    bl: 'Coved STE ≥ 2 mm in V1–3 into a negative T (Type 1) plus a clinical criterion = Brugada syndrome. The only proven therapy is an ICD; fever and Na-channel drugs unmask it.',
    lp: [
      'It is a sodium-channelopathy with high sudden-death risk in structurally normal hearts. Mean age at death is 41; it is common in Southeast Asia (SUNDS, "bangungut", "pokkuri", "lai tai").',
      'The diagnosis needs the Type 1 pattern AND one clinical criterion: documented VF/polymorphic VT, family SCD < 45, coved ECGs in relatives, inducible VT, syncope, or nocturnal agonal respiration.',
      'Type 2 (saddleback, ≥ 2 mm) and Type 3 (< 2 mm) are non-diagnostic but merit evaluation.',
      'Unmasking factors: fever, ischaemia, Na-channel blockers, CCBs, β-blockers, nitrates, α-agonists, cholinergic drugs, cocaine, alcohol, hypo- or hyperkalaemia, hypothermia, post-cardioversion.',
      'Undiagnosed mortality is estimated ~10%/yr. Admit symptomatic Type 1 patients. Quinidine is an alternative when an ICD is not possible.'
    ],
    src: ['brugada-syndrome-ecg-library'],
    rc: [
      ['Is a Type 1 Brugada pattern alone enough to diagnose Brugada syndrome?', 'No: it needs a clinical criterion (VF/PVT, syncope, family SCD < 45, nocturnal agonal breathing, inducible VT, coved ECG in relatives).'],
      ['Febrile patient with a new coved V1–V2 pattern — first actions?', 'Aggressive antipyretics, telemetry, avoid Na-channel blockers, and EP referral.']
    ]
  },
  tachy_brady: {
    lvl: 3,
    bl: 'Sinus node dysfunction is intermittent and protean; pace when symptoms and the rhythm are correlated, then rate-control the tachy phase safely.',
    lp: [
      'Intrinsic causes: idiopathic degenerative fibrosis (commonest), ischaemia, cardiomyopathy, infiltration (sarcoid, haemochromatosis), congenital. Extrinsic: digoxin, β-blockers, CCBs, autonomic dysfunction, hypothyroidism, hyperkalaemia.',
      'ECG spectrum: sinus bradycardia, non-respiratory sinus arrhythmia in the elderly, SA exit block, sinus arrest (pause > 3 s), slow AF, tachy–brady syndrome.',
      'In tachy–brady, delayed sinus recovery after a tachycardia ends causes the pause and syncope.',
      'Class I pacing: symptomatic bradycardia including symptomatic pauses (also when caused by essential drugs), and symptomatic chronotropic incompetence.'
    ],
    src: ['sinus-node-dysfunction-sick-sinus-syndrome'],
    rc: [
      ['What causes syncope in tachy–brady syndrome?', 'Prolonged sinus recovery time (pause) when a tachyarrhythmia terminates.'],
      ['Most common intrinsic cause of sinus node dysfunction?', 'Idiopathic degenerative fibrosis.']
    ]
  },
  pacer_fail: {
    lvl: 3,
    bl: 'Spike with no QRS after it = failure to capture. No spike when one was due = output failure or oversensing. They are different problems with different fixes.',
    lp: [
      'Failure to capture causes: lead displacement or fracture, raised threshold (hyperkalaemia, acidosis, MI at the tip, exit block), electrolyte disturbance.',
      'Output failure (no spike when expected) comes from oversensing, wire fracture, lead displacement or interference.',
      'If the native rate is above the lower pacing rate, no pacing is expected, so capture and output problems cannot be judged from that ECG.',
      'Pacemaker-mediated (endless-loop) tachycardia: a retrograde P is sensed and triggers V-pacing, which conducts retrogradely again. The rate is capped at the upper tracking limit. A magnet or adenosine terminates it.'
    ],
    src: ['pacemaker-malfunction-ecg-library'],
    rc: [
      ['Paced tachycardia at exactly the upper tracking rate in a DDD patient — mechanism and fix?', 'Pacemaker-mediated tachycardia (retrograde P sensed). Terminate with a magnet (or adenosine); reprogram PVARP.'],
      ['Why can\'t you assess capture when the patient is in sinus at 90 with a VVI set at 60?', 'The device is appropriately inhibited, so no paced beats are expected.']
    ]
  },
  pacer_undersense: {
    lvl: 3,
    bl: 'Too many spikes (falling inside native QRS/T) = undersensing; too few (unexplained pauses) = oversensing.',
    lp: [
      'Undersensing leads to asynchronous pacing. Causes: raised threshold at the electrode (exit block), poor lead contact, new BBB changing the sensed signal, programming.',
      'Spikes within native QRS complexes suggest undersensing. Spikes on the T wave risk R-on-T VF.',
      'Oversensing: large P or T waves, myopotentials (pectoral or rectus contraction) or lead noise are misread as native beats, so pacing is inhibited and there are pauses. Signals may not be visible on the surface ECG.'
    ],
    src: ['pacemaker-malfunction-ecg-library'],
    rc: [
      ['Pauses when the patient lifts their arms — what\'s happening?', 'Oversensing of pectoral myopotentials, which inhibits pacing.'],
      ['To fix undersensing, do you raise or lower the sensitivity number (mV)?', 'Lower the mV value, which makes the device MORE sensitive.']
    ]
  },
  hyperacute_t: {
    lvl: 3,
    bl: 'Broad-based, bulky T waves that are big relative to their QRS in a coronary territory are the earliest sign of occlusion; repeat the ECG in 10–15 minutes.',
    lp: [
      'Normal T is upright everywhere except aVR and V1, < 5 mm in limb leads and < 10 mm in precordial leads.',
      'Judge a T wave against its own QRS: a "normal-sized" T after a small QRS can be hyperacute.',
      'Loss of precordial T-wave balance (T in V1 taller than T in V6), especially if new, implies acute ischaemia, often LAD.',
      'Hyperacute T waves also occur in Prinzmetal (vasospastic) angina.',
      'Hyperkalaemia T waves are narrow-based, peaked and symmetric; hyperacute ischaemic T waves are broad-based and voluminous.'
    ],
    src: ['t-wave-ecg-library', 'myocardial-ischaemia-ecg-library'],
    rc: [
      ['T in V1 taller than T in V6 in a chest-pain patient — significance?', 'Loss of precordial T-wave balance: suspect acute (LAD) ischaemia, a form of hyperacute T.'],
      ['Narrow-based symmetric peaked T vs broad bulky T — which is ischaemic?', 'Broad bulky = hyperacute ischaemic; narrow peaked = hyperkalaemia.']
    ]
  },
  tca_tox: {
    lvl: 3,
    bl: 'Sinus tachycardia + QRS > 100 ms + terminal R in aVR > 3 mm in an overdose = sodium-channel blockade. Give bicarbonate and alkalinise, and avoid class Ia/Ic drugs and amiodarone.',
    lp: [
      'ECG features: QRS > 100 ms in lead II, terminal R > 3 mm or R/S > 0.7 in aVR, sinus tachycardia (M1 blockade), QT prolongation. The right-sided conducting system is the most sensitive, which explains the terminal rightward shift.',
      'QRS > 100 ms predicts seizures; QRS > 160 ms predicts ventricular arrhythmias.',
      'Other sodium-channel blockers: class Ia/Ic antiarrhythmics, local anaesthetics (bupivacaine), chloroquine and hydroxychloroquine, propranolol, carbamazepine, quinine, dextropropoxyphene.',
      'Get an ECG for every deliberate self-poisoning or unexplained reduced GCS. TCAs cause rapid (1–2 h) coma, seizures, hypotension and wide-complex dysrhythmias.',
      'Management: NaHCO3 boluses, early intubation with hyperventilation to pH 7.50–7.55, charcoal once the airway is secure, benzodiazepines for seizures, noradrenaline for refractory hypotension. Lidocaine is third-line once pH > 7.5.'
    ],
    src: ['tricyclic-overdose-sodium-channel-blocker-toxicity'],
    rc: [
      ['Which QRS widths predict seizures vs VT in TCA overdose?', '> 100 ms predicts seizures; > 160 ms predicts ventricular arrhythmias.'],
      ['Target pH during TCA toxicity treatment?', '7.50–7.55 (bicarbonate + hyperventilation if intubated).']
    ]
  },
  hocm: {
    lvl: 3,
    bl: 'LVH voltage with deep NARROW "dagger" Q waves laterally in a young person (± giant TWI in apical HCM) is HCM, the commonest cause of sudden death in the young.',
    lp: [
      'HCM Q waves are < 40 ms (infarct Q waves are > 40 ms) and are more often lateral than inferior.',
      'Associations: LA enlargement (P mitrale), WPW in up to a third in one series, AF/SVT/PVCs/VT, and giant precordial TWI in apical HCM.',
      'Prevalence ~1 in 500, annual mortality ~1–2%. Autosomal dominant sarcomeric mutations (β-myosin heavy chain, troponin T; > 150 mutations).',
      'Most cases (~75%) have no LVOT obstruction, hence "HCM" rather than "HOCM". Patterns: asymmetric septal (classic, with SAM), concentric (~20%), apical (~10%).',
      'Arrhythmia substrate is myocyte "cellular disarray" plus abnormal small intramural coronaries.'
    ],
    src: ['hypertrophic-cardiomyopathy-hcm-ecg-library'],
    rc: [
      ['Q wave 30 ms deep in V5–V6 with tall R waves in a 19-year-old — MI or HCM?', 'HCM (narrow septal "dagger" Q < 40 ms with preserved R waves).'],
      ['What proportion of HCM has LVOT obstruction?', 'About 25%; most (~75%) are non-obstructive.']
    ]
  },
  rvh: {
    lvl: 3,
    bl: 'RAD ≥ +110°, dominant R in V1 and dominant S in V5–6 with a narrow QRS = RVH. Add RV strain and P pulmonale for confidence.',
    lp: [
      'Diagnostic criteria: RAD ≥ +110°, R in V1 > 7 mm or R/S > 1, S in V5/V6 > 7 mm or R/S < 1, QRS < 120 ms.',
      'Supporting criteria: P pulmonale, RV strain (STD/TWI V1–4 and II, III, aVF), S1S2S3 pattern, deep lateral S waves. Incomplete or complete RBBB is common.',
      'With RBBB there are no validated voltage criteria; tall R in V1 + RAD ≥ +110° + supporting features suggests RVH.',
      'Causes: pulmonary hypertension, mitral stenosis, PE, chronic lung disease, congenital disease (Fallot, pulmonary stenosis), ARVC.'
    ],
    src: ['right-ventricular-hypertrophy-rvh-ecg-library', 'right-atrial-enlargement-ecg-library'],
    rc: [
      ['Four main RVH criteria?', 'RAD ≥ +110°, dominant R in V1 (> 7 mm or R/S > 1), dominant S in V5–6, QRS < 120 ms.'],
      ['Tall R in V1 — name five causes.', 'RBBB, RVH, posterior MI, WPW (left-sided pathway), HCM. Also dextrocardia, lead misplacement, normal child, Duchenne.']
    ]
  },
  sgarbossa_stemi: {
    lvl: 3,
    bl: 'In LBBB or RV pacing, ischaemia shows as concordance or as excessive discordance measured as a proportion: STE ≥ 25% of the preceding S depth.',
    lp: [
      'Smith-modified rules (any one): concordant STE ≥ 1 mm in ≥ 1 lead; concordant STD ≥ 1 mm in ≥ 1 of V1–3; discordant STE ≥ 1 mm that is ≥ 25% of the preceding S-wave depth.',
      'Original Sgarbossa (1996) scoring: concordant STE 5, concordant STD V1–3 3, discordant STE > 5 mm 2. Score ≥ 3 is ~90% specific but only ~36% sensitive.',
      'The 5 mm cut-off was arbitrary. High-voltage LBBB often exceeds 5 mm without ischaemia, so the Smith proportional rule improves accuracy (derived 2012, validated 2015).',
      'The same rules apply to RV-paced rhythms (slightly less specific). Serial ECGs showing dynamic change add power.'
    ],
    src: ['sgarbossa-criteria-ecg-library'],
    rc: [
      ['LBBB, V2: S wave 20 mm, STE 4 mm — positive?', 'No: ratio 4/20 = 20% (< 25%). At 5 mm or more (≥ 25%) it would be positive.'],
      ['Sensitivity of the original Sgarbossa score ≥ 3?', 'Only ~36%, although ~90% specific.']
    ]
  },
  lafb: {
    lvl: 2,
    bl: 'Left axis −45° to −90° with qR in I/aVL and rS in II/III/aVF, and a near-normal QRS width = LAFB. It is the commonest cause of marked LAD.',
    lp: [
      'Criteria: LAD (usually −45 to −90°), qR in I and aVL, rS in II, III, aVF, and R-wave peak time in aVL > 45 ms.',
      'Mechanism: the LV is activated via the posterior fascicle, so the initial vector goes down and right (small r inferiorly, small q laterally) and the main vector goes up and left.',
      'The ~20 ms delay leaves the QRS normal or slightly prolonged (80–110 ms) and can raise limb-lead voltage.',
      'Trap: aVL R > 11 mm may meet LVH voltage criteria in LAFB, but there is no strain pattern.'
    ],
    src: ['left-anterior-fascicular-block-lafb-ecg-library', 'left-axis-deviation-lad-ecg-library'],
    rc: [
      ['Which timing criterion supports LAFB?', 'R-wave peak time in aVL > 45 ms.'],
      ['Why are there small r waves in the inferior leads in LAFB?', 'Initial activation via the posterior fascicle is directed inferiorly and rightward.']
    ]
  },
  bifascicular: {
    lvl: 3,
    bl: 'RBBB + LAFB (or RBBB + LPFB) leaves one fascicle. Asymptomatic, it progresses ~1%/yr; with syncope ~17%/yr, so admit and pace if no other cause is found.',
    lp: [
      'RBBB + LAFB is commoner because the anterior fascicle has a single (LAD) supply. RBBB + LPFB (dual supply) implies more extensive disease.',
      'It is associated with structural heart disease in 50–80% and IHD in 40–60%. Also AS, anterior MI (5–7% of AMI), Lenègre–Lev, congenital disease, hyperkalaemia (reversible).',
      'Progression to CHB is 1–4%/yr overall, ~1%/yr if asymptomatic and ~17%/yr after syncope.',
      'NEW bifascicular block with chest pain is highly associated with proximal LAD occlusion; in ~30% it is the only acute ECG sign (no STE).',
      'Before calling RBBB + LPFB, exclude other causes of RAD (e.g., RVH). Masquerading BBB (RBBB in V1 with LBBB-like limb leads) carries a worse prognosis.'
    ],
    src: ['bifascicular-block-ecg-library', 'trifascicular-block-ecg-library', 'masquerading-bundle-branch-block-mbbb'],
    rc: [
      ['Annual risk of CHB in bifascicular block with syncope?', 'About 17% per year.'],
      ['Chest pain + new RBBB + LAFB, no STE — risk?', 'Proximal LAD occlusion. Treat as OMI.']
    ]
  },
  pac_aberrant: {
    lvl: 3,
    bl: 'A wide beat that ends a short cycle after a long cycle, with RBBB morphology and an unchanged initial vector, is Ashman aberrancy, not a PVC.',
    lp: [
      'Refractoriness of the His-Purkinje system scales with the preceding R–R: a long cycle lengthens it, so an early beat finds the right bundle (longer refractory period) still refractory.',
      'Fisch criteria: long cycle before the aberrant beat, RBBB-form aberrancy with normal initial vector, irregular coupling, short–long–short sequences more likely, no fully compensatory pause.',
      'It is typical in AF but occurs in any SVT, and is asymptomatic with no treatment needed.',
      'PACs reset the sinus node, so the pause is not fully compensatory, unlike most PVCs.'
    ],
    src: ['ashman-phenomenon', 'premature-atrial-complex-pac'],
    rc: [
      ['Why RBBB morphology in Ashman beats?', 'The right bundle normally has a longer refractory period than the left.'],
      ['Wide beat in AF after a long–short cycle, RBBB morphology, normal initial vector — label?', 'Ashman phenomenon (aberrant conduction).']
    ]
  }
});
