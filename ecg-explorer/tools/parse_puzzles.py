#!/usr/bin/env python3
"""Turn saved LITFL "ECG Exigency" puzzle pages into step-by-step quiz cases.

usage (from ecg-explorer/):  python3 tools/parse_puzzles.py <dir with <slug>.html>
writes src/data/litfl_puzzles.json: [{id, src:'litfl-x', url, title, vignette, images, steps, label, tags, lvl}]

Each page is a vignette + ECG followed by questions whose answers sit in <details> accordions.
steps[i] = {pre: HTML shown before the question (text, new ECGs), q: question, a: hidden answer HTML}.
The app shows step 1, reveals its answer on request, then unlocks the next step, so ECGs that appear
later in the story never spoil earlier questions. Labels/tags come from src/data/puzzle_curation.json.
Text is LITFL's (CC BY-NC-SA 4.0) and is attributed in the app.
"""
import json
import pathlib
import re
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from parse_notes import PUZZLE, article, clean, text  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
GENERIC = re.compile(r'^(?:Answer(?: and Interpretation)?|Curveball Answer|Reveal(?: answer)?|Show answer|Interpretation)\W*$', re.I)
QNUM = re.compile(r'Q\s?\d+(?:\.\d+)?\.?\s+[^?]{3,200}?(?:[?.](?=\s|$)|$)')
QSENT = re.compile(r'(?:(?<=[.!:?\u201d"\u2019]\s)|^)((?:What|Can you|How|Why|Which|Describe|Interpret|Is|Are|Do|Does)\b[^.?!]{3,200}\?)')


def parse(path):
    title, body = article(path.read_text(encoding='utf-8', errors='ignore'))
    if body is None or not PUZZLE.match(text(body)[:80]):
        return None
    num = re.match(r'\s*aka\s+ECG\s+Exigency\s+([\d.]+)', text(body)[:80], re.I).group(1)
    images, steps = [], []
    pos = 0
    parts = list(re.finditer(r'<details\b[^>]*>(.*?)</details>', body, re.S))
    for k, d in enumerate(parts):
        inner = d.group(1)
        sm = re.search(r'<summary[^>]*>(.*?)</summary>', inner, re.S)
        summ = text(sm.group(1)) if sm else ''
        ans = inner[sm.end():] if sm else inner
        pre_raw = body[pos:d.start()]
        pos = d.end()
        pre = clean(pre_raw, images, cut=False)
        if GENERIC.match(summ) or not summ:
            # question is the last question line in the text before the accordion
            pt = text(pre_raw)
            qs = QNUM.findall(pt) or QSENT.findall(pt)
            q = qs[-1].strip() if qs else ''
            if q:  # don't show it twice: drop that line from the visible text
                pre = re.sub(r'<(h4|h5|p|strong)>(?:(?!</\1>).)*?' + re.escape(q[:30].replace('&', '&amp;')) + r'.*?</\1>', '', pre, count=1, flags=re.S)
        else:
            q = summ
        pre = re.sub(r'<(h4|h5|p|strong)>\s*Questions?\s*:?\s*</\1>', '', pre)
        a = clean(ans, images, cut=False)
        if not text(a) and not re.search(r'data-img', a):
            continue
        if len(re.findall(r'\b(?:19|20)\d{2}\s*[;:]\s*\d', text(a))) >= 3 and not re.search(r'\?', q):
            continue  # a reference list in an accordion, not a question
        steps.append({'pre': pre, 'q': q, 'a': a})
    tail = clean(body[pos:], images, cut=True)  # take-home points after the last accordion
    if steps and text(tail):
        steps[-1]['a'] += ' ' + tail
    if not steps:
        return None
    first_pre = steps[0]['pre']
    vig = text(re.sub(r'<figure data-img="\d+"></figure>', '', first_pre))
    vig = re.sub(r'^aka\s+ECG\s+Exigency\s+[\d.]+\s*', '', vig, flags=re.I)
    steps[0]['pre'] = re.sub(r'<p>\s*</p>', '', re.sub(r'aka\s*(?:<[^>]+>\s*)*ECG\s+Exigency\s*(?:</[^>]+>\s*)*[\d.]+\s*', '', first_pre, count=1, flags=re.I))
    return {'id': 'x' + path.stem, 'src': 'litfl-x', 'url': f'https://litfl.com/{path.stem}/',
            'title': f'ECG Exigency {num}: {title}', 'vignette': vig[:400], 'images': [dict(i, where='q') for i in images],
            'steps': steps}


def main():
    cur_f = ROOT / 'src' / 'data' / 'puzzle_curation.json'
    cur = json.loads(cur_f.read_text(encoding='utf-8')) if cur_f.exists() else {}
    out = []
    for p in sorted(pathlib.Path(sys.argv[1]).glob('*.html')):
        c = parse(p)
        if not c:
            continue
        c.update(cur.get(c['id'], {'label': c['title'], 'tags': [], 'lvl': 3}))
        out.append(c)
        print(f"{c['id']}: {len(c['steps'])} steps, {len(c['images'])} images")
    (ROOT / 'src' / 'data' / 'litfl_puzzles.json').write_text(json.dumps(out, ensure_ascii=False, indent=0), encoding='utf-8')
    missing = [c['id'] for c in out if c['id'] not in cur]
    print(f'{len(out)} puzzle cases; without curated label: {missing}')


if __name__ == '__main__':
    main()
