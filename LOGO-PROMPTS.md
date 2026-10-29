# RKEB — Logo prompt kit

> Prompt variants derived from the master prompt (the one that produced `RKEB.png`).
> Every variant keeps the brand DNA: thick geometric sans-serif "RKEB", high contrast,
> one vibrant orange organic marker stroke = human connection + motion.
> Copy a prompt into an image tool (Ideogram / Recraft recommended for text accuracy),
> then process the result like `RKEB.png` (remove bg → crop → `public/`).

**Master prompt (v0 — the original):**
A minimalist, bold, and modern logo for a mobile app named 'RKEB'. Thick geometric sans-serif typography in pure white against a dark charcoal background. A vibrant neon orange organic marker stroke (dynamic brush or underline accent) cutting through or underlining part of the word 'RKEB', symbolizing human connection and motion. Clean lines, high contrast, tech-startup aesthetic, vector style.

---

## App surfaces

### 1 — Master app icon (square, 1:1) — iOS / Android / PWA
For the store icon and `apple-touch-icon`. Same as master + safe margins for cropping.
> A minimalist, bold logo icon for a mobile app named 'RKEB'. Thick geometric sans-serif typography in pure white, centered, against a dark charcoal background. A vibrant neon orange organic marker stroke cutting through the lower part of the wordmark. Generous empty charcoal padding around the logo for safe cropping. Square composition, flat vector, high contrast, tech-startup aesthetic, no gradients.

### 2 — Favicon / monogram mark (1:1, simplified)
For `favicon.ico` and tiny contexts. Single letter, readable at 16 px.
> An ultra-minimal browser favicon mark: the letter 'R' in thick geometric white sans-serif on dark charcoal, a single bold neon orange brush stroke arcing through its lower half. No other elements, maximum legibility at 16 pixels, flat vector, high contrast.

### 3 — Horizontal lockup + tagline
For the landing header and email footers. Wordmark over small mono subtitle.
> A horizontal logo lockup for a student carpool app: bold white 'RKEB' wordmark with a neon orange marker stroke, and directly below it in small wide-spaced monospace uppercase letters the subtitle 'ENSA CARPOOL'. Dark charcoal background, generous spacing, flat vector, minimalist tech-startup aesthetic.

### 4 — Splash / loading screen (vertical, 9:16)
For a future PWA install splash. Wordmark + tiny ride motif, lots of air.
> A vertical mobile splash screen logo: 'RKEB' in thick white geometric sans-serif centered on dark charcoal, neon orange marker stroke through the wordmark, and below it a minimal white line-art icon of two simple car silhouettes sharing one road. Generous vertical spacing, minimalist, flat vector, high contrast.

---

## Theme variants (match the in-app modes)

### 5 — Tanger light theme (cream paper)
Default app theme = cream `#f9f3e6` + ink. Letters flip dark, stroke stays orange.
> A minimalist logo for 'RKEB': thick geometric sans-serif typography in deep charcoal black against a warm cream paper background, with the signature vibrant orange organic marker stroke underlining the wordmark. Subtle paper grain, Moroccan ticket-printing warmth, flat vector, high contrast.

### 6 — Tanger teal alternate (stroke swapped)
Same mark, stroke in petit-taxi teal — the app's action color. Optional zellige hint.
> A minimalist 'RKEB' wordmark in thick geometric white sans-serif on dark charcoal, with the organic marker stroke in vivid taxi teal green instead of orange, and a very faint Moroccan zellige tile pattern in the dark background. Flat vector, clean, high contrast.

### 7 — ENSA institutional theme
Matches the toggleable ENSA mode (navy `#102840` + ENSA blue + amber).
> A civic tech logo for 'RKEB': thick geometric sans-serif typography in deep institutional navy blue against a cool pale blue-white background, with a vibrant orange organic marker stroke cutting through the wordmark, plus a small subtle graduation-cap icon accent. Clean institutional aesthetic, flat vector, high contrast.

### 8 — Admin / dark navy header
For the "Tour de contrôle" dark header. White letters, navy field, orange stroke.
> A bold dark-mode logo: 'RKEB' in thick geometric white sans-serif on a deep navy blue background, vibrant neon orange organic marker stroke through the wordmark, subtle darker navy vignette, control-panel tech aesthetic, flat vector, minimalist.

---

## Playful / on-brand extras

### 9 — Ticket stamp variant (Billet de Tanger)
For the demo pitch, posters, or a marketing screen. The 5 DH ticket as a literal object.
> A retro perforated paper bus ticket illustration: 'RKEB' printed in thick charcoal geometric sans-serif letters on a cream ticket paper, a neon orange marker stroke across the wordmark, a small circular ink stamp reading '5 DH' in the corner, Moroccan travel-ticket aesthetic, flat vector illustration, minimalist, clean lines.

### 10 — Social / share preview (16:9)
For link previews (`og:image`) and slide decks. Wordmark + one-line pitch + ride icon.
> A wide social preview image on dark charcoal: on the left the bold white 'RKEB' wordmark with neon orange marker stroke, on the right a minimal white line-art icon of a car with two passenger dots, and small white monospace text '5 DH — COVOITURAGE ENSA TANGER'. Flat vector, generous negative space, high contrast, tech-startup aesthetic.

---

## Global tips

- **Text accuracy**: Ideogram or Recraft render lettering far better than Midjourney. Generate the wordmark first, then re-prompt with `--cref`/reference if needed.
- **After generating**: process exactly like `RKEB.png` — remove background to transparent, crop tight, then derive icons (`favicon.ico`, `apple-touch-icon.png`, future PWA manifest icons from `public/rkeb-logo.png`).
- **Aspect ratios**: icons 1:1, splash 9:16, share preview 16:9, lockups 4:1 or 3:1.
- **Negative prompt (global)**: misspelled letters, extra letters, realistic photo, 3D render, gradients, drop shadows, cluttered background, watermark.
- **Color constants**: charcoal `#1B1B1B`, cream `#f9f3e6`, ink `#1d140d`, orange stroke ≈ `#FF5500`, ENSA navy `#102840`, teal `#007776`.
