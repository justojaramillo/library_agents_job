/**
 * Reglas de "carpetas prohibidas" para agentes. Una sola fuente de verdad que usan
 * los dos harness: el plugin de OpenCode (.opencode/plugins/guard.ts) y el hook de
 * Claude Code (.claude/hooks/guard.ts).
 *
 * IMPORTANTE: esto es una barrera de buena fe, NO un sandbox. Un `bash` con comodines,
 * variables o scripts puede esquivarla. La defensa real es defensa en profundidad:
 * permisos del harness + esta barrera + no tener secretos en el disco del agente.
 */
import { existsSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { z } from "zod";

/** Un campo de texto opcional; si llega con otro tipo se ignora (igual que antes de tipar los argumentos). */
const optionalText = z.string().optional().catch(undefined);

/**
 * Argumentos de herramienta que el guard inspecciona (los mismos nombres en OpenCode y en Claude Code).
 * `looseObject` conserva los demás campos sin tipar ninguno como `any`.
 */
export const ToolArgsSchema = z.looseObject({
  command: optionalText,
  filePath: optionalText,
  file_path: optionalText,
  path: optionalText,
  pattern: optionalText,
  include: optionalText,
  glob: optionalText,
  notebook_path: optionalText,
});
export type ToolArgs = z.infer<typeof ToolArgsSchema>;

/** Campos de {@link ToolArgs} que pueden contener una ruta o un patrón. */
const PATH_KEYS = ["filePath", "file_path", "path", "pattern", "include", "glob", "notebook_path"] as const;

/** Rutas relativas a la raíz del proyecto. Prefijo con "/" final = carpeta completa. */
export const FORBIDDEN_DIRS = ["secrets/", "data/", ".git/"] as const;
/** Archivos por nombre base (se permite `.env.example`). */
export const FORBIDDEN_FILE_PATTERNS = [/^\.env(\..+)?$/] as const;
export const ALLOWED_EXCEPTIONS = [".env.example"] as const;

function toRelative(p: string, root: string): string | null {
  if (!p || p.includes("\0")) {
    return null;
  }
  const abs = resolve(root, p); // si `p` es absoluta, `resolve` la respeta
  // Si existe, resolvemos enlaces simbólicos para que un symlink no esquive la regla.
  let real = abs;
  try {
    if (existsSync(abs)) {
      real = realpathSync(abs);
    }
  } catch {
    /* sin acceso: usamos la ruta lógica */
  }
  const rel = relative(realpathOrSelf(root), real);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    // fuera del proyecto: otro control lo decide
    return null;
  }
  return rel.split(sep).join("/");
}

function realpathOrSelf(p: string): string {
  try {
    return realpathSync(p);
  } catch {
    return resolve(p);
  }
}

/** ¿Esta ruta (absoluta o relativa) cae en una zona prohibida? */
export function isForbiddenPath(p: string, root: string): boolean {
  const rel = toRelative(p, root);
  if (rel === null) {
    return false;
  }
  const segments = rel.split("/");
  const base = segments[segments.length - 1] ?? "";
  if ((ALLOWED_EXCEPTIONS as readonly string[]).includes(base)) {
    return false;
  }
  if (FORBIDDEN_DIRS.some((d) => rel === d.slice(0, -1) || rel.startsWith(d))) {
    return true;
  }
  // `.env`, `.env.local`, … en cualquier subcarpeta
  return segments.some(
    (s) => FORBIDDEN_FILE_PATTERNS.some((re) => re.test(s)) && !ALLOWED_EXCEPTIONS.includes(s as never),
  );
}

/** Trozos de una línea de shell que podrían ser rutas (mejor esfuerzo, sin interpretar el shell). */
export function shellTokens(command: string): string[] {
  return command
    .split(/[\s;|&<>()`'"=,]+/)
    .map((t) => t.replace(/^\$\{?PWD\}?\//, "./").replace(/^~\//, "/__home__/"))
    .filter(Boolean);
}

/** Devuelve el motivo del bloqueo, o `null` si la llamada puede seguir. */
export function checkToolCall(tool: string, args: ToolArgs, root: string): string | null {
  const name = tool.toLowerCase();
  const deny = (what: string) =>
    `Bloqueado por la política del proyecto: '${what}' está en una zona prohibida (secretos, datos locales o .git). ` +
    `No intentes leerla por otro medio; si la necesitas, pídele permiso explícito a la persona.`;

  if (name === "bash") {
    const hit = shellTokens(args.command ?? "").find((t) => isForbiddenPath(t, root));
    if (hit) {
      return deny(hit);
    }
    return null;
  }

  // Herramientas de archivos (read, edit, write, glob, grep, list; en Claude Code: Read, Edit, …):
  // revisamos cualquier argumento de texto con aspecto de ruta o patrón.
  for (const key of PATH_KEYS) {
    const v = args[key];
    if (v === undefined) {
      continue;
    }
    // Un patrón como "secrets/**" o "**/.env*" también cuenta: probamos la ruta tal cual y sin comodines finales.
    const literal = v.replace(/\*+.*$/, "").replace(/\/+$/, "");
    if (isForbiddenPath(v, root) || (literal && isForbiddenPath(literal, root)) || /(^|\/)\.env(\.)?\*/.test(v)) {
      return deny(v);
    }
  }
  return null;
}
