/**
 * Гостевой режим.
 *
 * Раньше приложение без аккаунта не открывалось вовсе: после выбора языка
 * человек упирался в форму регистрации, так и не увидев ни одного места.
 * Теперь смотреть можно сразу, а войти просим только там, где аккаунт
 * правда нужен: бронь, отзыв, поддержка. Отметка живёт на устройстве —
 * второй раз гость попадает прямо в приложение.
 */

const КЛЮЧ = "uzup.guest";

export function гость(): boolean {
  try {
    return localStorage.getItem(КЛЮЧ) === "1";
  } catch {
    return false;
  }
}

export function статьГостем(): void {
  try {
    localStorage.setItem(КЛЮЧ, "1");
  } catch {
    // Приватный режим — в этот раз всё равно пустим, просто без памяти.
  }
}

export function забытьГостя(): void {
  try {
    localStorage.removeItem(КЛЮЧ);
  } catch {
    // нечего забывать
  }
}

/** Попросить приложение открыть вход или регистрацию (ловит page.tsx). */
export function открытьВход(что: "login" | "register" = "login"): void {
  window.dispatchEvent(new CustomEvent("hellouz:auth", { detail: что }));
}

/** Ссылки, по которым человек пришёл к конкретной вещи, а не «в приложение». */
export const ПАРАМЕТРЫ_ССЫЛКИ = ["place", "hotel", "restaurant", "audio", "open", "trip", "esim"] as const;
