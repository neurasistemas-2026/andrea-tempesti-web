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

// ---------- Pedido de tortas ----------
// Número de WhatsApp de Andrea con código de país, sin espacios ni "+" (por ejemplo "5493411234567").
// Vacío (demo): WhatsApp se abre con el pedido armado y deja elegir el contacto.
var WHATSAPP = "";

(function () {
  var sheet = document.getElementById("encargar");
  var form = document.getElementById("order-form");
  if (!sheet || !form) return;
  var sel = document.getElementById("o-cake");
  var date = document.getElementById("o-date");
  var time = document.getElementById("o-time");
  var name = document.getElementById("o-name");
  var notes = document.getElementById("o-notes");
  var summary = document.getElementById("o-summary");
  var error = document.getElementById("o-error");
  var cakes = Array.prototype.slice.call(document.querySelectorAll(".cake"));
  var cakeName = function (li) { return li.querySelector(".c-name").textContent; };

  // Opciones a partir de la carta, para no repetir datos
  document.querySelectorAll(".cake-group").forEach(function (g) {
    var og = document.createElement("optgroup");
    og.label = g.querySelector("h3").textContent;
    g.querySelectorAll(".cake").forEach(function (li) {
      var o = document.createElement("option");
      o.value = cakeName(li);
      o.textContent = o.value + " · " + li.querySelector(".c-price").textContent;
      og.appendChild(o);
    });
    sel.appendChild(og);
  });
  var info = function (n) {
    var li = cakes.find(function (c) { return cakeName(c) === n; });
    return li ? { size: li.querySelector(".c-size").textContent, price: li.querySelector(".c-price").textContent } : { size: "", price: "" };
  };

  // Mínimo 48 h; lunes y martes cerrado
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  var min = new Date(); min.setDate(min.getDate() + 2);
  while (min.getDay() === 1 || min.getDay() === 2) min.setDate(min.getDate() + 1);
  date.min = iso(min);
  date.value = iso(min);
  var days = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var asDate = function (v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var nice = function (v) { var d = asDate(v); return days[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1); };

  function check() {
    if (!date.value) return "Elegí el día de retiro.";
    var d = asDate(date.value);
    if (date.value < date.min) return "Las tortas se encargan con 48 horas de anticipación. Elegí desde el " + nice(date.min) + ".";
    if (d.getDay() === 1 || d.getDay() === 2) return "Lunes y martes está cerrado. Elegí otro día de retiro.";
    if (d.getDay() === 0 && time.value === "a la tarde") return "Los domingos abrimos solo a la mañana (8 a 13 h).";
    if (!name.value.trim()) return "Escribí tu nombre para que Andrea sepa de quién es el pedido.";
    return "";
  }
  function update() {
    var i = info(sel.value);
    summary.textContent = i.size + " · " + i.price;
    error.hidden = true;
  }
  [sel, date, time, name].forEach(function (el) { el.addEventListener("change", update); });

  // Panel que sube desde abajo
  function open(cake) {
    if (cake) sel.value = cake;
    update();
    if (typeof sheet.showModal === "function") { if (!sheet.open) sheet.showModal(); }
    else sheet.setAttribute("open", "");
    document.documentElement.classList.add("sheet-open");
  }
  function close() {
    sheet.classList.add("closing");
    setTimeout(function () {
      sheet.classList.remove("closing");
      sheet.style.transform = "";
      if (sheet.close) sheet.close(); else sheet.removeAttribute("open");
      document.documentElement.classList.remove("sheet-open");
    }, 260);
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href="#encargar"]');
    if (a) { e.preventDefault(); open(a.getAttribute("data-cake")); }
  });
  sheet.querySelector(".sheet-close").addEventListener("click", close);
  sheet.addEventListener("click", function (e) { if (e.target === sheet) close(); }); // toque fuera del panel
  sheet.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
  sheet.addEventListener("close", function () { document.documentElement.classList.remove("sheet-open"); });

  // Deslizar hacia abajo para cerrar
  var handle = sheet.querySelector(".sheet-handle"), y0 = null;
  handle.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
  handle.addEventListener("touchmove", function (e) {
    if (y0 === null) return;
    var dy = Math.max(0, e.touches[0].clientY - y0);
    sheet.style.transform = "translateY(" + dy + "px)";
  }, { passive: true });
  handle.addEventListener("touchend", function (e) {
    var dy = e.changedTouches[0].clientY - (y0 || 0); y0 = null;
    if (dy > 90) close(); else sheet.style.transform = "";
  });

  // Cada torta de la carta abre el panel con esa torta elegida
  cakes.forEach(function (li) {
    var b = document.createElement("a");
    b.href = "#encargar"; b.className = "c-order"; b.textContent = "Encargar";
    b.setAttribute("data-cake", cakeName(li));
    b.setAttribute("aria-label", "Encargar " + cakeName(li));
    li.appendChild(b);
    li.addEventListener("click", function (e) { if (!e.target.closest("a")) open(cakeName(li)); });
    li.addEventListener("keydown", function (e) { if (e.key === "Enter") open(cakeName(li)); });
  });

  // Enviar: el pedido llega a WhatsApp con formato de comanda
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var msg = check();
    if (msg) { error.textContent = msg; error.hidden = false; return; }
    var i = info(sel.value);
    var line = "------------------------------";
    var text = [
      "*PEDIDO DE TORTA*",
      "A.T. Pastelería Creativa",
      line,
      "*Torta:* " + sel.value,
      "*Tamaño:* " + i.size,
      "*Precio:* " + i.price,
      "*Retiro:* " + nice(date.value) + ", " + time.value,
      "*Cliente:* " + name.value.trim()
    ];
    if (notes.value.trim()) text.push("*Notas:* " + notes.value.trim());
    text.push(line, "Retiro en Alberdi 913, Pérez.", "¿Me confirmás disponibilidad y seña? ¡Gracias!");
    location.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text.join("\n"));
  });
  update();
})();
