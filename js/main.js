/* ============================================================
   SOCIEDAD PATITAS - Simulador de solicitud de adopción
   Pre-Entrega 5: Objetos

   Qué se suma respecto de la Pre-Entrega 4:
   - class Rescatado  → modela a cada animal del refugio
   - class Solicitud  → modela la postulación de cada persona
   - La lista de rescatados deja de ser un array de textos
   y pasa a ser un array de OBJETOS creados con new.

   Se mantiene todo lo anterior: funciones declaradas, expresadas
   y flecha, ciclos (while, do...while, for, for...of) y los
   métodos de array push, unshift, pop, includes, indexOf y splice.
   ============================================================ */

// ============================================================
// VARIABLES GLOBALES
// Están declaradas fuera de toda función, así que se pueden
// leer desde cualquier parte del código.
// ============================================================
const REFUGIO = "Sociedad Patitas";
const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;
const LARGO_MINIMO_NOMBRE = 3;
const MAX_INTENTOS = 3;
const PUNTOS_POR_SI = 2;
const PUNTAJE_MAXIMO = 13; // 3 de vivienda + 5 preguntas x 2 puntos
const PUNTAJE_APROBADO = 11;
const PUNTAJE_SEGUIMIENTO = 7;
const MAX_SOLICITUDES = 10; // tope de seguridad del bucle principal

// Lista fija de preguntas. La recorro con un for usando .length
const PREGUNTAS = [
  "¿Puedes cubrir gastos de comida, vacunas y veterinario?",
  "¿Hay alguien en casa durante buena parte del día?",
  "¿Tu vivienda tiene rejas, balcón cerrado o patio seguro?",
  "¿Todas las personas que viven contigo están de acuerdo?",
  "¿Te comprometes a castrar al animal y recibir una visita de seguimiento?"
];

const NOMBRE_PROVISORIO = "Sin nombre";
const NOMBRE_DEFINITIVO = "Pelusa";

const MENU_VIVIENDA =
  "¿En qué tipo de vivienda vives?\n\n" +
  "1 - Casa con patio\n" +
  "2 - Casa sin patio\n" +
  "3 - Departamento con balcón\n" +
  "4 - Departamento sin balcón\n\n" +
  "Escribe el número:";

// Estas sí cambian a lo largo del programa
let seguirSimulando = true;
let solicitudesEvaluadas = 0;
let solicitudesAprobadas = 0;
let adopcionesConcretadas = 0;

/* ============================================================
   2) CLASE RESCATADO
   Es el "molde" de cada animal del refugio. Antes cada rescatado
   era solo un texto ("Rocco") y no podía guardar más información
   ni hacer nada por sí mismo. Ahora es un objeto con sus propios
   datos (propiedades) y sus propias acciones (métodos).

   El constructor recibe 5 parámetros y con this los guarda dentro
   del objeto que se está creando en ese momento.
   ============================================================ */
class Rescatado {
  constructor(nombre, sexo, edad, tamanio, puntosViviendaMinimos) {
    this.nombre = nombre;                                 // "Rocco"
    this.sexo = sexo;                                     // "macho" o "hembra"
    this.edad = edad;                                     // en años
    this.tamanio = tamanio;                               // "chico", "mediano" o "grande"
    this.puntosViviendaMinimos = puntosViviendaMinimos;   // espacio que necesita (1 a 3)

    // Estas dos NO son parámetros: todo rescatado nace disponible
    // y sin familia. Cambian recién cuando se ejecuta adoptar().
    this.adoptado = false;
    this.adoptadoPor = "";
  }

  // MÉTODO 1 - INFORMA sobre el estado del objeto.
  // Retorna un texto listo para mostrar por consola o en un alert.
  describir() {
    let situacion = "disponible";

    if (this.adoptado) {
      situacion = "adoptado por " + this.adoptadoPor;
    }

    // Para que no quede escrito "1 años"
    let textoEdad = this.edad + " años";

    if (this.edad === 1) {
      textoEdad = "1 año";
    }

    return "🐶 " + this.nombre + " · " + this.sexo + " · porte " + this.tamanio +
           " · " + textoEdad + " · " + situacion;
  }

  // MÉTODO 2 - CALCULA. Compara los puntos de vivienda de quien
  // solicita con el espacio mínimo que necesita este animal.
  // Retorna true o false.
  esCompatibleCon(puntosVivienda) {
    return puntosVivienda >= this.puntosViviendaMinimos;
  }

  // MÉTODO 3 - MODIFICA el estado del objeto: le cambia el nombre
  // al rescatado que entró al refugio sin identificar.
  // Retorna el nombre que tenía antes.
  bautizar(nuevoNombre) {
    const anterior = this.nombre;
    this.nombre = nuevoNombre;
    return anterior;
  }

  // MÉTODO 4 - MODIFICA el estado del objeto. Marca al rescatado
  // como adoptado y guarda quién se lo llevó.
  // Retorna false si ya estaba adoptado, para no adoptarlo dos veces.
  adoptar(nombreAdoptante) {
    if (this.adoptado) {
      return false;
    }

    this.adoptado = true;
    this.adoptadoPor = nombreAdoptante;
    return true;
  }
}

/* ============================================================
   3) CLASE SOLICITUD
   Modela la postulación de cada persona que quiere adoptar.
   Antes el puntaje y el estado eran variables sueltas dentro del
   bucle; ahora viven dentro del objeto que representa la solicitud.
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

  // MODIFICA el estado. Reutiliza la función expresada
  // clasificarSolicitud, que ya existía desde la Pre-Entrega 3.
  evaluar() {
    this.estado = clasificarSolicitud(this.puntaje);
    return this.estado;
  }

  // INFORMA: true si la solicitud quedó aprobada o preaprobada.
  fueAceptada() {
    return this.estado === "APROBADA" || this.estado === "PREAPROBADA";
  }

  // INFORMA: una línea con el resumen de la solicitud.
  resumen() {
    return this.nombreAdoptante + " · " + this.tipoVivienda + " · " +
           this.puntaje + "/" + PUNTAJE_MAXIMO + " · " + this.estado;
  }
}

/* ============================================================
   4) INSTANCIAS
   Cada objeto real se crea con el operador new y se guarda en
   una constante. new hace cuatro cosas: crea el objeto vacío,
   apunta this a ese objeto, ejecuta el constructor y lo devuelve.
   ============================================================ */

// Rescatados que abren el día en el refugio
const rocco = new Rescatado("Rocco", "macho", 3, "grande", 3);
const luna = new Rescatado("Luna", "hembra", 2, "chico", 1);
const rescatadoSinNombre = new Rescatado(NOMBRE_PROVISORIO, "hembra", 1, "mediano", 2);
const nube = new Rescatado("Nube", "hembra", 5, "chico", 1);
const tobias = new Rescatado("Tobías", "macho", 7, "mediano", 2);

// Movimientos del día: un caso urgente y un ingreso nuevo
const nina = new Rescatado("Nina", "hembra", 1, "chico", 1);
const milo = new Rescatado("Milo", "macho", 4, "mediano", 2);

// Carbón ya encontró hogar la semana pasada. No entra a la lista
// de disponibles: queda para verificar que un rescatado adoptado
// no pueda volver a adoptarse.
const carbon = new Rescatado("Carbón", "macho", 6, "grande", 3);
carbon.adoptar("la familia Gómez");

// LISTA DE RESCATADOS DISPONIBLES: ahora es un array de OBJETOS.
// Está declarada con const porque la variable nunca se reasigna:
// lo que cambia es el contenido del array, no la variable en sí.
const rescatados = [rocco, luna, rescatadoSinNombre, nube, tobias];

/* ============================================================
   5) FUNCIONES FLECHA
   ============================================================ */

// Parámetro: texto. Retorna true o false.
const esAfirmativa = (texto) => texto === "si" || texto === "Si" || texto === "SI";

// Parámetro: texto. Retorna true o false.
const esNegativa = (texto) => texto === "no" || texto === "No" || texto === "NO";

// Parámetros: puntaje y minimo. Retorna cuántos puntos faltaron.
const puntosQueFaltan = (puntaje, minimo) => minimo - puntaje;

/* ============================================================
   6) FUNCIONES DE ENTRADA DE DATOS
   Piden información con prompt, la validan y RETORNAN el dato
   ya limpio. Si la persona falla todos los intentos, retornan
   un valor vacío para que el programa principal se dé cuenta.
   ============================================================ */

// Declarada. Parámetros: mensaje y largoMinimo. Retorna un texto.
function pedirTexto(mensaje, largoMinimo) {
  // "valor" e "intentos" son variables LOCALES: solo existen
  // aquí adentro y se reinician en cada llamada a la función
  let valor = "";
  let intentos = 0;

  while (valor === "" && intentos < MAX_INTENTOS) {
    // const porque dentro de esta vuelta el dato ingresado no cambia
    const ingreso = prompt(mensaje);

    // Si aprieta "Cancelar", prompt devuelve null
    if (ingreso === null || ingreso.length < largoMinimo) {
      intentos++;
      console.log("❌ Dato inválido. Intentos restantes: " + (MAX_INTENTOS - intentos));
      alert("Tiene que tener al menos " + largoMinimo + " caracteres.\nTe quedan " + (MAX_INTENTOS - intentos) + " intentos.");
    } else {
      valor = ingreso;
    }
  }

  return valor;
}

// Declarada. Parámetros: mensaje, minimo y maximo. Retorna un número.
function pedirNumeroEntero(mensaje, minimo, maximo) {
  let valor = 0;
  let intentos = 0;

  while (valor === 0 && intentos < MAX_INTENTOS) {
    const ingreso = prompt(mensaje);
    const numero = Number(ingreso);

    // El resto (%) sirve para rechazar decimales: 30.5 % 1 da 0.5
    if (numero >= minimo && numero <= maximo && numero % 1 === 0) {
      valor = numero;
    } else {
      intentos++;
      console.log("❌ Número inválido. Intentos restantes: " + (MAX_INTENTOS - intentos));
      alert("Ingresa un número entero entre " + minimo + " y " + maximo + ".");
    }
  }

  return valor;
}

// Declarada. Parámetros: pregunta, numero y total. Retorna "si", "no" o "".
function pedirRespuestaSiNo(pregunta, numero, total) {
  let respuesta = "";
  let intentos = 0;

  while (respuesta === "" && intentos < MAX_INTENTOS) {
    const ingreso = prompt("Pregunta " + numero + " de " + total + "\n\n" + pregunta + "\n\n(escribe si o no)");

    // Se invocan las funciones flecha para no repetir las comparaciones
    if (esAfirmativa(ingreso)) {
      respuesta = "si";
    } else if (esNegativa(ingreso)) {
      respuesta = "no";
    } else {
      intentos++;
      console.log("   ⚠️ Responde solo 'si' o 'no'. Intentos restantes: " + (MAX_INTENTOS - intentos));
    }
  }

  return respuesta;
}

/* ============================================================
   7) FUNCIONES DE PROCESAMIENTO
   Reciben datos por parámetro, los evalúan y RETORNAN un resultado.
   ============================================================ */

// Declarada. Parámetro: opcion. Retorna un objeto literal con las
// dos características de la vivienda: su nombre y los puntos que suma.
// Es un objeto simple y de un solo uso, por eso acá no hace falta
// una clase: no necesita métodos ni crear muchas copias iguales.
function obtenerVivienda(opcion) {
  let vivienda = { nombre: "Sin definir", puntos: 0 };

  switch (opcion) {
    case "1":
      vivienda = { nombre: "Casa con patio", puntos: 3 };
      break;
    case "2":
      vivienda = { nombre: "Casa sin patio", puntos: 2 };
      break;
    case "3":
      vivienda = { nombre: "Departamento con balcón", puntos: 2 };
      break;
    case "4":
      vivienda = { nombre: "Departamento sin balcón", puntos: 1 };
      break;
    default:
      vivienda = { nombre: "Sin definir", puntos: 0 };
  }

  return vivienda;
}

// EXPRESADA. Parámetro: puntaje. Retorna el estado de la solicitud.
// La invoca el método evaluar() de la clase Solicitud.
const clasificarSolicitud = function (puntaje) {
  let estado = "";

  // Ordenado de la condición más exigente a la más general
  if (puntaje >= PUNTAJE_APROBADO) {
    estado = "APROBADA";
  } else if (puntaje >= PUNTAJE_SEGUIMIENTO) {
    estado = "PREAPROBADA";
  } else {
    estado = "RECHAZADA";
  }

  return estado;
};

// Declarada. Parámetro: puntos de vivienda. Retorna una recomendación.
function obtenerRecomendacion(puntosVivienda) {
  let texto = "";

  if (puntosVivienda === 3) {
    texto = "🐶 Puedes adoptar un perro de cualquier porte.";
  } else if (puntosVivienda === 2) {
    texto = "🐕 Te conviene un perro de porte chico o mediano.";
  } else {
    texto = "🐕‍🦺 Un perro de porte chico es tu mejor opción.";
  }

  return texto;
}

// Declarada. Parámetros: lista y puntos de vivienda.
// Recorre el array con for...of y arma una lista nueva solo con los
// rescatados que entran en esa vivienda, usando el método del objeto.
// Retorna un array (puede quedar vacío).
function filtrarCompatibles(lista, puntosVivienda) {
  const compatibles = [];

  for (const rescatado of lista) {
    if (rescatado.esCompatibleCon(puntosVivienda)) {
      compatibles.push(rescatado);
    }
  }

  return compatibles;
}

/* ============================================================
   8) FUNCIONES DE GESTIÓN DE LA LISTA DE RESCATADOS
   Trabajan sobre el array de objetos que reciben por parámetro.
   ============================================================ */

// Declarada. Parámetros: lista y un objeto Rescatado.
// push() agrega el nuevo rescatado AL FINAL de la lista.
// Retorna cuántos rescatados quedaron.
function registrarIngreso(lista, rescatado) {
  lista.push(rescatado);
  console.log("🐾 Ingresó " + rescatado.nombre + " al refugio. Ahora hay " + lista.length + " rescatados.");
  return lista.length;
}

// Declarada. Parámetros: lista y un objeto Rescatado.
// unshift() lo agrega AL PRINCIPIO, porque los casos urgentes
// tienen prioridad para conseguir hogar.
// Retorna cuántos rescatados quedaron.
function registrarUrgencia(lista, rescatado) {
  lista.unshift(rescatado);
  console.log("🚑 " + rescatado.nombre + " entró como caso urgente y quedó primero en la lista.");
  return lista.length;
}

// Declarada. Parámetros: lista y nombre de la familia.
// pop() saca el ÚLTIMO objeto de la lista y lo devuelve.
// Invoca el método adoptar() para dejar registrado el cambio de estado.
// Retorna el objeto Rescatado que salió.
function registrarAdopcionDelDia(lista, familia) {
  const adoptado = lista.pop();

  adoptado.adoptar(familia);
  console.log("🏡 Se ha eliminado el elemento: " + adoptado.nombre + " (se fue con " + familia + ").");
  console.log("   Estado del objeto → " + adoptado.describir());

  return adoptado;
}

// Declarada. Parámetros: lista y nombre buscado.
// Como la lista ahora guarda OBJETOS, includes() e indexOf() no pueden
// comparar contra un texto directamente: primero armo un array auxiliar
// con los nombres en minúsculas y busco sobre ese.
// trim() saca los espacios de más y toLowerCase() evita que "nina"
// no coincida con "Nina".
// Retorna el índice, o -1 si el rescatado no está en la lista.
function buscarRescatado(lista, nombre) {
  let indice = -1;
  const nombresEnMinusculas = [];

  for (const rescatado of lista) {
    nombresEnMinusculas.push(rescatado.nombre.toLowerCase());
  }

  const buscado = nombre.trim().toLowerCase();

  if (nombresEnMinusculas.includes(buscado)) {
    indice = nombresEnMinusculas.indexOf(buscado);
  }

  return indice;
}

// Declarada. Parámetros: lista e indice.
// splice(indice, 1) saca 1 elemento de esa posición exacta y devuelve
// un array con lo que sacó. Se usa cuando alguien adopta a un rescatado
// puntual, que puede estar en cualquier lugar de la lista.
// Retorna el objeto Rescatado retirado.
function retirarDeLaLista(lista, indice) {
  const retirados = lista.splice(indice, 1);
  console.log("📤 " + retirados[0].nombre + " salió de la lista de disponibles. Quedan " + lista.length + ".");
  return retirados[0];
}

/* ============================================================
   9) FUNCIONES DE SALIDA
   Muestran resultados por consola y por alert.
   ============================================================ */

// Declarada. Parámetro: lista de objetos.
// Recorre el array con for...of, que en cada vuelta entrega
// directamente el VALOR del elemento (no su índice), e invoca el
// método describir() de cada objeto.
// Retorna un texto con un rescatado por línea, para mostrarlo tanto
// en la consola como dentro de un prompt o un alert.
function armarTextoRescatados(lista) {
  let texto = "";

  for (const rescatado of lista) {
    texto = texto + "• " + rescatado.describir() + "\n";
  }

  return texto;
}

// Declarada. Parámetro: lista.
// Invoca a armarTextoRescatados y muestra el resultado por consola.
function mostrarRescatados(lista) {
  console.log("");
  console.log("🏠 Rescatados disponibles en " + REFUGIO + " (" + lista.length + "):");
  console.log(armarTextoRescatados(lista));
}

// Declarada. Parámetro: un objeto Solicitud.
// Ahora recibe el objeto completo en lugar de cuatro datos sueltos.
function mostrarResultado(solicitud) {
  console.log("");
  console.log("📊 Puntaje final de " + solicitud.nombreAdoptante + ": " + solicitud.puntaje + " de " + PUNTAJE_MAXIMO);

  if (solicitud.estado === "APROBADA") {
    console.log("✅ Solicitud APROBADA. Puedes coordinar el encuentro con tu futuro compañero.");
    alert("✅ ¡Felicitaciones, " + solicitud.nombreAdoptante + "!\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nTu solicitud fue APROBADA. 🐾");
  } else if (solicitud.estado === "PREAPROBADA") {
    console.log("🟡 Solicitud PREAPROBADA. Coordinamos una visita al domicilio antes de confirmar.");
    alert("🟡 " + solicitud.nombreAdoptante + ", tu solicitud quedó PREAPROBADA.\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nCoordinamos una visita antes de confirmar.");
  } else {
    // Invoco la función flecha para saber cuánto le faltó
    const faltaron = puntosQueFaltan(solicitud.puntaje, PUNTAJE_SEGUIMIENTO);

    console.log("⛔ Solicitud RECHAZADA por ahora. Te faltaron " + faltaron + " puntos.");
    alert("⛔ " + solicitud.nombreAdoptante + ", por ahora no podemos aprobar la adopción.\n\nPuntaje: " + solicitud.puntaje + "/" + PUNTAJE_MAXIMO + "\nTe faltaron " + faltaron + " puntos.\n¿Te sumas como hogar de tránsito? 🐾");
  }
}

// Declarada. Parámetro: numero de solicitud.
function mostrarEncabezado(numero) {
  console.log("");
  console.log("===============================");
  console.log("NUEVA SOLICITUD Nº " + numero);
  console.log("===============================");
}

// Declarada. Parámetros: evaluadas, aprobadas, adopciones y lista.
function mostrarResumen(evaluadas, aprobadas, adopciones, lista) {
  console.log("");
  console.log("===============================");
  console.log("RESUMEN DE LA SESIÓN");
  console.log("===============================");
  console.log("Solicitudes evaluadas: " + evaluadas);
  console.log("Aprobadas o preaprobadas: " + aprobadas);
  console.log("Adopciones concretadas: " + adopciones);
  console.log("Rescatados que siguen esperando hogar: " + lista.length);
  mostrarRescatados(lista);

  if (aprobadas > 0) {
    console.log("🎉 ¡Gracias por adoptar en " + REFUGIO + "!");
  } else {
    console.log("🐾 Gracias por tu interés en " + REFUGIO + ". Te esperamos.");
  }

  alert(
    "Simulador finalizado.\n\n" +
    "Evaluadas: " + evaluadas + "\n" +
    "Aprobadas o preaprobadas: " + aprobadas + "\n" +
    "Adopciones concretadas: " + adopciones + "\n" +
    "Rescatados esperando hogar: " + lista.length + "\n\n" +
    "¡Gracias por pasar por " + REFUGIO + "! 🐾"
  );
}

/* ============================================================
   PROGRAMA PRINCIPAL
   Aquí se invocan las funciones y los métodos definidos arriba.
   ============================================================ */

console.log("🐾 Simulador de adopción de " + REFUGIO);

/* ------------------------------------------------------------
   VERIFICACIÓN DE LAS CLASES POR CONSOLA
   Antes de abrir el simulador, compruebo que las instancias se
   crearon bien y que los métodos hacen lo que tienen que hacer.
   ------------------------------------------------------------ */
console.log("");
console.log("--- Verificación de la clase Rescatado ---");

// El objeto completo, con todas sus propiedades
console.log(rocco);

// Método que informa
console.log("describir() → " + rocco.describir());
console.log("describir() → " + luna.describir());

// Método que calcula: Rocco es de porte grande y necesita 3 puntos de
// vivienda, Luna es de porte chico y se conforma con 1
console.log("¿Rocco entra en un depto sin balcón (1 punto)? " + rocco.esCompatibleCon(1)); // false
console.log("¿Rocco entra en una casa con patio (3 puntos)? " + rocco.esCompatibleCon(3)); // true
console.log("¿Luna entra en un depto sin balcón (1 punto)? " + luna.esCompatibleCon(1));   // true

// Método que modifica: Carbón ya fue adoptado, así que adoptar()
// tiene que devolver false y no pisar los datos de su familia
console.log("Carbón ya tiene hogar → " + carbon.describir());
console.log("¿Se puede volver a adoptar a Carbón? " + carbon.adoptar("otra persona")); // false

// Las instancias son independientes entre sí: cambiar una no afecta al resto
console.log("Rocco sigue disponible: " + (rocco.adoptado === false));

console.log("");
console.log("--- Verificación de la clase Solicitud ---");

// Instancia de prueba: casa con patio (3 puntos) y 5 respuestas afirmativas
const solicitudDePrueba = new Solicitud("Prueba Automática", 30, "Casa con patio", 3);
console.log("Puntaje inicial (solo vivienda): " + solicitudDePrueba.puntaje);
solicitudDePrueba.sumarPuntos(PUNTOS_POR_SI * PREGUNTAS.length);
console.log("Puntaje tras el cuestionario: " + solicitudDePrueba.puntaje);
console.log("evaluar() → " + solicitudDePrueba.evaluar());
console.log("fueAceptada() → " + solicitudDePrueba.fueAceptada());
console.log("resumen() → " + solicitudDePrueba.resumen());

/* ------------------------------------------------------------
   MOVIMIENTOS DEL REFUGIO DE HOY
   Antes de abrir las solicitudes se actualiza la lista de rescatados.
   ------------------------------------------------------------ */
alert("🐾 " + REFUGIO + "\n\nVamos a simular tu solicitud de adopción.\nAbre la consola con F12 para ver el detalle.");

console.log("");
console.log("--- Movimientos del refugio de hoy ---");
console.log("Lista al abrir: " + rescatados.length + " rescatados");

// Guardo lo que retorna cada función para armar después el resumen
registrarUrgencia(rescatados, nina);                                    // unshift: entra al principio
const adoptadoHoy = registrarAdopcionDelDia(rescatados, "la familia Pérez"); // pop: sale el último
registrarIngreso(rescatados, milo);                                     // push: entra al final

// CADENA DE FUNCIONES: buscarRescatado retorna el índice y con ese
// índice llego al objeto para invocar su método bautizar()
const indiceSinNombre = buscarRescatado(rescatados, NOMBRE_PROVISORIO);
let textoBautizo = "";

if (indiceSinNombre !== -1) {
  // bautizar() cambia la propiedad nombre y retorna el nombre anterior
  const anterior = rescatados[indiceSinNombre].bautizar(NOMBRE_DEFINITIVO);
  textoBautizo = "✏️ \"" + anterior + "\" ya tiene nombre: " + NOMBRE_DEFINITIVO + ".\n";
  console.log("✏️ Posición " + indiceSinNombre + ": \"" + anterior + "\" pasó a llamarse \"" + NOMBRE_DEFINITIVO + "\".");
}

mostrarRescatados(rescatados); // for...of + describir() por consola

// El mismo resumen se muestra por alert, para quien no tenga la consola abierta
alert(
  "📋 Movimientos del refugio de hoy\n\n" +
  "🚑 " + nina.nombre + " ingresó como caso urgente y quedó primero.\n" +
  "🏡 Se ha eliminado el elemento: " + adoptadoHoy.nombre + " (fue adoptado).\n" +
  "🐾 " + milo.nombre + " ingresó al refugio.\n" +
  textoBautizo +
  "\n🏠 Rescatados esperando hogar (" + rescatados.length + "):\n\n" +
  armarTextoRescatados(rescatados)
);

/* ------------------------------------------------------------
   BUCLE PRINCIPAL (do...while)
   ------------------------------------------------------------ */
do {
  // Variables LOCALES de cada vuelta del bucle
  let tipoVivienda = "Sin definir";
  let puntosVivienda = 0;
  let solicitudValida = true;

  mostrarEncabezado(solicitudesEvaluadas + 1);

  // ----- ENTRADA: nombre -----
  const nombre = pedirTexto("Ingresa tu nombre y apellido:", LARGO_MINIMO_NOMBRE);

  if (nombre === "") {
    solicitudValida = false;
  } else {
    console.log("✅ Nombre registrado: " + nombre);
  }

  // ----- ENTRADA: edad -----
  let edad = 0;

  if (solicitudValida) {
    edad = pedirNumeroEntero(nombre + ", ¿cuántos años tienes?", 1, EDAD_MAXIMA);

    if (edad === 0) {
      solicitudValida = false;
    } else {
      console.log("✅ Edad registrada: " + edad + " años");
    }
  }

  // ----- PROCESAMIENTO: requisito excluyente de edad -----
  if (solicitudValida) {
    if (edad < EDAD_MINIMA) {
      solicitudValida = false;
      console.log("⛔ " + nombre + " tiene " + edad + " años y el mínimo para adoptar es " + EDAD_MINIMA + ".");
      alert("⛔ Lo sentimos, " + nombre + ".\n\nPara adoptar hay que ser mayor de " + EDAD_MINIMA + " años.\nPero puedes sumarte como voluntario/a. 🐾");
    } else {
      console.log("✅ Cumple el requisito de edad mínima.");
    }
  }

  // ----- ENTRADA + PROCESAMIENTO: tipo de vivienda -----
  if (solicitudValida) {
    let intentosVivienda = 0;

    while (puntosVivienda === 0 && intentosVivienda < MAX_INTENTOS) {
      const opcion = prompt(MENU_VIVIENDA);

      // Una sola llamada me devuelve el objeto con los dos datos
      const vivienda = obtenerVivienda(opcion);
      puntosVivienda = vivienda.puntos;

      if (puntosVivienda === 0) {
        intentosVivienda++;
        console.log("❌ Opción inválida. Intentos restantes: " + (MAX_INTENTOS - intentosVivienda));
        alert("Opción inválida. Elige un número del 1 al 4.");
      } else {
        tipoVivienda = vivienda.nombre;
        console.log("🏠 Vivienda: " + tipoVivienda + " (+" + puntosVivienda + " puntos)");
      }
    }

    if (puntosVivienda === 0) {
      solicitudValida = false;
    }
  }

  // ----- INSTANCIACIÓN: se crea el objeto de esta solicitud -----
  // Con los datos ya validados creo la instancia con new. A partir
  // de acá el puntaje y el estado viven dentro del objeto.
  const solicitud = new Solicitud(nombre, edad, tipoVivienda, puntosVivienda);

  // ----- ENTRADA: cuestionario recorriendo el arreglo con for -----
  if (solicitudValida) {
    console.log("");
    console.log("--- Cuestionario de responsabilidad (" + PREGUNTAS.length + " preguntas) ---");

    // for clásico y no for...of: acá necesito el índice para numerar
    // las preguntas, y la segunda condición me deja cortar el recorrido
    // si la persona cancela a mitad del cuestionario.
    for (let i = 0; i < PREGUNTAS.length && solicitudValida; i++) {
      // Invoco la función de entrada pasándole la pregunta de la posición i
      const respuesta = pedirRespuestaSiNo(PREGUNTAS[i], i + 1, PREGUNTAS.length);

      if (respuesta === "si") {
        // El método del objeto acumula el puntaje
        solicitud.sumarPuntos(PUNTOS_POR_SI);
        console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → SÍ (+" + PUNTOS_POR_SI + " puntos)");
      } else if (respuesta === "no") {
        console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → NO (+0 puntos)");
      } else {
        solicitudValida = false;
      }
    }
  }

  // ----- PROCESAMIENTO + SALIDA: resultado -----
  if (solicitudValida) {
    // El método evaluar() guarda el estado dentro del objeto y lo retorna
    solicitud.evaluar();
    mostrarResultado(solicitud);

    console.log("💡 Recomendación: " + obtenerRecomendacion(solicitud.puntosVivienda));
    console.log("📄 " + solicitud.resumen());

    if (solicitud.fueAceptada()) {
      solicitudesAprobadas++;

      // ----- ADOPCIÓN: buscar y llevarse a un rescatado -----
      // filtrarCompatibles usa el método esCompatibleCon de cada objeto
      const compatibles = filtrarCompatibles(rescatados, solicitud.puntosVivienda);

      console.log("");
      console.log("🔎 Rescatados compatibles con " + solicitud.tipoVivienda + " (" + compatibles.length + "):");
      console.log(armarTextoRescatados(compatibles));

      if (compatibles.length === 0) {
        alert("Por ahora no tenemos rescatados que se adapten a " + solicitud.tipoVivienda + ".\n¡Pero seguimos recibiendo animales todas las semanas! 🐾");
      } else {
        // El texto de la lista va DENTRO del prompt, para que la persona
        // vea los nombres disponibles en el mismo cuadro donde va a escribir
        const elegido = prompt(
          "🏠 Rescatados que se adaptan a tu vivienda (" + compatibles.length + "):\n\n" +
          armarTextoRescatados(compatibles) +
          "\n¿A cuál quieres adoptar?\nEscribe su nombre tal como aparece (o Cancelar para pensarlo):"
        );

        if (elegido !== null && elegido !== "") {
          // buscarRescatado usa includes() e indexOf() por dentro
          const posicion = buscarRescatado(rescatados, elegido);

          if (posicion === -1) {
            console.log("❌ " + elegido + " no está en la lista de disponibles.");
            alert("❌ " + elegido + " no figura entre nuestros rescatados disponibles.");
          } else {
            const rescatadoElegido = rescatados[posicion];

            if (rescatadoElegido.esCompatibleCon(solicitud.puntosVivienda)) {
              // adoptar() cambia el estado del objeto y retorna true
              rescatadoElegido.adoptar(solicitud.nombreAdoptante);

              // splice() lo retira de la lista de disponibles
              retirarDeLaLista(rescatados, posicion);
              adopcionesConcretadas++;

              console.log("🎉 " + rescatadoElegido.describir());
              alert("🎉 ¡Felicitaciones, " + solicitud.nombreAdoptante + "!\n\n" + rescatadoElegido.nombre + " se va contigo.\n\n" + rescatadoElegido.describir());
            } else {
              console.log("⚠️ " + rescatadoElegido.nombre + " necesita más espacio del que ofrece " + solicitud.tipoVivienda + ".");
              alert("⚠️ " + rescatadoElegido.nombre + " es de porte " + rescatadoElegido.tamanio + " y necesita más espacio.\n\n" + obtenerRecomendacion(solicitud.puntosVivienda));
            }
          }
        }
      }
    }
  } else {
    console.log("🔒 Solicitud cancelada o incompleta. No se pudo evaluar.");
    alert("Solicitud cancelada.\nPuedes volver a intentarlo cuando quieras. 🐾");
  }

  solicitudesEvaluadas++;

  // ----- ¿Repetir? -----
  const otraVez = prompt("¿Quieres simular otra solicitud? (si / no)");
  seguirSimulando = esAfirmativa(otraVez); // invoco la flecha y guardo el true/false

  if (seguirSimulando && solicitudesEvaluadas >= MAX_SOLICITUDES) {
    console.log("⚠️ Se alcanzó el máximo de " + MAX_SOLICITUDES + " solicitudes por sesión.");
    alert("Llegaste al máximo de " + MAX_SOLICITUDES + " solicitudes.\nRecarga la página para seguir. 🐾");
  }

// La segunda condición asegura que el bucle principal siempre termina
} while (seguirSimulando && solicitudesEvaluadas < MAX_SOLICITUDES);

// ----- SALIDA final, una vez terminado el bucle -----
mostrarResumen(solicitudesEvaluadas, solicitudesAprobadas, adopcionesConcretadas, rescatados);
