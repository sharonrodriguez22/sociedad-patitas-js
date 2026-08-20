/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   utilidades.js · Funciones auxiliares

   Funciones cortas y puras: reciben datos, devuelven un resultado y
   no tocan ni el array ni la pantalla. Las usan todos los demás
   archivos.
   ============================================================ */

const enPesos = (monto) => "$" + monto.toLocaleString("es-AR");

const estaLibre = (rescatado) => rescatado.estaDisponible();

// EXPRESADA. Traduce el puntaje al estado de la solicitud.
const clasificarSolicitud = function (puntaje) {
  if (puntaje >= PUNTAJE_APROBADO) {
    return "APROBADA";
  }

  if (puntaje >= PUNTAJE_SEGUIMIENTO) {
    return "PREAPROBADA";
  }

  return "RECHAZADA";
};

// RETORNA UNA FUNCIÓN (fábrica + closure): fabrica el filtro de
// compatibilidad para una vivienda concreta.
function crearFiltroPorVivienda(puntosVivienda) {
  return (rescatado) => rescatado.esCompatibleCon(puntosVivienda);
}

// Texto de recomendación según el espacio disponible.
function obtenerRecomendacion(puntosVivienda) {
  if (puntosVivienda === 3) {
    return "💡 Puedes adoptar un perro de cualquier porte.";
  }

  if (puntosVivienda === 2) {
    return "💡 Te conviene un perro de porte chico o mediano.";
  }

  return "💡 Un perro de porte chico es tu mejor opción.";
}