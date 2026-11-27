#!/usr/bin/env python3
"""Fetch missing LITFL images from Internet Archive (Wayback Machine) copies.

Same naming / conversion / map format as tools/fetch_images.py.
usage (from ecg-explorer/): python3 tools/fetch_archive.py <urls.txt> <raw-cache-dir> <out-dir> <map.json> [delay=8] [limit=0]
Stops after 3 consecutive refusals (403/429/5xx/timeouts); 404s (not archived) are just logged.
"""
import hashlib
import json
import pathlib
import subprocess
import sys
import time

from PIL import Image

UA = 'personal ECG study tool (offline bundle of archived LITFL images)'


def main():
    urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
    raw, out, mp = pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3]), pathlib.Path(sys.argv[4])
    delay = float(sys.argv[5]) if len(sys.argv) > 5 else 8.0
    limit = int(sys.argv[6]) if len(sys.argv) > 6 else 0
    raw.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    mapping = json.loads(mp.read_text()) if mp.exists() else {}
    fails, streak, tried, got = [], 0, 0, 0
    for i, u in enumerate(urls):
        name = hashlib.sha1(u.encode()).hexdigest()[:12]
        dst = out / f'{name}.webp'
        if dst.exists():
            mapping[u] = dst.name
            continue
        if limit and tried >= limit:
            break
        tried += 1
        r = raw / name
        if not r.exists() or r.stat().st_size == 0:
            wb = 'https://web.archive.org/web/2025id_/' + u
            code = subprocess.run(['curl', '-sSL', '-m', '60', '-A', UA, '-o', str(r), '-w', '%{http_code}', wb],
                                  capture_output=True, text=True).stdout.strip()
            time.sleep(delay)
            if code != '200':
                fails.append((u, code))
                r.unlink(missing_ok=True)
                if code == '404':  # simply not archived
                    streak = 0
                    continue
                streak += 1
                if streak >= 3:
                    print('stopping: 3 refusals in a row from archive.org', flush=True)
                    break
                continue
            streak = 0
        try:
            im = Image.open(r).convert('RGB')
            if im.width > 1400:
                im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=72, method=6)
            mapping[u] = dst.name
            got += 1
        except Exception as e:  # not an image
            fails.append((u, str(e)[:60]))
            r.unlink(missing_ok=True)
        if tried % 10 == 0:
            mp.write_text(json.dumps(mapping, indent=0))
            print(f'{i + 1}/{len(urls)} scanned, {got} new, {len(fails)} failed', flush=True)
    mp.write_text(json.dumps(mapping, indent=0))
    print(f'finished: {len(mapping)} images mapped, {got} new this run, {len(fails)} failed', flush=True)
    for f in fails:
        print('FAIL', *f)


if __name__ == '__main__':
    main()
