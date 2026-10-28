import { checkToolCall, type ToolArgs } from "../../.agents/guard/rules";

/**
 * Plugin de OpenCode: antes de ejecutar cualquier herramienta, revisa si intenta tocar una zona
 * prohibida (ver .agents/guard/rules.ts). Lanzar un Error cancela la herramienta y el mensaje
 * le llega al modelo como resultado de error.
 *
 * Funciona con los dos formatos de plugin de OpenCode:
 *  - 2.x: exige `export default` con `id` y `setup(ctx)`; el hook es `ctx.tool.hook("execute.before", …)`.
 *  - 1.x: módulo con `server` (y el export con nombre `Guard` del formato antiguo).
 * Sin ese `export default`, OpenCode 2.x no carga el plugin y avisa con «Plugin must export a default
 * definition with an id and an effect or setup function».
 *
 * Los tipos se declaran aquí a mano para no añadir `@opencode-ai/plugin` como dependencia
 * (arrastra paquetes con avisos de `npm audit`).
 */

/** Hook de OpenCode 1.x: recibe la herramienta y sus argumentos por separado. */
type LegacyBeforeHook = (input: { tool: string }, output: { args?: ToolArgs }) => Promise<void>;

/** Lo mínimo que usamos del contexto de OpenCode 2.x. */
interface V2Context {
  location: { directory: string };
  tool: {
    hook: (name: "execute.before", callback: (event: { tool: string; input: ToolArgs }) => void) => Promise<object>;
  };
}

function enforce(tool: string, args: ToolArgs | undefined, directory: string): void {
  const reason = checkToolCall(tool, args ?? {}, directory);
  if (reason) {
    throw new Error(reason);
  }
}

export const Guard = async ({
  directory,
}: {
  directory: string;
}): Promise<{ "tool.execute.before": LegacyBeforeHook }> => ({
  "tool.execute.before": async (input, output) => {
    enforce(input.tool, output.args, directory);
  },
});

const guardPlugin = {
  id: "guard",
  server: Guard,
  async setup(ctx: V2Context): Promise<void> {
    await ctx.tool.hook("execute.before", (event) => {
      enforce(event.tool, event.input, ctx.location.directory);
    });
  },
};

export default guardPlugin;
