(function () {
  "use strict";

  var pieces = window.PIECES || [];
  var grid = document.getElementById("grid");
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbTitle = document.getElementById("lbTitle");
  var lbTranslit = document.getElementById("lbTranslit");
  var lbDesc = document.getElementById("lbDesc");
  var lbSpecs = document.getElementById("lbSpecs");
  var current = -1;
  var lastFocused = null;
  var pushedEntry = false;

  document.getElementById("year").textContent = String(new Date().getFullYear());
  document.getElementById("count").textContent =
    pieces.length + (pieces.length === 1 ? " piece" : " pieces");

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  /* ---------- cards ---------- */

  pieces.forEach(function (piece, index) {
    var li = el("li", "card");
    var btn = el("button", "card-btn");
    btn.type = "button";
    btn.setAttribute("aria-haspopup", "dialog");

    var thumb = el("div", "thumb");
    var img = new Image();
    img.src = piece.image;
    img.alt = piece.alt || piece.title;
    img.loading = index === 0 ? "eager" : "lazy";
    img.decoding = "async";
    thumb.appendChild(img);

    var body = el("div", "card-body");
    body.appendChild(el("p", "card-num", piece.number));
    body.appendChild(el("h2", "card-title", piece.title));
    if (piece.translit) body.appendChild(el("p", "card-sub", piece.translit));

    btn.appendChild(thumb);
    btn.appendChild(body);
    btn.addEventListener("click", function () {
      open(index);
    });

    li.appendChild(btn);
    grid.appendChild(li);
  });

  /* ---------- lightbox ---------- */

  function isOpen() {
    return !lb.hidden;
  }

  /**
   * Opening a piece adds a history entry so that Back — the reflex on a
   * phone — closes the lightbox instead of leaving the site. Stepping
   * between pieces replaces that entry rather than stacking one per piece.
   */
  function open(index, push) {
    var piece = pieces[index];
    if (!piece) return;

    var wasOpen = isOpen();
    var url = "#piece=" + encodeURIComponent(piece.id);

    if (push !== false && !wasOpen) {
      history.pushState({ lb: piece.id }, "", url);
      pushedEntry = true;
    } else {
      history.replaceState({ lb: piece.id }, "", url);
    }

    if (!wasOpen) lastFocused = document.activeElement;
    current = index;

    lbImg.src = piece.image;
    lbImg.alt = piece.alt || piece.title;
    lbTitle.textContent = piece.title;
    lbTranslit.textContent = piece.translit || "";
    lbTranslit.hidden = !piece.translit;
    lbDesc.textContent = piece.blurb || "";
    lbDesc.hidden = !piece.blurb;

    lbSpecs.textContent = "";
    Object.keys(piece.specs || {}).forEach(function (key) {
      lbSpecs.appendChild(el("dt", null, key));
      lbSpecs.appendChild(el("dd", null, piece.specs[key]));
    });

    var multiple = pieces.length > 1;
    document.getElementById("lbPrev").hidden = !multiple;
    document.getElementById("lbNext").hidden = !multiple;

    lb.hidden = false;
    lb.setAttribute("role", "dialog");
    lb.setAttribute("aria-modal", "true");
    lb.setAttribute("aria-label", piece.title);
    document.body.classList.add("lb-open");
    lb.scrollTop = 0;
    if (!wasOpen) document.getElementById("lbClose").focus();
  }

  function close(fromPopstate) {
    if (!isOpen()) return;

    lb.hidden = true;
    current = -1;
    document.body.classList.remove("lb-open");

    if (!fromPopstate) {
      if (pushedEntry) {
        pushedEntry = false;
        history.back();
      } else {
        history.replaceState(null, "", location.pathname + location.search);
      }
    } else {
      pushedEntry = false;
    }

    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(delta) {
    if (current < 0 || pieces.length < 2) return;
    open((current + delta + pieces.length) % pieces.length, false);
  }

  function indexOfId(id) {
    for (var i = 0; i < pieces.length; i++) {
      if (pieces[i].id === id) return i;
    }
    return -1;
  }

  document.getElementById("lbClose").addEventListener("click", function () {
    close();
  });
  document.getElementById("lbPrev").addEventListener("click", function () {
    step(-1);
  });
  document.getElementById("lbNext").addEventListener("click", function () {
    step(1);
  });

  lb.addEventListener("click", function (event) {
    if (event.target === lb) close();
  });

  document.addEventListener("keydown", function (event) {
    if (lb.hidden) return;
    if (event.key === "Escape") close();
    else if (event.key === "ArrowLeft") step(-1);
    else if (event.key === "ArrowRight") step(1);
  });

  /* Back/forward: close an open lightbox, or follow the hash to a piece. */
  window.addEventListener("popstate", function () {
    if (isOpen()) {
      close(true);
      return;
    }
    var index = indexOfId(hashId());
    if (index > -1) open(index, false);
  });

  function hashId() {
    var match = /^#piece=(.+)$/.exec(location.hash);
    return match ? decodeURIComponent(match[1]) : "";
  }

  /* Deep link: /#piece=stas opens that piece directly, e.g. from a shared URL. */
  var initial = indexOfId(hashId());
  if (initial > -1) open(initial, false);
})();
