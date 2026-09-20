# Anna K Wines — guía del proyecto

Sitio estático bilingüe (ES · EN) construido con Astro. Este documento
recoge las convenciones que mantienen el proyecto coherente a medida que
crece. Si una decisión no encaja aquí, cámbiese este documento primero y el
código después.

## Las dos patas del negocio

El sitio cubre dos actividades con públicos que casi no se solapan:

- **Exportación** (B2B, alcance mundial): export manager externo y servicios
  comerciales para bodegas españolas y empresas internacionales.
- **Catas y enoturismo** (B2C, Costa Blanca): marca _Costa Blanca Wine Club_,
  dirigida a consumidores finales, muchos de ellos extranjeros residentes.

Lo que las une es Anna: su conocimiento del vino español da credibilidad a
las dos. Lo que las separa es el público, y por eso **cada una tiene su
propia página**: quien llega desde un grupo de Facebook buscando una cata no
debe aterrizar en contenido sobre redes de distribución internacional, y al
revés. La home no vende ninguna de las dos: presenta a Anna y bifurca.

Consecuencia práctica: **al añadir contenido, decide primero a qué pata
pertenece.** Si sirve a las dos (biografía, acreditaciones, contacto), va en
la home o en `sections/shared/`.

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
├─ pages/[...path].astro         Ruta ÚNICA: genera las 8 combinaciones
├─ layouts/BaseLayout.astro      <head>, SEO por página, hreflang, fuentes
├─ components/
│  ├─ ui/                        Primitivas reutilizables en cualquier página
│  ├─ layout/                    Nav y Footer
│  ├─ pages/                     Composición de cada página (qué secciones)
│  └─ sections/
│     ├─ home/                   Hero, Doors, Anna, Credentials
│     ├─ export/                 Hero, Intro, Services, Manager, Clients
│     ├─ tastings/               Hero, Offer, Trips, Social
│     └─ shared/                 Contact, ContactForm, Privacy
├─ styles/
│  ├─ tokens.css                 Tokens de diseño (3 capas)
│  ├─ breakpoints.css            @custom-media — único origen de los cortes
│  └─ global.css                 Reset, tipografía base, sistema de reveals
├─ i18n/
│  ├─ routes.ts                  Mapa de páginas y slugs por idioma
│  ├─ ui.ts                      Registro de idiomas y diccionarios
│  └─ {es,en}.json               Toda la copy traducible
├─ data/site.ts                  Datos no lingüísticos (redes, DOs, legal)
└─ scripts/interactions.ts       Comportamiento de cliente
```

## Rutas

Las URLs tienen **slug propio en cada idioma** (`/catas/` ↔
`/en/wine-events/`), definidos en `i18n/routes.ts`. Una única ruta
catch-all genera las ocho combinaciones de página × idioma.

- **Nunca escribas una URL a mano.** Usa `pageUrl(page, lang)`. Devuelve
  siempre la barra final, porque el `canonical` que genera Astro la lleva y
  si el `hreflang` no coincidiera exactamente, Google leería dos URLs
  distintas y el grupo de idiomas no validaría.
- **Añadir una página**: una entrada en `pageKeys` + `slugs`, su componente
  en `components/pages/` y una línea en el mapa `views` de la ruta.
- **Añadir un idioma**: su JSON, una entrada en `i18n/ui.ts`, una columna en
  `slugs` y otra en `astro.config.mjs`.

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
| `DoorCard`      | Tarjeta-puerta que dirige a cada pata del negocio          |
| `SocialLinks`   | Bloque de redes; muestra las cuentas aún no creadas        |
| `BrandIcon`     | Logotipos de Facebook, Instagram y LinkedIn                |
| `Button`        | Botón o enlace en píldora                                  |
| `Icon`          | Envoltorio de Lucide con accesibilidad resuelta            |
| `Brand`         | Wordmark, con o sin monograma                              |
| `PortraitPlate` | Retrato sobre "plato" de papel                             |

`Card` reenvía los atributos que no reconoce al elemento raíz, así que
sirve para cualquier etiqueta (`as="form"` con `id` y `novalidate`, por
ejemplo) sin declarar una prop por atributo.

**Nunca un filete decorativo delante de un eyebrow.** Ese pequeño trazo
horizontal antes de un texto en versalitas es un adorno genérico de
maquetación asistida por IA — se retiró de `Kicker` (ya eliminado) al
sustituirlo por `HeroEyebrow`. Si un hero necesita más presencia visual, la
solución es `HeroFacts` (hechos reales tras un filete horizontal, no una
insignia con una cifra inventada) o ajustar la composición tipográfica —
nunca un adorno sin contenido.

## Formularios

Todo campo se escribe con `Field`, nunca con `<input>` suelto: el componente
resuelve el vínculo `label`↔control, el `aria-describedby` hacia el mensaje
de error y los anclajes `data-*` del script. El comportamiento lo añade
`scripts/form.ts` como mejora progresiva.

- **Validación propia, no la nativa.** Los globos del navegador no se pueden
  traducir ni dar estilo, y cambian de forma entre navegadores. El formulario
  lleva `novalidate` y valida en línea.
- **Cuándo avisar.** Al salir del campo, nunca en la primera pulsación.
  Una vez marcado un error, sí se revalida al escribir, para que el aviso
  desaparezca en cuanto se corrige.
- **El estado de error es `aria-invalid`, no una clase.** El CSS se engancha
  a `[aria-invalid='true']`, de modo que el estilo y el anuncio al lector de
  pantalla no pueden desincronizarse.
- **Los mensajes viajan en `data-msg-*`** desde el servidor, ya traducidos:
  así el script no necesita conocer la i18n.
- **Nada de máscaras rígidas.** El público es internacional: un molde fijo
  rechazaría números válidos. El teléfono se agrupa de forma permisiva
  respetando los prefijos E.164 (de 1, 2 o 3 dígitos), y el cursor se
  restaura contando dígitos, no caracteres. El agrupado definitivo se aplica
  al salir del campo, porque hacerlo en vivo reordenaría lo ya escrito.

`formatPhone` es una función pura y exportada precisamente para poder
probarla sin navegador.

## Internacionalización

- Toda la copy traducible vive en `src/i18n/*.json`. Nada de texto en los
  componentes.
- `es.json` es el fichero canónico: de él se deriva el tipo `Dictionary`,
  así que una clave inexistente es un error de compilación.
- `npm run lint:i18n` verifica que los diccionarios tienen la misma forma, y
  `prebuild` lo ejecuta antes de cada build. El script descubre los idiomas
  leyendo el directorio, así que no hay que tocarlo al añadir o quitar uno.
- El inglés **no es una traducción literal**: la página de catas se dirige a
  residentes extranjeros en la Costa Blanca, que son un público propio.

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
- **Domicilio social**: `legal.address` en `data/site.ts` está vacío a
  propósito. La LSSI (art. 10) obliga a publicar el domicilio del prestador,
  pero el actual coincide con el domicilio particular de la fundadora. Hay
  que decidir entre trasladarlo (gestoría o coworking) o publicarlo. La
  página legal omite la línea mientras esté vacío.
- **Redes de Costa Blanca Wine Club**: aún no existen. Están en
  `social.tastings` con `pending: true`, lo que las muestra como "cuenta en
  preparación" en vez de enlazar a un 404. Al crearlas, poner la URL y
  quitar el flag.
- **Wine in Moderation**: por ahora sólo enlace de texto. El logotipo
  requiere estar adherido al programa; confirmar antes de incluirlo.
- **Cabeceras de seguridad**: sin CSP. Se configuran en el hosting.
- **Bodegas cliente**: se publican denominaciones y perfil de productor, no
  nombres (decisión deliberada: hay información comercial sensible y posibles
  acuerdos de exclusividad).

## Documentación de referencia

- [Enrutado y rutas dinámicas](https://docs.astro.build/en/guides/routing/)
- [Componentes Astro](https://docs.astro.build/en/basics/astro-components/)
- [Estilos](https://docs.astro.build/en/guides/styling/)
- [Internacionalización](https://docs.astro.build/en/guides/internationalization/)
- [astro:assets](https://docs.astro.build/en/guides/images/)
