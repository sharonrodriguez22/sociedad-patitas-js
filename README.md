# 🐾 Sociedad Patitas — Pre-Entrega 7

Simulador de solicitud de adopción de **Sociedad Patitas**.
Curso de JavaScript · Carrera de Desarrollo de Aplicaciones · Coderhouse.

## Estructura

Siguiendo la recomendación de las devoluciones anteriores, el JavaScript ya
no vive en un solo archivo: cada pieza está en el suyo, con una
responsabilidad clara.

```
sociedad-patitas-js/
├── index.html            # único archivo en la raíz
├── css/
│   └── styles.css        # estilos del simulador
├── js/
│   ├── config.js         # constantes del refugio
│   ├── clases/
│   │   ├── Rescatado.js  # la clase Rescatado
│   │   └── Solicitud.js  # la clase Solicitud
│   ├── utilidades.js     # funciones auxiliares puras
│   ├── datos.js          # el array de objetos y sus consultas
│   ├── vista.js          # todo lo que toca el DOM
│   └── main.js           # eventos y arranque
└── README.md
```

| Archivo | De qué se ocupa | Qué NO hace |
|---|---|---|
| `config.js` | Los valores fijos: puntajes, preguntas, equivalencia porte → espacio | No tiene lógica |
| `clases/Rescatado.js` | Modela a cada perro: sus datos y sus métodos | No sabe que existe una pantalla |
| `clases/Solicitud.js` | Modela la postulación y se autoevalúa | No sabe que existe una pantalla |
| `utilidades.js` | Funciones cortas y puras (`enPesos`, `clasificarSolicitud`…) | No toca el array ni el DOM |
| `datos.js` | Crea las instancias, guarda el array y lo consulta con `find`, `filter`, `reduce` | No toca el DOM |
| `vista.js` | Selecciona los nodos, arma el HTML y lo inyecta | No decide reglas del refugio |
| `main.js` | Escucha los eventos y coordina al resto | No arma HTML ni recorre el array |

Vinculación en el `<head>` del HTML:

```html
<link rel="stylesheet" href="css/styles.css">

<script src="js/config.js" defer></script>
<script src="js/clases/Rescatado.js" defer></script>
<script src="js/clases/Solicitud.js" defer></script>
<script src="js/utilidades.js" defer></script>
<script src="js/datos.js" defer></script>
<script src="js/vista.js" defer></script>
<script src="js/main.js" defer></script>
```

### Por qué scripts clásicos y no módulos ES

La alternativa sería usar `type="module"` con `import` y `export`. No se usó
por un motivo concreto: los módulos ES no funcionan al abrir el archivo con
doble clic (protocolo `file://`), porque el navegador los bloquea por
seguridad. Necesitan sí o sí un servidor, aunque sea Live Server. Con
scripts clásicos el proyecto abre de las dos maneras, y la separación de
responsabilidades se consigue igual.

## Qué cambia en esta entrega

Se terminaron los `prompt`, los `alert` y los `console.log`. Toda la
interacción pasa a la pantalla:

| Antes (Pre-Entrega 6) | Ahora (Pre-Entrega 7) |
|---|---|
| Menú por `prompt` con números | Tres paneles con formularios y botones |
| Lista impresa con `console.log` | Tarjetas renderizadas en una grilla |
| Resultado por `alert` | Panel de resultado con barra de puntaje |
| Búsqueda escribiendo en un `prompt` | Buscador que filtra mientras se escribe |
| Errores avisados por `alert` | Mensaje en pantalla + campo marcado en rojo |

## Cómo se usa

1. Abrir `index.html` en el navegador.
2. **Paso 1** — mirar los rescatados, buscarlos por nombre.
3. **Paso 2** — completar la solicitud y evaluarla.
4. Según el resultado, adoptar o reservar un perro desde su tarjeta.
5. **Paso 3** — registrar el ingreso de un perro nuevo.

## El registro de salidas

Ningún perro desaparece de la pantalla sin dejar rastro. Cuando deja el
refugio, sale del array `rescatados` y entra en `salidas`, que guarda un
objeto literal por cada caso:

```js
function registrarSalida(rescatado, motivo, destino) {
  const posicion = rescatados.indexOf(rescatado);

  if (posicion !== -1) {
    rescatados.splice(posicion, 1);
  }

  const salida = { rescatado: rescatado, motivo: motivo, destino: destino };
  salidas.push(salida);

  return salida;
}
```

Hay dos motivos posibles, y el panel los distingue por color:

| Motivo | Cuándo pasa | Cómo se ve |
|---|---|---|
| `adopcion` | La solicitud fue APROBADA y la persona se lo llevó | 🎉 verde |
| `transito` | El perro pasó a un hogar de tránsito | 🏠 naranja |

El panel arranca con la clase `oculto` y el JS se la saca en cuanto hay una
primera salida, para no dejar una caja vacía ocupando la pantalla. Además,
las estadísticas de arriba llevan un contador de adoptados que sale de un
`filter` sobre el registro.

### La salida a tránsito pide confirmación

Sacar un perro del listado es la única acción que no se puede deshacer, así
que necesita dos clics. El primero solo cambia el botón a "¿Confirmar?"; el
segundo ejecuta. La variable `idPendienteBaja` recuerda de qué tarjeta se
trata, y cualquier otra acción (adoptar, reservar, buscar) la limpia.

No se usa `confirm()` porque está prohibido igual que los `alert`: la
confirmación se resuelve con DOM y una clase de CSS.

Un perro reservado por otra persona no puede pasar a tránsito: su botón
queda deshabilitado con el motivo en el `title`.

## El circuito completo de una reserva

Una solicitud PREAPROBADA reserva, pero no se lleva el perro. Para cerrar el
círculo, la persona que lo reservó puede volver más adelante:

1. Reserva a Luna con una solicitud PREAPROBADA. Luna sigue en el refugio,
   con la etiqueta `reservado`.
2. Mientras tanto, para cualquier otra persona el botón de Luna dice
   "Reservado por Sharon Rodríguez" y está deshabilitado.
3. Si Sharon vuelve y su solicitud sigue siendo PREAPROBADA, su botón dice
   "Reservado a tu nombre", también deshabilitado: falta la visita.
4. Cuando su solicitud pasa a APROBADA —que es lo que representa haber
   pasado la visita al domicilio— el botón se convierte en
   **"Confirmar mi reserva"** y ahí sí se la lleva.

La comparación la hace `esSuPropiaReserva()`, que cruza el `reservadoPor`
del perro con el `nombreAdoptante` de la solicitud abierta. El método
`adoptar()` de la clase ya tenía la regla del lado de los datos: acepta la
entrega si la reserva es de esa misma persona y la rechaza si es de otra.

## 1. Selección de elementos del DOM

Todo esto vive en `vista.js`. Los nodos se buscan una sola vez, al cargar la
página, y se guardan en constantes para no volver a buscarlos en cada render.

```js
// getElementById: el más directo cuando el elemento tiene un id único
const contenedorRescatados = document.getElementById("contenedor-rescatados");
const zonaMensajes = document.getElementById("zona-mensajes");

// querySelector: acepta cualquier selector CSS
const formSolicitud = document.querySelector("#form-solicitud");
const inputBuscar = document.querySelector("#input-buscar");

// querySelectorAll: devuelve una lista de nodos, se recorre con forEach
const respuestas = document.querySelectorAll(".check-pregunta");
```

`querySelectorAll` se usa en dos lugares donde hacen falta **todos** los
elementos que coinciden: al sumar los puntos de las casillas marcadas del
cuestionario, y al limpiar los campos marcados con error.

## 2. Renderizado dinámico

También en `vista.js`. El HTML de cada tarjeta lo arma una función con **template strings**
(backticks) y se inyecta con `innerHTML`. `map` transforma el array de
objetos en un array de textos, y `join("")` los pega en uno solo.

```js
function plantillaTarjeta(rescatado) {
  return `
    <article class="tarjeta${claseReservada}${claseResaltada}" data-id="${rescatado.id}">
      <div class="tarjeta-cabecera">
        <h3>🐶 ${rescatado.nombre}</h3>
        <span class="etiqueta etiqueta-${rescatado.estadoTexto()}">${rescatado.estadoTexto()}</span>
      </div>
      <p class="tarjeta-datos">${rescatado.sexo} · porte ${rescatado.tamanio} · ${rescatado.textoEdad()}</p>
      <p class="tarjeta-costo">Mantenimiento: ${enPesos(rescatado.costoMensual)} por mes</p>
      <div class="tarjeta-acciones">
        ${plantillaBotonAccion(rescatado)}
        <button class="boton boton-baja" data-accion="baja" data-id="${rescatado.id}">Dar de baja</button>
      </div>
    </article>
  `;
}

function renderizarRescatados() {
  const visibles = obtenerListaVisible();
  contenedorRescatados.innerHTML = visibles.map(plantillaTarjeta).join("");
}
```

Se renderizan dinámicamente cuatro cosas distintas:

| Qué | Función | De dónde sale |
|---|---|---|
| Las tarjetas de los perros | `renderizarRescatados()` | el array `rescatados` |
| Las preguntas del cuestionario | `renderizarPreguntas()` | el array `PREGUNTAS` |
| Los números del refugio | `renderizarEstadisticas()` | un `reduce` sobre el array |
| El resultado de la solicitud | `renderizarResultado()` | el objeto `Solicitud` |
| El registro de salidas | `renderizarSalidas()` | el array `salidas` |

**Regla del proyecto:** cada vez que el array cambia se vuelve a llamar a
`actualizarVista()`, que redibuja las tarjetas y las estadísticas. La pantalla
nunca se toca "a mano": siempre es un reflejo del array.

### El `data-id` es la conexión entre el objeto y su tarjeta

Cada botón lleva `data-id="${rescatado.id}"`. Cuando alguien lo aprieta, ese
id permite volver del HTML al objeto con `find`:

```js
const id = Number(boton.dataset.id);
const rescatado = buscarPorId(rescatados, id);
```

## 3. Manejo de eventos

Todos los manejadores están en `main.js`, que es el único archivo que
conecta al usuario con el resto.

| Elemento | Evento | Qué hace |
|---|---|---|
| `#form-solicitud` | `submit` | Valida, crea la `Solicitud`, la evalúa y dibuja el resultado |
| `#btn-limpiar-solicitud` | `click` | Vacía el formulario y el resultado |
| `#form-rescatado` | `submit` | Valida y agrega el perro nuevo al array |
| `#contenedor-rescatados` | `click` | Adoptar, reservar, confirmar una reserva o pasar a tránsito (delegación) |
| `#input-buscar` | `keyup` | Filtra la lista mientras se escribe |
| `#input-buscar` | `keydown` | La tecla `Escape` limpia la búsqueda |

```js
formSolicitud.addEventListener("submit", manejarSolicitud);
contenedorRescatados.addEventListener("click", manejarClickEnTarjetas);
inputBuscar.addEventListener("keyup", manejarBusqueda);
inputBuscar.addEventListener("keydown", manejarTeclaEnBuscador);
```

Las funciones se pasan **sin paréntesis**: con paréntesis se ejecutarían al
cargar la página en vez de esperar al evento.

### Delegación de eventos

Los botones de las tarjetas no llevan un listener cada uno. Hay **uno solo**
en el contenedor:

```js
contenedorRescatados.addEventListener("click", manejarClickEnTarjetas);
```

El motivo es que las tarjetas se vuelven a dibujar enteras en cada render:
los botones viejos desaparecen y los nuevos no tendrían listener. Poniendo el
listener en el contenedor, que nunca se reemplaza, el problema desaparece. Ahí
entra el objeto `event`: `event.target` dice exactamente qué botón se apretó y
`dataset` trae la acción y el id.

```js
function manejarClickEnTarjetas(evento) {
  const boton = evento.target;
  const accion = boton.dataset.accion;

  if (accion === undefined) {
    return; // el clic no cayó sobre un botón con acción
  }
  // ...
}
```

### El evento de teclado

```js
function manejarBusqueda(evento) {
  textoBusqueda = evento.target.value;
  actualizarVista();
}

function manejarTeclaEnBuscador(evento) {
  if (evento.key === "Escape") {
    inputBuscar.value = "";
    textoBusqueda = "";
    actualizarVista();
  }
}
```

`evento.key` es la propiedad que dice qué tecla se presionó. Sin el objeto
`event` solo sabríamos que se presionó algo, no el qué.

## 4. Feedback visual

Cada acción del usuario tiene una respuesta en pantalla:

- **Mensajes.** `mostrarMensaje(texto, tipo)` crea un `<p>` con
  `createElement`, le pone el texto con `textContent`, lo cuelga con
  `appendChild` y lo saca solo con `remove()` a los 4,5 segundos. El tipo
  (`exito`, `info`, `error`) define el color.
- **Campos con error.** El input mal completado recibe la clase
  `campo-error` (borde rojo) y el foco.
- **Tarjeta resaltada.** El perro recién agregado o recién reservado aparece
  con la clase `tarjeta-nueva`, que dispara una animación de destaque.
- **Estados de la tarjeta.** Un perro reservado cambia de color, muestra la
  etiqueta `reservado` y su botón queda deshabilitado con el nombre de quien
  lo apartó.
- **Botones que se adaptan.** Sin solicitud evaluada el botón dice "Adoptar"
  pero está bloqueado; con la solicitud aprobada se habilita; con la
  preaprobada pasa a decir "Reservar"; si el perro no entra en esa vivienda
  dice "Necesita más espacio".

```js
function mostrarMensaje(texto, tipo) {
  const aviso = document.createElement("p");
  aviso.className = "aviso aviso-" + tipo;
  aviso.textContent = texto;

  zonaMensajes.innerHTML = "";
  zonaMensajes.appendChild(aviso);

  setTimeout(function () {
    aviso.remove();
  }, DURACION_MENSAJE);
}
```

`textContent` y no `innerHTML`: el texto del mensaje puede incluir un nombre
escrito por el usuario, y `textContent` lo muestra tal cual en lugar de
interpretarlo como HTML.

## 5. Lo que se mantiene de las entregas anteriores

- **Las clases `Rescatado` y `Solicitud`**, con sus métodos
  (`esCompatibleCon`, `esCachorro`, `estaDisponible`, `reservar`, `adoptar`,
  `sumarPuntos`, `evaluar`, `fueAceptada`).
- **El array de instancias** creado con `new`, que ahora es la fuente de todo
  lo que se dibuja.
- **Las funciones de orden superior**: `map` para el render, `filter` para la
  búsqueda y la compatibilidad, `find` para localizar un perro por id o por
  nombre, `reduce` para las estadísticas y para generar el próximo id,
  `forEach` para recorrer las listas de nodos.
- **La regla de negocio de la Pre-Entrega 6**: una solicitud APROBADA se
  lleva el perro; una PREAPROBADA solo puede reservarlo hasta la visita al
  domicilio.

| Puntaje sobre 13 | Estado | Qué puede hacer |
|---|---|---|
| 11 a 13 | APROBADA | Adoptar en el momento |
| 7 a 10 | PREAPROBADA | Reservar hasta la visita |
| 0 a 6 | RECHAZADA | Ninguna acción sobre las tarjetas |

## 6. Estilos

`css/styles.css` define la paleta del refugio con variables CSS, un layout en
grilla que pasa a una sola columna en pantallas chicas, tarjetas con estados
visuales diferenciados, y dos animaciones: la aparición de los mensajes y el
destaque de la tarjeta recién agregada.