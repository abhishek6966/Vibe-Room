# Vibe Room v26 — Karaoke redesign: host sings directly + live voice stage

Built on v25. Three things at Abhi's order.

## 1. The host no longer has to request to sing
The old flow made everyone — including the host — tap "Request to sing" and
wait to be picked, even though the host is the one who picks. That was
backwards. Now the host (or a co-host) sees a **"Sing this song"** button on
the current track, and tapping it makes them the singer at once — no request,
no wait. The same "Sing" button appears on queue tracks for the host. Guests
still see "Request to sing", and the host picks them from the "Waiting to
sing" list as before. (Server: the `assign` action already accepted any user
id, including the host's own — the button just never offered it.)

## 2. The Sing page is completely restructured
The old page was one crowded card: a toggle, a heading, a status line, a
request button, singer controls, eleven effect pills and a custom-voice
dropdown all piled together. It is now four clean sections, each with one job:

- **STAGE (top):** a clean card that always shows who is singing, the song,
  and a LIVE badge when they are singing. Under it, a row of 24 animated
  bars — the live voice visualizer (see below).
- **YOUR TURN:** one clear action. Host: "Sing this song" (+ "You are the
  host — no request needed"). Guest: "Request to sing" / "Cancel request".
  The "Waiting to sing" list (with Pick buttons for the host) lives here.
- **MIC (only when you are the singer):** Start/Stop singing, Hear myself,
  Record my vocals, Save take — plus the "wear headphones" tip, now a small
  line instead of a paragraph in the middle of everything.
- **VOICE EFFECTS:** the eleven presets in a clean 3-column grid, with
  Custom voice below. The selected effect is highlighted.

The "Karaoke: on/off" toggle stays (host only). "Liked songs" is unchanged —
it is a shared panel, not part of this page.

## 3. Live singing — everyone hears the singer's voice, with an animation
The voice streaming was already in the app (WebRTC, singer's mic with
effects, sent to every listener), but nothing showed it. Now when someone
starts singing:

- **Everyone hears the singer's voice live**, over the music, through
  WebRTC — the same low-latency channel StarMaker uses. The singer's mic
  (with the chosen voice effect) is sent to every listener, and each
  listener hears it mixed with the song playing on their own device.
- **The stage visualizer animates with the singer's voice.** On the
  singer's screen the bars are driven by their own microphone level. On
  every listener's screen the bars are driven by the voice stream arriving
  over WebRTC — so the animation moves with the voice they actually hear,
  in sync with it. When nobody is singing, the bars sit flat.
- **The stage shows a LIVE badge** and the singer's avatar pulses while
  they are singing.

## How StarMaker does the sync — and what we do
StarMaker mixes the voice and the music together on the SINGER's device and
streams that one mix to everyone, so the voice and the music are in perfect
sync with each other (they were mixed before streaming). Vibe Room plays the
music on each person's own device (YouTube, synced to the server clock) and
streams only the voice over WebRTC. The voice arrives about 0.1–0.3 seconds
after the singer sings — that is the internet delay, and it is the lowest
latency a web app can get (WebRTC is the same channel video calls use). So
the voice lands within a fraction of a second of the beat. Exact 0ms is
impossible over the internet, for anyone — StarMaker included. What you get
here is the closest a browser app can do: the music is already synced, and
the voice is streamed on the fastest channel available.

## Honest limits
- The voice needs a microphone and https (or localhost) — the browser will
  ask for mic permission the first time the singer taps "Start singing".
  If permission is denied, the singer sees "Allow microphone access to
  sing."
- The voice stream uses STUN only (no TURN server), so on a very strict
  network (some offices, some mobile carriers) the voice may not reach a
  listener even though the music plays. A TURN server would fix that, but
  it needs a paid relay.
- The sandbox cannot test a real microphone or real WebRTC audio, so the
  voice path is verified by code + UI test only — please test it on real
  phones with two people in a room.

## What did NOT change
- v25's host-stays-host, v24's instant sound, v23's smooth playback,
  v22's unlock button, v21's instant pause are intact.
- The voice effects, recording, "Hear myself", and the karaoke mode
  toggle all work exactly as before.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v26 - karaoke redesign, host sings directly"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
