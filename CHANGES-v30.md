# Vibe Room v30 — ask for sound at the start (installed app)

Built on v29. When the app is opened from the home screen (or in the
browser), it now asks for sound right at the start, so the music plays the
moment a song starts.

## What changed
- **A "Tap to enable sound" button at the start.** It sits on the home
  screen (under "Create a Vibe Room") and on the join screen (above "Join
  audio stream"). One tap unlocks sound for the whole session, and the
  button turns into a quiet green "✓ Sound on" confirmation. In the
  installed app (home screen) it gently pulses, so it is the first thing
  the person notices when the app opens.
- **What the tap does:** it resumes an audio context and unmutes the
  player. That tap is the browser's "permission" for sound — a browser will
  not play sound until the person has tapped the page, and this tap is the
  one that unlocks it. After it, when the host plays a song, it just plays,
  for everyone, with no further tap.

## The honest note — there is no system "Allow audio?" popup
For speakers (sound output) the browser does NOT show a system permission
popup the way it does for the microphone. The "Allow microphone?" dialog
you may have seen is for mic input only — it is not for hearing music, and
asking for mic access just to unlock speakers would be wrong and confusing.
So the app asks with its own clear tap at the start, which is exactly what
unlocks the sound. That is the correct way to do it on the web, in Chrome
and in Safari, installed or not.

## What did NOT change
- v29's installable app, v28's premium Queue tab, v27's shared duration,
  v26's karaoke redesign, v25's host-stays-host, v24's instant sound,
  v23's smooth playback, v22's unlock button, v21's instant pause are
  intact.
- The "Tap to enable audio" button inside a room (v22) and the Join-tap
  unlock (v24) are still there as backups — if someone skips the start
  prompt, the first tap in the room still unlocks sound.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v30 - ask for sound at the start"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
