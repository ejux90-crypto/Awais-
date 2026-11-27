#!/usr/bin/env python3
"""Pick, download and render PTB-XL 12-lead ECGs as practice cases.

PTB-XL (Wagner et al., Sci Data 2020; PhysioNet, CC BY 4.0) ships raw signals, not pictures,
so each chosen record is drawn as a standard 12-lead printout on grid paper
(3x4 layout + lead II rhythm strip, 25 mm/s, 10 mm/mV).

usage (from ecg-explorer/):
  python3 tools/ptbxl_build.py <cache-dir>            # needs ptbxl_database.csv + scp_statements.csv in cache-dir
writes ecgs/ptbxl/<ecg_id>.webp and src/data/ptbxl_cases.json. Downloads are cached and polite (1 s apart).
"""
import ast
import csv
import json
import pathlib
import random
import subprocess
import sys
import time

import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://physionet.org/files/ptb-xl/1.0.3/'
UA = 'personal ECG study tool'
LEADS = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6']
LAYOUT = [['I', 'aVR', 'V1', 'V4'], ['II', 'aVL', 'V2', 'V5'], ['III', 'aVF', 'V3', 'V6']]

# (category id, label, how many, predicate on {code: likelihood}, app topic tags)
def has(*codes, need=100):
    return lambda sc: any(c in sc and (sc[c] >= need or need == 0) for c in codes)

CATS = [
    ('norm', 'Normal ECG (sinus rhythm)', 14, lambda s: s.get('NORM', 0) >= 100 and set(s) <= {'NORM', 'SR'}, ['nsr']),
    ('sbrad', 'Sinus bradycardia', 8, lambda s: 'SBRAD' in s and not ({'AFIB', 'AFLT'} & set(s)), ['sinus_brady']),
    ('stach', 'Sinus tachycardia', 8, lambda s: 'STACH' in s and not ({'AFIB', 'AFLT'} & set(s)), ['sinus_tach']),
    ('sarrh', 'Sinus arrhythmia', 6, lambda s: 'SARRH' in s and not ({'AFIB', 'AFLT'} & set(s)), ['x_sinusarr']),
    ('afib', 'Atrial fibrillation', 20, has('AFIB', need=0), ['afib']),
    ('aflt', 'Atrial flutter', 16, has('AFLT', need=0), ['flutter']),
    ('svt', 'Supraventricular tachycardia', 10, has('SVTAC', 'PSVT', need=0), ['avnrt']),
    ('pvc', 'Ventricular premature complexes (PVCs)', 10, lambda s: 'PVC' in s and not ({'AFIB', 'AFLT', 'PACE'} & set(s)), ['pvc']),
    ('avb1', 'First-degree AV block', 10, has('1AVB'), ['avb1']),
    ('avb2', 'Second-degree AV block', 10, has('2AVB'), ['mobitz1', 'mobitz2']),
    ('avb3', 'Third-degree (complete) AV block', 12, has('3AVB'), ['avb3']),
    ('crbbb', 'Complete right bundle branch block', 12, lambda s: s.get('CRBBB', 0) >= 100 and 'LAFB' not in s and 'LPFB' not in s, ['rbbb']),
    ('irbbb', 'Incomplete right bundle branch block', 6, has('IRBBB'), ['rbbb']),
    ('clbbb', 'Complete left bundle branch block', 12, has('CLBBB'), ['lbbb']),
    ('lafb', 'Left anterior fascicular block', 10, lambda s: s.get('LAFB', 0) >= 100 and 'CRBBB' not in s, ['lafb']),
    ('lpfb', 'Left posterior fascicular block', 8, lambda s: s.get('LPFB', 0) >= 100 and 'CRBBB' not in s, ['x_lpfb']),
    ('bifasc', 'Bifascicular block (RBBB + LAFB)', 8, lambda s: s.get('CRBBB', 0) >= 100 and s.get('LAFB', 0) >= 100, ['bifascicular']),
    ('wpw', 'Wolff-Parkinson-White pattern (pre-excitation)', 12, has('WPW'), ['wpw_sinus']),
    ('lvh', 'Left ventricular hypertrophy', 12, has('LVH'), ['lvh']),
    ('rvh', 'Right ventricular hypertrophy', 10, has('RVH'), ['rvh']),
    ('atrial', 'Atrial enlargement (LAE / RAE)', 8, has('LAO/LAE', 'RAO/RAE'), ['x_atrial']),
    ('imi', 'Inferior myocardial infarction', 14, lambda s: s.get('IMI', 0) >= 100 and not ({'ILMI', 'IPMI', 'IPLMI'} & set(s)), ['stemi']),
    ('asmi', 'Anteroseptal myocardial infarction', 14, has('ASMI'), ['stemi']),
    ('ami', 'Anterior / anterolateral myocardial infarction', 14, has('AMI', 'ALMI'), ['stemi']),
    ('lmi', 'Lateral / inferolateral myocardial infarction', 10, has('LMI', 'ILMI'), ['stemi', 'x_highlat']),
    ('pmi', 'Posterior-involving myocardial infarction', 10, has('PMI', 'IPMI', 'IPLMI'), ['post_stemi', 'stemi']),
    ('inj', 'Subendocardial injury pattern (ST depression)', 10, has('INJAS', 'INJAL', 'INJIL', 'INJLA', 'INJIN'), ['x_nste']),
    ('lqt', 'Long QT interval', 8, has('LNGQT'), ['x_lqts']),
    ('dig', 'Digitalis effect', 8, has('DIG'), ['digoxin']),
    ('pace', 'Paced rhythm (normally functioning pacemaker)', 10, has('PACE', need=0), ['paced']),
    ('aneur', 'ST-T changes of ventricular aneurysm', 6, has('ANEUR'), ['x_lvaneurysm']),
    ('isc_ant', 'Ischaemic ST-T changes, anterior / anteroseptal leads', 8, has('ISCAN', 'ISCAS'), ['x_nste', 'wellens']),
    ('isc_lat', 'Ischaemic ST-T changes, anterolateral / lateral leads', 8, has('ISCAL', 'ISCLA'), ['x_nste']),
    ('isc_inf', 'Ischaemic ST-T changes, inferior / inferolateral leads', 8, has('ISCIN', 'ISCIL'), ['x_nste']),
    ('qwave', 'Pathological Q waves', 8, has('QWAVE', need=0), ['f_qrs', 'stemi']),
    ('lowv', 'Low QRS voltage', 8, has('LVOLT', need=0), ['x_lowvolt']),
    ('pac', 'Atrial premature complexes (PACs)', 8, lambda s: 'PAC' in s and not ({'AFIB', 'AFLT', 'PVC'} & set(s)), ['pac_aberrant']),
    ('bigem', 'Bigeminy / trigeminy (ectopic beat pattern)', 8, has('BIGU', 'TRIGU', need=0), ['pvc']),
    ('ivcd', 'Non-specific intraventricular conduction delay', 8, has('IVCD'), ['x_mbbb']),
    ('ilbbb', 'Incomplete left bundle branch block', 6, has('ILBBB'), ['lbbb']),
    ('el', 'Electrolyte disturbance or drug effect (ST-T changes)', 8, has('EL'), ['hypok', 'digoxin']),
    ('sehyp', 'Septal hypertrophy', 6, has('SEHYP'), ['hocm']),
    ('ste', 'Non-specific ST elevation', 6, has('STE_', need=0), ['early_repol', 'pericarditis']),
    # level 3: two or more major findings from different groups on one tracing
    ('mixed', 'Mixed findings', 30, lambda s: len({MAJOR[k] for k in s if k in MAJOR and (s[k] >= 100 or (s[k] == 0 and k in RHYTHM_MAJOR))}) >= 2, None),
]
MAJOR = {'AFIB': 'rhythm', 'AFLT': 'rhythm', 'PACE': 'rhythm', '1AVB': 'av', '2AVB': 'av', '3AVB': 'av',
         'CLBBB': 'bbb', 'CRBBB': 'bbb', 'LAFB': 'fasc', 'LPFB': 'fasc', 'WPW': 'pre',
         'LVH': 'hyp', 'RVH': 'hyp', 'IMI': 'mi', 'ASMI': 'mi', 'AMI': 'mi', 'ALMI': 'mi', 'ILMI': 'mi', 'LMI': 'mi',
         'IPMI': 'mi', 'IPLMI': 'mi', 'PMI': 'mi', 'LNGQT': 'qt', 'DIG': 'drug'}
RHYTHM_MAJOR = {'AFIB', 'AFLT', 'PACE'}
CODE_TAG = {'AFIB': 'afib', 'AFLT': 'flutter', 'PACE': 'paced', '1AVB': 'avb1', '2AVB': 'mobitz1', '3AVB': 'avb3',
            'CLBBB': 'lbbb', 'CRBBB': 'rbbb', 'LAFB': 'lafb', 'LPFB': 'x_lpfb', 'WPW': 'wpw_sinus', 'LVH': 'lvh',
            'RVH': 'rvh', 'IMI': 'stemi', 'ASMI': 'stemi', 'AMI': 'stemi', 'ALMI': 'stemi', 'ILMI': 'stemi',
            'LMI': 'stemi', 'IPMI': 'post_stemi', 'IPLMI': 'post_stemi', 'PMI': 'post_stemi', 'LNGQT': 'x_lqts', 'DIG': 'digoxin'}
# Excluded after visual review of every rendered ECG (record id -> reason). The next clean example replaces each.
EXCLUDE = {
    19330: 'high-frequency noise burst in V2 and III',
    19978: 'limb-lead tremor obscures the delta waves',
    3219: 'tremor in I and aVL, the leads a lateral MI is read in',
    10873: 'tremor in I and aVL, the leads a lateral MI is read in',
    2846: 'tremor through the limb leads and rhythm strip',
    10538: 'noise burst in V2, one of the anterior leads its ischaemia is read in',
    1395: 'noise across limb leads and rhythm strip hides the Q waves',
    15950: 'limb-lead tremor hides the Q waves',
    2491: 'labelled low voltage but V2-V3 complexes are very deep (contradicts the label)',
    6636: 'limb-lead noise: amplitude, the point of a low-voltage example, cannot be judged',
    1068: 'noisy limb leads and rhythm strip obscure subtle ST-T changes',
    8959: 'noisy limb leads and rhythm strip obscure subtle ST-T changes',
    855: 'tremor through the limb leads',
    1600: 'noisy baseline: ST elevation cannot be judged reliably',
    11828: 'baseline artefact in V4-V6',
    19917: 'noisy limb leads',
    13964: 'limb-lead tremor hides the Q waves',
    4063: 'limb-lead noise: ST elevation cannot be judged reliably',
    18112: 'limb-lead tremor',
    16019: 'limb-lead tremor hides the Q waves',
}
AXIS = {'MID': 'normal axis', 'LAD': 'left axis deviation', 'ALAD': 'abnormal left axis deviation',
        'RAD': 'right axis deviation', 'ARAD': 'abnormal right axis deviation', 'AXL': 'leftward axis',
        'AXR': 'rightward axis', 'SAG': 'sagittal (indeterminate) axis'}


def fetch(cache, rel):
    dst = cache / rel
    if dst.exists() and dst.stat().st_size > 0:
        return dst
    dst.parent.mkdir(parents=True, exist_ok=True)
    for attempt in range(4):  # PhysioNet / S3 sometimes answers 5xx or a stray redirect: back off and retry
        res = subprocess.run(['curl', '-sSL', '-m', '120', '-A', UA, '-o', str(dst), '-w', '%{http_code}', BASE + rel],
                             capture_output=True, text=True)
        code = res.stdout.strip() if res.returncode == 0 else f'curl error {res.returncode}'  # e.g. timeout mid-file
        time.sleep(1)
        if code == '200' or code == '404':
            break
        time.sleep(5 * (attempt + 1))
    if code != '200':
        dst.unlink(missing_ok=True)
        raise RuntimeError(f'{rel}: HTTP {code}')
    return dst


def read_record(cache, stem):
    hea = fetch(cache, stem + '.hea').read_text().splitlines()
    n_sig, fs, n = int(hea[0].split()[1]), float(hea[0].split()[2]), int(hea[0].split()[3])
    gains, names = [], []
    for ln in hea[1:1 + n_sig]:
        p = ln.split()
        assert p[1] == '16', 'only format 16 supported'
        gains.append(float(p[2].split('(')[0].split('/')[0]))
        names.append(p[-1])
    dat = fetch(cache, stem + '.dat')
    if dat.stat().st_size != n * n_sig * 2:  # incomplete download: fetch it again once
        dat.unlink()
        dat = fetch(cache, stem + '.dat')
    if dat.stat().st_size != n * n_sig * 2:
        raise RuntimeError(f'{stem}.dat has {dat.stat().st_size} bytes, expected {n * n_sig * 2}')
    raw = np.frombuffer(dat.read_bytes(), dtype='<i2').reshape(n, n_sig)
    sig = raw / np.array(gains)
    norm = {nm.upper(): i for i, nm in enumerate(names)}
    return {ld: bandpass(sig[:, norm[ld.upper()]], fs) for ld in LEADS}, fs


def bandpass(x, fs, lo=0.5, hi=40.0):
    """0.5-40 Hz display filter, as on a standard ECG machine printout (zero-phase, FFT with smooth edges)."""
    n = len(x)
    pad = int(fs)  # mirror-pad 1 s to avoid edge ringing
    y = np.concatenate([x[pad:0:-1], x, x[-2:-pad - 2:-1]])
    f = np.fft.rfftfreq(len(y), 1 / fs)
    H = 1 / (1 + (f / hi) ** 8)                      # gentle 40 Hz low-pass
    H *= 1 - 1 / (1 + (f / lo) ** 4)                 # 0.5 Hz high-pass (baseline wander)
    return np.fft.irfft(np.fft.rfft(y) * H, len(y))[pad:pad + n]


def qa(sig, fs):
    """Reject recordings that would print badly: flat (disconnected) or wildly saturated leads."""
    trim = slice(int(0.3 * fs), -int(0.3 * fs))
    for ld, x in sig.items():
        ptp = float(np.ptp(x[trim]))
        if ptp < 0.08:
            return f'lead {ld} flat ({ptp:.2f} mV)'
        if ptp > 9:
            return f'lead {ld} saturated ({ptp:.1f} mV)'
    # slow swing in the first / last half-second (amplifier settling, electrode knock): it sits exactly where
    # the reader starts lead I and the rhythm strip and can pass for a real finding
    w = int(0.1 * fs)
    k = np.ones(w) / w
    for ld, x in sig.items():
        ma = np.convolve(x - np.median(x), k, 'same')
        e = max(np.abs(ma[w:int(0.6 * fs)]).max(), np.abs(ma[-int(0.6 * fs):-w]).max())
        mid = np.abs(ma[int(0.6 * fs):-int(0.6 * fs)]).max()
        if e > 0.4 and e > 1.8 * max(mid, 0.05):
            return f'lead {ld} edge transient ({e:.2f} mV vs {mid:.2f} mV mid-record)'
    return None


def gain_for(sig, fs):
    """mm/mV: standard 10 (traces may overlap a little, as on real printouts); half-standard 5 only when a complex would reach the next row."""
    trim = slice(int(0.3 * fs), -int(0.3 * fs))
    peak = max(float(np.max(np.abs(x[trim] - np.median(x)))) for x in sig.values())
    return 10 if peak <= 3.55 else 5  # 3.6 mV = 36 mm reaches the next row


def render(sig, fs, eid, out):
    mm = 1 / 25.4  # inches per mm
    W, H = 262, 200  # paper mm: 4 x 62.5 mm columns (2.5 s) + margins; 4 rows, >= 38 mm headroom top and bottom
    fig = plt.figure(figsize=(W * mm, H * mm), dpi=1400 / (W * mm))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, W); ax.set_ylim(0, H); ax.axis('off')
    for x in np.arange(0, W + 0.01, 1):
        ax.axvline(x, color='#f4c7c7' if x % 5 else '#e58e8e', lw=0.25 if x % 5 else 0.6, zorder=0)
    for y in np.arange(0, H + 0.01, 1):
        ax.axhline(y, color='#f4c7c7' if y % 5 else '#e58e8e', lw=0.25 if y % 5 else 0.6, zorder=0)
    fig.patch.set_facecolor('#fff7f7')
    x0, colw = 8, 62.5
    rows_y = [H - 42, H - 82, H - 122, H - 162]
    g = gain_for(sig, fs)
    footer = f'PTB-XL record {eid}  •  25 mm/s  •  {g} mm/mV{" (half standard: tall complexes)" if g != 10 else ""}  •  0.5–40 Hz  •  PhysioNet, CC BY 4.0'
    clipped = []

    def cal(y):  # 1 mV / 200 ms calibration pulse, drawn at the printout's gain
        ax.plot([0.5, 2, 2, 7, 7, 7.5], [y, y, y + g, y + g, y, y], color='black', lw=0.6, zorder=3)

    def trace(y, sigma, start_mm, dur_s, t0):
        a, b = int(t0 * fs), int(t0 * fs) + int(dur_s * fs)
        s = sigma[a:b]
        s = s - np.median(sigma)  # crude baseline
        t = np.arange(len(s)) / fs * 25 + start_mm
        lim = 36 / g  # never draw past the neighbouring row's baseline
        if np.abs(s).max() > lim:
            clipped.append(float(np.abs(s).max()))
        ax.plot(t, y + np.clip(s, -lim, lim) * g, color='black', lw=0.55, zorder=3, solid_joinstyle='round')

    for r, row in enumerate(LAYOUT):
        y = rows_y[r]
        cal(y)
        for c, ld in enumerate(row):
            trace(y, sig[ld], x0 + c * colw, 2.5, c * 2.5)
            ax.text(x0 + c * colw + 1.5, y + 9, ld, fontsize=7, fontweight='bold', zorder=4)
            if c:
                ax.plot([x0 + c * colw] * 2, [y - 3, y + 3], color='black', lw=0.6, zorder=3)
    y = rows_y[3]
    cal(y)
    trace(y, sig['II'], x0, 10, 0)
    ax.text(x0 + 1.5, y + 9, 'II', fontsize=7, fontweight='bold', zorder=4)
    ax.text(1, 3, footer, fontsize=5.5, color='#444', zorder=4)
    tmp = out.with_suffix('.png')
    fig.savefig(tmp, dpi=fig.dpi, facecolor=fig.get_facecolor())
    plt.close(fig)
    Image.open(tmp).convert('RGB').save(out, 'WEBP', quality=78, method=6)
    tmp.unlink()
    return g, clipped


def main():
    cache = pathlib.Path(sys.argv[1])
    S = {r['']: r for r in csv.DictReader(open(cache / 'scp_statements.csv'))}
    rows = [r for r in csv.DictReader(open(cache / 'ptbxl_database.csv'))
            if r['validated_by_human'] == 'True' and not any(r[k].strip() for k in
               ('baseline_drift', 'static_noise', 'burst_noise', 'electrodes_problems'))]
    rng = random.Random(42)
    rng.shuffle(rows)
    rows.sort(key=lambda r: len(ast.literal_eval(r['scp_codes'])))  # purest examples first (stable)
    used, patients, cases = set(), set(), []  # one ECG per patient: more variety, no near-duplicates
    out_dir = ROOT / 'ecgs' / 'ptbxl'
    out_dir.mkdir(parents=True, exist_ok=True)
    for cid, label, n, pred, tags in CATS:
        got = 0
        for r in rows:
            if got >= n:
                break
            sc = ast.literal_eval(r['scp_codes'])
            if r['ecg_id'] in used or r['patient_id'] in patients or int(r['ecg_id']) in EXCLUDE or not pred(sc):
                continue
            if cid != 'pace' and ('PACE' in sc or r['pacemaker'].strip()):
                continue
            eid = int(r['ecg_id'])
            out = out_dir / f'{eid}.webp'
            try:
                sig, fs = read_record(cache, r['filename_hr'])
                bad = qa(sig, fs)
                if bad:
                    print('reject', eid, bad, flush=True)
                    continue
                g, clipped = render(sig, fs, eid, out)
                if clipped:  # would hide part of a complex: reject rather than print it wrong
                    out.unlink()
                    print('reject', eid, f'clipped {max(clipped):.1f} mV at {g} mm/mV', flush=True)
                    continue
            except Exception as e:
                print('skip', eid, e, flush=True)
                continue
            used.add(r['ecg_id'])
            patients.add(r['patient_id'])
            got += 1
            age = int(float(r['age'])) if r['age'] else None
            sex = {'0': 'man', '1': 'woman'}.get(r['sex'], 'patient')
            who = (f'{age}-year-old {sex}' if age and age < 90 else f'Older {sex}' if age else sex.capitalize())
            stmts = sorted(sc.items(), key=lambda kv: -kv[1])
            items = ''.join(f"<li>{S[k]['description'].capitalize()}" + (f' <span class="muted">({int(v)}% likelihood)</span>' if 0 < v < 100 else '') + '</li>'
                            for k, v in stmts if k in S)
            extra = []
            if r['heart_axis'] in AXIS:
                extra.append(f"<li>Axis: {AXIS[r['heart_axis']]}</li>")
            if g != 10:
                extra.append('<li><strong>Printed at half standard gain (5 mm/mV)</strong> because the complexes are tall: double every amplitude when judging voltage criteria.</li>')
            stage = (r['infarction_stadium1'] or '').strip()
            if stage and stage != 'unknown':
                extra.append(f"<li>Infarction stage: {stage} <span class=\"muted\">(PTB-XL: Stadium I = acute, II = recent, III = old)</span></li>")
            # name every other definite finding so the key diagnosis line is complete, not just the category
            primary = {k for k in sc if not pred({x: v for x, v in sc.items() if x != k})}
            others = [S[k]['description'] for k, v in sc.items()
                      if k in S and k not in primary and k not in ('SR', 'NORM') and (v >= 100 or (v == 0 and S[k]['rhythm'] == '1.0'))]
            if cid == 'mixed':  # name the findings instead of a category
                finds = [S[k]['description'] for k, v in sorted(sc.items(), key=lambda kv: -kv[1])
                         if k in S and k not in ('SR', 'NORM') and (v >= 100 or (v == 0 and S[k]['rhythm'] == '1.0'))]
                full_label = 'Mixed findings: ' + '; '.join(finds)
                tags = sorted({CODE_TAG[k] for k in sc if k in CODE_TAG})
            else:
                full_label = label + (' · also: ' + '; '.join(others) if others else '')
            answer = (f'<p><strong>Cardiologist-validated statements (PTB-XL):</strong></p><ul>{items}{"".join(extra)}</ul>'
                      f'<p class="muted">PTB-XL labels come from the original reports, coded as SCP-ECG statements and reviewed by cardiologists. '
                      f'They describe this tracing but are not a full teaching interpretation; check the rate, intervals and leads yourself.</p>')
            cases.append({'id': f'p{eid}', 'src': 'ptbxl', 'url': 'https://physionet.org/content/ptb-xl/1.0.3/',
                          'title': f'PTB-XL ECG {eid}', 'vignette': f'{who}. Routine 12-lead ECG. Describe and interpret.',
                          'images': [{'src': f'ecgs/ptbxl/{eid}.webp', 'cap': '', 'where': 'q'}],
                          'answer': answer, 'label': full_label, 'gain': g, 'scp': sc, 'axis': r['heart_axis'] or '', 'tags': tags, 'cat': cid, 'lvl': 1 if cid in ('norm', 'sbrad', 'stach') else 3 if cid == 'mixed' else 2})
        print(f'{cid}: {got}/{n}', flush=True)
    (ROOT / 'src' / 'data' / 'ptbxl_cases.json').write_text(json.dumps(cases, ensure_ascii=False, indent=0), encoding='utf-8')
    total = sum(f.stat().st_size for f in out_dir.glob('*.webp'))
    print(f'done: {len(cases)} PTB-XL cases, {total / 1e6:.1f} MB')


if __name__ == '__main__':
    main()
