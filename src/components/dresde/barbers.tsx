import type { Location } from "@/lib/types";
import { PlaceholderImage } from "./placeholder-image";

export function Barbers({ location }: { location: Location }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {location.barbers.map((barber) => (
        <li key={barber.id} className="flex flex-col gap-3">
          <div className="relative aspect-[3/4] w-full overflow-hidden">
            <PlaceholderImage
              alt={barber.name}
              src={barber.image}
              label={barber.name.split(" ")[0]}
              sizes="(min-width: 640px) 33vw, 50vw"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-sans text-small font-semibold text-dresde-paper">{barber.name}</span>
            <span className="font-sans text-caption uppercase tracking-[0.1em] text-dresde-mute">
              {barber.role}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
