# Andrea Tempesti · Pastelería y casa de té

Sitio web estático de la pastelería take away y casa de té de Andrea Tempesti (Alberdi 913, Pérez, Santa Fe).

## Estructura

```
index.html          Página única con todas las secciones
css/styles.css      Estilos (paleta y tipografías en :root)
js/main.js          Estado "abierto/cerrado", animaciones al hacer scroll y la secuencia de los alfajores
assets/img/         Fotos del local, logos (máscaras PNG) y cuadros del video de Entre Rieles
assets/favicon.png
```

No tiene dependencias ni paso de build. Para verlo en local:

```
python3 -m http.server 8000
```

y abrir http://localhost:8000. (Abrir el archivo directo con doble clic no muestra los logos, porque las máscaras CSS necesitan un servidor.)

## Dónde cambiar cosas

- **Colores y letras:** variables al comienzo de `css/styles.css`.
- **Horarios:** la lista `#hours` en `index.html` y el objeto `H` en `js/main.js` (que calcula "Abierto ahora").
- **Tortas y precios:** los `.cake` dentro de `#tortas` en `index.html`.
- **Fotos de tortas:** guardar cada foto en `assets/img/tortas/` con el nombre que figura en su `data-img` (por ejemplo `rogel.jpg`, `chocotorta.jpg`, `new-york-cheesecake.jpg`). Formato vertical 4:5, unos 800x1000. La web las detecta sola: si la foto existe la muestra, si no muestra la ficha con nombre y precio.

## Publicación

Funciona en cualquier hosting estático: GitHub Pages, Netlify, Vercel o Cloudflare Pages.

## Pedidos de tortas

Tocar cualquier torta (o "Encargar torta") abre un panel desde abajo con el formulario. Al enviar, se abre WhatsApp con el pedido en formato comanda. En `js/main.js`, completar `WHATSAPP` con el número de Andrea (código de país sin `+`, por ejemplo `5493411234567`). Mientras esté vacío (demo), WhatsApp deja elegir el contacto.

## Que la encuentren

- `robots.txt` y `sitemap.xml` ya están listos para Google.
- Datos estructurados (negocio local + preguntas frecuentes) en el `<head>` de `index.html`.
- Pendiente fuera del sitio: perfil de Google Business con dirección, horarios, fotos y el link a esta web; alta en Google Search Console; link de la web en la bio de Instagram y en el Linktree.
