import { cookies } from "next/headers";
import { findById, readSession, SESSION_COOKIE, type User } from "./users";

/**
 * Кто сейчас вошёл.
 *
 * Один помощник на все маршруты: иначе проверку копируют, а потом в
 * одном месте забывают — и появляется ручка, работающая без входа.
 */
export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const id = readSession(token);
  if (!id) return null;

  const user = await findById(id);
  // Неподтверждённая почта не считается входом: аккаунт заведён, но им
  // ещё не подтвердили право пользоваться.
  return user?.emailVerified ? user : null;
}
