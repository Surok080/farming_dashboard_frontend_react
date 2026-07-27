import { useEffect } from "react";

/** < 1600px → zoom 0.9; < 1300px → zoom 0.8 (см. index.css). */
export const COMPACT_VIEWPORT_MQ_LIST = [
  "(max-width: 1599px)",
  "(max-width: 1299px)",
];

/**
 * После включения/выключения CSS zoom уведомляет layout и Leaflet (invalidateSize через resize).
 */
export function useCompactViewportZoom() {
  useEffect(() => {
    const medias = COMPACT_VIEWPORT_MQ_LIST.map((query) => window.matchMedia(query));

    const notifyLayout = () => {
      window.requestAnimationFrame(() => {
        window.dispatchEvent(new Event("resize"));
      });
    };

    notifyLayout();
    medias.forEach((media) => media.addEventListener("change", notifyLayout));
    return () => {
      medias.forEach((media) => media.removeEventListener("change", notifyLayout));
    };
  }, []);
}
