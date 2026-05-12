# PROJECT_CONTEXT.md

> Handoff document for Claude Code. Read this first in any new session before doing anything else.

## What this project is

A personal interactive map of biblical locations in Israel, in Hebrew, designed for hikers and travelers. User opens the map, taps a location, sees which Tanach chapters mention it with short insights from the תנ"ך ישראלי lesson series.

**Built by:** Avichai Mishneot, Jerusalem. Religious hiker, listens to תנ"ך ישראלי lessons weekly with his wife (started from Shoftim).

**Source content:** PDFs from the תנ"ך ישראלי series by Netanel Elinson (Herzog College / Yeshivat Har Etzion). Each PDF covers one chapter and includes maps, location identifications, and interpretive material.

## Copyright boundary — IMPORTANT

The PDFs are copyrighted ("אין להעתיק... ללא קבלת אישור מפורש ממיזם תנ"ך ישראלי"). Avichai contacted Netanel Elinson, who **gave permission to build the tool** with one condition: **don't put all the PDF information in the map.**

What this means in practice:
- ✅ Include: locations, what happened there (per chapter), short interpretive insight, characters, journey structure if any, the verse quoted in the lesson
- ❌ Exclude: the full thematic analysis, comparative structures, extended discussions like the יגאל אלון story or "לאופייה של נבואת ישראל" boxes, the deep interpretive arguments
- The tool should make people *want* to subscribe to תנ"ך ישראלי, not replace it
- Consider attribution like "מבוסס על השיעור של נתנאל אלינסון, מתוך סדרת תנ"ך ישראלי" + link to subscription page
- **Do NOT** embed or link to audio lessons — would cannibalize their paid subscription model

## Current status

- v3 demo built as single HTML file (`src/index.html`)
- Demo covers one chapter: מלכים ב פרק ב (Eliyahu and Elisha's farewell journey)
- Avichai sent the demo to Netanel for boundary confirmation
- Next: process Shoftim PDFs (~21 chapters) once Netanel confirms

## Design decisions (locked in v1)

1. **Map-first** — open the app, see pins, not chapters. Tap pin → see chapter cards. The chapter is *one of many ways to filter*, not the entry point.
2. **One pin per location** — even if 14 chapters mention יריחו, it's one pin. Tapping it shows all 14 chapters as stacked cards.
3. **Journeys as toggleable overlays** — each character has multiple journeys (Avraham's descent to Egypt, Eliyahu's flight to Chorev, etc., not "Eliyahu's entire life"). Toggle them on/off individually. They draw colored dashed lines with numbered stops on the pins.
4. **Character tagging — main characters only** — if 2 characters share a journey, tag both. Otherwise tag the most central. Don't tag every mention.
5. **Hebrew only** — no English, no other languages. Stay narrow.
6. **No competing with hatanakh.com** — they're chapter-first study tool with depth. We're location-first field companion. Different shape, not worse version.

## Categories (locked)

Permanent location categories that work across all of Tanach:
- ערים ויישובים (city)
- הרים (mountain)
- נחלים ומקווי מים (water)
- מקומות פולחן ומקדשים (cult)
- אתרי קרבות (battle)
- מדבריות ואזורי מעבר (desert)
- מחוץ לארץ ישראל (foreign)

Each has a color and symbol, used consistently on pin design.

## Data model

Four entity types:

```
LOCATIONS  → master list. {id, name, altName, coords, category}. ONE pin per location.
CHARACTERS → {id, name}. Used for filtering.
JOURNEYS   → {id, name, characters[], chapterId, color, stops[{locationId, order}]}
CHAPTERS   → {book, num, title, summary, appearances[{locationId, verse, summary, quote, description, characters[], insight}]}
```

In v3 demo these are all inline in `index.html`. **Refactor target**: split into separate JSON files in `data/`.

## Tech stack

- Leaflet.js for the map
- Leaflet.markercluster for pin clustering when zoomed out
- OpenStreetMap tiles (Hebrew labels in Israel) + Israel Hiking Map tiles as alt layer
- Vanilla JS, no framework — keep it simple
- Hosted as static site (no backend needed for v1)
- Fonts: Frank Ruhl Libre (serif headings) + Assistant (body)

## Visual design language

- Cream parchment background (`#fbf6ec`)
- Emerald greens for primary UI (`#2c6f4d`, `#1f5238`)
- Gold accents (`#d4a52c`)
- Burgundy for journey lines and highlights (`#a83a2c`)
- Teal for water-related (`#2e8a9e`)
- "Scholarly biblical atlas" aesthetic — colorful but warm, not childish

## v2+ feature backlog (DO NOT BUILD YET)

Saved for future versions. Don't suggest these in v1:
- Offline mode (for hiking without cell service)
- Curated walkable Tanach routes (e.g. מסע אליהו as a real trail anyone can hike)
- User photo submissions per site
- Bookmarks / "places I've visited"
- Calendar integration linking parsha/haftarah to relevant locations
- Group features for madrichim sharing custom routes with chanichim

**Explicitly excluded** (would harm partnership with תנ"ך ישראלי):
- Audio integration with lessons
- English translation
- Secular/non-religious framing

## Business context

- Goal: partnership with תנ"ך ישראלי. Their content, Avichai's tool, revenue share.
- Not VC-fundable. Lifestyle business at best.
- Real audience: dati-leumi community in Israel (~700k people), religious educators, tour guides, mechinot, Bnei Akiva madrichim.
- Avichai is building this nights/weekends. Day job: systems engineer in Israeli aerospace.

## How to work on this project

1. **Always read this file first** in a new Claude Code session.
2. **Read `src/index.html`** to see current state of the demo.
3. **Check `docs/` folder** for any newer design notes that may have updated decisions.
4. When processing a new PDF:
   - Extract: locations + coords + per-chapter (verse, summary, quote, short description, characters, short insight)
   - Identify journey if one exists in the chapter
   - Add new locations to `data/locations.json` (only if not already there)
   - Add chapter to `data/chapters/{book-id}-{num}.json`
   - Add journey if applicable to `data/journeys/{journey-id}.json`
5. **Respect the copyright boundary** — when in doubt, cut content rather than include it.
6. **Don't add features from the v2 backlog** without explicit user approval.

## Open questions / things to decide later

- Hosting: GitHub Pages? Netlify? Custom domain?
- Mobile: PWA (Progressive Web App) or eventually native iOS/Android?
- Subscription model: only relevant after partnership conversation with Netanel
- Coordinate accuracy: many locations have disputed identifications — need a system for marking "confidence level" or "alternative identifications" eventually
