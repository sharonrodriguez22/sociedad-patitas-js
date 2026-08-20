/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   main.js · Eventos y arranque

   El punto de entrada. Conecta lo que hace el usuario con la lógica
   del refugio y le pide a vista.js que vuelva a dibujar.

   Es el último script que carga: para cuando se ejecuta, las clases,
   los datos y las funciones de dibujo ya están disponibles.
   ============================================================ */

/* ------------------------------------------------------------
   1) MANEJADORES DE EVENTOS
   ------------------------------------------------------------ */

// EVENTO submit del formulario de solicitud.
function manejarSolicitud(evento) {
  evento.preventDefault(); // sin esto la página se recargaría
  limpiarErrores();

  const nombre = inputNombre.value.trim();
  const edad = Number(inputEdad.value);
  const puntosVivienda = Number(selectVivienda.value);

  // ----- validaciones, cada una con su feedback -----
  if (nombre.length < LARGO_MINIMO_NOMBRE) {
    marcarError(inputNombre, "Necesita al menos " + LARGO_MINIMO_NOMBRE + " caracteres.");
    mostrarMensaje("Escribe tu nombre completo (al menos " + LARGO_MINIMO_NOMBRE + " caracteres).", "error");
    return;
  }

  if (inputEdad.value === "" || edad < 1 || edad > EDAD_MAXIMA || edad % 1 !== 0) {
    marcarError(inputEdad, "Tiene que ser un número entero de años.");
    mostrarMensaje("Ingresa una edad válida, en años enteros.", "error");
    return;
  }

  if (edad < EDAD_MINIMA) {
    marcarError(inputEdad, "Hay que ser mayor de " + EDAD_MINIMA + " años para adoptar.");
    mostrarMensaje("Para adoptar hay que ser mayor de " + EDAD_MINIMA + " años, pero puedes sumarte como voluntario/a. 🐾", "error");
    return;
  }

  if (selectVivienda.value === "") {
    marcarError(selectVivienda, "Falta elegir el tipo de vivienda.");
    mostrarMensaje("Elige el tipo de vivienda donde viviría el perro.", "error");
    return;
  }

  // ----- se crea la instancia con los datos ya validados -----
  const tipoVivienda = selectVivienda.options[selectVivienda.selectedIndex].textContent;
  const solicitud = new Solicitud(nombre, edad, tipoVivienda, puntosVivienda);

  // querySelectorAll + forEach: sumo 2 puntos por cada respuesta marcada
  const respuestas = document.querySelectorAll(".check-pregunta");

  respuestas.forEach(function (casilla) {
    if (casilla.checked) {
      solicitud.sumarPuntos(PUNTOS_POR_SI);
    }
  });

  solicitud.evaluar();
  solicitudActual = solicitud;

  renderizarResultado(solicitud);
  actualizarVista(); // los botones de las tarjetas cambian según el estado

  if (solicitud.estado === "APROBADA") {
    mostrarMensaje("¡Felicitaciones, " + nombre + "! Tu solicitud fue aprobada: elige un perro de la lista.", "exito");
  } else if (solicitud.estado === "PREAPROBADA") {
    mostrarMensaje(nombre + ", tu solicitud quedó preaprobada. Puedes reservar un perro hasta la visita.", "info");
  } else {
    mostrarMensaje(nombre + ", por ahora no podemos aprobar la adopción. Revisa el detalle debajo del formulario.", "error");
  }
}

// EVENTO click en "Limpiar": borra el formulario y el resultado.
function manejarLimpiarSolicitud() {
  formSolicitud.reset();
  limpiarErrores();

  solicitudActual = null;
  cajaResultado.className = "resultado";
  cajaResultado.innerHTML = "";

  actualizarVista();
  mostrarMensaje("Formulario limpio. Puedes cargar una solicitud nueva.", "info");
}

// EVENTO submit del formulario de alta de un rescatado.
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
    mostrarMensaje("El nombre del perro necesita al menos " + LARGO_MINIMO_NOMBRE + " caracteres.", "error");
    return;
  }

  // find: no puede haber dos perros con el mismo nombre en el refugio
  if (buscarPorNombre(rescatados, nombre) !== undefined) {
    marcarError(inputNombrePerro, "Ya hay un rescatado con ese nombre en el refugio.");
    mostrarMensaje("Ya hay un rescatado que se llama " + nombre + ". Elige otro nombre.", "error");
    return;
  }

  if (sexo === "") {
    marcarError(selectSexo, "Falta indicar el sexo.");
    mostrarMensaje("Indica si es macho o hembra.", "error");
    return;
  }

  if (inputEdadPerro.value === "" || edad < 0 || edad > 25 || edad % 1 !== 0) {
    marcarError(inputEdadPerro, "Tiene que ser un número entero entre 0 y 25.");
    mostrarMensaje("La edad del perro tiene que ser un número entero entre 0 y 25.", "error");
    return;
  }

  if (porte === "") {
    marcarError(selectPorte, "Falta elegir el porte.");
    mostrarMensaje("Elige el porte del perro.", "error");
    return;
  }

  if (inputCosto.value === "" || costo <= 0) {
    marcarError(inputCosto, "Falta el costo mensual y tiene que ser mayor que cero.");
    mostrarMensaje("Carga cuánto cuesta mantenerlo por mes.", "error");
    return;
  }

  // push: la instancia nueva se suma al array y la vista se redibuja
  const nuevo = new Rescatado(generarId(rescatados), nombre, sexo, edad, porte, costo);
  rescatados.push(nuevo);

  idResaltado = nuevo.id; // para que su tarjeta aparezca destacada
  textoBusqueda = "";
  inputBuscar.value = "";

  formRescatado.reset();
  actualizarVista();

  mostrarMensaje(nombre + " ingresó al refugio. Ya aparece en la lista. 🐾", "exito");
}

// EVENTO click en el contenedor de tarjetas.
// Se pone UN solo listener en el contenedor en lugar de uno por botón:
// como las tarjetas se vuelven a dibujar en cada render, sus botones
// son nuevos cada vez y perderían su listener.
function manejarClickEnTarjetas(evento) {
  const boton = evento.target;
  const accion = boton.dataset.accion;

  // Si el clic no cayó sobre un botón con acción, no hay nada que hacer
  if (accion === undefined) {
    return;
  }

  const id = Number(boton.dataset.id);
  const rescatado = buscarPorId(rescatados, id);

  if (rescatado === undefined) {
    return;
  }

  // Red de seguridad: sin una solicitud aceptada no se entrega ni se
  // reserva ningún perro. Los botones ya vienen deshabilitados, pero
  // la comprobación evita cualquier sorpresa.
  if (solicitudActual === null || solicitudActual.fueAceptada() === false) {
    if (accion === "adoptar" || accion === "reservar" || accion === "confirmar") {
      mostrarMensaje("Primero completa el formulario de solicitud.", "error");
      return;
    }
  }

  if (accion === "confirmar") {
    idPendienteBaja = null;

    // adoptar() acepta la entrega porque la reserva es de esta misma
    // persona: si fuera de otra, el método devolvería false.
    rescatado.adoptar(solicitudActual.nombreAdoptante);
    registrarSalida(rescatado, MOTIVO_ADOPCION, rescatado.adoptadoPor);

    actualizarVista();
    mostrarMensaje("🎉 Visita aprobada: " + rescatado.nombre + " ya se va con " + rescatado.adoptadoPor + ". Quedó anotado en el registro de salidas.", "exito");
    return;
  }

  if (accion === "adoptar") {
    idPendienteBaja = null; // cualquier otra acción cancela una confirmación pendiente

    rescatado.adoptar(solicitudActual.nombreAdoptante);

    // registrarSalida lo saca del refugio y lo anota en el registro
    registrarSalida(rescatado, MOTIVO_ADOPCION, rescatado.adoptadoPor);

    actualizarVista();
    mostrarMensaje("🎉 " + rescatado.nombre + " se va con " + rescatado.adoptadoPor + ". Quedó anotado en el registro de salidas.", "exito");
    return;
  }

  if (accion === "reservar") {
    idPendienteBaja = null;

    rescatado.reservar(solicitudActual.nombreAdoptante);

    idResaltado = rescatado.id;
    actualizarVista();
    mostrarMensaje("🔖 " + rescatado.nombre + " queda reservado para " + rescatado.reservadoPor + " hasta la visita al domicilio.", "info");
    return;
  }

  if (accion === "baja") {
    // Primer clic: no se ejecuta nada todavía, el botón pasa a pedir
    // confirmación. El segundo clic sobre ese mismo botón sí ejecuta.
    if (idPendienteBaja !== rescatado.id) {
      idPendienteBaja = rescatado.id;
      actualizarVista();
      mostrarMensaje("¿Confirmas que " + rescatado.nombre + " pasa a un hogar de tránsito? Vuelve a pulsar el botón.", "info");
      return;
    }

    // Segundo clic: remove() borra la tarjeta de la pantalla en el acto
    const tarjeta = boton.closest(".tarjeta");
    tarjeta.remove();

    idPendienteBaja = null;
    registrarSalida(rescatado, MOTIVO_TRANSITO, "un hogar de tránsito");

    actualizarVista();
    mostrarMensaje("🏠 " + rescatado.nombre + " pasó a un hogar de tránsito y salió del listado.", "info");
  }
}

// EVENTO de teclado: filtra la lista mientras se escribe.
function manejarBusqueda(evento) {
  idPendienteBaja = null; // al buscar se cancela cualquier confirmación pendiente
  textoBusqueda = evento.target.value;
  actualizarVista();
}

// EVENTO de teclado: Escape limpia el buscador.
function manejarTeclaEnBuscador(evento) {
  if (evento.key === "Escape") {
    inputBuscar.value = "";
    textoBusqueda = "";
    actualizarVista();
    mostrarMensaje("Búsqueda limpia: se muestran todos los rescatados.", "info");
  }
}


/* ------------------------------------------------------------
   2) CONEXIÓN DE LOS EVENTOS
   Se pasa el nombre de la función SIN paréntesis: es la receta que
   el navegador ejecuta cuando ocurre el evento, no ahora mismo.
   ------------------------------------------------------------ */
formSolicitud.addEventListener("submit", manejarSolicitud);
botonLimpiar.addEventListener("click", manejarLimpiarSolicitud);
formRescatado.addEventListener("submit", manejarAltaRescatado);
contenedorRescatados.addEventListener("click", manejarClickEnTarjetas);
inputBuscar.addEventListener("keyup", manejarBusqueda);
inputBuscar.addEventListener("keydown", manejarTeclaEnBuscador);


/* ------------------------------------------------------------
   3) ARRANQUE
   Los scripts están enlazados con defer, así que el HTML ya está
   listo cuando llega hasta aquí.
   ------------------------------------------------------------ */
renderizarPreguntas();
actualizarVista();
mostrarMensaje("Bienvenida a " + REFUGIO + ". Completa la solicitud para poder adoptar.", "info");