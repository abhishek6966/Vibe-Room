# Vibe Room v56 — AUTO-DIM IS NOW STATIC, NOT BLACK

Abhi's call: the all-black auto-dim looked very bad. So the idle case
no longer blacks out.

## What changed
- **Auto-dim (30s idle) is now STATIC.** After 30 seconds of no touching
  while a song plays, the page freezes in place — the smoke, the disc
  spin, the floating notes, the equalizer, the logo, every decorative
  animation pauses — but the page keeps its colours. It still looks like
  Vibe Room, just still. The GPU rests (that is the cooling), and there
  is no blackout. One tap wakes it and everything moves again.
- **Cool mode (manual toggle) still goes black.** That is a deliberate
  choice — you turn it on when you want it dark. Only the automatic
  idle case changed.

## How it works
Two body classes now, one per source. Cool mode sets `body.cool`
(near-black). Auto-dim sets `body.idle` (animations paused, colours
kept). They never fight: if Cool mode is on, the idle timer does not
arm, and the idle class only applies when Cool mode is off.

## Honest limits
- Freezing the animations rests the GPU, which is the main cooling win.
  Going black would save a little more on OLED screens (pixels off),
  but the look was the problem — so idle now trades that last bit of
  OLED saving for a page that still looks right.
- The phone still decodes the YouTube video (144p) and the screen stays
  on, so it will be a little warm on a long session. The sandbox cannot
  feel heat — Abhi must confirm on his device during a full song.
- Uploaded audio files (v52) are still the coolest path (no video
  decode at all).
