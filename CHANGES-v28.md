# Vibe Room v28 — Queue tab: premium, professional, compact

Built on v27. The Queue tab is redesigned. The song artwork is unchanged at
56×56px, exactly as asked — everything else is refined.

## What changed
- **Paste bar:** the input and the Add button are now one unified pill — a
  borderless input inside a soft glass pill, with a compact gradient Add
  button. A soft focus ring appears when you tap into it. Shorter and
  cleaner than the old separate input + button.
- **Section headings:** small, uppercase, letter-spaced, muted lavender —
  "Current song", "Up next", "Recently played", "Requests" — each with a
  small count pill (Up next · 3, Recently played · 5). Tighter spacing
  above each section, so the page feels more compact.
- **Song cards:** tighter padding and gap, refined glass (a subtle gradient
  + a soft top highlight + a soft shadow), and a thinner 3px accent edge in
  the adder's colour instead of the old thick 4px bar. The title is now
  clamped to 2 lines with a tighter line-height — a long title no longer
  stretches the card to 3 lines. The "added by" line is smaller and muted.
  The Remove / Replay / Request / Approve / Reject buttons are smaller,
  pill-shaped, and lighter.
- **Current song (the hero card):** a richer purple-to-pink gradient with a
  soft glow, and the Playing/Paused badge is now a refined pill with a dot
  — green and gently pulsing while playing, amber while paused.
- **Empty state:** "Nothing queued" is now a clean, centred, dashed-outline
  row instead of a card that looked like a song.

## What did NOT change
- The song artwork is exactly 56×56px, same as before.
- v27's shared song duration, v26's karaoke redesign, v25's host-stays-host,
  v24's instant sound, v23's smooth playback, v22's unlock button, v21's
  instant pause are intact.
- The queue rules (host controls, requests, vote-to-skip, fair-add, caps)
  are unchanged — this is a visual redesign only.

## To go live
Unzip this folder over your Vibe Room folder, then in PowerShell inside it:
`git add .` / `git commit -m "Vibe Room v28 - premium compact Queue tab"` /
`git push`. Wait ~2 min for Render to rebuild, then refresh the live link.
