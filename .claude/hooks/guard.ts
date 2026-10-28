/**
 * Hook PreToolUse de Claude Code. Recibe JSON por stdin; salir con código 2 bloquea la
 * herramienta y el mensaje de stderr se le devuelve a Claude. Misma regla que en OpenCode.
 */
import { z } from "zod";
import { ToolArgsSchema, checkToolCall } from "../../.agents/guard/rules";

const HookEventSchema = z.object({
  tool_name: z.string().default(""),
  tool_input: ToolArgsSchema.default({}),
  cwd: z.string().optional(),
});

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk: string) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  try {
    const event = HookEventSchema.parse(JSON.parse(raw));
    const root = process.env.CLAUDE_PROJECT_DIR ?? event.cwd ?? process.cwd();
    const reason = checkToolCall(event.tool_name, event.tool_input, root);
    if (reason) {
      console.error(reason);
      process.exit(2);
    }
  } catch (e) {
    // Si el hook falla no debe dejar pasar en silencio algo sensible, pero tampoco bloquear todo el trabajo.
    console.error("guard: no pude interpretar el evento:", e);
  }
});
