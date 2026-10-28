---
name: handoff-note
description: Formato de la nota de entrega que cada agente deja al terminar, para que el orquestador y los demás agentes continúen sin perder contexto.
---

# Nota de entrega (handoff)

Cada subagente empieza sin memoria; la nota es lo único que sobrevive. Guárdala o devuélvela con esta forma, en máximo 15 líneas:

```
## Entrega: <agente> · <feature>
**Hecho:** qué quedó implementado (2-4 viñetas)
**Archivos:** lista de rutas creadas o modificadas
**Cómo verificar:** comando exacto y resultado esperado
**Decisiones:** elecciones no obvias y por qué
**Pendiente / bloqueos:** lo que falta o necesita otra zona (nombra la zona y el archivo)
**Dudas de la especificación:** ambigüedades que encontraste (no las resolviste tú)
```

Reglas: nada de relato de lo que probaste; nada de código pegado (la ruta basta); si algo falló, di el comando y el error exacto.
