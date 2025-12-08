# Documentación de la API de Carl IA

## Introducción

Carl IA es un asistente de inteligencia artificial diseñado para integrarse con el **Creative Engine**. Su propósito es ayudar a los desarrolladores a realizar tareas comunes de manera más eficiente a través de comandos de lenguaje natural. Esta documentación describe la API que Carl IA utiliza para comunicarse con el motor.

## Conceptos Básicos

La comunicación se basa en comandos estructurados que la IA genera en sus respuestas. Estos comandos son interpretados por el motor para ejecutar acciones específicas. El formato general de un comando es:

`motor.<módulo>.<acción>(<parámetros>);`

## Módulos de la API

### 1. `motor.archivos`

Este módulo gestiona las operaciones del sistema de archivos del proyecto.

#### `motor.archivos.crear(ruta, contenido)`
Crea un nuevo archivo en la ruta especificada.

-   **ruta** (string): La ruta completa del archivo, incluyendo el nombre y la extensión.
-   **contenido** (string, opcional): El contenido inicial del archivo.

**Ejemplo:**
`motor.archivos.crear('scripts/player.ces', 'public class Player { ... }');`

#### `motor.archivos.eliminar(ruta)`
Elimina un archivo o una carpeta.

-   **ruta** (string): La ruta del archivo o carpeta a eliminar.

**Ejemplo:**
`motor.archivos.eliminar('assets/sprites/old_sprite.png');`

### 2. `motor.escena`

Este módulo interactúa con los objetos y elementos de la escena actual.

#### `motor.escena.crear_objeto(nombre, componentes)`
Crea un nuevo objeto (Mater) en la escena.

-   **nombre** (string): El nombre del nuevo objeto.
-   **componentes** (array de strings, opcional): Una lista de componentes para añadir al objeto.

**Ejemplo:**
`motor.escena.crear_objeto('Enemigo', ['Transform', 'SpriteRenderer', 'Collider']);`

#### `motor.escena.seleccionar_objeto(nombre)`
Selecciona un objeto en la jerarquía de la escena.

-   **nombre** (string): El nombre del objeto a seleccionar.

**Ejemplo:**
`motor.escena.seleccionar_objeto('Player');`

### 3. `motor.editor`

Este módulo controla las ventanas y paneles del editor del Creative Engine.

#### `motor.editor.abrir_ventana(nombre_ventana)`
Abre una ventana específica del editor.

-   **nombre_ventana** (string): El nombre de la ventana a abrir (ej. 'Consola', 'Inspector').

**Ejemplo:**
`motor.editor.abrir_ventana('Consola');`

---

*Esta documentación es una versión preliminar y está sujeta a cambios a medida que Carl IA evolucione.*
