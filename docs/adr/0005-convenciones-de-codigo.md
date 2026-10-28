# ADR-0005 · Convenciones de código y snake_case en el cable

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Quién decide:** la persona (profesor del proyecto)

## Contexto
Varios agentes escriben código en paralelo. Sin reglas mecánicas, cada uno decide su estilo y las revisiones se llenan de comentarios de forma.

## Decisión
Reglas verificadas por `npm run lint` (ver `AGENTS.md → Reglas de código`):
cero `any` y cero `unknown` (explícitos e implícitos), sin ternarios ni `if` sin llaves, funciones de ≤ 100 líneas, clases de ≤ 10 funciones, `camelCase` en funciones y `PascalCase` en clases, interfaces y tipos, y `snake_case` en todo campo de petición o respuesta entre backend y frontend.

Cómo se hace cumplir cada una:
| Regla | Mecanismo |
| --- | --- |
| Sin `any` | `noImplicitAny` + `@typescript-eslint/no-explicit-any` + `no-unsafe-*` (con información de tipos) |
| Sin `unknown` | `no-restricted-syntax` sobre `TSUnknownKeyword` y sobre `z.unknown()`/`z.any()` |
| Sin `if` abreviados | `no-ternary` + `curly: all` |
| Función ≤ 100 líneas | `max-lines-per-function` (sin blancos ni comentarios; desactivada en las carpetas de pruebas, donde `describe` agrupa casos) |
| Clase ≤ 10 funciones | regla local `scripts/eslint/max-methods-per-class.mjs` (sin dependencias nuevas) |
| Nombres | `@typescript-eslint/naming-convention` |
| `snake_case` en el cable | `tests/project/contracts-style.test.ts` revisa las claves de `app/shared/schema.ts` y de los `app/features/*/schema.ts` |

«camelCase para clases e interfaces» se interpreta como la convención habitual de TypeScript: `PascalCase` (UpperCamelCase) para clases, interfaces y tipos, y `camelCase` para funciones y variables.

## Alternativas consideradas
- Convención solo por escrito: los agentes la olvidan; lo que no falla en `check` no se cumple.
- Prettier/Biome: no cubre estas reglas y añadiría una dependencia.
- Mapear `camelCase` ↔ `snake_case` en cada ruta: más código y más fallos; mejor que el contrato ya sea el formato del cable.

## Consecuencias
- Los tipos de los `schema.ts` son `snake_case` y se usan tal cual en servicios y repositorios (`loan.book_id`). Los registros internos de repositorio (un campo interno como `MemberRecord.createdAt`) pueden seguir en `camelCase` porque nunca viajan por el cable.
- El `any` que devuelven librerías (`res.json()`, `JSON.parse`) se valida **en el mismo punto de la llamada** con Zod (`Esquema.parse(await res.json())`): `any` → parámetro de Zod → tipo concreto, sin escribir `unknown` ni guardar el valor en una variable sin tipo. `no-unsafe-argument` admite pasar `any` a ese parámetro.
- Un `catch (error)` entrega el error sin tipo; para pasarlo a un manejador se usa una función genérica (`handleError<T>(error: T)`) y se estrecha con `instanceof`.
- Los argumentos de las herramientas de los agentes (`.agents/guard/rules.ts`) se tipan con un esquema Zod (`ToolArgsSchema`).
- El lint corre con información de tipos, así que tarda más que uno sin ellos.
