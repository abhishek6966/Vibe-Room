# Vibe Room v23 — no more lag or buffering mid-song

Built on v22. The song used to stall in the middle. Three causes, three fixes.

## Why it lagged mid-song
1. **Too many seeks.** v20 tightened the sync so it sought whenever the drift
   passed 0.5s. But every seek throws the player's buffer away and the song
   has to re-buffer from the new position — so a seek IS a stall. Tight sync
   and smooth playback fight each other.
2. **The quality cap was only applied when a track loaded.** YouTube's
   adaptive streaming can creep the hidden player's quality up mid-song
   (1080p for a picture nobody sees), which needs far more bandwidth and
   stalls on a slow connection.
3. **The preload player competed for bandwidth.** While the current song
   plays, the hidden 2nd player buffers the next song. If the current song
   is already struggling (buffering), the 2nd player stealing bandwidth
   makes the stall worse.

## The fixes (app.js)
1. **Seeks are now rare.** While playing, the sync only seeks past 1.0s of
   drift (was 0.5s). Drift up to 1.0s is corrected gently by nudging the
   speed ±15%, which never interrupts the audio. The song plays straight
   through; the sync converges gradually instead of jumping. The "In Sync"
   line now means within 1.0s. (A seek while paused is unchanged at 0.5s —
   nothing is playing then, so it cannot stall.)
2. **The 240p cap is re-applied every 2 seconds.** If YouTube creeps the
   quality up mid-song, it is pushed back down to 240p. The sound is
   identical at every quality — only the hidden picture gets smaller — and
   240p needs a fraction of the bandwidth, so it almost never stalls.
3. **No preload while the current song is buffering.** If the live player is
   in the buffering state, the 2nd player does not start loading the next
   song. It resumes once the current song is playing again.

## The tradeoff, stated plainly
Sync is now within about 1 second instead of about half a second. That is
the price of a song that never stalls: a seek is a stall, so fewer seeks
means smoother playback. A 1-second difference between listeners is far less
noticeable than a song cutting out in the middle. If you would rather have
tighter sync and accept the occasional stall, that is a one-line change back.

## What did NOT change
- v22's autoplay fix (first tap anywhere turns sound on; the unlock button
  appears reliably) is intact.
- v21's instant pause (2–3ms) and SCHED=200 are intact.
- Host-only controls, song requests, Leave room, yellow toasts, the bottom
  bar, the 12s stuck-buffer watchdog, and the "never seek while buffering"
  rule are intact.

## Honest limits
- This removes the stalls the app itself was causing (seeks, high quality,
  preload competing). It cannot fix a listener's own internet — if someone's
  connection drops entirely, their player will still buffer until it comes
  back. The 12s watchdog still reloads a stream that is wedged for 12s.
- Real YouTube audio cannot be heard in the sandbox, so this is verified
  with a simulated player here (see below). Please confirm on real phones
  that a song plays straight through with no stall in the middle.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v23 - smooth playback, no mid-song buffering"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
