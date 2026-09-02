/**
 * Отправка писем по HTTPS.
 *
 * Render не выпускает наружу почтовые порты — проверено: с рабочей
 * машины smtp.mail.ru:465 отвечает за 71 миллисекунду и принимает вход,
 * а с сервера даёт таймаут. Так делают почти все хостинги, чтобы через
 * них не рассылали спам, и обойти это настройками SMTP невозможно.
 *
 * Обычный HTTPS при этом не блокируется, поэтому письма уходят через
 * API почтового сервиса. Ключ задаётся одной переменной; какой из
 * сервисов — определяется по тому, какая задана.
 */

export type Провайдер = "brevo" | "resend" | "нет";

const BREVO = process.env.BREVO_API_KEY;
const RESEND = process.env.RESEND_API_KEY;

export function httpПровайдер(): Провайдер {
  if (BREVO) return "brevo";
  if (RESEND) return "resend";
  return "нет";
}

/** Разбирает «Имя <адрес>» на части: сервисы просят их раздельно. */
function разобратьОтправителя(from: string): { name: string; email: string } {
  const m = from.match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1] || "UzUp", email: m[2].trim() };
  return { name: "UzUp", email: from.trim() };
}

export interface HttpПисьмо {
  to: string;
  subject: string;
  text: string;
  html: string;
  from: string;
}

/** Отправляет и возвращает причину отказа, если он был. */
export async function отправитьПоHttp(
  письмо: HttpПисьмо,
): Promise<{ ok: boolean; detail: string }> {
  const провайдер = httpПровайдер();
  if (провайдер === "нет") return { ok: false, detail: "HTTP-провайдер не задан" };

  const отправитель = разобратьОтправителя(письмо.from);

  try {
    if (провайдер === "brevo") {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": BREVO!,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: отправитель,
          to: [{ email: письмо.to }],
          subject: письмо.subject,
          htmlContent: письмо.html,
          textContent: письмо.text,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) return { ok: true, detail: "Отправлено через Brevo" };
      const тело = await res.text();
      return { ok: false, detail: `Brevo ответил ${res.status}: ${тело.slice(0, 200)}` };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: письмо.from,
        to: [письмо.to],
        subject: письмо.subject,
        html: письмо.html,
        text: письмо.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) return { ok: true, detail: "Отправлено через Resend" };
    const тело = await res.text();
    return { ok: false, detail: `Resend ответил ${res.status}: ${тело.slice(0, 200)}` };
  } catch (error) {
    return { ok: false, detail: (error as Error).message };
  }
}

/**
 * Проверка ключа без отправки письма.
 *
 * Спрашиваем у сервиса сведения об аккаунте: ключ либо принимается, либо
 * нет, и никто не получает лишних писем.
 */
export async function проверитьHttp(): Promise<{ ok: boolean; detail: string }> {
  const провайдер = httpПровайдер();
  if (провайдер === "нет") return { ok: false, detail: "HTTP-провайдер не задан" };

  try {
    if (провайдер === "brevo") {
      const res = await fetch("https://api.brevo.com/v3/account", {
        headers: { "api-key": BREVO!, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        return { ok: false, detail: `Brevo не принял ключ (${res.status}). Проверьте BREVO_API_KEY.` };
      }
      const d = (await res.json()) as { email?: string; plan?: { credits?: number }[] };
      const остаток = d.plan?.[0]?.credits;
      return {
        ok: true,
        detail:
          `Brevo принял ключ, аккаунт ${d.email ?? "—"}` +
          (typeof остаток === "number" ? `, писем в запасе: ${остаток}` : ""),
      };
    }

    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${RESEND}` },
      signal: AbortSignal.timeout(10_000),
    });
    return res.ok
      ? { ok: true, detail: "Resend принял ключ" }
      : { ok: false, detail: `Resend не принял ключ (${res.status}). Проверьте RESEND_API_KEY.` };
  } catch (error) {
    return { ok: false, detail: (error as Error).message };
  }
}
