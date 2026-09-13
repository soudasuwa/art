(function () {
  "use strict";

  var pieces = window.PIECES || [];
  var body = document.body;
  var galleryView = document.getElementById("galleryView");
  var pieceView = document.getElementById("pieceView");
  var grid = document.getElementById("grid");

  var img = document.getElementById("pieceImg");
  var num = document.getElementById("pieceNum");
  var title = document.getElementById("pieceTitle");
  var translit = document.getElementById("pieceTranslit");
  var blurb = document.getElementById("pieceBlurb");
  var specs = document.getElementById("pieceSpecs");
  var steps = document.getElementById("pieceSteps");

  var siteTitle = document.title;
  var current = -1;
  var pushedEntry = false;
  var galleryScroll = 0;

  document.getElementById("year").textContent = String(new Date().getFullYear());
  grid.dataset.count = String(pieces.length);
  document.getElementById("count").textContent =
    pieces.length + (pieces.length === 1 ? " piece" : " pieces");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function indexOfId(id) {
    for (var i = 0; i < pieces.length; i++) {
      if (pieces[i].id === id) return i;
    }
    return -1;
  }

  function hashId() {
    var match = /^#piece=(.+)$/.exec(location.hash);
    return match ? decodeURIComponent(match[1]) : "";
  }

  function onPiece() {
    return body.dataset.view === "piece";
  }

  /* ---------- gallery index ---------- */

  pieces.forEach(function (piece, index) {
    var li = el("li", "card");
    var btn = el("button", "card-btn");
    btn.type = "button";

    var thumb = el("div", "thumb");
    var thumbImg = new Image();
    thumbImg.src = piece.image;
    thumbImg.alt = piece.alt || piece.title;
    thumbImg.loading = index === 0 ? "eager" : "lazy";
    thumbImg.decoding = "async";
    if (piece.width) thumbImg.width = piece.width;
    if (piece.height) thumbImg.height = piece.height;
    thumb.appendChild(thumbImg);

    var meta = el("div", "card-meta");
    meta.appendChild(el("span", "card-num", piece.number));
    meta.appendChild(el("h2", "card-title", piece.title));

    var caption = el("div", "card-caption");
    caption.appendChild(meta);
    if (piece.translit) caption.appendChild(el("p", "card-sub", piece.translit));

    btn.appendChild(thumb);
    btn.appendChild(caption);

    btn.addEventListener("click", function () {
      showPiece(index);
    });

    li.appendChild(btn);
    grid.appendChild(li);
  });

  /* ---------- the piece as its own page ---------- */

  /**
   * Opening a piece swaps the whole view rather than layering a dialog
   * over the grid, and pushes a history entry so Back returns to the
   * gallery. Stepping between pieces replaces that entry instead of
   * stacking one per piece.
   */
  function showPiece(index, push) {
    var piece = pieces[index];
    if (!piece) return;

    var wasOnPiece = onPiece();
    var url = "#piece=" + encodeURIComponent(piece.id);

    if (push !== false && !wasOnPiece) {
      galleryScroll = window.scrollY;
      history.pushState({ piece: piece.id }, "", url);
      pushedEntry = true;
    } else {
      history.replaceState({ piece: piece.id }, "", url);
    }

    /* Set the intrinsic size before the src so the browser reserves the
       right box and the text below it does not jump when the photo loads. */
    if (piece.width) img.width = piece.width;
    if (piece.height) img.height = piece.height;
    img.src = piece.image;
    img.alt = piece.alt || piece.title;
    num.textContent = piece.number;
    title.textContent = piece.title;

    translit.textContent = piece.translit || "";
    translit.hidden = !piece.translit;
    blurb.textContent = piece.blurb || "";
    blurb.hidden = !piece.blurb;

    specs.textContent = "";
    Object.keys(piece.specs || {}).forEach(function (key) {
      specs.appendChild(el("dt", null, key));
      specs.appendChild(el("dd", null, piece.specs[key]));
    });

    steps.hidden = pieces.length < 2;

    current = index;
    galleryView.hidden = true;
    pieceView.hidden = false;
    body.dataset.view = "piece";
    document.title = piece.title + " — " + siteTitle;

    window.scrollTo(0, 0);
    title.focus();
  }

  function showGallery(fromPopstate) {
    if (!onPiece()) return;

    pieceView.hidden = true;
    galleryView.hidden = false;
    body.dataset.view = "gallery";
    document.title = siteTitle;

    var returning = current;
    current = -1;

    if (!fromPopstate) {
      if (pushedEntry) {
        pushedEntry = false;
        history.back();
        return; /* popstate restores the scroll position */
      }
      history.replaceState(null, "", location.pathname + location.search);
    } else {
      pushedEntry = false;
    }

    restoreGallery(returning);
  }

  /* Put the reader back where they were, and on the card they opened. */
  function restoreGallery(index) {
    window.scrollTo(0, galleryScroll);
    var card = grid.querySelectorAll(".card-btn")[index];
    if (card) card.focus({ preventScroll: true });
  }

  /* ---------- controls ---------- */

  function step(delta) {
    if (current < 0 || pieces.length < 2) return;
    showPiece((current + delta + pieces.length) % pieces.length, false);
  }

  document.getElementById("backBtn").addEventListener("click", function () {
    showGallery();
  });
  document.getElementById("prevBtn").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("nextBtn").addEventListener("click", function () {
    step(1);
  });

  document.addEventListener("keydown", function (event) {
    if (!onPiece()) return;
    if (event.key === "Escape") showGallery();
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  });

  /* ---------- history ---------- */

  window.addEventListener("popstate", function () {
    var index = indexOfId(hashId());

    if (index > -1) {
      showPiece(index, false);
      return;
    }
    if (onPiece()) {
      var returning = current;
      showGallery(true);
      restoreGallery(returning);
    }
  });

  /* Deep link: /#piece=stas lands straight on that piece. */
  var initial = indexOfId(hashId());
  if (initial > -1) showPiece(initial, false);
})();
