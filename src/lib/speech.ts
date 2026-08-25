/**
 * Распознавание речи браузером.
 *
 * Турист идёт по улице с телефоном в руке — печатать неудобно, особенно
 * названия вроде «Шахи-Зинда». Web Speech API уже используется в приложении
 * для озвучки аудиогидов, распознавание берётся оттуда же: ни одной новой
 * зависимости и ни одного запроса на сторонний сервис.
 *
 * Поддержка неполная: Safari и Chrome умеют, Firefox — нет. Поэтому кнопка
 * появляется только там, где распознавание есть.
 */

interface SpeechResultAlternative {
  transcript: string;
}
interface SpeechResult {
  0: SpeechResultAlternative;
  isFinal: boolean;
}
interface SpeechEvent {
  resultIndex: number;
  results: { length: number; [index: number]: SpeechResult };
}

export interface Recognizer {
  start(): void;
  stop(): void;
}

interface RecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start(): void;
  stop(): void;
  onresult: ((event: SpeechEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

type RecognitionCtor = new () => RecognitionLike;

function ctor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function speechSupported(): boolean {
  return ctor() !== null;
}

/** Коды языков для распознавания: у платформы свои двухбуквенные. */
const LOCALE: Record<string, string> = {
  ru: "ru-RU",
  uz: "uz-UZ",
  en: "en-US",
};

/**
 * Создаёт распознаватель. `onText` вызывается и на промежуточных результатах,
 * чтобы человек видел, как его слышат, и мог поправиться на ходу.
 */
export function createRecognizer(
  lang: string,
  onText: (text: string, final: boolean) => void,
  onEnd: () => void,
): Recognizer | null {
  const Ctor = ctor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = LOCALE[lang] ?? "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    let text = "";
    let final = false;
    for (let i = event.resultIndex; i < event.results.length; i++) {
      text += event.results[i][0].transcript;
      if (event.results[i].isFinal) final = true;
    }
    onText(text.trim(), final);
  };
  recognition.onend = onEnd;
  recognition.onerror = onEnd;

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
  };
}
