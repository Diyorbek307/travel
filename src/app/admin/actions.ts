"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, checkPassword, isAuthenticated, makeToken } from "@/lib/admin-auth";
import { mediaDir } from "@/lib/paths.js";
import {
  deleteExhibit,
  deletePoi,
  deletePoiAudio,
  deleteQr,
  deleteTour,
  ensureMuseum,
  setPoiActive,
  setPoiAudio,
  updateReservationStatus,
  upsertCity,
  upsertExhibit,
  upsertPoi,
  upsertQr,
  upsertTour,
} from "@/lib/admin-db";
import { LANGS, type Category, type Lang, type OpeningHours, type Theme } from "@/lib/types";

export interface ActionResult {
  ok: boolean;
  message: string;
}

/** Каждое изменяющее действие проверяет сессию само: слой не доверяет вызывающему. */
async function requireAuth(): Promise<void> {
  if (!(await isAuthenticated())) throw new Error("Требуется вход в админ-панель");
}

/* ------------------------------------------------------------------ */
/* Вход                                                               */
/* ------------------------------------------------------------------ */

export async function login(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { ok: false, message: "Неверный пароль" };
  }
  const store = await cookies();
  store.set(ADMIN_COOKIE, makeToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
    secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/admin");
  return { ok: true, message: "Вход выполнен" };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  revalidatePath("/admin");
}

/* ------------------------------------------------------------------ */
/* Разбор форм                                                        */
/* ------------------------------------------------------------------ */

function num(formData: FormData, key: string, fallback = 0): number {
  const value = Number(formData.get(key));
  return Number.isFinite(value) ? value : fallback;
}

function str(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Часы работы приходят из формы как одна пара «открытие — закрытие»
 * плюс отметки выходных дней. Этого достаточно для подавляющего большинства
 * объектов; сложные расписания редактируются позже прямо в JSON.
 */
function parseHours(formData: FormData): OpeningHours | null {
  if (str(formData, "always_open") === "on") return null;
  const open = str(formData, "open") || "09:00";
  const close = str(formData, "close") || "18:00";
  const closedDays = formData.getAll("closed_days").map(String);

  const hours: OpeningHours = {};
  for (let d = 0; d < 7; d++) {
    hours[String(d)] = closedDays.includes(String(d)) ? null : { open, close };
  }
  return hours;
}

function parseTranslations(formData: FormData) {
  const translations: Partial<Record<Lang, { name: string; shortDesc: string; fullStory: string }>> = {};
  for (const lang of LANGS) {
    const name = str(formData, `name_${lang}`);
    if (!name) continue;
    translations[lang] = {
      name,
      shortDesc: str(formData, `short_${lang}`),
      fullStory: str(formData, `story_${lang}`),
    };
  }
  return translations;
}

/* ------------------------------------------------------------------ */
/* Города                                                             */
/* ------------------------------------------------------------------ */

export async function saveCity(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();
  const slug = str(formData, "slug");
  if (!/^[a-z0-9-]{2,40}$/.test(slug)) {
    return { ok: false, message: "Идентификатор: латиница, цифры и дефис, 2–40 символов" };
  }

  const translations: Partial<Record<Lang, { name: string; description: string }>> = {};
  for (const lang of LANGS) {
    const name = str(formData, `name_${lang}`);
    if (name) translations[lang] = { name, description: str(formData, `desc_${lang}`) };
  }
  if (!translations.ru && !translations.en) {
    return { ok: false, message: "Нужно название хотя бы на русском или английском" };
  }

  try {
    upsertCity({
      slug,
      lat: num(formData, "lat"),
      lon: num(formData, "lon"),
      zoom: num(formData, "zoom", 13),
      isActive: str(formData, "is_active") === "on",
      translations,
    });
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  revalidatePath("/admin/cities");
  revalidatePath("/");
  return { ok: true, message: `Город «${slug}» сохранён` };
}

/* ------------------------------------------------------------------ */
/* Объекты                                                            */
/* ------------------------------------------------------------------ */

export async function savePoi(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const slug = str(formData, "slug");
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
    return { ok: false, message: "Идентификатор: латиница, цифры и дефис, 2–60 символов" };
  }

  const lat = num(formData, "lat");
  const lon = num(formData, "lon");
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180 || (lat === 0 && lon === 0)) {
    return { ok: false, message: "Проверьте координаты объекта" };
  }

  const translations = parseTranslations(formData);
  if (Object.keys(translations).length === 0) {
    return { ok: false, message: "Нужно название хотя бы на одном языке" };
  }

  try {
    const poiId = upsertPoi({
      slug,
      citySlug: str(formData, "city"),
      category: str(formData, "category") as Category,
      themes: formData.getAll("themes").map(String) as Theme[],
      lat,
      lon,
      priceUzs: Math.max(0, num(formData, "price")),
      openingHours: parseHours(formData),
      avgVisitMin: Math.max(5, num(formData, "visit", 30)),
      rating: Math.min(5, Math.max(0, num(formData, "rating", 4.5))),
      popularity: Math.min(1, Math.max(0, num(formData, "popularity", 0.5))),
      phone: str(formData, "phone") || null,
      website: str(formData, "website") || null,
      isActive: str(formData, "is_active") === "on",
      sponsoredPriority: Math.max(0, num(formData, "sponsored_priority")),
      translations,
    });

    const qrCode = str(formData, "qr_code").toUpperCase();
    if (qrCode) upsertQr(qrCode, "poi", poiId);

    // Музей заводим сразу, чтобы к объекту можно было добавлять экспонаты.
    if (str(formData, "is_museum") === "on") ensureMuseum(poiId);
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  revalidatePath("/admin/pois");
  revalidatePath(`/poi/${slug}`);
  return { ok: true, message: `Объект «${slug}» сохранён` };
}

export async function togglePoi(formData: FormData): Promise<void> {
  await requireAuth();
  setPoiActive(str(formData, "slug"), str(formData, "active") === "1");
  revalidatePath("/admin/pois");
}

export async function removePoi(formData: FormData): Promise<void> {
  await requireAuth();
  deletePoi(str(formData, "slug"));
  revalidatePath("/admin/pois");
}

/* ------------------------------------------------------------------ */
/* Аудиогиды                                                          */
/* ------------------------------------------------------------------ */

const AUDIO_TYPES = ["audio/mpeg", "audio/mp3", "audio/mp4", "audio/x-m4a", "audio/wav"];
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export async function uploadAudio(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();

  const poiId = num(formData, "poi_id");
  const lang = str(formData, "lang") as Lang;
  const file = formData.get("file");

  if (!poiId) return { ok: false, message: "Не выбран объект" };
  if (!(LANGS as readonly string[]).includes(lang)) {
    return { ok: false, message: "Неизвестный язык" };
  }
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: "Выберите аудиофайл" };
  }
  if (file.size > MAX_AUDIO_BYTES) {
    return { ok: false, message: "Файл больше 25 МБ — сожмите запись" };
  }
  if (file.type && !AUDIO_TYPES.includes(file.type)) {
    return { ok: false, message: `Неподдерживаемый формат: ${file.type}. Нужен mp3, m4a или wav.` };
  }

  const slug = str(formData, "poi_slug") || String(poiId);
  const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  const fileName = `${slug}-${lang}.${extension}`;

  // Каталог данных, а не public/: содержимое образа на хостинге эфемерно.
  const dir = path.join(mediaDir(), "audio");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, fileName), Buffer.from(await file.arrayBuffer()));

  setPoiAudio(
    poiId,
    lang,
    `/media/audio/${fileName}`,
    Math.max(0, Math.round(num(formData, "duration"))),
    str(formData, "narrator") || null,
  );

  revalidatePath("/admin/audio");
  revalidatePath(`/poi/${slug}`);
  return { ok: true, message: `Аудиогид загружен: ${fileName}` };
}

export async function removeAudio(formData: FormData): Promise<void> {
  await requireAuth();
  deletePoiAudio(num(formData, "poi_id"), str(formData, "lang") as Lang);
  revalidatePath("/admin/audio");
}

/* ------------------------------------------------------------------ */
/* QR-коды                                                            */
/* ------------------------------------------------------------------ */

export async function saveQr(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();
  const code = str(formData, "code").toUpperCase();
  if (!/^[A-Z0-9-]{3,32}$/.test(code)) {
    return { ok: false, message: "Код: заглавные латинские буквы, цифры и дефис (3–32 символа)" };
  }
  const targetType = str(formData, "target_type") === "exhibit" ? "exhibit" : "poi";
  const targetId = num(formData, "target_id");
  if (!targetId) return { ok: false, message: "Не выбран объект" };

  upsertQr(code, targetType, targetId);
  revalidatePath("/admin/qr");
  return { ok: true, message: `Код ${code} привязан` };
}

export async function removeQr(formData: FormData): Promise<void> {
  await requireAuth();
  deleteQr(str(formData, "code"));
  revalidatePath("/admin/qr");
}

/* ------------------------------------------------------------------ */
/* Маршруты                                                           */
/* ------------------------------------------------------------------ */

export async function saveTour(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  await requireAuth();

  const slug = str(formData, "slug");
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) {
    return { ok: false, message: "Идентификатор: латиница, цифры и дефис" };
  }

  // Остановки приходят строками «slug:минуты» — по одной в строке.
  const stops = str(formData, "stops")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [poiSlug, stay] = line.split(":").map((x) => x.trim());
      return { poiSlug, stayMin: Number(stay) || 30 };
    })
    .filter((s) => s.poiSlug);

  if (stops.length === 0) return { ok: false, message: "Добавьте хотя бы одну остановку" };

  const translations: Partial<Record<Lang, { title: string; description: string }>> = {};
  for (const lang of LANGS) {
    const title = str(formData, `title_${lang}`);
    if (title) translations[lang] = { title, description: str(formData, `desc_${lang}`) };
  }
  if (Object.keys(translations).length === 0) {
    return { ok: false, message: "Нужно название маршрута хотя бы на одном языке" };
  }

  try {
    upsertTour({
      slug,
      citySlug: str(formData, "city"),
      mode: (["walk", "taxi", "car"].includes(str(formData, "mode"))
        ? str(formData, "mode")
        : "walk") as "walk" | "taxi" | "car",
      sort: num(formData, "sort"),
      isActive: str(formData, "is_active") === "on",
      translations,
      stops,
    });
  } catch (error) {
    return { ok: false, message: (error as Error).message };
  }

  revalidatePath("/admin/tours");
  revalidatePath("/routes");
  return { ok: true, message: `Маршрут «${slug}» сохранён (${stops.length} остановок)` };
}

export async function removeTour(formData: FormData): Promise<void> {
  await requireAuth();
  deleteTour(str(formData, "slug"));
  revalidatePath("/admin/tours");
}

/* ------------------------------------------------------------------ */
/* Экспонаты                                                          */
/* ------------------------------------------------------------------ */

export async function saveExhibit(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  await requireAuth();

  const museumId = num(formData, "museum_id");
  const number = str(formData, "number");
  if (!museumId) return { ok: false, message: "Не выбран музей" };
  if (!number) return { ok: false, message: "Укажите номер экспоната — он печатается на табличке" };

  const translations = parseTranslations(formData);
  if (Object.keys(translations).length === 0) {
    return { ok: false, message: "Нужно название хотя бы на одном языке" };
  }

  const exhibitId = upsertExhibit({
    id: num(formData, "id") || undefined,
    museumId,
    number,
    period: str(formData, "period") || null,
    origin: str(formData, "origin") || null,
    sort: num(formData, "sort"),
    translations,
  });

  const qrCode = str(formData, "qr_code").toUpperCase();
  if (qrCode) upsertQr(qrCode, "exhibit", exhibitId);

  revalidatePath("/admin/museums");
  return { ok: true, message: `Экспонат №${number} сохранён` };
}

export async function removeExhibit(formData: FormData): Promise<void> {
  await requireAuth();
  deleteExhibit(num(formData, "id"));
  revalidatePath("/admin/museums");
}

/* ------------------------------------------------------------------ */
/* Заявки на столик                                                   */
/* ------------------------------------------------------------------ */

export async function setReservationStatus(formData: FormData): Promise<void> {
  await requireAuth();
  const status = str(formData, "status");
  if (status !== "confirmed" && status !== "declined" && status !== "new") return;
  updateReservationStatus(num(formData, "id"), status);
  revalidatePath("/admin/reservations");
}
