import type { Location } from "@/lib/types";
import { LocationGallery } from "./location-gallery";
import { LocationMap } from "./location-map";
import { OpeningHours } from "./opening-hours";
import { Services } from "./services";
import { Barbers } from "./barbers";
import { BookingCTA } from "./booking-cta";

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h4
      id={id}
      className="mb-4 font-sans text-label uppercase tracking-[0.14em] text-dresde-mute"
    >
      {children}
    </h4>
  );
}

export function LocationDetail({ location }: { location: Location }) {
  return (
    <div className="flex flex-col gap-16 py-16 sm:gap-24 sm:py-24">
      <header className="flex flex-col gap-3">
        <span className="font-sans text-label uppercase tracking-[0.14em] text-dresde-brass">
          {location.address}
        </span>
        {/* h3: nested under the "Elegí tu Dresde" h2 above it in the page.
            break-words matters here specifically: names like "Washington"
            and "Salliqueló" are single words with nowhere to wrap, and at
            this font size they were wider than a phone screen — with
            nothing to break on, the text overflowed the page itself and
            mobile browsers respond by zooming out, which read as "the
            page shrinks and I can scroll sideways". Shorter names, and
            "Don Bosco" (a real space to wrap at), never hit this. */}
        <h3 className="break-words font-display text-display-l tracking-[-0.015em] font-extrabold uppercase text-dresde-paper">
          {location.name}
        </h3>
        <p className="font-sans text-small text-dresde-paper-dim">{location.city}</p>
        <div className="mt-4">
          <BookingCTA location={location} />
        </div>
      </header>

      <LocationGallery location={location} />

      <div className="grid grid-cols-1 gap-16 sm:grid-cols-2 sm:gap-8">
        <section aria-labelledby={`mapa-${location.id}`}>
          <SectionHeading id={`mapa-${location.id}`}>Mapa</SectionHeading>
          <LocationMap location={location} />
        </section>

        <section aria-labelledby={`horarios-${location.id}`}>
          <SectionHeading id={`horarios-${location.id}`}>Horarios</SectionHeading>
          <OpeningHours location={location} />
        </section>
      </div>

      <section aria-labelledby={`servicios-${location.id}`}>
        <SectionHeading id={`servicios-${location.id}`}>Servicios</SectionHeading>
        <Services location={location} />
      </section>

      <section aria-labelledby={`barberos-${location.id}`}>
        <SectionHeading id={`barberos-${location.id}`}>Barberos</SectionHeading>
        <Barbers location={location} />
      </section>
    </div>
  );
}
