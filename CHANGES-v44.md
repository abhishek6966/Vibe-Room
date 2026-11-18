# Vibe Room v44 — bottom navigation fully rounded

Built on v43. One change, from Abhi.

## Bottom navigation: rounded corners on the bottom too
In v43 the tab bar was docked at the very bottom of the screen with
square bottom corners (`border-radius: 26px 26px 0 0`) — the bottom edge
was flat/straight. Abhi wants the bottom curved as well. The bar now has
`border-radius: 26px` on all four corners, so the bottom is rounded and
curved just like the top. It stays docked at the very bottom of the
screen (no gap below it) — only the bottom corners changed.
