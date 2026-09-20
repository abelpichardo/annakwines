# Anna K Wines

Sitio estático bilingüe (español · inglés) de Anna K Wines —
_The Spanish Wine Connection_.

Cubre las dos actividades de la empresa: **exportación** y desarrollo
comercial internacional para bodegas españolas (B2B, alcance mundial), y
**catas y enoturismo** bajo la marca _Costa Blanca Wine Club_ (B2C, Costa
Blanca). Cada una tiene su propia página; la home presenta a Anna Granqvist
y bifurca hacia ambas.

Construida con [Astro](https://astro.build). Sin framework de UI ni runtime
de cliente más allá de un script de interacciones: el sitio se sirve como
HTML estático y el JavaScript sólo añade scroll suave, reveals y parallax
sobre una página que ya funciona sin él.

## Puesta en marcha

Requiere Node >= 22.12.

```sh
npm install
npm run dev        # http://localhost:4321
```

## Comandos

| Comando             | Acción                                                   |
| :------------------ | :------------------------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                                   |
| `npm run build`     | Build de producción en `./dist/` (encadena i18n + tipos) |
| `npm run preview`   | Previsualiza el build antes de desplegar                 |
| `npm run check`     | Comprobación de tipos (`astro check`)                    |
| `npm run lint`      | ESLint                                                   |
| `npm run lint:i18n` | Verifica que los tres diccionarios están alineados       |
| `npm run format`    | Prettier sobre todo el proyecto                          |

`prebuild` ejecuta `lint:i18n` y `check`, así que un build que pasa garantiza
que ambos idiomas tienen las mismas claves y que no hay errores de tipos.

## Estructura

```text
src/
├─ pages/[...path].astro         Ruta única: genera las 8 páginas
├─ layouts/BaseLayout.astro      <head>, SEO por página, hreflang, fuentes
├─ components/{ui,layout,pages,sections}/
├─ styles/{tokens,breakpoints,global}.css
├─ i18n/                         Rutas, diccionarios y helpers tipados
├─ data/site.ts                  Redes, denominaciones, datos legales
└─ scripts/interactions.ts       Comportamiento de cliente
```

Las páginas tienen slug propio en cada idioma y las genera todas una sola
ruta catch-all a partir del mapa de `src/i18n/routes.ts`:

| Página             | Español         | Inglés             |
| :----------------- | :-------------- | :----------------- |
| Home               | `/`             | `/en/`             |
| Exportación        | `/exportacion/` | `/en/export/`      |
| Catas y enoturismo | `/catas/`       | `/en/wine-events/` |
| Privacidad         | `/privacidad/`  | `/en/privacy/`     |

## Convenciones

El proyecto sigue un sistema de diseño estricto — tokens para todo, grid
sobre flex, separación con `gap`/`padding` y nunca `margin`, breakpoints
tokenizados. **Antes de escribir CSS o crear un componente, lee
[`AGENTS.md`](./AGENTS.md)**, que es la fuente de verdad de esas reglas y
del catálogo de componentes reutilizables.

## Antes de publicar

- El formulario de contacto **no tiene backend ni protección anti-bot**: el
  envío se simula en cliente.
- **`legal.address` está vacío a propósito** en `src/data/site.ts`. La LSSI
  obliga a publicar el domicilio del prestador; hay que decidir cuál antes
  de publicar. La página legal omite la línea mientras esté vacío.
- Las cuentas de _Costa Blanca Wine Club_ aún no existen: están marcadas con
  `pending: true` y se muestran como "en preparación".
- Confirmar la adhesión a **Wine in Moderation** antes de usar su logotipo.
- Faltan las cabeceras de seguridad y la CSP (dependen del hosting).
- `astro.config.mjs` fija el dominio de producción, usado para el sitemap,
  las URLs canónicas y los `hreflang`.
