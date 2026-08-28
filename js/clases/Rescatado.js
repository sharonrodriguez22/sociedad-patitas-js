/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 10
   clases/Rescatado.js · La clase Rescatado

   Modela a cada perro del refugio: agrupa sus datos (propiedades)
   y sus acciones (métodos). No sabe nada del DOM ni de la pantalla:
   solo se ocupa de sí mismo.

   Usa PUNTOS_POR_PORTE y EDAD_CACHORRO, que vienen de config.js.
   ============================================================ */

class Rescatado {
  constructor(id, nombre, sexo, edad, tamanio, costoMensual) {
    this.id = id;
    this.nombre = nombre;
    this.sexo = sexo;
    this.edad = edad;
    this.tamanio = tamanio;
    this.costoMensual = costoMensual;

    this.puntosViviendaMinimos = PUNTOS_POR_PORTE[tamanio];

    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = false;
    this.adoptadoPor = "";
    this.apadrinado = false;
    this.apadrinadoPor = "";

    // La foto llega desde la API Dog CEO. Si la consulta falla o
    // todavía no llegó, queda vacía y la tarjeta se muestra sin imagen.
    this.foto = "";
  }

  cuotaPadrinazgo() {
    return Math.round(this.costoMensual * PROPORCION_PADRINAZGO);
  }

  textoEdad() {
    if (this.edad === 1) {
      return "1 año";
    }

    return this.edad + " años";
  }

  estadoTexto() {
    if (this.adoptado) {
      return "adoptado";
    }

    if (this.reservado) {
      return "reservado";
    }

    return "disponible";
  }

  esCompatibleCon(puntosVivienda) {
    return puntosVivienda >= this.puntosViviendaMinimos;
  }

  esCachorro() {
    return this.edad <= EDAD_CACHORRO;
  }

  estaDisponible() {
    return this.adoptado === false && this.reservado === false;
  }

  reservar(nombreAdoptante) {
    if (this.estaDisponible() === false) {
      return false;
    }

    this.reservado = true;
    this.reservadoPor = nombreAdoptante;
    return true;
  }

  apadrinar(nombrePadrino) {
    if (this.apadrinado || this.adoptado) {
      return false;
    }

    this.apadrinado = true;
    this.apadrinadoPor = nombrePadrino;
    return true;
  }

  adoptar(nombreAdoptante) {
    if (this.adoptado) {
      return false;
    }

    if (this.reservado && this.reservadoPor !== nombreAdoptante) {
      return false;
    }

    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = true;
    this.adoptadoPor = nombreAdoptante;
    return true;
  }
}
