/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 10
   avisos.js · El rescatado de la semana

   El refugio elige cada semana un perro para difundir y buscarle
   padrino o madrina. Esa consulta no es inmediata, así que el panel
   aparece unos segundos después de abrir el simulador, sin frenar el
   resto de la pantalla: mientras tanto se puede buscar, cargar la
   solicitud o registrar un ingreso con total normalidad.
   ============================================================ */

/* ------------------------------------------------------------
   1) LA CONSULTA
   ------------------------------------------------------------ */

// Resuelve con el rescatado de la semana pasada la demora configurada.
// Se rechaza cuando no queda ningún perro disponible para destacar,
// que es lo que ocurre si ya adoptaron a todos.
function obtenerDestacadoDeLaSemana() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const candidatos = rescatados.filter(estaLibre);

      if (candidatos.length === 0) {
        reject(new Error("no quedan rescatados disponibles para destacar"));
        return;
      }

      // El destacado es el que más gasto genera al refugio: es el que
      // más necesita un padrino.
      const destacado = candidatos.reduce(
        (mayor, rescatado) => (rescatado.costoMensual > mayor.costoMensual ? rescatado : mayor),
        candidatos[0]
      );

      resolve({
        rescatado: destacado,
        esperando: candidatos.length,
        cuota: destacado.cuotaPadrinazgo()
      });
    }, DEMORA_DESTACADO);
  });
}

/* ------------------------------------------------------------
   2) LA CARGA
   El try espera la consulta, el catch se ocupa de que el panel diga
   algo útil si no hubo destacado, y el finally saca el estado de
   carga en los dos casos.
   ------------------------------------------------------------ */

async function cargarDestacadoDeLaSemana() {
  try {
    const { rescatado, esperando, cuota } = await obtenerDestacadoDeLaSemana();

    renderizarDestacado(rescatado, esperando, cuota);
    notificar(
      "Esta semana difundimos a " + rescatado.nombre + ". Puedes apadrinarlo desde su ficha.",
      "info"
    );
  } catch (error) {
    renderizarDestacadoVacio(error.message);
  } finally {
    panelDestacado.classList.remove("cargando");
  }
}