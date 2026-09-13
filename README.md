# Delass 3D Gallery

Live at **[art.delass.ee](https://art.delass.ee)**.

A small static site showcasing 3D prints that have already been made. Not a
shop — there is nothing to buy here, it is just a place to look at the prints.

## Layout

```
public/
  index.html    both views: the gallery index and a single piece
  styles.css    all styling, no framework
  pieces.js     the gallery data — this is the file you edit
  main.js       renders the grid and swaps between the two views
  images/       photographs of the prints
vercel.json     static deploy config
```

Opening a piece swaps the whole view rather than layering a dialog over the
grid, so a piece reads as its own page with a Gallery link back. `body[data-view]`
is what the CSS switches on.

The swap runs through the View Transitions API where the browser has it, so
the photo carries from its place in the grid to its place on the piece page.
Browsers without it get the same swap without the animation, as does anyone
who has asked for reduced motion — every animation lives inside a
`prefers-reduced-motion: no-preference` query.

Thumbnails take each photo's own proportions from the `width`/`height` in
`pieces.js`, so a landscape piece is not cropped into a portrait frame.

No build step, no dependencies. Open `public/index.html` in a browser, or
serve the folder:

```sh
npx serve public
# or
python3 -m http.server 8000 --directory public
```

## Adding a piece

1. Drop the photo in `public/images/`, named `NN-slug.jpg`.
2. Add an entry to the top of the array in `public/pieces.js`:

```js
{
  id: "slug",
  number: "02",
  title: "Name of the piece",
  translit: "optional translation or romanisation",
  image: "/images/02-slug.jpg",
  alt: "What the object physically looks like, for screen readers.",
  blurb: "A sentence or two about the print.",
  specs: { Material: "PLA", Process: "FDM", Made: "1 of 1", Year: "2026" }
}
```

3. Commit and push — Vercel redeploys on push.

The piece count in the header and the deep links (`/#piece=slug`) come from
that array, so nothing else needs updating.

## The domain

The site is served from `art.delass.ee`. That hostname is hard-coded in the
`og:`/`twitter:` meta tags, `<link rel="canonical">`, `robots.txt` and
`sitemap.xml` — link-preview crawlers need absolute URLs, so these cannot be
relative. If the domain ever changes, grep for `art.delass.ee` and update
all of them together.

## Home screen, and why there is no PWA

The site is deliberately **not** a PWA: no `manifest.json`, no service
worker. Added to an iOS home screen it simply opens in the browser, which
is what we want — there is no offline cache that could serve a stale
gallery after a piece is added.

What is in place is the part that makes that safe and tidy:

- `apple-touch-icon.png`, so the home-screen icon is the mark rather than
  a screenshot of the page.
- Every navigation is in-page (`← Gallery`, `#piece=` hashes), so nothing
  depends on browser chrome. A standalone window has no Back button; this
  page never needs one.
- `viewport-fit=cover` plus safe-area padding, so a notch or home
  indicator never covers content.
- Pinch-zoom is left enabled — `user-scalable=no` is not set.

If a manifest is ever added, check those four things still hold.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). The
settings in `vercel.json` already tell Vercel this is a static site served
from `public/` with no build command, so the defaults can be accepted as-is.
