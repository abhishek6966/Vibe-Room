# Vibe Room v50 — Cooler phone (less heat, less lag)

## Why the phone heated up and lagged
Two things were working the phone hard the whole time a song played:
1. The player card's cosmic smoke used `filter: blur()` on 8 large clouds
   (22px) plus a pulsing glow (18px), all drifting on infinite animations.
   Blurring big elements on every frame makes the GPU work flat-out —
   that is what heats the phone and drops frames (lag).
2. ~35 infinite animations (smoke, orbs, notes, visualizer, pulse) ran
   even when no song was playing, burning battery for nothing.

## What changed
- The blur filters are GONE from the smoke clouds and the pulse. The
  clouds already fade to transparent through their radial gradient, so
  they stay soft and glowy with no blur filter at all — same look, the
  GPU barely works.
- The stage's backdrop blur is 20px -> 12px (still glassy, cheaper).
- When no song is playing, the decorative motion freezes: the smoke,
  orbs, notes and visualizer stop animating (body loses the `playing`
  class in render()). They resume the moment a song plays.
- The video is still capped at 240p (small/tiny) — it was already the
  lowest YouTube quality, so that part did not change.

## Verified (test-v50-perf.py, mobile 390x844)
- Smoke clouds/pulse computed filter: 'none' (was blur(22px)/blur(18px)).
- Stage backdrop-filter: blur(12px).
- body.playing true while a song plays, false after pause; smoke
  animation 'running' while playing, 'paused' after pause.
- 10s buttons still in the reordered order [b10, xp, pp, sk, f10].
- Zero page errors.

## Honest limit
The YouTube player still decodes a 240p video stream (that is the cost
of playing YouTube at all) and the phone still runs the app, so some
warmth on a long session is normal. What is gone is the extra GPU load
from the blur filters and the always-on animations — that was the part
making it hot and laggy. If it still gets hot on a long session, the
next step is a "low power" toggle that also stills the orbs/notes and
dims the smoke; say the word and I will add it.
