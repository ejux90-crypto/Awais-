#!/usr/bin/env python3
"""Extract example ECG images (with captions/annotations) from saved LITFL ECG-library topic pages.

usage: python3 parse_examples.py <dir with <slug>.html> <out.json>
Keeps only litfl.com-hosted images >= 500 px wide that sit under an "Example" heading or have
an ECG-like caption; drops images whose caption credits a third party.
"""
import html as H
import json
import pathlib
import re
import sys

SKIP_IMG = re.compile(r'Headshot|QUIZ-340|-100x100|340x256|logo|avatar|gravatar|medmastery|banner|button|icon', re.I)
THIRD = re.compile(r'reproduced|courtesy|with permission|\bsource:|©|copyright|adapted from|image from|(?-i:\b[A-Z][a-z]+ [A-Z]{1,2}[,.])|\b(?:19|20)\d{2}\b|from (?:dr|the paper|wikimedia)|et al', re.I)


def text(s):
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def parse(path):
    s = path.read_text(encoding='utf-8', errors='ignore')
    m = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*)', s, re.S)
    body = m.group(1)
    cut = re.search(r'<h[1-6][^>]*>\s*(References|Related Topics|Further Reading|Advanced Reading)', body, re.I)
    if cut:
        body = body[:cut.start()]
    out, dropped = [], 0
    heading = ''
    for tok in re.finditer(r'<h[1-6][^>]*>(.*?)</h[1-6]>|<figure.*?</figure>', body, re.S):
        if tok.group(0).startswith('<h'):
            heading = text(tok.group(1))
            continue
        fig = tok.group(0)
        im = re.search(r'<img[^>]+>', fig)
        if not im:
            continue
        a = dict(re.findall(r'([a-z-]+)="([^"]*)"', im.group(0)))
        src = a.get('data-orig-file') or a.get('src') or ''
        if not src.startswith('https://litfl.com/wp-content/uploads/') or SKIP_IMG.search(src):
            continue
        try:
            if int(a.get('width', '1000')) < 500:
                continue
        except ValueError:
            pass
        src = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', src)
        cap = text(re.search(r'<figcaption.*?</figcaption>', fig, re.S).group(0)) if '<figcaption' in fig else ''
        cap = re.sub(r'^(?:Click to expand|Scroll to annotate|Click to enlarge)\s*:?\s*', '', cap, flags=re.I)
        if THIRD.search(cap):
            dropped += 1
            continue
        # annotation bullets right after the figure (LITFL often lists findings below an example)
        after = body[tok.end():tok.end() + 2500]
        nxt = re.search(r'<figure|<h[1-6]', after)
        after = after[:nxt.start()] if nxt else after
        notes = [text(li) for li in re.findall(r'<li[^>]*>(.*?)</li>', after, re.S)][:8]
        if not notes:
            p = re.search(r'<p[^>]*>(.*?)</p>', after, re.S)
            if p and len(text(p.group(1))) > 20:
                notes = [text(p.group(1))]
        is_example = bool(re.search(r'example|ecg', heading, re.I)) or bool(cap)
        if not is_example:
            continue
        out.append({'src': src, 'cap': cap[:300], 'heading': heading[:120], 'notes': [n[:300] for n in notes if n]})
    return out, dropped


def main():
    src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    res, total, dropped = {}, 0, 0
    for p in sorted(src.glob('*.html')):
        ex, d = parse(p)
        dropped += d
        if ex:
            res[p.stem] = ex
            total += len(ex)
    out.write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{total} example images from {len(res)} pages -> {out}; third-party dropped: {dropped}')


if __name__ == '__main__':
    main()
