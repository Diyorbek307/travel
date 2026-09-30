/**
 * Тело запроса Click → плоские строковые поля. Click шлёт форму
 * (x-www-form-urlencoded); на всякий случай понимаем и JSON.
 */
export async function поляClick(request: Request): Promise<Record<string, string> | null> {
  const текст = await request.text();
  try {
    if (текст.trim().startsWith("{")) {
      const json = JSON.parse(текст) as Record<string, unknown>;
      return Object.fromEntries(Object.entries(json).map(([к, v]) => [к, String(v)]));
    }
    return Object.fromEntries(new URLSearchParams(текст));
  } catch {
    return null;
  }
}
