# Vibe Room v36 — history menu + nothing lost on refresh

Built on v35. Two things:

## 1. A three-dots menu with all your history
A ⋮ (three dots) button now sits in the room header, next to Invite.
Tapping it opens a panel with two sections:
- **Rooms** — every room you visited, most recent first, with when you
  were last there and a **Rejoin** button.
- **Songs played** — every song that played in a room, most recent first,
  with when it played. Each song has **Copy link** (copies the YouTube
  link) and **Add to queue** (adds it back to this room's queue — or sends
  it as a request if you are a guest).
- **Clear history** wipes both lists on this device.

## 2. A refresh loses nothing anymore
- **History is saved on your device** (localStorage): rooms (up to 20) and
  songs (up to 100). Close the tab, reload the page, come back tomorrow —
  they are still there. Old recent-room codes you already had are migrated
  in, so nothing you had is lost.
- **Your session is restored on refresh.** If you reload the page while
  in a room, you are back in that same room instantly — your name is
  already filled in, so you rejoin right away, with the same queue and
  the same song the room has. Tapping **Leave room** clears the saved
  room, so a refresh after leaving does not put you back in.
- **One honest limit:** the room itself lives on the server. If the room
  is empty for 24 hours it expires on the server, and then a rejoin shows
  "Room unavailable" — the history still lists it, but the room is gone.
  Your history (rooms + songs) never expires; it is on your device.

## 3. The small music notes are smaller
The notes around the vinyl were 2–2.6rem — far too big for a decoration.
They are now ~0.85–1.15rem: small, clean, and out of the way.

## What did NOT change
- v35's sound popup + desktop layout + README iPhones, v34's logo +
  music notes, v33's voice-to-everyone + "Hear myself" fix, v32's karaoke
  voice fix + mini prev/next, v31's premium icons + Queue spacing, v30's
  sound-at-start, v29's installable app, v28's Queue cards, v27's shared
  duration, v26's karaoke redesign, v25's host-stays-host, v24's instant
  sound, v23's smooth playback, v22's unlock button, v21's instant pause
  are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v36 - history menu, refresh keeps everything"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
