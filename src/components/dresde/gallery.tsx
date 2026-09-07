import { Play } from "lucide-react";
import { galleryItems } from "@/lib/gallery";
import { PlaceholderImage } from "./placeholder-image";

const INSTAGRAM_URL = "https://www.instagram.com/dresde.co";

/** Generic outline glyph (square + ring + dot) — the common convention
 * used across most open icon sets, not Meta's actual brand asset.
 * lucide-react dropped brand logos a while back for trademark reasons. */
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A teaser of Dresde's real Instagram feed — photos and reels, mixed.
 * Each tile links to its own post when one is set (see gallery.ts);
 * placeholder tiles without a post yet fall back to the profile root.
 */
export function Gallery() {
  return (
    <section id="galeria" className="w-full px-5 py-16 sm:px-8 sm:py-24">
      <header className="mb-10 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <span className="font-sans text-label uppercase tracking-[0.14em] text-dresde-mute">
            Instagram
          </span>
          {/* A handle reads as a subtitle, not a headline — the same
              text-display-l used for "Elegí tu Dresde" made "@dresde.co"
              (with its @ and . pulling extra visual weight) overwhelm the
              section. A smaller, still-fluid scale of its own instead of
              reusing a named token that doesn't quite fit. */}
          <h2 className="font-display text-[clamp(1.75rem,1.3rem+3.2vw,3rem)] leading-[0.95] tracking-[-0.01em] font-extrabold uppercase text-dresde-paper">
            @dresde.co
          </h2>
        </div>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-fit items-center gap-2 border border-dresde-line-strong px-4 font-sans text-label uppercase tracking-[0.14em] text-dresde-paper transition-colors duration-(--duration-fast) ease hover:border-dresde-brass hover:text-dresde-brass focus-visible:border-dresde-brass"
        >
          <InstagramIcon className="size-4" />
          Ver en Instagram
        </a>
      </header>

      <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
        {galleryItems.map((item) => (
          <li key={item.id} className="relative aspect-square">
            <a
              href={item.href ?? INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={item.alt}
              className="hover-zoom group relative block h-full w-full overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-dresde-brass"
            >
              <span className="hover-zoom-img absolute inset-0 block transition-transform duration-(--duration-slow) ease-out-strong">
                <PlaceholderImage
                  alt={item.alt}
                  src={item.src}
                  label={item.type === "video" ? "Video" : "Foto"}
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
              </span>
              {item.type === "video" && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex size-10 items-center justify-center rounded-full border border-dresde-paper/40 bg-black/40 backdrop-blur-sm">
                    <Play className="size-4 fill-dresde-paper text-dresde-paper" />
                  </span>
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
