# Reglas de frontend

Obligatorias para el agente `frontend` y para cualquiera que toque `app/**` (sin `api`) o `app/features/*/ui/**`. Se suman a las «Reglas de código» de `AGENTS.md`. Lo que se puede automatizar lo vigila `npm run lint` (HTML semántico y accesibilidad) y `tests/project/palette-contrast.test.ts` (contraste de la paleta).

## 1. Responsive: tres puntos de control

Se diseña **mobile-first** y se comprueba en tres anchos:

| Ancho | Prefijo Tailwind | Qué se espera |
| --- | --- | --- |
| **360 px** (base, sin prefijo) | — | Una columna, navegación plegable, controles apilados |
| **768 px** | `md:` | Dos columnas donde ayude, formularios en rejilla |
| **1024 px** | `lg:` | Tres columnas o panel lateral, navegación horizontal |

Reglas:
1. Los únicos breakpoints son `md` (48 rem = 768 px) y `lg` (64 rem = 1024 px); no se usan `sm:`, `xl:` ni `2xl:`. Se configuran en `app/globals.css` (`--breakpoint-*: initial;` y luego `md` y `lg`).
2. **Sin desplazamiento horizontal** de la página desde 320 px (WCAG 1.4.10, reflujo) hasta pantallas grandes. Contenido ancho (tablas, código) se desplaza dentro de su propio contenedor con `overflow-x-auto` y un nombre accesible.
3. Medidas en `rem`, no en `px` fijos para texto ni alturas de contenedores de texto: la página debe seguir usable con zoom del 200 % y con otro tamaño de letra del navegador.
4. Objetivos táctiles de al menos **44 × 44 px** (`min-h-11 min-w-11`) y separados entre sí.
5. Imágenes: `max-w-full h-auto`; nada de anchos fijos mayores a 360 px.
6. Contenedor de página: `mx-auto w-full max-w-5xl px-4` (16 px de margen lateral en 360 px).
7. Antes de entregar, revisa cada pantalla a 360, 768 y 1024 px (devtools del navegador) y anota en la nota de entrega que lo hiciste.

## 2. HTML semántico

1. Esqueleto de cada página: `<header>`, `<nav aria-label="…">`, `<main id="contenido">`, `<footer>`. Un enlace «Saltar al contenido» es lo primero que se enfoca (WCAG 2.4.1). `<html lang="es">`.
2. **Un solo `<h1>` por página** y encabezados en orden (`h1 → h2 → h3`, sin saltos). Cada `<section>` lleva `aria-labelledby` apuntando a su encabezado.
3. Cada tipo de contenido usa su elemento:

   | Contenido | Elemento |
   | --- | --- |
   | Párrafo | `<p>` |
   | Lista de libros, cuentas, préstamos | `<ul>` / `<ol>` con `<li>`; cada ítem con entidad propia, `<article>` |
   | Datos tabulares | `<table>` con `<caption>`, `<thead>`, `<th scope>` |
   | Fecha | `<time datetime="…">` |
   | Acción (guardar, prestar) | `<button type="…">` |
   | Navegación | `<a>` / `Link` con destino real |
   | Formulario | `<form>`, `<label for>`, `<fieldset>` + `<legend>` para grupos |
   | Mensaje de error / estado | `role="alert"` / `role="status"`, enlazado con `aria-describedby` al campo |
   | Énfasis | `<strong>`, `<em>` |
   | Pregunta / respuesta, citas | `<dl>`, `<blockquote>` |

4. **`<div>` y `<span>` nunca llevan contenido** (ni texto escrito ni `{valor}` de datos): solo sirven para **crear rejillas y composición** (`grid`, `flex`) y **estilos gráficos** (fondos, capas, la marca de agua del lector, iconos decorativos con `aria-hidden="true"`). El lint rechaza texto escrito directamente dentro de ellos; la revisión rechaza datos dentro de ellos.
5. Interactividad solo con elementos interactivos: nada de `<div onClick>`. Todo se usa con teclado (WCAG 2.1.1) y el orden de foco sigue el orden visual.
6. Iconos y adornos: `aria-hidden="true"`. Imágenes con información: `alt` descriptivo; decorativas: `alt=""`.

## 3. Paleta (azul y blanco) y accesibilidad WCAG 2.1 AA

Solo se usan estos colores, definidos una vez como tokens en `app/globals.css` (`@theme`). **Prohibidos** los colores sueltos de Tailwind (`bg-zinc-…`, `text-green-700`, `#abc` en línea). Sin modo oscuro por ahora: se elimina el `prefers-color-scheme: dark` de la plantilla, que rompería la paleta.

| Token (`--color-…`) | Valor | Uso |
| --- | --- | --- |
| `surface` | `#FFFFFF` | Fondo de página y tarjetas |
| `surface-alt` | `#EFF6FF` | Fondos secundarios, filas alternas |
| `surface-strong` | `#DBEAFE` | Chips, resaltado, cabeceras de tabla |
| `ink` | `#0F172A` | Texto principal |
| `ink-muted` | `#475569` | Texto secundario |
| `primary` | `#1D4ED8` | Botones, enlaces, foco |
| `primary-hover` | `#1E40AF` | Estado `hover` / activo |
| `primary-strong` | `#1E3A8A` | Cabecera, texto de énfasis sobre fondos claros |
| `primary-deep` | `#172554` | Pie de página, fondos muy oscuros |
| `line` | `#BFDBFE` | Líneas **decorativas** (separadores). Nunca como borde de un control |
| `control-border` | `#64748B` | Borde de campos y botones secundarios |
| `danger` | `#B91C1C` | Errores (siempre con texto o icono) |
| `success` | `#15803D` | Confirmaciones (siempre con texto o icono) |
| `warning` | `#92400E` | Avisos (siempre con texto o icono) |

`danger`, `success` y `warning` son la única salida de la gama azul y blanca: solo para estados, y nunca comunican algo **solo con el color** (WCAG 1.4.1).

### Pares permitidos y su contraste (calculado con la fórmula de WCAG)

| Texto / elemento | Sobre | Contraste | Mínimo exigido |
| --- | --- | --- | --- |
| `ink` | `surface` | 17,85 | 4,5 (texto) |
| `ink` | `surface-alt` | 16,40 | 4,5 |
| `ink` | `surface-strong` | 14,63 | 4,5 |
| `ink-muted` | `surface` | 7,58 | 4,5 |
| `ink-muted` | `surface-alt` | 6,96 | 4,5 |
| `ink-muted` | `surface-strong` | 6,21 | 4,5 |
| `primary` (enlaces) | `surface` | 6,70 | 4,5 |
| `primary` (enlaces) | `surface-alt` | 6,16 | 4,5 |
| `surface` | `primary` (texto del botón) | 6,70 | 4,5 |
| `surface` | `primary-hover` | 8,72 | 4,5 |
| `surface` | `primary-strong` (cabecera) | 10,36 | 4,5 |
| `surface` | `primary-deep` | 14,69 | 4,5 |
| `primary-strong` | `surface-strong` | 8,49 | 4,5 |
| `danger` | `surface` | 6,47 | 4,5 |
| `success` | `surface` | 5,02 | 4,5 |
| `warning` | `surface` | 7,09 | 4,5 |
| `control-border` | `surface` | 4,76 | 3 (componentes, 1.4.11) |
| `control-border` | `surface-alt` | 4,37 | 3 |
| `primary` (anillo de foco) | `surface` | 6,70 | 3 |
| `surface` (anillo de foco sobre `primary-strong`) | `primary-strong` | 10,36 | 3 |

**Combinaciones que NO se usan:** `primary` sobre `primary-strong` (1,55:1); `ink-muted` sobre `primary-strong` (1,37:1); `line` como texto o como borde de campo sobre `surface` (1,42:1). Sobre fondos oscuros el texto y el foco son `surface`.

### Otras reglas de accesibilidad (WCAG 2.1 AA)
1. **Foco visible** siempre (2.4.7): `outline` de 3 px con `outline-offset` de 2 px, color `primary` (o `surface` sobre fondos oscuros). Nunca `outline: none` sin sustituto.
2. **Etiquetas**: todo campo con `<label>` visible y asociado (1.3.1, 3.3.2); el texto visible forma parte del nombre accesible (2.5.3). Errores identificados en texto y sugiriendo la corrección (3.3.1, 3.3.3).
3. **Texto**: tamaño base 1 rem (16 px), interlineado ≥ 1,5, nada que se rompa al ajustar el espaciado (1.4.12). Enlaces distinguibles sin depender solo del color (subrayado).
4. **Movimiento**: respeta `prefers-reduced-motion`; nada parpadea más de 3 veces por segundo (2.3.1).
5. **Contenido al enfocar/pasar el cursor** (tooltips, menús) se puede descartar y no tapa información (1.4.13).
6. **Pantalla completa del lector**: la capa de derechos de autor es un `role="dialog"` modal con foco atrapado y el botón «Continuar leyendo» enfocado (ver `docs/mensaje-derechos-de-autor.md`).

### Ejemplo de tokens (`app/globals.css`)

```css
@import "tailwindcss";

@theme {
  --breakpoint-*: initial;
  --breakpoint-md: 48rem;
  --breakpoint-lg: 64rem;

  --color-*: initial;
  --color-surface: #ffffff;
  --color-surface-alt: #eff6ff;
  --color-surface-strong: #dbeafe;
  --color-ink: #0f172a;
  --color-ink-muted: #475569;
  --color-primary: #1d4ed8;
  --color-primary-hover: #1e40af;
  --color-primary-strong: #1e3a8a;
  --color-primary-deep: #172554;
  --color-line: #bfdbfe;
  --color-control-border: #64748b;
  --color-danger: #b91c1c;
  --color-success: #15803d;
  --color-warning: #92400e;
}
```

Con esto las clases quedan como `bg-surface`, `text-ink`, `bg-primary`, `border-control-border`, y cualquier color fuera de la paleta deja de existir.
