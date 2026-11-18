# Vibe Room v32 — karaoke voice reaches listeners + mini-player prev/next fixed

Built on v31. Two fixes:

## 1. Karaoke voice now reaches the other users
**The problem:** when someone clicked "Sing this song" and sang, the other
participants heard the song but NOT the singer's voice. The voice travels
from the singer's mic to each listener over WebRTC, and it was failing at
the last step on the listener's phone.
**Root cause (two parts):**
- (a) The listener's voice audio element (`<audio id="kv">`) was created
  only inside the WebRTC `ontrack` callback, and `play()` was called once
  from that callback — not from a tap. On iPhones especially, the browser
  blocks that one `play()` (autoplay policy: a new element, played from a
  network callback instead of a gesture), the promise rejected silently,
  and the voice NEVER sounded even though the stream had arrived.
- (b) If the voice connection itself failed once (strict network, no TURN
  relay), the singer's side deleted the peer and never tried again.
**The fix (karaoke.js + app.js):**
- The voice element is now created EARLY (when karaoke mode is on, before
  any voice arrives), so it exists when the stream comes in.
- `kvPlay()` tries to play it, and if the browser blocks it, it retries on
  the listener's next tap anywhere on the page. The "Tap to enable sound"
  button and the first-tap-anywhere unlock also retry it — so one tap
  starts the voice.
- If a voice connection fails, the singer's side retries the offer up to 5
  times (2 seconds apart) instead of dropping it silently.
- A small status line on the stage tells everyone the truth: "Voice
  connected — you can hear the singer" (green) or "Voice is ready — tap
  anywhere to hear it" (amber) when the browser blocked it.
- The singer's "Start singing" flow is unchanged: click "Sing this song",
  then "Start singing", and the voice goes to everyone.

## 2. Mini-player Previous / Next icons were swapped
In the bottom player bar, the Previous button showed the Next icon and the
Next button showed the Previous icon (the two SVG paths were assigned to
the wrong buttons). They are swapped back: Previous is now a left-pointing
triangle with the bar on the left, Next is a right-pointing triangle with
the bar on the right. The main Play-tab transport was already correct.

## Honest limits (unchanged)
- The voice needs a mic + https (or localhost) and mic permission.
- WebRTC uses STUN only (no TURN), so a very strict network may still
  block the voice even though the music plays — the retry now gives it 5
  chances instead of 1.
- The sandbox cannot test a real mic or real WebRTC audio — test singing
  with two real phones.

## What did NOT change
- v31's premium icons + Queue spacing, v30's sound-at-start, v29's
  installable app, v28's Queue cards, v27's shared duration, v26's karaoke
  redesign, v25's host-stays-host, v24's instant sound, v23's smooth
  playback, v22's unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v32 - karaoke voice fix, mini prev/next"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
