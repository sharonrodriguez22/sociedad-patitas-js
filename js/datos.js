/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   datos.js · El array de objetos y sus consultas

   La capa de datos del simulador. Crea las instancias con new, las
   guarda en un array y ofrece las funciones de orden superior para
   consultarlo (find, filter, reduce).

   Ninguna función de este archivo toca el DOM.
   ============================================================ */

const rocco = new Rescatado(1, "Rocco", "macho", 3, "grande", 25000);
const luna = new Rescatado(2, "Luna", "hembra", 2, "chico", 12000);
const pelusa = new Rescatado(3, "Pelusa", "hembra", 1, "mediano", 18000);
const nube = new Rescatado(4, "Nube", "hembra", 5, "chico", 14000);
const tobias = new Rescatado(5, "Tobías", "macho", 7, "mediano", 21000);
const nina = new Rescatado(6, "Nina", "hembra", 1, "chico", 15000);
const milo = new Rescatado(7, "Milo", "macho", 4, "mediano", 16000);

const rescatados = [rocco, luna, pelusa, nube, tobias, nina, milo];

/* ------------------------------------------------------------
   REGISTRO DE SALIDAS
   Cuando un perro deja el refugio hay que dejar constancia de qué
   pasó con él. Por eso no se borra sin más: sale de "rescatados" y
   entra en "salidas", que guarda un objeto literal por cada caso.
   ------------------------------------------------------------ */
const salidas = [];

// Motivos posibles de una salida
const MOTIVO_ADOPCION = "adopcion";
const MOTIVO_TRANSITO = "transito";

// Saca al perro del refugio y lo anota en el registro.
// splice lo quita de un array y push lo agrega al otro.
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

// filter: cuántas de las salidas fueron adopciones.
function contarAdopciones(lista) {
  return lista.filter((salida) => salida.motivo === MOTIVO_ADOPCION).length;
}

/* ------------------------------------------------------------
   CONSULTAS SOBRE EL ARRAY
   ------------------------------------------------------------ */

// filter + includes: los que coinciden con lo escrito en el buscador.
function filtrarPorTexto(lista, texto) {
  const buscado = texto.trim().toLowerCase();

  if (buscado === "") {
    return lista;
  }

  return lista.filter((rescatado) => rescatado.nombre.toLowerCase().includes(buscado));
}

// find: devuelve el objeto con ese id, o undefined.
function buscarPorId(lista, id) {
  return lista.find((rescatado) => rescatado.id === id);
}

// find: devuelve el objeto con ese nombre, o undefined.
function buscarPorNombre(lista, nombre) {
  const buscado = nombre.trim().toLowerCase();
  return lista.find((rescatado) => rescatado.nombre.toLowerCase() === buscado);
}

// reduce: el id más alto + 1, para que cada alta tenga uno propio.
function generarId(lista) {
  return lista.reduce((mayor, rescatado) => Math.max(mayor, rescatado.id), 0) + 1;
}

// reduce: junta en un solo objeto todos los números del refugio.
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