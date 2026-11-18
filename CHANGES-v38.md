# Vibe Room v38 — denser cosmic smoke (matches the reference)

Built on v37. One change: the smoke.

## What was wrong
The v37 smoke was too subtle — the clouds were too blurred (38px) and too
see-through (opacity 0.5), so they melted into the purple and read as a
soft colour wash, not as billowing smoke. The reference has thick, vivid,
billowing clouds that fill the card.

## What changed
- **Blur 38px → 22px** — the clouds keep their shape instead of washing out.
- **Opacity 0.5 → 0.8** (0.95 while playing) — the colours are vivid and
  the clouds read as smoke.
- **Bigger clouds** — each cloud is larger, so they overlap more and fill
  the card like the reference.
- **Two more clouds (8 total)** — an extra orange burst at the bottom and
  an extra magenta cloud at the top, so the card is covered in smoke.
- Everything else is unchanged: the smoke is still only inside the player
  card, behind the vinyl/tonearm/equalizer/controls, pointer-events:none,
  clipped to the card's rounded corners, and it still breathes harder
  while playing and calms when paused. No layout, control or logic change.

## What did NOT change
- v37's cosmic smoke structure + history menu + README, v36's history +
  refresh restore + smaller notes, v35's sound popup + desktop layout +
  README iPhones, v34's logo + music notes, v33's voice-to-everyone +
  "Hear myself" fix, v32's karaoke voice fix + mini prev/next, v31's
  premium icons + Queue spacing, v30's sound-at-start, v29's installable
  app, v28's Queue cards, v27's shared duration, v26's karaoke redesign,
  v25's host-stays-host, v24's instant sound, v23's smooth playback, v22's
  unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v38 - denser cosmic smoke"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
