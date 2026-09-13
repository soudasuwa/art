/**
 * The gallery. Add a new object to the top of this array to add a piece.
 *
 *   id        stable slug, used in the URL hash (#piece=...)
 *   number    catalogue number shown on the card
 *   title     the piece's name, in its original language
 *   translit  optional romanisation / translation, shown under the title
 *   image     path under /images
 *   width     the photo's real pixel width  — reserves layout space
 *   height    the photo's real pixel height — so nothing jumps on load
 *   alt       description for screen readers — describe the object, not the joke
 *   blurb     a sentence or two about the piece
 *   specs     free-form key/value pairs shown on the piece's page
 */
window.PIECES = [
  {
    id: "stas",
    number: "01",
    title: "Когда ты пишет стасу раньше 14 утра",
    translit: "“When you text Stas before 14 a.m.”",
    image: "/images/01-stas.jpg",
    width: 1932,
    height: 2576,
    alt:
      "A rectangular black 3D-printed relief plaque showing a cartoon mouse " +
      "with a wide grin, with block lettering running up the left edge. " +
      "Photographed lying on dark navy fabric with gold fan-shaped embroidery.",
    blurb:
      "A relief plaque printed flat in black PLA, so the whole image reads only " +
      "as raised geometry catching the light — no colour, no paint. Based on a " +
      "reaction image; the caption is embossed along the left edge.",
    specs: {
      Material: "PLA, black",
      Process: "FDM, relief / lithophane-style",
      Finish: "As-printed, unsanded",
      Made: "1 of 1",
      Year: "2026"
    }
  }
];
