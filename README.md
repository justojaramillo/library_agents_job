# Biblioteca de préstamos

Proyecto del curso de Tendencias (desarrollo con agentes de IA). Una biblioteca de préstamos de libros que **construyes tú, feature por feature, dirigiendo a un equipo de agentes** (orquestador, backend, frontend, pruebas y seguridad). Next.js App Router (Cache Components), TypeScript, Tailwind, Firebase (Authentication y Firestore), Vercel Blob, Zod y Vitest.

El repositorio trae el método, las reglas y las puertas de calidad. **No trae ninguna feature, ninguna especificación ni ninguna regla de negocio**: tú las decides respondiendo las preguntas que el agente te haga al escribir cada especificación.

## Empieza aquí
1. Lee `docs/empezar.md` (requisitos, Firebase, archivo de entorno y el primer mensaje).
2. `npm install` y `npm run check` (debe quedar en verde antes de empezar).
3. Abre un harness en esta carpeta: `claude` (Claude Code) o `opencode`.

## Comandos
| Comando | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo en <http://localhost:3000> |
| `npm run check` | Formato + lint + tipos + pruebas (definición de «terminado») |
| `npm run check:full` | Lo anterior más `npm run build` |
| `npm run format` | Aplica el formato (Biome, solo formateador) |
| `npm run lint` | Reglas de código y fronteras de la arquitectura (ESLint) |
| `npm test` | Pruebas (Vitest) |

## Dónde está qué
```
AGENTS.md, CLAUDE.md     Reglas para los agentes (lo primero que leen)
docs/                    features.md (la lista), empezar.md, progreso.md, architecture.md, frontend-rules.md,
                         adr/ (decisiones), specs/ (las escribes tú, feature a feature), handoffs/ (notas de entrega)
app/                     Todo el código (hoy solo la página base y los estilos con la paleta)
tests/project/           Pruebas del proyecto: guard, agentes, estilo de contratos y contraste de la paleta
.claude/ .opencode/ .agents/   Agentes, skills y el guard que bloquea .env, data/ y secrets/
```

## Cómo se trabaja
1. Eliges la siguiente feature de `docs/features.md`.
2. El agente escribe su especificación (`write-spec`), **te hace las preguntas abiertas** y la dejas en *Aprobada* tú, no el agente.
3. El orquestador fija el contrato y delega por zonas (`feature-workflow`); `npm run check` en verde.
4. `security` revisa en solo lectura; se registra la nota de entrega y se actualiza `docs/progreso.md`.

Las reglas de código están en `AGENTS.md` y las de interfaz en `docs/frontend-rules.md`.
