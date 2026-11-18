# Vibe Room v46 — Your playlist (saved YouTube links, tap to queue)

Built on v45 Revision 3. One change, from Abhi.

## 1. Your playlist — every link you paste is saved, one tap queues it again
In the Queue tab, under "Recently played", there is now a "Your playlist"
section. Every YouTube link YOU paste is saved there automatically —
with its artwork, title and channel — so your favourite songs are one
tap away in any room. Tapping a playlist song's **Queue** button puts it
straight into the room (it plays at once if the room is empty, or joins
the queue if a song is already playing). Each row has a small ✕ to remove
that song, and a "Clear playlist" pill wipes the whole list. The count
badge on the heading shows how many songs you have saved.

The playlist is yours and it lives on your device (localStorage, like
Liked songs and History) — it survives a refresh and a rejoin, and it
works in any room you open. Only YOUR pastes are saved: a song another
person pastes never lands in your playlist (their own device saves it
for them). Songs you queue from History, Liked songs or the playlist
itself are saved too. It holds up to 100 songs, most recent first, one
entry per song (no duplicates).

HONEST LIMIT — read this before expecting offline/background playback:
the playlist stores LINKS, not the video files. YouTube does not allow
downloading its videos, so the songs still stream from YouTube and need
the internet — they cannot play offline, and they play through the same
YouTube embed as before, so the background/lock-screen behaviour is
unchanged (the v45 background-audio work still applies: it does
everything a web page can, iOS ultimately decides for a home-screen
app, Safari is the reliable fallback). Downloading YouTube videos to
play offline would break YouTube's rules and get the app's server
blocked — that is why the playlist saves links instead of files. If
you own MP3 files of your own, those can be played as plain audio
(which backgrounds properly); that is a separate feature, not part of
this version.

BUG FOUND WHILE TESTING: the playlist was first given the id `pl` —
but the YouTube player container already uses `id="pl"`, so the
playlist rows were being injected into the player (invisible, and it
would have broken the player). The playlist is now `id="playlist"`
(`playlist-n`, `playlist-clear`), which is unique. The full test suite
and the playlist test were re-run after the rename.

## Verified (sandbox, mock player)
- Paste 2 songs → playlist holds both (real titles from the server),
  rendered rows 2, count badge 2.
- Reload the page → playlist still shows both songs.
- Tap Queue on a playlist song in an empty room → it becomes the
  current song; in a busy room it joins the queue.
- Remove one song → rows drop from 2 to 1; Clear wipes the list.
- A guest pastes a song and the host approves it → it does NOT appear
  in the host's playlist, and it DOES appear in the guest's playlist.
- Full test-v46.py: all-pass, zero errors.
- The artwork thumbnails show as broken images in the sandbox only
  (it cannot reach YouTube's image host); on a real phone they load.
