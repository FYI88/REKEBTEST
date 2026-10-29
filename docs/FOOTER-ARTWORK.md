# Dernier arrêt : ENSA — artwork

## Current treatment — journal sketch / Tufte-inspired figure

Temporary comparison buttons in the footer switch between **Journal** (default) and **Carte postale**. They change the artwork and surrounding footer treatment together. Selection lasts until the component remounts; remove the temporary control/state and postcard CSS after choosing the final direction.

The active footer now uses `public/dernier-arret-ensa-journal.svg` (1200 × 380) and its companion PNG `public/dernier-arret-ensa-journal.png`. Original vector artwork: fine forest-ink strokes, lightly irregular architectural contours, hatched shadows, serif annotations with leader lines, and a single restrained orange route. Warm paper `#F8F4EA`, ink `#30463D`, secondary ink `#59665B`, orange `#B75D35`. The HTML heading uses system Georgia, with italic margin-note copy and an actual `<figure>` / `<figcaption>` structure. No LaTeX renderer or image service is required. Nuit uses dark paper and a filtered version of the transparent SVG; the shared Logo follows the active theme. Figure annotations scale with the artwork; the HTML caption keeps the essential journey and schematic-map context readable on mobile.

The earlier teal postcard SVG and PNG remain available as alternative assets; they are no longer rendered by the footer. Both treatments are authored SVG illustrations and raster exports, not AI generation.

## Delivered assets

- `public/dernier-arret-ensa.svg`: earlier hand-authored teal postcard illustration. 1440 × 480, scalable, no fonts or external dependencies required beyond the system monospace used for the two location labels.
- `public/dernier-arret-ensa.png`: raster export of that SVG for sharing and presentation use; **not an AI-generated image**.
- `src/components/site-footer.tsx`: real HTML heading and links above/below the decorative scene. The illustration is intentionally not a geographically accurate route.

## Art direction

A Tangier travel postcard at the end of the day, interpreted in Rkeb’s “Billet de Tanger” language. Deep teal `#082D30`, sky teal `#103D3D`, chalk cream `#F4EBD3`, palm sage `#80A894`, saffron `#EDB94F`, and the logo’s orange gesture `#F28A45`. Existing Bricolage Grotesque headings, Instrument Sans body, and JetBrains Mono captions stay in HTML. Quiet links sit below the fading road. No animation.

## AI generation status

Blocked this session: neither `DEEPAPI_API_KEY` nor `DEEPAPI_API_BASE_URL` is available after checking the local DeepAPI environment setup. Configure DeepAPI using the setup prompt at <https://deepapi.co/docs>, then run the final prompt below with `gpt-images-2` or `nano-banana-pro` via `/v1/generate/image`. No generation request was submitted. Never store the API key in this repository.

## Final generation prompt

Create a premium editorial illustration for Rkeb, a student carpool community at ENSA Tanger in Morocco. This must feel like an original Tangier travel postcard, beautifully art-directed, warm, restrained, and specific to students returning to the same campus together. Extra-wide panoramic composition, approximately 3:1, intended as a website footer illustration at 1440 × 480. Use a deep petrol-teal background (#082D30), slightly lighter teal sky (#103D3D), chalk-cream architecture (#F4EBD3), muted sage palm foliage (#80A894), two small saffron pickup markers (#EDB94F), and one confident burnt-orange swoosh (#F28A45). Across the lower-middle of the image, a single elegant winding road connects Tangier's layered whitewashed rooftop terraces on the left to a modest contemporary engineering-school campus on the right. Integrate three or four distinctive Mediterranean palms, a hint of Tangier's bay and soft distant hills, a small subdued saffron setting sun, and almost invisible schematic street-map lines behind the scene. Place a charming small cream hatchback just right of centre, travelling toward the campus, with the orange swoosh trailing behind it like a graphic brushstroke inspired by a carpool brand mark. Precisely composed architectural silhouettes, considered negative space, flat cut-paper shapes, subtle screen-print texture, clean confident edges, sophisticated depth from three tonal layers, no heavy outlines. Keep the upper quarter quiet and uncluttered for an HTML heading, and fade the bottom fifth smoothly into a uniform #082D30 so website links can sit beneath it. Keep both endpoints and the car inside the central 85 percent so the composition remains legible on small screens. Imagined geography and imagined campus architecture, not a literal map or an exact depiction of ENSA. No text, no letters, no numbers, no logos, no watermark, no interface mockup, no border, no photorealism, no 3D rendering, no neon, no purple, no excessive detail, no generic futuristic city, no desert or orientalist motifs. The mood is: same road, familiar faces, see you tomorrow.

## Alternative prompt direction

Keep the final prompt's composition and exact palette, but render it as a refined two-colour Moroccan screen-printed travel poster with cream and sage architecture on deep teal, saffron restricted to the pickup markers and sun, and orange restricted to the car's trailing swoosh. Use very fine paper grain and slightly imperfect ink registration instead of cut-paper depth. Preserve quiet space above and a smooth dark fade below. No text or branding baked into the image.

## Integration

The shipped footer uses the journal SVG in all three themes (Tanger, ENSA, Nuit), with paper/ink colors adapting for Nuit. PNGs are companion assets, not additional page images. The AI prompt above describes the earlier postcard direction, retained for reference. If AI generation becomes available, review its result visually before replacing anything; preserve the HTML text, links, figure caption, mobile layout, empty decorative `alt`, and visible keyboard focus.
