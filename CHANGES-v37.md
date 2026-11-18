# Vibe Room v37 — neon cosmic smoke in the player + history + README retaken

Built on v36. This version contains the history menu and the cosmic smoke,
and the README screenshots were retaken with the smoke showing.

## 1. Neon Cosmic Smoke in the player card
The main player card (the vinyl, tonearm, equalizer, song info and controls)
now has a living neon cosmic smoke background, ONLY inside that card:
- **Six flowing smoke clouds** in the neon palette (electric purple
  #761BFF, neon magenta #FF26B8, electric cyan #00D9FF, deep blue #153BFF,
  hot pink #FF397F, radiant orange #FF8A24), each a blurred radial-gradient
  cloud drifting, expanding and morphing on its own slow path, blending
  where they overlap (screen blend) so the colours flow into one another.
- **A soft rhythmic pulse** — a glowing magenta/purple halo that breathes
  in and out behind the vinyl.
- **Floating glowing particles** — small bright dots drifting upward.
- **It breathes with the music:** while a song plays, the clouds brighten
  and drift faster, the pulse quickens, and the particles liven up. When
  the music pauses, it all settles back to a calm, slow glow. No abrupt
  changes, no flashing.
- **Only inside the card:** the smoke is clipped to the card's rounded
  corners (overflow:hidden), sits behind the vinyl/tonearm/equalizer/
  controls (z-index 0, pointer-events:none), and nothing outside the card
  changed. No layout, vinyl, tonearm, control, slider, queue, karaoke or
  navigation change. No second audio system, no interference with YouTube
  or Socket.IO sync. Respects prefers-reduced-motion (the smoke goes still
  and dim).

**Honest note:** the pulse is a smooth rhythm tied to play/pause, not a
live beat read — the YouTube audio plays inside YouTube's own frame, which
the page cannot analyse, so no web app can do a true audio-reactive read
on it. It looks and feels in sync with the music, but it is not a real
audio analyser.

## 2. History menu + nothing lost on refresh (v36, included here)
- A ⋮ (three dots) button in the room header opens a panel with **Rooms**
  (every room you visited, with a Rejoin button) and **Songs played**
  (every song that played, each with **Copy link** and **Add to queue**).
- History is saved on your device (localStorage): rooms (up to 20) and
  songs (up to 100). A refresh never loses them.
- **Your session is restored on refresh.** Reload while in a room and you
  are back in that same room instantly, with the same queue and song.
  Tapping **Leave room** clears the saved room, so a refresh after leaving
  does not put you back in.
- Limit: the room itself lives on the server — if it is empty for 24 hours
  it expires there, and a rejoin shows "Room unavailable". Your history
  never expires; it is on your device.
- The small music notes around the vinyl are now actually small
  (~0.85–1.15rem, was 2–2.6rem).

## 3. README screenshots retaken
All 9 README images were retaken fresh from this version (with the cosmic
smoke showing on the Play screen) and put in the same 3D iPhone frames
(titanium body, Dynamic Island, gentle tilt, drop shadow).

## What did NOT change
- v35's sound popup + desktop layout, v34's logo + music notes, v33's
  voice-to-everyone + "Hear myself" fix, v32's karaoke voice fix + mini
  prev/next, v31's premium icons + Queue spacing, v30's sound-at-start,
  v29's installable app, v28's Queue cards, v27's shared duration, v26's
  karaoke redesign, v25's host-stays-host, v24's instant sound, v23's
  smooth playback, v22's unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v37 - cosmic smoke, history, readme retaken"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
