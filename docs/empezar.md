# Empezar

## 1. Lo que haces tú (los agentes no pueden)
1. **Node 24.x** y npm (`node -v`), y git. Ver ADR-0007.
2. **Un harness y un modelo** (al menos uno de cada uno):
   - Harness: **Claude Code** (`claude`) u **OpenCode** (`npm i -g opencode-ai`, luego `opencode` y `/connect`).
   - Modelo: Claude, DeepSeek (clave en <https://platform.deepseek.com/api_keys>) o un modelo gratuito de OpenCode Zen. Los gratuitos pueden tener límites o retención de datos: **no envíes datos personales ni secretos**.
3. **Tu propio proyecto de Firebase** (plan Spark, sin tarjeta; nunca uses el de otra persona):
   - *Authentication → Get started → Correo/contraseña* activado.
   - *Firestore Database* creada en modo producción; en *Reglas* pega el contenido de `firestore.rules` (niega todo acceso directo del cliente).
   - En *Authentication → Configuración → Acciones de usuario* desactiva el registro desde el cliente.
   - Registra una app web y copia sus valores a las variables `NEXT_PUBLIC_FIREBASE_*`.
   - En *Configuración → Cuentas de servicio* genera una clave privada y copia sus campos a `FIREBASE_*`. No la pegues en ningún documento ni chat.
4. **Archivo de entorno:** copia `.env.example` a `.env` y llénalo. Los agentes no lo leen ni lo crean (un guard lo bloquea). Cuando F0 esté construida, `npm run check:env` te dirá qué falta sin mostrar valores.
5. **GitHub y Vercel** (cuando tengas algo que desplegar): repositorio propio, proyecto importado en Vercel y las mismas variables en *Settings → Environment Variables* (Production). Para el contenido digital necesitarás más adelante un store de **Vercel Blob privado** conectado al proyecto.

## 2. Verificar la línea base
```bash
npm install        # .npmrc evita los scripts de instalación de las dependencias
npm run check      # formato + lint + tipos + pruebas: debe quedar en verde
```
Instala las dependencias **antes** de abrir el harness: el guard que protege `.env` necesita `node_modules`.

## 3. Cómo se construye cada feature
1. El agente (orquestador) escribe la especificación con la skill `write-spec` y **te hace las preguntas abiertas**, una a una, con su propuesta. Las respuestas son tuyas.
2. Tú revisas la spec y la cambias a *Aprobada*. Sin eso, nadie escribe código.
3. El orquestador fija el contrato (`schema.ts`), delega a `backend`, `frontend` y `tests` por zonas y integra con `npm run check:full`.
4. `security` revisa en solo lectura; se aplican las correcciones.
5. Se escribe la nota de entrega en `docs/handoffs/` y se actualiza `docs/progreso.md`.
6. Pruébala tú (en local o en Vercel) antes de pasar a la siguiente feature.

El orden lo marcan las olas de `docs/features.md`. Solo se adelanta de una ola posterior lo estrictamente necesario.

## 4. Primer mensaje
Abre el harness en esta carpeta y envía:

> Lee `AGENTS.md`, `docs/empezar.md`, `docs/architecture.md` y `docs/features.md`. Vamos a construir el proyecto desde cero. Empieza por F0: usa la skill `write-spec` para escribir su especificación, hazme las preguntas abiertas una por una (con tu propuesta) y no implementes nada hasta que yo la apruebe. No ejecutes `npm run seed`.

## 5. Problemas conocidos
| Síntoma | Causa | Qué hacer |
| --- | --- | --- |
| Un hook del guard falla al empezar | Aún no se instalaron dependencias | `npm install` |
| `CONFIGURATION_NOT_FOUND` al sembrar | Authentication no está inicializado | Consola de Firebase → Authentication → *Get started* y activar correo/contraseña |
| La página queda en «Cargando…» en Vercel, log con `ERR_REQUIRE_ESM` | `jwks-rsa` carga `jose` v6 (solo ESM) | El override de `package.json` (ADR-0007); no lo quites |
| Un script con `server-only` falla | Falta `--conditions=react-server` | Ejecútalo con `tsx --conditions=react-server` |
| Tras `npm run build`, el HTML estático de una página contiene datos de sesión | Un `catch` se traga la señal de prerender de Next | Llamar a `unstable_rethrow(error)` primero en todo `catch` que envuelva `cookies()` |
| Una prueba de componente de React no corre | Vitest usa entorno `node` y solo incluye `*.test.ts` | Probar componentes con `renderToStaticMarkup` (sin dependencias nuevas) |
