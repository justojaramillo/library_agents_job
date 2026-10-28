# Lista de features (FDD)

Esta es la lista de lo que se va a construir, en el orden sugerido. **Aquí no hay reglas de negocio**: cada una se decide con la persona al escribir la especificación de su feature (skill `write-spec`, carpeta `docs/specs/`). Para empezar, ver `docs/empezar.md`; para saber por dónde vamos, `docs/progreso.md`.

Una feature = **acción + resultado + objeto**, pequeña y con valor visible («Prestar un libro a una persona»). Se construyen una por una y la persona aprueba la especificación **antes** de delegar. Las reglas de código están en `AGENTS.md`.

## Qué es el proyecto
Una biblioteca de préstamos de libros. Hay libros físicos y copias digitales que se leen en el navegador, personas con distintos roles y personal que gestiona los préstamos.

## Roles
Hay cinco roles: `EXTERNO`, `ESTUDIANTE`, `DOCENTE`, `BIBLIOTECARIO` y `ADMINISTRADOR`.

- **Prestatario** = quien pide libros prestados. **Personal** = quien gestiona la biblioteca.
- Qué puede hacer cada rol, cómo se obtiene, cuántos hay y qué límites tiene **se decide en F3–F4 y en cada feature** que lo toque. Nada de esto está decidido de antemano.

## Features

Ola = orden de construcción sugerido (cada ola es entregable por sí sola). Quién: quién la usa.

| Id | Feature | Quién | Ola |
| --- | --- | --- | --- |
| **Base** | | | |
| F0 | Base del proyecto: errores y HTTP, sesión, Firebase, entorno, datos de ejemplo y puertas de calidad | Sistema | 1 |
| F1 | Registrar un libro | Personal | 1 |
| F2 | Buscar libros por título o autor | Público | 1 |
| F3 | Registrar una cuenta desde el mostrador | Personal | 1 |
| F4 | Ingresar con correo y contraseña | Todos | 1 |
| **Préstamos** | | | |
| F5 | Prestar un libro físico | Personal · Prestatario | 1 |
| F6 | Devolver un libro | Personal | 1 |
| F7 | Calcular la multa por retraso | Sistema | 1 |
| F8 | Listar los préstamos vencidos de una persona | Prestatario · Personal | 1 |
| F9 | Panel: préstamos por mes | Personal | 5 (opcional) |
| F23 | Ver mis préstamos (activos e historial) | Prestatario · Personal | 4 |
| F24 | Renovar un préstamo | Prestatario | 4 |
| F25 | Reservar un libro sin ejemplares disponibles | Prestatario | 5 (opcional) |
| F26 | Registrar y saldar multas | Personal | 4 |
| **Cuentas y roles** | | | |
| F10 | Autorregistrarse | Público | 2 |
| F11 | Solicitar el rol de docente | Prestatario | 2 |
| F12 | Aprobar o rechazar una solicitud de docente | Personal | 2 |
| F13 | Crear una cuenta de bibliotecario | Administrador | 2 |
| F14 | Desactivar y reactivar una cuenta | Personal | 2 |
| F15 | Cambiar mi contraseña | Todos | 2 |
| F16 | Recuperar mi contraseña olvidada | Público | 2 |
| F17 | Limitar los intentos de ingreso fallidos | Sistema | 2 |
| **Catálogo** | | | |
| F18 | Editar los datos y los ejemplares de un libro | Personal | 4 |
| F19 | Retirar un libro del catálogo | Personal | 4 |
| F20 | Clasificar libros por categoría y año, y filtrar por ellos | Personal · Público | 4 |
| F21 | Paginar los resultados de la búsqueda | Público | 4 |
| F22 | Validar el ISBN con su dígito verificador | Personal | 4 |
| **Lector interactivo** | | | |
| F27 | Cargar el contenido digital de un libro y fijar sus copias digitales | Personal | 3 |
| F38 | Pedir prestada la copia digital de un libro | Prestatario | 3 |
| F39 | Pedir que un libro sin copia digital se digitalice | Prestatario · Personal | 3 |
| F28 | Abrir un libro en el lector interactivo | Prestatario | 3 |
| F29 | Proteger la lectura al perder el foco | Sistema (lector) | 3 |
| F30 | Marcar cada página con el nombre del lector | Sistema (lector) | 3 |
| F31 | Guardar el progreso y los marcadores de lectura | Prestatario | 3 |
| F32 | Registrar y consultar los incidentes de lectura | Sistema · Personal | 3 |
| **Interfaz** | | | |
| F33 | Barra de navegación con sesión y las pantallas base | Todos | 1 |
| F34 | Pantalla de préstamos y devoluciones | Personal | 1 |
| F35 | Pantallas «Mis préstamos» y «Mis vencidos» | Prestatario | 1 |
| F36 | Formularios para registrar libros y cuentas | Personal | 2 |
| F37 | Pantallas de solicitudes de docente y de gestión de personal | Personal · Administrador | 2 |

## Áreas y carpetas

Cada área agrupa features y tiene su carpeta en `app/features/` (ver `docs/architecture.md`).

| Área | Carpeta | Features |
| --- | --- | --- |
| Cuentas y roles | `app/features/accounts` | F3, F4, F10–F17, F37 |
| Catálogo | `app/features/catalog` | F1, F2, F18–F22, F36 (libros) |
| Préstamos | `app/features/loans` | F5–F9, F23–F26, F34, F35 |
| Lector interactivo | `app/features/reader` | F27–F32, F38, F39 |
| Transversal | `app/` (páginas), `app/shared/` | F0, F33 |

## F0 · Alcance de la base

F0 es la capa que usan todas las demás: no tiene pantallas. Su especificación debe decidir, con la persona, al menos: cómo se representan y traducen los errores a HTTP, cómo se valida el origen de las peticiones, cómo se guarda y se verifica la sesión, cómo se conecta el servidor con Firebase, cómo se validan las variables de entorno (y un comando `npm run check:env` que muestre estados, nunca valores), qué datos de ejemplo crea el `seed` y cómo se prueba todo sin tocar la red. Las puertas de calidad (`npm run check`) ya existen: F0 no las reescribe.
