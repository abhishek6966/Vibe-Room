# Vibe Room v33 — voice reaches everyone + "Hear myself" fixed

Built on v32. The singer's voice must reach ALL participants (host included),
the singer must hear themselves when they turn on "Hear myself", and the
voice must stay in sync with the music.

## What was broken
- **"Hear myself" was silently broken.** If the singer ticked the box
  BEFORE tapping "Start singing", the monitor was created silent — the mic
  did not exist when they ticked it, so the setting was lost when the mic
  started. The box stayed ticked but the singer heard nothing.
- **The voice only reached listeners who were there at the exact moment.**
  The singer offered the voice only when a state update arrived, so a
  listener who joined late, or whose connection dropped once, could miss
  the voice entirely — including the host.

## What changed
- **"Hear myself" now works either way.** When the mic starts, the monitor
  gain is set from the box's current state, so ticking it before OR after
  "Start singing" both work. The singer hears their own processed voice
  (with the chosen effect) through their speakers/headphones, in sync with
  the music on their own device (Web Audio, ~10–20ms — effectively instant).
- **The voice is re-offered to everyone every 3 seconds while live.** The
  singer now keeps offering the voice to the host, every listener, and
  anyone who joins late — so the voice reaches all participants no matter
  when they joined, and a dropped connection is re-offered automatically.
- **The singer sees who hears them.** The stage status line now reads
  "Voice live — N of M listeners connected", so the singer knows the voice
  is reaching everyone (host included).
- The v32 fixes are intact: the voice element is created early, play() is
  retried on the listener's next tap, a failed connection retries up to 5×,
  and the listener's stage shows "Voice connected" / "tap anywhere".

## The honest note on sync
The voice and the music are in sync as closely as a web app can get. The
music on every device is synced to the server clock. The voice travels over
WebRTC and arrives ~0.1–0.3 seconds after the singer sings (network +
encoding — the physical floor for live voice over the internet). So on a
listener's phone the voice sits a fraction behind the beat. StarMaker
avoids this by mixing voice + music on the singer's device and streaming
the one mix; Vibe Room plays the music on each device and streams only the
voice, which is why the voice is a fraction behind. It is close enough to
sing along to, but it is not sample-perfect, and no web app can make it
sample-perfect.

## What did NOT change
- v32's karaoke voice fix + mini prev/next, v31's premium icons + Queue
  spacing, v30's sound-at-start, v29's installable app, v28's Queue cards,
  v27's shared duration, v26's karaoke redesign, v25's host-stays-host,
  v24's instant sound, v23's smooth playback, v22's unlock button, v21's
  instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v33 - voice to everyone, hear myself"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
