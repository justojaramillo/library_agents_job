# ADR-0002 · Contratos Zod primero

- **Estado:** Aceptada
- **Fecha:** 2026-10-24

## Contexto
Backend, frontend y pruebas los generan agentes distintos. Si cada uno infiere las formas de datos, divergen.

## Decisión
Las formas de datos viven en `app/shared/schema.ts` (común) y `app/features/<feature>/schema.ts` (Zod + tipos TypeScript). Solo el orquestador los modifica; los demás agentes los consumen.

## Alternativas consideradas
- Tipos duplicados por capa: se desincronizan.
- OpenAPI generado: útil con equipos grandes, excesivo aquí.

## Consecuencias
Un cambio de contrato es un evento explícito y revisable. Los esquemas sirven a la vez para validar en el servidor y para tipar en el cliente.
