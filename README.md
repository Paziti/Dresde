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

`hero-scene-transition.tsx` funde el Hero y un video en una sola escena continua controlada por scroll: no hay un bloque de video aparte entre dos secciones. Un contenedor de 180vh fija (`sticky`) el hero y el video superpuestos; a medida que se scrollea (~80vh de recorrido real):

1. Los primeros 0→0.12 de progreso son una zona muerta: nada se mueve todavía. Sin esto, el hero empezaba a desvanecerse con el primer píxel de scroll (el recorrido real es corto, ~80vh), lo que se sentía prematuro.
2. El hero se desvanece y sube (`opacity`/`translateY`) — progreso 0.12→0.38.
3. Recién cuando el hero terminó de retirarse (progreso ≥0.38) el video empieza a revelarse desde el borde inferior hacia arriba vía `clip-path: inset()` (no vía opacity) mientras hace un leve dolly-in (`scale` 0.88→1.08).
4. Un fade corto al final (0.9→1) evita un corte brusco al pasar a "Elegí tu Dresde".

El hero vive en su propia capa (`z-10`) por encima del video (`z-0`) — no es un cross-dissolve: mientras el hero tiene cualquier opacidad, el video literalmente no tiene área visible (`clip-path` en `inset(100%)`), así que nunca se ve el video "atravesando" o mezclado con el logo. Todo depende de `scrollYProgress` (Motion `useScroll` + `useTransform`), nunca de una duración fija, así que scrollear para arriba revierte la escena exactamente frame a frame. Con `prefers-reduced-motion` se muestran hero y video en bloques estáticos, sin sticky ni transform.

El `opacity` del hero y el `clip-path`/`opacity` del video se escriben al DOM a mano desde sus `MotionValue` (`useMotionValueEvent`) en lugar de vía el `style` prop de Framer Motion: en este componente, cualquier propiedad no-transform mezclada con `scale`/`y` en el mismo objeto de estilo, Framer la recalculaba bien pero no la commiteaba al DOM (sí lo hacía con las props de transform). `scale`/`y` siguen yendo por el camino normal de Framer sin problema.

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
