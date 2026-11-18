# Vibe Room v34 — your logo everywhere + music notes fixed

Built on v33. Two things:

## 1. Your logo is now the app's logo
The neon headphone emblem you sent is now the logo everywhere:
- **Home-screen app icon** — the PWA icons (180/192/512px) are now the
  emblem, composited on the app's dark background. When someone adds the
  app to their home screen, they see your emblem, not the vinyl.
- **Header logo** — the small logo at the top of every room is now the
  emblem (it was a gradient play button).
- **Landing page hero** — the big spinning image on the home screen is now
  the emblem (it was the vinyl photo). It keeps the spinning glow ring.
- The master file is `public/logo.png` (your image, as supplied). The
  manifest still points at the same icon files, so no manifest change was
  needed. The service worker cache is bumped to v34 and now caches logo.png.

## 2. The small music notes are fixed
**What happened:** in v31 I replaced the note text glyphs (♪ ♫) with an
SVG icon, but I set it to `fill` (solid). That music-note shape is drawn
as an *outline* — filled, it renders as distorted pink blobs instead of a
clean note. That is the blocky shape in your screenshot.
**The fix:** all the music notes (the 4 around the vinyl on the Play page,
the 12 floating notes, and the landing-page notes) now use the proper
outline style (`fill="none"`, stroke, same as the app's other icons). They
are clean music notes again, in pink/blue/cyan, floating around the vinyl
as before.

## What did NOT change
- v33's voice-to-everyone + "Hear myself" fix, v32's karaoke voice fix +
  mini prev/next, v31's premium icons + Queue spacing, v30's sound-at-start,
  v29's installable app, v28's Queue cards, v27's shared duration, v26's
  karaoke redesign, v25's host-stays-host, v24's instant sound, v23's
  smooth playback, v22's unlock button, v21's instant pause are intact.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v34 - new logo, music notes fixed"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
Note: if you already added the app to your home screen, delete the old icon
and add it again after pushing — the home-screen icon only updates when the
app is re-added.
