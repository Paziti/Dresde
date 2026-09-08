"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { DresdeHero } from "./dresde-hero";

// Not Dresde's own footage — generic stock clip, kept only until real
// content replaces it. See public/video/ and the README.
const VIDEO_SRC = "/video/clipper-curtain.mp4";

/**
 * Hero → "Elegí tu Dresde" as one continuous scroll-driven scene, not
 * hero-section, then separate-video-block, then next-section. A single
 * tall container pins both the hero and the video to the viewport.
 *
 * The two are genuinely separate layers, not a cross-dissolve:
 *   - Hero sits in its own stacking context on top (z-10) and fades +
 *     drifts up exactly as before (progress 0→0.3).
 *   - Video sits underneath (z-0) and stays fully clipped — zero
 *     visible area, not just opacity 0 — until the hero has finished
 *     retiring. It then reveals from the BOTTOM edge upward via
 *     `clip-path: inset()`, like a scene sliding in from below, rather
 *     than fading in on top of the hero. Because it's a hard geometric
 *     mask (not alpha blending), the video never visually bleeds
 *     through the logo while the logo is still on screen.
 *
 * Everything is a function of scroll progress (useScroll → useTransform),
 * never a fixed-duration animation — scrolling back up reverses it
 * exactly, frame for frame.
 *
 * The pinned range is short on purpose: 180vh total, so there's ~80vh
 * of actual scroll distance to sweep progress 0→1 (the sticky panel
 * itself is a full 100svh of that). That 80vh matters for more than
 * pacing — anything much thinner gets skipped by a single Page Down /
 * spacebar jump (browsers move ~90% of the viewport in one step with
 * no intermediate frames), which would make the video never render at
 * all for a keyboard scroller.
 */
export function HeroSceneTransition() {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end end"],
  });

  // Hero fades out and drifts up over the first 30% of the scene —
  // unchanged from before.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -48]);

  // Video reveal starts only once the hero has fully retired (0.3), so
  // there's no window where both are simultaneously visible over the
  // same area. `clipTop` is the percentage still masked off the TOP of
  // the frame: 100 (nothing showing) → 0 (fully revealed) — visually
  // that reads as the video rising up from the bottom edge. The scale
  // dolly-in keeps the same 0.88→1→1.08 sweep as before, just
  // reanchored to the same 0.3 start so it stays in sync with the
  // reveal instead of racing ahead of it.
  const videoClipTop = useTransform(scrollYProgress, [0.3, 0.7], [100, 0]);
  const videoScale = useTransform(scrollYProgress, [0.3, 0.65, 1], [0.88, 1, 1.08]);
  // Short fade right at the very end, so the cut into "Elegí tu Dresde"
  // isn't an abrupt hard stop once the sticky panel releases.
  const videoOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);

  // `opacity` (and, for the same reason, `clip-path`) are deliberately
  // NOT passed through the motion component's `style` prop here —
  // verified in the browser that non-transform CSS properties don't
  // reliably survive there on this element. The MotionValue itself
  // recalculates correctly every frame (confirmed via its own "change"
  // event), but mixed into the same style object as transform values
  // (scale, y), Framer's own render pass kept re-committing a stale
  // cached value right after any manual write, reverting it every
  // frame. Framer still owns scale/y normally (that path is
  // unaffected); opacity and clip-path are written directly off their
  // MotionValues instead, so nothing fights the manual write.
  useMotionValueEvent(heroOpacity, "change", (latest) => {
    if (heroLayerRef.current) heroLayerRef.current.style.opacity = String(latest);
  });
  useMotionValueEvent(videoClipTop, "change", (latest) => {
    if (videoRef.current) videoRef.current.style.clipPath = `inset(${latest}% 0% 0% 0%)`;
  });
  useMotionValueEvent(videoOpacity, "change", (latest) => {
    if (videoRef.current) videoRef.current.style.opacity = String(latest);
  });
  // Same reasoning as above: set the video's starting mask imperatively
  // once, rather than via the style prop, so nothing ever resets it to
  // "fully visible" before the first scroll-driven update arrives.
  useEffect(() => {
    if (videoRef.current) videoRef.current.style.clipPath = "inset(100% 0% 0% 0%)";
  }, []);

  // Play only while the scene is actually part of the transition, not
  // for the whole time it merely exists in the DOM — pauses decoding
  // once the user has scrolled well past it (or hasn't reached it yet).
  // Continuous (no `once`), so scrolling back into range resumes it.
  const inView = useInView(sceneRef);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduce) return;
    if (inView) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [inView, reduce]);

  if (reduce) {
    return (
      <>
        <DresdeHero />
        <section
          aria-hidden="true"
          className="relative h-[70svh] w-full overflow-hidden bg-dresde-black"
        >
          <video
            src={VIDEO_SRC}
            muted
            autoPlay
            loop
            playsInline
            preload="metadata"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </section>
      </>
    );
  }

  return (
    <section ref={sceneRef} className="relative h-[180vh] w-full bg-dresde-black">
      <div className="sticky top-0 h-svh w-full overflow-hidden">
        {/* z-10: an explicit stacking context above the video, not just
            DOM-order luck — the hero must never be paintable-under the
            video even for a single frame. */}
        <motion.div
          ref={heroLayerRef}
          style={{ y: heroY }}
          className="absolute inset-0 z-10"
        >
          <DresdeHero />
        </motion.div>

        <motion.video
          ref={videoRef}
          src={VIDEO_SRC}
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          style={{ scale: videoScale }}
          className="absolute inset-0 z-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
