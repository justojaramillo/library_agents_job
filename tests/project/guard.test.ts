import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { checkToolCall, isForbiddenPath } from "../../.agents/guard/rules";

const root = mkdtempSync(join(tmpdir(), "guard-"));
mkdirSync(join(root, "secrets"));
mkdirSync(join(root, "src"));
writeFileSync(join(root, "secrets", "api-key.txt"), "FAKE");
writeFileSync(join(root, ".env.local"), "FAKE=1");
symlinkSync(join(root, "secrets"), join(root, "src", "atajo"));

describe("isForbiddenPath", () => {
  it("bloquea secrets/, .env*, data/ y .git/", () => {
    for (const p of [
      "secrets/api-key.txt",
      "./secrets",
      ".env",
      ".env.local",
      "src/.env.production",
      "data/library.db",
      ".git/config",
    ]) {
      expect(isForbiddenPath(p, root), p).toBe(true);
    }
  });
  it("bloquea rutas absolutas y con ../", () => {
    expect(isForbiddenPath(join(root, "secrets/x"), root)).toBe(true);
    expect(isForbiddenPath("src/../secrets/x", root)).toBe(true);
  });
  it("bloquea un enlace simbólico que apunta a una zona prohibida", () => {
    expect(isForbiddenPath("src/atajo/api-key.txt", root)).toBe(true);
  });
  it("permite código, docs y .env.example", () => {
    for (const p of [
      "src/app/page.tsx",
      "docs/features.md",
      ".env.example",
      "node_modules/next/dist/docs/index.md",
      "secrets/README.md".replace("secrets", "docs"),
    ]) {
      expect(isForbiddenPath(p, root), p).toBe(false);
    }
  });
});

describe("checkToolCall", () => {
  it("bloquea read/edit/write sobre zonas prohibidas (OpenCode y Claude Code)", () => {
    expect(checkToolCall("read", { filePath: "secrets/api-key.txt" }, root)).toMatch(/Bloqueado/);
    expect(checkToolCall("Read", { file_path: join(root, ".env.local") }, root)).toMatch(/Bloqueado/);
    expect(checkToolCall("edit", { filePath: ".env" }, root)).toMatch(/Bloqueado/);
  });
  it("bloquea glob/grep dirigidos a zonas prohibidas", () => {
    expect(checkToolCall("glob", { pattern: "secrets/**" }, root)).toMatch(/Bloqueado/);
    expect(checkToolCall("grep", { pattern: "KEY", path: "secrets" }, root)).toMatch(/Bloqueado/);
    expect(checkToolCall("glob", { pattern: "**/.env*" }, root)).toMatch(/Bloqueado/);
  });
  it("bloquea comandos bash que mencionan rutas prohibidas", () => {
    for (const cmd of [
      "cat secrets/api-key.txt",
      "cat ./.env.local",
      "type 'secrets/x' | head",
      "cp data/library.db /tmp",
      "echo hi && cat $PWD/.env",
    ]) {
      expect(checkToolCall("bash", { command: cmd }, root), cmd).toMatch(/Bloqueado/);
    }
  });
  it("permite leer .env.example (plantilla sin secretos) pero no comodines que abarquen .env reales", () => {
    expect(checkToolCall("read", { filePath: ".env.example" }, root)).toBeNull();
    expect(checkToolCall("Read", { file_path: join(root, ".env.example") }, root)).toBeNull();
    expect(checkToolCall("glob", { pattern: ".env.*" }, root)).toMatch(/Bloqueado/);
  });
  it("deja pasar el trabajo normal", () => {
    expect(checkToolCall("read", { filePath: "src/app/page.tsx" }, root)).toBeNull();
    expect(checkToolCall("bash", { command: "npm test && cat .env.example" }, root)).toBeNull();
    expect(checkToolCall("grep", { pattern: "LoanService", path: "src" }, root)).toBeNull();
    expect(checkToolCall("glob", { pattern: "src/**/*.ts" }, root)).toBeNull();
  });
  it("LIMITACIÓN conocida: un comodín en bash esquiva la barrera (por eso hay defensa en profundidad)", () => {
    expect(checkToolCall("bash", { command: "cat sec*/api-key.txt" }, root)).toBeNull();
  });
});
