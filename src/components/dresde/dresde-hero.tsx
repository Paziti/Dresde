"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ease, duration } from "@/lib/motion";

// Served from /public/brand — the real Dresde wordmark, cropped tight
// from a high-res file provided directly. The crop had noticeably more
// black padding on the left than the right (plus a stray thin line
// artifact in it), which put the actual glyphs off-center within the
// frame — trimmed to match, so the wordmark now sits centered. Native
// size (675×347) is passed explicitly since files under /public aren't
// statically imported the way src/ assets are.
const LOGO_WIDTH = 675;
const LOGO_HEIGHT = 347;

/**
 * The first screen. Purpose named: brand entrance (rare/first-time tier —
 * the one place a slower, more deliberate reveal is earned). Almost
 * nothing else is allowed to compete with the mark.
 *
 * The logo is the real Dresde wordmark, provided at high enough
 * resolution to hold a genuinely large hero size without softening.
 */
export function DresdeHero() {
  const reduce = useReducedMotion();

  return (
    <section
      aria-label="Dresde"
      className="relative flex h-svh min-h-[560px] w-full flex-col items-center justify-center overflow-hidden bg-dresde-black"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.medium, ease: ease.out, delay: reduce ? 0 : 0.9 }}
        className="mb-6 font-sans text-label uppercase tracking-[0.32em] text-dresde-mute sm:mb-8"
      >
        Peluquería &amp; Barbería
      </motion.p>

      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(28px) scale(0.96)" }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px) scale(1)" }}
        transition={{ duration: reduce ? duration.medium : duration.cinematic, ease: ease.out }}
        // Capped by vh as well as vw/px: at this logo's ~2.1:1 aspect
        // ratio, an 83vh-wide cap keeps its rendered height under ~40% of
        // the viewport, so the label/tagline/scroll cue around it never
        // collide on short or wide-but-low viewports.
        className="w-[min(78vw,720px,83vh)] px-4"
      >
        <Image
          src="/brand/dresde-logo.png"
          alt="Dresde"
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          priority
          className="h-auto w-full select-none"
          sizes="(min-width: 720px) 720px, 78vw"
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.medium, ease: ease.out, delay: reduce ? 0 : 1.3 }}
        className="mt-6 max-w-[22ch] text-balance text-center font-sans text-small text-dresde-paper-dim sm:mt-8"
      >
        Más que un corte, una experiencia.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: duration.medium, ease: ease.out, delay: reduce ? 0 : 1.7 }}
        className="absolute bottom-8 flex flex-col items-center gap-3 sm:bottom-10"
      >
        <span className="font-sans text-caption uppercase tracking-[0.3em] text-dresde-mute">
          Scroll
        </span>
        <span
          aria-hidden="true"
          className="relative h-10 w-px overflow-hidden bg-dresde-line"
        >
          {!reduce && (
            <motion.span
              className="absolute left-0 top-0 h-4 w-px bg-dresde-brass"
              animate={{ transform: ["translateY(-16px)", "translateY(40px)"] }}
              transition={{ duration: 1.6, ease: "linear", repeat: Infinity }}
            />
          )}
        </span>
      </motion.div>
    </section>
  );
}
