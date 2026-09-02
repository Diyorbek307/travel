import type { Geo } from "@/lib/types";

/**
 * Яндекс Go.
 *
 * Две разные вещи, и важно их не путать.
 *
 * Заказ работает уже сейчас и никакого договора не требует: мы открываем
 * приложение Яндекс Go со вписанным маршрутом, а цену человек видит там
 * же и подтверждает поездку сам. Так делают все, кто встраивает такси, и
 * это честно: деньги берёт Яндекс, ответственность за поездку тоже на
 * нём.
 *
 * Оценка стоимости внутри нашего экрана — совсем другое. Она требует
 * партнёрского доступа к API taxi-routeinfo: Яндекс выдаёт clid и apikey
 * по соглашению. Пока их нет, цену не показываем и не выдумываем —
 * пишем, что она будет в приложении такси.
 *
 * Партнёрская метка ref добавляется к ссылке, когда задана: по ней
 * Яндекс считает приведённые поездки.
 */

const CLID = process.env.YANDEX_TAXI_CLID;
const APIKEY = process.env.YANDEX_TAXI_APIKEY;
const REF = process.env.NEXT_PUBLIC_YANDEX_TAXI_REF;

export function ценаДоступна(): boolean {
  return Boolean(CLID && APIKEY);
}

/**
 * Ссылка на заказ.
 *
 * Универсальный адрес redirect.appmetrica: на телефоне он открывает
 * установленное приложение, а если его нет — ведёт в магазин. Схема
 * yandextaxi:// сама по себе на компьютере просто не сработала бы.
 */
export function ссылкаНаЗаказ(откуда: Geo | null, куда: Geo, подпись?: string): string {
  const п = new URLSearchParams();
  if (откуда) {
    п.set("start-lat", откуда.lat.toFixed(6));
    п.set("start-lon", откуда.lon.toFixed(6));
  }
  п.set("end-lat", куда.lat.toFixed(6));
  п.set("end-lon", куда.lon.toFixed(6));
  if (подпись) п.set("end-name", подпись);
  if (REF) п.set("ref", REF);
  // Тариф не навязываем: пусть человек выберет сам в приложении.
  return `https://3.redirect.appmetrica.yandex.com/route?${п.toString()}`;
}

export interface Оценка {
  /** Сколько стоит поездка в валюте ответа. */
  цена: number;
  валюта: string;
  тариф: string;
  /** Сколько ехать, в минутах. */
  минут: number | null;
}

/**
 * Оценка стоимости через партнёрский API.
 *
 * Возвращает null, когда доступа нет или Яндекс не ответил: цена —
 * не то, что можно показать «примерно». Лучше честное «узнаете в
 * приложении», чем цифра, взятая неизвестно откуда.
 */
export async function оценить(откуда: Geo, куда: Geo): Promise<Оценка[] | null> {
  if (!ценаДоступна()) return null;

  const url =
    `https://taxi-routeinfo.taxi.yandex.net/taxi_info` +
    `?clid=${encodeURIComponent(CLID!)}` +
    `&rll=${откуда.lon},${откуда.lat}~${куда.lon},${куда.lat}` +
    `&class=econom,business`;

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${APIKEY}` },
      // Экран не должен ждать чужой сервис дольше нескольких секунд.
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;

    const d = (await res.json()) as {
      currency?: string;
      options?: { price?: number; class_name?: string; class_text?: string; waiting_time?: number }[];
      time?: number;
    };

    const минут = typeof d.time === "number" ? Math.round(d.time / 60) : null;
    return (d.options ?? [])
      .filter((o) => typeof o.price === "number")
      .map((o) => ({
        цена: Math.round(o.price!),
        валюта: d.currency ?? "UZS",
        тариф: o.class_text ?? o.class_name ?? "Тариф",
        минут,
      }));
  } catch {
    return null;
  }
}
