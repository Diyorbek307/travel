import path from "node:path";
import { defineConfig } from "vitest/config";

// Тот же псевдоним «@/», что в tsconfig.json: без него тесты не могли
// импортировать модули, которые сами ссылаются на «@/…» (семена, хранилище).
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "src") },
  },
});
