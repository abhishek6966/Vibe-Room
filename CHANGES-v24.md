# Vibe Room v24 — everyone hears the song the moment the host plays it

Built on v23. The "Tap to enable audio" button was a workaround; this version
removes the need for it in the normal flow.

## Why a tap was needed at all
A browser will not play sound until the person has tapped the page — on
their own device. The host pressing Play unlocks sound on the HOST's phone
only; it does nothing for a guest's browser. So a guest who had never tapped
heard nothing when the host played a song. The old code created the player
only AFTER the join came back from the server, so the person's Join tap had
already finished by the time the player existed — the browser did not count
it as the gesture that unlocks sound.

## The fix (app.js)
1. **The player is created early.** It is now created while the join screen
   is showing, before the person taps "Join audio stream", instead of after
   the join comes back. So the player already exists when the tap happens.
2. **The Join tap itself unlocks the sound.** Inside the "Join audio stream"
   tap — while it is still a user gesture — the app unmutes the player.
   That tap is the one every participant already makes to enter the room,
   so there is no extra tap. After it, when the host plays a song, it just
   plays for that person, instantly.
3. **The host is covered the same way.** The host also taps "Join audio
   stream" after creating a room, so their sound is unlocked by the same
   tap. Their Play tap unmutes as well.

## What is still there as a fallback
The "Tap to enable audio" button and the first-tap-anywhere handler from v22
are still in place, for the two cases where the Join tap cannot unlock it:
- **iPhone Safari** is stricter than Chrome and sometimes still wants a
  tap right at the moment a song starts, not just at Join.
- **Auto-rejoin** (the page reloads, or the connection drops and comes back
  on its own) happens with no tap at all, so there is no gesture to unlock
  with. The button appears and one tap fixes it.

## Honest limit
No app can make a browser play sound on a device whose owner has never
tapped the page — that is the browser's rule, and it exists to stop websites
blasting audio at people. What v24 does is make the tap everyone already
makes (Join) be the one that unlocks it, so in the normal flow there is no
extra tap and no button. If someone joins without tapping (a reload, or a
reconnect), they will still see the button once.

## What did NOT change
- v23's smooth playback (seeks only past 1.0s, 240p cap every 2s, no
  preload while buffering) is intact.
- v22's first-tap-anywhere handler and the unlock button are intact.
- v21's instant pause (2–3ms) and SCHED=200 are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v24 - sound plays instantly for everyone"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
