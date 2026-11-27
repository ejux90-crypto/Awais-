#!/usr/bin/env python3
"""Tag parsed LITFL cases with app topic ids using rules over LITFL's diagnosis/answer text.

usage: python3 tag_cases.py cases.json out.json
Adds: tags (ordered by where the finding is first mentioned), label (short diagnosis line built
from the tag names), lvl (hardest tag level). Rules are conservative: a case keeps only tags whose
pattern appears in its answer text.
"""
import json
import re
import sys

# (topic id, label, regex) — order matters only for ties
RULES = [
    ('preexcited_afib', 'Pre-excited AF (WPW)', r'(?:AF|atrial fibrillation)[^.]{0,60}(?:WPW|Wolff|pre-?excit|accessory)|pre-?excited (?:AF|atrial fib)'),
    ('anti_avrt', 'Antidromic AVRT', r'antidromic'),
    ('ortho_avrt', 'Orthodromic AVRT', r'orthodromic'),
    ('wpw_sinus', 'WPW pattern', r'Wolff[- ]Parkinson|\bWPW\b|delta wave'),
    ('atypical_avnrt', 'Atypical AVNRT', r'atypical AVNRT'),
    ('avnrt', 'AVNRT', r'\bAVNRT\b|AV nodal re-?entr'),
    ('flutter', 'Atrial flutter', r'atrial flutter|flutter waves'),
    ('mat', 'Multifocal atrial tachycardia', r'multifocal atrial|\bMAT\b'),
    ('focal_at', 'Atrial tachycardia', r'(?:focal |ectopic )?atrial tachycardia(?! with block)'),
    ('afib_lbbb', 'AF with bundle branch block', r'(?:AF|atrial fibrillation)[^.]{0,40}(?:LBBB|RBBB|bundle branch block|aberran)'),
    ('afib', 'Atrial fibrillation', r'atrial fibrillation|\bAF\b'),
    ('pac_aberrant', 'Aberrant conduction / Ashman', r'Ashman|aberran(?:t|cy)'),
    ('tachy_brady', 'Sinus node dysfunction', r'sick sinus|sinus node dysfunction|sinus (?:arrest|pause)|tachy[- ]?brady'),
    ('x_saexit', 'SA exit block', r'sino-?atrial (?:exit )?block|SA (?:exit )?block'),
    ('x_sinusarr', 'Sinus arrhythmia', r'sinus arrhythmia'),
    ('sinus_brady', 'Sinus bradycardia', r'sinus bradycardia'),
    ('sinus_tach', 'Sinus tachycardia', r'sinus tachycardia'),
    ('bidir_vt', 'Bidirectional VT', r'bidirectional'),
    ('torsades', 'Torsades / polymorphic VT', r'torsade|polymorphic VT|polymorphic ventricular'),
    ('x_fascvt', 'Fascicular VT', r'fascicular (?:VT|ventricular tachycardia|tachycardia)'),
    ('x_rvot', 'RVOT VT', r'RVOT|right ventricular outflow'),
    ('vt', 'Ventricular tachycardia', r'ventricular tachycardia|\bVT\b'),
    ('vf', 'Ventricular fibrillation', r'ventricular fibrillation|\bVF\b'),
    ('aivr', 'AIVR', r'idioventricular|\bAIVR\b'),
    ('x_ventescape', 'Ventricular escape', r'ventricular escape'),
    ('pvc', 'PVCs', r'\bPVCs?\b|premature ventricular|ventricular ectop|bigeminy|trigeminy'),
    ('mobitz1', 'Mobitz I', r'Mobitz (?:type )?I\b(?!I)|Wenckebach'),
    ('mobitz2', 'Mobitz II', r'Mobitz (?:type )?II|Mobitz 2'),
    ('avb2_2to1', '2:1 / fixed-ratio AV block', r'2:1 (?:AV )?block|2:1 conduction|fixed ratio'),
    ('x_highgrade', 'High-grade AV block', r'high[- ]grade AV block'),
    ('avb3', 'Complete heart block', r'complete heart block|third[- ]degree|3rd degree (?:AV|heart) block|\bCHB\b'),
    ('avb1', '1st-degree AV block', r'first[- ]degree|1st degree (?:AV|heart) block'),
    ('x_ajr', 'Accelerated junctional rhythm', r'accelerated junctional|junctional tachycardia'),
    ('junctional', 'Junctional rhythm', r'junctional (?:escape|rhythm|bradycardia)'),
    ('pacer_undersense', 'Pacemaker undersensing', r'undersens|failure to sense'),
    ('pacer_fail', 'Pacemaker capture/output failure', r'failure to capture|loss of capture|output failure|oversens'),
    ('paced', 'Paced rhythm', r'paced rhythm|pacing spikes|pacemaker'),
    ('x_trifasc', 'Trifascicular block', r'trifascicular'),
    ('x_mbbb', 'Masquerading BBB', r'masquerading'),
    ('bifascicular', 'Bifascicular block', r'bifascicular'),
    ('x_lpfb', 'LPFB', r'left posterior fascicular|\bLPFB\b'),
    ('lafb', 'LAFB', r'left anterior fascicular|\bLAFB\b|left anterior hemiblock'),
    ('sgarbossa_stemi', 'MI in LBBB/paced (Sgarbossa)', r'Sgarbossa'),
    ('lbbb', 'LBBB', r'\bLBBB\b|left bundle branch block'),
    ('rbbb', 'RBBB', r'\bRBBB\b|right bundle branch block'),
    ('dewinter', 'de Winter T waves', r'de ?Winter'),
    ('wellens', 'Wellens syndrome', r'Wellens'),
    ('x_aslanger', 'Aslanger pattern', r'Aslanger'),
    ('x_highlat', 'High lateral OMI', r'high lateral|South Africa'),
    ('x_rvmi', 'RV infarction', r'right ventricular infarct|RV infarct|V4R'),
    ('post_stemi', 'Posterior MI', r'posterior (?:STEMI|MI|infarct|wall|OMI)|V7-9|V7–9'),
    ('left_main_avr', 'Diffuse STD + STE aVR', r'(?:STE|ST elevation)[^.]{0,30}aVR|left main|LMCA'),
    ('hyperacute_t', 'Hyperacute T waves', r'hyperacute'),
    ('x_lvaneurysm', 'LV aneurysm', r'aneurysm'),
    ('x_takotsubo', 'Takotsubo', r'takotsubo|tako-tsubo'),
    ('x_omi', 'Occlusion MI', r'\bOMI\b|occlusion MI|occlusion myocardial'),
    ('stemi', 'STEMI', r'STEMI|ST elevation myocardial|ST-elevation myocardial|acute (?:anterior|inferior|lateral|anterolateral|inferolateral) (?:MI|infarct)'),
    ('x_nste', 'Ischaemic ST depression / TWI', r'subendocardial isch|NSTEMI|myocardial ischa?emia|ischa?emic (?:ST|T)'),
    ('pericarditis', 'Pericarditis', r'pericarditis'),
    ('x_myocarditis', 'Myocarditis', r'myocarditis'),
    ('early_repol', 'Benign early repolarisation', r'early repolari[sz]ation|\bBER\b'),
    ('brugada', 'Brugada', r'Brugada(?! sign| criteria| algorithm)'),
    ('x_lqts', 'Long QT', r'long QT|QT prolong|prolonged QT'),
    ('x_sqts', 'Short QT syndrome', r'short QT syndrome'),
    ('hocm', 'HCM', r'hypertrophic cardiomyopathy|\bHCM\b|\bHOCM\b'),
    ('arvc', 'ARVC', r'\bARVC\b|\bARVD\b|arrhythmogenic right|epsilon'),
    ('lvh', 'LVH', r'\bLVH\b|left ventricular hypertrophy'),
    ('rvh', 'RVH', r'\bRVH\b|right ventricular hypertrophy|cor pulmonale'),
    ('x_atrial', 'Atrial enlargement', r'P mitrale|P pulmonale|atrial enlargement'),
    ('pe_s1q3t3', 'Pulmonary embolism / RV strain', r'pulmonary embol|\bPE\b|RV strain|right ventricular strain|S1 ?Q3 ?T3|SI QIII TIII'),
    ('tamponade', 'Effusion / electrical alternans', r'electrical alternans|pericardial effusion|tamponade'),
    ('x_lowvolt', 'Low QRS voltage', r'low (?:QRS )?voltage'),
    ('hyperk', 'Hyperkalaemia', r'hyperkala?emia'),
    ('hypok', 'Hypokalaemia', r'hypokala?emia'),
    ('hypoca', 'Hypocalcaemia', r'hypocala?emia'),
    ('hyperca', 'Hypercalcaemia', r'hypercalca?emia'),
    ('x_hypomg', 'Hypomagnesaemia', r'hypomagnes'),
    ('hypothermia', 'Hypothermia', r'hypotherm|Osborn'),
    ('cerebral_t', 'Raised ICP / cerebral T waves', r'intracranial|cerebral T|subarachnoid|\bSAH\b'),
    ('digoxin', 'Digoxin', r'digoxin|digitalis'),
    ('tca_tox', 'Sodium-channel blocker toxicity', r'tricyclic|\bTCA\b|sodium[- ]channel block'),
    ('x_bbccb', 'β-blocker / CCB toxicity', r'beta[- ]blocker (?:toxicity|overdose)|calcium[- ]channel blocker (?:toxicity|overdose)|propranolol|verapamil overdose|diltiazem overdose'),
    ('lead_reversal', 'Lead reversal', r'lead reversal|limb lead|LA/RA|arm leads? (?:reversed|reversal)'),
    ('x_dextro', 'Dextrocardia', r'dextrocardia'),
    ('x_artefact', 'Artefact', r'artefact|artifact'),
    ('x_prwp', 'Poor R-wave progression', r'poor R[- ]wave progression'),
]
SUPERSEDES = {  # if the key tag is present, drop the listed weaker tags
    'preexcited_afib': ['afib', 'wpw_sinus', 'afib_lbbb'], 'afib_lbbb': ['afib', 'lbbb', 'rbbb'],
    'anti_avrt': ['wpw_sinus'], 'ortho_avrt': ['wpw_sinus'], 'atypical_avnrt': ['avnrt'],
    'bidir_vt': ['vt'], 'torsades': ['vt'], 'x_fascvt': ['vt'], 'x_rvot': ['vt'],
    'bifascicular': ['rbbb', 'lafb'], 'x_trifasc': ['bifascicular', 'rbbb', 'lafb'], 'x_mbbb': ['rbbb', 'lbbb'],
    'sgarbossa_stemi': ['lbbb'], 'pacer_fail': ['paced'], 'pacer_undersense': ['paced'],
    'post_stemi': ['stemi'], 'x_rvmi': ['stemi'], 'x_highlat': ['stemi'], 'x_aslanger': ['stemi'],
    'x_highgrade': ['avb2_2to1'], 'x_ajr': ['junctional'],
}


def main():
    cases = json.load(open(sys.argv[1]))
    lvl = json.load(open(sys.argv[3])) if len(sys.argv) > 3 else {}
    untagged = 0
    for c in cases:
        body = re.sub(r'<[^>]+>', ' ', c['answer'])
        hits = []
        for tid, label, rx in RULES:
            m = re.search(rx, body, re.I if not rx.startswith('(?-') else 0)
            if m:
                hits.append((m.start(), tid, label))
        tags = [t for _, t, _ in sorted(hits)]
        for k, drop in SUPERSEDES.items():
            if k in tags:
                tags = [t for t in tags if t not in drop]
        # sinus tachycardia/AF/PVC are often incidental — keep them last
        incidental = ['sinus_tach', 'sinus_brady', 'pvc', 'avb1']
        tags = [t for t in tags if t not in incidental] + [t for t in tags if t in incidental]
        labels = {t: l for t, l, _ in RULES}
        c['tags'] = tags[:6]
        c['label'] = ' · '.join(labels[t] for t in tags[:3]) or 'Mixed findings'
        c['lvl'] = max([lvl.get(t, 2) for t in tags[:3]] or [2])
        untagged += not tags
    json.dump(cases, open(sys.argv[2], 'w'), ensure_ascii=False, indent=1)
    print(f'{len(cases)} cases tagged; untagged: {untagged}')


if __name__ == '__main__':
    main()
