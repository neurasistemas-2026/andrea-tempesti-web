(function () {
  // Horario en hora de Argentina: [día 0=Dom] -> tramos [desde, hasta] en minutos
  var H = { 0: [[480, 780]], 3: [[480, 720], [960, 1200]], 4: [[480, 720], [960, 1200]], 5: [[480, 720], [960, 1200]], 6: [[480, 720], [960, 1200]] };
  var parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Argentina/Buenos_Aires", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
  } catch (e) { return; }
  var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ""; };
  var day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  var now = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
  if (day < 0 || isNaN(now)) return;

  var row = document.querySelector('#hours li[data-day="' + day + '"]');
  if (row) row.classList.add("today");

  var label = document.getElementById("status");
  if (!label) return;
  var fmt = function (m) { return Math.floor(m / 60) + (m % 60 ? ":" + String(m % 60).padStart(2, "0") : "") + " h"; };
  var slots = H[day] || [];
  var open = slots.find(function (s) { return now >= s[0] && now < s[1]; });
  if (open) { label.textContent = "Hoy abierto hasta las " + fmt(open[1]); return; }
  var later = slots.find(function (s) { return now < s[0]; });
  if (later) { label.textContent = "Hoy abrimos a las " + fmt(later[0]); return; }
  var names = ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"];
  for (var i = 1; i <= 7; i++) {
    var d = (day + i) % 7;
    if (H[d]) { label.textContent = "Volvemos a abrir " + (i === 1 ? "mañana" : names[d]) + " a las " + fmt(H[d][0][0]); return; }
  }
})();

(function () {
  // Aparición suave al hacer scroll; lo visible al cargar queda quieto
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sel = ".head > *, .facts li, .photos img, .offer li, .cake-group, .terms, .hours li, .contact, footer .wrap > *";
  var els = Array.prototype.slice.call(document.querySelectorAll(sel));
  var vh = window.innerHeight;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
    });
  }, { rootMargin: "0px 0px -6% 0px", threshold: 0.1 });
  var count = new Map();
  els.forEach(function (el) {
    if (el.getBoundingClientRect().top < vh) return;
    var i = count.get(el.parentElement) || 0;
    count.set(el.parentElement, i + 1);
    el.style.setProperty("--d", (i % 6) * 0.09 + "s");
    el.classList.add("will-reveal");
    io.observe(el);
  });
})();

(function () {
  // Entre Rieles: el alfajor queda fijo y se abre y cierra siguiendo el scroll
  var img = document.getElementById("rieles-seq");
  var track = document.querySelector(".rieles-track");
  var caps = document.querySelectorAll(".captions li");
  if (!img || !track) return;
  var N = 90, frames = [], loaded = false, last = 1, ticking = false;
  var src = function (i) { return "assets/img/rieles/f" + String(i).padStart(3, "0") + ".webp"; };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { img.src = src(45); return; }
  function load() {
    if (loaded) return; loaded = true;
    for (var i = 1; i <= N; i++) { var im = new Image(); im.decoding = "async"; im.src = src(i); frames[i] = im; }
  }
  function update() {
    ticking = false;
    var r = track.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top < vh * 2) load();
    var p = -r.top / Math.max(1, r.height - vh);
    p = Math.min(1, Math.max(0, p));
    var f = 1 + Math.round(p * (N - 1));
    if (f !== last && frames[f] && frames[f].complete) { img.src = frames[f].src; last = f; }
    var c = Math.min(caps.length - 1, Math.floor(p * caps.length));
    caps.forEach(function (li, i) { li.classList.toggle("on", i === c); });
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();

(function () {
  // Carta de tortas: la vista previa muestra la torta que se señala (o la que pasa por el centro al hacer scroll).
  // Si existe la foto en assets/img/tortas/<nombre>.jpg se muestra; si no, queda la ficha tipográfica.
  var preview = document.querySelector(".preview");
  var cakes = Array.prototype.slice.call(document.querySelectorAll(".cake"));
  if (!preview || !cakes.length) return;
  var pImg = preview.querySelector(".preview-img");
  var f = {
    cat: preview.querySelector(".pv-cat"), name: preview.querySelector(".pv-name"),
    size: preview.querySelector(".pv-size"), price: preview.querySelector(".pv-price")
  };
  var ok = {};
  cakes.forEach(function (li) {
    var url = li.getAttribute("data-img");
    var test = new Image();
    test.onload = function () {
      ok[url] = true;
      var t = document.createElement("img");
      t.className = "c-thumb"; t.src = url; t.alt = li.querySelector(".c-name").textContent; t.loading = "lazy";
      li.appendChild(t);
      if (li.classList.contains("active")) show(li, true);
    };
    test.src = url;
  });
  var current = null, timer;
  function show(li, force) {
    if (li === current && !force) return;
    current = li;
    cakes.forEach(function (c) { c.classList.toggle("active", c === li); });
    preview.classList.add("swap");
    clearTimeout(timer);
    timer = setTimeout(function () {
      var url = li.getAttribute("data-img");
      f.cat.textContent = li.closest(".cake-group").querySelector("h3").textContent;
      f.name.textContent = li.querySelector(".c-name").textContent;
      f.size.textContent = li.querySelector(".c-size").textContent;
      f.price.textContent = li.querySelector(".c-price").textContent;
      if (ok[url]) { pImg.src = url; pImg.alt = f.name.textContent; pImg.hidden = false; preview.classList.add("has-img"); }
      else { pImg.hidden = true; preview.classList.remove("has-img"); }
      preview.classList.remove("swap");
    }, 180);
  }
  cakes.forEach(function (li) {
    li.addEventListener("mouseenter", function () { show(li); });
    li.addEventListener("focus", function () { show(li); });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) show(e.target); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    cakes.forEach(function (li) { io.observe(li); });
  }
  show(cakes[0]);
})();
