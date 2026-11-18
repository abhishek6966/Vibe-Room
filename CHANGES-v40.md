# Vibe Room v40 — "Add a YouTube link" button + professional README

Built on v39. Two changes: first-time users can now find where to paste a
link, and the README is rewritten professionally with the live link at the
top.

## 1. "Add a YouTube link" button on the empty player
A first-time user landed on the Play page, saw "Queue is empty — Paste a
YouTube link to start the room.", and had no idea WHERE to paste it: the
paste box lives on the Queue tab, and nothing on the Play page said so.
- A very compact button, **"+ Add a YouTube link"**, now sits right under
  the "Paste a YouTube link to start the room." line on the empty player.
  Small gradient pill, plus icon, no clutter.
- Tapping it jumps straight to the **Queue tab** and puts the cursor in
  the paste box, so the user can paste the link at once.
- It shows **only while the queue is empty**. The moment a song is added
  and playing, it disappears — the player is never cluttered by it.

## 2. Professional README, live link at the top
- The README is rewritten professionally: badges, a **Try it live**
  section at the very top with the direct room link
  (https://vibe-room-0isd.onrender.com/room/7AG9RD) and the app link
  (https://vibe-room-0isd.onrender.com/), a clear overview, organised
  feature sections, a How-to-use guide, a tech-stack table, quick start,
  a troubleshooting table, privacy notes, and a project layout.
- **All 9 README screenshots were retaken fresh from this version** and
  put in the same 3D iPhone frames, so every image shows the current app
  (cosmic smoke, safe-area header, readable text, history menu).
- Note in the README: rooms expire 24h after becoming empty, so if
  7AG9RD has expired, open the app link and create a fresh room.

## What did NOT change
- v39's iPhone safe area + text legibility, v38's denser cosmic smoke +
  smoke photo texture, v37's smoke structure, v36's history + refresh
  restore + smaller notes, v35's sound popup + desktop layout + README
  iPhones, v34's logo + music notes, v33's voice-to-everyone + "Hear
  myself" fix, v32's karaoke voice fix + mini prev/next, v31's premium
  icons + Queue spacing, v30's sound-at-start, v29's installable app,
  v28's Queue cards, v27's shared duration, v26's karaoke redesign, v25's
  host-stays-host, v24's instant sound, v23's smooth playback, v22's
  unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v40 - add link button on empty player"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
