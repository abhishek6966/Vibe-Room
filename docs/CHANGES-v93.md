# v93 — bottom fit for the iPhone home-screen app + browsers
Files: public/fit.js (new), public/style.css (v93 block at the end), public/index.html (1 script tag), public/sw.js (cache v93), public/version.json.
1. Home-screen app: fit.js measures how much shorter the page is than the real screen (--gap) and the app shell, room padding and bottom nav extend into it. Safari/Chrome get gap=0 (unchanged).
2. All modes: the record/video is the flexible part of the card. It takes the leftover height, so buttons never slide under the nav, and the video grows to fill the card (no empty band under the buttons).
3. Add ?debug=1 to the URL to show a small readout (innerHeight, screen height, gap) if anything still looks off on a device.
After deploying: fully close the home-screen app and reopen it (the service worker updates the cache to v93 on the next launch; a second launch may be needed). Re-adding the icon is not required.
