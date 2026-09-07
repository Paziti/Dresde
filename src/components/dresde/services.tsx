import type { Location } from "@/lib/types";
import { currency } from "@/lib/locations";
import { whatsappBookingUrl } from "@/lib/whatsapp";

export function Services({ location }: { location: Location }) {
  return (
    <ul className="flex flex-col divide-y divide-dresde-line border-y border-dresde-line">
      {location.services.map((service) => (
        <li key={service.id}>
          <a
            href={whatsappBookingUrl(location, service.name)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 py-4 transition-colors duration-(--duration-fast) ease"
          >
            <span className="flex min-w-0 flex-col break-words">
              <span className="font-display text-lg font-extrabold uppercase text-dresde-paper transition-colors duration-(--duration-fast) ease group-hover:text-dresde-brass">
                {service.name}
              </span>
              <span className="font-sans text-caption uppercase tracking-[0.12em] text-dresde-mute">
                {service.duration}
              </span>
            </span>
            <span className="shrink-0 font-sans text-heading [font-variant-numeric:tabular-nums] text-dresde-paper-dim">
              {currency.format(service.price)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
