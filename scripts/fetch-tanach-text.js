/**
 * Fetches Hebrew Tanach text from Sefaria API and saves as JS data files.
 * Run from the project root: node scripts/fetch-tanach-text.js
 * Requires Node.js (no npm packages needed).
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const BOOKS = [
  { key: 'shoftim',    sefaria: 'Judges',    chapters: 21, name: 'שופטים' },
  { key: 'shmuel-a',   sefaria: 'I_Samuel',  chapters: 31, name: 'שמואל א' },
  { key: 'shmuel-b',   sefaria: 'II_Samuel', chapters: 24, name: 'שמואל ב' },
  { key: 'melachim-a', sefaria: 'I_Kings',   chapters: 22, name: 'מלכים א' },
];

function stripHtml(str) {
  return (str || '').replace(/<[^>]*>/g, '').trim();
}

function fetchChapter(bookSefaria, chapterNum) {
  return new Promise((resolve, reject) => {
    const url = `https://www.sefaria.org/api/texts/${bookSefaria}.${chapterNum}?lang=he&context=0&pad=0`;
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const verses = (json.he || []).map(v => stripHtml(v));
          resolve(verses);
        } catch (e) {
          reject(new Error(`Parse error ch.${chapterNum}: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fetchBook(book) {
  const chapters = {};
  for (let ch = 1; ch <= book.chapters; ch++) {
    process.stdout.write(`  פרק ${ch}/${book.chapters}...`);
    try {
      chapters[ch] = await fetchChapter(book.sefaria, ch);
      console.log(` ✓ (${chapters[ch].length} פסוקים)`);
    } catch (e) {
      console.log(` ✗ ${e.message}`);
      chapters[ch] = [];
    }
    await delay(350); // be polite to Sefaria
  }
  return chapters;
}

async function main() {
  const outDir = path.join(__dirname, '..', 'data', 'text');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const book of BOOKS) {
    console.log(`\nמביא ${book.name} (${book.sefaria})...`);
    const chapters = await fetchBook(book);
    const content =
      `window.TANACH_TEXT = window.TANACH_TEXT || {};\n` +
      `window.TANACH_TEXT['${book.key}'] = {\n` +
      `  totalChapters: ${book.chapters},\n` +
      `  chapters: ${JSON.stringify(chapters, null, 2)}\n` +
      `};\n`;
    const outPath = path.join(outDir, `${book.key}.js`);
    fs.writeFileSync(outPath, content, 'utf8');
    console.log(`✓ נשמר: data/text/${book.key}.js`);
  }

  console.log('\n✅ סיום! כל הספרים נשמרו.');
  console.log('עכשיו טען את הדפדפן מחדש כדי לראות את הטקסט המלא.');
}

main().catch(err => { console.error('שגיאה:', err); process.exit(1); });
