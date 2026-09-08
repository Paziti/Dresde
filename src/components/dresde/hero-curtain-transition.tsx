"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ease } from "@/lib/motion";

// Total length of the whole close → reveal → open sequence. Short and
// decisive on purpose (brief: 0.8–1.2s) — this is a scene change, not a
// piece of content to read.
const TOTAL = 1.0;

// A visible rectangle growing from nothing at the top edge down to full
// height, expressed as a `clip-path: inset()` on an element that is
// *always* rendered at full size — see the note on `<video>` below for
// why this isn't a `scaleY` transform.
const CLOSED = "inset(0% 0% 100% 0%)";
const OPEN = "inset(0% 0% 0% 0%)";

/**
 * The transition between the hero and "Elegí tu Dresde": a curtain drops
 * down to cover the screen, briefly frames the clipper video while fully
 * closed, then retracts back up the way it came — the same motion a real
 * roller blind makes closing and opening, not two different animations
 * stitched together. Driven by `clip-path`, not a `scaleY` transform: a
 * transform that scales the video's ancestor to zero height also zeroes
 * its *rendered* size, and Chrome deprioritizes loading a `<video>` at
 * zero rendered size — the clip stayed at HAVE_NOTHING forever, even
 * once the ancestor grew back to full size, because the browser had
 * already given up on it. `clip-path` only ever hides the overflow; the
 * curtain (and the video inside it) stays at its real, full size the
 * whole time.
 *
 * The video lives *inside* the clipped element rather than as a sibling
 * overlay, so it's only ever visible in the moment the curtain is fully
 * closed — it can't be mistaken for a separate embedded player because
 * it never has its own independent enter/exit motion.
 *
 * Triggered once by scroll position (`useInView` on a sentinel band at
 * the hero/next-section boundary), not by a click, and skipped entirely
 * under `prefers-reduced-motion` — a plain instant scroll is the
 * reduced-motion equivalent, not a slower version of the same animation.
 */
export function HeroCurtainTransition() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sentinelRef, { once: true, amount: 0 });
  const reduce = useReducedMotion();
  const [played, setPlayed] = useState(false);
  // `closed` only ever flips true→once, from the timeout below — mounting
  // itself is derived straight from `inView` (already reactive state)
  // rather than mirrored into a second piece of state from an effect.
  const [closed, setClosed] = useState(false);
  const mounted = inView && !reduce && !closed;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!inView || reduce) return;
    // One tick later so the video element exists before autoplay is
    // attempted, and so `played` flipping is what fires the animation
    // (mounting with it already true would skip the `initial` state).
    const raf = requestAnimationFrame(() => setPlayed(true));
    // Unmount well after the sequence ends — stops the video decoding
    // and drops the fixed overlay from the layer tree once it can no
    // longer be seen, instead of leaving it sitting there forever.
    const unmount = setTimeout(() => setClosed(true), TOTAL * 1000 + 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(unmount);
    };
  }, [inView, reduce]);

  useEffect(() => {
    if (played) videoRef.current?.play().catch(() => {});
  }, [played]);

  // The sentinel: a band starting right at the hero/next-section boundary
  // and extending *down* into the next section, positioned absolutely
  // inside a zero-height wrapper so it never adds a visible gap to the
  // page. It has to sit entirely below the boundary, not straddle it —
  // the hero is `h-svh` (exactly one viewport tall), so on load the
  // boundary itself sits right at the bottom edge of the screen; a band
  // centered on it (half above, half below) put its top half inside the
  // viewport before any scrolling at all, firing the whole sequence
  // immediately on page load instead of waiting for a real scroll past
  // the hero. A 1px line trigger was tried first and is too thin for a
  // real scroll gesture on top of that — a fast flick can render a frame
  // just above it and the next frame already past it, with no frame in
  // between where IntersectionObserver ever saw it overlap the viewport.
  const sentinel = (
    <div className="relative h-0" aria-hidden="true">
      <div ref={sentinelRef} className="absolute inset-x-0 top-8 h-48" />
    </div>
  );

  // Reduced motion: no overlay, no video — the sentinel is still needed
  // as the scroll boundary marker other layout reads off of, but nothing
  // about it animates.
  if (reduce) return sentinel;

  return (
    <>
      {sentinel}
      {mounted && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[70] overflow-hidden"
        >
          {/* Always full-size — see the component doc comment for why
              this can't be a scaleY transform instead. */}
          <motion.div
            className="absolute inset-0 bg-dresde-black"
            initial={{ clipPath: CLOSED }}
            animate={played ? { clipPath: [CLOSED, OPEN, OPEN, CLOSED] } : { clipPath: CLOSED }}
            transition={{
              duration: TOTAL,
              times: [0, 0.3, 0.62, 1],
              ease: [ease.inOut, "linear", ease.inOut],
            }}
          >
            {/* The clipper, framed and vignetted rather than a plain
                rectangular player — it reads as part of the curtain's
                surface, not a video someone dropped on top of it. */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={played ? { opacity: [0, 0, 1, 1, 0, 0] } : { opacity: 0 }}
              transition={{ duration: TOTAL, times: [0, 0.3, 0.38, 0.54, 0.62, 1] }}
            >
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src="/video/clipper-curtain.mp4"
                muted
                autoPlay
                loop
                playsInline
                preload="auto"
                disablePictureInPicture
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
              <div className="absolute inset-0 shadow-[inset_0_0_120px_60px_rgba(0,0,0,0.7)]" />
            </motion.div>

            {/* Flash beat timed to the video's entrance — the brief's
                "flash visual" moment, distinct from the video's own
                fade so the two read as one accented beat, not a loop. */}
            <motion.div
              className="absolute inset-0 bg-dresde-paper"
              initial={{ opacity: 0 }}
              animate={played ? { opacity: [0, 0, 0.16, 0, 0] } : { opacity: 0 }}
              transition={{ duration: TOTAL, times: [0, 0.3, 0.34, 0.42, 1] }}
            />
          </motion.div>

          {/* The roller's leading edge. Not a child of the clipped
              element above (clip-path hides overflow, it doesn't move
              children) — animated in parallel, in %, to track exactly
              where the visible edge is at each point in the sequence. */}
          <motion.div
            className="absolute inset-x-0 h-[2px] bg-dresde-brass"
            initial={{ top: "0%" }}
            animate={played ? { top: ["0%", "100%", "100%", "0%"] } : { top: "0%" }}
            transition={{
              duration: TOTAL,
              times: [0, 0.3, 0.62, 1],
              ease: [ease.inOut, "linear", ease.inOut],
            }}
          />
        </div>
      )}
    </>
  );
}
