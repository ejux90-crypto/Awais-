#!/usr/bin/env python3
"""Download LITFL ECG images politely and store them as compact WebP files.

usage: python3 fetch_images.py <urls.txt> <raw-cache-dir> <out-dir> <map.json> [delay-seconds=6]
  - sequential, 6 s apart, cached; stops after 3 consecutive refusals (re-runs only fetch what is missing)
  - resized to <= 1400 px wide, WebP q72 (fine grid and waveform detail survive)
  - map.json: {original_url: "file.webp"}
"""
import hashlib
import json
import pathlib
import subprocess
import sys
import time

from PIL import Image

UA = 'Mozilla/5.0 (personal ECG study tool)'


def main():
    urls = [u.strip() for u in open(sys.argv[1]) if u.strip()]
    raw, out, mp = pathlib.Path(sys.argv[2]), pathlib.Path(sys.argv[3]), pathlib.Path(sys.argv[4])
    raw.mkdir(parents=True, exist_ok=True)
    out.mkdir(parents=True, exist_ok=True)
    mapping = json.loads(mp.read_text()) if mp.exists() else {}
    delay = float(sys.argv[5]) if len(sys.argv) > 5 else 6.0
    fails = []
    streak = 0
    for i, u in enumerate(urls):
        name = hashlib.sha1(u.encode()).hexdigest()[:12]
        dst = out / f'{name}.webp'
        if dst.exists():
            mapping[u] = dst.name
            continue
        r = raw / name
        if not r.exists() or r.stat().st_size == 0:
            code = subprocess.run(['curl', '-sS', '-m', '40', '-A', UA, '-o', str(r), '-w', '%{http_code}', u],
                                  capture_output=True, text=True).stdout.strip()
            time.sleep(delay)
            if code != '200':
                fails.append((u, code))
                r.unlink(missing_ok=True)
                streak += 1
                if streak >= 3:  # the server is refusing us: stop rather than push harder
                    print('stopping: 3 refusals in a row (try again much later)', flush=True)
                    break
                continue
            streak = 0
        try:
            im = Image.open(r).convert('RGB')
            if im.width > 1400:
                im = im.resize((1400, round(im.height * 1400 / im.width)), Image.LANCZOS)
            im.save(dst, 'WEBP', quality=72, method=6)
            mapping[u] = dst.name
        except Exception as e:  # not an image (HTML error page etc.)
            fails.append((u, str(e)[:60]))
        if i % 25 == 0:
            mp.write_text(json.dumps(mapping, indent=0))
            print(f'{i + 1}/{len(urls)} done, {len(fails)} failed', flush=True)
    mp.write_text(json.dumps(mapping, indent=0))
    total = sum(f.stat().st_size for f in out.glob('*.webp'))
    print(f'finished: {len(mapping)} images, {total / 1e6:.1f} MB, {len(fails)} failed')
    for f in fails[:20]:
        print('FAIL', *f)


if __name__ == '__main__':
    main()
