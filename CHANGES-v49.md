# Vibe Room v49 — volume slider truly free + 10-second skip buttons

Built on v48. Two changes, from Abhi.

## 1. Volume slider — drags freely now, and the phone's volume buttons work again
Abhi: the volume bar still lagged when dragging, and the phone's volume
buttons only drove it to the lowest and would not bring it back up.
Two separate causes, both fixed:
- **The drag stuttered because every tiny move rebuilt the mute icon.**
  The old `oninput` called `setVolume`, which replaced the mute button's
  whole SVG (`innerHTML`) on EVERY move while dragging. That rebuild is
  what made the thumb lag. Now `oninput` only moves the slider itself
  (the browser already sets the value; here we store it and paint the
  pink fill) — nothing else runs while the thumb moves. On release
  (`onchange`) the full `setVolume` runs once: icon, mix slider and the
  player. Measured: 8 fast drag moves now send ZERO player calls while
  dragging (was 4 in v45, 16 before that), and the player gets the final
  value once on release. The mute icon also only rebuilds when the muted
  state actually flips, not on every move.
- **The phone's volume buttons could not bring the sound back because
  the app used the player's separate mute() state.** `applyVolume` used
  to call `pl.mute()` at volume 0 and `pl.unMute()` above it. `mute()` is
  a separate state the phone's volume buttons cannot undo — so once the
  player was muted, pressing volume up on the phone did nothing. Now the
  app never calls `mute()`/`unMute()` anywhere (all direct `unMute()`
  calls in unlock, play, resume and lock-screen handlers now go through
  `applyVolume`). Mute is just volume 0 via `setVolume(0)`, and any
  volume above 0 via `setVolume(n)` — so the phone's buttons always work
  on the system volume and the app slider always works on the player
  volume, and neither can trap the other at silent.
  BUG FOUND WHILE TESTING: after dragging to 0 the mute icon did not
  switch to muted. Cause: the lightweight `oninput` was already flipping
  `volumeMuted`, so `setVolume` on release saw no change and skipped the
  icon rebuild. `oninput` now deliberately does not touch `volumeMuted`.
Verified: 0 player calls during an 8-move drag; release sends the final
value once per player; drag to 0 mutes the icon; drag back to 60 restores
volume 60 and unmutes; mute button -> 0, unmute button -> back to 60;
max button -> 100; zero errors. HONEST LIMIT: the phone's physical
volume buttons control the phone's system volume, and a web page cannot
read or set that — the app slider controls the player's volume, the phone
buttons control the overall output, and the two multiply. What is fixed
is that neither can now trap the other at silent.

## 2. 10-second skip — compact premium buttons flanking the play button
Abhi: add 10s forward/backward options in the player, premium icon
design with animation, compact and small. The transport row is now
[previous] [back 10s] [play] [forward 10s] [next]. Each 10s button is a
compact 40px circle (prev/next are 62px, play is 78px) in the same
glass-purple family, with a circular arrow and "10" in the middle — the
standard skip icon. On tap the arrow spins once (counterclockwise for
-10s, clockwise for +10s) and the button presses in. The seek is the
same action the seek bar sends, so the whole room moves together;
back-10s clamps at 0. The buttons follow the same rule as the seek bar
— only controllers can move the room, otherwise they are disabled.
Verified: row order is exactly [xp, b10, pp, f10, sk]; forward 10s moved
the room ~+10s, back 10s moved it ~-10s, back from ~2s clamped at 0;
zero errors. REORDER (Abhi): the 10s buttons now sit OUTSIDE prev/next
— [back 10s] [prev] [play] [next] [forward 10s]. The static HTML puts
#b10 first and #f10 last, and starmaker.js places #xp right after #b10.
Verified: row order is exactly [b10, xp, pp, sk, f10].
