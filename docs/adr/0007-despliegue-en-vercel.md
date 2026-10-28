# ADR-0007 · Despliegue en Vercel y compatibilidad de módulos

- **Estado:** Aceptada
- **Fecha:** 2026-10-25
- **Quién decide:** la persona (profesor del curso)

## Contexto
La aplicación se publica en Vercel (plan Hobby, uso no comercial) desde la rama `main` de GitHub. El servidor de Vercel no ejecuta el código igual que un Node local: carga `firebase-admin` como módulo externo y no puede hacer `require()` de módulos ESM. `firebase-admin/auth` usa `jwks-rsa`, que por defecto trae `jose` v6 (solo ESM), y todas las páginas que tocan Firebase fallan con `ERR_REQUIRE_ESM` aunque en local funcionen.

## Decisión
- **Node 24.x** fijado en `package.json` (`"engines": { "node": "24.x" }`).
- **`jose` v4 (CommonJS) solo para `jwks-rsa`**, con un `overrides` de npm: `"overrides": { "jwks-rsa": { "jose": "^4.15.9" } }`. Otro override fija `"@grpc/grpc-js": "^1.14.6"` (vulnerabilidades del cliente de Firestore).
- **Comprobación local equivalente a Vercel:** `NODE_OPTIONS=--no-experimental-require-module npx next start` tras `npm run build`. Si una ruta que use Firebase responde 200 así, el despliegue no fallará por esto.
- **Scripts de Node fuera de Next:** se ejecutan con `tsx --conditions=react-server`, porque importan módulos con `import "server-only"`.
- **Variables de entorno:** las de `.env.example` se crean también en *Settings → Environment Variables* de Vercel, marcadas para Production; las `NEXT_PUBLIC_*` se leen al compilar, así que un cambio exige volver a desplegar. `FIREBASE_PRIVATE_KEY` puede llegar con comillas envolventes y con `\n` literales: hay que normalizarla antes de usarla.

## Consecuencias
- Cualquier dependencia nueva que sea solo ESM y la cargue una librería CommonJS externa puede reproducir el mismo error: se detecta con la comprobación local de arriba antes de desplegar.
- Los overrides son parte de la configuración: hay que revisarlos al actualizar `firebase-admin`.
- El plan Hobby limita el uso a fines no comerciales.
