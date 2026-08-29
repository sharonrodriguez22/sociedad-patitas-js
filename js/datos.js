/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Entrega Final
   datos.js · El array de objetos, su memoria y sus consultas

   La capa de datos del simulador. Al cargar la página levanta el
   estado guardado en el navegador; si no hay nada guardado, arranca
   con los perros del archivo data/rescatados.json. Después de cada
   cambio vuelve a guardar.

   Ninguna función de este archivo toca el DOM.
   ============================================================ */

/* ------------------------------------------------------------
   1) LOS PERROS CON LOS QUE ABRE EL REFUGIO
   Se cargan desde data/rescatados.json con fetch. Solo se usan
   la primera vez o cuando se reinicia el simulador.
   ------------------------------------------------------------ */
async function cargarRescatadosDesdeJSON() {
  const response = await fetch("../data/rescatados.json");

  if (!response.ok) {
    throw new Error("No se pudo cargar rescatados.json (estado " + response.status + ")");
  }

  const datos = await response.json();

  return datos.map(({ id, nombre, sexo, edad, tamanio, costoMensual }) =>
    new Rescatado(id, nombre, sexo, edad, tamanio, costoMensual)
  );
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
    apadrinadoPor,
    foto
  } = datos;

  const rescatado = new Rescatado(id, nombre, sexo, edad, tamanio, costoMensual);

  rescatado.reservado = reservado;
  rescatado.reservadoPor = reservadoPor;
  rescatado.adoptado = adoptado;
  rescatado.adoptadoPor = adoptadoPor;
  rescatado.apadrinado = apadrinado ?? false;
  rescatado.apadrinadoPor = apadrinadoPor ?? "";
  rescatado.foto = foto ?? "";

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

async function cargarRescatados() {
  const guardados = leerLocal(CLAVE_RESCATADOS);

  if (guardados) {
    return guardados.map(rehidratarRescatado);
  }

  return await cargarRescatadosDesdeJSON();
}

function cargarSalidas() {
  const guardadas = leerLocal(CLAVE_SALIDAS);

  return guardadas?.map(({ rescatado, motivo, destino }) => ({
    rescatado: rehidratarRescatado(rescatado),
    motivo: motivo,
    destino: destino
  })) ?? [];
}

function cargarSolicitud() {
  const guardada = leerSesion(CLAVE_SOLICITUD);
  return guardada ? rehidratarSolicitud(guardada) : null;
}

/* ------------------------------------------------------------
   4) EL ESTADO VIVO
   Se inicializa vacío y se llena en iniciarRefugio(), que es async
   porque la primera carga puede venir del .json via fetch.
   ------------------------------------------------------------ */
const rescatados = [];

/* ------------------------------------------------------------
   REGISTRO DE SALIDAS
   ------------------------------------------------------------ */
const salidas = cargarSalidas();

const MOTIVO_ADOPCION = "adopcion";
const MOTIVO_TRANSITO = "transito";

function registrarSalida(rescatado, motivo, destino) {
  const posicion = rescatados.indexOf(rescatado);

  if (posicion !== -1) {
    rescatados.splice(posicion, 1);
  }

  const salida = { rescatado: rescatado, motivo: motivo, destino: destino };
  salidas.push(salida);

  return salida;
}

function contarApadrinados(lista) {
  return lista.filter((rescatado) => rescatado.apadrinado).length;
}

function contarAdopciones(lista) {
  return lista.filter((salida) => salida.motivo === MOTIVO_ADOPCION).length;
}

/* ------------------------------------------------------------
   GUARDADO Y REINICIO
   ------------------------------------------------------------ */

function persistirEstado() {
  const guardoRescatados = guardarLocal(CLAVE_RESCATADOS, rescatados);
  const guardoSalidas = guardarLocal(CLAVE_SALIDAS, salidas);

  return guardoRescatados && guardoSalidas;
}

async function reiniciarRefugio() {
  vaciarAlmacenamiento();

  const iniciales = await cargarRescatadosDesdeJSON();

  rescatados.length = 0;
  rescatados.push(...iniciales);

  salidas.length = 0;
}

/* ------------------------------------------------------------
   CONSULTAS SOBRE EL ARRAY
   ------------------------------------------------------------ */

function filtrarPorTexto(lista, texto) {
  const buscado = texto.trim().toLowerCase();

  if (buscado === "") {
    return lista;
  }

  return lista.filter((rescatado) => rescatado.nombre.toLowerCase().includes(buscado));
}

function buscarPorId(lista, id) {
  return lista.find((rescatado) => rescatado.id === id);
}

function buscarPorNombre(lista, nombre) {
  const buscado = nombre.trim().toLowerCase();
  return lista.find((rescatado) => rescatado.nombre.toLowerCase() === buscado);
}

function generarId(lista) {
  return lista.reduce((mayor, rescatado) => Math.max(mayor, rescatado.id), 0) + 1;
}

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

function obtenerListaVisible() {
  return filtrarPorTexto(rescatados, textoBusqueda);
}

/* ------------------------------------------------------------
   CARGA DE FOTOS DESDE UNA API EXTERNA
   Consulta la API pública Dog CEO para obtener fotos aleatorias de
   perros y asignarlas a los rescatados que todavía no tienen. La
   petición no bloquea el simulador: si falla, las tarjetas se muestran
   sin foto y el usuario recibe un aviso.
   ------------------------------------------------------------ */

async function cargarFotosDesdeAPI() {
  const sinFoto = rescatados.filter((r) => r.foto === "");

  if (sinFoto.length === 0) {
    return;
  }

  try {
    const response = await fetch(
      "https://dog.ceo/api/breeds/image/random/" + sinFoto.length
    );

    if (!response.ok) {
      throw new Error("La API respondió con estado " + response.status);
    }

    const datos = await response.json();

    // La API devuelve { status: "success", message: [url, url, ...] }
    if (datos.status !== "success" || !Array.isArray(datos.message)) {
      throw new Error("El formato de la respuesta no es el esperado");
    }

    sinFoto.forEach((rescatado, indice) => {
      rescatado.foto = datos.message[indice] ?? "";
    });

    persistirEstado();
    return true;
  } catch (error) {
    // Las fotos son un complemento visual: si la API falla, el
    // simulador sigue funcionando sin problema. No se relanza el
    // error porque el llamador ya muestra un mensaje al usuario.
  } finally {
    // Tanto si las fotos llegaron como si no, la pantalla se actualiza
    // para reflejar el estado actual.
    actualizarVista();
  }
}

/* ------------------------------------------------------------
   ARRANQUE DEL REFUGIO
   Carga los rescatados (del navegador o del .json) y deja el
   array listo. Se llama desde main.js al iniciar la aplicación.
   ------------------------------------------------------------ */
async function iniciarRefugio() {
  try {
    const cargados = await cargarRescatados();
    rescatados.push(...cargados);
  } catch (error) {
    notificar("No se pudieron cargar los datos del refugio: " + error.message, "error");
  }
}
