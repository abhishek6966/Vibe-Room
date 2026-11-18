# Vibe Room v35 — sound popup after joining + desktop layout fixed

Built on v34. Two things:

## 1. The sound prompt is now a small premium popup in the room
The big "Tap to enable sound" button is GONE from the home screen and from
the join screen. Instead, the moment someone creates a room or joins one,
a small premium popup appears instantly inside the room:
- A small centered card (glass, gradient border, soft shadow) with a
  glowing speaker icon, "Enable sound", and one line of text.
- One gradient button: "Enable sound" — one tap unlocks audio for the
  session, and the popup closes.
- "Not now" and an ✕ close it without enabling. Tapping the dimmed
  background also closes it.
- It shows once per page load, and only if sound is not already enabled
  (if you enabled it before, it never appears again).
- The in-room "Tap to enable audio" button and the first-tap-anywhere
  unlock are still there as backups.

## 2. The desktop layout is straight now
On a computer the whole app was locked to a ~480px phone-width strip in
the middle, with empty dark space on both sides — that is why it looked
"not straight". Now on screens 768px and wider, the landing page and the
room widen to 640px (with a bigger hero), and the tab bar widens to match,
so the layout fills the screen and sits straight. The phone layout is
unchanged.

## What did NOT change
- v34's logo + music notes, v33's voice-to-everyone + "Hear myself" fix,
  v32's karaoke voice fix + mini prev/next, v31's premium icons + Queue
  spacing, v30's sound-at-start, v29's installable app, v28's Queue cards,
  v27's shared duration, v26's karaoke redesign, v25's host-stays-host,
  v24's instant sound, v23's smooth playback, v22's unlock button, v21's
  instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v35 - sound popup, desktop layout"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
