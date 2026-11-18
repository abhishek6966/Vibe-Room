# Vibe Room v31 — premium icons only + Queue page restructured

Built on v30. Two things, both UI:

## 1. No emojis anywhere — premium icons only
Every emoji and text glyph in the app is replaced by a clean inline SVG
icon (stroke-based, currentColor, so it matches the text around it). One
shared icon set (`IC` in app.js: speaker, check, mic, crown, star, controls,
play, pause) is used by app.js, karaoke.js and extras.js; the static pages
use the same SVGs inline.
- "Tap to enable sound" button: speaker SVG (was 🔊).
- "Sound on" confirmation: check SVG (was ✓).
- Karaoke stage avatar, "Sing this song" button, singer line, queue "singing"
  label: mic SVG (was 🎤).
- Room tab user badges: crown SVG for host (was 👑), star SVG for co-host
  (was ★), sliders SVG for given control (was 🎛).
- Play tab, Queue tab, More tab: play / list / chevron SVG icons (were
  ▶ / ☰ / ▼). The vinyl hub button: play / pause SVG (was ▶ / ❚❚).
- Rising music notes and the notes around the vinyl: a clean music-note SVG
  (was ♪ ♫ ♬ 🎵). The "♪ " before the track title is gone too.
- The mini player already used SVG icons — unchanged.

## 2. Queue page restructured — the headings breathe
The section headings ("Current song", "Up next", "Recently played",
"Requests") were stuck to the elements above and below them: the first
heading had margin-top:0 so it touched the paste bar, and 16px/8px was too
tight to read as a section break. Now each section has a clear gap above
its heading (20px) and a clear gap below it (12px), so the page reads as
separate sections instead of one stuck-together list. The song artwork
stays exactly 56×56px; nothing else about the Queue tab changed.

## What did NOT change
- v30's sound-at-start button, v29's installable app, v28's premium Queue
  cards, v27's shared duration, v26's karaoke redesign, v25's host-stays-
  host, v24's instant sound, v23's smooth playback, v22's unlock button,
  v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v31 - premium icons, Queue spacing"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
