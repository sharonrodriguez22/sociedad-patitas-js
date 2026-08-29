/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Entrega Final
   main.js · Eventos y arranque

   El punto de entrada. Conecta lo que hace el usuario con la lógica
   del refugio y le pide a vista.js que vuelva a dibujar.

   Desde esta entrega, las confirmaciones pasan por SweetAlert2 en
   lugar del patrón anterior de dos clics. Eso convierte los
   manejadores que confirman en funciones async.
   ============================================================ */

/* ------------------------------------------------------------
   1) MANEJADORES DE EVENTOS
   ------------------------------------------------------------ */

function manejarSolicitud(evento) {
  evento.preventDefault();
  limpiarErrores();

  const nombre = inputNombre.value.trim();
  const edad = Number(inputEdad.value);
  const puntosVivienda = Number(selectVivienda.value);

  if (nombre.length < LARGO_MINIMO_NOMBRE) {
    marcarError(inputNombre, "Necesita al menos " + LARGO_MINIMO_NOMBRE + " caracteres.");
    notificar("Escribe tu nombre completo (al menos " + LARGO_MINIMO_NOMBRE + " caracteres).", "error");
    return;
  }

  if (inputEdad.value === "" || edad < 1 || edad > EDAD_MAXIMA || edad % 1 !== 0) {
    marcarError(inputEdad, "Tiene que ser un número entero de años.");
    notificar("Ingresa una edad válida, en años enteros.", "error");
    return;
  }

  if (edad < EDAD_MINIMA) {
    marcarError(inputEdad, "Hay que ser mayor de " + EDAD_MINIMA + " años para adoptar.");
    notificar("Para adoptar hay que ser mayor de " + EDAD_MINIMA + " años.", "error");
    return;
  }

  if (selectVivienda.value === "") {
    marcarError(selectVivienda, "Falta elegir el tipo de vivienda.");
    notificar("Elige el tipo de vivienda donde viviría el perro.", "error");
    return;
  }

  const tipoVivienda = selectVivienda.options[selectVivienda.selectedIndex].textContent;
  const solicitud = new Solicitud(nombre, edad, tipoVivienda, puntosVivienda);

  const respuestas = document.querySelectorAll(".check-pregunta");

  respuestas.forEach(function (casilla) {
    if (casilla.checked) {
      solicitud.sumarPuntos(PUNTOS_POR_SI);
    }
  });

  solicitud.evaluar();
  solicitudActual = solicitud;

  guardarSesion(CLAVE_SOLICITUD, solicitud);

  renderizarResultado(solicitud);
  actualizarVista();

  if (solicitud.estado === "APROBADA") {
    alertar("¡Felicitaciones, " + nombre + "!", "Tu solicitud fue aprobada. Elige un perro de la lista.", "success");
  } else if (solicitud.estado === "PREAPROBADA") {
    alertar("Solicitud preaprobada", nombre + ", puedes reservar un perro hasta que coordinemos la visita al domicilio.", "info");
  } else {
    alertar("Solicitud rechazada", nombre + ", por ahora no podemos aprobar la adopción. Revisa el detalle debajo del formulario.", "error");
  }
}

function manejarLimpiarSolicitud() {
  formSolicitud.reset();
  limpiarErrores();

  solicitudActual = null;
  borrarSesion(CLAVE_SOLICITUD);

  cajaResultado.className = "resultado";
  cajaResultado.innerHTML = "";

  actualizarVista();
  notificar("Formulario limpio. Puedes cargar una solicitud nueva.", "info");
}

function manejarAltaRescatado(evento) {
  evento.preventDefault();
  limpiarErrores();

  const nombre = inputNombrePerro.value.trim();
  const sexo = selectSexo.value;
  const edad = Number(inputEdadPerro.value);
  const porte = selectPorte.value;
  const costo = Number(inputCosto.value);

  if (nombre.length < LARGO_MINIMO_NOMBRE) {
    marcarError(inputNombrePerro, "Necesita al menos " + LARGO_MINIMO_NOMBRE + " caracteres.");
    notificar("El nombre del perro necesita al menos " + LARGO_MINIMO_NOMBRE + " caracteres.", "error");
    return;
  }

  if (buscarPorNombre(rescatados, nombre) !== undefined) {
    marcarError(inputNombrePerro, "Ya hay un rescatado con ese nombre en el refugio.");
    notificar("Ya hay un rescatado que se llama " + nombre + ". Elige otro nombre.", "error");
    return;
  }

  if (sexo === "") {
    marcarError(selectSexo, "Falta indicar el sexo.");
    notificar("Indica si es macho o hembra.", "error");
    return;
  }

  if (inputEdadPerro.value === "" || edad < 0 || edad > 25 || edad % 1 !== 0) {
    marcarError(inputEdadPerro, "Tiene que ser un número entero entre 0 y 25.");
    notificar("La edad del perro tiene que ser un número entero entre 0 y 25.", "error");
    return;
  }

  if (porte === "") {
    marcarError(selectPorte, "Falta elegir el porte.");
    notificar("Elige el porte del perro.", "error");
    return;
  }

  if (inputCosto.value === "" || costo <= 0) {
    marcarError(inputCosto, "Falta el costo mensual y tiene que ser mayor que cero.");
    notificar("Carga cuánto cuesta mantenerlo por mes.", "error");
    return;
  }

  const nuevo = new Rescatado(generarId(rescatados), nombre, sexo, edad, porte, costo);
  rescatados.push(nuevo);
  persistirEstado();

  idResaltado = nuevo.id;
  textoBusqueda = "";
  inputBuscar.value = "";

  formRescatado.reset();
  actualizarVista();

  notificar(nombre + " ingresó al refugio. Ya aparece en la lista.", "exito");

  // Le busca una foto al nuevo rescatado sin frenar la interfaz
  cargarFotosDesdeAPI().catch(function () {
    notificar("No se pudo cargar la foto de " + nombre + " desde la API.", "info");
  });
}

// El padrinazgo sigue usando try/catch/finally como en la PE9.
function apadrinarRescatado(rescatado) {
  limpiarErrores();

  try {
    const nombrePadrino = inputPadrino.value.trim();

    if (nombrePadrino.length < LARGO_MINIMO_NOMBRE) {
      throw new Error("Deja tu nombre completo para registrar el padrinazgo.");
    }

    if (rescatado.apadrinar(nombrePadrino) === false) {
      throw new Error(rescatado.nombre + " ya tiene padrino o madrina.");
    }

    persistirEstado();
    idResaltado = rescatado.id;

    notificar(
      nombrePadrino + " apadrinó a " + rescatado.nombre +
      ". Aporta " + enPesos(rescatado.cuotaPadrinazgo()) + " por mes.",
      "exito"
    );
  } catch (error) {
    marcarError(inputPadrino, error.message);
    notificar(error.message, "error");
  } finally {
    actualizarVista();
  }
}

// Los clics en las tarjetas ahora son async porque la confirmación de
// tránsito y adopción pasa por SweetAlert2.
async function manejarClickEnTarjetas(evento) {
  const boton = evento.target;
  const accion = boton.dataset.accion;

  if (accion === undefined) {
    return;
  }

  const id = Number(boton.dataset.id);
  const rescatado = buscarPorId(rescatados, id);

  if (rescatado === undefined) {
    return;
  }

  if (solicitudActual === null || solicitudActual.fueAceptada() === false) {
    if (accion === "adoptar" || accion === "reservar" || accion === "confirmar") {
      notificar("Primero completa el formulario de solicitud.", "error");
      return;
    }
  }

  if (accion === "confirmar") {
    const acepta = await confirmar(
      "Confirmar adopción",
      "¿" + solicitudActual.nombreAdoptante + " se lleva a " + rescatado.nombre + "?",
      "Sí, confirmar adopción"
    );

    if (acepta === false) {
      return;
    }

    rescatado.adoptar(solicitudActual.nombreAdoptante);
    registrarSalida(rescatado, MOTIVO_ADOPCION, rescatado.adoptadoPor);
    persistirEstado();

    actualizarVista();
    alertar("¡Adopción confirmada!", rescatado.nombre + " se va con " + rescatado.adoptadoPor + ". Quedó en el registro de salidas.", "success");
    return;
  }

  if (accion === "adoptar") {
    const acepta = await confirmar(
      "Confirmar adopción",
      "¿" + solicitudActual.nombreAdoptante + " adopta a " + rescatado.nombre + "?",
      "Sí, adoptar"
    );

    if (acepta === false) {
      return;
    }

    rescatado.adoptar(solicitudActual.nombreAdoptante);
    registrarSalida(rescatado, MOTIVO_ADOPCION, rescatado.adoptadoPor);
    persistirEstado();

    actualizarVista();
    alertar("¡Felicitaciones!", rescatado.nombre + " se va con " + rescatado.adoptadoPor + ". Quedó en el registro de salidas.", "success");
    return;
  }

  if (accion === "apadrinar") {
    apadrinarRescatado(rescatado);
    return;
  }

  if (accion === "reservar") {
    rescatado.reservar(solicitudActual.nombreAdoptante);
    persistirEstado();

    idResaltado = rescatado.id;
    actualizarVista();
    notificar(rescatado.nombre + " queda reservado para " + rescatado.reservadoPor + " hasta la visita.", "info");
    return;
  }

  if (accion === "baja") {
    const acepta = await confirmar(
      "Salida a tránsito",
      "¿Confirmas que " + rescatado.nombre + " pasa a un hogar de tránsito? Se retira de la lista.",
      "Sí, enviar a tránsito"
    );

    if (acepta === false) {
      return;
    }

    registrarSalida(rescatado, MOTIVO_TRANSITO, "un hogar de tránsito");
    persistirEstado();

    actualizarVista();
    notificar(rescatado.nombre + " pasó a un hogar de tránsito y salió del listado.", "info");
  }
}

// El reinicio ahora pide confirmación con SweetAlert2.
async function manejarReinicio() {
  const acepta = await confirmar(
    "Reiniciar el refugio",
    "Esto borra todos los datos guardados en el navegador y vuelve al estado inicial.",
    "Sí, reiniciar"
  );

  if (acepta === false) {
    return;
  }

  await reiniciarRefugio();

  solicitudActual = null;
  textoBusqueda = "";
  inputBuscar.value = "";

  formSolicitud.reset();
  formRescatado.reset();
  limpiarErrores();
  cajaResultado.className = "resultado";
  cajaResultado.innerHTML = "";

  actualizarVista();
  notificar("Refugio reiniciado: volvieron los 7 perros iniciales.", "exito");

  // Busca fotos para los perros reiniciados
  cargarFotosDesdeAPI().catch(function () {
    notificar("No se pudieron cargar las fotos desde la API.", "info");
  });
}

function manejarBusqueda(evento) {
  textoBusqueda = evento.target.value;
  actualizarVista();
}

function manejarTeclaEnBuscador(evento) {
  if (evento.key === "Escape") {
    inputBuscar.value = "";
    textoBusqueda = "";
    actualizarVista();
    notificar("Búsqueda limpia: se muestran todos los rescatados.", "info");
  }
}


/* ------------------------------------------------------------
   2) CONEXIÓN DE LOS EVENTOS
   ------------------------------------------------------------ */
formSolicitud.addEventListener("submit", manejarSolicitud);
botonLimpiar.addEventListener("click", manejarLimpiarSolicitud);
botonReiniciar.addEventListener("click", manejarReinicio);
formRescatado.addEventListener("submit", manejarAltaRescatado);
contenedorRescatados.addEventListener("click", manejarClickEnTarjetas);
inputBuscar.addEventListener("keyup", manejarBusqueda);
inputBuscar.addEventListener("keydown", manejarTeclaEnBuscador);


function repoblarFormularioSolicitud({ nombreAdoptante, edad, tipoVivienda }) {
  inputNombre.value = nombreAdoptante;
  inputEdad.value = edad;

  const opciones = Array.from(selectVivienda.options);
  const elegida = opciones.find((opcion) => opcion.textContent === tipoVivienda);

  selectVivienda.selectedIndex = elegida?.index ?? 0;
}

// El mensaje de bienvenida se muestra con Toastify.
function armarMensajeDeBienvenida() {
  if (hayAlmacenamiento() === false) {
    return "Tu navegador no permite guardar datos. El refugio arranca de cero en cada visita.";
  }

  const cantidad = salidas.length;

  return cantidad > 0
    ? "Bienvenida de nuevo a " + REFUGIO + ". Se recuperaron " + cantidad + " salida(s) registrada(s)."
    : "Bienvenida a " + REFUGIO + ". Completa la solicitud para poder adoptar.";
}

/* ------------------------------------------------------------
   3) ARRANQUE
   El inicio es async porque los datos del refugio pueden venir
   de data/rescatados.json si es la primera visita del usuario.
   ------------------------------------------------------------ */
async function arrancar() {
  await iniciarRefugio();

  renderizarPreguntas();
  actualizarVista();

  solicitudActual && renderizarResultado(solicitudActual);
  solicitudActual && repoblarFormularioSolicitud(solicitudActual);

  notificar(armarMensajeDeBienvenida(), "info");

  cargarDestacadoDeLaSemana();

  // Pide las fotos a la API Dog CEO. Si la petición falla, las
  // tarjetas se muestran sin foto y el usuario recibe un aviso.
  cargarFotosDesdeAPI();
}

arrancar();
