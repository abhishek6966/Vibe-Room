# Vibe Room

> Listen to YouTube together, in perfect sync — or switch to karaoke and sing live with your friends. No account, no install, no friction.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-010101?logo=socket.io&logoColor=white)](https://socket.io/)
[![YouTube](https://img.shields.io/badge/YouTube-IFrame%20API-FF0000?logo=youtube&logoColor=white)](https://developers.google.com/youtube/iframe_api_reference)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 🚀 Try it live

**Open a live room right now — no sign-up, no download:**

### 👉 [Join the live room — vibe-room-0isd.onrender.com/room/7AG9RD](https://vibe-room-0isd.onrender.com/room/7AG9RD)

Prefer to start fresh? Open the app and create your own room:

### 👉 [vibe-room-0isd.onrender.com](https://vibe-room-0isd.onrender.com/)

> **Note:** Rooms are temporary by design — a room disappears 24 hours after it becomes empty. If the room above has expired, just open the app link and tap **Create a Vibe Room** to get a fresh one.

---

## What is Vibe Room?

Vibe Room is a shared listening room for YouTube. One person hosts, everyone listens to the same song at the same time, and anyone can join from a link — no account, no app install, no extra steps.

- **Create a room** and share its link, QR code, or 6-character code.
- **Paste a YouTube link** and the whole room hears it — audio only, in sync.
- **Hand over control** — the host can give playback control to any guest.
- **Switch to karaoke** — the host picks a singer and their live voice streams to everyone, over the music.

It runs as a web app on any phone or computer, and it can be added to a phone's home screen like a native app.

---

## ✨ Key features

### Shared listening
- **Synchronised playback** — the server owns the room clock; every device corrects drift while playing, so the room stays in sync.
- **No login** — join from a link, QR code, or room code with just a display name and a colour.
- **Instant sound** — the moment you create or join a room, a small popup asks for sound; one tap and the music plays.

### Queue & requests
- **Paste any YouTube link** — the Queue tab has the paste box; the Play page's empty state has a compact **Add a YouTube link** button that jumps straight there.
- **Song requests** — guests request tracks for host approval (up to 3 pending per guest, 20 per room); the host can open or close requests.
- **Queue safeguards** — 100-track cap, duplicate prevention, and a fair-add limit of 3 tracks among the next 10 per person.
- **Smart skipping** — only the host, co-hosts, and authorised controllers can skip. A track auto-skips only when a strict majority of listeners report a playback error.

### Host controls & moderation
- **Host transfer & co-hosts** — if the host leaves, duties pass immediately; after an unexpected disconnect, succession waits 12 seconds.
- **Grant / revoke control** — the host can give playback control to any guest, and take it back.
- **Remove / ban** — the host can remove or ban participants.
- **Embed pre-check** — with a YouTube Data API key configured, a pasted link is checked for embed restrictions before it is added.

### Karaoke
- **Live voice** — the host assigns the mic; the singer's processed voice streams to every participant over WebRTC, in real time with the music.
- **11 voice effects** plus custom reverb, EQ, and denoise controls — and a **Hear myself** monitor.
- **Record my vocals** — saves the processed microphone signal (YouTube audio is never recorded).

### Experience
- **Cosmic smoke player** — the player card has a living neon smoke background (purple, magenta, cyan, orange) that breathes harder while a song plays and calms when it pauses.
- **History** — a three-dots menu in the header shows the rooms you visited and the songs played, saved on your device. Every old song can be copied or added back to the queue. Reloading the page rejoins your room and keeps all history.
- **iPhone-ready** — the layout respects the notch and Dynamic Island (iPhone 13–18) and the home-indicator bar, so nothing is ever hidden.
- **Installable (PWA)** — add it to your home screen from Safari or Chrome for a full-screen app experience.
- **Mini-player** — a compact player bar follows you across the Queue, Sing, Room, and More tabs.
- **Media Session** — lock-screen play, pause, skip, previous, and seek on supported browsers.

---

## 📱 Screenshots

Every screen below is a fresh screenshot of the app running in a 3D iPhone frame. The compact mini-player appears on the Queue, Sing, Room, and More tabs; it is intentionally hidden on Play.

<p align="center"><img src="docs/screenshots/sound-popup-iphone.png" alt="Enable sound popup in a 3D iPhone frame" width="240"></p>
<p align="center"><em>The moment you create or join a room, a small premium popup asks for sound — one tap and the music plays.</em></p>

| Home | Join a room |
| --- | --- |
| <img src="docs/screenshots/home-iphone.png" alt="Vibe Room home page on iPhone" width="220"> | <img src="docs/screenshots/join-iphone.png" alt="Join room screen on iPhone" width="220"> |
| Play | Queue |
| <img src="docs/screenshots/play-iphone.png" alt="Play tab on iPhone" width="220"> | <img src="docs/screenshots/queue-iphone.png" alt="Queue tab with compact mini-player on iPhone" width="220"> |
| Sing | Room |
| <img src="docs/screenshots/sing-iphone.png" alt="Karaoke tab on iPhone" width="220"> | <img src="docs/screenshots/room-iphone.png" alt="Room members tab with compact mini-player on iPhone" width="220"> |
| More | Room unavailable |
| <img src="docs/screenshots/more-iphone.png" alt="More tab on iPhone" width="220"> | <img src="docs/screenshots/unavailable-iphone.png" alt="Unavailable room recovery screen on iPhone" width="220"> |

---

## 🧭 How to use

1. **Create a room** — tap **Create a Vibe Room** on the home page.
2. **Invite friends** — share the room link, QR code, or 6-character code.
3. **Join** — pick a display name and colour, then tap **Join audio stream**. When the sound popup appears, tap **Enable sound**.
4. **Add music** — go to the **Queue** tab and paste a YouTube link (or tap **Add a YouTube link** on the empty Play page). The host starts or pauses playback.
5. **Request songs** — guests paste a link to request it; the host approves or rejects.
6. **Switch tabs** — use the bottom bar for **Play**, **Queue**, **Sing**, **Room**, and **More**. Tap **Invite** any time to share the room again.

If a room link is invalid or the room has expired, tap **Create a new room** for a fresh link, or **Back to home page** to enter another code.

---

## 🎤 Karaoke

1. The host turns on **Karaoke** with the room-header button.
2. Open the **Sing** tab. The host can sing directly, or guests request to sing and the host picks a singer.
3. The selected singer grants microphone access and taps **Start singing**.
4. Choose a vocal effect, or tune the custom reverb, EQ, and denoise controls. Tick **Hear myself** to monitor your own voice.

Microphone access requires HTTPS (except on `localhost`), and the singer must grant browser permission. Headphones are recommended so the backing track does not leak into the mic. WebRTC uses a public STUN server by default; some restrictive networks need a TURN server configured in `public/karaoke.js`.

**Record my vocals** records the processed microphone signal only; it does not record YouTube audio.

---

## 🛠 Tech stack

| Layer | Technology |
| --- | --- |
| Server | Node.js + Express |
| Realtime | Socket.IO (WebSockets) |
| Playback | YouTube IFrame Player API |
| Karaoke voice | WebRTC + Web Audio API |
| Client | Vanilla HTML / CSS / JavaScript (no framework) |
| Installable | Progressive Web App (manifest + service worker) |
| Deployment | Docker-ready; runs on any host with long-lived Node.js processes |

---

## ⚡ Quick start

### Requirements

- Node.js 18 or newer
- npm

### Run locally

```sh
npm ci
npm start
```

Open [http://localhost:3000](http://localhost:3000). Create a room, then share its invite link or code.

The server listens on port `3000` by default. To use another port:

```powershell
$env:PORT = "3001"
npm start
```

```sh
PORT=3001 npm start
```

### Run with Docker

```sh
docker build -t vibe-room .
docker run --rm -p 3000:3000 vibe-room
```

Then open [http://localhost:3000](http://localhost:3000).

### Optional: YouTube embed pre-check

To check a pasted link's public embed setting before it is added, enable the YouTube Data API v3 for a Google Cloud project and configure a server-side API key. Keep the key out of client code and source control.

PowerShell:

```powershell
$env:YOUTUBE_API_KEY = "your-server-side-key"
npm start
```

For Docker, pass the key through the server environment:

```powershell
docker run --rm -p 3000:3000 --env YOUTUBE_API_KEY=$env:YOUTUBE_API_KEY vibe-room
```

Without the key, Vibe Room still accepts links but cannot pre-check their embed status. A positive check only means YouTube marks the video as embeddable; playback may still depend on region, account, browser, or video availability.

---

## 📐 Playback & room behaviour

- **Authoritative clock** — the server owns the room clock and playback state. Clients use YouTube's embedded player and correct drift while playing.
- **Volume** — the slider and speaker buttons control local playback volume; the low-volume button mutes/restores the previous level, and the high-volume button sets it to 100%.
- **Permissions** — host and co-host controls are available by default. The host may grant control to a guest. Other guests can request tracks; the host must approve a request before it enters the queue.
- **Media Session** — on supporting browsers, Vibe Room publishes track metadata and lock-screen play, pause, skip, previous, and seek actions. Returning from a suspended page triggers a room reconnect and state resync.
- **Background playback** — controlled by the browser and operating system. In particular, iOS Safari and Home Screen web apps may suspend YouTube embeds or block audio while locked; a web app cannot guarantee Spotify-like uninterrupted playback or controls in every locked-screen condition.
- **Host succession** — if the host leaves explicitly, host duties transfer immediately; after an unexpected disconnect, succession waits 12 seconds.
- **Room lifetime** — rooms are held in memory and are not persisted to a database. They are removed 24 hours after becoming empty.
- **Scaling** — a single server instance is expected. Multi-instance deployment needs shared room state and a Socket.IO adapter.
- **Hosting** — deploy on a host that supports long-lived Node.js processes and WebSockets. A serverless-only host such as Vercel Functions cannot run this Socket.IO server by itself.

---

## 📁 Project layout

```text
server.js                 Express and Socket.IO room server
package.json              Scripts, runtime requirement, and dependencies
package-lock.json         Locked npm dependency versions
.gitignore                Local dependencies and secrets excluded from Git
public/
  index.html              Home, join, and room interface
  app.js                  Room state, player sync, and controls
  extras.js               Mini-player and additional controls
  karaoke.js              Karaoke effects and WebRTC
  starmaker.js            Tab navigation and visual enhancements
  style.css               Responsive glassmorphic UI
  smoke.jpg               Cosmic smoke texture for the player card
  logo.png                Vibe Room emblem (header, landing, PWA icons)
docs/screenshots/         iPhone page screenshots for this README
```

---

## ❓ Troubleshooting

| Problem | What to try |
| --- | --- |
| **Room unavailable** | Check the code/link. Rooms are temporary and disappear after being empty for 24 hours; create a new room if it has expired. |
| **A YouTube link will not play** | Check the Queue tab's embed-status message. Configure `YOUTUBE_API_KEY` for pre-checks; YouTube may still restrict a video by region, account, or availability. |
| **No sound after joining** | Tap **Enable sound** in the popup, or tap anywhere on the page once. Check the tab is not muted and the device volume is up. |
| **No microphone access** | Use HTTPS (or `localhost`) and allow microphone permission in the browser. |
| **Karaoke audio does not reach someone** | Restrictive NAT or firewall settings may require a TURN server. |

---

## 🔒 Privacy

- **No accounts, no tracking.** A room is joined with a display name and a colour; nothing is stored on a server beyond the live room state.
- **History stays on your device.** The rooms you visited and the songs you played are saved in your browser's local storage, never sent to a server.
- **Your API key stays server-side.** The YouTube Data API key (if used) lives only in the server environment.

---

## 📝 Not included

There is no built-in YouTube search, text chat, Auto-DJ, persistent database, or Auto-Tune pitch correction.

---

<p align="center"><b>Vibe Room</b> — listen together, sing together.</p>
