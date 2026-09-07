# Dresde

Landing de marca para Dresde (peluquería & barbería, Bahía Blanca — [@dresde.co](https://www.instagram.com/dresde.co/)). Next.js 16 (App Router) + TypeScript + Tailwind v4 + shadcn/base-ui + Framer Motion.

## Desarrollo

```bash
pnpm install
pnpm dev
```

Abrí [http://localhost:3000](http://localhost:3000).

```bash
pnpm build   # build de producción
pnpm lint    # eslint
```

## Datos de las sucursales

Todo el contenido por local vive en un solo lugar: [`src/lib/locations.ts`](src/lib/locations.ts).

**Real** (viene directo del bio de Instagram de @dresde.co): las 5 direcciones y sus links de WhatsApp, y la foto de fachada de cada local (`images[0]`).

**Mock / placeholder** — reemplazar antes de lanzar:
- Horarios, precios de servicios, nombres y roles de barberos (salvo Franco Lanza en Dresde Alem, que es real).
- Las 2 fotos secundarias de la galería de cada local (interior, sillón de trabajo).
- Falta una 6ª sucursal: el bio solo expone 5 links de WhatsApp, pero un Reel del perfil menciona "seis sucursales".

Para agregar o editar un local, solo hace falta tocar `locations.ts` — todos los componentes leen de esa estructura, no hay nada hardcodeado en el JSX.

## Estructura

```
src/
  app/                    # layout, página, metadata/SEO, favicon/OG generados
  components/dresde/      # componentes propios del sitio
  components/ui/          # primitivas shadcn + @skiper-ui/skiper52 (adaptado en locations-grid.tsx)
  lib/                    # tipos, datos, helpers de WhatsApp/mapa, tokens de motion
public/
  brand/                  # logo
  locations/              # fotos de fachada
  team/                   # fotos de barberos
```
