# ADR-0001 · Arquitectura por features (FDD)

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Quién decide:** la persona (profesor del proyecto)

## Contexto
Varios agentes trabajan en paralelo. Necesitan fronteras claras para no pisarse, que cada pieza se pueda probar sola y que el código refleje lo que hace la biblioteca (`docs/features.md`), no solo el tipo de archivo.

## Decisión
Se organiza por **feature**: una carpeta por área de negocio y, dentro, una subcarpeta por zona de agente. Todo el código vive en `app/` (no hay `src/`); las carpetas `features/` y `shared/` no definen rutas porque no contienen `page` ni `route`.

```
app/
  api/…/route.ts           rutas HTTP (pegamento fino)                    → backend
  page.tsx, login/, …      páginas y estilos globales                     → frontend
  features/<feature>/
    schema.ts              contrato Zod                                   → orquestador
    server/                servicios y repositorios                       → backend
    ui/                    componentes de React                           → frontend
    tests/                 pruebas de la feature                          → tests
  features/container.ts    raíz de composición: conecta las features      → backend
  shared/                  contrato común (schema.ts) y server/ (errores, HTTP, sesión, Firebase); nunca importa features
tests/                     punto de entrada de Vitest: ayudantes compartidos y pruebas del proyecto
```

- Flujo: ruta o página → servicio → repositorio. Las reglas de negocio viven solo en los servicios (`server/*-service.ts`); las rutas validan con Zod y traducen errores; los repositorios solo guardan y consultan.
- Cada repositorio es una interfaz (`repository.ts`) con una implementación en memoria (pruebas) y otra de Firestore (real, ADR-0003).
- Las áreas son `accounts`, `catalog`, `loans` y `reader`. Las features **no se importan entre sí**: se comunican con **puertos que declara el consumidor** y se conectan en `app/features/container.ts`.
- El alias `@/*` apunta a `app/`; `@/tests/*` apunta a la carpeta `tests/` de la raíz.
- Las reglas de dependencia (`docs/architecture.md`) se hacen cumplir con `no-restricted-imports` en `eslint.config.mjs`.

## Alternativas consideradas
- Capas técnicas (`contracts/`, `services/`, `repositories/`, `components/`): una feature queda repartida en cinco carpetas y los agentes se pisan en carpetas compartidas.
- Lógica en las rutas (Route Handlers): más rápido de escribir, pero imposible de probar sin HTTP.
- Un paquete por feature (monorepo): ceremonia excesiva para una aplicación de este tamaño.
- Arquitectura hexagonal completa: más ceremonia de la que justifica el proyecto.
- Carpeta `src/`: añade un nivel sin aportar; `app/` ya es la carpeta del código.
- Pruebas en un `tests/<feature>/` espejo: la feature queda repartida de nuevo. Cada feature lleva sus pruebas.

## Consecuencias
- Cada feature se puede leer, probar y delegar de forma aislada; las zonas de los agentes son subcarpetas.
- Hay un `schema.ts` por feature: el contrato es solo del orquestador.
- Cada repositorio real recibe sus clientes de Firebase por parámetro desde el contenedor; ninguno crea estructuras al arrancar, así que el orden de arranque no importa.
- Pequeña duplicación aceptada: los puertos mínimos que cada feature declara para lo que necesita de otra.
- El lint no puede impedir que una feature importe una página por ruta relativa; esa regla es de revisión.
