# CHANGES — v20 (on v19)

Three things at Abhi's order of 2026-11-17 ~19:47–19:51 EST: host-only controls
with song requests, tighter real-time sync, and a Leave button + yellow
glassmorphic notifications.

## 1. Host controls + song requests (server.js, app.js, extras.js, index.html)
- **Only the host controls play/pause and all controls by default.** The host
  and co-hosts always have control. Everyone else's Play, Pause, Prev, Skip,
  Seek, Shuffle, Repeat and Speed buttons are greyed out, and the server
  rejects those actions even if someone sends them directly — so a guest
  cannot pause, skip or change the song without permission.
- **The host can give control to any person.** In the Room tab, under each
  person, the host sees a "Give control" button. Tap it and that person can
  play/pause, skip, go back, change speed/repeat/shuffle and add songs
  directly (their name gets a 🎛 badge). Tap "Take control" and the access is
  gone at once. The host can also still make someone a co-host or the host.
- **Guests can request a song.** A guest pastes a YouTube link and it does NOT
  go straight into the queue — it goes into a "Requests" section at the top of
  the Queue tab. The guest's button says "Request" (not "Add") and they see
  "Waiting for host approval". The host sees each request with a green
  **Approve** button and a red **Reject** button. Approve puts the song into
  the queue (or starts it if nothing is playing); Reject removes it and tells
  the person who asked. Guards: a guest can have at most 3 requests waiting,
  at most 20 requests in a room, no duplicates of a song already queued,
  playing or requested, and the host can close requests with the lock button.
- **The lock button now closes requests.** It used to lock playback; playback
  is now host-only by default, so the lock button now opens/closes song
  requests instead ("Close requests" / "Open requests"). Same button, same
  place in the header.
- **Vote to skip stays.** Guests can still vote to skip (50% of listeners),
  because that is a group decision, not one person controlling the song.

## 2. Tighter real-time sync (app.js sync())
- The drift bands are tighter so every listener hears the same second: ignore
  drift under 0.15s, nudge the speed ±15% for drift 0.15–0.5s, and seek past
  0.5s (was: ignore 0.25s, nudge ±8% to 1.5s, seek past 1.5s). The "In Sync"
  badge now means within 0.5s (was 1.5s). It still never seeks while the
  player is buffering, so the v9 buffer-seek stall cannot come back.
- Honest limit, unchanged: exact 0ms is impossible over the internet with
  YouTube embeds (network delay, phone clocks, Bluetooth 100–300ms per
  device). v20 keeps everyone within about half a second.

## 3. Leave room + yellow glass notifications (app.js, server.js, index.html, style.css)
- **Leave room:** a big pink "Leave room" button in the More tab, under "You".
  Tap it any time and you go back to the home page. If you were the host, the
  host passes to the next person at once (instead of the 30s wait a plain
  disconnect gets).
- **Notifications redesigned:** every toast ("X added Y", "X joined", "Host
  approved…", and all the others) is now a compact yellow glass box — warm
  yellow-to-amber gradient, frosted blur, soft glow, dark text, small and
  centred at the top. All kinds of notifications use the same yellow box.

## Also fixed while building v20
- The Room user row now has four host buttons, so the actions wrap onto their
  own rows below the name (two rows of two) instead of squeezing the person's
  name out of the card.

## Verified (two-client mock-player test, PORT 3014, zero page errors)
- Guest Play/Prev disabled; a direct server play from a guest is rejected
  (song keeps playing). Host grants control → guest can pause and resume.
  Host revokes → guest is blocked again. Guest request → appears in Requests
  (not the queue), host Approve → into the queue, host Reject → gone, queue
  unchanged. Guest 1s behind while playing → seeks once, lands at 0.0s drift.
  Guest Leave → lands on home, host's user list drops to 1. Toast reads as
  the yellow gradient with dark text. Screenshots: host Requests (Approve/
  Reject), guest Play disabled, host Room (Give control, two button rows),
  host More (Leave room), yellow "Guest50 joined" toast.
- No visual changes otherwise. v18's queue-card fix, v19's unmute fix, v17's
  sync, v16's header/logo and all earlier UI are untouched.
