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

Son 5 sucursales en total — confirmado por el caption de un post de aniversario del propio Instagram — así que las 5 direcciones ya cargadas son la lista completa.

**Mock / placeholder** — reemplazar antes de lanzar:
- Horarios, precios de servicios, nombres y roles de barberos (salvo Franco Lanza en Dresde Alem, que es real).
- Las 2 fotos secundarias de la galería de cada local (interior, sillón de trabajo).
- La sección Instagram (`src/lib/gallery.ts`) tiene 2 fotos reales bajadas del perfil (una es el cover de un Reel) y 4 placeholders — sumar más posts reales cuando se elijan.

Para agregar o editar un local, solo hace falta tocar `locations.ts` — todos los componentes leen de esa estructura, no hay nada hardcodeado en el JSX.

## Transición hero → contenido

`hero-scene-transition.tsx` funde el Hero y un video en una sola escena continua controlada por scroll: no hay un bloque de video aparte entre dos secciones, sino un crossfade real. Un contenedor de 180vh fija (`sticky`) el hero y el video superpuestos; a medida que se scrollea (~80vh de recorrido real), el hero se desvanece y sube (`opacity`/`translateY`) mientras el video gana presencia y escala (`opacity`/`scale`) hasta ser el foco, para luego desvanecerse él también y dar paso a "Elegí tu Dresde". Todo es función de `scrollYProgress` (Motion `useScroll` + `useTransform`), nunca de una duración fija, así que scrollear para arriba revierte la escena exactamente frame a frame. Con `prefers-reduced-motion` se muestran hero y video en bloques estáticos, sin sticky ni transform.

El `opacity` del hero y del video se escribe al DOM a mano desde el mismo `MotionValue` (`useMotionValueEvent`) en lugar de vía el `style` prop de Framer Motion: en este componente, mezclado con `scale`/`y` en el mismo objeto de estilo, Framer recalculaba `opacity` bien pero no lo commiteaba al DOM (sí lo hacía con las props de transform). `scale`/`y` siguen yendo por el camino normal de Framer sin problema.

El video (no es contenido de Dresde — clip de stock genérico, `public/video/clipper-curtain.mp4`, licencia libre de Pexels) se reproduce solo mientras la escena está en viewport (`useInView`). Reemplazable por cualquier otro clip corto (sin gente hablando, sin texto en pantalla) cambiando el `src` del `<video>`.

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
  video/                  # clip de la transición hero → contenido
```
