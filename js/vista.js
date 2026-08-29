/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Entrega Final
   vista.js · Todo lo que toca la pantalla

   Este archivo concentra el DOM: guarda las referencias a los nodos y
   arma el HTML de cada pieza de la interfaz. Ningún otro archivo
   modifica la pantalla.

   Recibe los datos de datos.js y no decide nada de la lógica del
   refugio: solo la dibuja.

   Desde esta entrega, el feedback usa dos librerías externas:
   · SweetAlert2 → para decisiones que necesitan confirmación
   · Toastify   → para notificaciones rápidas que no interrumpen
   ============================================================ */

/* ------------------------------------------------------------
   1) SELECCIÓN DE ELEMENTOS DEL DOM
   ------------------------------------------------------------ */

const zonaMensajes = document.getElementById("zona-mensajes");
const contenedorRescatados = document.getElementById("contenedor-rescatados");
const contenedorPreguntas = document.getElementById("contenedor-preguntas");
const contenedorEstadisticas = document.getElementById("estadisticas");
const cajaResultado = document.getElementById("resultado-solicitud");
const botonReiniciar = document.querySelector("#btn-reiniciar");
const panelSalidas = document.getElementById("panel-salidas");
const contenedorSalidas = document.getElementById("contenedor-salidas");
const panelDestacado = document.getElementById("panel-destacado");
const contenidoDestacado = document.getElementById("contenido-destacado");
const inputPadrino = document.getElementById("input-padrino");

const formSolicitud = document.querySelector("#form-solicitud");
const formRescatado = document.querySelector("#form-rescatado");
const botonLimpiar = document.querySelector("#btn-limpiar-solicitud");
const inputBuscar = document.querySelector("#input-buscar");

const inputNombre = document.querySelector("#input-nombre");
const inputEdad = document.querySelector("#input-edad");
const selectVivienda = document.querySelector("#select-vivienda");

const inputNombrePerro = document.querySelector("#input-nombre-perro");
const selectSexo = document.querySelector("#select-sexo");
const inputEdadPerro = document.querySelector("#input-edad-perro");
const selectPorte = document.querySelector("#select-porte");
const inputCosto = document.querySelector("#input-costo");


/* ------------------------------------------------------------
   2) ESTADO DE LA INTERFAZ
   ------------------------------------------------------------ */
let solicitudActual = cargarSolicitud();
let textoBusqueda = "";
let idResaltado = null;


/* ------------------------------------------------------------
   3) FEEDBACK CON LIBRERÍAS EXTERNAS
   ------------------------------------------------------------ */

// Notificación rápida con Toastify: aparece en la esquina y se va
// sola. Reemplaza el aviso sticky anterior para mensajes que no
// necesitan acción del usuario.
function notificar(texto, tipo) {
  const colores = {
    exito: "linear-gradient(to right, #1B7468, #229386)",
    info: "linear-gradient(to right, #E09A1E, #F4B23E)",
    error: "linear-gradient(to right, #b23b3b, #e06060)"
  };

  Toastify({
    text: texto,
    duration: DURACION_MENSAJE,
    close: true,
    gravity: "top",
    position: "right",
    style: {
      background: colores[tipo] || colores.info,
      borderRadius: "22px",
      fontFamily: "'Nunito Sans', system-ui, sans-serif",
      fontSize: "0.9rem",
      fontWeight: "600",
      boxShadow: "0 6px 18px rgba(43, 39, 36, 0.15)",
      maxWidth: "420px"
    }
  }).showToast();
}

// Alerta con SweetAlert2: para mensajes importantes que el usuario
// necesita leer antes de continuar.
function alertar(titulo, texto, icono) {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: icono,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#229386",
    background: "#FBF8F1",
    color: "#2B2724"
  });
}

// Confirmación con SweetAlert2: reemplaza el patrón anterior de dos
// clics. Devuelve una promesa que resuelve a true si el usuario
// confirma.
function confirmar(titulo, texto, textoConfirmar) {
  return Swal.fire({
    title: titulo,
    text: texto,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: textoConfirmar || "Sí, confirmar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#b23b3b",
    cancelButtonColor: "#5E5852",
    background: "#FBF8F1",
    color: "#2B2724"
  }).then((resultado) => resultado.isConfirmed);
}


/* ------------------------------------------------------------
   4) ERRORES DE FORMULARIO
   ------------------------------------------------------------ */

function marcarError(campo, texto) {
  campo.classList.add("campo-error");

  const aviso = document.createElement("span");
  aviso.className = "error-campo";
  aviso.textContent = texto;
  campo.parentElement.appendChild(aviso);

  campo.focus();
}

function limpiarErrores() {
  document.querySelectorAll(".campo-error").forEach((campo) => campo.classList.remove("campo-error"));
  document.querySelectorAll(".error-campo").forEach((aviso) => aviso.remove());
}


/* ------------------------------------------------------------
   5) RENDERIZADO
   ------------------------------------------------------------ */

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

function esSuPropiaReserva(rescatado) {
  return rescatado.reservado && rescatado.reservadoPor === solicitudActual?.nombreAdoptante;
}

function plantillaBotonAccion(rescatado) {
  const esMiReserva = esSuPropiaReserva(rescatado);

  if (rescatado.reservado && esMiReserva === false) {
    return `<button class="btn btn--ghost" disabled>Reservado por ${rescatado.reservadoPor}</button>`;
  }

  if (solicitudActual === null) {
    return `<button class="btn btn--primary" disabled title="Primero completa la solicitud">Adoptar</button>`;
  }

  if (solicitudActual.fueAceptada() === false) {
    return `<button class="btn btn--primary" disabled title="Tu solicitud fue rechazada">Adoptar</button>`;
  }

  if (rescatado.esCompatibleCon(solicitudActual.puntosVivienda) === false) {
    return `<button class="btn btn--primary" disabled title="Necesita más espacio del que ofrece tu vivienda">Necesita más espacio</button>`;
  }

  if (esMiReserva) {
    if (solicitudActual.estado === "APROBADA") {
      return `<button class="btn btn--primary" data-accion="confirmar" data-id="${rescatado.id}" title="Tu solicitud quedó aprobada: ya puedes llevarlo">Confirmar mi reserva</button>`;
    }

    return `<button class="btn btn--ghost" disabled title="Falta la visita al domicilio para confirmar">Reservado a tu nombre</button>`;
  }

  if (solicitudActual.estado === "APROBADA") {
    return `<button class="btn btn--primary" data-accion="adoptar" data-id="${rescatado.id}">Adoptar</button>`;
  }

  return `<button class="btn btn--honey" data-accion="reservar" data-id="${rescatado.id}">Reservar</button>`;
}

// SweetAlert2 se encarga de pedir confirmación, así que el botón ya
// no necesita el patrón de dos clics.
function plantillaBotonSalida(rescatado) {
  if (rescatado.reservado) {
    return `<button class="btn btn--transit" disabled title="No se puede: lo reservó ${rescatado.reservadoPor}">Pasó a tránsito</button>`;
  }

  return `<button class="btn btn--transit" data-accion="baja" data-id="${rescatado.id}" title="Sale del listado porque va a un hogar de tránsito">Pasó a tránsito</button>`;
}

function plantillaBotonPadrinazgo(rescatado) {
  if (rescatado.apadrinado) {
    return `<button class="btn btn--sponsor" disabled title="Aporta ${enPesos(rescatado.cuotaPadrinazgo())} por mes">Apadrinado por ${rescatado.apadrinadoPor}</button>`;
  }

  return `<button class="btn btn--sponsor" data-accion="apadrinar" data-id="${rescatado.id}" title="Aporta ${enPesos(rescatado.cuotaPadrinazgo())} por mes sin llevarlo a casa">Apadrinar</button>`;
}

// Las tarjetas incluyen la foto del perro cuando está disponible.
// Las imágenes vienen de la API Dog CEO y se cargan de forma asíncrona.
function plantillaTarjeta(rescatado) {
  const { id, nombre, sexo, tamanio, costoMensual, reservado, apadrinado, foto } = rescatado;
  const textoSexo = sexo || "sin dato";

  const claseReservada = reservado ? " tarjeta--reservada" : "";
  const claseResaltada = id === idResaltado ? " tarjeta--nueva" : "";
  const claseApadrinada = apadrinado ? " tarjeta--apadrinada" : "";
  const etiquetaCachorro = rescatado.esCachorro()
    ? `<span class="tag tag--cachorro">cachorro</span>`
    : "";
  const etiquetaPadrino = apadrinado
    ? `<span class="tag tag--padrino">con padrino</span>`
    : "";

  const imagenHTML = foto
    ? `<div class="tarjeta__foto"><img src="${foto}" alt="Foto de ${nombre}" loading="lazy"></div>`
    : `<div class="tarjeta__foto tarjeta__foto--placeholder">
        <svg viewBox="0 0 200 160" aria-hidden="true"><ellipse cx="100" cy="100" rx="55" ry="50" fill="#fff"/><path d="M58 62c-9-15-5-30 5-30s16 16 10 30ZM142 62c9-15 5-30-5-30s-16 16-10 30Z" fill="#F4EEE2"/><circle cx="82" cy="92" r="6" fill="#2B2724"/><circle cx="118" cy="92" r="6" fill="#2B2724"/><ellipse cx="100" cy="110" rx="9" ry="6" fill="#2B2724"/></svg>
      </div>`;

  return `
    <article class="tarjeta${claseReservada}${claseResaltada}${claseApadrinada}" data-id="${id}">
      ${imagenHTML}
      <div class="tarjeta__body">
        <div class="tarjeta__header">
          <h3>${nombre}</h3>
          <span class="tag tag--${rescatado.estadoTexto()}">${rescatado.estadoTexto()}</span>
        </div>
        <p class="tarjeta__meta">${textoSexo} · porte ${tamanio} · ${rescatado.textoEdad()} ${etiquetaCachorro} ${etiquetaPadrino}</p>
        <p class="tarjeta__cost">Mantenimiento: ${enPesos(costoMensual)} por mes</p>
        <div class="tarjeta__actions">
          ${plantillaBotonAccion(rescatado)}
          ${plantillaBotonPadrinazgo(rescatado)}
          ${plantillaBotonSalida(rescatado)}
        </div>
      </div>
    </article>
  `;
}

function renderizarRescatados() {
  const visibles = obtenerListaVisible();

  if (visibles.length === 0) {
    contenedorRescatados.innerHTML = `
      <p class="vacio">No hay rescatados que coincidan con "${textoBusqueda}".</p>
    `;
    return;
  }

  contenedorRescatados.innerHTML = visibles.map(plantillaTarjeta).join("");
  idResaltado = null;
}

function renderizarEstadisticas() {
  const datos = calcularEstadisticas(rescatados);
  const visibles = obtenerListaVisible().length;

  let filtro = "";

  if (textoBusqueda.trim() !== "") {
    filtro = `
      <div class="stat">
        <span class="stat__num">${visibles}</span>
        <span class="stat__label">en pantalla</span>
      </div>
    `;
  }

  contenedorEstadisticas.innerHTML = `
    ${filtro}
    <div class="stat">
      <span class="stat__num">${datos.total}</span>
      <span class="stat__label">en el refugio</span>
    </div>
    <div class="stat">
      <span class="stat__num">${datos.disponibles}</span>
      <span class="stat__label">disponibles</span>
    </div>
    <div class="stat">
      <span class="stat__num">${datos.reservados}</span>
      <span class="stat__label">reservados</span>
    </div>
    <div class="stat">
      <span class="stat__num">${contarAdopciones(salidas)}</span>
      <span class="stat__label">adoptados</span>
    </div>
    <div class="stat">
      <span class="stat__num">${contarApadrinados(rescatados)}</span>
      <span class="stat__label">apadrinados</span>
    </div>
    <div class="stat">
      <span class="stat__num">${enPesos(datos.costo)}</span>
      <span class="stat__label">gasto mensual</span>
    </div>
  `;
}

function renderizarSalidas() {
  if (salidas.length === 0) {
    panelSalidas.classList.add("oculto");
    contenedorSalidas.innerHTML = "";
    return;
  }

  panelSalidas.classList.remove("oculto");

  contenedorSalidas.innerHTML = [...salidas]
    .reverse()
    .map(({ rescatado, motivo, destino }) => {
      const esAdopcion = motivo === MOTIVO_ADOPCION;
      const icono = esAdopcion ? "🎉" : "🏠";
      const clase = esAdopcion ? "salida--adopcion" : "salida--transito";
      const detalle = esAdopcion
        ? `adoptad${rescatado.sexo === "hembra" ? "a" : "o"} por <strong>${destino}</strong>`
        : `pasó a ${destino}`;

      return `
        <li class="salida ${clase}">
          <span class="salida__icon">${icono}</span>
          <span class="salida__text"><strong>${rescatado.nombre}</strong> · ${detalle}</span>
        </li>
      `;
    })
    .join("");
}

function renderizarResultado(solicitud) {
  const { nombreAdoptante, tipoVivienda, puntaje, puntosVivienda, estado } = solicitud;

  const porcentaje = Math.round((puntaje / PUNTAJE_MAXIMO) * 100);
  const compatibles = rescatados
    .filter(crearFiltroPorVivienda(puntosVivienda))
    .filter(estaLibre);

  let titulo = "";
  let detalle = "";

  if (estado === "APROBADA") {
    titulo = "Solicitud APROBADA";
    detalle = `Ya puedes elegir a tu compañero. Tienes ${compatibles.length} perro(s) compatibles con ${tipoVivienda}.`;
  } else if (estado === "PREAPROBADA") {
    titulo = "Solicitud PREAPROBADA";
    detalle = `Puedes <strong>reservar</strong> uno de los ${compatibles.length} perro(s) compatibles, pero todavía no llevarlo: primero coordinamos la visita al domicilio.`;
  } else {
    const faltaron = PUNTAJE_SEGUIMIENTO - puntaje;
    titulo = "Solicitud RECHAZADA por ahora";
    detalle = `Te faltaron ${faltaron} punto(s) para el mínimo. ¿Te sumas como hogar de tránsito?`;
  }

  cajaResultado.className = "resultado resultado--" + estado.toLowerCase();
  cajaResultado.innerHTML = `
    <h3>${titulo}</h3>
    <p><strong>${nombreAdoptante}</strong> · ${tipoVivienda}</p>
    <div class="barra"><div class="barra__fill" style="width: ${porcentaje}%"></div></div>
    <p>Puntaje: ${puntaje} de ${PUNTAJE_MAXIMO}</p>
    <p>${detalle}</p>
    <p>${obtenerRecomendacion(puntosVivienda)}</p>
  `;
}

/* ------------------------------------------------------------
   RESCATADO DE LA SEMANA
   ------------------------------------------------------------ */

function renderizarDestacado(rescatado, esperando, cuota) {
  contenidoDestacado.innerHTML = `
    <p class="destacado__name">${rescatado.nombre}</p>
    <p class="destacado__data">${rescatado.sexo} · porte ${rescatado.tamanio} · ${rescatado.textoEdad()}</p>
    <p class="destacado__fee">Apadrinarlo cuesta <strong>${enPesos(cuota)} por mes</strong>,
      la mitad de lo que sale mantenerlo.</p>
    <p class="destacado__wait">Hay ${esperando} ${esperando === 1 ? "perro esperando" : "perros esperando"} hogar en este momento.</p>
  `;
}

function renderizarDestacadoVacio(motivo) {
  contenidoDestacado.innerHTML = `
    <p class="destacado__name">Sin destacado esta semana</p>
    <p class="destacado__data">No se pudo elegir un rescatado: ${motivo}.</p>
    <p class="destacado__wait">Registra un ingreso en el paso 3 o reinicia el refugio
      para volver a verlo.</p>
  `;
}

function actualizarVista() {
  renderizarRescatados();
  renderizarEstadisticas();
  renderizarSalidas();
}
