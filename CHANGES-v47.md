# Vibe Room v47 — karaoke Sound mix (music vs voice) + voice effects verified clean

Built on v46. One change, from Abhi.

## 1. Sound mix — music and voice have their own volume, in the Sing tab
In the Sing tab there is now a "Sound mix" card with two sliders, each
with its live number:
- **Music** — the song (the YouTube volume). It is the same volume as
  the main slider on the Play tab, and the two stay in sync both ways:
  move one and the other follows.
- **Voice** — the singer. If YOU are singing, it is your own voice in
  your ears ("Hear myself" monitor). If you are listening, it is the
  singer's voice on your phone. Turn the music down and the voice up to
  hear the singer clearly over the song, or the other way round.
Both levels are remembered on this device (localStorage), so your mix
survives a refresh and a rejoin. The voice level is per-person: each
listener sets their own mix, so one person's loud voice does not force
it on everyone else.

How it is wired: the voice level drives the singer's monitor gain
(`G.mon`) and the listener's voice element (`#kv.volume`). The music
level drives the YouTube players through the existing volume path, so
the smooth-drag throttle (v45) still applies.

## 2. Voice effects — all 11 presets + custom sliders verified clean
Every voice effect was checked end to end with a live mic stream:
- All 11 presets (Dry, Hall, Party, Warm, Fascinating, Distant, Vinyl,
  Church, Dreamland, Hi-Fi, Super reverb) reconfigure the chain
  (reverb, dry, echo, low-pass and crackle all move to different values
  per preset) and the audio keeps flowing through the chain for every
  one (analyser peak 255, no dropouts).
- The custom sliders work: Reverb 0.8 sets the reverb gain to 0.8 and
  switches the mode to "custom"; Bass +6 sets the lowshelf to +6.
- Effect changes are smooth, not clicky: the reverb/dry/echo gains use
  `setTargetAtTime` (0.05s), so switching presets glides instead of
  popping. The vinyl crackle (`cr`) is 0 for every preset except Vinyl
  (0.04), so no preset adds noise by accident.
- Zero errors on the singer's and the listener's screens.
HONEST LIMIT: the sandbox has no real mic and no real ears, so "clean"
is proven structurally (correct node values, signal flowing, no errors,
no unexpected noise sources). Whether a preset sounds good to Abhi's
ear on a real phone is his call — the Denoise slider in Custom voice
controls the noise gate, so if a quiet voice ever gets cut, turning
Denoise down (toward 0) opens the gate.

BUG FOUND WHILE TESTING: the mix value numbers (60 / 90) wrapped onto
their own line under the sliders. Cause: the base `#kar .sl` rule
(90px 1fr) beat the mix rule's 3-column grid on specificity. The mix
rule's `grid-template-columns` now carries `!important`, and the numbers
sit to the right of their sliders on one line.
