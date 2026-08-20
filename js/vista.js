/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   vista.js · Todo lo que toca la pantalla

   Este archivo concentra el DOM: guarda las referencias a los nodos,
   arma el HTML de cada pieza con template strings y lo inyecta con
   innerHTML. Ningún otro archivo modifica la pantalla.

   Recibe los datos de datos.js y no decide nada de la lógica del
   refugio: solo la dibuja.
   ============================================================ */

/* ------------------------------------------------------------
   1) SELECCIÓN DE ELEMENTOS DEL DOM
   Se guardan en constantes una sola vez, al cargar la página, para
   no volver a buscarlos en cada render.
   ------------------------------------------------------------ */


// getElementById: el más directo cuando el elemento tiene id único
const zonaMensajes = document.getElementById("zona-mensajes");
const contenedorRescatados = document.getElementById("contenedor-rescatados");
const contenedorPreguntas = document.getElementById("contenedor-preguntas");
const contenedorEstadisticas = document.getElementById("estadisticas");
const cajaResultado = document.getElementById("resultado-solicitud");
const panelSalidas = document.getElementById("panel-salidas");
const contenedorSalidas = document.getElementById("contenedor-salidas");

// querySelector: acepta cualquier selector CSS
const formSolicitud = document.querySelector("#form-solicitud");
const formRescatado = document.querySelector("#form-rescatado");
const botonLimpiar = document.querySelector("#btn-limpiar-solicitud");
const inputBuscar = document.querySelector("#input-buscar");

// Campos de la solicitud
const inputNombre = document.querySelector("#input-nombre");
const inputEdad = document.querySelector("#input-edad");
const selectVivienda = document.querySelector("#select-vivienda");

// Campos del alta de un rescatado
const inputNombrePerro = document.querySelector("#input-nombre-perro");
const selectSexo = document.querySelector("#select-sexo");
const inputEdadPerro = document.querySelector("#input-edad-perro");
const selectPorte = document.querySelector("#select-porte");
const inputCosto = document.querySelector("#input-costo");


/* ------------------------------------------------------------
   2) ESTADO DE LA INTERFAZ
   Datos que no viven en el array pero cambian con el uso. Los
   escribe main.js y los lee el renderizado.
   ------------------------------------------------------------ */
let solicitudActual = null; // la última solicitud evaluada
let textoBusqueda = "";     // lo que se escribió en el buscador
let idResaltado = null;     // tarjeta que se resalta en el próximo render
let idPendienteBaja = null; // tarjeta que está esperando confirmación de salida


/* ------------------------------------------------------------
   3) FEEDBACK VISUAL
   ------------------------------------------------------------ */

// Crea un aviso con createElement, lo cuelga del DOM con appendChild
// y lo saca solo con remove() después de unos segundos.
function mostrarMensaje(texto, tipo) {
  const aviso = document.createElement("p");
  aviso.className = "aviso aviso-" + tipo;
  aviso.textContent = texto;

  zonaMensajes.innerHTML = ""; // saco el mensaje anterior
  zonaMensajes.appendChild(aviso);

  setTimeout(function () {
    aviso.remove();
  }, DURACION_MENSAJE);
}

// Marca en rojo el campo mal completado y escribe el motivo justo
// debajo, para que el error se lea sin depender de la franja de arriba.
function marcarError(campo, texto) {
  campo.classList.add("campo-error");

  const aviso = document.createElement("span");
  aviso.className = "error-campo";
  aviso.textContent = texto;
  campo.parentElement.appendChild(aviso);

  campo.focus(); // además lleva la pantalla hasta el campo
}

// Borra las marcas y los textos de error de todo el formulario.
function limpiarErrores() {
  // querySelectorAll devuelve una lista de nodos que se recorre con forEach
  document.querySelectorAll(".campo-error").forEach((campo) => campo.classList.remove("campo-error"));
  document.querySelectorAll(".error-campo").forEach((aviso) => aviso.remove());
}


/* ------------------------------------------------------------
   4) RENDERIZADO
   Cada función arma un texto con template strings (backticks) y lo
   inyecta con innerHTML en su contenedor.
   ------------------------------------------------------------ */

// El cuestionario sale del array PREGUNTAS: map arma los checkbox.
function renderizarPreguntas() {
  contenedorPreguntas.innerHTML = PREGUNTAS
    .map((pregunta, indice) => `
      <label class="pregunta" for="pregunta-${indice}">
        <input type="checkbox" id="pregunta-${indice}" class="check-pregunta">
        <span>${pregunta}</span>
      </label>
    `)
    .join("");
}

// INFORMA: true si el perro está reservado justamente por la persona
// que tiene la solicitud abierta en este momento.
function esSuPropiaReserva(rescatado) {
  return rescatado.reservado
    && solicitudActual !== null
    && rescatado.reservadoPor === solicitudActual.nombreAdoptante;
}

// Decide qué botón de acción va en cada tarjeta según el estado de
// la solicitud actual y la situación del perro. Retorna el HTML.
function plantillaBotonAccion(rescatado) {
  const esMiReserva = esSuPropiaReserva(rescatado);

  // Reservado por otra persona: no hay nada que hacer con él
  if (rescatado.reservado && esMiReserva === false) {
    return `<button class="boton boton-reservar" disabled>Reservado por ${rescatado.reservadoPor}</button>`;
  }

  if (solicitudActual === null) {
    return `<button class="boton boton-adoptar" disabled title="Primero completa la solicitud">Adoptar</button>`;
  }

  if (solicitudActual.fueAceptada() === false) {
    return `<button class="boton boton-adoptar" disabled title="Tu solicitud fue rechazada">Adoptar</button>`;
  }

  if (rescatado.esCompatibleCon(solicitudActual.puntosVivienda) === false) {
    return `<button class="boton boton-adoptar" disabled title="Necesita más espacio del que ofrece tu vivienda">Necesita más espacio</button>`;
  }

  // Reservado a nombre de quien está usando el simulador. Solo puede
  // llevárselo cuando su solicitud pasa de PREAPROBADA a APROBADA,
  // que es lo que representa haber pasado la visita al domicilio.
  if (esMiReserva) {
    if (solicitudActual.estado === "APROBADA") {
      return `<button class="boton boton-adoptar" data-accion="confirmar" data-id="${rescatado.id}" title="Tu solicitud quedó aprobada: ya puedes llevarlo">Confirmar mi reserva</button>`;
    }

    return `<button class="boton boton-reservar" disabled title="Falta la visita al domicilio para confirmar">Reservado a tu nombre</button>`;
  }

  if (solicitudActual.estado === "APROBADA") {
    return `<button class="boton boton-adoptar" data-accion="adoptar" data-id="${rescatado.id}">Adoptar</button>`;
  }

  return `<button class="boton boton-reservar" data-accion="reservar" data-id="${rescatado.id}">Reservar</button>`;
}

// El botón para sacar al perro del refugio tiene tres estados:
// bloqueado si otra persona lo reservó, esperando confirmación si ya
// se hizo un primer clic, o listo para el primer clic.
function plantillaBotonSalida(rescatado) {
  if (rescatado.reservado) {
    return `<button class="boton boton-baja" disabled title="No se puede: lo reservó ${rescatado.reservadoPor}">Pasó a tránsito</button>`;
  }

  if (rescatado.id === idPendienteBaja) {
    return `<button class="boton boton-baja boton-confirmar" data-accion="baja" data-id="${rescatado.id}" title="Vuelve a pulsar para confirmar">¿Confirmar?</button>`;
  }

  return `<button class="boton boton-baja" data-accion="baja" data-id="${rescatado.id}" title="Sale del listado porque va a un hogar de tránsito">Pasó a tránsito</button>`;
}

// La tarjeta de un rescatado, armada con backticks.
function plantillaTarjeta(rescatado) {
  const claseReservada = rescatado.reservado ? " tarjeta-reservada" : "";
  const claseResaltada = rescatado.id === idResaltado ? " tarjeta-nueva" : "";
  const etiquetaCachorro = rescatado.esCachorro()
    ? `<span class="etiqueta etiqueta-cachorro">cachorro</span>`
    : "";

  return `
    <article class="tarjeta${claseReservada}${claseResaltada}" data-id="${rescatado.id}">
      <div class="tarjeta-cabecera">
        <h3>🐶 ${rescatado.nombre}</h3>
        <span class="etiqueta etiqueta-${rescatado.estadoTexto()}">${rescatado.estadoTexto()}</span>
      </div>
      <p class="tarjeta-datos">${rescatado.sexo} · porte ${rescatado.tamanio} · ${rescatado.textoEdad()} ${etiquetaCachorro}</p>
      <p class="tarjeta-costo">Mantenimiento: ${enPesos(rescatado.costoMensual)} por mes</p>
      <div class="tarjeta-acciones">
        ${plantillaBotonAccion(rescatado)}
        ${plantillaBotonSalida(rescatado)}
      </div>
    </article>
  `;
}

// Recorre el array con map y vuelca todas las tarjetas de una vez.
function renderizarRescatados() {
  const visibles = obtenerListaVisible();

  if (visibles.length === 0) {
    contenedorRescatados.innerHTML = `
      <p class="vacio">No hay rescatados que coincidan con "${textoBusqueda}".</p>
    `;
    return;
  }

  contenedorRescatados.innerHTML = visibles.map(plantillaTarjeta).join("");

  // El resaltado dura un solo render
  idResaltado = null;
}

// Los números del refugio, calculados con reduce.
function renderizarEstadisticas() {
  const datos = calcularEstadisticas(rescatados);
  const visibles = obtenerListaVisible().length;

  let filtro = "";

  if (textoBusqueda.trim() !== "") {
    filtro = `
      <div class="dato">
        <span class="dato-valor">${visibles}</span>
        <span class="dato-titulo">en pantalla</span>
      </div>
    `;
  }

  contenedorEstadisticas.innerHTML = `
    ${filtro}
    <div class="dato">
      <span class="dato-valor">${datos.total}</span>
      <span class="dato-titulo">en el refugio</span>
    </div>
    <div class="dato">
      <span class="dato-valor">${datos.disponibles}</span>
      <span class="dato-titulo">disponibles</span>
    </div>
    <div class="dato">
      <span class="dato-valor">${datos.reservados}</span>
      <span class="dato-titulo">reservados</span>
    </div>
    <div class="dato">
      <span class="dato-valor">${contarAdopciones(salidas)}</span>
      <span class="dato-titulo">adoptados</span>
    </div>
    <div class="dato">
      <span class="dato-valor">${enPesos(datos.costo)}</span>
      <span class="dato-titulo">gasto mensual</span>
    </div>
  `;
}

// El registro de salidas. Mientras no haya ninguna, el panel entero
// queda oculto con la clase "oculto".
function renderizarSalidas() {
  if (salidas.length === 0) {
    panelSalidas.classList.add("oculto");
    contenedorSalidas.innerHTML = "";
    return;
  }

  panelSalidas.classList.remove("oculto");

  // map convierte cada salida en una línea de la lista
  contenedorSalidas.innerHTML = salidas
    .map((salida) => {
      const esAdopcion = salida.motivo === MOTIVO_ADOPCION;
      const icono = esAdopcion ? "🎉" : "🏠";
      const clase = esAdopcion ? "salida-adopcion" : "salida-transito";
      const detalle = esAdopcion
        ? `adoptad${salida.rescatado.sexo === "hembra" ? "a" : "o"} por <strong>${salida.destino}</strong>`
        : `pasó a ${salida.destino}`;

      return `
        <li class="salida ${clase}">
          <span class="salida-icono">${icono}</span>
          <span class="salida-texto"><strong>${salida.rescatado.nombre}</strong> · ${detalle}</span>
        </li>
      `;
    })
    .join("");
}

// Dibuja el resultado de la solicitud debajo del formulario.
function renderizarResultado(solicitud) {
  const porcentaje = Math.round((solicitud.puntaje / PUNTAJE_MAXIMO) * 100);
  const compatibles = rescatados
    .filter(crearFiltroPorVivienda(solicitud.puntosVivienda))
    .filter(estaLibre);

  let titulo = "";
  let detalle = "";

  if (solicitud.estado === "APROBADA") {
    titulo = "✅ Solicitud APROBADA";
    detalle = `Ya puedes elegir a tu compañero. Tienes ${compatibles.length} perro(s) compatibles con ${solicitud.tipoVivienda}.`;
  } else if (solicitud.estado === "PREAPROBADA") {
    titulo = "🟡 Solicitud PREAPROBADA";
    detalle = `Puedes <strong>reservar</strong> uno de los ${compatibles.length} perro(s) compatibles, pero todavía no llevarlo: primero coordinamos la visita al domicilio.`;
  } else {
    const faltaron = PUNTAJE_SEGUIMIENTO - solicitud.puntaje;
    titulo = "⛔ Solicitud RECHAZADA por ahora";
    detalle = `Te faltaron ${faltaron} punto(s) para el mínimo. ¿Te sumas como hogar de tránsito?`;
  }

  const clase = "resultado-" + solicitud.estado.toLowerCase();

  cajaResultado.className = "resultado " + clase;
  cajaResultado.innerHTML = `
    <h3>${titulo}</h3>
    <p><strong>${solicitud.nombreAdoptante}</strong> · ${solicitud.tipoVivienda}</p>
    <div class="barra"><div class="barra-relleno" style="width: ${porcentaje}%"></div></div>
    <p>Puntaje: ${solicitud.puntaje} de ${PUNTAJE_MAXIMO}</p>
    <p>${detalle}</p>
    <p>${obtenerRecomendacion(solicitud.puntosVivienda)}</p>
  `;
}

// Vuelve a dibujar todo lo que depende del array.
function actualizarVista() {
  renderizarRescatados();
  renderizarEstadisticas();
  renderizarSalidas();
}