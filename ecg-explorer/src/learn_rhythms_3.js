// LEARNING LAYER — part 3 (Wellens, electrolytes, PE, effusion, hypothermia, ICP, digoxin, pericarditis)
Object.assign(LEARN, {
  wellens: {
    lvl: 3,
    bl: 'Pain-free patient with biphasic or deep T inversion in V2–3 = critical proximal LAD stenosis that has reperfused. Arrange angiography, not a stress test.',
    lp: [
      'Rhinehart criteria: deep or biphasic TWI in V2–3 (may extend V1–6), pain-free when recorded, ST isoelectric or < 1 mm, NO precordial Q waves, PRESERVED R-wave progression, recent angina, normal or slightly raised markers.',
      'Type A (biphasic, up then down) ~25%; Type B (deep symmetric inversion) ~75%. Type A can evolve into Type B over time.',
      'Sequence: transient LAD occlusion (often missed), reperfusion with pain resolving and T waves turning biphasic or inverted (identical to post-PCI reperfusion T waves), then T waves deepen if the artery stays open.',
      'Re-occlusion first shows as "pseudo-normalisation": T waves flip upright and become hyperacute, sometimes before pain returns. A "stuttering" course alternates the two patterns.',
      'This is why every chest-pain patient needs serial ECGs. The same reperfusion T-wave sequence occurs in other territories.'
    ],
    src: ['wellens-syndrome-ecg-library'],
    rc: [
      ['Wellens patient: T waves in V2–3 become upright again with recurrent pain — meaning?', 'Pseudo-normalisation = LAD re-occlusion (hyperacute phase). Treat as OMI and go to the cath lab.'],
      ['Two "negative" Rhinehart criteria that separate Wellens from completed anterior MI?', 'No precordial Q waves and preserved R-wave progression.']
    ]
  },
  hyperk: {
    lvl: 2,
    bl: 'Peaked T, then P flattening and PR prolongation, then QRS widening, then a sine wave. The ECG can stay quiet until arrest, so treat the potassium level and the clinical context, not just the trace.',
    lp: [
      'Hyperkalaemia is K+ > 5.2 mmol/L; ECG changes usually start at ≥ 6.0. The earliest sign is increased T-wave amplitude.',
      'Order of changes follows the trace backwards: T wave first, then P wave/PR, then QRS widening and conduction blocks.',
      'Bradyarrhythmias are common and under-recognised: sinus bradycardia, high-grade AV block with slow escape, slow AF, bundle-branch and fascicular blocks.',
      'Above ~9 mmol/L: sine wave, VF, wide-complex PEA, asystole. A near-normal ECG does NOT exclude imminent arrest.',
      '"Push–pull": hypokalaemia pushes the T wave down (flat T, STD, U waves); hyperkalaemia pulls it up (tented T) and stretches the rest of the complex.',
      'Suspect it in any new bradycardia or AV block in renal failure or dialysis, or with ACE inhibitor + potassium-sparing diuretic + supplements. In bradycardic PEA, treat empirically.'
    ],
    src: ['hyperkalaemia-ecg-library'],
    rc: [
      ['Dialysis patient, new junctional bradycardia at 38 with wide QRS — first drug?', 'IV calcium (membrane stabilisation), then shift (insulin/glucose, salbutamol) and remove K+.'],
      ['Earliest ECG sign of hyperkalaemia?', 'Increased T-wave amplitude (peaked, narrow-based T).']
    ]
  },
  hypok: {
    lvl: 2,
    bl: 'Flat T, ST depression and a prominent U wave (best in V2–3) giving a long "QU". Replace K+ to ≥ 4.0 and Mg2+ to ≥ 1.0 mmol/L in anyone with arrhythmia.',
    lp: [
      'Hypokalaemia is K+ < 3.5; ECG changes usually appear at 2.5–2.9 mmol/L. The earliest sign is reduced T-wave amplitude.',
      'Other features: increased P amplitude, PR prolongation, widespread STD with T flattening/inversion, prominent U waves, and apparent QT prolongation from T–U fusion (long QU).',
      'Arrhythmias: frequent ectopy, AF/flutter/AT, then VT, VF and TdP.',
      'It is often accompanied by hypomagnesaemia, which multiplies ventricular arrhythmia risk. Check both in any arrhythmia.'
    ],
    src: ['hypokalaemia-ecg-library'],
    rc: [
      ['Target K+ and Mg2+ in CCU/ICU patients with arrhythmia?', 'K+ ≥ 4.0 mmol/L and Mg2+ ≥ 1.0 mmol/L.'],
      ['Where are U waves best seen?', 'Precordial leads V2–V3.']
    ]
  },
  hypoca: {
    lvl: 2,
    bl: 'Long QTc from a long, flat ST segment with a normal T wave. Calcium stretches the plateau; potassium changes the T.',
    lp: [
      'QTc prolongation comes mainly from ST-segment lengthening; T-wave morphology is typically unchanged.',
      'Arrhythmias are uncommon. AF has been reported, and TdP occurs but much less often than with low K+ or Mg2+.',
      'Ranges: normal corrected Ca 2.2–2.6, mild–moderate 1.9–2.2, severe < 1.9 mmol/L.',
      'Causes include hypoparathyroidism, vitamin D deficiency, pancreatitis, hyperphosphataemia, hypomagnesaemia, loop diuretics, DiGeorge, sepsis, and factitious EDTA contamination.'
    ],
    src: ['hypocalcaemia-ecg-library'],
    rc: [
      ['Long QT with a long flat ST but normal T, versus long QT with a broad T-U — which is which?', 'Long flat ST = hypocalcaemia; flat T with prominent U (long QU) = hypokalaemia.'],
      ['A "hypocalcaemia" result from a blood sample drawn into a purple-top tube — think?', 'Factitious hypocalcaemia from EDTA contamination.']
    ]
  },
  hyperca: {
    lvl: 3,
    bl: 'Short QT with the T wave springing straight off the QRS. Severe cases can produce Osborn waves or STE mimicking STEMI.',
    lp: [
      'The main abnormality is QT shortening. Severe hypercalcaemia can show J (Osborn) waves; extreme levels cause ventricular irritability and VF.',
      'Ranges: mild 2.7–2.9, moderate 3.0–3.4, severe > 3.4 mmol/L.',
      'Causes: primary or tertiary hyperparathyroidism, myeloma, bone metastases, paraneoplastic PTHrP, milk-alkali syndrome, sarcoidosis, vitamin D excess.'
    ],
    src: ['hypercalcaemia-ecg-library'],
    rc: [
      ['Name three causes of J (Osborn) waves.', 'Hypothermia, severe hypercalcaemia, and early-repolarisation / J-wave syndromes (also Brugada, raised ICP).'],
      ['Short QT on the ECG — two metabolic or drug causes?', 'Hypercalcaemia and digoxin effect (also congenital short QT syndrome).']
    ]
  },
  pe_s1q3t3: {
    lvl: 2,
    bl: 'The commonest ECG in PE is sinus tachycardia. The most specific is T inversion in BOTH the right precordial (V1–4) AND inferior leads. S1Q3T3 is neither sensitive nor specific.',
    lp: [
      'Frequencies in PE: sinus tachycardia 44%, non-specific ST/T change 50%, RV strain TWI 34%, S1Q3T3 20%, RBBB 18%, RAD 16%, P pulmonale 9%, atrial tachyarrhythmias 8%.',
      'Simultaneous TWI in inferior AND right precordial leads has specificity up to 99%. Kosuge: negative T in BOTH III and V1 occurred in 88% of PE vs 1% of ACS (sens 88%, spec 99%).',
      'Other RV-dilatation signs: dominant R in V1, clockwise rotation (persistent S in V6), and extreme RAD that can masquerade as "pseudo left axis".',
      'The same pattern appears with any acute pulmonary hypertension, including hypoxic vasoconstriction.',
      'ACS is rarely tachycardic; bedside echo (RV dilatation) helps separate PE from anterior ACS when both raise troponin.'
    ],
    src: ['ecg-changes-in-pulmonary-embolism', 'right-ventricular-strain-ecg-library'],
    rc: [
      ['Anterior TWI V1–V4: PE or Wellens/ACS? Which single extra lead helps?', 'Lead III: TWI in both III and V1 strongly favours PE (spec ~99%).'],
      ['Most common ECG abnormality in PE?', 'Sinus tachycardia (~44%).']
    ]
  },
  tamponade: {
    lvl: 2,
    bl: 'Low voltage + tachycardia + electrical alternans = massive effusion; look for tamponade at the bedside now.',
    lp: [
      'Electrical alternans means consecutive, normally conducted QRS complexes alternating in height as the heart swings in a large effusion.',
      'Low voltage: QRS < 5 mm in all limb leads or < 10 mm in all precordial leads. Causes beyond effusion include obesity, COPD, hypothyroidism, infiltrative disease and pneumothorax.',
      'Any patient with this triad needs immediate clinical and echocardiographic assessment for tamponade.'
    ],
    src: ['ecg-findings-in-massive-pericardial-effusion', 'low-qrs-voltage-ecg-library'],
    rc: [
      ['Triad of massive pericardial effusion on ECG?', 'Low QRS voltage, sinus tachycardia, electrical alternans.'],
      ['Alternans with NORMAL voltage during a regular SVT — tamponade?', 'Usually not: rate-related QRS alternans is common in AVRT/AVNRT.']
    ]
  },
  hypothermia: {
    lvl: 3,
    bl: 'Bradycardia, J (Osborn) waves that grow as the temperature falls, prolonged intervals and shivering artefact. The cold heart is irritable, so handle gently.',
    lp: [
      'Grades: mild 32–35 °C, moderate 29–32 °C, severe < 29 °C.',
      'Bradyarrhythmias: marked sinus bradycardia, slow AF, slow junctional rhythm, any degree of AV block.',
      'The Osborn wave is a positive deflection at the J point (negative in aVR and V1), usually most prominent in the precordial leads, with height roughly proportional to the degree of hypothermia.',
      'PR, QRS and QT all lengthen. Arrest rhythms are VT, VF and asystole.',
      'Shivering artefact (baseline "fuzziness") is not specific to hypothermia; Parkinsonian tremor does the same.'
    ],
    src: ['hypothermia-ecg-library'],
    rc: [
      ['Osborn wave polarity in aVR and V1?', 'Negative (it is positive in most other leads).'],
      ['Moderate hypothermia range?', '29–32 °C.']
    ]
  },
  cerebral_t: {
    lvl: 3,
    bl: 'Giant widespread T inversion with a long QT, especially with bradycardia, should make you image the head before you anticoagulate.',
    lp: [
      'Core triad: widespread giant TWI ("cerebral T waves"), QT prolongation, and bradycardia (Cushing reflex, signalling imminent herniation).',
      'Also seen: ST elevation or depression mimicking ischaemia or pericarditis, large U waves, sinus tachycardia, junctional rhythm, PVCs, AF.',
      'There may be regional wall-motion abnormality on echo ("neurogenic stunned myocardium").',
      'Most often seen in SAH (72% in one series) and intraparenchymal haemorrhage (57%). Also massive MCA stroke with oedema, TBI and, rarely, metastases.'
    ],
    src: ['raised-intracranial-pressure-ecg-library'],
    rc: [
      ['Giant TWI + long QT + headache + bradycardia — first test?', 'Non-contrast CT head (before antiplatelets or anticoagulation).'],
      ['What does bradycardia signify in raised ICP?', 'The Cushing reflex, a sign of imminent brainstem herniation.']
    ]
  },
  digoxin: {
    lvl: 3,
    bl: 'Scooped ST ("reverse tick") means the patient is taking digoxin. Toxicity is a rhythm diagnosis: increased automaticity plus AV block, and PVCs are the commonest sign.',
    lp: [
      'Digoxin effect: downsloping "reverse tick" ST depression, flat, inverted or biphasic T (often initially negative, terminally positive), short QT. Also mild PR prolongation (≤ 240 ms), prominent U waves and J-point depression in tall-R leads.',
      'Effect mechanisms: shorter atrial and ventricular refractory periods (short QT, repolarisation changes) plus vagal AV-nodal effect (longer PR).',
      'Toxicity signature: SVT from increased automaticity with a slow ventricular response from AV block (e.g., atrial tachycardia with block).',
      'Commonest toxic rhythm is frequent PVCs (bigeminy, trigeminy). Others: sinus bradycardia, slow AF, any AV block, regularised AF (AF + CHB with escape), VT including bidirectional VT.',
      'Clinical clues: GI upset, visual change (yellow-green, haloes), confusion and delirium, especially in the elderly or after a renal decline.'
    ],
    src: ['digoxin-effect-ecg-library', 'digoxin-toxicity-ecg-library'],
    rc: [
      ['Most common ECG abnormality in digoxin toxicity?', 'Frequent PVCs (including bigeminy).'],
      ['AF with a sudden regular slow ventricular rate in a patient on digoxin — diagnosis?', '"Regularised AF": AF with complete heart block and a junctional/ventricular escape. This is toxicity.']
    ]
  },
  pericarditis: {
    lvl: 2,
    bl: 'Widespread concave STE with PR depression, PR elevation in aVR and no reciprocal change outside aVR/V1. Prove it is not OMI before you call it pericarditis.',
    lp: [
      'ST elevation is typically modest (0.5–1 mm) and measured relative to the T–P baseline. Sinus tachycardia is common.',
      'Four classic stages: (1) STE + PR depression (first two weeks); (2) ST normalises, T flattens (1–3 wk); (3) T inverts (3 to several weeks); (4) normal. Fewer than 50% follow all four stages.',
      'Causes: viral (coxsackie), bacterial/TB, SLE, rheumatic fever, uraemia, post-MI or post-surgery (Dressler), trauma, malignancy, drugs (isoniazid, ciclosporin), radiotherapy.',
      'Versus BER: ST/T ratio in V6 > 0.25 favours pericarditis; < 0.25 favours BER. A notched "fish-hook" J point in V4 favours BER.',
      'Get a TTE early to look for effusion or tamponade.'
    ],
    src: ['pericarditis-ecg-library'],
    rc: [
      ['V6: ST elevation 1.5 mm, T wave 4 mm — pericarditis or BER?', 'Ratio 0.375 > 0.25, which favours pericarditis.'],
      ['Which stage of pericarditis can mimic Wellens or ischaemic T inversion?', 'Stage 3 (T-wave inversion after ST normalisation).']
    ]
  }
});
