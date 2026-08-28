# Sociedad Patitas · Pre-Entrega 10

## Contexto del proyecto

El sitio web de **Sociedad Patitas** es un proyecto del curso de Desarrollo Web de Coderhouse que cuenta con cinco secciones: **Home**, **Servicios**, **Adopciones**, **Sucursales** y **Contacto**. Este simulador de adopción fue desarrollado en el curso de JavaScript y está integrado en la pestaña **Adopciones** del sitio, donde reemplaza el contenido estático original por una aplicación interactiva que permite gestionar el refugio desde el navegador.

## Sobre esta entrega

Simulador de adopción del refugio canino **Sociedad Patitas**.
Pre-Entrega 10 del curso de JavaScript — Coderhouse.

---

## Qué hay en esta entrega

Esta entrega integra el consumo de una API externa con Fetch API, el manejo completo de errores con `try/catch/finally` y la incorporación de dos librerías de terceros (SweetAlert2 y Toastify) que reemplazan todos los mecanismos nativos de feedback. A continuación se explica cada tema con las funciones y archivos exactos donde se implementa.

### Consumo de API externa con Fetch (`datos.js` → `cargarFotosDesdeAPI`)

La función `cargarFotosDesdeAPI` en `datos.js` (línea 211) hace una petición a la API pública **Dog CEO** (`https://dog.ceo/api/breeds/image/random/N`) para obtener fotos aleatorias de perros y asignarlas a los rescatados del refugio.

El flujo completo usa `async/await` con `try/catch/finally`:

- Primero filtra los rescatados sin foto con `.filter((r) => r.foto === "")` y arma la URL con la cantidad exacta que necesita.
- El `try` hace el `await fetch(...)`, verifica `response.ok` (lanza un error manual si el estado no es 200-299), parsea el JSON con `await response.json()` y valida que el formato sea el esperado (`datos.status === "success"` y `Array.isArray(datos.message)`). Después asigna cada URL a su rescatado con `.forEach()` y persiste en localStorage.
- El `catch` relanza el error para que el llamador (en `main.js`) pueda notificar al usuario con un toast sin romper el simulador.
- El `finally` llama a `actualizarVista()` para que las tarjetas se redibujen con o sin foto, en los dos casos.

La petición se dispara al arrancar (`main.js`, línea 384), al registrar un ingreso nuevo (`manejarAltaRescatado`, línea 151) y al reiniciar el refugio (`manejarReinicio`, línea 313).

### Promesas y async/await (`avisos.js` → `obtenerDestacadoDeLaSemana`, `cargarDestacadoDeLaSemana`)

El rescatado de la semana usa una promesa creada con `new Promise` que simula un cómputo demorado con `setTimeout` (línea 19 de `avisos.js`):

- `obtenerDestacadoDeLaSemana()` filtra los candidatos disponibles con `.filter(estaLibre)`, busca al de mayor costo con `.reduce()` y resuelve con `resolve({ rescatado, esperando, cuota })`. Si no hay ninguno disponible, rechaza con `reject(new Error(...))`.
- `cargarDestacadoDeLaSemana()` (línea 52) es `async` y hace `await` sobre esa promesa. Usa `try/catch/finally` completo: el `try` desestructura la respuesta y renderiza el panel; el `catch` muestra un panel alternativo con el motivo del fallo; el `finally` quita la clase `.cargando` del panel para sacar la animación de espera.

### Manejo de errores con try/catch/finally

Hay cuatro bloques `try/catch/finally` distribuidos en tres archivos:

| Función | Archivo | Qué protege |
|---------|---------|-------------|
| `cargarFotosDesdeAPI` | `datos.js` (línea 211) | La petición a la API Dog CEO. El `finally` actualiza la vista en ambos caminos |
| `cargarDestacadoDeLaSemana` | `avisos.js` (línea 52) | La promesa del rescatado de la semana. El `finally` retira la animación de carga |
| `apadrinarRescatado` | `main.js` (línea 157) | La validación del nombre del padrino y el estado del perro. El `finally` actualiza la vista |
| `guardarEn` / `leerDe` / `borrarDe` | `almacenamiento.js` (líneas 30, 44, 55) | Las operaciones del Web Storage, que pueden fallar en modo privado o con storage lleno |

### SweetAlert2 — modales de confirmación y alertas (`vista.js`)

Reemplaza los `alert()` y `confirm()` nativos que se usaban antes. Se carga desde CDN en `index.html` y se envuelve en dos funciones propias en `vista.js`:

- **`alertar(titulo, texto, icono)`** (línea 91): usa `Swal.fire()` para modales informativos. Se llama después de evaluar la solicitud para mostrar el resultado (aprobada con icono `success`, preaprobada con `info`, rechazada con `error`) y después de confirmar una adopción.
- **`confirmar(titulo, texto, textoConfirmar)`** (línea 106): usa `Swal.fire()` con `showCancelButton: true` y devuelve una promesa que resuelve en `true` o `false`. Se usa en tres lugares de `main.js`: antes de adoptar (`manejarClickEnTarjetas`, acción `"adoptar"` y `"confirmar"`), antes de enviar a tránsito (acción `"baja"`) y antes de reiniciar el refugio (`manejarReinicio`). Los manejadores que la usan son funciones `async` que hacen `await confirmar(...)`.

Los estilos de los modales están personalizados con los colores del refugio (`background: "#fdf6ec"`, `confirmButtonColor: "#6b4423"`).

### Toastify — notificaciones rápidas (`vista.js` → `notificar`)

Reemplaza la franja sticky de avisos de entregas anteriores. Se carga desde CDN en `index.html` y se envuelve en `notificar(texto, tipo)` en `vista.js` (línea 64).

Recibe un tipo (`exito`, `info` o `error`) que determina el color del toast. Se llama en todo el simulador:

- Bienvenida al cargar la página (`main.js`, línea 377)
- Ingreso de un rescatado nuevo (`main.js`, línea 148)
- Reserva de un perro (`main.js`, línea 262)
- Padrinazgo exitoso o fallido (`main.js`, líneas 174 y 179)
- Errores de validación en ambos formularios (`main.js`, passim)
- Búsqueda limpia con Escape (`main.js`, línea 328)
- Error al cargar fotos desde la API (`main.js`, línea 384)
- Reinicio del refugio (`main.js`, línea 310)
- Rescatado de la semana (`avisos.js`, línea 57)

Ningún `alert()`, `confirm()` o `prompt()` nativo se usa en todo el proyecto.

### Renderizado dinámico de datos de la API (`vista.js`)

Las fotos recibidas de Dog CEO se inyectan en las tarjetas como elementos `<img>` dentro de un contenedor `.tarjeta-foto`, con `loading="lazy"` para no frenar la carga inicial. La función `plantillaTarjeta` (línea 216) desestructura el rescatado y usa un ternario para incluir la imagen solo si `foto` tiene valor. Si la API falla o la foto no llegó, la tarjeta se muestra completa pero sin imagen.

### Manejadores async por SweetAlert2 (`main.js`)

Al reemplazar `confirm()` nativo por `Swal.fire()`, las confirmaciones pasaron a ser asíncronas (devuelven una promesa). Esto convirtió a los siguientes manejadores en funciones `async`:

- `manejarClickEnTarjetas` (línea 189): usa `await confirmar(...)` antes de adoptar, confirmar una reserva o enviar a tránsito.
- `manejarReinicio` (línea 286): usa `await confirmar(...)` antes de borrar los datos.

---

## Lo que ya viene de entregas anteriores

Esta entrega conserva e integra todo lo implementado en las PE anteriores. A continuación el mapeo completo de cada tema a su ubicación en el código.

### Clases con constructor y métodos

- **`Rescatado`** (`js/clases/Rescatado.js`): 10 métodos — `cuotaPadrinazgo()`, `textoEdad()`, `estadoTexto()`, `esCompatibleCon(puntosVivienda)`, `esCachorro()`, `estaDisponible()`, `reservar(nombre)`, `apadrinar(nombre)`, `adoptar(nombre)`.
- **`Solicitud`** (`js/clases/Solicitud.js`): 3 métodos — `sumarPuntos(puntos)`, `evaluar()`, `fueAceptada()`.

### Web Storage (localStorage y sessionStorage) con CRUD y clear

Todo en `almacenamiento.js`. Funciones genéricas `guardarEn` / `leerDe` / `borrarDe` que reciben el almacén y la clave, con atajos `guardarLocal` / `leerLocal` / `borrarLocal` y `guardarSesion` / `leerSesion` / `borrarSesion`.

- **Create/Update**: `persistirEstado()` en `datos.js` guarda rescatados y salidas en localStorage después de cada cambio. `guardarSesion` guarda la solicitud en sessionStorage.
- **Read**: `cargarRescatados`, `cargarSalidas` y `cargarSolicitud` en `datos.js` recuperan las tres claves al arrancar.
- **Delete**: `borrarLocal` y `borrarSesion` eliminan claves individuales.
- **Clear**: `vaciarAlmacenamiento()` borra las tres claves del simulador de ambos almacenes.

La distinción es intencional: rescatados y salidas en localStorage (persisten entre sesiones), solicitud en sessionStorage (se borra al cerrar la pestaña).

### Rehidratación de objetos desde storage

`rehidratarRescatado` y `rehidratarSolicitud` en `datos.js` (líneas 35 y 66) reconstruyen cada objeto plano como instancia de su clase para que vuelva a tener todos sus métodos. Usan destructuring y el operador `??` para valores por defecto.

### Higher-order functions

| Función | Dónde se usa | Qué hace |
|---------|-------------|----------|
| `.map()` | `cargarRescatados`, `cargarSalidas` (datos.js); `renderizarPreguntas`, `renderizarSalidas`, `renderizarRescatados` (vista.js) | Transforma arrays de datos en instancias rehidratadas o en HTML |
| `.filter()` | `cargarFotosDesdeAPI`, `filtrarPorTexto`, `contarApadrinados`, `contarAdopciones` (datos.js); `obtenerDestacadoDeLaSemana` (avisos.js); `renderizarResultado` (vista.js) | Filtra por estado, texto, compatibilidad o disponibilidad |
| `.find()` | `buscarPorId`, `buscarPorNombre` (datos.js); `repoblarFormularioSolicitud` (main.js) | Busca un rescatado por id/nombre o una opción del `<select>` |
| `.reduce()` | `generarId`, `calcularEstadisticas` (datos.js); `obtenerDestacadoDeLaSemana` (avisos.js) | Calcula el próximo id, acumula estadísticas, encuentra el mayor costo |
| `.forEach()` | `cargarFotosDesdeAPI` (datos.js); `manejarSolicitud` (main.js); `limpiarErrores` (vista.js) | Asigna fotos, suma puntos, limpia errores |
| `crearFiltroPorVivienda()` | `renderizarResultado` (vista.js) | Closure: retorna un callback que filtra rescatados compatibles |

### Operadores avanzados

- **Destructuring**: `rehidratarRescatado`, `rehidratarSolicitud` (datos.js); `plantillaTarjeta`, `renderizarResultado`, `renderizarSalidas` (vista.js); `repoblarFormularioSolicitud` (main.js); `cargarDestacadoDeLaSemana` (avisos.js).
- **Ternario**: `textoEdad()` (Rescatado.js); `renderizarSalidas`, `plantillaTarjeta` (vista.js); `armarMensajeDeBienvenida` (main.js).
- **Nullish coalescing (`??`)**: `rehidratarRescatado` (datos.js, líneas 58–60); `cargarRescatados` (datos.js, línea 82); `repoblarFormularioSolicitud` (main.js, línea 352).
- **Optional chaining (`?.`)**: `cargarRescatados` (datos.js, línea 82); `esSuPropiaReserva` (vista.js, línea 159).

### DOM: selección y manipulación

- Selección con `getElementById` y `querySelector` al inicio de `vista.js` (líneas 21–46).
- `innerHTML` con template literals para renderizar tarjetas, estadísticas, salidas, resultado y rescatado de la semana.
- `createElement` en `marcarError` (vista.js, línea 129) para inyectar mensajes de error.
- `classList.add` / `classList.remove` para alternar clases de estado.

### Delegación de eventos

`contenedorRescatados.addEventListener("click", manejarClickEnTarjetas)` en `main.js` (línea 340): un solo listener en el contenedor padre maneja adoptar, reservar, confirmar, apadrinar y enviar a tránsito leyendo `dataset.accion` y `dataset.id`.

### Tipos de funciones

Las tres formas coexisten en el proyecto: declarativas (`crearFiltroPorVivienda` en utilidades.js), expresiones de función (`clasificarSolicitud` en utilidades.js) y funciones flecha (`enPesos`, `estaLibre` en utilidades.js; los atajos de almacenamiento.js).

---

## Dónde está cada tema del módulo

| Tema del módulo | Archivo(s) y función(es) |
|---|---|
| `fetch` con `async/await` | `js/datos.js` → `cargarFotosDesdeAPI` (línea 211) |
| `response.ok` y `response.json()` | `js/datos.js` → dentro del `try` de `cargarFotosDesdeAPI` |
| `try/catch/finally` completo | `js/datos.js` → `cargarFotosDesdeAPI`; `js/avisos.js` → `cargarDestacadoDeLaSemana`; `js/main.js` → `apadrinarRescatado` |
| `try/catch` (storage) | `js/almacenamiento.js` → `guardarEn`, `leerDe`, `borrarDe` |
| Promesas (`new Promise`, `resolve`, `reject`) | `js/avisos.js` → `obtenerDestacadoDeLaSemana` (línea 19) |
| SweetAlert2 (CDN) | `index.html` (CDN), `js/vista.js` → `alertar` (línea 91), `confirmar` (línea 106) |
| Toastify (CDN) | `index.html` (CDN), `js/vista.js` → `notificar` (línea 64) |
| Manejadores async (por SweetAlert2) | `js/main.js` → `manejarClickEnTarjetas` (línea 189), `manejarReinicio` (línea 286) |
| Renderizado dinámico con datos de API | `js/vista.js` → `plantillaTarjeta` (línea 216, fotos de Dog CEO) |
| Clases con constructor y métodos | `js/clases/Rescatado.js`, `js/clases/Solicitud.js` |
| localStorage (CRUD + clear) | `js/almacenamiento.js` → `guardarLocal`, `leerLocal`, `borrarLocal`, `vaciarAlmacenamiento` |
| sessionStorage | `js/almacenamiento.js` → `guardarSesion`, `leerSesion`, `borrarSesion` |
| Rehidratación desde storage | `js/datos.js` → `rehidratarRescatado` (línea 35), `rehidratarSolicitud` (línea 66) |
| Higher-order functions (map, filter, find, reduce, forEach) | Ver tabla detallada en la sección anterior |
| Destructuring | `datos.js`, `vista.js`, `main.js`, `avisos.js` (ver sección Operadores) |
| Ternario | `Rescatado.js`, `vista.js`, `main.js` |
| Nullish coalescing (`??`) | `datos.js` (líneas 58–60, 82), `main.js` (línea 352) |
| Optional chaining (`?.`) | `datos.js` (línea 82), `vista.js` (línea 159) |
| Closures | `utilidades.js` → `crearFiltroPorVivienda` (línea 28) |
| Delegación de eventos | `main.js` → `manejarClickEnTarjetas` escucha en el contenedor padre (línea 340) |

---

## Cómo probarlo

1. Abrir `index.html` con un servidor local (Live Server) o con doble clic.
2. Las fotos se cargan desde la API Dog CEO; se necesita conexión a internet para que aparezcan.
3. Si no hay conexión, el simulador funciona igual: las tarjetas se muestran sin foto y un toast avisa del error.

### Pruebas sugeridas

- **Fotos de la API**: al cargar la página, las tarjetas muestran fotos aleatorias de perros. Registrar un ingreso nuevo y verificar que también recibe su foto.
- **SweetAlert2**: hacer click en "Adoptar" (con solicitud aprobada) → aparece un modal de confirmación. Cancelar → no pasa nada. Confirmar → se adopta y sale un modal de éxito. Lo mismo con "Pasó a tránsito" y "Reiniciar el refugio".
- **Toastify**: cada acción muestra un toast en la esquina superior derecha con color según el tipo (verde para éxito, naranja para info, rojo para error).
- **Error de API**: desconectar internet y registrar un ingreso → el toast avisa que no se pudo cargar la foto pero el perro se agrega igual.
- **Persistencia**: refrescar la página y comprobar que rescatados, salidas y solicitud se conservan.
- **Reinicio**: confirmar en el modal → los 7 perros originales vuelven con fotos nuevas.

---

## Estructura de archivos

```
sociedad-patitas-pre-entrega-10/
├── index.html                  ← Página principal, carga CDNs y 9 scripts con defer
├── README.md
├── css/
│   └── styles.css              ← Estilos propios (variables, grid, animaciones, responsive)
└── js/
    ├── config.js               ← Constantes de configuración y reglas de negocio
    ├── clases/
    │   ├── Rescatado.js        ← Clase Rescatado (10 métodos)
    │   └── Solicitud.js        ← Clase Solicitud (3 métodos)
    ├── almacenamiento.js       ← Web Storage: localStorage + sessionStorage con CRUD y clear
    ├── utilidades.js           ← Funciones puras: enPesos, clasificarSolicitud, crearFiltroPorVivienda
    ├── datos.js                ← Array de objetos, rehidratación, persistencia y fetch a Dog CEO API
    ├── vista.js                ← DOM, renderizado, SweetAlert2 (alertar/confirmar) y Toastify (notificar)
    ├── avisos.js               ← Rescatado de la semana (Promise + async/await + try/catch/finally)
    └── main.js                 ← Eventos, manejadores async y arranque
```

Los 9 scripts se cargan con `defer` en orden de dependencia: `config.js` → clases → `almacenamiento.js` → `utilidades.js` → `datos.js` → `vista.js` → `avisos.js` → `main.js`.

---

## Autor

Sharon Rodríguez — Pre-Entrega 10 · Curso de JavaScript · Coderhouse
