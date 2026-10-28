import { checkToolCall, type ToolArgs } from "../../.agents/guard/rules";

/**
 * Plugin de OpenCode: antes de ejecutar cualquier herramienta, revisa si intenta tocar una zona
 * prohibida (ver tools/guard/rules.ts). Lanzar un Error cancela la herramienta y el mensaje
 * le llega al modelo como resultado de error.
 *
 * Los tipos se declaran aquí a mano para no añadir `@opencode-ai/plugin` como dependencia
 * (arrastra paquetes con avisos de `npm audit`). Con la dependencia sería:
 *   import type { Plugin } from "@opencode-ai/plugin";  export const Guard: Plugin = async (...) => {...}
 */
type BeforeHook = (input: { tool: string }, output: { args?: ToolArgs }) => Promise<void>;

export const Guard = async ({ directory }: { directory: string }): Promise<{ "tool.execute.before": BeforeHook }> => ({
  "tool.execute.before": async (input, output) => {
    const reason = checkToolCall(input.tool, output.args ?? {}, directory);
    if (reason) {
      throw new Error(reason);
    }
  },
});
