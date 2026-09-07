export type GalleryItem = {
  id: string;
  type: "image" | "video";
  /** Undefined -> rendered as a styled placeholder (see PlaceholderImage). */
  src?: string;
  alt: string;
};

/**
 * g1 and g2 are real photos taken from @dresde.co's Instagram feed. g2 is
 * the cover frame of a reel ("El barbero detallista") — Instagram's own
 * grid shows video posts the same way, a still with a play badge, since
 * every tile here links out to the profile rather than playing in place.
 * The remaining slots are MOCK placeholders until more real posts are
 * chosen; the shape (six slots, mixed image/video) is the real contract.
 */
export const galleryItems: GalleryItem[] = [
  {
    id: "g1",
    type: "image",
    src: "/gallery/aniversario.jpg",
    alt: "Equipo de Dresde festejando su aniversario",
  },
  {
    id: "g2",
    type: "video",
    src: "/gallery/barbero-detallista.jpg",
    alt: "Reel de Instagram: el barbero detallista",
  },
  { id: "g3", type: "image", alt: "Foto de Dresde en Instagram" },
  { id: "g4", type: "image", alt: "Foto de Dresde en Instagram" },
  { id: "g5", type: "video", alt: "Video de Dresde en Instagram" },
  { id: "g6", type: "image", alt: "Foto de Dresde en Instagram" },
];
