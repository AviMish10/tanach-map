"""
Fetches Hebrew Tanach text from Sefaria and saves as JS data files.
Run from project root: python3 scripts/fetch-tanach-text.py
"""

import urllib.request
import json
import time
import os
import re

BOOKS = [
    {'key': 'shoftim',     'sefaria': 'Judges',    'chapters': 21, 'name': 'שופטים'},
    {'key': 'shmuel-a',    'sefaria': 'I_Samuel',  'chapters': 31, 'name': 'שמואל א'},
    {'key': 'shmuel-b',    'sefaria': 'II_Samuel', 'chapters': 24, 'name': 'שמואל ב'},
    {'key': 'melachim-a',  'sefaria': 'I_Kings',   'chapters': 22, 'name': 'מלכים א'},
]

def strip_html(s):
    return re.sub(r'<[^>]+>', '', s or '').strip()

def fetch_chapter(book_sefaria, ch):
    url = f'https://www.sefaria.org/api/texts/{book_sefaria}.{ch}?lang=he&context=0&pad=0'
    req = urllib.request.Request(url, headers={'User-Agent': 'tanach-map/1.0'})
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return [strip_html(v) for v in (data.get('he') or [])]

def fetch_book(book):
    chapters = {}
    for ch in range(1, book['chapters'] + 1):
        print(f"  פרק {ch}/{book['chapters']}...", end=' ', flush=True)
        try:
            verses = fetch_chapter(book['sefaria'], ch)
            chapters[str(ch)] = verses
            print(f"✓ ({len(verses)} פסוקים)")
        except Exception as e:
            print(f"✗ {e}")
            chapters[str(ch)] = []
        time.sleep(0.35)
    return chapters

def main():
    out_dir = os.path.join(os.path.dirname(__file__), '..', 'data', 'text')
    os.makedirs(out_dir, exist_ok=True)

    for book in BOOKS:
        print(f"\nמביא {book['name']} ({book['sefaria']})...")
        chapters = fetch_book(book)
        content = (
            f"window.TANACH_TEXT = window.TANACH_TEXT || {{}};\n"
            f"window.TANACH_TEXT['{book['key']}'] = {{\n"
            f"  totalChapters: {book['chapters']},\n"
            f"  chapters: {json.dumps(chapters, ensure_ascii=False, indent=2)}\n"
            f"}};\n"
        )
        out_path = os.path.join(out_dir, f"{book['key']}.js")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ נשמר: data/text/{book['key']}.js")

    print('\n✅ סיום! כל הספרים נשמרו. רענן את הדפדפן.')

if __name__ == '__main__':
    main()
