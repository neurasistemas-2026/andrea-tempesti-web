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

  var fmt = function (m) { return Math.floor(m / 60) + (m % 60 ? ":" + String(m % 60).padStart(2, "0") : "") + " h"; };
  var slots = H[day] || [];
  var status = document.getElementById("status");
  var label = status.querySelector("span");
  var open = slots.find(function (s) { return now >= s[0] && now < s[1]; });
  if (open) {
    status.classList.add("open");
    label.textContent = "Abierto ahora · hasta las " + fmt(open[1]);
    return;
  }
  var later = slots.find(function (s) { return now < s[0]; });
  if (later) { label.textContent = "Cerrado ahora · abrimos hoy a las " + fmt(later[0]); return; }
  var names = ["el domingo", "el lunes", "el martes", "el miércoles", "el jueves", "el viernes", "el sábado"];
  for (var i = 1; i <= 7; i++) {
    var d = (day + i) % 7;
    if (H[d]) { label.textContent = "Cerrado ahora · abrimos " + (i === 1 ? "mañana" : names[d]) + " a las " + fmt(H[d][0][0]); return; }
  }
})();

(function () {
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sel = ".casa-intro > *, .pair figure, .paste-photo, .paste-text > *, .tortas-head > *, .cakes li, .terms, .rieles-text > *, .rieles-photo, .rincones-head, .gallery img, .visita-head > *, .hours li, .where > *, footer .wrap > *";
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
    el.style.setProperty("--d", (i % 6) * 0.08 + "s");
    el.classList.add("will-reveal");
    io.observe(el);
  });
})();

(function () {
  // Alfajores que se abren y se cierran siguiendo el scroll (secuencia de cuadros del video)
  var img = document.getElementById("rieles-seq");
  var section = document.getElementById("entre-rieles");
  if (!img || !section) return;
  var N = 90, frames = [], loaded = false, last = 1, ticking = false;
  var src = function (i) { return "assets/img/rieles/f" + String(i).padStart(3, "0") + ".webp"; };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { img.src = src(45); return; }
  function load() {
    if (loaded) return; loaded = true;
    for (var i = 1; i <= N; i++) { var im = new Image(); im.decoding = "async"; im.src = src(i); frames[i] = im; }
  }
  function update() {
    ticking = false;
    var r = section.getBoundingClientRect(), vh = window.innerHeight;
    if (r.top < vh * 2) load();
    var p = (vh - r.top) / (vh + r.height);
    p = Math.min(1, Math.max(0, p));
    var f = 1 + Math.round(p * (N - 1));
    if (f !== last && frames[f] && frames[f].complete) { img.src = frames[f].src; last = f; }
  }
  window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
