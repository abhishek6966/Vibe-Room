# Vibe Room v27 — same song duration on every screen + karaoke redesign (v26)

Built on v26. This zip includes v26's karaoke work AND the duration fix below,
so it is the one to push.

## The duration fix
The player showed a different total length on different phones — sometimes
0:00 on one phone while another showed the real length. The cause: the total
length came from each phone's OWN YouTube player (`getDuration()`). A phone
whose player had not finished loading the video's details yet reported 0, so
it showed 0:00, while a phone that had loaded it showed the real length.

Now the length is shared, not per-phone. Whichever participant's player
first learns the real length reports it to the server once; the server keeps
it on the song and sends it to everyone. From then on every screen shows the
same total length, and the progress bar and the lock-screen controls use that
same shared length. Before anyone's player has learned it, every screen
consistently shows 0:00 — never a different number on different phones.

- Server: the track carries `duration` (0 until learned); a new `dur` action
  accepts the first valid report (a finite number of seconds) and pushes it
  to the whole room. The duration survives a replay and a repeat-all loop.
- Client: the player page shows the server's shared length (falling back to
  the local player only until the server knows it), reports the local length
  once per song, and the seek slider and lock-screen position use the shared
  length too.

## Also in this zip — v26 karaoke redesign
- The host no longer has to request to sing: a "Sing this song" button makes
  the host (or a co-host) the singer at once. Guests still request, and the
  host picks them from the "Waiting to sing" list.
- The Sing page is rebuilt into four clean sections: STAGE (who is singing,
  the song, a LIVE badge, and a 24-bar live voice visualizer) · YOUR TURN
  (one clear action) · MIC (singer controls, only when you are the singer) ·
  VOICE EFFECTS (the eleven presets in a 3-column grid).
- When someone starts singing, everyone hears their voice live over the
  music (WebRTC, the same low-latency channel video calls use), and the stage
  visualizer animates with the singer's voice — from their mic on their
  screen, and from the arriving voice stream on everyone else's screen, so
  the animation moves with the voice they actually hear. How StarMaker does
  the sync, and what we do, is explained in CHANGES-v26.md.

## Honest limits
- The shared length appears as soon as ANY participant's player loads the
  video's details — usually within a second of the song starting. Until
  then every screen shows 0:00, consistently.
- The length comes from YouTube's own metadata for that video, so it is the
  same video's length on every phone by construction.
- The voice path (karaoke) still needs a microphone + https, and the sandbox
  cannot test real mic/WebRTC audio — please test singing on real phones.

## What did NOT change
- v25's host-stays-host, v24's instant sound, v23's smooth playback,
  v22's unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v27 - same duration everywhere + karaoke redesign"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
