# Vibe Room v45 — audio never cuts + nav corners follow the device + scan QR to join + history panel premium + background audio + scrolling title + premium fonts + host request notifications + swipe-to-dismiss + karaoke voice fixed + header fits everyone

Built on v44. Ten changes, all from Abhi.

## 1. Audio plays continuously — no cuts, completely
The cuts were STILL happening after v43, so the remaining causes were
removed, not just softened:
 (a) **The 2s quality interval is GONE.** v43 made capQuality check
     first, but YouTube's adaptive streaming keeps raising the quality
     back up on a good connection, so every 2s capQuality forced it back
     down to small — and each forced quality change gaps the audio for a
     moment, over and over. The cap is now applied only at track load
     (pReady / sync load / preload swap), where no audio is playing yet
     to cut, and setPlaybackQualityRange('tiny','small') keeps adaptive
     streaming inside the cap. A higher quality mid-song does not cut
     audio; only a FORCED change does, so there is nothing to re-apply.
 (b) **Seeks are now rare — only past 2.0s while playing** (was 1.0s).
     Drift up to 2.0s is corrected by the gentle ±15% speed nudge, which
     never interrupts the audio. A seek is the only thing that throws the
     buffer away, so the threshold is the cut. The 3s seek cooldown stays.
 (c) **The playback rate is only set when it actually changes.** sync()
     used to call setPlaybackRate on every run even for the same value,
     and a rate flipping around the 0.15s threshold churns the player.
     It now caches the last rate and skips the call when nothing changed.
Tradeoff, stated plainly: sync is now within ~2s instead of ~1s. That
is the price of a song that never cuts, and continuous playback is what
Abhi asked for above tight sync. The "In Sync" line now means <2s.
HONEST LIMIT: the sandbox cannot hear real YouTube audio, so this is
proven by the code path (zero quality calls, zero seeks for drift under
2s, zero redundant rate calls) — Abhi should confirm on a real phone
that a full song now plays straight through with no cut at all.

## 2. Bottom nav corners — all four the same, following the device's bottom screen shape
In v44 all four corners were one fixed 26px. Abhi first wanted the bottom
corners responsive to the device's own bottom screen shape — the screen
itself has rounded bottom corners on modern iPhones (plus a home
indicator). The bar's bottom corners now grow with the safe-area bottom
inset: 26px on a flat device, ~43px on a notched iPhone (26px + 34px/2),
curving like the device's own rounded bottom screen instead of one
fixed radius. Then Abhi pointed out the top corners were still 26px, so
on a notched iPhone the bottom was more curved than the top. Now the top
corners use the SAME responsive radius, so all four corners match on
every device: 26px on a flat screen, ~43px on a notched iPhone. It stays
docked at the very bottom.

## 3. History panel — rooms removed + premium close button
The Rooms section (with its Rejoin buttons) is gone — the panel now
shows only Songs played (Copy link / Add to queue). The room history
itself is NOT deleted: it still powers the landing "Recent rooms" and
the refresh auto-rejoin; it is simply not listed here any more. "Clear
history" now clears only the songs (it used to wipe the rooms too,
which would have broken the auto-rejoin).
The ✕ close button had the same stretched-oval bug as the sound popup
(the general button rule min-height:44px overrode its 28px height, so
it rendered 28×44). It is now a perfect 30×30 circle, flex-centred,
with a premium glass gradient + soft ring. The whole panel is polished
too: a richer gradient, a soft top highlight, a gradient History title,
refined song rows and a proper pill Clear button.

## 5. Music keeps playing in the background and on the lock screen
The app never paused the player itself when hidden — the music stopped
because the system suspends the page and pauses the video when the app
is backgrounded or the screen locks, and the sync loop (which would
resume it) cannot run while JavaScript is suspended. First fix (v45):
at the exact moment the page is about to be hidden — while JS is still
alive — the app re-asserts playback (unmute, play, and refresh the
Media Session lock-screen controls to "playing" with the live position).
That is the signal the system needs to keep the audio alive in the
background and on the lock screen instead of suspending it. But Abhi
reported it STILL stopped on his real phone when switching apps. The
problem: keepPlaying() ran only ONCE when the page hid, but the system
pauses the YouTube player a moment AFTER that (when the app is fully
backgrounded), and by then JS is throttled so nothing resumes it.
Second fix: when the page hides, the app now RETRIES the resume a few
times over the next seconds (at 400ms, 1200ms, 2500ms) — JS is still
briefly alive right after hiding, so one of the retries catches the
player after the system pauses it and starts it again. It also listens
for 'freeze' (the page is about to be suspended) as a last chance, and
coming back resumes instantly (visibilitychange + pageshow + focus).
Verified in the sandbox: the player was paused the moment the app was
backgrounded, the retry resumed it (state back to playing), and
returning to the app resumed it instantly — zero errors.
HONEST LIMIT: the audio comes from a YouTube video embed, and
iOS/Android ultimately decide whether a backgrounded video keeps
sounding — no web page can force the system. This does everything a
web page can do: an active Media Session (lock-screen controls), an
unmuted playing player at the moment of hiding, and repeated resume
attempts. If the system still pauses it, it restarts the instant the
user returns — no tap needed. If iOS/Android kills the app entirely
(swiped away / force-closed, or the system reclaims it under memory
pressure), the music stops, like every other web app. Test it on a
real phone: start a song, switch to another app — the song should keep
playing; if it does pause, it should restart the instant you return.

## 6. Song name slowly scrolls in the player card + more premium fonts
A long song name no longer gets cut off with "…" — it now slowly
scrolls (marquee) inside the player card: it drifts left to reveal the
end, pauses, then drifts back, at ~30px per second, so the full title
is always readable. Short titles fit and stay still. The title is now
set in Sora, a modern geometric premium font (loaded from Google Fonts),
with tighter tracking and a soft white-to-pink-to-blue gradient + glow,
so it reads as the hero of the player card. Headings across the app
(hero, History, QR card, sound popup, gate) use Sora too; body text
stays Poppins.

## 7. Host is notified when a participant requests anything
Song requests already sent the host a toast ("GuestName requested
Title"). Sing requests did not — the host only found out by opening
the Sing tab. Now, when a participant taps "Request to sing", the room
(including the host) gets a toast: "GuestName wants to sing Title".
The host sees it on any tab, so they can go pick the singer. Cancelling
a sing request sends nothing.

## 8. Notifications swipe up to dismiss
Every toast notification can now be swiped UP to dismiss it early —
it follows your finger as you drag it up and fades, and past ~50px it
flies off and is gone. A short drag snaps it back. Works with a finger
and with a mouse drag. The 3.5s auto-dismiss still applies if you
leave it alone.

## 9. Karaoke voice now sounds — to the singer AND to everyone
The singer's voice sounded to NOBODY: not to the singer (even with
"Hear myself" ticked), not to any participant or the host. Root cause:
the AudioContext was created AFTER awaiting getUserMedia (the mic
permission prompt). By then the "Start singing" tap gesture was over,
and on iOS a context resumed outside a gesture stays "suspended" —
which silences the WHOLE Web Audio chain: the mic goes in, nothing
comes out, so the monitor is silent AND the WebRTC stream carries
silence to every listener. Fix: the AudioContext is now created and
resumed FIRST, synchronously inside the tap, before any await — then
the mic is requested. If the context is still not running after that,
the singer's next tap anywhere resumes it (same retry pattern as the
voice-playback fix). The "Hear myself" monitor (v33) and the listener
voice path (v32/v33: early #kv element, play retry, 3s re-offer) are
unchanged — they were never the problem; the silent context was.
HONEST LIMIT: the sandbox has no real mic and no real phones, so the
audio flow is proven structurally (context running, live audio track
in the stream, analyser receiving signal, monitor gain 0.9). Abhi
must confirm on two real phones that the singer hears themselves with
"Hear myself" on and that every listener hears the singer's voice
while the song plays. Voice still needs mic permission + https, and
WebRTC is STUN-only (no TURN).

## 10. Top header — the full room code is always visible, however many join
The room code was cut off ("Room VZD8…") and it got worse as more
users joined — measured: with 20 users the listener pill grew to 229px
and squeezed the code to 0px wide (completely gone). Two changes, and
nothing else in the header moves: (1) the title now shows just the
6-letter code (the "● Live Room" line below it already says it is a
live room), and it never shrinks or truncates — the code is always
exactly 6 characters, so it has a fixed, predictable width. (2) The
listener pill used to show up to 8 avatar circles, so every new user
made it wider; it now shows at most 2 avatars, and the "N listening"
text still gives the exact total, so no information is lost. On narrow
phones the header buttons are 30px and the gaps are tighter so it all
fits. Measured: the full code shows and the header fits (no overflow)
with 1, 8, 20 and even 99 users, with the lock button visible. Layout:
the room code sits on the LEFT and every top button/icon (listening
pill, heart, history, invite, lock) is pushed to the far RIGHT edge as
one group — the listener pill gets margin-left:auto, so the two sides
stay cleanly split however many join.

## Title fix (found while screenshotting v45)
The scrolling title was invisible: the gradient-text effect
(`-webkit-text-fill-color:transparent` on `#tt`) was inherited by the
inner `#tt-in` span that actually holds the text, while the gradient
background sat on the parent — so the text rendered transparent. The
title is now solid white Sora bold (with the smoke text-shadow), which
is always readable over the smoke. The Sora premium font and the slow
scroll are unchanged.

## 4. Scan QR code to join a room
On the landing page, under the "Have a code?" box, there is now a
"Scan QR code to join" button. Tapping it opens the camera (back camera
on phones) in a premium scanner: live video, a viewfinder with four
glowing corner brackets and a sweeping pink scan line, a round ✕ and a
Cancel pill. It decodes the QR with the local jsQR library
(public/jsqr.min.js, served from the app — no external call). A scanned
invite is just a room URL (/room/XXXXXX) or a bare 6-letter code; the
app jumps straight to that room. Anything else gets a polite "not a
Vibe Room invite" message and keeps scanning. No photo is taken, stored
or sent anywhere — the camera feed is read frame-by-frame in the page
and stopped the moment the modal closes. Camera needs https (the live
site) or localhost; if it is denied or unavailable, the message says so
and the code box stays as the fallback.

## 11. Share hero image + favicon of the logo
Sharing the room link used to show a plain/broken preview (no image,
no description) and the browser tab had no icon. Now the app has a
proper share card and a favicon, both from Abhi's neon headphone
emblem. public/og-hero.png (1200x630, the standard share size) is a
cosmic-purple hero: the emblem on the left with a pink glow ring, the
"Vibe Room" title in a pink-to-orange gradient, the tagline "One link.
No login. Everyone hears the same song, at the same second.", the
"No login • In sync • YouTube audio" line, and the live site address.
index.html now carries the full Open Graph set (og:title,
og:description, og:image, og:image:width/height/alt, og:type, og:url,
og:site_name) plus the Twitter large-image card (twitter:card,
twitter:title, twitter:description, twitter:image) and a meta
description, so WhatsApp, iMessage, X, Facebook and others all show
the same nice card. The favicon is the emblem on a dark-purple rounded
square: public/favicon.ico (16/32/48 multi-size) plus
public/favicon-32.png for modern browsers, linked in index.html.
Verified: all three assets return 200 from the server, the tags are in
the served HTML, and the full test suite still passes with zero errors.
Note: a chat app that already cached the old (imageless) preview for
the link may keep showing it until its cache expires — the new card
appears for fresh shares.
