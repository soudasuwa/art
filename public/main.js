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

  function open(index) {
    var piece = pieces[index];
    if (!piece) return;

    current = index;
    lastFocused = document.activeElement;

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
    history.replaceState(null, "", "#piece=" + piece.id);
    document.getElementById("lbClose").focus();
  }

  function close() {
    lb.hidden = true;
    current = -1;
    document.body.classList.remove("lb-open");
    history.replaceState(null, "", location.pathname + location.search);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(delta) {
    if (current < 0 || pieces.length < 2) return;
    open((current + delta + pieces.length) % pieces.length);
  }

  document.getElementById("lbClose").addEventListener("click", close);
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

  /* Deep link: /#piece=stas opens that piece directly. */
  var hash = /^#piece=(.+)$/.exec(location.hash);
  if (hash) {
    var wanted = decodeURIComponent(hash[1]);
    pieces.forEach(function (piece, index) {
      if (piece.id === wanted) open(index);
    });
  }
})();
