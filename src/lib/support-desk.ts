import { randomBytes, randomInt } from "node:crypto";
import path from "node:path";
import { создатьХранилище } from "./storage";
import { anthropic, jsonИзОтвета, ИМЯ_ЯЗЫКА, МОДЕЛЬ, текстОтвета } from "./ai";
import type { SupportMessage, SupportThread } from "./community";

/**
 * Служба поддержки с ИИ-помощниками.
 *
 * Первым отвечает помощник с узбекским именем — «Равшан · HelloUZ». Он
 * всегда подписан как ИИ: выдавать программу за живого сотрудника мы не
 * будем — это обман человека, который пишет в поддержку именно потому,
 * что ему нужна помощь, и доверие к сервису рушится в тот момент, когда
 * обман вскрывается. Поэтому имя есть, пометка «ИИ» есть, и живой
 * оператор подключается по первой просьбе.
 *
 * Ответ показывается не мгновенно, а через 5–30 секунд с «печатает…»:
 * ответ за полсекунды на длинное письмо читается как отписка.
 *
 * Чего помощник НЕ может: видеть код, базу, брони и платежи, что-то
 * менять в аккаунте. Он знает только описание приложения ниже и базу
 * знаний — ответы, которые одобрили операторы. О сбоях он собирает
 * заявку для команды, а чинят их люди.
 */

const DATA_DIR = process.env.DATA_DIR ?? path.join(process.cwd(), "data");

function id(префикс: string): string {
  return `${префикс}-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

/* ------------------------------------------------------------------ */
/* Помощники                                                          */
/* ------------------------------------------------------------------ */

/** Имена помощников: кириллицей для русского, латиницей для остальных. */
export const ПОМОЩНИКИ: Record<string, { ru: string; uz: string; lat: string }> = {
  ravshan: { ru: "Равшан", uz: "Ravshan", lat: "Ravshan" },
  madina: { ru: "Мадина", uz: "Madina", lat: "Madina" },
  otabek: { ru: "Утабек", uz: "Oʻtabek", lat: "Otabek" },
  dilnoza: { ru: "Дильноза", uz: "Dilnoza", lat: "Dilnoza" },
  jasur: { ru: "Жасур", uz: "Jasur", lat: "Jasur" },
};

export function случайныйПомощник(): string {
  const ключи = Object.keys(ПОМОЩНИКИ);
  return ключи[randomInt(ключи.length)];
}

export function имяПомощника(ключ: string | undefined, язык: string): string {
  const п = ПОМОЩНИКИ[ключ ?? ""] ?? ПОМОЩНИКИ.ravshan;
  return язык === "ru" ? п.ru : язык === "uz" ? п.uz : п.lat;
}

/** Пауза перед ответом: 5–30 секунд, длинному письму — чуть дольше. */
export function задержкаОтвета(длинаВопроса: number): number {
  const основа = 5_000 + randomInt(15_000);
  const чтение = Math.min(10_000, длинаВопроса * 40);
  return Math.min(30_000, основа + чтение);
}

/** Что туристу уже видно: ответы ИИ из будущего прячем до их минуты. */
export function видимые(сообщения: SupportMessage[], сейчас = Date.now()): SupportMessage[] {
  return сообщения.filter((m) => !m.showAt || Date.parse(m.showAt) <= сейчас);
}

/** Показывать ли «печатает…». */
export function печатает(ветка: SupportThread | null, сейчас = Date.now()): boolean {
  if (!ветка) return false;
  if (ветка.messages.some((m) => m.showAt && Date.parse(m.showAt) > сейчас)) return true;
  // Зависшее ожидание (ИИ упал) не держим дольше двух минут.
  return Boolean(ветка.aiPendingSince && сейчас - Date.parse(ветка.aiPendingSince) < 120_000);
}

/* ------------------------------------------------------------------ */
/* База знаний                                                        */
/* ------------------------------------------------------------------ */

export interface ЗаписьЗнаний {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  /** Кто одобрил — имя оператора. */
  by: string;
}

const знания = создатьХранилище<ЗаписьЗнаний[]>(path.join(DATA_DIR, "support-kb.json"), () => []);

export async function listKnowledge(): Promise<ЗаписьЗнаний[]> {
  return [...(await знания.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addKnowledge(question: string, answer: string, by: string): Promise<ЗаписьЗнаний> {
  const запись: ЗаписьЗнаний = {
    id: id("kb"),
    question: question.trim().slice(0, 1000),
    answer: answer.trim().slice(0, 3000),
    createdAt: new Date().toISOString(),
    by,
  };
  return знания.update((все) => [[запись, ...все].slice(0, 300), запись]);
}

export async function deleteKnowledge(kbId: string): Promise<void> {
  await знания.update((все) => [все.filter((з) => з.id !== kbId), undefined]);
}

/* ------------------------------------------------------------------ */
/* Заявки об ошибках                                                  */
/* ------------------------------------------------------------------ */

export type СтатусОшибки = "new" | "in_progress" | "fixed" | "rejected";

export interface ЗаявкаОбОшибке {
  id: string;
  userId: string;
  title: string;
  details: string;
  /** Где у человека: телефон/браузер и язык — без этого ошибку не воспроизвести. */
  device: string;
  lang: string;
  status: СтатусОшибки;
  createdAt: string;
}

const ошибки = создатьХранилище<ЗаявкаОбОшибке[]>(path.join(DATA_DIR, "bug-reports.json"), () => []);

export async function listBugs(): Promise<ЗаявкаОбОшибке[]> {
  return [...(await ошибки.read())].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addBug(
  поля: Omit<ЗаявкаОбОшибке, "id" | "status" | "createdAt">,
): Promise<ЗаявкаОбОшибке> {
  const заявка: ЗаявкаОбОшибке = {
    ...поля,
    title: поля.title.trim().slice(0, 200),
    details: поля.details.trim().slice(0, 3000),
    device: поля.device.slice(0, 300),
    id: id("bug"),
    status: "new",
    createdAt: new Date().toISOString(),
  };
  return ошибки.update((все) => [[заявка, ...все].slice(0, 1000), заявка]);
}

export async function setBugStatus(bugId: string, status: СтатусОшибки): Promise<boolean> {
  return ошибки.update((все) => {
    const i = все.findIndex((з) => з.id === bugId);
    if (i === -1) return [все, false];
    const копия = [...все];
    копия[i] = { ...копия[i], status };
    return [копия, true];
  });
}

/* ------------------------------------------------------------------ */
/* Ответ помощника                                                    */
/* ------------------------------------------------------------------ */

/**
 * Что помощник знает о приложении. Только то, что действительно есть:
 * чего здесь нет — того он не обещает и зовёт человека.
 */
const О_ПРИЛОЖЕНИИ = `
HelloUZ — приложение и сайт для туристов по Узбекистану, 10 языков.
- «Главная»: плитки разделов — гостиницы и отели, хостелы и гостевые дома, рестораны/кафе/бары, развлечения, музеи и театры, достопримечательности, экскурсии, покупка билетов (поезда, самолёты, межгород), ИИ-помощник (гид), такси. Ниже — маршруты, города, eSIM, «Без интернета», советы.
- В карточке места, отеля или ресторана есть «Как добраться»: пешком, на машине или на такси. Пешком и на машине можно нажать «Начать навигацию» — приложение ведёт по шагам голосом прямо внутри. Нужно разрешить доступ к геолокации. Такси вызывается через Яндекс Go.
- Отель или стол в ресторане бронируются на странице заведения; брони видны в профиле.
- «Без интернета»: можно заранее скачать город (фото, описания, аудиогиды) и пользоваться без сети.
- Язык меняется в профиле; по умолчанию — язык телефона. Там же единицы км/мили, тема, удаление аккаунта.
- Premium: без рекламы, плюс скидки и акции партнёров.
- При угрозе жизни — звонить 112 и нажать SOS в приложении.
- Приложения в App Store и Google Play пока нет — есть веб-версия.
`.trim();

function подсказка(помощник: string, язык: string, знанияТекст: string): string {
  return `Ты — ${помощник}, ИИ-помощник службы поддержки HelloUZ.

Ты не человек и никогда не выдаёшь себя за человека. Спросят «ты бот?» — честно скажи, что ты ИИ-помощник поддержки HelloUZ и что живой оператор может подключиться. Не выдумывай про себя биографию, возраст, город, обед и т. п.

Отвечай на языке туриста (его язык интерфейса — ${ИМЯ_ЯЗЫКА[язык] ?? "English"}; если он пишет на другом — отвечай на языке его сообщения). Коротко и по-человечески тепло: 1–5 предложений, без канцелярита, можно один эмодзи.

Что ты умеешь: объяснить, как пользоваться приложением, по описанию ниже и по базе знаний; принять сообщение об ошибке.
Чего ты НЕ умеешь и не обещаешь: смотреть или менять брони, платежи, возвраты, аккаунт, данные человека; что-то исправлять в приложении. Не придумывай функций, цен, сроков и телефонов, которых нет ниже.

Когда звать человека (handoff=true): человек просит оператора/живого человека; вопросы о деньгах, оплате, возврате, конкретной брони, взломе аккаунта, жалоба на заведение или сотрудника; ты не знаешь ответа; человек раздражён второй раз. Тогда в ответе скажи, что передал переписку оператору и он ответит здесь в рабочие часы.

Когда человек описывает сбой (что-то не открывается, кнопка не работает, ошибка, неправильные данные) — заполни bug: короткий заголовок по-русски и подробности по-русски (что делал, что ожидал, что произошло, на каком экране). Если подробностей мало — сначала спроси одну конкретную вещь, а bug заполни, когда станет понятно. Скажи человеку, что передал ошибку команде.

Ответь СТРОГО одним JSON без пояснений:
{"reply": "текст туристу", "handoff": false, "bug": null}
или bug: {"title": "...", "details": "..."}

О ПРИЛОЖЕНИИ
${О_ПРИЛОЖЕНИИ}

БАЗА ЗНАНИЙ (ответы, одобренные операторами; им доверяй больше всего)
${знанияТекст || "пока пусто"}`;
}

export interface ОтветПомощника {
  reply: string;
  handoff: boolean;
  bug: { title: string; details: string } | null;
}

/** Разбор ответа модели; кривой JSON — не повод молчать, отдаём текст как есть. */
export function разобратьОтвет(текст: string): ОтветПомощника | null {
  const j = jsonИзОтвета<Partial<ОтветПомощника>>(текст);
  if (j && typeof j.reply === "string" && j.reply.trim()) {
    const bug =
      j.bug && typeof j.bug === "object" && typeof j.bug.title === "string" && j.bug.title.trim()
        ? { title: j.bug.title, details: typeof j.bug.details === "string" ? j.bug.details : "" }
        : null;
    return { reply: j.reply.trim(), handoff: j.handoff === true, bug };
  }
  const голый = текст.trim();
  // Модель не дала JSON — не показываем туристу фигурные скобки.
  if (!голый || голый.startsWith("{")) return null;
  return { reply: голый, handoff: false, bug: null };
}

/** Последние реплики для модели: турист — user, ИИ и оператор — assistant. */
function историяДляМодели(сообщения: SupportMessage[]) {
  const реплики: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of сообщения.slice(-16)) {
    const role = m.author === "user" ? "user" : "assistant";
    const текст = m.author === "staff" ? `[ответ оператора] ${m.text}` : m.text;
    const пред = реплики[реплики.length - 1];
    // API требует чередования ролей — подряд идущие склеиваем.
    if (пред && пред.role === role) пред.content += `\n${текст}`;
    else реплики.push({ role, content: текст });
  }
  while (реплики.length && реплики[0].role === "assistant") реплики.shift();
  return реплики;
}

export async function ответПомощника(
  ветка: SupportThread,
  язык: string,
): Promise<ОтветПомощника | null> {
  const ai = anthropic();
  if (!ai) return null;
  const реплики = историяДляМодели(ветка.messages);
  if (!реплики.length || реплики[реплики.length - 1].role !== "user") return null;

  const база = (await listKnowledge())
    .slice(0, 120)
    .map((з) => `В: ${з.question}\nО: ${з.answer}`)
    .join("\n\n");

  try {
    const ответ = await ai.messages.create({
      model: МОДЕЛЬ,
      max_tokens: 600,
      system: [
        {
          type: "text",
          text: подсказка(имяПомощника(ветка.agent, язык), язык, база),
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: реплики,
    });
    return разобратьОтвет(текстОтвета(ответ));
  } catch (e) {
    console.error("[support-ai]", e instanceof Error ? e.message : e);
    return null;
  }
}
