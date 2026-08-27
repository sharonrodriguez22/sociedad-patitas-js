/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 9
   datos.js · El array de objetos, su memoria y sus consultas

   La capa de datos del simulador. Al cargar la página levanta el
   estado guardado en el navegador; si no hay nada guardado, arranca
   con los perros iniciales. Después de cada cambio vuelve a guardar.

   Ninguna función de este archivo toca el DOM.
   ============================================================ */

/* ------------------------------------------------------------
   1) LOS PERROS CON LOS QUE ABRE EL REFUGIO
   Solo se usan la primera vez, o cuando se reinicia el simulador.
   ------------------------------------------------------------ */
function crearRescatadosIniciales() {
  const rocco = new Rescatado(1, "Rocco", "macho", 3, "grande", 25000);
  const luna = new Rescatado(2, "Luna", "hembra", 2, "chico", 12000);
  const pelusa = new Rescatado(3, "Pelusa", "hembra", 1, "mediano", 18000);
  const nube = new Rescatado(4, "Nube", "hembra", 5, "chico", 14000);
  const tobias = new Rescatado(5, "Tobías", "macho", 7, "mediano", 21000);
  const nina = new Rescatado(6, "Nina", "hembra", 1, "chico", 15000);
  const milo = new Rescatado(7, "Milo", "macho", 4, "mediano", 16000);

  return [rocco, luna, pelusa, nube, tobias, nina, milo];
}

/* ------------------------------------------------------------
   2) REHIDRATACIÓN
   Lo que vuelve del navegador conserva los datos de cada perro, pero
   no sus métodos: así como sale, no sabría responder esCompatibleCon()
   ni adoptar(). Por eso cada perro guardado se vuelve a construir como
   instancia de Rescatado antes de entrar al refugio.
   ------------------------------------------------------------ */
function rehidratarRescatado(datos) {
  const {
    id,
    nombre,
    sexo,
    edad,
    tamanio,
    costoMensual,
    reservado,
    reservadoPor,
    adoptado,
    adoptadoPor,
    apadrinado,
    apadrinadoPor
  } = datos;

  const rescatado = new Rescatado(id, nombre, sexo, edad, tamanio, costoMensual);

  // El constructor siempre crea al perro disponible, así que hay que
  // devolverle el estado de reserva, adopción y padrinazgo que tenía
  // guardado.
  rescatado.reservado = reservado;
  rescatado.reservadoPor = reservadoPor;
  rescatado.adoptado = adoptado;
  rescatado.adoptadoPor = adoptadoPor;
  rescatado.apadrinado = apadrinado ?? false;
  rescatado.apadrinadoPor = apadrinadoPor ?? "";

  return rescatado;
}

// Lo mismo para una solicitud guardada en la sesión.
function rehidratarSolicitud(datos) {
  const { nombreAdoptante, edad, tipoVivienda, puntosVivienda, puntaje, estado } = datos;

  const solicitud = new Solicitud(nombreAdoptante, edad, tipoVivienda, puntosVivienda);
  solicitud.puntaje = puntaje;
  solicitud.estado = estado;

  return solicitud;
}

/* ------------------------------------------------------------
   3) CARGA DEL ESTADO
   ------------------------------------------------------------ */

// Recupera los perros guardados. Si el refugio se abre por primera
// vez y no hay nada en memoria, arranca con la lista inicial.
function cargarRescatados() {
  const guardados = leerLocal(CLAVE_RESCATADOS);
  return guardados?.map(rehidratarRescatado) ?? crearRescatadosIniciales();
}

// Recupera el registro de salidas. Cada salida guardada tiene la
// forma { rescatado, motivo, destino }.
function cargarSalidas() {
  const guardadas = leerLocal(CLAVE_SALIDAS);

  return guardadas?.map(({ rescatado, motivo, destino }) => ({
    rescatado: rehidratarRescatado(rescatado),
    motivo: motivo,
    destino: destino
  })) ?? [];
}

// La solicitud vive en sessionStorage: sobrevive a un F5, no a cerrar
// la pestaña.
function cargarSolicitud() {
  const guardada = leerSesion(CLAVE_SOLICITUD);
  return guardada ? rehidratarSolicitud(guardada) : null;
}

/* ------------------------------------------------------------
   4) EL ESTADO VIVO
   Se arma una sola vez, al cargar la página.
   ------------------------------------------------------------ */
const rescatados = cargarRescatados();

/* ------------------------------------------------------------
   REGISTRO DE SALIDAS
   Cuando un perro deja el refugio hay que dejar constancia de qué
   pasó con él. Por eso no se borra sin más: sale de "rescatados" y
   entra en "salidas", que guarda un objeto literal por cada caso.
   ------------------------------------------------------------ */
const salidas = cargarSalidas();

// Motivos posibles de una salida
const MOTIVO_ADOPCION = "adopcion";
const MOTIVO_TRANSITO = "transito";

// Saca al perro del refugio y lo anota en el registro de salidas.
// Retorna el objeto que quedó anotado.
function registrarSalida(rescatado, motivo, destino) {
  const posicion = rescatados.indexOf(rescatado);

  if (posicion !== -1) {
    rescatados.splice(posicion, 1);
  }

  const salida = { rescatado: rescatado, motivo: motivo, destino: destino };
  salidas.push(salida);

  return salida;
}

// Cuántos perros del refugio ya tienen padrino o madrina.
function contarApadrinados(lista) {
  return lista.filter((rescatado) => rescatado.apadrinado).length;
}

// Cuántas de las salidas fueron adopciones.
function contarAdopciones(lista) {
  return lista.filter((salida) => salida.motivo === MOTIVO_ADOPCION).length;
}

/* ------------------------------------------------------------
   GUARDADO Y REINICIO
   ------------------------------------------------------------ */

// Se llama después de cada cambio: alta, adopción, reserva o salida.
// Retorna false si el navegador no dejó guardar.
function persistirEstado() {
  const guardoRescatados = guardarLocal(CLAVE_RESCATADOS, rescatados);
  const guardoSalidas = guardarLocal(CLAVE_SALIDAS, salidas);

  return guardoRescatados && guardoSalidas;
}

// Borra lo guardado y vuelve a dejar el refugio como el primer día.
function reiniciarRefugio() {
  vaciarAlmacenamiento();

  rescatados.length = 0;
  rescatados.push(...crearRescatadosIniciales());

  salidas.length = 0;
}

/* ------------------------------------------------------------
   CONSULTAS SOBRE EL ARRAY
   ------------------------------------------------------------ */

// Los rescatados que coinciden con lo escrito en el buscador.
function filtrarPorTexto(lista, texto) {
  const buscado = texto.trim().toLowerCase();

  if (buscado === "") {
    return lista;
  }

  return lista.filter((rescatado) => rescatado.nombre.toLowerCase().includes(buscado));
}

// Busca un rescatado por su id.
function buscarPorId(lista, id) {
  return lista.find((rescatado) => rescatado.id === id);
}

// Busca un rescatado por su nombre.
function buscarPorNombre(lista, nombre) {
  const buscado = nombre.trim().toLowerCase();
  return lista.find((rescatado) => rescatado.nombre.toLowerCase() === buscado);
}

// Calcula el id que le toca al próximo ingreso: el más alto que haya,
// más uno.
function generarId(lista) {
  return lista.reduce((mayor, rescatado) => Math.max(mayor, rescatado.id), 0) + 1;
}

// Junta en un solo objeto los números que se muestran en la barra
// superior del refugio.
function calcularEstadisticas(lista) {
  return lista.reduce(
    (resumen, rescatado) => {
      resumen.total = resumen.total + 1;
      resumen.costo = resumen.costo + rescatado.costoMensual;

      if (rescatado.estaDisponible()) {
        resumen.disponibles = resumen.disponibles + 1;
      } else {
        resumen.reservados = resumen.reservados + 1;
      }

      return resumen;
    },
    { total: 0, disponibles: 0, reservados: 0, costo: 0 }
  );
}

// Devuelve la lista que corresponde mostrar según el buscador.
function obtenerListaVisible() {
  return filtrarPorTexto(rescatados, textoBusqueda);
}