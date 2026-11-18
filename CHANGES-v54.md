# Vibe Room v54 — COLORFUL BUT ORGANIZED landing + COOLER PHONE (144p)

## Landing redesign (Abhi's pick: "Colorful but organized")
Abhi's screenshot showed the landing page felt unstructured. Same colours,
gradients and rainbow equalizer — only organised now:
- One centered column (420px) with a clear rhythm: logo → title → tagline
  → equalizer → chips → Create → "or" divider → Join by code → QR → footer.
- Every button the same full width, so Create / Join / Scan QR line up.
- Join row properly aligned: "Have a code?" is a small label above the
  row, and the code input + Join button are the same height (48px), with
  the code centred and letter-spaced.
- The three chips are equal width so they line up in one neat row.
- A subtle "or" divider (line — or — line) separates Create from Join.

## Cooler phone (Abhi: device still heats up while a song plays in v53)
Why it still got hot: v50 removed the CSS blur (the old heat source), but
it never touched the BIGGEST heat source — the YouTube player still
decoded a 240p video stream continuously, even though Vibe Room is
audio-only and nobody watches the picture. Decoding video is what makes
the phone hot, not the page.
- **Video capped at 144p ('tiny') instead of 240p ('small').** The decoded
  pixels drop by ~60%, so the GPU/CPU does far less work. The sound is
  identical — YouTube serves audio separately from video quality. Applied
  to both players (main + preload) via `capQuality()` and the `vq:'tiny'`
  start hint.
- Stage backdrop blur 12px → 8px (still glassy, less GPU work per frame).

## Honest limits
- A phone playing video with the screen on will always be a little warm
  (the wake lock keeps the screen on so YouTube keeps playing). 144p makes
  it noticeably cooler, not ice-cold. Lowering screen brightness helps
  further on OLED screens.
- The sandbox cannot feel heat or measure a real phone's temperature —
  Abhi must confirm on his device that it stays cooler during a full song.
- Uploaded audio files (v52) were already the coolest path: a plain
  `<audio>` element decodes no video at all.
