# CHANGES — v18 (on v17)

One fix, at Abhi's order of 2026-11-17 ~19:30 EST: the added-song card in the
Queue ("Up next") ran out of the box on phones.

## The bug
- A long song title (e.g. "Luis Fonsi - Despacito ft. Daddy Yankee") made the
  queue card 125px wider than its container: on a 390px phone the card measured
  465px wide (container 340px), its right edge ran past the screen, the title
  ran off with no "…", and the Remove button was pushed out of view. The page
  itself stretched to 490px wide.
- Cause: the song list (`ol,ul`) is a CSS grid, and a grid column plus the card
  itself both refused to shrink below the title's full width, so the card grew
  to fit the title instead of the title shrinking to fit the card.

## The fix (style.css, v18 block at the end)
- `ol,ul{grid-template-columns:minmax(0,1fr)}` — the grid column may now shrink
  below the content size, so the card is forced to the container's width.
- `li{min-width:0;overflow:hidden}` — the card itself may shrink, and nothing
  inside it can spill out.
- `li img,li button{flex:none}` — the artwork and the Remove button keep their
  fixed size and never shrink.
- The title already had `overflow:hidden;text-overflow:ellipsis;white-space:nowrap`,
  so once the card is constrained it truncates to "Luis Fonsi - Despacit…" as
  designed. This also fixes the same overflow in the "Tonight" history list and
  the "In the room" user list, which share the same grid rule.

## Verified (PORT 3012, zero page errors)
- Measured with the Despacito track in the queue: card 340px = container 340px,
  right edge 365 = container right edge, no overflow, page back to 390px wide,
  title clipped (scrollWidth 291 > clientWidth 166) so it shows "…", Remove
  button fully visible inside the card. Screenshot `desp-queue.png`.
- No other changes. Sync (v17 scheduled start / preload / catch-up), v16 header
  and logo, and all v15-and-earlier UI are untouched.
