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
- **Tortas y precios:** la lista `.cakes` en `index.html`.

## Publicación

Funciona en cualquier hosting estático: GitHub Pages, Netlify, Vercel o Cloudflare Pages.
