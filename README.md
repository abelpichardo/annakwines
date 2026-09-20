# Anna K Wines

Landing estática multiidioma (español · inglés · sueco) de Anna K Wines,
consultora e importadora de vinos españoles en el norte de Europa.

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
que los tres idiomas tienen las mismas claves y que no hay errores de tipos.

## Estructura

```text
src/
├─ pages/[...lang]/index.astro   Ruta dinámica: genera /, /en/, /sv/
├─ layouts/BaseLayout.astro      <head>, SEO, hreflang, fuentes
├─ components/{ui,layout,sections}/
├─ styles/{tokens,breakpoints,global}.css
├─ i18n/                         Diccionarios y helpers tipados
├─ data/site.ts                  Datos no lingüísticos
└─ scripts/interactions.ts       Comportamiento de cliente
```

Una sola ruta dinámica genera los tres idiomas: añadir uno nuevo no requiere
crear páginas, sólo su diccionario y una entrada en `i18n/ui.ts`.

## Convenciones

El proyecto sigue un sistema de diseño estricto — tokens para todo, grid
sobre flex, separación con `gap`/`padding` y nunca `margin`, breakpoints
tokenizados. **Antes de escribir CSS o crear un componente, lee
[`AGENTS.md`](./AGENTS.md)**, que es la fuente de verdad de esas reglas y
del catálogo de componentes reutilizables.

## Antes de publicar

- El formulario de contacto **no tiene backend ni protección anti-bot**: el
  envío se simula en cliente.
- Faltan las cabeceras de seguridad y la CSP (dependen del hosting).
- Las acreditaciones, testimonios, logos de bodega y los datos de contacto
  de `src/data/site.ts` son placeholders.
- `astro.config.mjs` fija el dominio de producción, usado para el sitemap,
  las URLs canónicas y los `hreflang`.
