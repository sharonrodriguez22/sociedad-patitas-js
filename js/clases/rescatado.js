/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 9
   clases/rescatado.js · La clase rescatado

   Modela a cada perro del refugio: agrupa sus datos (propiedades)
   y sus acciones (métodos). No sabe nada del DOM ni de la pantalla:
   solo se ocupa de sí mismo.

   Usa PUNTOS_POR_PORTE y EDAD_CACHORRO, que vienen de config.js.
   ============================================================ */

class Rescatado {
  constructor(id, nombre, sexo, edad, tamanio, costoMensual) {
    this.id = id;                 // identificador único dentro del refugio
    this.nombre = nombre;
    this.sexo = sexo;             // "macho" o "hembra"
    this.edad = edad;             // en años
    this.tamanio = tamanio;       // "chico", "mediano" o "grande"
    this.costoMensual = costoMensual;

    // El espacio que necesita se deduce del porte
    this.puntosViviendaMinimos = PUNTOS_POR_PORTE[tamanio];

    // Estas no son parámetros: todo rescatado nace disponible, sin
    // familia y sin padrino. Cambian cuando se ejecuta reservar(),
    // adoptar() o apadrinar().
    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = false;
    this.adoptadoPor = "";
    this.apadrinado = false;
    this.apadrinadoPor = "";
  }

  // Cuánto aporta por mes quien apadrina a este perro.
  cuotaPadrinazgo() {
    return Math.round(this.costoMensual * PROPORCION_PADRINAZGO);
  }

  // Devuelve la edad escrita en singular o plural.
  textoEdad() {
    if (this.edad === 1) {
      return "1 año";
    }

    return this.edad + " años";
  }

  // Situación actual del perro, para la etiqueta de la tarjeta.
  estadoTexto() {
    if (this.adoptado) {
      return "adoptado";
    }

    if (this.reservado) {
      return "reservado";
    }

    return "disponible";
  }

  // Compara el espacio de la vivienda con el que necesita este perro.
  esCompatibleCon(puntosVivienda) {
    return puntosVivienda >= this.puntosViviendaMinimos;
  }

  // True si todavía es cachorro.
  esCachorro() {
    return this.edad <= EDAD_CACHORRO;
  }

  // True solo si nadie lo adoptó ni lo reservó todavía.
  estaDisponible() {
    return this.adoptado === false && this.reservado === false;
  }

  // Lo aparta para una solicitud PREAPROBADA. Todavía no es una
  // adopción: el perro sigue en el refugio hasta la visita.
  reservar(nombreAdoptante) {
    if (this.estaDisponible() === false) {
      return false;
    }

    this.reservado = true;
    this.reservadoPor = nombreAdoptante;
    return true;
  }

  // Le asigna un padrino o madrina. El perro no se va del refugio:
  // sigue esperando hogar, pero alguien cubre parte de su gasto.
  // Retorna false si ya lo apadrinaron o si ya se fue adoptado.
  apadrinar(nombrePadrino) {
    if (this.apadrinado || this.adoptado) {
      return false;
    }

    this.apadrinado = true;
    this.apadrinadoPor = nombrePadrino;
    return true;
  }

  // Lo marca como adoptado. Retorna false si ya estaba adoptado o si
  // lo tiene reservado otra persona.
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