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
  var photoDocTop = 0;
  var photoDocHeight = 0;

  document.getElementById("year").textContent = String(new Date().getFullYear());
  grid.dataset.count = String(pieces.length);
  document.getElementById("count").textContent =
    pieces.length + (pieces.length === 1 ? " piece" : " pieces");

  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };

  /**
   * Swapping the two views through a view transition lets the browser
   * cross-fade the page and carry the photo from its place in the grid
   * to its place on the piece page. Where the API is missing, or the
   * reader has asked for less motion, the same swap just happens.
   */
  function withTransition(run) {
    if (reduceMotion.matches || !document.startViewTransition) {
      run();
      return;
    }
    document.startViewTransition(run);
  }

  /**
   * Only one element may carry a given transition name at a time, so the
   * name moves to whichever thumbnail is in play — and is dropped from
   * both ends when the morph is switched off, leaving a plain cross-fade.
   */
  function setPhotoNames(index, on) {
    var thumbs = grid.querySelectorAll(".thumb img");
    for (var i = 0; i < thumbs.length; i++) {
      thumbs[i].style.viewTransitionName = on && i === index ? "piece-photo" : "";
    }
    img.style.viewTransitionName = on ? "piece-photo" : "";
  }

  /**
   * Whether a box at `top` of `height` sits in the viewport well enough to
   * be worth morphing. Being mostly visible is not sufficient: a photo
   * taller than the screen can be almost entirely on show while its top
   * edge is far above the fold, and it is that top edge the morph starts
   * from — which is what makes it look like the picture drops in from
   * above. So the top edge has to be on screen too.
   */
  function morphWorthIt(top, height) {
    if (!height || top < -8) return false;
    var vh = window.innerHeight;
    var seen = Math.min(top + height, vh) - Math.max(top, 0);
    return Math.max(0, seen) / Math.min(height, vh) >= 0.4;
  }

  /**
   * Carrying the photo between views only reads as one object moving when
   * that object is on screen at both ends. Opening a piece also jumps the
   * page to the top, so a thumbnail that had been scrolled out of sight
   * would otherwise fly in from somewhere above the viewport, dragging a
   * cross-fade of two differently scrolled pages with it. In that case the
   * morph is skipped and the views simply cross-fade.
   */
  function thumbOnScreen(index) {
    var thumb = grid.querySelectorAll(".thumb img")[index];
    if (!thumb) return false;
    var r = thumb.getBoundingClientRect();
    /* Remember where it sits in the document, to judge the way back
       while the gallery is hidden and cannot be measured. */
    photoDocTop = r.top + window.scrollY;
    photoDocHeight = r.height;
    return morphWorthIt(r.top, r.height);
  }

  function morphOnReturn() {
    var r = img.getBoundingClientRect();
    /* Both ends have to qualify: the photo as it sits now, and the
       thumbnail where it will land once the gallery scroll is restored. */
    return morphWorthIt(r.top, r.height) &&
      morphWorthIt(photoDocTop - galleryScroll, photoDocHeight);
  }

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
    li.style.setProperty("--i", String(index));
    var btn = el("button", "card-btn");
    btn.type = "button";

    var thumb = el("div", "thumb");
    /* Let the frame take the photo's own proportions, so a landscape
       piece is not cropped into a portrait box. */
    if (piece.width && piece.height) {
      thumb.style.aspectRatio = piece.width + " / " + piece.height;
    }
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
    document.title = piece.title + " — " + siteTitle;
    setPhotoNames(index, !wasOnPiece && thumbOnScreen(index));

    withTransition(function () {
      galleryView.hidden = true;
      pieceView.hidden = false;
      body.dataset.view = "piece";
      window.scrollTo(0, 0);
      title.focus();
    });
  }

  function showGallery() {
    if (!onPiece()) return;

    var returning = current;
    current = -1;
    pushedEntry = false;
    document.title = siteTitle;
    setPhotoNames(returning, morphOnReturn());

    withTransition(function () {
      pieceView.hidden = true;
      galleryView.hidden = false;
      body.dataset.view = "gallery";
      /* Put the reader back where they were, on the card they opened. */
      window.scrollTo(0, galleryScroll);
      var card = grid.querySelectorAll(".card-btn")[returning];
      if (card) card.focus({ preventScroll: true });
    });
  }

  /**
   * Leaving a piece pops the entry that opening it pushed, so the history
   * stack stays honest and popstate drives the swap. A piece opened cold
   * from a shared link has no entry to pop, so it swaps directly.
   */
  function goBack() {
    if (pushedEntry) {
      pushedEntry = false;
      history.back();
      return;
    }
    history.replaceState(null, "", location.pathname + location.search);
    showGallery();
  }

  /* ---------- controls ---------- */

  function step(delta) {
    if (current < 0 || pieces.length < 2) return;
    showPiece((current + delta + pieces.length) % pieces.length, false);
  }

  document.getElementById("backBtn").addEventListener("click", goBack);
  document.getElementById("prevBtn").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("nextBtn").addEventListener("click", function () {
    step(1);
  });

  document.addEventListener("keydown", function (event) {
    if (!onPiece()) return;
    if (event.key === "Escape") goBack();
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
    showGallery();
  });

  /* The entrance animation is a first-load flourish, not a transition.
     Un-hiding the gallery on the way back from a piece would otherwise
     restart it, which reads as the text blinking. Hold the class only as
     long as the run needs, then drop it for good. */
  body.classList.add("intro");
  var introMs = 1200 + Math.max(0, pieces.length - 1) * 90 + 250;
  setTimeout(function () {
    body.classList.remove("intro");
  }, introMs);

  /* Deep link: /#piece=stas lands straight on that piece. */
  var initial = indexOfId(hashId());
  if (initial > -1) showPiece(initial, false);
})();
