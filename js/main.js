(function () {
  // Aparición suave al hacer scroll; lo visible al cargar queda quieto
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var sel = ".head > *, .photos img, .offer li, .local-menu, .cake-group, .terms, .contact, footer .wrap > *";
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

(function () {
  // Alfajores: cada círculo despliega los de su tipo; queda abierto uno por vez
  var circles = Array.prototype.slice.call(document.querySelectorAll(".circle"));
  circles.forEach(function (c) {
    c.addEventListener("click", function () {
      var opening = c.getAttribute("aria-expanded") !== "true";
      circles.forEach(function (o) {
        var on = opening && o === c;
        o.setAttribute("aria-expanded", on ? "true" : "false");
        document.getElementById(o.getAttribute("aria-controls")).hidden = !on;
      });
    });
  });
})();

// ---------- Pedidos ----------
// Número de WhatsApp de Andrea con código de país, sin espacios ni "+" (por ejemplo "5493411234567").
// Vacío (demo): WhatsApp se abre con el pedido armado y deja elegir el contacto.
var WHATSAPP = "";

(function () {
  // Consultas sueltas por WhatsApp (por ejemplo, el jardín privado)
  document.querySelectorAll("a[data-wa]").forEach(function (a) {
    a.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(a.getAttribute("data-wa"));
  });
})();

(function () {
  var sheet = document.getElementById("encargar");
  var form = document.getElementById("order-form");
  if (!sheet || !form) return;
  var sel = document.getElementById("o-cake");
  var date = document.getElementById("o-date");
  var time = document.getElementById("o-time");
  var name = document.getElementById("o-name");
  var notes = document.getElementById("o-notes");
  var delivery = document.getElementById("o-delivery");
  var qty = document.getElementById("o-qty");
  var flavor = document.getElementById("o-flavor");
  var flavorField = document.getElementById("o-flavor-field");
  var address = document.getElementById("o-address");
  var addressField = document.getElementById("o-address-field");
  var note = document.getElementById("o-note");
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
    return li
      ? { size: li.querySelector(".c-size").textContent, price: li.querySelector(".c-price").textContent, kind: li.getAttribute("data-kind") || "torta", gustos: li.hasAttribute("data-gustos"), gustosEj: li.getAttribute("data-gustos-ej") }
      : { size: "", price: "", kind: "torta", gustos: false, gustosEj: null };
  };

  // Tortas: mínimo 48 h; el resto, desde el día siguiente; lunes y martes no hay entregas
  var pad = function (n) { return String(n).padStart(2, "0"); };
  var iso = function (d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); };
  function setMin(kind) {
    var min = new Date(); min.setDate(min.getDate() + (kind === "torta" ? 2 : 1));
    while (min.getDay() === 1 || min.getDay() === 2) min.setDate(min.getDate() + 1);
    date.min = iso(min);
    if (!date.value || date.value < date.min) { date.value = date.min; sundayAfternoon(); }
  }
  // Los domingos se atiende solo a la tarde
  function sundayAfternoon() {
    if (date.value && asDate(date.value).getDay() === 0) time.value = "a la tarde";
  }
  var days =["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  var asDate = function (v) { var p = v.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); };
  var nice = function (v) { var d = asDate(v); return days[d.getDay()] + " " + d.getDate() + "/" + (d.getMonth() + 1); };

  function check() {
    if (!date.value) return "Elegí el día.";
    var d = asDate(date.value);
    var kind = info(sel.value).kind;
    if (date.value < date.min) {
      var lead = kind === "torta" ? "Las tortas se encargan con 48 horas de anticipación." : kind === "desayuno" ? "Los desayunos sorpresa se reservan el día anterior." : "Este producto se encarga con un día de anticipación.";
      return lead + " Elegí desde el " + nice(date.min) + ".";
    }
    if (d.getDay() === 1 || d.getDay() === 2) return "Lunes y martes no hacemos entregas. Elegí otro día.";
    if (d.getDay() === 0 && time.value === "a la mañana") return "Los domingos atendemos solo a la tarde (15 a 19 h).";
    if (delivery.value === "envio" && !address.value.trim()) return "Escribí la dirección de entrega en Pérez.";
    if (!name.value.trim()) return "Escribí tu nombre para que Andrea sepa de quién es el pedido.";
    return "";
  }
  function update() {
    var i = info(sel.value);
    summary.textContent = i.size + " · " + i.price;
    error.hidden = true;
    setMin(i.kind);
    // El desayuno sorpresa siempre va con envío gratis
    var breakfast = i.kind === "desayuno";
    if (breakfast) delivery.value = "envio";
    delivery.disabled = breakfast;
    addressField.hidden = delivery.value !== "envio";
    flavorField.hidden = !i.gustos;
    flavor.placeholder = i.gustosEj || "Si no los conocés, Andrea te los pasa";
    note.textContent = "Se abre WhatsApp con el pedido armado. " + (breakfast
      ? "Se abona el 100% al reservar y el envío es gratis."
      : "Andrea te confirma disponibilidad y el adelanto del 50%.");
  }
  date.addEventListener("change", sundayAfternoon);
  sel.addEventListener("change", function () { flavor.value = ""; });
  [sel, date, time, name, delivery].forEach(function (el) { el.addEventListener("change", update); });

  // Panel que sube desde abajo
  function open(cake, gusto) {
    if (cake) { sel.value = cake; flavor.value = gusto || ""; }
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
    if (a) { e.preventDefault(); open(a.getAttribute("data-cake"), a.getAttribute("data-gusto")); }
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
    var shipping = delivery.value === "envio";
    var sunday = asDate(date.value).getDay() === 0;
    var text = [
      "*PEDIDO*",
      "A.T. Pastelería Creativa",
      line,
      "*Producto:* " + sel.value,
      "*Detalle:* " + i.size,
      "*Precio:* " + i.price,
      "*Cantidad:* " + Math.max(1, parseInt(qty.value, 10) || 1)
    ];
    if (i.gustos && flavor.value.trim()) text.push("*Gustos:* " + flavor.value.trim());
    text.push((shipping ? "*Envío:* " : "*Retiro:* ") + nice(date.value) + ", " + time.value);
    if (shipping) text.push("*Dirección:* " + address.value.trim());
    text.push("*Cliente:* " + name.value.trim());
    if (notes.value.trim()) text.push("*Notas:* " + notes.value.trim());
    var place = shipping ? "Envío a domicilio en Pérez." : sunday ? "Retiro en el Museo Ferroviario La Emperatriz." : "Retiro en Alberdi 913, Pérez.";
    var ask = i.kind === "desayuno"
      ? "Envío gratis, abono el 100% al reservar. ¿Me confirmás disponibilidad? ¡Gracias!"
      : shipping
        ? "¿Me confirmás disponibilidad, costo de envío y el adelanto del 50%? ¡Gracias!"
        : "¿Me confirmás disponibilidad y el adelanto del 50%? ¡Gracias!";
    text.push(line, place, ask);
    location.href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text.join("\n"));
  });
  update();
})();
