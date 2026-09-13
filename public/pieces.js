/**
 * The gallery. Add a new object to the top of this array to add a piece.
 *
 *   number    catalogue number shown on the card; also identifies the
 *             piece in its share link, e.g. #piece01
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
    number: "01",
    title: "Когда ты пишешь Стасу раньше 14 утра",
    translit: "“When you text Stas before 14 a.m.”",
    image: "/images/01-stas-v2.jpg",
    width: 2576,
    height: 1932,
    alt:
      "A black 3D-printed relief plaque, wider than it is tall, showing a " +
      "cartoon mouse with a wide grin and raised block lettering along the " +
      "bottom edge. Photographed lying on dark navy fabric with gold " +
      "fan-shaped embroidery.",
    blurb:
      "A relief plaque printed flat in black PLA, so the whole image reads only " +
      "as raised geometry catching the light — no colour, no paint. Based on a " +
      "reaction image; the caption is embossed along the bottom edge.",
    specs: {
      Printer: "Creality Ender 3 V2",
      Material: "PLA, black",
      Size: "50 × 25 × 2.5 mm",
      Process: "FDM bas-relief, 0.2 mm layers, ≈45 min",
      Filament: "3 g · 1 m",
      Finish: "As-printed, unsanded",
      Made: "1 of 1 · 2026"
    }
  }
];
