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

`hero-scene-transition.tsx` funde el Hero y un video en una sola escena continua controlada por scroll: no hay un bloque de video aparte entre dos secciones. El contenedor mide 180vh, pero `scrollYProgress` (Motion `useScroll`) no sigue solo eso: usa `offset: ["start start", "end start"]` para trackear el recorrido COMPLETO del sticky, no solo su fase "pineada".

Esto importa porque un panel `sticky` de 100svh dentro de un contenedor de 180vh tiene dos fases: se queda fijo (`top:0`) mientras se scrollean los primeros 80vh, y después necesita otros 100vh completos (su propia altura) para deslizarse fuera de pantalla una vez que se despega — es inherente al mecanismo de `position: sticky`, no algo agregado. Con el offset típico (`"end end"`), `progress` solo cubre esos primeros 80vh y se congela en 1 apenas el panel se despega, dejando el resto (~100vh, "~2 scrolls") sin ninguna animación: lo que sea que haya quedado en pantalla en ese instante se ve congelado durante todo ese tramo. Con `"end start"`, `progress` 0→1 cubre los 180vh enteros (fase fija + deslizamiento), así que se puede seguir animando durante el deslizamiento también.

1. Progreso 0→0.0533: zona muerta, nada se mueve todavía. Sin esto, el hero empezaba a desvanecerse con el primer píxel de scroll, lo que se sentía prematuro.
2. El hero se desvanece y sube (`opacity`/`translateY`) — progreso 0.0533→0.1689.
3. Recién cuando el hero terminó de retirarse el video empieza a revelarse desde el borde inferior hacia arriba vía `clip-path: inset()` (no vía opacity, progreso 0.1689→0.32) mientras hace un leve dolly-in (`scale` 0.88→1.08, hasta 0.4444 — exactamente cuando el panel se despega).
4. El video se mantiene completamente visible (`opacity: 1`) durante todo el resto del recorrido, incluida la fase de deslizamiento, hasta progreso 0.85.
5. Recién en el último 15% (0.85→1) el video se desvanece — llega a `opacity: 0` justo cuando el panel termina de salir de pantalla, así que no queda ningún tramo negro extra antes de "Elegí tu Dresde".

Los breakpoints de 1–3 son los mismos de antes (cuando `progress` solo cubría los 80vh) reescalados ×4/9 (80/180) — disparan en el mismo scroll absoluto en píxeles, cero cambio de comportamiento ahí. Solo el fade (4–5) se reubicó: antes terminaba exactamente al despegarse el panel (dejando ~2 scrolls de negro sin usar), ahora ocupa el tramo final real.

El hero vive en su propia capa (`z-10`) por encima del video (`z-0`) — no es un cross-dissolve: mientras el hero tiene cualquier opacidad, el video literalmente no tiene área visible (`clip-path` en `inset(100%)`), así que nunca se ve el video "atravesando" o mezclado con el logo. Todo depende de `scrollYProgress` (Motion `useScroll` + `useTransform`), nunca de una duración fija, así que scrollear para arriba revierte la escena exactamente frame a frame. Con `prefers-reduced-motion` se muestran hero y video en bloques estáticos, sin sticky ni transform.

El `clip-path` (reveal) y el `scale` (dolly-in) del video viven en dos elementos distintos a propósito: una máscara siempre del tamaño exacto del viewport que solo tiene el `clip-path`, y adentro un `<video>` sobredimensionado (130% ancho/alto) que solo tiene el `scale`. Ponerlos en el mismo elemento hacía que, al achicarse a 0.88 al inicio del reveal, el video dejara franjas negras en los bordes (se veía "cortado" arriba, negro abajo) — con el video siempre de sobra más grande que la máscara, cualquier escala dentro de su rango sigue cubriendo el 100% de la ventana revelada. El ancho del video usa `vw`/`maxWidth:none` explícitos porque el preflight de Tailwind le pone `max-width: 100%` a todo `<video>`/`<img>`, que de otro modo recortaba el ancho de vuelta a 100% del contenedor pese al `width` explícito (el alto no tiene ese preflight y sí escalaba bien — la asimetría fue la pista para encontrar la causa).

**Importante — por qué el `sticky` necesita `overflow-x-clip`, no `overflow-x-hidden`, en `html`/`body`:** por spec de CSS, poner overflow explícito en un solo eje fuerza el otro eje a `auto` en el elemento. Con `overflow-x-hidden` en `<html>` y `<body>` (`layout.tsx`), ambos terminaban con `overflow-y: auto` implícito — dos contenedores de scroll al mismo tiempo, que rompe el cálculo de `position: sticky` en Chrome (el panel nunca queda fijo, se desplaza como contenido normal). `overflow-clip` no participa de esa propagación: previene el overflow horizontal sin convertir a html/body en scroll containers. Si en el futuro hace falta volver a tocar el overflow de html/body, mantener ambos ejes explícitos (`overflow-x-clip overflow-y-visible`) para no reintroducir el bug.

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
