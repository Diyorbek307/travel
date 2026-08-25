import Image from "next/image";
import Icon from "./icon";
import type { Poi } from "@/lib/types";

/**
 * Снимок объекта — или орнамент, если снимка нет.
 *
 * Фотографии есть у 54 объектов из 108: остальное — базары, мастерские и
 * парки, которых нет на Викискладе. Подставлять им чужой кадр нельзя, поэтому
 * они получают восьмиконечную звезду — мотив исламской геометрии. Он читается
 * как оформление, а не как не загрузившаяся картинка.
 *
 * Next сам отдаёт webp нужного размера, поэтому в репозитории лежат
 * обычные jpeg, а на устройство приезжает ровно то, что помещается в макет.
 */
export default function PoiPhoto({
  poi,
  sizes,
  priority = false,
  className = "",
}: {
  poi: Poi;
  /** Ширина места под снимок — от неё Next считает, какой файл отдать. */
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!poi.cover) {
    return (
      <div
        className={`photo-placeholder grid h-full w-full place-items-center ${className}`}
        style={{ color: "var(--primary-text)" }}
        aria-hidden
      >
        <Icon name={poi.category} size={28} />
      </div>
    );
  }

  return (
    <Image
      src={poi.cover}
      alt={poi.name}
      fill
      sizes={sizes}
      priority={priority}
      className={`object-cover ${className}`}
    />
  );
}
