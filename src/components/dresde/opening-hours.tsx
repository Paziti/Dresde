"use client";

import { useSyncExternalStore } from "react";
import type { Location } from "@/lib/types";

// The visitor's local weekday is external state the server can't know —
// useSyncExternalStore reads it without a setState-in-effect cascade
// (React flags that pattern as a lint error even for legitimate
// client-only reads). No real external event ever fires here, so the
// subscription itself is a no-op; only the two snapshots matter.
const noopSubscribe = () => () => {};
const getClientDay = () => new Date().getDay();
const getServerDay = () => -1;

export function OpeningHours({ location }: { location: Location }) {
  const today = useSyncExternalStore(noopSubscribe, getClientDay, getServerDay);

  return (
    <ul className="flex flex-col divide-y divide-dresde-line border-y border-dresde-line">
      {location.hours.map((entry) => {
        const isToday = today === entry.day;
        return (
          <li
            key={entry.day}
            className={
              "flex items-baseline justify-between py-3 font-sans text-small " +
              (isToday ? "text-dresde-paper" : "text-dresde-paper-dim")
            }
          >
            <span className="uppercase tracking-[0.1em]">
              {entry.label}
              {isToday && (
                <span className="ml-2 text-caption text-dresde-brass" aria-label="Hoy">
                  hoy
                </span>
              )}
            </span>
            <span className="[font-variant-numeric:tabular-nums]">
              {entry.open && entry.close ? `${entry.open} — ${entry.close}` : "Cerrado"}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
