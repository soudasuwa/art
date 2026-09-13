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

It also only runs when the scroll position stays put. A piece opens at the
top of the page, so opening one from a scrolled gallery — or returning to a
scrolled gallery — has to move the scroll, and moving the scroll inside a
view transition makes the browser animate towards a position the page then
shifts out from under, which shows as the photo jumping and settling. There
is no way to have both, so in that case the views simply swap.

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
  number: "02",
  title: "Name of the piece",
  translit: "optional translation or romanisation",
  image: "/images/02-slug.jpg",
  alt: "What the object physically looks like, for screen readers.",
  blurb: "A sentence or two about the print.",
  specs: {
    Printer: "Creality Ender 3 V2",
    Material: "PLA",
    Process: "FDM, bas-relief",
    Made: "1 of 1",
    Year: "2026"
  }
}
```

3. Commit and push — Vercel redeploys on push.

The piece count in the header and the deep links come from that array, so
nothing else needs updating.

Each piece is shared as `/#piece01`, taken from its `number` — so that
number identifies the piece as well as labelling it. Renumbering a piece
changes its link.

## The contact link

Both "get in touch" links — the one under the gallery and the one on each
piece — take their address from `CONTACT_URL` at the top of `main.js`, and
carry `data-contact` in the markup. It currently points at a well-known
music video. Change the constant to a `mailto:` or a real page and both
links follow.

## Replacing a photo

Photos are cached for an hour, then served from cache while a fresh copy is
fetched in the background. So a **new** photo appears immediately, but one
that **replaces** an existing file at the same path can keep showing the old
version for up to an hour.

To see a replacement straight away, change its filename (`01-stas.jpg` ->
`01-stas-v2.jpg`) and update the `image` path in `pieces.js` — a new URL can
never be served from an old cache entry. Do the same if the photo is the one
in the `og:image` tags, since link previews cache harder than browsers do.

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
- Every navigation is in-page (`← Gallery`, `#piece01` hashes), so nothing
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
