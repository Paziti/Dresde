"use client";

import { motion } from "framer-motion";
import type { Location } from "@/lib/types";
import { ease, duration } from "@/lib/motion";

type LocationNavigationProps = {
  locations: Location[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/**
 * Lets the user switch locals without scrolling back up to the grid
 * (brief §14). Sticky under the site header, horizontally scrollable on
 * mobile so it works by touch without wrapping or overflowing the page.
 *
 * The active indicator lives in normal flow (a permanent 2px strip under
 * each label, colored only when active) rather than as an absolutely
 * positioned element below the button — `overflow-x-auto` here also
 * computes `overflow-y: auto` per the CSS spec, which silently clipped an
 * earlier version that hung the indicator outside the button's box.
 */
export function LocationNavigation({ locations, selectedId, onSelect }: LocationNavigationProps) {
  return (
    <nav
      aria-label="Elegir local"
      className="sticky top-[77px] z-40 -mx-5 flex gap-6 overflow-x-auto border-b border-dresde-line bg-dresde-black/95 px-5 backdrop-blur-sm sm:-mx-8 sm:px-8"
    >
      {locations.map((location) => {
        const active = location.id === selectedId;
        return (
          <button
            key={location.id}
            type="button"
            onClick={() => onSelect(location.id)}
            aria-current={active ? "true" : undefined}
            className="group relative flex shrink-0 flex-col items-center whitespace-nowrap pt-5 font-sans text-label uppercase tracking-[0.14em] text-dresde-mute transition-colors duration-(--duration-fast) ease hover:text-dresde-paper focus-visible:text-dresde-paper"
          >
            {/* pt-5 + pb-4 keeps the tap target at ~48px tall (was ~41px,
                under the 44px touch-target minimum). */}
            <span className={active ? "pb-4 text-dresde-paper" : "pb-4"}>{location.address}</span>
            <span className="relative h-px w-full">
              {active && (
                <motion.span
                  layoutId="location-nav-indicator"
                  transition={{ duration: duration.medium, ease: ease.inOut }}
                  className="absolute inset-0 bg-dresde-brass"
                />
              )}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
