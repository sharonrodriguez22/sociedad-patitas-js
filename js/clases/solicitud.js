/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   clases/solicitud.js · La clase Solicitud

   Modela la postulación de cada persona que quiere adoptar: guarda
   sus datos, acumula el puntaje del cuestionario y se autoevalúa.

   Su método evaluar() usa clasificarSolicitud, de utilidades.js.
   ============================================================ */

class Solicitud {
  constructor(nombreAdoptante, edad, tipoVivienda, puntosVivienda) {
    this.nombreAdoptante = nombreAdoptante;
    this.edad = edad;
    this.tipoVivienda = tipoVivienda;
    this.puntosVivienda = puntosVivienda;

    // El puntaje arranca con los puntos que dio la vivienda
    this.puntaje = puntosVivienda;
    this.estado = "EN EVALUACIÓN";
  }

  // MODIFICA el puntaje acumulado. Retorna el puntaje actualizado.
  sumarPuntos(puntos) {
    this.puntaje = this.puntaje + puntos;
    return this.puntaje;
  }

  // MODIFICA el estado. Reutiliza la función expresada clasificarSolicitud.
  evaluar() {
    this.estado = clasificarSolicitud(this.puntaje);
    return this.estado;
  }

  // INFORMA: true si quedó aprobada o preaprobada.
  fueAceptada() {
    return this.estado === "APROBADA" || this.estado === "PREAPROBADA";
  }
}