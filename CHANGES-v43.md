# Vibe Room v43 — liked-songs slide-in panel + beat-reactive smoke + docked bottom nav + mandatory audio ask

Built on v42. Four changes, all from Abhi.

## 1. Liked songs: heart icon top-right, slides in a panel
A pink heart icon now sits in the header (top right, next to the history
button). Tapping it slides in a drawer from the right with every liked
song — artwork, title, Add to queue / Request button, and a ✕ to remove
it from likes. Songs are saved forever on the device (localStorage), so
the panel always shows the full collection. Close with the ✕, the dim
backdrop, or Escape. The old "Liked songs" card in the More tab is gone;
this panel is its home.

## 2. Beat-reactive smoke (player card)
The cosmic smoke used to drift at one fixed rate. Now, while a song
plays, a beat engine fires on every beat (~120 BPM with jitter, every
4th beat a stronger downbeat): each of the 8 clouds jumps to a new
RANDOM direction, distance and size at a random speed, the glow thumps,
and particles burst upward — so the smoke moves randomly in every
direction with the song's rhythm instead of one steady drift. While
paused the beat stops and the slow CSS drift takes over again. Reduced
motion is respected (no beat engine).
HONEST LIMIT: the smoke cannot read the real YouTube audio — it plays
inside YouTube's own frame, which the page cannot analyse, so there is
no live frequency data. This is a beat simulation driven by playback,
not a live audio read. It looks like it is reacting to the music.

## 3. Bottom navigation docked at the very bottom
The tab bar used to float 12px above the bottom edge. It now sits at
the VERY bottom of the screen — flush with the usable edge above the
home indicator (safe-area bottom). Top corners stay rounded, bottom
corners are square so it reads as a docked bar. Docking it also gives
the raised mic 12px more room, so the orb row / player bar clearances
grow. All the v42 no-overlap rules still hold.

## 4. Mandatory audio ask — only after joining/creating, nowhere else
The "Enable sound" popup is now MANDATORY on every room entry: it
appears just after joining or creating a room, every single time — even
if sound was enabled in a previous session (the old "remembered" skip
is removed). It appears once per page load, and only there. It is NEVER
asked again: the "Tap to enable audio" button that used to pop up after
adding a song or while playing is removed entirely (both the
autoplay-blocked handler and the interval check). Sound still turns on
from any tap on the page or the Play button, so nothing is lost.

## 5. No more short audio cuts — continuous smooth playback
While a song played, the sound sometimes cut out for a moment, then
played, then cut again. Two causes, both in the playback loop:
 (a) `capQuality()` re-applied the 240p cap every 2 seconds whether it
     was needed or not — each call forced YouTube to re-evaluate the
     stream, which gaps the audio for a moment, over and over. It now
     checks the current quality first and does nothing when it is already
     small/tiny; it only steps in if YouTube actually creeps the quality up.
 (b) A drifting player could seek, re-buffer, drift again and seek again
     in a loop (cut, play, cut, play). Seeks now have a 3-second cooldown:
     never twice within 3s. The fresh-load catch-up seek is exempt (it
     must jump once, immediately). The gentle speed nudge (±15%) still
     handles drift under 1s without ever interrupting the audio.
HONEST LIMIT: these were the cuts the app itself caused. The sandbox
cannot hear real YouTube audio, so the fix is proven by the code path
(no repeated quality calls, no repeated seeks) — Abhi should confirm on
a real phone that a full song now plays straight through.
## 6. Equalizer removed from the player card
The animated equalizer bars under the vinyl are gone (the karaoke mic
visualizer in the Sing tab is untouched — that one shows your voice).
