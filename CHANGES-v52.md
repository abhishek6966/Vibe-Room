# Vibe Room v52 — Upload an audio file (the real background-audio fix)

## Why YouTube songs still stopped on lock / app-switch
The live site WAS on v50 (wake lock + resume + Safari tip, verified by
curl), and those fixes were live — but they cannot fix this. A YouTube
embed is a VIDEO element: iOS suspends it the moment the screen locks or
the user switches apps, and no web code can stop that. The wake lock only
keeps the screen on while the app is in the foreground; it cannot keep
audio alive once iOS backgrounds the page. The resume safety net only
helps when you come BACK to the app.

## The real fix: upload an audio file
A plain <audio> element is treated as AUDIO by the system, so it keeps
playing through lock and app-switching, with proper lock-screen controls
through Media Session. New in the Queue tab, under the paste box:
"Upload an audio file — keeps playing in the background". Tap it, pick
an .mp3/.m4a/.wav/.ogg from the device (max 25 MB); it uploads to the
room's server and plays for everyone, in sync, like any other song.

- Server: POST /upload (raw body, any audio MIME type) saves the file
  under a random id in public/uploads/ and returns {id,url,title}.
  The 'add' action accepts {au:id} and builds a track with kind:'audio',
  videoId 'au:<id>', src '/uploads/<id>.<ext>'. pub() now sends kind
  and src for the current track.
- Client: a hidden <audio id="au-el"> plus an adapter (PAU) that speaks
  the same API as the YouTube player (playVideo/pauseVideo/seekTo/
  getCurrentTime/getPlayerState/setVolume/loadVideoById/cueVideoById/
  getDuration/setPlaybackRate), so the sync loop, volume, seek and Media
  Session all work unchanged. P is the CURRENT player: sync() swaps it
  to PAU for an uploaded track and back to the YouTube player for a
  YouTube track, stopping the old player so the two never sound at once.
  The 2nd (preload) player is YouTube-only and skips audio tracks.
  Duration is reported to the server the same way (first valid report
  wins); a missing file (server restart wipes uploads) is reported as a
  bad track and skipped like any unplayable track.
- YouTube links work exactly as before. Uploaded files are the user's
  own files — nothing is downloaded from YouTube, no bypass.

## Bugs found while testing (all fixed)
1. `let auEl` was declared AFTER the top-level initPlayer() call, so the
   first run threw a temporal-dead-zone ReferenceError. Moved to the
   globals at the top of app.js.
2. The upload endpoint used express.raw({type:'application/octet-stream'})
   but the browser sends the file with its own MIME type (audio/mpeg),
   so the body was never parsed ("file looks empty"). Now type:'*/*'
   on this route only.
3. pub() did not send kind/src for the current track, so the client
   never knew a track was audio and never switched to the audio player.
   Added kind and src to pub()'s cur object.
4. The upload ack used a bare act() callback, which receives the server's
   reply as the FIRST argument — so {ok:true} was read as an error.
   Now uses socket.timeout(20000).emit like the YouTube add.

## Verified (test-v52-upload.py, mobile 390x844, mock YT player)
- Upload a 30s MP3: note "Added test song — it will play for everyone
  and keeps playing in the background." Current song "test song", audio
  element src /uploads/<id>.mp3, playing, currentTime advancing,
  duration 30s, server duration 0:30, volume 0.8.
- Pause -> audio paused; play -> audio playing; volume 40 -> audio
  volume 0.4. Skip to a YouTube song -> audio paused, src cleared, the
  YouTube song becomes current.
- Regression: test-v49 + test-mix-fx + test-background + test-volume
  all-pass, zero errors.

## Honest limits
- The sandbox cannot lock a real iPhone screen or switch apps, so the
  lock-screen / app-switch backgrounding of the <audio> element is the
  standard platform behaviour, not something verified here — Abhi must
  confirm it on his real phone by uploading a song, locking the screen,
  and listening.
- Uploaded files live on the free-plan server and are wiped on a server
  restart; a room's uploads do not survive that. Re-upload after a
  restart. YouTube links are unaffected by this.
- YouTube songs still pause on lock/app-switch (platform rule for video
  embeds). Only uploaded audio files keep playing in the background.
