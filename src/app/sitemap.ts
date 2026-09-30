import type { MetadataRoute } from "next";
import { readContent } from "@/lib/store";
import { LOCALES } from "@/lib/i18n";
import { адресСтраницы, всеСтраницы, САЙТ } from "@/lib/seo";

export const revalidate = 3600;

/** Карта сайта: главная и страница каждой записи на всех языках. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const c = await readContent();
  return [
    { url: САЙТ, changeFrequency: "weekly", priority: 1 },
    ...всеСтраницы(c).map(({ вид, id }) => ({
      url: `${САЙТ}${адресСтраницы(вид, id)}`,
      changeFrequency: "weekly" as const,
      priority: вид === "place" ? 0.8 : 0.6,
      alternates: {
        languages: Object.fromEntries(LOCALES.map((l) => [l, `${САЙТ}${адресСтраницы(вид, id, l)}`])),
      },
    })),
  ];
}
