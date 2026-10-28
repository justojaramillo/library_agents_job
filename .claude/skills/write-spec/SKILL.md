---
name: write-spec
description: Convierte una feature de docs/features.md en una especificación verificable en docs/specs/, preguntando a la persona cada decisión pendiente. Úsala antes de implementar cualquier feature (SDD).
---

# Escribir una especificación (SDD)

Una especificación es el contrato entre la persona y los agentes: lo que NO está escrito aquí, los agentes lo inventan.

**Regla de oro:** nunca decidas por la persona una regla de negocio (plazos, cupos, límites, montos, roles, textos de error, quién puede qué). Si la persona no lo ha dicho, es una pregunta. Puedes proponer una opción, pero la decisión es suya.

## Pasos
1. Lee la feature en `docs/features.md`, `docs/architecture.md`, los contratos que ya existan (`app/features/<feature>/schema.ts`, `app/shared/schema.ts`) y las specs ya aprobadas en `docs/specs/` (para no contradecirlas).
2. Copia `docs/specs/_template.md` a `docs/specs/<id>-<nombre-en-kebab>.md` y escribe el borrador con lo que sí se deduce de la feature. Lo que no se deduce va a **Preguntas abiertas**, numeradas.
3. **Pregunta a la persona antes de dar la spec por buena.** Haz las preguntas abiertas en grupos de máximo 4 (usa la herramienta de preguntas del harness si la tiene; si no, en el chat). Cada pregunta lleva tu propuesta y por qué, y espera la respuesta. Anota cada respuesta en la spec (en la sección de la regla afectada y en Preguntas abiertas con la respuesta) y revisa si abre preguntas nuevas.
4. Completa cada sección con reglas **comprobables** (un número, un estado, un error concreto). Evita «rápido», «seguro», «amigable».
5. Cada regla de negocio debe tener al menos un criterio de aceptación en formato Dado/Cuando/Entonces.
6. Marca el estado `Borrador`. Solo la persona lo cambia a `Aprobada`: pídeselo al final y no delegues nada antes.

## Revisión rápida antes de entregar
- ¿Quedó alguna pregunta abierta sin respuesta de la persona?
- ¿Un agente de pruebas podría escribir las pruebas leyendo solo este archivo?
- ¿Están los errores esperados (qué clase de error y cuándo)?
- ¿Está dicho quién SÍ y quién NO puede hacer la operación?
- ¿Están los bordes (0, 1, límite, límite + 1, vacío)?
