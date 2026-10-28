import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // `@/tests/…` apunta a los ayudantes de la raíz; el resto de `@/…` es la carpeta `app/`.
    alias: [
      { find: /^@\/tests\//, replacement: `${resolve(import.meta.dirname, "tests")}/` },
      { find: /^@\//, replacement: `${resolve(import.meta.dirname, "app")}/` },
    ],
  },
  test: {
    // Punto de entrada único (`npm test`): los tests de cada feature viven en su carpeta
    // y `tests/` aporta los del proyecto y los ayudantes compartidos (`tests/helpers`).
    include: ["tests/**/*.test.ts", "app/features/*/tests/**/*.test.ts", "app/shared/tests/**/*.test.ts"],
    environment: "node",
  },
});
