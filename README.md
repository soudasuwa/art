# Delass 3D Gallery

A small static site showcasing 3D prints that have already been made. Not a
shop — there is nothing to buy here, it is just a place to look at the prints.

## Layout

```
public/
  index.html    markup + lightbox shell
  styles.css    all styling, no framework
  pieces.js     the gallery data — this is the file you edit
  main.js       renders the grid and drives the lightbox
  images/       photographs of the prints
vercel.json     static deploy config
```

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
  specs: { Material: "PLA", Process: "FDM", Finish: "As-printed", Year: "2025" }
}
```

3. Commit and push — Vercel redeploys on push.

The piece count in the header and the deep links (`/#piece=slug`) come from
that array, so nothing else needs updating.

## Deploying to Vercel

Import the repository at [vercel.com/new](https://vercel.com/new). The
settings in `vercel.json` already tell Vercel this is a static site served
from `public/` with no build command, so the defaults can be accepted as-is.
