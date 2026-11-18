# Vibe Room
One link, no login, everyone hears the same YouTube song at the same second.

## Run
    npm install && npm start      # http://localhost:3000
    docker build -t vibe-room . && docker run -p 3000:3000 vibe-room

## How it works
- `server.js` owns the clock (anchor = serverNow - position), validates every action by role, broadcasts state every 5s (heartbeat), advances the queue, skips unplayable tracks by majority, and hands host to the next person 30s after the host leaves.
- `public/` is the client: Vinyl Glass UI, visible YouTube IFrame player inside the record label, drift correction (>1.5s silently re-seeks).
- Rooms live in memory and expire 24h after empty. For several server instances swap the `rooms` Map for Redis + the Socket.io Redis adapter.
- Deploy on any host that supports WebSockets (VPS, Fly, Render, Railway). Vercel alone cannot host the socket server.

## Rules implemented
Roles (host, co-host, guest), lock/unlock, vote-to-skip at 50%, fair-add (3 of next 10), queue cap 100, duplicate flag, kick + session ban, host transfer, auto-succession, reactions with rate limit, QR/link/code joining, Media Session lock-screen controls.
Not yet built (see blueprint v1/v2): Auto-DJ, search, democratic mode, chat, Redis.

## Karaoke mode
Host taps **Karaoke** in the top bar. Then:
- Only the host, co-hosts and people the host taps **Let add songs** on can paste karaoke links.
- Anyone taps **Request to sing** on a track; host/co-host taps **Pick**. The singer taps **Start singing**.
- The singer's mic runs through Web Audio effects (Hall, Party, Warm, Fascinating, Distant, Vinyl, Church, Dreamland, Hi-Fi, Super reverb, Dry + custom reverb/room/EQ/denoise) and is sent live to everyone over WebRTC; the backing track stays synced from YouTube.
- **Record my vocals** saves the processed voice only (YouTube audio can't be captured).
- Microphones need **https** (or localhost). Behind strict NATs WebRTC needs a TURN server: add one to `iceServers` in `public/karaoke.js`.
- Not included: Auto-Tune pitch correction (needs a real-time pitch-shift engine).
