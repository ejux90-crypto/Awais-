#!/usr/bin/env python3
"""Generate recall flashcards from the LITFL teaching pages (src/data/litfl_notes.json).

usage (from ecg-explorer/):  python3 tools/make_cards.py
writes src/data/litfl_cards.json: [{id, slug, group, kind, front, back, sec}]

Two kinds, both in LITFL's own words (CC BY-NC-SA 4.0, attributed in the app):
  list  - "LVH — Causes of LVH": recall a short LITFL list (criteria, features, causes, differentials)
  cloze - a LITFL bullet with one threshold hidden ("S V1 + R V5/V6 > [ ? ]"), answer shown in full
Only diagnostic sections are used (no history, references, examples or management).
"""
import hashlib
import html as H
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'src' / 'data'
LIST_HEAD = re.compile(r'criteria|features|characteristics|causes|differential|recogni|morphology|abnormalit|findings|changes|look for|tips', re.I)
SKIP_HEAD = re.compile(r'example|history|eponym|reference|further|reading|author|case|quiz|management|treatment|genetic|epidemiolog|incidence|electrophysiology|pathophysiology|mechanism', re.I)
NUM = re.compile(r'(?<![\w.])([<>≤≥]\s*)?(\d+(?:\.\d+)?(?:\s*[-–]\s*\d+(?:\.\d+)?)?)\s*(mmol/L|mmol|msec|ms|mm|mV|bpm|beats/min|%|seconds|sec|s|small squares|large squares|°|degrees)(?![a-zA-Z])', re.I)
# a threshold or range worth remembering, not one patient's measurement or a study statistic
RULE = re.compile(r'[<>≤≥]|greater than|less than|more than|at least|exceed|up to|normal|usually|typically|upper limit|lower limit|cut-?off|criteri|\d\s*[-–]\s*\d', re.I)


def text(s):
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def strip_links(s):
    return re.sub(r'<a data-litfl="[^"]*">(.*?)</a>', r'\1', s)


def main():
    notes = json.loads((DATA / 'litfl_notes.json').read_text(encoding='utf-8'))
    groups = json.loads((DATA / 'review_groups.json').read_text(encoding='utf-8'))
    group_of = {s: g['id'] for g in groups for s in g['pages']}
    cards, seen = [], set()
    for slug, n in notes.items():
        if slug not in group_of:
            continue
        title = re.sub(r'\s*\(.*?\)\s*$', '', n['title']) if len(n['title']) > 40 else n['title']
        secs = re.split(r'(?=<h4>)', n['html'])
        clozes = 0
        for sec in secs:
            m = re.match(r'<h4>(.*?)</h4>', sec)
            head = H.unescape(text(m.group(1))) if m else 'Overview'
            if SKIP_HEAD.search(head):
                continue
            body = sec[m.end():] if m else sec
            body = re.sub(r'<figure[^>]*></figure>', '', body)
            # list card: the section's first list, 2-12 short items
            if LIST_HEAD.search(head):
                ul = re.search(r'<(ul|ol)>(.*?)</\1>', body, re.S)
                if ul:
                    items = re.findall(r'<li>(.*?)</li>', ul.group(2), re.S)
                    if 2 <= len(items) <= 12 and all(len(text(i)) <= 220 for i in items):
                        front = f'{title} — {head}'
                        key = slug + '|' + head
                        if key not in seen:
                            seen.add(key)
                            cards.append({'kind': 'list', 'slug': slug, 'group': group_of[slug], 'sec': head, 'front': front,
                                          'back': strip_links(ul.group(0)), 'n': len(items)})
            # cloze cards: bullets / short paragraphs carrying a threshold
            for li in re.findall(r'<li>(.*?)</li>', body, re.S):
                if clozes >= 6:
                    break
                t = text(li)
                if not (20 <= len(t) <= 200) or re.search(r'\b(19|20)\d{2}\b|et al|doi', t):
                    continue
                mm = NUM.search(t)
                if not mm or not RULE.search(t[max(0, mm.start() - 40):mm.end() + 10]):
                    continue
                if re.match(r'(sinus rhythm|example|ecg shows|this ecg)', t, re.I):
                    continue
                answer = mm.group(0).strip()
                masked = t[:mm.start()] + '[ ? ]' + t[mm.end():]
                key = slug + '|' + t
                if key in seen:
                    continue
                seen.add(key)
                clozes += 1
                cards.append({'kind': 'cloze', 'slug': slug, 'group': group_of[slug], 'sec': head,
                              'front': H.escape(masked), 'answer': H.escape(answer), 'back': H.escape(t)})
    for c in cards:
        c['id'] = 'fc' + hashlib.sha1((c['slug'] + c['front'] + c.get('answer', '')).encode()).hexdigest()[:10]
    (DATA / 'litfl_cards.json').write_text(json.dumps(cards, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    k = {}
    for c in cards:
        k[c['kind']] = k.get(c['kind'], 0) + 1
    print(f'{len(cards)} cards ({k}) from {len({c["slug"] for c in cards})} pages')


if __name__ == '__main__':
    main()
