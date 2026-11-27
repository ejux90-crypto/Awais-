// LEARNING LAYER — part 5 (bidirectional VT, lead reversal, ARVC, de Winter, aVR/LMCA pattern)
// litflNotRead: LITFL refused automated access for these pages; points were written from
// standard references and are NOT adapted from LITFL. The LITFL link is still provided.
Object.assign(LEARN, {
  afib_lbbb: {
    lvl: 3,
    bl: 'Wide + irregular + identical QRS shape at a moderate rate = AF with bundle-branch block; wide + irregular + changing shape + > 200 bpm = pre-excited AF. If unsure and unstable, cardiovert.',
    lp: [
      'Wide irregular differential: AF with BBB or rate-related aberrancy, pre-excited AF, polymorphic VT/TdP, VF.',
      'SVT with aberrancy is favoured when an old ECG shows the identical BBB morphology.',
      'Pre-excited AF keeps a stable axis but varies subtly in width and shape; polymorphic VT changes axis.',
      'Rate-related (functional) BBB can appear only at faster rates, so the old ECG may be narrow.'
    ],
    src: ['vt-versus-svt-ecg-library', 'atrial-fibrillation-in-pre-excitation', 'left-bundle-branch-block-lbbb-ecg-library'],
    rc: [
      ['Wide irregular tachycardia at 150 with identical LBBB complexes, old ECG shows LBBB — rate control?', 'Yes. This is AF + LBBB, so standard rate control applies (avoid non-DHP CCBs if HFrEF).'],
      ['Wide irregular at 260 with varying width — drug to avoid?', 'All AV-nodal blockers (adenosine, β-blockers, CCBs, digoxin, IV amiodarone). Use procainamide or cardiovert.']
    ]
  },
  bidir_vt: {
    lvl: 4,
    bl: 'Beat-to-beat 180° flip of the frontal QRS axis means severe digoxin toxicity until proven otherwise; in a young patient with exertional syncope, think CPVT.',
    lp: [
      'BVT is rare and is defined by beat-to-beat alternation of the frontal QRS axis (left ↔ right). It can also appear as alternating RBBB/LBBB morphology.',
      'Causes: severe digoxin toxicity (most common), familial catecholaminergic polymorphic VT (CPVT, where it may be the presenting rhythm), and herbal aconite poisoning.',
      'Updated view (non-LITFL): the "stone heart" fear of IV calcium in digoxin toxicity is not supported by modern data. DigiFab remains the definitive therapy. If electrical therapy is unavoidable, use the lowest effective energy.'
    ],
    src: ['bidirectional-ventricular-tachycardia-bvt-ecg-library'],
    rc: [
      ['Three causes of bidirectional VT?', 'Digoxin toxicity, CPVT, aconite poisoning (also Andersen–Tawil).'],
      ['Young athlete with exertional syncope and bidirectional VT on exercise test — drug class to avoid?', 'Sympathomimetics/catecholamines. Treat with β-blockade (± flecainide).']
    ]
  },
  lead_reversal: {
    lvl: 2,
    bl: 'Inverted P-QRS-T in lead I with an upright aVR but NORMAL precordial R progression is LA/RA reversal until proven otherwise. Re-site the electrodes before diagnosing anything.',
    lp: [
      'LA/RA reversal flips Einthoven\'s triangle around aVF: lead I inverts, II ↔ III swap, aVL ↔ aVR swap, aVF is unchanged.',
      'Quick check: global negativity in lead I, positive aVR, often marked RAD.',
      'Dextrocardia shares the limb-lead picture but has ABSENT R-wave progression across V1–V6. Lead reversal leaves the precordial leads normal.',
      'LA/RA reversal is the most common cause of a dominant R wave in aVR.'
    ],
    src: ['lead-reversal-left-arm-right-arm-ecg-library', 'dextrocardia-ecg-library'],
    rc: [
      ['Which limb lead is unchanged by LA/RA reversal?', 'aVF.'],
      ['Lead I globally negative — how do you tell dextrocardia from LA/RA reversal?', 'Precordial R-wave progression: normal = lead reversal; absent (dominant S throughout) = dextrocardia.']
    ]
  },
  arvc: {
    lvl: 4,
    bl: 'TWI in V1–3 beyond adolescence, an epsilon wave and LBBB-morphology VT in a young athlete point to ARVC. It is a fibro-fatty cardiomyopathy where exercise speeds the disease.',
    lp: [
      'Non-LITFL summary (LITFL page not retrievable): the epsilon wave is a small terminal notch after the QRS in V1–3 (specific, insensitive), with localised QRS prolongation in V1–3 and a prolonged terminal activation duration (≥ 55 ms from S nadir to QRS end).',
      'TWI in V1–3 (or beyond) in patients > 14 yrs without complete RBBB is a major task-force criterion.',
      'LITFL epsilon-wave page: the epsilon wave is a small "blip" at the end of the QRS, best in V1–V2, from delayed (post-excitation) activation of RV myocytes islanded in fat. It is the most specific ARVC sign, but is also described in posterior/RV infarction and sarcoid. Fontaine bipolar leads (RA manubrium, LA xiphoid, LL at V4) increase sensitivity.',
      'VT is typically LBBB morphology (RV origin). A superior axis favours ARVC over idiopathic RVOT VT, which has an inferior axis.',
      'ARVC accounts for up to ~10% of sudden deaths under 65 (LITFL RVOT page). Idiopathic RVOT VT terminates with adenosine; ARVC-related VT does not.'
    ],
    src: ['epsilon-wave-ecg-library', 'right-ventricular-outflow-tract-rvot-tachycardia', 'arrhythmogenic-right-ventricular-cardiomyopathy-arvc'],
    litflNotRead: true,
    rc: [
      ['LBBB-morphology VT with SUPERIOR axis in a young athlete — idiopathic RVOT VT or ARVC?', 'Favours ARVC (idiopathic RVOT VT has an inferior axis).'],
      ['Does adenosine terminate VT due to ARVC?', 'No (idiopathic RVOT VT often does).']
    ]
  },
  dewinter: {
    lvl: 4,
    bl: 'Upsloping ST depression at the J point running into tall symmetric T waves across V1–V6 during active pain = acute LAD occlusion without ST elevation. Activate the cath lab.',
    lp: [
      'Non-LITFL summary (LITFL page not retrievable): 1–3 mm upsloping J-point STD in V1–V6, tall prominent symmetric T waves, and often 1–2 mm STE in aVR. The QRS is usually normal or slightly widened, with loss of precordial R progression in some.',
      'It is seen in roughly 2% of acute LAD occlusions and is often static until it evolves into classic STEMI.',
      'LITFL anterior-MI page lists de Winter with Wellens and LMCA as the high-risk anterior patterns that are NOT classic STEMI.',
      'De Winter = active occlusion (pain now, reperfuse now). Wellens = reperfused critical stenosis (pain-free, urgent but not emergent angiography).'
    ],
    src: ['de-winter-t-wave-ecg-library', 'anterior-myocardial-infarction-ecg-library'],
    litflNotRead: true,
    rc: [
      ['de Winter vs Wellens — which one is happening during pain and which after?', 'de Winter: during active occlusion. Wellens: after reperfusion, pain-free.'],
      ['Upsloping STD V2–V5 + hyperacute T waves — "NSTEMI, cath tomorrow"?', 'No. It is an OMI (STEMI-equivalent) and needs emergent reperfusion.']
    ]
  },
  left_main_avr: {
    lvl: 4,
    bl: 'Diffuse ST depression (≥ 6–8 leads) with STE in aVR is the signature of diffuse subendocardial ischaemia. It is not specific for left-main occlusion; match it to the patient.',
    lp: [
      'LITFL ischaemia page: widespread STD with aVR STE > 1 mm suggests LMCA disease. Subendocardial STD does not localise; it is typically in I, II, V4–6 plus others.',
      'STD ≥ 2 mm in ≥ 3 leads predicts high NSTEMI probability and ~35% 30-day mortality.',
      'Non-LITFL caution: in the OMI era this pattern is most often demand ischaemia (anaemia, GI bleed, sepsis, SVT, hypotension) or multivessel/LM disease without acute occlusion. True acute LM occlusion usually presents with shock or arrest.',
      'Treat the cause if it is demand-driven. If ACS is likely: early invasive strategy, and consider holding P2Y12 loading until anatomy is known (CABG may be needed).'
    ],
    src: ['lmca-occlusion-st-elevation-in-avr', 'myocardial-ischaemia-ecg-library'],
    litflNotRead: true,
    rc: [
      ['STE aVR with diffuse STD in a patient with Hb 6 and melaena — first priority?', 'Resuscitate and transfuse (demand ischaemia), then reassess the ECG.'],
      ['Why does subendocardial ischaemia point toward aVR?', 'The subendocardial injury vector points away from the LV cavity toward aVR, regardless of territory, so it does not localise.']
    ]
  }
});
