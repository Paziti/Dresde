export type GalleryItem = {
  id: string;
  type: "image" | "video";
  /** Undefined -> rendered as a styled placeholder (see PlaceholderImage). */
  src?: string;
  alt: string;
};

/**
 * MOCK DATA — placeholder content. Dresde's real photos and reels live on
 * @dresde.co's Instagram; once specific ones are chosen for the site,
 * swap them in here (add `src`, and for video a real <video> source).
 * The shape is the real contract — six slots, mixed image/video, is just
 * a starting count.
 */
export const galleryItems: GalleryItem[] = [
  { id: "g1", type: "image", alt: "Foto de Dresde en Instagram" },
  { id: "g2", type: "video", alt: "Video de Dresde en Instagram" },
  { id: "g3", type: "image", alt: "Foto de Dresde en Instagram" },
  { id: "g4", type: "image", alt: "Foto de Dresde en Instagram" },
  { id: "g5", type: "video", alt: "Video de Dresde en Instagram" },
  { id: "g6", type: "image", alt: "Foto de Dresde en Instagram" },
];
