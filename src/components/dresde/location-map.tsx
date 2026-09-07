import type { Location } from "@/lib/types";
import { directionsUrl, mapEmbedUrl } from "@/lib/whatsapp";

export function LocationMap({ location }: { location: Location }) {
  return (
    <div className="flex flex-col gap-4">
      {/* No CSS filter on the iframe: filtering a live Google Maps embed
          forces continuous expensive repaints and alters Google's map
          branding, which its embed terms don't allow. Framed with a plain
          border instead so it still sits quietly in the black layout. */}
      <div className="relative aspect-[16/10] w-full overflow-hidden border border-dresde-line">
        <iframe
          src={mapEmbedUrl(location)}
          title={`Mapa de ${location.name} — ${location.address}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-full w-full border-0"
        />
      </div>

      {/* Accessible alternative — never depend on the map alone to convey
          the address (brief §13). */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <address className="not-italic font-sans text-small text-dresde-paper-dim">
          {location.address}
          <br />
          {location.city}
        </address>
        <a
          href={directionsUrl(location)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center border border-dresde-line-strong px-4 font-sans text-label uppercase tracking-[0.14em] text-dresde-paper transition-colors duration-(--duration-fast) ease hover:border-dresde-brass hover:text-dresde-brass"
        >
          Cómo llegar
        </a>
      </div>
    </div>
  );
}
