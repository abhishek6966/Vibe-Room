# Vibe Room v21 — instant pause + bottom player bar on every page

Built on v20. Two things Abhi asked for.

## 1. Pause stops instantly (was ~1s late)
**The problem:** v17's scheduled start made every play/pause take effect at
server time now()+800ms, so all devices would pause together. But that meant
when you tapped Pause, the sound kept playing for almost a second — it felt
broken.

**The fix (server.js + app.js + extras.js):**
- The scheduled delay is cut from 800ms to **200ms** (`SCHED=200`), so the
  group still follows together but the wait is too short to notice.
- The device you tap now pauses/plays its **own** player instantly
  (`localToggle()` in app.js): the moment you tap, the sound stops (or
  starts) right there. The server's broadcast then lands on the same
  position, so nothing jumps or skips.
- `localToggle()` is wired into every way you can pause/play: the Play
  button (`#pp`), the vinyl hub (`dp`), the bottom bar (`#mp`), and the
  phone's lock-screen controls (Media Session).

**Honest limit:** the pause is instant on the phone you tap. The other
phones follow ~200ms later (the scheduled group time) — far too short to
notice, and the sync loop still pulls everyone within ~half a second.

## 2. Music keeps playing + a bottom player bar on every page
**The problem:** when you changed to another tab (Queue, Sing, Room, More),
the music stopped. That is because the whole Play stage (which holds the
YouTube player) was `display:none` on those pages, and a player inside a
`display:none` box can pause.

**The fix (style.css + extras.js):**
- The stage is no longer `display:none` on other pages. It becomes a **1px
  invisible box** instead — still rendered, so the player keeps playing, but
  it takes no space and shows nothing.
- The mini-player is now a **compact bottom bar on EVERY page**, not just the
  Play page. It sits just above the tab bar whenever a song is playing or
  paused, and slides away when there is no song. It shows: the song artwork,
  the title, and three buttons — Previous, Play/Pause, Next.
- Prev and Play/Pause follow the same host rule as the main controls
  (greyed out for guests without control). Next stays enabled for everyone —
  a guest's tap is a vote to skip, as before.
- The list pages (Queue, Room, More) get extra bottom room so the last item
  no longer hides behind the bar. The Play page is untouched, so its
  one-screen fit is unchanged.

**Honest limit:** the sandbox cannot play real YouTube audio, so the "music
keeps playing across tabs" fix is verified structurally here (the stage is
rendered, not `display:none`, and the player's state stays "playing" when you
switch pages). Please confirm on a real phone that the sound keeps going when
you switch tabs — that is the real test.

## What did NOT change
- Everything from v20 is intact: host-only controls, song requests
  (approve/reject), the tighter sync bands, Leave room, yellow toasts, the
  v18 queue-card fix, the v19 unmute fix, and the v16 header/icon buttons.
- The Play page looks the same. The bottom bar only appears when a song is
  loaded; it hides when the room is empty.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v21 - instant pause, bottom player bar"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
