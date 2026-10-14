import { createHmac, createPrivateKey, randomBytes, sign as подписать, timingSafeEqual } from "crypto";

/**
 * Вход через Google и Apple.
 *
 * Обычный OAuth code flow на сервере: кнопка ведёт на /start, тот кладёт
 * в куку случайные state и nonce и отправляет к провайдеру; провайдер
 * возвращает на /callback с кодом, сервер меняет код на id_token прямо у
 * провайдера по TLS. Поэтому подпись id_token отдельно не проверяем —
 * его выдал сам токен-эндпоинт, а не браузер (так разрешает документация
 * Google и Apple). Проверяем издателя, получателя, срок и nonce.
 *
 * Ключи — переменные окружения. Не заданы — кнопка просто не появляется.
 */

export type Провайдер = "google" | "apple";

export function настроен(п: Провайдер): boolean {
  const e = process.env;
  if (п === "google") return Boolean(e.GOOGLE_CLIENT_ID && e.GOOGLE_CLIENT_SECRET);
  return Boolean(e.APPLE_CLIENT_ID && e.APPLE_TEAM_ID && e.APPLE_KEY_ID && e.APPLE_PRIVATE_KEY);
}

export function способыВхода(): { google: boolean; apple: boolean } {
  return { google: настроен("google"), apple: настроен("apple") };
}

/** Внешний адрес сайта: за прокси Render request.url бывает внутренним. */
export function адресСайта(запрос: Request): string {
  const задан = process.env.APP_BASE_URL || process.env.RENDER_EXTERNAL_URL;
  return (задан || new URL(запрос.url).origin).replace(/\/$/, "");
}

export const обратныйАдрес = (сайт: string, п: Провайдер) => `${сайт}/api/auth/oauth/${п}/callback`;

/* ------------------------------------------------------------------ */
/* Состояние между /start и /callback                                 */
/* ------------------------------------------------------------------ */

export const КУКА_СОСТОЯНИЯ = "uz_oauth";

export interface Состояние {
  state: string;
  nonce: string;
  провайдер: Провайдер;
  /** Куда вернуть после входа: только путь этого сайта. */
  дальше: string;
  /** Вход начат из приложения — вернуть через hellouz://. */
  приложение: boolean;
  до: number;
}

function ключ(): string {
  const к = process.env.SESSION_SECRET ?? process.env.ADMIN_SECRET;
  if (!к && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET is required");
  return к ?? "uz-session-dev-secret";
}

function подпись(данные: string): string {
  return createHmac("sha256", ключ()).update(`oauth:${данные}`).digest("base64url");
}

function верна(данные: string, sig: string): boolean {
  const ждём = Buffer.from(подпись(данные));
  const есть = Buffer.from(sig);
  return ждём.length === есть.length && timingSafeEqual(ждём, есть);
}

export function безопасныйПуть(x: unknown): string {
  return typeof x === "string" && x.startsWith("/") && !x.startsWith("//") && !x.includes("\\")
    ? x.slice(0, 300)
    : "/";
}

export function новоеСостояние(провайдер: Провайдер, дальше: string, приложение: boolean): Состояние {
  return {
    state: randomBytes(16).toString("base64url"),
    nonce: randomBytes(16).toString("base64url"),
    провайдер,
    дальше: безопасныйПуть(дальше),
    приложение,
    до: Date.now() + 10 * 60_000,
  };
}

export function упаковать(с: Состояние): string {
  const данные = Buffer.from(JSON.stringify(с)).toString("base64url");
  return `${данные}.${подпись(данные)}`;
}

export function распаковать(кука: string | undefined): Состояние | null {
  if (!кука) return null;
  const [данные, sig] = кука.split(".");
  if (!данные || !sig || !верна(данные, sig)) return null;
  try {
    const с = JSON.parse(Buffer.from(данные, "base64url").toString()) as Состояние;
    return с.до > Date.now() ? с : null;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ */
/* Провайдеры                                                         */
/* ------------------------------------------------------------------ */

export function адресВхода(с: Состояние, сайт: string): string {
  const redirect_uri = обратныйАдрес(сайт, с.провайдер);
  if (с.провайдер === "google") {
    return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri,
      response_type: "code",
      scope: "openid email profile",
      state: с.state,
      nonce: с.nonce,
      prompt: "select_account",
    })}`;
  }
  // Apple присылает имя и почту только POST-формой (form_post).
  return `https://appleid.apple.com/auth/authorize?${new URLSearchParams({
    client_id: process.env.APPLE_CLIENT_ID!,
    redirect_uri,
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
    state: с.state,
    nonce: с.nonce,
  })}`;
}

/** Секрет клиента Apple — короткий JWT ES256, подписанный ключом из кабинета Apple. */
function секретApple(): string {
  const e = process.env;
  const заголовок = { alg: "ES256", kid: e.APPLE_KEY_ID };
  const сейчас = Math.floor(Date.now() / 1000);
  const тело = {
    iss: e.APPLE_TEAM_ID,
    iat: сейчас,
    exp: сейчас + 300,
    aud: "https://appleid.apple.com",
    sub: e.APPLE_CLIENT_ID,
  };
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const данные = `${b64(заголовок)}.${b64(тело)}`;
  // В переменной окружения переводы строк часто превращаются в «\n».
  const pem = e.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const sig = подписать("sha256", Buffer.from(данные), {
    key: createPrivateKey(pem),
    dsaEncoding: "ieee-p1363",
  });
  return `${данные}.${sig.toString("base64url")}`;
}

export interface Личность {
  провайдер: Провайдер;
  sub: string;
  email: string;
  /** Провайдер ручается, что почта принадлежит человеку. */
  почтаПодтверждена: boolean;
  имя: string;
  фамилия: string;
}

function разобратьJwt(jwt: string): Record<string, unknown> | null {
  const часть = jwt.split(".")[1];
  if (!часть) return null;
  try {
    return JSON.parse(Buffer.from(часть, "base64url").toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Проверка полей id_token — вынесена отдельно ради тестов. */
export function проверитьТокен(
  claims: Record<string, unknown> | null,
  ожидаем: { провайдер: Провайдер; clientId: string; nonce: string; сейчас?: number },
): Omit<Личность, "имя" | "фамилия"> | null {
  if (!claims) return null;
  const издатели =
    ожидаем.провайдер === "google"
      ? ["https://accounts.google.com", "accounts.google.com"]
      : ["https://appleid.apple.com"];
  if (!издатели.includes(String(claims.iss))) return null;
  const aud = claims.aud;
  if (!(aud === ожидаем.clientId || (Array.isArray(aud) && aud.includes(ожидаем.clientId)))) return null;
  if (!(Number(claims.exp) * 1000 > (ожидаем.сейчас ?? Date.now()))) return null;
  if (claims.nonce !== ожидаем.nonce) return null;
  const sub = typeof claims.sub === "string" ? claims.sub : "";
  const email = typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!sub) return null;
  // У Apple email_verified бывает строкой "true".
  const подтв = claims.email_verified === true || claims.email_verified === "true";
  return { провайдер: ожидаем.провайдер, sub, email, почтаПодтверждена: Boolean(email) && подтв };
}

export async function обменятьКод(
  с: Состояние,
  код: string,
  сайт: string,
  сведенияApple?: string,
): Promise<Личность | null> {
  const google = с.провайдер === "google";
  const clientId = google ? process.env.GOOGLE_CLIENT_ID! : process.env.APPLE_CLIENT_ID!;
  const r = await fetch(
    google ? "https://oauth2.googleapis.com/token" : "https://appleid.apple.com/auth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: код,
        redirect_uri: обратныйАдрес(сайт, с.провайдер),
        client_id: clientId,
        client_secret: google ? process.env.GOOGLE_CLIENT_SECRET! : секретApple(),
      }),
      signal: AbortSignal.timeout(10_000),
    },
  );
  if (!r.ok) return null;
  const ответ = (await r.json().catch(() => null)) as { id_token?: string } | null;
  const claims = ответ?.id_token ? разобратьJwt(ответ.id_token) : null;
  const личность = проверитьТокен(claims, { провайдер: с.провайдер, clientId, nonce: с.nonce });
  if (!личность) return null;

  let имя = google && typeof claims?.given_name === "string" ? claims.given_name : "";
  let фамилия = google && typeof claims?.family_name === "string" ? claims.family_name : "";
  // Apple отдаёт имя только при первом входе — полем user в форме.
  if (!google && сведенияApple) {
    try {
      const u = JSON.parse(сведенияApple) as { name?: { firstName?: string; lastName?: string } };
      имя = u.name?.firstName ?? "";
      фамилия = u.name?.lastName ?? "";
    } catch {}
  }
  return { ...личность, имя: имя.slice(0, 60), фамилия: фамилия.slice(0, 60) };
}

/* ------------------------------------------------------------------ */
/* Разовый билет для приложения                                       */
/* ------------------------------------------------------------------ */

/*
 * В приложении вход идёт в системном браузере — у него свои куки. Сервер
 * отдаёт приложению билет на две минуты, приложение открывает /redeem
 * уже в своём WebView и получает там обычную сессию. Билет одноразовый.
 */
const БИЛЕТ_МС = 2 * 60_000;
const погашенные = new Map<string, number>();

export function выдатьБилет(userId: string): string {
  const данные = `${userId}.${Date.now() + БИЛЕТ_МС}.${randomBytes(8).toString("base64url")}`;
  return `${данные}.${подпись(`ticket:${данные}`)}`;
}

export function погаситьБилет(билет: string): string | null {
  const части = билет.split(".");
  if (части.length !== 4) return null;
  const [userId, до, соль, sig] = части;
  const данные = `${userId}.${до}.${соль}`;
  const ждём = Buffer.from(подпись(`ticket:${данные}`));
  const есть = Buffer.from(sig);
  if (ждём.length !== есть.length || !timingSafeEqual(ждём, есть)) return null;
  if (!(Number(до) > Date.now())) return null;
  const сейчас = Date.now();
  for (const [к, срок] of погашенные) if (срок < сейчас) погашенные.delete(к);
  if (погашенные.has(соль)) return null;
  погашенные.set(соль, Number(до));
  return userId;
}
