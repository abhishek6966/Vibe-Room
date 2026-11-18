# Vibe Room v51 — Volume bar actually changes the volume

## The bug
v49 made the volume slider's `oninput` do nothing but move the thumb and
only applied the volume on `change` (release). On a real phone that broke
it: the `change` event is unreliable on mobile Safari while dragging, so
the sound never changed at all even though the bar moved. The volume bar
looked alive but did nothing.

## The fix
`oninput` now applies the volume to the player LIVE while dragging, but
throttled to once per 60ms and with ONLY the cheap iframe call — no icon
rebuild, no mix-slider sync (those are what made the old drag stutter).
`onchange` still runs the full setVolume once on release, so the final
value is always applied. The drag stays free AND the volume actually
changes while you drag, even if `change` never fires.

## Verified (test-v51-volume.py, mobile 390x844, mock YT player)
- 8 fast drag moves 80 -> 30: the player got setVolume(30) DURING the
  drag, before release. Slider fill 30%.
- Release applies the final value once more per player.
- Drag to 0 -> player 0 + mute icon on. Drag to 60 -> player 60 + icon
  off. Mute button -> 0, unmute -> back to 60, max -> 100.
- 10s buttons still [b10, xp, pp, sk, f10]. Zero errors.
- Regression: test-v49 + test-mix-fx + test-background + test-volume
  all-pass, zero errors.
