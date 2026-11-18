# Vibe Room v29 — install it as an app on iPhone (and Android)

Built on v28. This version makes Vibe Room installable as an app on your
phone — a Vibe Room icon on your home screen that opens full-screen, like a
native app. No App Store, no developer account, no cost.

## How to install it on iPhone
1. Open your Vibe Room link in **Safari** (it must be Safari, not Chrome).
2. Tap the **Share** button (the square with the arrow, at the bottom).
3. Tap **"Add to Home Screen"**.
4. Tap **Add**. A Vibe Room icon (a vinyl record with a pink play button)
   appears on your home screen.
5. Tap the icon — Vibe Room opens full-screen, with no Safari address bar,
   just like a downloaded app.

On Android it is the same idea: open the link in Chrome → tap the menu →
"Install app" (or "Add to Home Screen").

## What was added (the app itself is unchanged)
- **App icon:** a glossy vinyl record with a pink play button on a
  purple-to-pink gradient, made for Vibe Room. It is the home-screen icon
  (180×180), the Android icon (192×192), and the large icon (512×512).
- **Manifest (`manifest.json`):** tells the phone the app's name, colours,
  and that it should open full-screen (`standalone`), in portrait.
- **Apple tags (`index.html`):** `apple-mobile-web-app-capable` and the
  touch icon, so iOS treats it as a full-screen app with the right icon
  and title.
- **Service worker (`sw.js`):** caches only the app shell (the pages, styles,
  scripts, images) so the app loads fast and opens even on a weak
  connection. It NEVER caches a room or any live data — Socket.io and room
  pages are always live from the network, so a room is never stale. The
  cache is versioned (`vibe-room-v29`), so a new version replaces it.

## The honest limit — about a real .ipa file
A true App Store app (a signed `.ipa` file) cannot be built here. It needs a
Mac with Xcode and a paid Apple Developer account ($99/year), and Apple only
lets signed apps install on a real iPhone. I do not have a Mac, Xcode, or an
Apple account, so I cannot produce a working `.ipa` for you. The installable
app in this version is the way web apps become "iOS apps" without the App
Store — it is what most music and radio web apps use, and for Vibe Room it
gives you the same thing that matters: an icon on your home screen, a
full-screen app, and the whole room working exactly as it does in the
browser. If you later want a real App Store listing, that is a separate
project (Mac + Xcode + developer account), and this version is already the
code that would go inside it.

## What did NOT change
- v28's premium Queue tab, v27's shared duration, v26's karaoke redesign,
  v25's host-stays-host, v24's instant sound, v23's smooth playback,
  v22's unlock button, v21's instant pause are intact. The app works
  exactly as before — this version only adds the install pieces.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v29 - installable as an iOS app"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
Then follow the install steps above on your iPhone.
