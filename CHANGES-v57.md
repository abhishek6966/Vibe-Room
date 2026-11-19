# Vibe Room v57 — EVERY LISTENER HEARS THE SONG + VOLUME BUTTONS FIXED + CLEAN COOL CARD

Abhi reported three problems. All three are fixed here.

## 1. GUEST HEARS NOTHING (the big one)
A guest joined a room where the host was already playing a song. The
guest heard NOTHING and the video did not play, while other participants
heard it fine.

ROOT CAUSE (found by reading the code): the browser only allows sound
after the person taps something on THEIR device. The app has a big
"Tap to enable audio" button for exactly this case — but it was NEVER
shown. It starts hidden, and nothing in the code ever unhid it (every
reference to it only hid it). So a guest whose sound was blocked had no
way to start it: the timer retries call playVideo() every second, but
the browser blocks those (no tap), and there was no button to tap.

FIX:
- The app now WATCHES whether sound is actually coming out. If the room
  is playing but this device's player is not playing (and not buffering)
  for 2 seconds, the big "Tap to enable audio" button appears, with a
  toast: "Tap to enable sound — the song is playing but your device is
  silent." Tapping it calls playVideo() inside the tap, which the browser
  allows. It hides itself the moment the player starts or the room stops.
- "Enable sound" in the sound popup now actually starts the player too
  (it only resumed the audio context before, so the player stayed paused).
- Verified with a mock that blocks playVideo() until a real tap: the
  guest stayed silent on timers, the button appeared after ~2s, and
  tapping it started playback.

## 2. VOLUME BUTTON NOT WORKING ON MOBILE
The mute/max buttons and the slider worked in the sandbox, but on a real
phone they were too small to hit reliably: the Play-tab buttons were
only 32x34px and the slider track only 18px tall. Now the mute and max
buttons are a full 44x44px touch target and the slider is 28px tall with
a bigger thumb, and touch-action stops the double-tap zoom delay. Real
touchscreen taps verified: mute, unmute, max, and the slider all change
the volume.

## 3. COOL MODE CARD — CLEAN AND STRUCTURED
The old card crammed the icon, the heading, the long text and the switch
into one flex row, which stacked awkwardly and left the switch floating
alone at the bottom. Now it is a proper settings card: one header row
(moon icon + "Cool mode" + the switch on the right) and the description
as a short paragraph underneath. The switch is also fixed to its proper
30px height (the general button min-height was stretching it to 44px).

## Honest limits
- The sound check only knows the player is not playing; it cannot hear
  the room. If a device is muted at the SYSTEM level (phone silent switch,
  hardware volume at zero), the app cannot fix that — the phone's own
  buttons control that.
- The sandbox cannot test a real browser's autoplay block or a real
  iPhone's volume behaviour. Abhi must confirm on his real phone: join
  a room as a guest while a song is playing, and the song must sound
  without tapping anything extra (or the "Tap to enable audio" button
  must appear and start it when tapped).
