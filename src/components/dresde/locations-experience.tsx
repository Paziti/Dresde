"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { locations } from "@/lib/locations";
import { useSelection } from "@/lib/selection-context";
import { LocationsGrid } from "./locations-grid";
import { LocationNavigation } from "./location-navigation";
import { LocationDetail } from "./location-detail";
import { ease, duration } from "@/lib/motion";

const isValidId = (id: string) => locations.some((l) => l.id === id);

/**
 * Orchestrates the core flow the brief names in §8:
 * LOCALES → ELIGE LOCAL → DESCUBRE → INFORMACIÓN → RESERVA.
 *
 * Selecting a local doesn't navigate away — it reveals the detail in place
 * and scrolls to it, so switching locals never means losing your place
 * (brief §12/§14). The selection is also mirrored to the URL hash so a
 * chosen local is shareable and survives a refresh or the back button.
 */
export function LocationsExperience() {
  const { selectedId, setSelectedId } = useSelection();
  const reduce = useReducedMotion();
  const detailRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  // Restore selection from the URL hash on load (#dresde-01, etc.) — this
  // runs once on mount, client-side only, so it never fights hydration.
  //
  // The browser's own scroll restoration was fighting this: no element on
  // the page actually has an id matching the hash (it's bookkeeping, not
  // a real anchor), so a plain visit landed wherever the browser's
  // back/forward cache happened to remember from a previous visit to the
  // same URL — reported as "sometimes at the top, sometimes a bit lower".
  // Taking manual control and forcing (0, 0) for a plain link makes every
  // fresh visit start from the same place regardless of that history.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    const hash = window.location.hash.replace("#dresde-", "");
    if (isValidId(hash)) {
      setSelectedId(hash);
    } else {
      window.scrollTo(0, 0);
    }
    // setSelectedId is a useState setter (via context) — stable across
    // renders, so listing it here doesn't cause extra runs; it only
    // satisfies exhaustive-deps.
  }, [setSelectedId]);

  const selected = locations.find((l) => l.id === selectedId) ?? null;

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    const url = selected ? `#dresde-${selected.id}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }, [selected]);

  function handleSelect(id: string) {
    // The very first selection also flips the grid above this section from
    // its full height to its shrunk one (see LocationsGrid) — an animated
    // `transition-[height]`, not instant. Scrolling on the next frame, as
    // before, measured the target's position while that shrink was still
    // mid-flight: by the time it finished, everything below had moved up,
    // leaving the scroll resting well past where it should (reported on
    // mobile as landing on the second of three gallery photos instead of
    // the location header). Switching between two already-selected locals
    // doesn't touch that height, so it doesn't need the wait.
    const gridIsShrinking = selectedId === null;
    setSelectedId(id);

    const scrollToDetail = () => {
      const el = detailRef.current;
      if (!el) return;
      // A fixed `scroll-mt` fought the sticky site header: that header's
      // real height isn't constant (it wraps differently at some widths),
      // so a hardcoded offset landed right for one viewport and wrong for
      // another. Reading the header's actual height at scroll time and
      // computing the target ourselves is correct regardless of viewport —
      // this lands the nav exactly where the fixed header ends, with no
      // dead gap and no guesswork.
      const fixedHeader = document.querySelector("header");
      const headerHeight = fixedHeader?.getBoundingClientRect().height ?? 0;
      const targetY = el.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({ top: targetY, behavior: reduce ? "auto" : "smooth" });
    };

    if (gridIsShrinking && !reduce) {
      setTimeout(scrollToDetail, duration.medium * 1000 + 30);
    } else {
      requestAnimationFrame(scrollToDetail);
    }
  }

  return (
    <section id="locales" className="relative w-full px-5 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 flex flex-col gap-2 sm:mb-14">
        <span className="font-sans text-label uppercase tracking-[0.14em] text-dresde-mute">
          Nuestros locales
        </span>
        <h2 className="font-display text-display-l tracking-[-0.015em] font-extrabold uppercase text-dresde-paper">
          Elegí tu Dresde
        </h2>
      </header>

      <LocationsGrid locations={locations} selectedId={selectedId} onSelect={handleSelect} />

      {/* Announces the selection change for screen-reader users — the
          visual reveal + scroll already carries this for sighted users. */}
      <p role="status" className="sr-only">
        {selected ? `Mostrando ${selected.name}, ${selected.address}` : ""}
      </p>

      {/*
       * No AnimatePresence here: its exit-tracking turned out unreliable
       * in this framer-motion version — verified against a production
       * build, not just dev/Strict Mode noise. Exiting content would
       * sometimes never unmount (stuck mid-fade forever) or, worse,
       * neither the outgoing nor incoming panel would animate at all when
       * swapping between two already-selected locals, leaving the old
       * content on screen. Dropping the exit animation and keying the
       * panel by `selected.id` sidesteps it entirely: React unmounts the
       * old panel and mounts the new one in the same commit (no broken
       * exit phase to get stuck in), and Motion still runs the panel's
       * own initial→animate reveal on every mount.
       */}
      <div ref={detailRef}>
        {selected ? (
          <motion.div
            key={selected.id}
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, clipPath: "inset(8% 8% 8% 8% round 2px)" }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, clipPath: "inset(0% 0% 0% 0% round 2px)" }
            }
            transition={{ duration: reduce ? duration.fast : duration.slow, ease: ease.out }}
          >
            <LocationNavigation
              locations={locations}
              selectedId={selected.id}
              onSelect={handleSelect}
            />
            <LocationDetail location={selected} />
          </motion.div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: duration.medium, ease: ease.out }}
            className="mt-16 max-w-[42ch] font-sans text-small text-dresde-mute"
          >
            Elegí un local para ver dirección, horarios, servicios y el equipo.
          </motion.p>
        )}
      </div>
    </section>
  );
}
