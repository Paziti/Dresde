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

// On a wide desktop viewport, `object-cover` barely crops this clip
// horizontally — the whole 16:9 frame is visible, and the actual
// haircut/clipper action sits noticeably right of center, with mostly
// empty blurred background on the left third. On a narrow mobile
// portrait viewport, `object-cover` crops HARD on the horizontal axis
// (a tall/narrow box against a wide clip), so the default 50% center
// anchor was landing squarely on that empty left-of-subject area —
// reported as "seeing the left side" on mobile. Biasing the anchor
// right shifts the visible slice toward where the subject actually is.
const VIDEO_OBJECT_POSITION = "70% center";

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
 * The container is 180vh total, but that's NOT what `progress` 0→1
 * tracks. A sticky panel's own height (100svh here) is inherently
 * "dead" scroll-wise in the usual `["start start", "end end"]` setup:
 * that offset only tracks the PINNED phase (container height − panel
 * height = 80vh), and freezes at progress=1 the instant the panel
 * unsticks — leaving the panel's full 100vh release/slide-away glide
 * completely untracked, frozen at whatever state progress=1 left it
 * in. That's exactly what read as "an extra ~2 scrolls of plain
 * black" before this: the old fade finished right as the panel
 * unstuck, so the entire slide-away played out already-faded-to-0.
 *
 * `["start start", "end start"]` instead tracks the WHOLE container
 * (180vh) — pinned phase + release glide, progress 0→1 end to end.
 * Every breakpoint below is the old pinned-phase value rescaled by
 * 80/180 (4/9) so it fires at the exact same scroll position as
 * before (dead zone width, hero timing, reveal, dolly — all
 * unchanged in absolute scroll pixels). Only the fade moves: it now
 * sits in the final ~15% of the FULL range, well into the release
 * glide, so the video keeps accompanying the scroll instead of
 * leaving a dead black gap, and reaches opacity 0 right as the panel
 * finishes sliding away — no leftover black afterward.
 */
export function HeroSceneTransition() {
  const reduce = useReducedMotion();
  const sceneRef = useRef<HTMLElement>(null);
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const videoMaskRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ["start start", "end start"],
  });

  // A short dead zone where scrolling does nothing visible yet: with
  // only ~80vh of real scroll distance driving the pinned phase, the
  // hero used to start fading on the very first pixel scrolled, which
  // read as premature — the transformation kicking in before the user
  // had really committed to scrolling. This buffer gives it a beat to
  // breathe before anything starts moving. After that, hero fades out
  // and drifts up — same shape and same scroll position as before
  // (0.12→0.38 of the old 80vh-only range), just rescaled by 4/9 to
  // land on the same pixels now that progress spans the full 180vh.
  const heroOpacity = useTransform(scrollYProgress, [0.0533, 0.1689], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0.0533, 0.1689], [0, -48]);

  // Video reveal starts only once the hero has fully retired, so
  // there's no window where both are simultaneously visible over the
  // same area. `clipTop` is the percentage still masked off the TOP of
  // the frame: 100 (nothing showing) → 0 (fully revealed) — visually
  // that reads as the video rising up from the bottom edge. The scale
  // dolly-in keeps the same 0.88→1→1.08 sweep as before, reanchored to
  // the same start so it stays in sync with the reveal instead of
  // racing ahead of it. Same rescale as heroOpacity: these are the old
  // 0.38→0.72 / 0.38→0.66→1 breakpoints × 4/9, same scroll pixels.
  const videoClipTop = useTransform(scrollYProgress, [0.1689, 0.32], [100, 0]);
  const videoScale = useTransform(scrollYProgress, [0.1689, 0.2933, 0.4444], [0.88, 1, 1.08]);
  // Fade into "Elegí tu Dresde". Deliberately NOT a rescale of the old
  // [0.75, 1] — that would just recreate the exact bug being fixed
  // here (fade completing the instant the panel unsticks, at the new
  // ~0.4444, leaving the entire release glide already-black). Instead
  // this sits in the last ~15% of the FULL range (pinned phase + the
  // panel's own release glide), so the video keeps accompanying the
  // scroll — sliding with it, not gone — through most of that glide,
  // and only fades in its final stretch, reaching opacity 0 right as
  // the panel finishes leaving the viewport.
  const videoOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

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
  //
  // clip-path and scale are also deliberately on TWO DIFFERENT elements
  // (mask wrapper vs. video), not the same one. `scale` shrinks the
  // whole element toward its center — combined on the same element as
  // a clip-path reveal, the video's own box was smaller than the
  // viewport for most of the range (0.88 at the start), leaving black
  // margins on every edge instead of true edge-to-edge coverage, which
  // is what actually read as "cut off, using only half the screen".
  // The mask (always exactly viewport-sized) owns the clip-path reveal;
  // the video inside it is oversized (130%) and owns the scale dolly,
  // so it always more than covers the mask's window regardless of
  // scale.
  useMotionValueEvent(heroOpacity, "change", (latest) => {
    if (heroLayerRef.current) heroLayerRef.current.style.opacity = String(latest);
  });
  useMotionValueEvent(videoClipTop, "change", (latest) => {
    if (videoMaskRef.current) videoMaskRef.current.style.clipPath = `inset(${latest}% 0% 0% 0%)`;
  });
  useMotionValueEvent(videoOpacity, "change", (latest) => {
    if (videoMaskRef.current) videoMaskRef.current.style.opacity = String(latest);
  });
  // Same reasoning as above: set the mask's starting clip imperatively
  // once, rather than via the style prop, so nothing ever resets it to
  // "fully visible" before the first scroll-driven update arrives.
  useEffect(() => {
    if (videoMaskRef.current) videoMaskRef.current.style.clipPath = "inset(100% 0% 0% 0%)";
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
            style={{ objectPosition: VIDEO_OBJECT_POSITION }}
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

        {/* Always exactly viewport-sized — owns the clip-path reveal
            only. Never scaled itself, so the reveal window is always
            the true full screen, edge to edge. */}
        <div ref={videoMaskRef} className="absolute inset-0 z-0 overflow-hidden">
          {/* Oversized (130%) so that even at the smallest scale in
              videoScale's range (0.88), it still more than covers the
              mask above — no black margins at any point in the dolly. */}
          <motion.video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            autoPlay
            loop
            playsInline
            preload="auto"
            style={{
              scale: videoScale,
              top: "-15%",
              left: "-15%",
              width: "130vw",
              height: "130svh",
              maxWidth: "none",
              objectPosition: VIDEO_OBJECT_POSITION,
            }}
            className="absolute object-cover"
          />
        </div>
      </div>
    </section>
  );
}
