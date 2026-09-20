# Anna K Wines — guía del proyecto

Landing estática multiidioma (ES · EN · SV) construida con Astro. Este
documento recoge las convenciones que mantienen el proyecto coherente a
medida que crece. Si una decisión no encaja aquí, cámbiese este documento
primero y el código después.

## Desarrollo

```
npm run dev          # servidor de desarrollo
npm run check        # tipos (astro check)
npm run lint         # eslint
npm run lint:i18n    # verifica que los 3 diccionarios están alineados
npm run format       # prettier --write
npm run build        # prebuild encadena lint:i18n + check
```

## Estructura

```
src/
├─ pages/[...lang]/index.astro   Ruta dinámica: genera /, /en/, /sv/
├─ layouts/BaseLayout.astro      <head>, SEO, hreflang, fuentes, scripts
├─ components/
│  ├─ ui/                        Primitivas reutilizables en cualquier página
│  ├─ layout/                    Nav y Footer
│  └─ sections/                  Secciones concretas de la landing
├─ styles/
│  ├─ tokens.css                 Tokens de diseño (3 capas)
│  ├─ breakpoints.css            @custom-media — único origen de los cortes
│  └─ global.css                 Reset, tipografía base, sistema de reveals
├─ i18n/                         Diccionarios y helpers tipados
├─ data/site.ts                  Datos no lingüísticos (meta, contacto)
└─ scripts/interactions.ts       Comportamiento de cliente
```

## Reglas de CSS

Son las que dan homogeneidad al sitio. No son preferencias de estilo:
romperlas reintroduce el desorden que este sistema eliminó.

**1. Ningún valor literal.** Ni px, ni colores, ni duraciones dentro de un
componente. Todo sale de `tokens.css`. Si falta un valor, se añade primero
como token y después se usa. Las únicas excepciones legítimas son los
descriptores `widths`/`sizes` de `<Image>`, que la especificación exige en
números, y los porcentajes y unidades `ch`/`vw` de layout.

**2. Grid por defecto, flex por excepción.** `display: grid` es la
herramienta de layout del proyecto. Flex sólo se justifica cuando los hijos
deben conservar su ancho natural y envolver en ragged-right — filas de
píldoras, básicamente. Hay cuatro casos así en el proyecto y los cuatro
llevan un comentario explicando por qué.

**3. Separación con `gap` y `padding`; nunca `margin`.** El ritmo vertical
se consigue con `gap` en el contenedor, no con margins en los hijos. Para
empujar un elemento al fondo de una tarjeta se usa `grid-template-rows:
1fr auto`, no `margin-block-start: auto`. Hay exactamente un `margin` en
todo el proyecto: el `margin-inline: auto` de `Container`, que es centrado
estructural y está documentado como tal.

**4. Propiedades lógicas.** `inline-size`/`block-size`,
`padding-inline`/`padding-block`, `inset-inline-start`. No `width`, `left`
ni `margin-left`.

**5. Los breakpoints son tokens.** Las media queries no aceptan `var()`, así
que los cortes se declaran como `@custom-media` en `breakpoints.css` y
PostCSS los resuelve en build. Se escribe `@media (--to-sm)`, nunca
`@media (max-width: 620px)`. Hay cuatro cortes (`--to-xs`, `--to-sm`,
`--to-md`, `--to-lg`) y no deberían hacer falta más: las rejillas de
tarjetas usan `repeat(auto-fit, minmax(var(--col-min), 1fr))` y se adaptan
solas sin ningún corte.

## Tokens

`tokens.css` está en tres capas y sólo se consumen las dos últimas:

1. **Primitivos** — paleta cruda y escalas (`--bone`, `--space-lg`,
   `--text-4xl`). No se usan directamente en componentes salvo las escalas.
2. **Semánticos** — la intención (`--bg`, `--fg`, `--accent`, `--hair`,
   `--muted`). Es lo que se escribe en los componentes.
3. **Tema** — `[data-theme='dark']` redefine los semánticos. Por eso la
   sección "Juez de vinos" no declara ni un color: pone `theme="dark"` en
   `<Section>` y todo lo que hay dentro hereda los valores invertidos.

Consecuencia práctica: **un componente nunca debe saber sobre qué fondo
vive.** Si necesitas un color distinto según el tema, el arreglo es un token
semántico nuevo, no un selector `.dark .mi-clase`.

## Componentes

`src/components/ui/` son las primitivas. Antes de escribir marcado nuevo,
comprueba si ya existe la pieza:

| Componente      | Para qué                                                   |
| --------------- | ---------------------------------------------------------- |
| `Container`     | Ancho máximo + padding lateral. Fija el encuadre del sitio |
| `Section`       | Sección con ritmo vertical, ancla, etiqueta y tema         |
| `SectionHeader` | Índice + título + texto lateral                            |
| `Kicker`        | Eyebrow en versalitas con filete                           |
| `Card`          | Superficie con borde; `raised` añade panel y sombra        |
| `Chip`          | Píldora de texto (`outline` · `accent` · `serif`)          |
| `Seal`          | Inicial en recuadro o círculo (monograma, sello, avatar)   |
| `Button`        | Botón o enlace en píldora                                  |
| `Icon`          | Envoltorio de Lucide con accesibilidad resuelta            |
| `Brand`         | Wordmark, con o sin monograma                              |
| `PortraitPlate` | Retrato sobre "plato" de papel                             |

`Card` reenvía los atributos que no reconoce al elemento raíz, así que
sirve para cualquier etiqueta (`as="form"` con `id` y `novalidate`, por
ejemplo) sin declarar una prop por atributo.

## Internacionalización

- Toda la copy traducible vive en `src/i18n/*.json`. Nada de texto en los
  componentes.
- `es.json` es el fichero canónico: de él se deriva el tipo `Dictionary`,
  así que una clave inexistente es un error de compilación.
- `npm run lint:i18n` verifica que los tres diccionarios tienen la misma
  forma, y `prebuild` lo ejecuta antes de cada build.
- **Añadir un idioma**: su JSON, una entrada en `i18n/ui.ts` y otra en
  `astro.config.mjs`. El enrutado no se toca — la ruta dinámica genera la
  nueva página sola.

## Acoplamiento entre JS y DOM

`interactions.ts` engancha por `id` o por atributo `data-*`, nunca por una
clase de estilo. Renombrar una clase CSS no debe poder romper un
comportamiento. Si un componente necesita ser manipulado por el script,
expone un `data-*` propio (ver `data-parallax` en `PortraitPlate`).

## Pendiente

- **Formulario de contacto**: no tiene backend. El envío se simula en
  cliente. Falta conectar un endpoint real y, con él, la verificación
  anti-bot en servidor (captcha + honeypot + limitación por IP). Mientras
  no exista esa capa el formulario no debe considerarse operativo.
- **Cabeceras de seguridad**: sin CSP ni cabeceras de seguridad. Se
  configuran en el hosting una vez decidido.
- **Datos de ejemplo**: acreditaciones, testimonios, logos de bodega y los
  datos de contacto de `data/site.ts` son placeholders.

## Documentación de referencia

- [Enrutado y rutas dinámicas](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Estilos](https://docs.astro.build/en/guides/styling/)
- [Internacionalización](https://docs.astro.build/en/guides/internationalization/)
- [astro:assets](https://docs.astro.build/en/guides/images/)
