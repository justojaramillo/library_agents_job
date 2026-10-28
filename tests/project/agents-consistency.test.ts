import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(__dirname, "../..");
const body = (file: string) =>
  readFileSync(file, "utf8")
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .trim();

describe("agentes: OpenCode y Claude Code deben decir lo mismo", () => {
  const shared = ["backend", "frontend", "tests", "security"];

  it.each(shared)("el cuerpo de '%s' es idéntico en ambos harness", (name) => {
    const oc = join(root, ".opencode/agents", `${name}.md`);
    const cc = join(root, ".claude/agents", `${name}.md`);
    expect(existsSync(oc) && existsSync(cc)).toBe(true);
    expect(body(oc)).toBe(body(cc));
  });

  it("el agente de seguridad es de solo lectura en ambos", () => {
    const oc = readFileSync(join(root, ".opencode/agents/security.md"), "utf8");
    const cc = readFileSync(join(root, ".claude/agents/security.md"), "utf8");
    expect(oc).toMatch(/edit: deny/);
    expect(cc).not.toMatch(/tools:.*(Edit|Write)/);
  });
});

describe("skills: nombre = carpeta y descripción presente", () => {
  const dir = join(root, ".claude/skills");
  it.each(readdirSync(dir))("%s", (skill) => {
    const text = readFileSync(join(dir, skill, "SKILL.md"), "utf8");
    expect(text).toMatch(new RegExp(`^---\\nname: ${skill}\\ndescription: .{20,}`));
    expect(skill).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });
});
