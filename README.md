# 🐾 Sociedad Patitas

Aplicación web para una organización ficticia dedicada al rescate y adopción responsable de perros. Integra un **simulador de adopción** interactivo construido con JavaScript vanilla en la página de Adopciones del sitio y una **suite de tests end-to-end con Playwright**.

## 📖 Descripción

**Sociedad Patitas** es un sitio web responsive con cinco secciones (inicio, servicios, adopciones, sucursales y contacto). La página de Adopciones integra un simulador que reproduce el flujo completo de un refugio: consultar perros disponibles, completar una solicitud de adopción con evaluación por puntaje, apadrinar rescatados, registrar nuevos ingresos y buscar por nombre en tiempo real.

Los datos iniciales se cargan desde un archivo JSON con `fetch` y `async/await`, cada perro recibe una foto aleatoria desde la API de [Dog CEO](https://dog.ceo/dog-api/), y el estado del refugio persiste en el navegador con `localStorage` y `sessionStorage`. El feedback visual se maneja con SweetAlert2 (modales de confirmación) y Toastify (notificaciones no intrusivas).

## 🚀 Funcionalidades

- Carga asíncrona de datos desde JSON local y API externa (Dog CEO), con manejo de errores mediante `try/catch/finally`.
- Renderizado dinámico del DOM: tarjetas de rescatados, estadísticas del refugio con `reduce`, resultado de solicitud y rescatado de la semana (resuelto con `Promise`).
- Formulario de solicitud de adopción con validación y cuestionario de responsabilidad. El puntaje determina adopción inmediata o visita previa.
- Sistema de padrinazgo para colaborar sin adoptar.
- Registro de salidas (adopciones y tránsito) con historial visible.
- Alta de nuevos rescatados desde formulario, con actualización instantánea de la lista.
- Búsqueda por nombre en tiempo real, con limpieza por tecla Escape.
- Persistencia completa: `localStorage` para rescatados y salidas, `sessionStorage` para la solicitud activa. Al recargar, el estado se restaura.

## 🏗️ Arquitectura del código

El JavaScript está separado en **8 módulos por responsabilidad**, sin bundler ni transpilador:

| Módulo | Responsabilidad |
|---|---|
| `config.js` | Constantes y configuración global |
| `clases/Rescatado.js` | Clase que modela un perro del refugio |
| `clases/Solicitud.js` | Clase que modela una solicitud de adopción |
| `almacenamiento.js` | Lectura y escritura en localStorage/sessionStorage |
| `utilidades.js` | Funciones auxiliares reutilizables |
| `datos.js` | Carga del JSON, consultas y operaciones sobre el array de rescatados |
| `vista.js` | Renderizado del DOM, tarjetas, estadísticas y feedback visual |
| `avisos.js` | Rescatado de la semana (Promise con resolve/reject) |
| `main.js` | Bindeo de eventos y arranque de la aplicación |

## 🧪 Tests end-to-end (Playwright)

El proyecto incluye **10 tests automatizados** que verifican el simulador en un navegador real (Chromium). La suite levanta un servidor HTTP local, redirige las librerías CDN a copias en `node_modules` y ejecuta cada prueba de forma aislada.

| Archivo | Tests | Qué verifica |
|---|---|---|
| `01-carga-basica` | 1 | La página carga sin errores de JavaScript en la consola. |
| `02-estructura` | 2 | Los cuatro paneles del simulador, header, footer y navegación están presentes en el DOM. |
| `03-renderizado` | 2 | Las tarjetas se generan dinámicamente desde el JSON y el rescatado de la semana tiene contenido. |
| `04-formulario-solicitud` | 2 | El formulario vacío muestra errores de validación. El formulario completo se evalúa y muestra el resultado. |
| `05-busqueda-y-alta` | 2 | El filtro oculta tarjetas que no coinciden. El alta agrega un nuevo rescatado a la lista. |
| `06-persistencia` | 1 | Los datos en localStorage sobreviven a una recarga de la página. |

**Infraestructura de testing:** los tests no dependen de internet. Un servidor local (`tests/helpers/servidor.mjs`) sirve los archivos del proyecto, y un interceptor de rutas (`tests/helpers/cdn.mjs`) redirige las peticiones a SweetAlert2 y Toastify hacia copias instaladas localmente. Esto permite ejecutar la suite offline y evita fallos por latencia o caída de CDN.

## 🛠️ Tecnologías utilizadas

- **HTML5** — Estructura semántica con atributos de accesibilidad (ARIA, roles, labels).
- **CSS3 / Sass (SCSS)** — Estilos organizados en parciales, compilados a CSS. Diseño responsive.
- **JavaScript (ES6+)** — Clases, destructuring, template literals, async/await, Promises, métodos de array (map, filter, reduce). Sin frameworks.
- **Fetch API** — Consumo de datos locales (JSON) y externos (Dog CEO API), con `try/catch/finally`.
- **localStorage / sessionStorage** — Persistencia del estado del simulador sin backend.
- **SweetAlert2 + Toastify** — Librerías para feedback visual al usuario.
- **Playwright** — Tests end-to-end automatizados en Chromium.
- **Git & GitHub** — Control de versiones con branches por feature.

## 📂 Estructura del proyecto

```text
├── assets/                ← Imágenes y logos
├── css/
│   ├── style.css          ← Estilos compilados (SCSS)
│   └── simulador.css      ← Estilos del simulador
├── data/
│   └── rescatados.json    ← Datos iniciales de los perros
├── js/
│   ├── config.js
│   ├── clases/
│   │   ├── Rescatado.js
│   │   └── Solicitud.js
│   ├── almacenamiento.js
│   ├── utilidades.js
│   ├── datos.js
│   ├── vista.js
│   ├── avisos.js
│   └── main.js
├── tests/
│   ├── helpers/
│   │   ├── servidor.mjs   ← Servidor HTTP local para los tests
│   │   └── cdn.mjs        ← Redirección de CDN a copias locales
│   ├── 01-carga-basica.spec.mjs
│   ├── 02-estructura.spec.mjs
│   ├── 03-renderizado.spec.mjs
│   ├── 04-formulario-solicitud.spec.mjs
│   ├── 05-busqueda-y-alta.spec.mjs
│   └── 06-persistencia.spec.mjs
├── page/
│   ├── adopciones.html    ← Simulador de adopción
│   ├── servicios.html
│   ├── sucursales.html
│   └── contacto.html
├── sass/                  ← Fuentes SCSS
├── playwright.config.mjs
├── package.json
├── index.html
└── README.md
```

## 💻 Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/sharonrodriguez22/sociedad-patitas-js.git
cd sociedad-patitas-js

# Abrir con un servidor local
# Opción 1: VS Code con la extensión Live Server
# Opción 2: Desde la terminal
npx serve
```

Navegar a la página de **Adopciones** para usar el simulador. Las fotos de los perros se cargan desde internet (necesita conexión).

> El simulador usa `fetch` para cargar `rescatados.json`, por lo que requiere un servidor HTTP. No funciona abriendo el archivo directamente con `file://`.

**Ejecutar los tests:**

```bash
npm install
npx playwright install
npx playwright test
```

## 👩‍💻 Autora

**Sharon Rodríguez**

Proyecto desarrollado durante la **Carrera de Desarrollo de Aplicaciones** en **CoderHouse**, módulo de JavaScript.