# Vibe Room v25 — host stays host in the background

Built on v24. The host lost the host seat the moment they switched to another
app on their phone, and it went to the next person. Fixed.

## Why it happened
It was not the 30-second grace timer — that only fires after 30s. It was the
rejoin. When the host's phone went to another app, the connection dropped.
When they came back, the app re-joined the room — but the server saw the old
entry still marked "connected" (the drop had not been processed yet) on a
different socket, assumed it was a second tab, and gave the returning host a
brand-new id. A new id is a new person, so they were no longer the host. The
old host entry then timed out and the seat passed to the next person.

## The fixes (server.js)
1. **Rejoining keeps your identity.** The server now only hands out a fresh
   id if the old socket is genuinely still alive (a real second tab). If the
   old socket is already dead, it is the same person reconnecting — after
   another app, or a network blip — so they keep the SAME id, their name,
   their role, and the host seat. The returning host also clears the grace
   timer, so the seat is never passed on.
2. **Host grace is now 12 seconds, as asked.** The host only loses the seat
   after being offline for more than 12 seconds. Switching to another app
   for a few seconds, or a short network drop, does not move the seat. If
   the host is genuinely gone for over 12 seconds, the seat passes to the
   next person (a co-host first, else the earliest joiner), as before.
   Tapping "Leave room" still passes the seat on at once.

## Background audio
Nothing in the app pauses the music when the page goes to the background —
the player and the lock-screen controls keep it playing while the host is in
another app. The connection itself may still drop while backgrounded (the
phone's system suspends background pages; no web app can prevent that), but
coming back re-joins and restores the host seat within the 12 seconds.

## Honest limits
- If the host stays in another app (or offline) for more than 12 seconds,
  the seat WILL pass to the next person, by the rule above. Coming back
  after that does not take the seat back — the new host keeps it until they
  leave or go offline. That is the rule you set.
- The 12-second clock starts when the server notices the connection drop,
  which can be a few seconds after the phone actually went to another app.

## What did NOT change
- v24's instant sound for everyone (Join tap unlocks audio) is intact.
- v23's smooth playback, v22's unlock button, v21's instant pause are intact.
- Host-only controls, song requests, Leave room, yellow toasts, bottom bar
  are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v25 - host stays host in background"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
