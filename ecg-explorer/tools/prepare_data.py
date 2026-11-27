#!/usr/bin/env python3
"""Prepare the real-ECG data for build.py from saved LITFL pages.

usage: python3 prepare_data.py <litfl-cache-dir>
  <cache>/cases/ecg-case-*.html   saved Top-100 case pages
  <cache>/raw/<slug>.html         saved ECG-library topic pages
Writes src/data/rcases.json, src/data/examples.json and <cache>/image_urls.txt.
Then run fetch_images.py to download/convert the images into ecgs/.
"""
import json
import pathlib
import re
import subprocess
import sys

TOOLS = pathlib.Path(__file__).resolve().parent
ROOT = TOOLS.parent
DATA = ROOT / 'src' / 'data'
MAX_EX_PER_PAGE = 8


def main():
    cache = pathlib.Path(sys.argv[1])
    DATA.mkdir(parents=True, exist_ok=True)
    tmp_cases, tmp_ex = cache / 'cases.json', cache / 'examples.json'
    subprocess.run([sys.executable, '-I', str(TOOLS / 'parse_cases.py'), str(cache / 'cases'), str(tmp_cases)], check=True)
    subprocess.run([sys.executable, '-I', str(TOOLS / 'tag_cases.py'), str(tmp_cases), str(DATA / 'rcases.json')], check=True)
    subprocess.run([sys.executable, '-I', str(TOOLS / 'parse_examples.py'), str(cache / 'raw'), str(tmp_ex)], check=True)

    # keep examples only for LITFL pages the app links to
    used = set()
    for f in (ROOT / 'src').glob('learn_*.js'):
        for m in re.findall(r"src:\s*\[([^\]]*)\]", f.read_text()):
            used.update(re.findall(r"'([a-z0-9-]+)'", m))
    ex = json.loads(tmp_ex.read_text())
    ex = {k: v[:MAX_EX_PER_PAGE] for k, v in ex.items() if k in used}
    (DATA / 'examples.json').write_text(json.dumps(ex, ensure_ascii=False, indent=1))

    cases = json.loads((DATA / 'rcases.json').read_text())
    urls = []
    for c in cases:
        urls += [i['src'] for i in c['images']]
    for v in ex.values():
        urls += [e['src'] for e in v]
    urls = list(dict.fromkeys(urls))
    (cache / 'image_urls.txt').write_text('\n'.join(urls) + '\n')
    print(f'{len(cases)} cases, {sum(len(v) for v in ex.values())} examples on {len(ex)} pages, {len(urls)} unique images to fetch')


if __name__ == '__main__':
    main()
