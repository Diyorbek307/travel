import nodemailer from "nodemailer";

/**
 * Отправка писем.
 *
 * Настраивается переменными окружения SMTP_*. Пока их нет, письма не
 * теряются молча: они пишутся в журнал сервера, а код подтверждения и
 * ссылка на смену пароля остаются доступны оператору в панели. Так
 * приложение работает и без почтового сервиса, а с ним начинает
 * отправлять само — без единой правки в коде.
 *
 * Подойдёт любой SMTP: Яндекс, Gmail с паролем приложения, Mail.ru,
 * собственный сервер.
 */

const HOST = process.env.SMTP_HOST;
const PORT = Number(process.env.SMTP_PORT ?? 587);
const USER = process.env.SMTP_USER;
const PASS = process.env.SMTP_PASSWORD;

const FROM = process.env.MAIL_FROM ?? `UzUp <${USER ?? "noreply@uzup.uz"}>`;

export function mailConfigured(): boolean {
  return Boolean(HOST && USER && PASS);
}

let transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter | null {
  if (!mailConfigured()) return null;
  if (transport) return transport;
  transport = nodemailer.createTransport({
    host: HOST,
    port: PORT,
    // 465 — неявный TLS, остальные порты поднимают шифрование через
    // STARTTLS уже внутри соединения.
    secure: PORT === 465,
    auth: { user: USER, pass: PASS },

    /*
     * Свои сроки ожидания вместо стандартных.
     *
     * По умолчанию nodemailer ждёт соединения две минуты. На проде это
     * стоило ровно столько: регистрация висела 121 секунду, потому что
     * почтовый сервер не отвечал, а мы честно ждали до конца. Замерено
     * дважды подряд с одинаковым результатом — верный признак таймаута,
     * а не медленных вычислений.
     *
     * Десяти секунд достаточно любому живому серверу; всё, что дольше,
     * уже не стоит ожидания человека.
     */
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  return transport;
}

export interface Letter {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/**
 * Отправляет письмо и говорит, ушло ли оно.
 *
 * Ошибку наружу не бросаем: неудача с почтой не должна ронять
 * регистрацию. Вызывающий получает false и показывает запасной путь.
 */
export async function sendMail(letter: Letter): Promise<boolean> {
  const t = getTransport();
  if (!t) {
    console.info(
      `[почта не настроена] «${letter.subject}» для ${letter.to}\n${letter.text}`,
    );
    return false;
  }
  try {
    await t.sendMail({ from: FROM, ...letter });
    return true;
  } catch (error) {
    console.error("[почта] отправить не удалось:", error);
    return false;
  }
}

/**
 * Проверка настроек почты.
 *
 * Подключается к серверу и проходит авторизацию, но письма не шлёт.
 * Позволяет убедиться, что переменные заданы верно, не рассылая ничего
 * живым людям.
 */
export async function проверитьПочту(): Promise<{ ok: boolean; detail: string }> {
  if (!mailConfigured()) {
    const нет = [
      !HOST && "SMTP_HOST",
      !USER && "SMTP_USER",
      !PASS && "SMTP_PASSWORD",
    ].filter(Boolean);
    return { ok: false, detail: `Не заданы переменные: ${нет.join(", ")}` };
  }

  /*
   * Отправитель должен совпадать с тем, под кем вошли.
   *
   * Яндекс и большинство сервисов отвергают письмо, если адрес в
   * MAIL_FROM не тот, которым авторизовались. Ошибка приходит уже при
   * отправке, а подключение при этом проверяется успешно — поэтому
   * ловим её здесь, до первого письма.
   */
  const адресОтправителя = FROM.match(/<([^>]+)>/)?.[1] ?? FROM;
  if (USER && адресОтправителя.trim().toLowerCase() !== USER.trim().toLowerCase()) {
    return {
      ok: false,
      detail:
        `MAIL_FROM указывает на ${адресОтправителя}, а вход выполняется под ${USER}. ` +
        `Почтовый сервер отвергнет такое письмо — адреса должны совпадать.`,
    };
  }

  const t = getTransport();
  if (!t) return { ok: false, detail: "Не удалось создать подключение" };

  try {
    await t.verify();
    return { ok: true, detail: `Подключение к ${HOST}:${PORT} работает, вход выполнен` };
  } catch (error) {
    const текст = (error as Error).message;
    // Подсказываем по самым частым отказам, а не оставляем человека с
    // англоязычной строкой от библиотеки.
    const подсказка =
      /timeout|ETIMEDOUT|ECONNREFUSED/i.test(текст)
        ? " — сервер не отвечает. Проверьте SMTP_HOST и SMTP_PORT: у Яндекса это smtp.yandex.ru и 465."
        : /auth|535|credentials/i.test(текст)
          ? " — вход не принят. Нужен пароль приложения, а не пароль от почты, и включённый доступ по IMAP в настройках Яндекса."
          : "";
    return { ok: false, detail: текст + подсказка };
  }
}

/** Пробное письмо — чтобы увидеть, как оно выглядит и дошло ли. */
export async function пробноеПисьмо(to: string): Promise<boolean> {
  return sendMail({
    to,
    subject: "Проверка почты UzUp",
    text: "Если вы это читаете, отправка писем настроена верно.",
    html: каркас(
      "Почта настроена",
      `<p style="margin:0;font-size:14px;line-height:1.6">Если вы это читаете, отправка писем работает: коды подтверждения и ссылки на смену пароля будут доходить.</p>`,
    ),
  });
}

/* ------------------------------------------------------------------ */
/* Шаблоны                                                            */
/* ------------------------------------------------------------------ */

/** Общая рамка письма — в цветах приложения, без внешних картинок. */
function каркас(заголовок: string, тело: string): string {
  return `<!doctype html>
<html lang="ru"><body style="margin:0;padding:24px;background:#f5f1e6;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;color:#2b2b2b">
  <table role="presentation" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden">
    <tr><td style="background:#2e7d5a;padding:24px 28px">
      <div style="color:#ffffff;font-size:20px;font-weight:700">UzUp</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:2px">Открой Узбекистан</div>
    </td></tr>
    <tr><td style="padding:28px">
      <h1 style="margin:0 0 12px;font-size:19px">${заголовок}</h1>
      ${тело}
    </td></tr>
    <tr><td style="padding:0 28px 24px;color:#7a6e5f;font-size:12px;line-height:1.5">
      Если вы этого не запрашивали, просто не отвечайте на письмо — ничего не произойдёт.
    </td></tr>
  </table>
</body></html>`;
}

export function письмоСКодом(code: string): Omit<Letter, "to"> {
  return {
    subject: `${code} — код подтверждения UzUp`,
    text: `Ваш код подтверждения: ${code}\n\nОн действует 15 минут.\n\nЕсли вы этого не запрашивали, ничего делать не нужно.`,
    html: каркас(
      "Подтвердите почту",
      `<p style="margin:0 0 18px;font-size:14px;line-height:1.6">Введите этот код в приложении:</p>
       <div style="font-size:32px;font-weight:700;letter-spacing:8px;color:#2e7d5a;background:#f5f1e6;border-radius:12px;padding:16px;text-align:center">${code}</div>
       <p style="margin:18px 0 0;font-size:13px;color:#7a6e5f">Код действует 15 минут.</p>`,
    ),
  };
}

export function письмоСоСсылкой(link: string): Omit<Letter, "to"> {
  return {
    subject: "Смена пароля UzUp",
    text: `Чтобы задать новый пароль, откройте ссылку:\n${link}\n\nОна действует один час и сработает только один раз.`,
    html: каркас(
      "Смена пароля",
      `<p style="margin:0 0 18px;font-size:14px;line-height:1.6">Нажмите кнопку, чтобы задать новый пароль:</p>
       <a href="${link}" style="display:inline-block;background:#e9c46a;color:#2b2b2b;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:12px">Задать новый пароль</a>
       <p style="margin:18px 0 0;font-size:13px;color:#7a6e5f">Ссылка действует один час и сработает только один раз.</p>
       <p style="margin:10px 0 0;font-size:12px;color:#7a6e5f;word-break:break-all">${link}</p>`,
    ),
  };
}
