/// <reference types="vite/client" />
import { describe, expect, it } from "vitest";
import { z } from "zod";

// Todos los contratos del proyecto: app/shared/schema.ts y el schema.ts de cada feature.
// Si todavía no existe ninguno, la lista queda vacía y la prueba no falla.
const sharedModules = import.meta.glob<Record<string, object>>("../../app/shared/schema.ts", { eager: true });
const featureModules = import.meta.glob<Record<string, object>>("../../app/features/*/schema.ts", { eager: true });
const contractModules = { ...sharedModules, ...featureModules };

/** snake_case: minúsculas y dígitos separados por guiones bajos simples (ADR-0005). */
const SNAKE_CASE = /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/;

type JsonNode = z.core.JSONSchema.JSONSchema;
type JsonNodeOrFlag = z.core.JSONSchema._JSONSchema;

/** Todos los sub-esquemas que cuelgan de un nodo, por cada palabra clave que Zod puede generar. */
function childNodes(node: JsonNode): JsonNodeOrFlag[] {
  const children: JsonNodeOrFlag[] = [];
  children.push(...Object.values(node.properties ?? {}));
  children.push(...Object.values(node.patternProperties ?? {}));
  children.push(...Object.values(node.$defs ?? {}));
  children.push(...(node.prefixItems ?? []));
  children.push(...(node.anyOf ?? []));
  children.push(...(node.allOf ?? []));
  children.push(...(node.oneOf ?? []));
  const single = [node.items, node.additionalProperties, node.propertyNames, node.not, node.contains];
  for (const child of single) {
    if (Array.isArray(child)) {
      children.push(...child);
    } else if (child !== undefined) {
      children.push(child);
    }
  }
  return children;
}

/** Recorre un JSON Schema y junta toda clave declarada en «properties», a cualquier profundidad. */
function collectPropertyKeys(node: JsonNodeOrFlag, found: string[]): string[] {
  if (typeof node === "boolean") {
    return found;
  }
  found.push(...Object.keys(node.properties ?? {}));
  for (const child of childNodes(node)) {
    collectPropertyKeys(child, found);
  }
  return found;
}

function keysOfSchema(schema: z.ZodType): string[] {
  const jsonSchema = z.toJSONSchema(schema, { io: "input", unrepresentable: "any" });
  return collectPropertyKeys(jsonSchema, []);
}

function badKeys(keys: string[]): string[] {
  return keys.filter((key) => !SNAKE_CASE.test(key));
}

function exportedSchemas(): [string, z.ZodType][] {
  const schemas: [string, z.ZodType][] = [];
  for (const [file, module] of Object.entries(contractModules)) {
    for (const [name, value] of Object.entries(module)) {
      if (value instanceof z.ZodType) {
        schemas.push([`${file.replace("../../app/", "")} · ${name}`, value]);
      }
    }
  }
  return schemas;
}

describe("Contrato · todas las claves del cable están en snake_case", () => {
  const schemas = exportedSchemas();

  // Con cero contratos (proyecto recién empezado) `it.each` no registra casos y Vitest marcaría la suite como vacía.
  it("descubre los contratos que existan (ninguno al empezar)", () => {
    expect(Object.keys(contractModules).every((file) => file.endsWith("schema.ts"))).toBe(true);
  });

  it.each(schemas)("%s solo tiene claves en snake_case", (_name, schema) => {
    expect(badKeys(keysOfSchema(schema))).toEqual([]);
  });
});

describe("Contrato · la prueba de estilo detecta camelCase", () => {
  it("marca una clave memberId de primer nivel", () => {
    const camel = z.object({ memberId: z.number(), name: z.string() });
    expect(badKeys(keysOfSchema(camel))).toEqual(["memberId"]);
  });

  it("marca una clave en camelCase anidada dentro de un objeto y de una lista", () => {
    const nested = z.object({
      loan: z.object({ loaned_at: z.string(), dueAt: z.string() }),
      items: z.array(z.object({ finCop: z.number() })),
    });
    expect(badKeys(keysOfSchema(nested)).sort()).toEqual(["dueAt", "finCop"]);
  });

  it("no marca un esquema ya escrito en snake_case", () => {
    const clean = z.object({ member_id: z.number(), loan: z.object({ returned_at: z.string().nullable() }) });
    expect(badKeys(keysOfSchema(clean))).toEqual([]);
  });

  it("la expresión rechaza mayúsculas, guiones medios y guiones bajos dobles o finales", () => {
    const invalid = ["memberId", "Member", "member-id", "member__id", "member_", "_member", "1member"];
    for (const key of invalid) {
      expect(SNAKE_CASE.test(key)).toBe(false);
    }
    const valid = ["id", "member_id", "fine_cop", "isbn", "v2_name"];
    for (const key of valid) {
      expect(SNAKE_CASE.test(key)).toBe(true);
    }
  });
});
