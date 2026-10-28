/**
 * Regla local de ESLint: una clase no puede tener más de `max` funciones (por defecto 10).
 * Cuenta métodos (incluido el constructor, getters y setters) y propiedades cuyo valor es una función.
 * No hay una regla equivalente en ESLint ni en typescript-eslint, y así no se añade una dependencia (AGENTS.md, regla 6).
 */
const FUNCTION_VALUES = new Set(["ArrowFunctionExpression", "FunctionExpression"]);

function isFunctionMember(member) {
  if (member.type === "MethodDefinition") {
    return true;
  }
  return member.type === "PropertyDefinition" && FUNCTION_VALUES.has(member.value?.type);
}

const rule = {
  meta: {
    type: "suggestion",
    schema: [{ type: "object", properties: { max: { type: "integer", minimum: 1 } }, additionalProperties: false }],
    messages: {
      tooMany:
        "La clase tiene {{count}} funciones; el máximo permitido es {{max}}. Divídela en clases o funciones más pequeñas.",
    },
  },
  create(context) {
    const max = context.options[0]?.max ?? 10;
    return {
      ClassBody(node) {
        const count = node.body.filter(isFunctionMember).length;
        if (count > max) {
          context.report({ node: node.parent, messageId: "tooMany", data: { count: String(count), max: String(max) } });
        }
      },
    };
  },
};

const localRules = { rules: { "max-methods-per-class": rule } };

export default localRules;
