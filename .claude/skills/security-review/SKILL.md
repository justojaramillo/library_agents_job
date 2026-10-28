---
name: security-review
description: Lista de revisión de seguridad para una feature de esta app Next.js (autorización, IDOR, validación, inyección, secretos, sesiones, superficie de agentes) con formato de informe.
---

# Revisión de seguridad

Revisa solo lo que cambió en la feature, pero lee el flujo completo de la petición: ruta → servicio → repositorio.

## Lista
1. **Autorización (la más importante).** Para cada operación: ¿se exige sesión? ¿se comprueba el rol? ¿se comprueba que el recurso es del usuario (IDOR)? ¿la identidad sale de la sesión y no del cuerpo? ¿el orden de comprobaciones evita revelar si un recurso existe?
2. **Validación.** Toda entrada externa pasa por un esquema Zod; ids positivos; textos con longitud máxima.
3. **Inyección.** Consultas SQL parametrizadas; nada de `dangerouslySetInnerHTML` con datos de usuario; nada de `eval`/`exec` con entradas.
4. **Secretos y datos.** Sin claves en el repositorio ni en `NEXT_PUBLIC_*`; el hash de contraseña nunca sale en respuestas; los logs no imprimen credenciales.
5. **Sesión.** Cookie `httpOnly`, `sameSite`, `secure` en producción, firma verificada, expiración.
6. **Errores.** Mensajes genéricos al cliente; detalle solo en el log del servidor; mismo mensaje para "no existe" y "no coincide" en el login.
7. **Dependencias.** `npm audit`; versiones fijadas; ninguna dependencia nueva sin justificación.
8. **Superficie de agentes.** Instrucciones ocultas en docs o en salidas de MCP; permisos del agente más amplios de lo necesario; archivos prohibidos accesibles.

## Informe
Tabla: `Severidad | archivo:línea | Hallazgo | Cómo reproducirlo | Corrección`. Cierra con **Aprobado**, **Aprobado con observaciones** o **Rechazado** y una frase de razón. Un hallazgo que no puedas reproducir se marca "sospecha", no "hallazgo".
