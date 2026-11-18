# Vibe Room v48 — background audio (wake lock + instant resume + Safari tip) + voice effects as one sliding row with circle images

Built on v47. Two changes, from Abhi.

## 1. Background audio — the music must not stop when the screen locks or the app is left
Abhi: the song still stops when he locks the screen or switches apps.
What was already live (v45 Rev 3, in v46 on the site): retry the resume
every 2s for 30s after hiding. That was not enough — once the phone fully
suspends the home-screen app, no JavaScript runs at all, so no retry can
fire. v48 attacks the problem from the side that actually works:
- **Screen wake lock.** While a song is playing, the app holds a screen
  wake lock, so the screen stays on and the app stays in the foreground
  — the music cannot stop if the screen never locks. Released when the
  room pauses or the song ends. Re-requested every time the page becomes
  visible again and on every state update (the system drops the lock
  whenever the page hides). Not supported everywhere — a missing API is
  a silent no-op.
- **Resume safety net.** A 1s check: while the page is visible and the
  room is playing, a paused player is resumed by itself, even if the
  user does not tap anything. The local-toggle guard keeps it from
  undoing your own intentional pause.
- **Safari tip (More tab).** Shown only when the app runs from the home
  screen. It says plainly that the phone pauses the music when you leave
  the app, and links the current room into Safari, where YouTube audio
  keeps playing in the background. Hidden in a normal browser tab.
Verified: wake lock held while playing, released on pause, re-acquired
on resume; the safety net resumed a system-paused player within 1s with
no tap; the Safari tip is hidden in a normal browser tab. Zero errors.
HONEST LIMIT: the audio comes from a YouTube video embed, and the phone
decides whether a backgrounded video keeps sounding. In the home-screen
app, switching to another app still pauses it — no web page can override
the system suspending the app. The wake lock fixes the screen-lock case
(the screen stays on while music plays); Safari is the reliable path for
listening while using other apps. A direct audio stream (which would
background properly) needs the audio file itself — that is the MP3-upload
route offered earlier, not a YouTube link.

## 2. Voice effects — one sliding row, each effect with its own image in a compact circle
The 3-column grid is gone. All 11 effects now sit in ONE horizontal row
you swipe/scroll through. Each effect is a compact pill with its own
related image in a small circle next to the label (new `public/fx/`
images, 128×128, ~60K total): Dry (studio microphone), Hall (concert
hall), Party (disco ball), Warm (amber sunset), Fascinating (magic
stars), Distant (mountain valley), Vinyl (vinyl record), Church
(cathedral), Dreamland (clouds and moon), Hi-Fi (headphones), Super
reverb (canyon echo). The selected effect keeps the gradient pill, and
its circle gets a brighter ring. The row snaps as you swipe and the
scrollbar is hidden. Verified: all 11 buttons sit in exactly 1 row, the
row scrolls (scrollWidth 1226 vs 298 visible), and all 11 images load.
