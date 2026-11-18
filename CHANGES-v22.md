# Vibe Room v22 — everyone hears the song (autoplay fix) + new-build review fixes

Built on the new build Abhi supplied (the Copilot commits after v21), not on v21
directly. That build is kept intact except for the fixes below.

## Why some people heard nothing
This is the browser's autoplay rule, not a bug in the room: a browser will
not play sound until the person has tapped the page. When someone joins a room
where a song is already playing, the player tries to start but the browser
blocks the sound. People who had already tapped something (or on a lenient
browser) hear it; people on iPhones, or who just opened the link and stared
at it, hear nothing. The new build already had a "Tap to enable audio"
button, but it only appeared when YouTube fired one specific event, so it did
not always show — and there was no fallback if the person never tapped it.

There is no way to make sound play with zero interaction — the browser
forbids it, by design. What v22 does is make the very first tap turn the
sound on, and make the prompt impossible to miss.

## The fix (app.js)
1. **First tap anywhere turns the sound on.** A new `unlockOnTap` handler
   listens for the first tap anywhere in the room (a tab, a button, the page
   itself). If the room is playing but this person's player is paused or
   muted, that tap unmutes it and starts it. After that one tap, sound works
   for the whole session. It is a no-op once the player is playing, and it
   never undoes your own intentional pause.
2. **The "Tap to enable audio" button now appears reliably.** It no longer
   depends only on YouTube's `onAutoplayBlocked` event (which does not fire
   in every browser). A check runs twice a second: if the room is playing but
   this player's video is paused, the button appears. So even if the person
   never taps anything, they see a clear button to tap.
3. **The button sits above the mini bar.** It was at the same height as the
   bar and could hide behind it. It now sits just above the bar, so both are
   visible and tappable at once.

## Two small fixes from reviewing the new build
4. **Guest Next button in the bottom bar is now greyed out.** Vote-to-skip
   was removed in the new build (only the host / controllers can skip), and
   the main Skip button is correctly disabled for guests — but the bottom
   bar's Next button was still enabled, so a guest could tap it and nothing
   happened. It now matches the main button.
5. **Bottom bar clears the raised Sing mic again.** The new build lowered
   the bar to 120px from the bottom, which clipped the top 5px of the raised
   mic. It is back at 133px, so the mic is fully visible.

## What the new build (Copilot) already brought in — kept as-is
- **YouTube embed restriction checks:** as you type a link, the app checks
  whether YouTube allows that video to be embedded, and shows it under the
  paste bar. Blocked / unavailable links are rejected at add time with a
  clear message instead of becoming a dead track. NOTE: this needs a
  `YOUTUBE_API_KEY` on the server to work. Without one it reports
  "cannot be checked yet" and lets you try adding the video anyway. On
  Render's free plan there is no key set, so this check does nothing there
  unless you add one.
- **Per-tab identity:** each browser tab now gets its own id (was shared
  across tabs), so opening the room in two tabs no longer confuses the
  server about who you are.
- **Room join recovery:** a bad/expired invite link now shows a proper
  "Room unavailable" screen with a "Create a new room" button and a home
  link, instead of a bare error. Reconnecting re-joins the room automatically.
- **"Tap to enable audio" button** (the first version of the autoplay fix)
  and **paused tracks no longer autoplay** when they load.
- **Queue now shows the current song** at the top with a Playing/Paused
  badge, "Tonight" is renamed "Recently played", and each played track has
  a Replay / Request button.
- **Mute button + max-volume button** in the volume row, and a richer
  lock-screen (Media Session) with track info, position, and seek.
- **Compact controls:** the orb rows are now a single row. The Sleep timer
  and the Share-song button were removed to make room. Vote-to-skip was
  removed — only the host, co-hosts, and people given control can skip now.
  (In v20, vote-to-skip was kept deliberately as a group decision.)

## What did NOT change
- v21's instant pause (2–3ms, localToggle + guard) and SCHED=200 are intact.
- Host-only controls, song requests (approve/reject), tighter sync, Leave
  room, yellow toasts, the v18 card fix, and the v19 unmute fix are intact.
- The mini bar still shows on Queue/Sing/Room/More; it is intentionally
  hidden on the Play tab in this build (the Play page already has the full
  controls), which is a change from v21 where it showed on Play too.

## Honest limits
- Sound still needs one tap. If a person opens the link and never taps
  anything at all, they will see the "Tap to enable audio" button but hear
  nothing until they tap it (or anything else). That is the browser's rule
  and no app can bypass it.
- Real YouTube audio cannot be heard in the sandbox, so this fix is verified
  with a simulated blocked player here (see below). Please confirm on real
  phones that a joiner who has not tapped yet hears the song after one tap.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v22 - autoplay fix for joiners"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
