# Vibe Room v53 — TIGHTER SYNC (fixes the 5s+ lag)

## Why the APK and the web app drifted 5+ seconds apart
Abhi reported the APK and the web app were more than 5 seconds out of sync.
Root cause, found by reading the sync loop (`sync()` in `public/app.js`):

1. **The buffering trap (the main cause).** The old code NEVER sought while
   the player was buffering (state 3). A slow WebView (the APK) that kept
   buffering sat further and further behind with NO correction at all —
   no seek (requires state 1 or 2) and no effective speed nudge (drift
   over 2s gets no rate change). The server's position kept advancing
   while the player's was frozen, so the lag grew to 5s+.
2. **The safety net was too slow.** The stuck-buffer watchdog only fired
   after 12 seconds of continuous buffering — long after a 5s lag was
   already visible.
3. **The design tolerance was ~2s.** v45 deliberately loosened sync to
   ~2s (from ~1s) to stop audio cuts. So even in the best case the two
   devices could sit ~2s apart and the app called that "in sync".

## What changed
- **Rescue seek while buffering:** if the player is buffering AND more
  than 3s behind, `sync()` now seeks anyway — YouTube re-buffers at the
  right position instead of staying behind. This breaks the trap.
- **Tighter thresholds:** the speed nudge now covers 0.5s–1.5s (was
  0.5s–2s) and the drift seek fires at 1.5s (was 2s), so the room holds
  within ~1.5s instead of ~2s. The 3s seek cooldown stays, so seeks
  still cannot loop and cut the audio. The "In Sync" indicator now uses
  the same 1.5s line.
- **Faster safety net:** the stuck-buffer watchdog fires after 5s of
  continuous buffering (was 12s) — it reloads the track at the live
  position.
- **Fresher state:** the server heartbeat is now every 1s (was 2s) and
  the client ping every 2s (was 5s), so the clock-offset / RTT estimate
  stays fresh and corrections land sooner.

## Honest limits
- Exact 0ms sync is still impossible over the internet (network delay,
  phone clocks, Bluetooth). The target is now ~1.5s, not 0ms.
- A tighter seek threshold means slightly more seeks than v52; the 3s
  cooldown and the capped 5% speed nudge are kept to protect the
  no-cuts behaviour. If cuts come back, the threshold is the first thing
  to loosen again.
- The sandbox cannot hear real YouTube audio or run a real two-phone
  sync test — Abhi must confirm on the APK + web app together.
