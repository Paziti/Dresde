import type { Location } from "@/lib/types";
import { PlaceholderImage } from "./placeholder-image";

export function LocationGallery({ location }: { location: Location }) {
  const [main, ...rest] = location.images;

  return (
    // Full width, three across — the previous 1-large + 2-stacked mosaic
    // made the main photo as tall as the whole block; three equal, shorter
    // tiles fill the same width with each individual photo smaller.
    <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
      <div className="relative aspect-[4/3]">
        <PlaceholderImage
          alt={main?.alt ?? location.name}
          src={main?.src}
          label={location.address}
          sizes="(min-width: 640px) 33vw, 100vw"
        />
      </div>
      {rest.slice(0, 2).map((image, i) => (
        <div key={i} className="relative aspect-[4/3]">
          <PlaceholderImage
            alt={image.alt}
            src={image.src}
            label={location.address}
            sizes="(min-width: 640px) 33vw, 100vw"
          />
        </div>
      ))}
    </div>
  );
}
