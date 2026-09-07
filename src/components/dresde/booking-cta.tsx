import type { Location } from "@/lib/types";
import { whatsappBookingUrl } from "@/lib/whatsapp";

/**
 * Real channel (Dresde books via WhatsApp today), placeholder number.
 * Deliberately secondary to the photography and the brand, per brief §15.
 */
export function BookingCTA({ location }: { location: Location }) {
  return (
    <a
      href={whatsappBookingUrl(location)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex w-full items-center justify-center gap-2 border border-dresde-paper bg-dresde-paper px-6 py-4 font-sans text-label uppercase tracking-[0.14em] text-black transition-colors duration-(--duration-fast) ease hover:bg-dresde-brass hover:border-dresde-brass sm:w-auto"
    >
      Reservar por WhatsApp
    </a>
  );
}
