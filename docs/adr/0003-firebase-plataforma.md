# ADR-0003 · Firebase (Authentication y Firestore) y Vercel Blob privado

- **Estado:** Aceptada
- **Fecha:** 2026-10-24
- **Quién decide:** la persona (profesor del curso)

## Contexto
La aplicación necesita identidades con correo y contraseña, persistencia de datos y, más adelante, almacenamiento de archivos. Se quiere usar solo planes gratuitos. Cloud Storage de Firebase exige el plan de pago por uso (Blaze), así que los archivos van en Vercel Blob. Regla 6 de `AGENTS.md`: este ADR es la justificación escrita de las dependencias que nombra.

## Decisión
| Necesidad | Servicio |
| --- | --- |
| Credenciales y correos | **Firebase Authentication** (correo y contraseña, plan Spark). La app **nunca** guarda ni ve una contraseña. |
| Datos | **Firestore** (plan Spark) |
| Archivos | **Vercel Blob con un store privado** (se conecta cuando una feature lo necesite; el archivo nunca se sirve por URL pública) |

Reglas de uso:
- **Todo acceso a datos pasa por el servidor.** Firestore se usa con el SDK de administración (`firebase-admin`) y `firestore.rules` niega toda lectura y escritura directa del cliente (`allow read, write: if false`). El SDK de cliente (`firebase`) se usa solo para lo que debe ocurrir en el navegador (ingreso con Authentication).
- **La identidad sale de la sesión verificada en el servidor**, nunca de lo que mande el cliente (regla 4 de `AGENTS.md`).
- **Repositorios:** cada feature mantiene `repository.ts` (puertos asíncronos), `repository.memory.ts` (pruebas) y `repository.firestore.ts` (real). Las pruebas usan las implementaciones en memoria y no tocan la red ni el proyecto real de Firebase.
- **Dependencias:** `firebase-admin` (servidor), `firebase` (cliente, solo Authentication) y, cuando haga falta, `@vercel/blob` (versión 2.3 o superior, para stores privados).
- **Secretos y variables:** los crea la persona en el archivo de entorno de la raíz; los agentes no lo leen ni lo crean. `.env.example` lista los nombres. La clave de la cuenta de servicio nunca se sube a git ni se pega en un documento.

## Consecuencias
- Las contraseñas, el hash y el envío de correos salen del código de la app.
- Firestore no tiene restricciones únicas ni `CHECK`: la unicidad y los valores válidos se garantizan en el servicio, con transacciones y con los esquemas Zod; los repositorios de Firestore deben leer y validar cada documento con Zod antes de devolverlo.
- Dos proveedores, dos paneles y dos juegos de límites. Spark apaga el producto el resto del mes al pasar la cuota diaria de Firestore; Blob bloquea el acceso (sin cobrar) al pasar sus límites mensuales.
- El plan Hobby de Vercel es para uso no comercial, suficiente para un proyecto de clase.
- Las consultas de Firestore son más limitadas que SQL (`LIKE`, uniones): lo que no se pueda consultar se resuelve filtrando en el servidor y, si el volumen crece, con otro ADR.
