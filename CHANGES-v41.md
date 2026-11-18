# Vibe Room v41 — toast below the notch + perfect-circle popup close button

Built on v40. Two small UI fixes, both reported from Abhi's iPhone screenshots.

## 1. Toast notification no longer hides behind the notch
The yellow toast ("Guest56 will sing …") was pinned at `top:12px`, so on an
iPhone the notch / Dynamic Island covered its top edge and the message was
cut off. The toast now uses the same safe-area rule as the v39 header:
`#toasts{top:calc(12px + env(safe-area-inset-top,0px))}` — it sits below
the notch on iPhone 13–18, and on devices without a notch the inset is 0
so nothing moves.

## 2. Sound-popup close button is a perfect circle
The "✕" in the top-right of the "Enable sound" popup rendered as a tall,
stretched oval instead of a circle. Root cause: the general `button` rule
sets `min-height:44px`, which overrode `.snd-x`'s `height:30px` (min-height
always wins over height), so the button was 30px wide × 44px tall. Fixed by
resetting `min-height:30px` and `padding:0` on `.snd-x` and flex-centring
the ✕, so it is now a true 30×30 circle with the X dead centre.

## Notes
- No behaviour change. The toast still shows for 3.5s; the close button
  still dismisses the popup. Renaming is deferred — Abhi will do it later.
