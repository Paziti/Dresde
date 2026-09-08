"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * The transition between the hero and "Elegí tu Dresde": a video panel
 * that grows to cover the screen as the user scrolls past the hero, and
 * plays continuously the whole time it's on screen — not a timed
 * one-shot animation, but scrubbed directly by scroll position (Motion's
 * `useScroll` + `useTransform`), so it tracks the scroll gesture itself:
 * scroll back up and it shrinks back, scroll down and it grows, exactly
 * as fast or slow as the user scrolls.
 *
 * Implemented as a standard pinned-scroll reveal: a tall container
 * (`h-[200vh]`) holds a `sticky` panel the height of one viewport. While
 * the container's own extra height is being scrolled through, the panel
 * stays pinned and the clip-path animates in step with `scrollYProgress`;
 * once the user scrolls past the container's full height, the sticky
 * panel releases and scrolls away with the rest of the page, naturally
 * handing off to the next section — no separate "opening" animation
 * needed, the scroll itself carries it away.
 */
export function HeroCurtainTransition() {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // 0 → nothing visible yet (a zero-height sliver at the top edge);
  // 1 → the panel is fully covered. Driven by `clip-path`, not a
  // `scaleY` transform on the panel: a transform that scales an
  // ancestor to zero height also zeroes the *rendered* size of the
  // `<video>` inside it, and Chrome deprioritizes loading a video at
  // zero rendered size hard enough that it never recovered even once
  // the ancestor grew back — found this the hard way. `clip-path` only
  // ever hides overflow; the video underneath stays at its real, full
  // size for the whole scroll range, so it loads normally.
  const bottomInset = useTransform(scrollYProgress, [0, 1], [100, 0]);
  const clipPath = useTransform(bottomInset, (v) => `inset(0% 0% ${v}% 0%)`);
  const edgeTop = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Two separate visibility questions on the same container:
  // - `everNear` (once: true) gates *mounting* the <video> at all — no
  //   point fetching a multi-MB file while the visitor is still reading
  //   the hero, well above this section.
  // - `currentlyNear` (no once) gates play/pause once mounted, so it
  //   doesn't keep decoding in the background — and burning battery —
  //   after the visitor has scrolled well past it into other sections.
  const everNear = useInView(containerRef, { once: true, margin: "400px 0px 400px 0px" });
  const currentlyNear = useInView(containerRef, { margin: "200px 0px 200px 0px" });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (currentlyNear) video.play().catch(() => {});
    else video.pause();
  }, [currentlyNear, everNear]);

  // Reduced motion: skip the scroll-jacked reveal and its extra 200vh of
  // scroll distance entirely — straight from hero to content.
  if (reduce) return null;

  return (
    <div ref={containerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-svh w-full overflow-hidden bg-dresde-black">
        <motion.div className="absolute inset-0" style={{ clipPath }} aria-hidden="true">
          {everNear && (
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              src="/video/clipper-curtain.mp4"
              muted
              loop
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60" />
          <div className="absolute inset-0 shadow-[inset_0_0_120px_60px_rgba(0,0,0,0.7)]" />
        </motion.div>

        {/* The roller's leading edge. Not a child of the clipped element
            above (clip-path hides overflow, it doesn't move children) —
            driven by the same scroll progress so it tracks exactly where
            the visible edge is. */}
        <motion.div
          className="absolute inset-x-0 h-[2px] bg-dresde-brass"
          style={{ top: edgeTop }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}
