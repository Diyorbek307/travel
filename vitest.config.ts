import { defineConfig } from "vitest/config";
import path from "node:path";

/**
 * Тесты.
 *
 * Проверяется прикладная логика: планировщик маршрутов, разбор запросов
 * помощника, география и защиты вокруг платных вызовов. Интерфейс не
 * покрывается — там дешевле снимок экрана глазами, чем поддержка хрупких
 * проверок разметки.
 *
 * Часть тестов читает базу, поэтому перед запуском она должна быть заполнена:
 * `npm run seed`. Это отражено в npm-скрипте `test`.
 */
export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    // Тесты трогают одну и ту же базу SQLite, поэтому идут по очереди.
    fileParallelism: false,
  },
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
