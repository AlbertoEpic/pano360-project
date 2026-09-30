# Guía para tontos: cómo añadir un nuevo panorama 360° a la web (a mano)

Esta guía está pensada para que cualquiera, **sin usar ningún agente de IA**, pueda añadir una nueva panorámica al catálogo siguiendo los pasos tal cual, uno a uno.

No necesitas saber programar. Solo necesitas:
- Un editor de texto (puede ser el propio VS Code).
- La foto panorámica 360° (formato equirectangular, normalmente con relación de aspecto 2:1, por ejemplo 6000x3000 px).
- Una miniatura/foto normal para la tarjeta del catálogo (puede ser un recorte cuadrado de la propia panorámica).

---

## Paso 0: Entender dónde va cada cosa

En este proyecto hay 3 sitios que hay que tocar SIEMPRE que se añade un panorama nuevo:

1. **`public/panoramas/`** → aquí va la imagen 360° completa (la equirectangular).
2. **`public/products/`** → aquí va la imagen normal (miniatura) que se ve en las tarjetas del catálogo.
3. **`src/data/products.js`** → aquí se añade un bloque de texto con los datos del panorama (título, descripción, categoría, fecha, etc.).

No hace falta tocar ningún otro archivo. La web genera la página automáticamente a partir de estos datos.

---

## Paso 1: Prepara las dos imágenes

1. Prepara tu foto panorámica 360° ya editada (equirectangular).
2. Prepara una foto normal (no 360°) que sirva de portada/miniatura para el catálogo. Puede ser un recorte cuadrado de la propia panorámica o cualquier otra foto representativa.
3. Ponles el mismo nombre de archivo a ambas (esto es muy importante), usando solo:
   - Letras minúsculas
   - Números
   - Guiones `-` en vez de espacios
   - Sin tildes, sin ñ, sin símbolos raros

   Ejemplo correcto: `pico-del-aguila-canfranc-1-972m.jpg`

   Este nombre (sin la extensión `.jpg`) se llama **"slug"** y es el identificador único del panorama. **No puede repetirse** con ningún otro panorama existente.

   > Consejo: mira los nombres de archivo que ya existen en `public/panoramas` y `public/products` para copiar el mismo estilo.

---

## Paso 2: Copia las imágenes a sus carpetas

1. Copia la imagen panorámica (equirectangular) dentro de la carpeta:
   ```
   public/panoramas/
   ```
   con el nombre elegido, por ejemplo:
   ```
   public/panoramas/mi-nuevo-panorama.jpg
   ```

2. Copia la imagen normal (miniatura) dentro de la carpeta:
   ```
   public/products/
   ```
   con **el mismo nombre exacto**, por ejemplo:
   ```
   public/products/mi-nuevo-panorama.jpg
   ```

---

## Paso 3: Abre el archivo de datos

Abre este archivo con VS Code (o cualquier editor de texto):

```
src/data/products.js
```

Verás que empieza así:

```js
export const productData = [
  {
    "slug": "colegiata-de-santa-maria-la-mayor-bolea-huesca",
    "title": "Colegiata de Santa María la Mayor (Bolea, Huesca)",
    "category": "Arquitectura",
    "excerpt": "Joya del Renacimiento.\nSiglos XI-XVI.",
    "description": "El templo fue Priorato de la Abadía Real...",
    "date": "2019-10-23",
    "image": "/products/colegiata-de-santa-maria-la-mayor-bolea-huesca.jpg",
    "panorama": "/panoramas/colegiata-de-santa-maria-la-mayor-bolea-huesca.jpg"
  },
  {
    "slug": "bosque-del-betato",
    ...
  },
  ...
];
```

Es una lista de bloques `{ ... }`, uno por cada panorama, separados por comas.

---

## Paso 4: Añade tu nuevo bloque

1. Justo **después de la primera llave `[` que abre la lista** (o después de cualquier otro bloque `},`), pega un bloque nuevo con esta plantilla:

```js
  {
    "slug": "mi-nuevo-panorama",
    "title": "Título bonito de mi panorama",
    "category": "Lugares",
    "excerpt": "Frase corta que resume el sitio.",
    "description": "Descripción larga del lugar. Puedes escribir varios párrafos separándolos con \n\n.",
    "date": "2026-09-30",
    "image": "/products/mi-nuevo-panorama.jpg",
    "panorama": "/panoramas/mi-nuevo-panorama.jpg"
  },
```

2. Rellena cada campo:

| Campo | Qué poner | Ejemplo |
|---|---|---|
| `slug` | El mismo nombre de archivo que usaste en el Paso 1 (sin `.jpg`) | `"mi-nuevo-panorama"` |
| `title` | El título que se mostrará en la web | `"Pico del Águila"` |
| `category` | Una categoría existente (mira las que ya hay: `Arquitectura`, `Lugares`, `Cimas`, etc.) o una nueva si quieres crear una categoría distinta | `"Cimas"` |
| `excerpt` | Frase corta (1-2 líneas) que aparece en la tarjeta del catálogo | `"Un mirador espectacular del Pirineo."` |
| `description` | Texto largo de la ficha del panorama. Para separar en párrafos, escribe `\n\n` entre ellos | `"Primer párrafo...\n\nSegundo párrafo..."` |
| `date` | Fecha en formato `AAAA-MM-DD` | `"2026-09-30"` |
| `image` | Ruta a la miniatura, siempre empieza por `/products/` y termina igual que el archivo copiado en el Paso 2 | `"/products/mi-nuevo-panorama.jpg"` |
| `panorama` | Ruta a la panorámica, siempre empieza por `/panoramas/` y termina igual que el archivo copiado en el Paso 2 | `"/panoramas/mi-nuevo-panorama.jpg"` |

### ⚠️ Reglas importantes para no romper nada

- **No olvides ninguna coma** entre campos (`,`) ni la coma final `},` que separa tu bloque del siguiente.
- Todos los textos van entre **comillas dobles** `" "`.
- Si tu texto contiene comillas dobles dentro, escríbelas como `\"`.
- Si tu texto contiene saltos de línea, escríbelos como `\n` (o `\n\n` para un párrafo nuevo), **nunca pulses Enter dentro del texto**.
- El último bloque de la lista **no lleva coma** después del `}`, pero el resto sí. Si añades tu bloque en medio o al principio, siempre debe acabar en `},`.
- El `slug` debe ser único, no puede repetirse con otro panorama ya existente.

---

## Paso 5: Guarda el archivo

Guarda `src/data/products.js` (Ctrl+S).

---

## Paso 6: Comprueba que todo funciona

1. Abre una terminal en la carpeta del proyecto.
2. Ejecuta:
   ```
   pnpm dev
   ```
3. Abre en el navegador la dirección que te indique la terminal (normalmente `http://localhost:4321`).
4. Ve a la página **Catálogo** y comprueba que:
   - Aparece la nueva tarjeta con tu miniatura, título y categoría.
   - Al hacer clic, se abre la ficha del panorama.
   - La imagen 360° carga bien y se puede mover con el ratón/dedo.
5. Si algo no aparece:
   - Revisa que el `slug` en `products.js` coincide EXACTAMENTE con el nombre de los dos archivos de imagen (sin `.jpg`).
   - Revisa que no falta ninguna coma `,` ni comilla `"` en el bloque que añadiste (un error de sintaxis en este archivo rompe TODO el catálogo, no solo tu panorama).
   - Revisa que las imágenes están en las carpetas correctas (`public/panoramas` y `public/products`).

---

## Ejemplo completo de bloque nuevo

```js
  {
    "slug": "ibon-de-bachimana",
    "title": "Ibón de Bachimaña",
    "category": "Lugares",
    "excerpt": "Un lago de alta montaña en pleno Valle de Tena.",
    "description": "El ibón de Bachimaña es uno de los lagos de montaña más bonitos del Pirineo aragonés.\n\nSe encuentra a más de 2.200 metros de altitud y es un destino habitual de senderismo en verano.",
    "date": "2026-09-30",
    "image": "/products/ibon-de-bachimana.jpg",
    "panorama": "/panoramas/ibon-de-bachimana.jpg"
  },
```

Con esto, la web crea automáticamente:
- Una tarjeta en `/catalogo`
- Una página propia en `/productos/ibon-de-bachimana/` con el visor 360°, botones para compartir, etc.

---

## Resumen ultra rápido (chuleta)

1. Nombra tus 2 imágenes igual (ej: `mi-panorama.jpg`).
2. Copia la panorámica a `public/panoramas/mi-panorama.jpg`.
3. Copia la miniatura a `public/products/mi-panorama.jpg`.
4. Abre `src/data/products.js`.
5. Copia un bloque `{ ... },` existente, pégalo, y cambia sus datos (usando `mi-panorama` como slug).
6. Guarda el archivo.
7. Ejecuta `pnpm dev` y revisa el catálogo.
