import { NextResponse } from "next/server";
import { getCity, listPois, listTours } from "@/lib/db";
import { langFromParam } from "@/lib/server-lang";

export const dynamic = "force-dynamic";

/**
 * Пакет города для офлайн-режима (п. 11 ТЗ).
 *
 * Возвращает и сами данные, и список URL, которые Service Worker должен
 * положить в кэш. Так страница «Скачать город» не знает деталей кэширования,
 * а воркер — деталей предметной области.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ city: string }> },
) {
  const { city } = await params;
  const lang = langFromParam(new URL(request.url).searchParams.get("lang"));

  const cityRow = getCity(city, lang);
  if (!cityRow) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const pois = listPois({ city, lang });
  const tours = listTours(lang, city);

  const urls = [
    `/api/offline/${city}?lang=${lang}`,
    `/api/pois?city=${city}&lang=${lang}`,
    `/api/tours?city=${city}&lang=${lang}`,
    `/city/${city}`,
    ...pois.map((p) => `/poi/${p.slug}`),
    ...tours.map((t) => `/routes/${t.slug}`),
    ...pois.filter((p) => p.audio_url).map((p) => p.audio_url as string),
    ...pois.filter((p) => p.cover).map((p) => p.cover as string),
  ];

  return NextResponse.json({
    city: cityRow,
    pois,
    tours,
    urls,
    /** Оценка объёма: аудио и фото пока не загружены, поэтому пакет лёгкий. */
    estimatedBytes: JSON.stringify({ cityRow, pois, tours }).length,
  });
}
