/**
 * eSIM через Airalo Partner API.
 *
 * Включается двумя переменными: AIRALO_CLIENT_ID и AIRALO_CLIENT_SECRET
 * (выдаются в партнёрском кабинете Airalo). Без них магазин eSIM честно
 * выключен, а в «Полезном» остаётся ссылка на государственную заявку.
 * AIRALO_API_URL — чтобы проверить всё на песочнице Airalo, не тратя денег.
 *
 * Документация: developers.partners.airalo.com —
 *  POST /v2/token   (client_credentials, токен живёт сутки, 3 запроса в минуту)
 *  GET  /v2/packages?filter[country]=UZ
 *  POST /v2/orders  (multipart: package_id, quantity, type, description)
 */

const АДРЕС = () => (process.env.AIRALO_API_URL || "https://partners-api.airalo.com").replace(/\/$/, "");

export const airaloНастроен = () => Boolean(process.env.AIRALO_CLIENT_ID && process.env.AIRALO_CLIENT_SECRET);

let токен: { значение: string; до: number } | null = null;

async function получитьТокен(): Promise<string> {
  // Токен живёт сутки, а просить новый можно лишь 3 раза в минуту — держим
  // его в памяти и обновляем за час до конца.
  if (токен && токен.до > Date.now()) return токен.значение;
  const тело = new URLSearchParams({
    client_id: process.env.AIRALO_CLIENT_ID ?? "",
    client_secret: process.env.AIRALO_CLIENT_SECRET ?? "",
    grant_type: "client_credentials",
  });
  const r = await fetch(`${АДРЕС()}/v2/token`, {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: тело,
  });
  if (!r.ok) throw new Error(`airalo_token_${r.status}`);
  const d = (await r.json()) as { data?: { access_token?: string; expires_in?: number } };
  const значение = d.data?.access_token;
  if (!значение) throw new Error("airalo_token_empty");
  const секунд = Math.min(d.data?.expires_in ?? 86_400, 86_400);
  токен = { значение, до: Date.now() + (секунд - 3600) * 1000 };
  return значение;
}

async function запрос(путь: string, init: RequestInit = {}): Promise<Response> {
  const заголовки = { Accept: "application/json", Authorization: `Bearer ${await получитьТокен()}` };
  const r = await fetch(`${АДРЕС()}${путь}`, { ...init, headers: { ...заголовки, ...(init.headers ?? {}) } });
  // Токен отозвали раньше срока — один раз берём новый.
  if (r.status === 401) {
    токен = null;
    const заново = { Accept: "application/json", Authorization: `Bearer ${await получитьТокен()}` };
    return fetch(`${АДРЕС()}${путь}`, { ...init, headers: { ...заново, ...(init.headers ?? {}) } });
  }
  return r;
}

export interface ПакетEsim {
  id: string;
  /** «1 GB - 7 days» — как у Airalo. */
  title: string;
  /** «1 GB» или «Unlimited». */
  data: string;
  day: number;
  unlimited: boolean;
  /** Рекомендованная розничная цена, $. */
  retailUsd: number;
  /** Наша закупочная цена, $ — только для панели. */
  netUsd: number;
  operator: string;
  voice: number | null;
  text: number | null;
}

interface СырьёПакета {
  id: string;
  type?: string;
  price?: number;
  net_price?: number;
  day?: number;
  is_unlimited?: boolean;
  title?: string;
  data?: string;
  voice?: number | null;
  text?: number | null;
  prices?: { recommended_retail_price?: { USD?: number }; net_price?: { USD?: number } };
}

/** Ответ /v2/packages → плоский список пакетов для страны (без пополнений). */
export function разобратьПакеты(ответ: unknown): ПакетEsim[] {
  const страны = (ответ as { data?: unknown[] })?.data;
  if (!Array.isArray(страны)) return [];
  const итог: ПакетEsim[] = [];
  for (const с of страны as { operators?: { title?: string; packages?: СырьёПакета[] }[] }[]) {
    for (const о of с.operators ?? []) {
      for (const п of о.packages ?? []) {
        if (!п?.id || (п.type && п.type !== "sim")) continue;
        const retail = п.prices?.recommended_retail_price?.USD ?? п.price;
        const net = п.prices?.net_price?.USD ?? п.net_price;
        if (typeof retail !== "number" || typeof net !== "number") continue;
        итог.push({
          id: п.id,
          title: п.title ?? п.id,
          data: п.data ?? "",
          day: п.day ?? 0,
          unlimited: Boolean(п.is_unlimited),
          retailUsd: retail,
          netUsd: net,
          operator: о.title ?? "",
          voice: п.voice ?? null,
          text: п.text ?? null,
        });
      }
    }
  }
  return итог.sort((a, b) => a.retailUsd - b.retailUsd);
}

let кэшПакетов: { до: number; пакеты: ПакетEsim[] } | null = null;

/** Пакеты для Узбекистана. Airalo просит обновлять раз в час — так и кэшируем. */
export async function пакетыУзбекистана(): Promise<ПакетEsim[]> {
  if (кэшПакетов && кэшПакетов.до > Date.now()) return кэшПакетов.пакеты;
  const r = await запрос("/v2/packages?filter[type]=local&filter[country]=UZ&limit=100");
  if (!r.ok) throw new Error(`airalo_packages_${r.status}`);
  const пакеты = разобратьПакеты(await r.json());
  кэшПакетов = { до: Date.now() + 60 * 60 * 1000, пакеты };
  return пакеты;
}

export interface ВыданнаяEsim {
  iccid: string;
  lpa: string;
  matchingId: string;
  /** Строка для QR: LPA:1$<lpa>$<matching_id>. */
  qrcode: string;
  qrcodeUrl: string;
  appleUrl: string | null;
  apn: string | null;
  airaloOrderId: number | null;
  инструкция: string | null;
}

/** Заказ одной eSIM. Деньги Airalo спишет с партнёрского баланса. */
export async function заказатьEsim(packageId: string, описание: string): Promise<ВыданнаяEsim> {
  const форма = new FormData();
  форма.set("package_id", packageId);
  форма.set("quantity", "1");
  форма.set("type", "sim");
  форма.set("description", описание.slice(0, 200));
  const r = await запрос("/v2/orders", { method: "POST", body: форма });
  if (!r.ok) throw new Error(`airalo_order_${r.status}: ${(await r.text()).slice(0, 300)}`);
  const d = (await r.json()) as {
    data?: {
      id?: number;
      manual_installation?: string;
      sims?: {
        iccid?: string;
        lpa?: string;
        matching_id?: string;
        qrcode?: string;
        qrcode_url?: string;
        direct_apple_installation_url?: string;
        apn_value?: string | null;
      }[];
    };
  };
  const sim = d.data?.sims?.[0];
  if (!sim?.iccid || !sim.qrcode) throw new Error("airalo_order_no_sim");
  return {
    iccid: sim.iccid,
    lpa: sim.lpa ?? "",
    matchingId: sim.matching_id ?? "",
    qrcode: sim.qrcode,
    qrcodeUrl: sim.qrcode_url ?? "",
    appleUrl: sim.direct_apple_installation_url ?? null,
    apn: sim.apn_value ?? null,
    airaloOrderId: d.data?.id ?? null,
    инструкция: d.data?.manual_installation ?? null,
  };
}
