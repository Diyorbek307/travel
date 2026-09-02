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
