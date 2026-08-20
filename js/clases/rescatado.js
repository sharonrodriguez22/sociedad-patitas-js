/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 7
   clases/rescatado.js · La clase Rescatado

   Modela a cada perro del refugio: agrupa sus datos (propiedades)
   y sus acciones (métodos). No sabe nada del DOM ni de la pantalla:
   solo se ocupa de sí mismo.

   Usa PUNTOS_POR_PORTE y EDAD_CACHORRO, que vienen de config.js.
   ============================================================ */

class Rescatado {
  constructor(id, nombre, sexo, edad, tamanio, costoMensual) {
    this.id = id;                 // identificador único, sirve para el data-id del HTML
    this.nombre = nombre;
    this.sexo = sexo;             // "macho" o "hembra"
    this.edad = edad;             // en años
    this.tamanio = tamanio;       // "chico", "mediano" o "grande"
    this.costoMensual = costoMensual;

    // El espacio que necesita se deduce del porte
    this.puntosViviendaMinimos = PUNTOS_POR_PORTE[tamanio];

    // Estas cuatro no son parámetros: todo rescatado nace disponible
    // y sin familia. Cambian cuando se ejecuta reservar() o adoptar().
    this.reservado = false;
    this.reservadoPor = "";
    this.adoptado = false;
    this.adoptadoPor = "";
  }

  // INFORMA: la edad escrita en singular o plural.
  textoEdad() {
    if (this.edad === 1) {
      return "1 año";
    }

    return this.edad + " años";
  }

  // INFORMA: en qué situación está, para la etiqueta de la tarjeta.
  estadoTexto() {
    if (this.adoptado) {
      return "adoptado";
    }

    if (this.reservado) {
      return "reservado";
    }

    return "disponible";
  }

  // CALCULA: compara el espacio de la vivienda con el que necesita.
  esCompatibleCon(puntosVivienda) {
    return puntosVivienda >= this.puntosViviendaMinimos;
  }

  // INFORMA: true si todavía es cachorro.
  esCachorro() {
    return this.edad <= EDAD_CACHORRO;
  }

  // INFORMA: true solo si nadie lo adoptó ni lo reservó todavía.
  estaDisponible() {
    return this.adoptado === false && this.reservado === false;
  }

  // MODIFICA: lo aparta para una solicitud PREAPROBADA. Todavía no es
  // una adopción: el perro sigue en el refugio hasta la visita.
  reservar(nombreAdoptante) {
    if (this.estaDisponible() === false) {
      return false;
    }

    this.reservado = true;
    this.reservadoPor = nombreAdoptante;
    return true;
  }

  // MODIFICA: lo marca como adoptado. Retorna false si ya estaba
  // adoptado o si lo tiene reservado otra persona.
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
