#!/usr/bin/env python3
"""Print every LITFL image URL the app uses that is not yet bundled in ecgs/.

usage (from ecg-explorer/):  python3 tools/list_image_urls.py > urls.txt
then:                        python3 tools/fetch_images.py urls.txt .img_cache ecgs src/data/img_map.json 6
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = ROOT / 'src' / 'data'

cases = json.loads((DATA / 'rcases.json').read_text(encoding='utf-8'))
examples = json.loads((DATA / 'examples.json').read_text(encoding='utf-8'))
img_map = json.loads((DATA / 'img_map.json').read_text(encoding='utf-8'))

urls = [i['src'] for c in cases for i in c['images']] + [e['src'] for v in examples.values() for e in v]
pz_file = DATA / 'litfl_puzzles.json'  # step-by-step ECG Exigency cases (tools/parse_puzzles.py)
if pz_file.exists():
    urls += [i['src'] for c in json.loads(pz_file.read_text(encoding='utf-8')) for i in c['images']]
notes_file = DATA / 'litfl_notes.json'  # full LITFL teaching pages (tools/parse_notes.py)
if notes_file.exists():
    urls += [i['src'] for n in json.loads(notes_file.read_text(encoding='utf-8')).values() for i in n['images']]
for u in dict.fromkeys(urls):
    if not (u in img_map and (ROOT / 'ecgs' / img_map[u]).exists()):
        print(u)
