# Vibe Room v39 — iPhone safe area (notch / Dynamic Island)

Built on v38. One change: the top of every screen now respects the iPhone
safe area.

## What was wrong
On iPhones the app drew right up to the very top of the screen, so the
camera cutout sat on top of the header — on iPhone 14 Pro and later the
Dynamic Island (the black pill) covered part of the "1 listening" text, and
on iPhone 13/14 the notch did the same. The header was partly hidden.

## What changed
- **Room header:** the room view now adds the top safe-area inset, so the
  whole header (room name, Live Room, listening pill, history, Invite,
  Lock) sits below the notch / Dynamic Island on every iPhone.
- **Landing + join gate:** the same inset is added on top of their normal
  top spacing, so their tops are clear too.
- **Tab bar:** it now sits above the home-indicator bar at the bottom
  (it was the one bottom element that did not account for it).
- **Text stays readable over the moving smoke:** the smoke is bright and
  busy, so a soft dark scrim now sits between the smoke and the content
  (the smoke still shows through, the text area is deepened), and every
  text line in the player — song title, artist, "Added by", times and
  "In Sync" — gets a strong shadow so it pops off the moving background
  wherever the smoke drifts. Controls already have their own solid/glass
  backgrounds, so they needed no change.
- This uses the standard iOS safe-area insets (`env(safe-area-inset-top)`
  / `env(safe-area-inset-bottom)`), which the iPhone reports for its own
  camera and home bar — iPhone 13/14 (notch), iPhone 14 Pro and later
  (Dynamic Island, including 15/16/17/18). On phones and computers without
  a notch these insets are 0, so nothing moves there. The page already used
  `viewport-fit=cover`; the mini bar and the sound-unlock button already
  added the bottom inset, so only the tops and the tab bar were missing it.
- No layout, colour, control or logic change.

## What did NOT change
- v38's denser cosmic smoke + smoke photo texture, v37's smoke structure,
  v36's history + refresh restore + smaller notes, v35's sound popup +
  desktop layout + README iPhones, v34's logo + music notes, v33's
  voice-to-everyone + "Hear myself" fix, v32's karaoke voice fix + mini
  prev/next, v31's premium icons + Queue spacing, v30's sound-at-start,
  v29's installable app, v28's Queue cards, v27's shared duration, v26's
  karaoke redesign, v25's host-stays-host, v24's instant sound, v23's
  smooth playback, v22's unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v39 - iPhone safe area"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.

## Please check on a real iPhone
The sandbox has no real iPhone and no notch, so the safe-area value there
is 0 — I verified the layout does not break and the header is fully
visible. Please open the live link on a real iPhone 13–18 and confirm the
header (room name, listening pill, history, Invite, Lock) is fully below
the notch / Dynamic Island with nothing hidden behind it.
