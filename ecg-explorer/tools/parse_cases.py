#!/usr/bin/env python3
"""Parse saved LITFL 'Top 100 ECG' case pages into a structured JSON case bank.

usage: python3 parse_cases.py <dir with ecg-case-*.html> <out.json>

Output per case: id, url, title, vignette, q (question HTML), images (question / answer,
with original URL + caption), answer (sanitised allow-listed HTML), dx (diagnosis lines),
thirdParty (captions that credit another source -> those images are excluded).
Text is LITFL's (CC BY-NC-SA 4.0) and is attributed in the app.
"""
import html as H
import json
import pathlib
import re
import sys

STOP = re.compile(r'^(References|Further Reading|TOP 100 ECG Series|ECG LIBRARY|Related Topics)\b', re.I)
SKIP_IMG = re.compile(r'Headshot|QUIZ-340|-100x100|340x256|logo|avatar|gravatar|medmastery|banner|button', re.I)
THIRD = re.compile(r'reproduced|courtesy|with permission|\bsource:|©|copyright|adapted from|image from|(?-i:\b[A-Z][a-z]+ [A-Z]{1,2}[,.])|\b(?:19|20)\d{2}\b', re.I)
ALLOWED = {'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'h4', 'sub', 'sup'}


def text(s):
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def sanitise(fragment):
    f = re.sub(r'<(script|style|noscript|iframe|svg)[^>]*>.*?</\1>', '', fragment, flags=re.S | re.I)
    f = re.sub(r'<h[1-6][^>]*>', '<h4>', f, flags=re.I)
    f = re.sub(r'</h[1-6]>', '</h4>', f, flags=re.I)

    def tag(m):
        closing, name = m.group(1), m.group(2).lower()
        if name in ALLOWED:
            return f'<{closing}{name}>'
        return ' '
    f = re.sub(r'<(/?)([a-zA-Z0-9]+)[^>]*>', tag, f)
    f = re.sub(r'<(p|li|h4|strong|b|em|i)>\s*</\1>', '', f)
    f = re.sub(r'\s+', ' ', f)
    f = re.sub(r'(<br>\s*){2,}', '<br>', f)
    return f.strip()


def parse(path):
    s = path.read_text(encoding='utf-8', errors='ignore')
    title = text(re.search(r'<title>(.*?)</title>', s, re.S).group(1)).split('•')[0].split('|')[0].strip()
    m = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>(.*)', s, re.S)
    body = m.group(1)
    # cut the tail (references, series nav, authors, comments)
    cut = len(body)
    for pat in [r'<h[1-6][^>]*>\s*References', r'Further Reading', r'TOP 100 ECG Series', r'<div[^>]*class="[^"]*(?:saboxplugin|author|comments|sharedaddy)']:
        mm = re.search(pat, body, re.I)
        if mm:
            cut = min(cut, mm.start())
    body = body[:cut]

    # split question / answer at the answer marker
    am = re.search(r'ECG\s+ANSWER|ANSWER\s+and\s+INTERPRETATION|<summary[^>]*>|<div[^>]*ub-content-toggle', body, re.I)
    qpart, apart = (body[:am.start()], body[am.start():]) if am else (body, '')

    def images(part, where):
        out, third = [], []
        for fig in re.finditer(r'(<figure.*?</figure>)|(<img[^>]+>)', part, re.S):
            chunk = fig.group(0)
            im = re.search(r'<img[^>]+>', chunk)
            if not im:
                continue
            attrs = dict(re.findall(r'([a-z-]+)="([^"]*)"', im.group(0)))
            src = attrs.get('data-src') or attrs.get('src') or ''
            if not src.startswith('https://litfl.com/wp-content/uploads/') or SKIP_IMG.search(src):
                continue
            try:
                if int(attrs.get('width', '1000')) < 400:
                    continue
            except ValueError:
                pass
            src = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', src)  # prefer original size
            cap = text(re.search(r'<figcaption.*?</figcaption>', chunk, re.S).group(0)) if '<figcaption' in chunk else ''
            if THIRD.search(cap):
                third.append(cap)
                continue
            out.append({'src': src, 'cap': cap, 'where': where})
        return out, third

    qimgs, t1 = images(qpart, 'q')
    aimgs, t2 = images(apart, 'a')

    # vignette = question text without the boilerplate prompt
    qhtml = sanitise(re.sub(r'<figure.*?</figure>|<img[^>]+>', '', qpart, flags=re.S))
    vignette = text(qhtml)
    vignette = re.sub(r'\s*Describe and interpret this ECG\.?\s*', ' ', vignette, flags=re.I).strip()

    # answer: replace answer images with placeholders so the viewer can place them inline
    n = [0]

    def ph(m):
        im = re.search(r'<img[^>]+>', m.group(0))
        if not im:
            return ''
        src = re.sub(r'-\d+x\d+(\.\w+)$', r'\1', (dict(re.findall(r'([a-z-]+)="([^"]*)"', im.group(0))).get('src') or ''))
        for k, a in enumerate(aimgs):
            if a['src'] == src:
                return f'<p>[[IMG{k}]]</p>'
        return ''
    ahtml = re.sub(r'<figure.*?</figure>|<img[^>]+>', ph, apart, flags=re.S)
    ahtml = sanitise(ahtml)
    ahtml = re.sub(r'\s*(?:<(?:p|h4|strong)>\s*)*\bReferences\b(?:(?!</?(?:ul|li)).){0,400}$', '', ahtml, flags=re.S)  # trailing reference stub
    ahtml = re.sub(r'(?:<(p|h4)>\s*(?:<strong>)?\s*(?:References|Further Reading|Related Topics)\s*(?:</strong>)?\s*</\1>\s*)+$', '', ahtml.strip())
    ahtml = re.sub(r'\[\[IMG(\d+)\]\]', r'<span data-aimg="\1"></span>', ahtml)
    ahtml = re.sub(r'^.*?(ECG\s+ANSWER[^<]*|ANSWER\s+and\s+INTERPRETATION|ECG Interpretation)', '', ahtml, count=1, flags=re.I | re.S).strip()
    ahtml = re.sub(r'^(</?\w+>\s*)+(?=<)', lambda m: m.group(0) if m.group(0).startswith('<') and not m.group(0).startswith('</') else '', ahtml)

    # diagnosis lines (used for tagging)
    dx = ''
    dm = re.search(r'Diagnos[ie]s?\s*:?\s*</?(?:h4|strong|b|p)>(.*?)(?:<h4>|$)', ahtml, re.S | re.I)
    if dm:
        dx = text(dm.group(1))[:400]
    if not dx:
        dx = text(ahtml)[:400]
    return {
        'id': path.stem.replace('ecg-case-', 'c'),
        'url': f'https://litfl.com/{path.stem}/',
        'title': title,
        'vignette': vignette[:1200],
        'images': qimgs + aimgs,
        'answer': ahtml,
        'dx': dx,
        'thirdParty': t1 + t2,
    }


def main():
    src, out = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    cases = []
    for p in sorted(src.glob('ecg-case-*.html')):
        try:
            c = parse(p)
        except Exception as e:  # keep going, report
            print('PARSE FAIL', p.name, e)
            continue
        if not any(i['where'] == 'q' for i in c['images']):
            print('NO QUESTION IMAGE', p.name)
            continue
        cases.append(c)
    out.write_text(json.dumps(cases, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'{len(cases)} cases -> {out}; third-party captions excluded: {sum(len(c["thirdParty"]) for c in cases)}')


if __name__ == '__main__':
    main()
