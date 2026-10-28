import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import localRules from "./scripts/eslint/max-methods-per-class.mjs";

/**
 * Reglas de código del proyecto (ADR-0005, AGENTS.md → «Reglas de código»):
 *  1. Cero `any` (explícito o implícito, incluido el que llega de librerías: no-unsafe-*) y cero `unknown`
 *     (ni el tipo ni `z.unknown()`/`z.any()`): lo externo se valida en el punto de entrada, sin nombrarlo.
 *  2. Sin `if` abreviados: nada de operador ternario y todo `if`/`else`/bucle lleva llaves.
 *  3. Una función no pasa de 100 líneas de código (sin contar blancos ni comentarios).
 *  4. Una clase no pasa de 10 funciones.
 *  5. Nombres: funciones y variables en camelCase; clases, interfaces y tipos en PascalCase.
 *  (Los campos de las peticiones y respuestas en snake_case los vigila tests/project/contracts-style.test.ts.)
 */

/** Convención de nombres. Cada bloque recibe los formatos que admite para `function`. */
const namingConvention = (functionFormats) => [
  "error",
  { selector: "function", format: functionFormats },
  { selector: "variable", format: ["camelCase", "UPPER_CASE", "PascalCase"], leadingUnderscore: "allow" },
  { selector: "parameter", format: ["camelCase"], leadingUnderscore: "allow" },
  { selector: "method", format: ["camelCase"] },
  { selector: "typeLike", format: ["PascalCase"] },
];

/** Prohibido el tipo `unknown` (y sus equivalentes en Zod). `no-restricted-syntax` se reemplaza por bloque: reúne aquí todo. */
const unknownBan = [
  {
    selector: "TSUnknownKeyword",
    message:
      "Prohibido el tipo `unknown` (AGENTS.md, regla 1). Valida en el punto de entrada: `Esquema.parse(await res.json())`; para `catch`, pasa el error a una función genérica `<T>(error: T)`.",
  },
  {
    selector: "CallExpression[callee.object.name='z'][callee.property.name=/^(unknown|any)$/]",
    message: "Prohibido `z.unknown()` y `z.any()`: describe la forma real del dato con un esquema.",
  },
];

/** Frontend: el texto va en elementos con significado; `div` y `span` solo agrupan o decoran (grids, estilos). */
const semanticHtml = [
  {
    selector: "JSXElement[openingElement.name.name=/^(div|span)$/] > JSXText[value=/\\S/]",
    message:
      "No pongas texto directamente en <div> ni <span> (docs/frontend-rules.md): usa <p>, <h1>–<h6>, <li>, <label>, <button>, <a>, <strong>, <time>…",
  },
];

/** Accesibilidad (WCAG 2.1): las reglas de jsx-a11y que Next deja como aviso pasan a error. */
const accessibilityRules = Object.fromEntries(
  [
    "alt-text",
    "anchor-has-content",
    "anchor-is-valid",
    "aria-props",
    "aria-proptypes",
    "aria-role",
    "aria-unsupported-elements",
    "click-events-have-key-events",
    "heading-has-content",
    "html-has-lang",
    "img-redundant-alt",
    "interactive-supports-focus",
    "label-has-associated-control",
    "no-autofocus",
    "no-noninteractive-element-interactions",
    "no-noninteractive-tabindex",
    "no-redundant-roles",
    "no-static-element-interactions",
    "role-has-required-aria-props",
    "role-supports-aria-props",
    "tabindex-no-positive",
  ].map((name) => [`jsx-a11y/${name}`, "error"]),
);

/**
 * Fronteras de la arquitectura por feature (ADR-0001). Todo el código compartido vive en `app/` y el alias `@/`
 * apunta a esa carpeta. Dentro de una feature se importa con rutas relativas; con `@/` solo se cruza hacia
 * `shared/` o hacia el `schema` (y la `ui`) de otra feature. El contenedor (`@/features/container`) solo lo usan
 * las rutas y las páginas.
 */
const boundary = (message, group) => ["error", { patterns: [{ group, message }] }];
const OTHER_FEATURE_SERVER = "@/features/*/server/**";
const CONTAINER = "@/features/container";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.mts"],
    languageOptions: {
      parserOptions: {
        // Los hooks de los harness viven en carpetas ocultas que tsconfig no incluye.
        projectService: {
          allowDefaultProject: [".claude/hooks/guard.ts", ".opencode/plugins/guard.ts"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: { local: localRules },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unsafe-assignment": "error",
      "@typescript-eslint/no-unsafe-member-access": "error",
      "@typescript-eslint/no-unsafe-argument": "error",
      "@typescript-eslint/no-unsafe-call": "error",
      "@typescript-eslint/no-unsafe-return": "error",
      "no-restricted-syntax": ["error", ...unknownBan],
      "no-ternary": "error",
      curly: ["error", "all"],
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
      "local/max-methods-per-class": ["error", { max: 10 }],
      "@typescript-eslint/naming-convention": namingConvention(["camelCase"]),
    },
  },
  {
    files: ["app/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary("shared/ no puede depender de features/.", ["@/features/**"]),
    },
  },
  {
    files: ["app/features/*/schema.ts"],
    rules: {
      "no-restricted-imports": boundary("schema.ts solo describe contratos: sin server/, ui/ ni el contenedor.", [
        "**/server/**",
        "**/ui/**",
        CONTAINER,
      ]),
    },
  },
  {
    files: ["app/features/*/server/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary(
        "server/ no importa ui/, el contenedor ni el server/ de otra feature: usa un puerto propio.",
        ["**/ui/**", CONTAINER, OTHER_FEATURE_SERVER],
      ),
    },
  },
  {
    files: ["app/features/*/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": boundary(
        "ui/ no importa server/ ni el contenedor: los datos le llegan por props desde las páginas.",
        ["**/server/**", CONTAINER, "server-only"],
      ),
    },
  },
  {
    // Rutas, páginas y layouts: todo `app/` salvo `features/` y `shared/`.
    files: ["app/**/*.{ts,tsx}"],
    ignores: ["app/features/**", "app/shared/**"],
    rules: {
      "no-restricted-imports": boundary(
        "Las rutas llegan a la lógica por @/features/container, no por el server/ de una feature.",
        [OTHER_FEATURE_SERVER],
      ),
    },
  },
  // Componentes de React (PascalCase), páginas de Next, HTML semántico y accesibilidad.
  {
    files: ["**/*.tsx"],
    rules: {
      "@typescript-eslint/naming-convention": namingConvention(["camelCase", "PascalCase"]),
      "no-restricted-syntax": ["error", ...unknownBan, ...semanticHtml],
      ...accessibilityRules,
    },
  },
  // Next exige que los manejadores HTTP se llamen GET, POST, PUT…
  {
    files: ["**/route.ts"],
    rules: { "@typescript-eslint/naming-convention": namingConvention(["camelCase", "UPPER_CASE"]) },
  },
  // La API de plugins de OpenCode exige claves como "tool.execute.before".
  {
    files: [".opencode/plugins/*.ts"],
    rules: { "@typescript-eslint/naming-convention": "off" },
  },
  // En las pruebas, `describe(...)` agrupa casos: su callback es una suite, no lógica.
  {
    files: ["tests/**/*.ts", "app/features/*/tests/**/*.ts", "app/shared/tests/**/*.ts"],
    rules: { "max-lines-per-function": "off" },
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", ".opencode/node_modules/**"]),
]);

export default eslintConfig;
