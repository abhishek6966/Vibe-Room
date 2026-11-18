# CHANGES — v17 (on v16)

All three YouTube-sync improvements, built at Abhi's order of 2026-11-17 ~18:13 EST
("Build all three sync improvements"). No visual changes — the Play page, header,
landing and gate are identical to v16.

## 1. Scheduled start — play / pause / seek / track-change all land at the same instant
- Before: when the host pressed play, the server applied it at once and every
  phone started the moment its own copy of the message arrived — those moments
  differ by network delay, so play/pause could be ~0.3–0.5s apart.
- Now: the server schedules every timing action for a server time 800ms in the
  future (`SCHED=800` in server.js) and sends that time (`playAt`) with the state.
  Each phone works out the server clock from the state's `now` plus half its
  round-trip, and waits until that exact instant before it starts, pauses or
  seeks. The anchor is set relative to the scheduled instant, so the position
  is exact at that moment. Track changes (`next`, `prev`, `skip`, `ended`) and
  speed changes are scheduled the same way.
- Verified with a mock player: pause and play are both delayed ~880–905ms after
  the press (the 800ms schedule + a little overhead) and do NOT fire within the
  first 300ms. Expected real-world play/pause offset: ~0.1–0.2s (was ~0.3–0.5s).

## 2. Preload the next track — song changes start instantly
- A 2nd hidden YouTube player (`#pl2`, 1px, off-screen) now pre-buffers the next
  track in the queue (`cueVideoById`) while the current one plays.
- When the room moves to that track, the two players swap: the preloaded one
  becomes the live player and starts at once, and the old one is stopped so its
  audio doesn't keep playing. If the 2nd player can't start, the room falls
  back to the single player (no crash, just no preload benefit).
- Both players share the same event handlers (ready / ended / error), guarded so
  only the live player can trigger a skip or an error report. Volume is set on
  both players.
- Verified with a mock player: the next track is cued into `pl2`; on skip,
  `loadVideoById` is NOT called for the new track (the swap was used), the old
  player is stopped, and the preloaded player starts playing it.

## 3. Faster join catch-up — a new listener is in sync in ~1s
- Before: a person joining mid-song started wherever the player happened to land
  and the sync loop only corrected it once the drift grew past 1.5s, so it could
  take several seconds to line up.
- Now: the first time a track is loaded for a device (`needCatchup`), the client
  seeks straight to the live position the moment the player can seek, instead of
  waiting for the drift threshold. The player also re-syncs when it starts
  playing or pauses (state-change hook).
- Verified with a mock player: a 2nd client joining mid-song lands 0.03–0.21s
  from the live position (was several seconds of drift), via one hard seek to
  the live position.

## Unchanged
- v13 smooth-playback fix intact (240p cap on BOTH players now, gentle drift
  bands ±8% / 0.25–1.5s, never-seek-while-buffering, 12s watchdog, RTT
  compensation, 2s heartbeat). v16 icon-only header buttons + 3D logo intact.
- Honest limit (unchanged): exact 0ms for everyone is still impossible over the
  internet with YouTube embeds (different network delays, phone clocks,
  Bluetooth 100–300ms per device). v17 tightens the sync a lot, it does not
  make it literally exact.

## Verified (PORT 3011, zero page errors)
- Mock-player test (`test-v17-sync.py`): all three improvements pass as above.
- Full 12-shot suite: landing, gate, play empty, queue, play track, sing off/on,
  room, more, share dialog + QR, desktop play + queue. Track added, Invite
  dialog opens with QR, desktop joins the same room. Zero page errors.
- Sandbox note (as before): the real YouTube player never loads here (no
  external network), so screenshots show 0:00 — the mock test is what proves
  the sync logic. Real two-phone listening is Abhi's test on real devices.
