import type { Location } from "@/lib/types";
import { PlaceholderImage } from "./placeholder-image";

export function LocationGallery({ location }: { location: Location }) {
  const [main, ...rest] = location.images;

  return (
    // Capped width — full-bleed made the mosaic noticeably larger than the
    // rest of the sucursal detail below it; a smaller block keeps it in
    // proportion with the map/hours grid that follows.
    <div className="grid max-w-2xl grid-cols-1 gap-1 sm:grid-cols-2">
      <div className="relative aspect-[4/3] sm:row-span-2 sm:aspect-auto">
        <PlaceholderImage
          alt={main?.alt ?? location.name}
          src={main?.src}
          label={location.address}
          sizes="(min-width: 640px) 50vw, 100vw"
        />
      </div>
      {rest.slice(0, 2).map((image, i) => (
        <div key={i} className="relative aspect-[16/9]">
          <PlaceholderImage
            alt={image.alt}
            src={image.src}
            label={location.address}
            sizes="(min-width: 640px) 50vw, 100vw"
          />
        </div>
      ))}
    </div>
  );
}
