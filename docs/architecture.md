# Arquitectura

Organización **por feature** (FDD): el código se agrupa por lo que la biblioteca hace, no por tipo de archivo. Cada área de negocio de `docs/features.md` es una carpeta en `app/features/`. Decisión en `docs/adr/0001-arquitectura-por-features.md`.

## Mapa del proyecto

Todo el código vive en `app/` (no hay `src/`). El alias `@/…` apunta a `app/`; `@/tests/…` apunta a `tests/`. Las carpetas de abajo **se crean al construir cada feature**; hoy solo existen las páginas base.

```
app/                     Next.js App Router
  api/…/route.ts           rutas HTTP: validan con Zod, llaman al servicio, traducen errores
  page.tsx, login/, …      páginas: leen la petición y componen componentes de `ui/`
  globals.css, layout.tsx   estilos globales (tokens de la paleta) y layout raíz
  features/              Una carpeta por área de negocio
    container.ts           raíz de composición: el único lugar que conecta las features entre sí
    <feature>/
      schema.ts                contrato Zod de la feature (solo el orquestador lo cambia)
      server/                  reglas de negocio y persistencia
        *-service.ts             servicios (reglas de negocio)
        repository.ts            puertos (interfaces) y tipos de registro
        repository.memory.ts     implementación en memoria (pruebas)
        repository.firestore.ts   implementación Firestore (real, ADR-0003); valida cada documento con Zod
      ui/                      componentes de React de la feature
      tests/                   pruebas de la feature (Vitest)
  shared/                Lo que usan varias features; nunca depende de ellas
    schema.ts                contrato común
    server/                  errores de dominio, HTTP, sesión, clientes de Firebase y validación del entorno
    ui/                      componentes comunes
    tests/                   pruebas de lo común
tests/                   Punto de entrada de Vitest: `helpers/` (ayudantes compartidos) y `project/` (guard, agentes, contratos, paleta)
scripts/                 Herramientas de desarrollo: reglas propias de ESLint y los scripts que cree cada feature
docs/                    Documentación (features, specs, ADR, notas de entrega, reglas de frontend)
.agents/ .claude/ .opencode/   Configuración de los agentes (ADR-0006)
```

`features/` y `shared/` no contienen `page` ni `route`, así que Next no las trata como rutas.

## Flujo de una petición

```
Navegador ──▶ ruta o página ──▶ servicio (features/x/server) ──▶ repositorio ──▶ Firestore / Vercel Blob
               valida (Zod)      reglas de negocio                 solo guarda
               traduce errores                                     y consulta
```

La ruta o página obtiene el servicio de `@/features/container`; nunca construye repositorios ni importa el `server/` de una feature.

## Fronteras (las vigila `npm run lint`)

| Desde | Puede importar | No puede importar |
| --- | --- | --- |
| `shared/**` | `shared/**` | `features/` |
| `features/x/schema.ts` | `shared/schema` | `server/`, `ui/`, el contenedor |
| `features/x/server/**` | su propia feature (ruta relativa), `shared/`, los `schema.ts` de otras | `ui/`, el contenedor, el `server/` de otra feature |
| `features/x/ui/**` | su propia feature, `shared/`, `schema.ts` y `ui/` de otras | `server/`, el contenedor, `server-only` |
| rutas y páginas (`app/` salvo `features/` y `shared/`) | `features/container`, `shared/`, `features/*/schema` y `features/*/ui` | `features/*/server/` (se llega por el contenedor) |
| `features/container.ts` | todo | — |

**Comunicación entre features.** Cuando una feature necesita algo de otra, declara un **puerto propio** con lo mínimo que usa y la otra lo cumple por estructura; `app/features/container.ts` los conecta.

## Patrones de diseño

| Patrón | Dónde | Para qué |
| --- | --- | --- |
| Repository | `app/features/*/server/repository*.ts` | Cambiar Firestore por memoria (pruebas) sin tocar los servicios |
| Service layer | `app/features/*/server/*-service.ts` | Un lugar para cada regla de negocio |
| Dependency Injection | `createXService(deps)` | Servicios probables y sin globales |
| Ports (consumidor) | el `repository.ts` de la feature que consume | Desacoplar features sin importarse entre sí |
| Contratos Zod primero | `app/features/*/schema.ts`, `app/shared/schema.ts` | Backend, frontend y pruebas dependen del mismo acuerdo |

Otros patrones (Strategy, Factory…) se adoptan cuando una spec los pida.

## Cache Components

`next.config.ts` activa `cacheComponents`. Consecuencias:
- No se usa `export const dynamic` ni `revalidate`.
- Lo que lee la petición (`cookies()`, `searchParams`) va dentro de un `<Suspense>`; el título y la estructura de la página se prerenderizan y el contenido dinámico llega por streaming.
- En un `catch` que envuelve APIs de Next se llama a `unstable_rethrow(error)` antes de manejar el error.

## Mapa para agentes

| Agente | Zona |
| --- | --- |
| backend | `app/features/*/server/**`, `app/features/container.ts`, `app/shared/server/**`, `app/api/**`, `scripts/*.ts` (no `scripts/eslint/`) |
| frontend | `app/features/*/ui/**`, `app/shared/ui/**`, rutas y páginas de `app/` (sin `api`, `features` ni `shared`) |
| tests | `tests/**`, `app/features/*/tests/**`, `app/shared/tests/**` |
| security | solo lectura |
| orquestador | `app/features/*/schema.ts`, `app/shared/schema.ts`, `docs/**` y la configuración de agentes |

## Decisiones

Ver `docs/adr/`. Un ADR por decisión que alguien podría querer revertir.
