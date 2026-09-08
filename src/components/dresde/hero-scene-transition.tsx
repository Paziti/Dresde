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
 * tall container pins both the hero and the video to the viewport and
 * crossfades between them as the user scrolls through it: the hero
 * recedes (fades + drifts up) while the video grows into the focal
 * point, then the video itself fades out as the next section arrives.
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
 * all for a keyboard scroller. A quick cinematic beat between two
 * scenes, not a long sticky hold.
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

  // Hero fades out and drifts up over the first 30% of the scene.
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -48]);

  // Video crossfades in as the hero recedes, holds as the focal point,
  // then fades out as the next section takes over. The scale keeps
  // drifting upward the whole time (0.88 → 1 → 1.08) for a slow
  // dolly-in feel rather than a static rectangle that just appears.
  const videoOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.4, 0.7, 0.95],
    [0, 1, 1, 0],
  );
  const videoScale = useTransform(scrollYProgress, [0.15, 0.5, 1], [0.88, 1, 1.08]);

  // `opacity` is deliberately NOT passed through the motion component's
  // `style` prop here — verified in the browser that it doesn't survive
  // there on this element. The MotionValue itself recalculates correctly
  // every frame (confirmed via its own "change" event), but when mixed
  // into the same style object as transform values (scale, y), Framer's
  // own render pass kept re-committing a stale cached opacity right
  // after any manual write, reverting it every frame. Framer still owns
  // scale/y normally (that path is unaffected); opacity is written
  // directly off the same MotionValue instead, so nothing fights it.
  useMotionValueEvent(heroOpacity, "change", (latest) => {
    if (heroLayerRef.current) heroLayerRef.current.style.opacity = String(latest);
  });
  useMotionValueEvent(videoOpacity, "change", (latest) => {
    if (videoRef.current) videoRef.current.style.opacity = String(latest);
  });

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
        <motion.div
          ref={heroLayerRef}
          style={{ y: heroY }}
          className="absolute inset-0"
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
          style={{ opacity: 0, scale: videoScale }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
    </section>
  );
}
