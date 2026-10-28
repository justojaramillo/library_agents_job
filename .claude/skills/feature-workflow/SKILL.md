---
name: feature-workflow
description: Flujo del orquestador para construir una feature con varios agentes (especificar, contrato, dividir por zonas, delegar, integrar, revisar, registrar).
---

# Flujo de una feature con varios agentes

1. **Elegir** la feature en `docs/features.md` (FDD: una feature = una acción pequeña con resultado visible).
2. **Especificar** con la skill `write-spec`. Sin especificación aprobada no se delega.
3. **Contrato:** revisar el `schema.ts` de la feature y `app/shared/schema.ts`. Cambios al contrato los hace el orquestador, antes de delegar.
4. **Dividir por zonas** (nadie edita fuera de su zona):

   | Agente | Zona |
   | --- | --- |
   | backend | `app/features/*/server/**`, `app/shared/server/**`, `app/features/container.ts`, `app/api/**` |
   | frontend | `app/features/*/ui/**`, `app/shared/ui/**`, rutas y páginas de `app/` (sin `api`, `features` ni `shared`) |
   | tests | `tests/**`, `app/features/*/tests/**`, `app/shared/tests/**` |
   | security | solo lectura |
   | orquestador | `app/features/*/schema.ts`, `app/shared/schema.ts`, `docs/**`, configuración de agentes |

5. **Delegar** con: ruta de la especificación, zona, criterio de terminado y comando de verificación. Recuerda siempre las reglas: `AGENTS.md → Reglas de código` (cero `any`/`unknown`, sin ternarios, funciones ≤ 100 líneas, clases ≤ 10 funciones, `snake_case` en el cable) y, si hay UI, `docs/frontend-rules.md` (360/768/1024 px, HTML semántico, paleta azul y blanco, WCAG 2.1 AA).
6. **Orden recomendado:** backend → (frontend ∥ tests) → integrar → security. Paralelizar solo lo que no comparte archivos.
7. **Integrar:** `npm run check` (lint + tipos + pruebas) y, si hay UI, `npm run build`.
8. **Revisar:** pedir informe a `security`; aplicar correcciones con el agente dueño de la zona; repetir hasta "Aprobado".
9. **Registrar:** notas de entrega en `docs/handoffs/<feature>.md`; si hubo una decisión de arquitectura, un ADR en `docs/adr/`.
