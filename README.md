# 🐾 Sociedad Patitas — Entrega Final

Proyecto desarrollado como parte del curso de **Desarrollo de Aplicaciones** en **CoderHouse**, módulo de **JavaScript**.

## 📖 Descripción

**Sociedad Patitas** es un sitio web para una organización ficticia dedicada al rescate, cuidado y adopción responsable de perros. Integra un **simulador de adopción** con JavaScript en la página de Adopciones del sitio.

El simulador permite consultar los perros disponibles del refugio, completar una solicitud de adopción, apadrinar rescatados y registrar nuevos ingresos, todo con feedback visual mediante SweetAlert2 y Toastify. Los datos iniciales se cargan desde un archivo JSON con `fetch` y `async/await`, y el estado del refugio persiste en el navegador con `localStorage`.

## 🚀 Funcionalidades

**Sitio web (HTML + SCSS):**
- Página de inicio con presentación de la organización.
- Sección de adopciones con simulador interactivo.
- Información sobre servicios.
- Página de sucursales con mapas.
- Formulario de contacto.
- Diseño responsive adaptable a móvil, tablet y desktop.

**Simulador de adopción (JavaScript):**
- Carga de datos iniciales desde `data/rescatados.json` con `fetch` y `async/await`.
- Consumo de API externa (Dog CEO) para fotos aleatorias de perros.
- Manejo de errores con `try/catch/finally` en todas las peticiones asíncronas.
- SweetAlert2 para confirmaciones y alertas modales.
- Toastify para notificaciones rápidas no intrusivas.
- Renderizado dinámico del DOM con tarjetas de rescatados.
- Formulario de solicitud de adopción con validación y cuestionario.
- Sistema de padrinazgo para aportar sin adoptar.
- Registro de salidas (adopciones y tránsito).
- Rescatado de la semana destacado (Promise con resolve/reject).
- Búsqueda por nombre en tiempo real.
- Persistencia de datos con `localStorage` y `sessionStorage`.
- Alta de nuevos rescatados desde formulario.
- Estadísticas en vivo del refugio con `reduce`.

## 🛠️ Tecnologías utilizadas

- HTML5
- CSS3 / Sass (SCSS)
- JavaScript (ES6+, sin frameworks)
- Fetch API + async/await
- SweetAlert2 (CDN)
- Toastify (CDN)
- localStorage / sessionStorage
- Git & GitHub

## 📂 Estructura del proyecto

```text
├── assets/                ← Imágenes y logos
├── css/
│   ├── style.css          ← Estilos compilados del sitio web (SCSS)
│   └── simulador.css      ← Estilos del simulador de adopción
├── data/
│   └── rescatados.json    ← Datos iniciales de los perros (fetch)
├── js/
│   ├── config.js          ← Constantes y configuración
│   ├── clases/
│   │   ├── Rescatado.js   ← Clase para los perros del refugio
│   │   └── Solicitud.js   ← Clase para las solicitudes de adopción
│   ├── almacenamiento.js  ← Lectura/escritura en localStorage
│   ├── utilidades.js      ← Funciones auxiliares
│   ├── datos.js           ← Carga de datos y consultas sobre el array
│   ├── vista.js           ← Renderizado del DOM, alertas y notificaciones
│   ├── avisos.js          ← El rescatado de la semana (Promise)
│   └── main.js            ← Eventos y arranque
├── page/
│   ├── adopciones.html    ← Simulador de adopción integrado
│   ├── servicios.html
│   ├── sucursales.html
│   └── contacto.html
├── sass/                  ← Fuentes SCSS del sitio web
├── index.html             ← Página principal
└── README.md
```

## 🎯 Criterios de la entrega final

| Criterio | Implementación |
|---|---|
| **Objetos y arrays (15%)** | Clases `Rescatado` y `Solicitud` con métodos. Array `rescatados[]` como estado central del simulador. |
| **Funciones y condicionales (15%)** | Validaciones en formularios, evaluación de solicitud por puntaje, lógica de adopción/reserva/padrinazgo. |
| **Generación del DOM (15%)** | Tarjetas generadas con `innerHTML`, estadísticas con `reduce`, resultado de solicitud, destacado de la semana. |
| **Eventos del usuario (15%)** | Submit en formularios, click en tarjetas, búsqueda en tiempo real (keyup), tecla Escape para limpiar. |
| **Almacenamiento (15%)** | `localStorage` para rescatados y salidas. `sessionStorage` para la solicitud activa. Rehidratación al recargar. |
| **Fetch y JSON (15%)** | Datos iniciales desde `data/rescatados.json`. Fotos desde la API Dog CEO. Ambos con `async/await` y `try/catch/finally`. |
| **Librerías (10%)** | SweetAlert2 para confirmaciones (adoptar, tránsito, reiniciar). Toastify para notificaciones (éxito, info, error). |

## 💻 Cómo ejecutar el proyecto

1. Clonar el repositorio.
2. Abrir el proyecto con un servidor local. Algunas opciones:
   - **VS Code**: usar la extensión [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).
   - **Terminal**: ejecutar `npx serve` en la carpeta del proyecto y abrir la URL que indica.
3. Navegar a la página de **Adopciones** para usar el simulador.
4. Las fotos de los perros se cargan desde internet (necesita conexión).

> El proyecto usa `fetch` para cargar `rescatados.json`, por lo que necesita un servidor HTTP. No funciona abriendo el archivo directamente con `file://`.

## 👩‍💻 Autora

**Sharon Rodríguez**

Proyecto realizado para la carrera de **Desarrollo de Aplicaciones** de **CoderHouse**.