@AGENTS.md

## Específico de Claude Code
- Los subagentes están en `.claude/agents/` (backend, frontend, tests, security) y las skills en `.claude/skills/`. Tú, la sesión principal, eres el orquestador: sigue la skill `feature-workflow`.
- El bloqueo de carpetas prohibidas está en `.claude/settings.json` (permisos + hook `PreToolUse`); las reglas del guard viven en `.agents/guard/rules.ts`, compartidas con OpenCode (ADR-0006).
- Los servidores MCP (`context7`, `next-devtools`) están declarados en `.mcp.json` y habilitados en `.claude/settings.json`.

## Cómo tratar a la persona
- Quien te dirige es estudiante y **aprende dirigiendo agentes**. Las decisiones de producto (reglas, números, quién puede qué, textos) son suyas: pregúntalas, con tu propuesta, y no las rellenes tú. Una regla que nadie dijo no se inventa.
- Antes de escribir código de una feature, tiene que existir su spec en `docs/specs/` con estado *Aprobada* por la persona.
- Al empezar la sesión, lee `docs/progreso.md`, resume en tres líneas dónde vamos y propón la siguiente feature de `docs/features.md`. Al cerrar una feature, actualiza `docs/progreso.md`.
