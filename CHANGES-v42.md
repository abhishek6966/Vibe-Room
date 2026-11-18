# Vibe Room v42 — Safe-Area Auto-Detect + no zoom + mic/orb clearance
#
# Three things Abhi reported on his real iPhone/iPad, fixed together:
#  1. Bottom nav: the raised Sing mic covered the middle orb button (the
#     speed "1x" orb) on a real iPhone. Root cause: the home-indicator
#     inset lifts the tab bar's top edge by 2x the inset (once via bottom:,
#     once via padding-bottom) while the content padding only grew by 1x.
#     The Play-tab bottom padding now grows by 2x the bottom inset.
#  2. Top elements hid behind the Dynamic Island / camera. The live site
#     already had the v39 CSS env() rules, but env() can read 0 in some
#     webviews / cached shells. v42 adds a JS auto-detect: a probe measures
#     the real env() values and writes them into --sat/--sab variables
#     that EVERY element uses (header, toast, tab bar, mini player,
#     audio-unlock). If the probe reads 0 on a tall notched iPhone, it
#     falls back to the island values (59px top / 34px bottom) so nothing
#     ever hides behind the camera. Re-runs on resize / rotate.
#     NO OVERLAP RULE: the bottom player bar (#mini) and the
#     audio-unlock button also grew by 2x the bottom inset, and the
#     non-Play tab content padding grew to 192px + 2x inset — so the
#     player bar never covers the raised Sing mic, the unlock button
#     never covers the player bar, and no content ever slides under
#     the player bar. Nothing overlaps the bottom navigation, ever.
#  3. Tapping the YouTube paste box (or pinching) zoomed the whole page
#     and it stayed zoomed. Root cause: the paste box was 0.92rem
#     (~14.7px) — iOS auto-zooms any input under 16px — and the viewport
#     allowed pinch zoom. Fix: all text inputs are 16px, the viewport
#     locks scaling off (maximum-scale=1, user-scalable=no), and
#     double-tap zoom is disabled (touch-action: manipulation).
# Also: the service-worker cache is bumped to vibe-room-v42 so the new
# CSS/JS is fetched fresh instead of served from the old cached shell.
