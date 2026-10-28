# ADR-0006 · Dónde vive la configuración de los agentes

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Quién decide:** la persona (profesor del proyecto)

## Contexto
La raíz del proyecto mezcla código de la aplicación, herramientas de desarrollo, documentación y configuración de dos harness de agentes (Claude Code y OpenCode). Cada cosa debe vivir donde corresponde.

## Decisión
Criterio: **lo que solo existe para que trabajen los agentes va en la configuración de agentes; lo que es del producto o del equipo, en la raíz.**

| Qué | Dónde | Por qué |
| --- | --- | --- |
| Reglas del guard de carpetas prohibidas | `.agents/guard/rules.ts` | Solo existe para los agentes y lo comparten los dos harness; ninguno tiene un directorio «común», así que se usa `.agents/` |
| Hook de Claude Code y plugin de OpenCode | `.claude/hooks/`, `.opencode/plugins/` | Lo exige cada harness; importan `../../.agents/guard/rules` |
| Agentes y skills | `.claude/agents`, `.opencode/agents`, `.claude/skills` | Lo exige cada harness (OpenCode también lee `.claude/skills`) |
| Permisos y MCP habilitados | `.claude/settings.json`, `opencode.json`, `.mcp.json` | Un solo archivo compartido por el equipo; `settings.local.json` es personal |
| Instrucciones para agentes | `AGENTS.md` y `CLAUDE.md` (raíz) | Convención de ambos harness |
| Regla propia de ESLint (máx. 10 funciones por clase) y scripts de desarrollo | `scripts/` | Son herramientas de desarrollo del proyecto, no de los agentes |
| Documentación del producto: features, arquitectura, specs, ADR, reglas de frontend | `docs/` | La lee el equipo, no solo los agentes |
| Notas de entrega de los agentes | `docs/handoffs/` | Es un registro del proyecto y lo piden las skills |

Los secretos viven solo en el archivo de entorno de la raíz (nunca en una carpeta de agentes).

## Alternativas consideradas
- Guard en la raíz (`tools/`): confunde a quien busca herramientas de la aplicación.
- Duplicar el guard dentro de `.claude/` y `.opencode/`: dos copias que se desincronizan.
- Documentación bajo la configuración de agentes: la documentación es del producto, no del agente.

## Consecuencias
- Raíz con un solo propósito por carpeta: `app/` (todo el código), `tests/` (punto de entrada de las pruebas), `scripts/` (desarrollo), `docs/` (documentación) y tres carpetas ocultas de agentes.
- `.agents/` queda como lugar natural para futuras piezas compartidas entre harness.
- Si un harness cambia su convención, solo hay que tocar su hook o plugin, no las reglas.
