#!/usr/bin/env python3
"""Extract the full teaching text of saved LITFL ECG-library pages into src/data/litfl_notes.json.

usage (from ecg-explorer/):  python3 tools/parse_notes.py <dir with <slug>.html> [<dir> ...]

Per page: title, url, html (sanitised, allow-listed tags only) and images [{src, cap}].
Images appear in html as <figure data-img="k"></figure>; the app fills them from images[k]
(bundled copy from ecgs/ when available, else litfl.com). Links to other LITFL pages become
<a data-litfl="slug">, everything else is plain text. Third-party images are dropped.
Text is LITFL's (CC BY-NC-SA 4.0) and is attributed in the app.
"""
import html as H
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
STOP = re.compile(r'^\s*(References|Further Reading|Related Topics|Related posts|Author|Editor|LITFL Further|ECG LIBRARY|TOP 100 ECG|Advanced Reading|Online|Textbooks|Publications)\b', re.I)
SKIP_IMG = re.compile(r'Headshot|QUIZ-340|-100x100|340x256|logo|avatar|gravatar|medmastery|banner|button|icon|google-web-search|-150x150|/ads?[-_]|Advert|Cardiovascular-curveball', re.I)
THIRD = re.compile(r'reproduced|courtesy|with permission|\bsource:|©|copyright|adapted from|image from|from (?:dr|the paper|wikimedia)|et al|wikimedia|\bCC BY\b', re.I)
KEEP = {'details', 'summary', 'p', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'br', 'sub', 'sup', 'table', 'thead', 'tbody', 'tr', 'td', 'th'}


def text(s):
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def img_src(tag):
    for attr in ('data-orig-file', 'data-lazy-src', 'src'):
        m = re.search(attr + r'="([^"]+)"', tag)
        if m and m.group(1).startswith('http'):
            u = m.group(1)
            if attr != 'data-orig-file':
                u = re.sub(r'-\d{2,4}x\d{2,4}(\.\w+)$', r'\1', u)  # WordPress thumbnail -> original
            return re.sub(r'^https?://web\.archive\.org/web/\d+\w*/', '', u)
    return None


PUZZLE = re.compile(r'^\s*aka\s+ECG\s+Exigency\b', re.I)  # LITFL ECG Exigency puzzles -> quiz cases (parse_puzzles.py)


def article(s):
    """(title, raw body HTML) of the main LITFL article, scripts and comments removed."""
    a = s.find('<article')
    if a < 0:
        return None, None
    tm = re.search(r'<h1[^>]*>(.*?)</h1>', s[a:], re.S) or re.search(r'<title>(.*?)</title>', s, re.S)
    title = re.sub(r'\s*[•|–-]\s*LITFL.*$', '', text(tm.group(1))).strip()
    m = re.search(r'<div[^>]*class="[^"]*entry-content[^"]*"[^>]*>', s[a:])
    if not m:
        return title, None
    body = s[a + m.end():]
    body = body[:body.find('</article>')] if '</article>' in body else body
    body = re.sub(r'<(script|style|noscript|svg|form|iframe)\b.*?</\1>', '', body, flags=re.S | re.I)
    body = re.sub(r'<!--.*?-->', '', body, flags=re.S)
    # reference / further-reading accordions are not teaching content
    body = re.sub(r'<details\b[^>]*>\s*<summary[^>]*>\s*(?:<[^>]+>\s*)*(?:References|Further Reading|Advanced Reading)\b.*?</details>', '', body, flags=re.S | re.I)
    return title, body


def clean(body, images, cut=True):
    """Sanitise a LITFL HTML fragment. Appends kept images to `images` (placeholders <figure data-img=k>)."""
    def fig(mm):
        blk = mm.group(0)
        im = re.search(r'<img\b[^>]*>', blk)
        if not im:
            return ''
        src = img_src(im.group(0))
        cm = re.search(r'<figcaption[^>]*>(.*?)</figcaption>', blk, re.S) or re.search(r'alt="([^"]*)"', im.group(0))
        cap = text(cm.group(1)) if cm else ''
        w = re.search(r'width="(\d+)"', im.group(0))
        if not src or 'litfl.com/wp-content/uploads' not in src or SKIP_IMG.search(src) or (w and int(w.group(1)) < 300):
            return ''
        if THIRD.search(cap):
            return ''
        for k, i in enumerate(images):  # same image twice (lazy + noscript copy) -> one entry
            if i['src'] == src:
                return f'\x00FIG{k}\x00'
        images.append({'src': src, 'cap': cap if not re.fullmatch(r'[\w-]+', cap or '') else ''})
        return f'\x00FIG{len(images) - 1}\x00'
    body = re.sub(r'<figure\b.*?</figure>', fig, body, flags=re.S)
    body = re.sub(r'<img\b[^>]*>', lambda mm: fig(mm), body)

    def head(mm):
        lvl, t = int(mm.group(1)), text(mm.group(2))
        # protect < > & in heading text ("Short PR interval (<120ms)") from the tag-stripping below
        t = t.replace('&', '\x06').replace('<', '\x04').replace('>', '\x05')
        return f'\x00H{2 if lvl <= 5 else 3}:{t}\x00' if t else ''
    body = re.sub(r'<h([1-6])\b[^>]*>(.*?)</h\1>', head, body, flags=re.S)
    if cut:  # stop at the reference / author sections
        for mm in re.finditer(r'\x00H\d:(.*?)\x00', body):
            if STOP.match(mm.group(1)):
                body = body[:mm.start()]
                break

    def link(mm):
        href, inner = mm.group(1), mm.group(2)
        sl = re.match(r'(?:https?://web\.archive\.org/web/\d+\w*/)?https?://litfl\.com/([a-z0-9-]+)/?(?:#.*)?$', href)
        t = H.escape(text(inner))
        return f'\x00L{sl.group(1)}\x01{t}\x00' if sl and t else t
    body = re.sub(r'<a\b[^>]*href="([^"]*)"[^>]*>(.*?)</a>', link, body, flags=re.S)

    def tag(mm):
        close, name = mm.group(1), mm.group(2).lower()
        return f'<{close}{name}>' if name in KEEP else ''
    body = re.sub(r'<(/?)([a-zA-Z0-9]+)\b[^>]*>', tag, body)
    body = H.unescape(body).replace('&', '&amp;').replace('<', '\x02').replace('>', '\x03')
    body = re.sub(r'\x02(/?(?:' + '|'.join(KEEP) + r'))\x03', r'<\1>', body)
    body = body.replace('\x02', '&lt;').replace('\x03', '&gt;')
    body = re.sub(r'\x00FIG(\d+)\x00', r'<figure data-img="\1"></figure>', body)
    body = re.sub(r'\x00H2:(.*?)\x00', lambda mm: f'<h4>{mm.group(1)}</h4>', body)
    body = re.sub(r'\x00H3:(.*?)\x00', lambda mm: f'<h5>{mm.group(1)}</h5>', body)
    body = body.replace('\x06', '&amp;').replace('\x04', '&lt;').replace('\x05', '&gt;')
    body = re.sub(r'\x00L([a-z0-9-]+)\x01(.*?)\x00', r'<a data-litfl="\1">\2</a>', body)
    body = re.sub(r'<(p|li|strong|em|b|i|summary)>\s*</\1>', '', body)
    body = re.sub(r'<details>\s*(?:<summary>.*?</summary>)?\s*</details>', '', body, flags=re.S)  # empty accordions
    body = re.sub(r'\s+', ' ', body).strip()
    body = re.sub(r'(<h[45]>[^<]*</h[45]>\s*)+(?=<h4>|$)', '', body)  # headings left with no content
    return body


def parse(path):
    title, body = article(path.read_text(encoding='utf-8', errors='ignore'))
    if body is None:
        return None
    if PUZZLE.match(text(body)[:80]):
        return 'puzzle'
    images = []
    html = clean(body, images)
    if len(text(html)) < 200:
        return None
    return {'title': title, 'url': f'https://litfl.com/{path.stem}/', 'html': html, 'images': images}


def main():
    notes = {}
    for d in sys.argv[1:]:
        for p in sorted(pathlib.Path(d).glob('*.html')):
            r = parse(p)
            if r == 'puzzle':
                continue  # becomes a quiz case instead
            if r:
                notes[p.stem] = r
            else:
                print('no content:', p.name)
    out = ROOT / 'src' / 'data' / 'litfl_notes.json'
    out.write_text(json.dumps(notes, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    words = sum(len(text(n['html']).split()) for n in notes.values())
    print(f'{len(notes)} pages, {words} words, {sum(len(n["images"]) for n in notes.values())} images -> {out.relative_to(ROOT)}')


if __name__ == '__main__':
    main()
