/* ============================================================
   SOCIEDAD PATITAS - Simulador de solicitud de adopción
   Pre-Entrega 3: Funciones e integración de lógica

   Tipos de función usados:
   - Declaradas:  function nombre(...) { ... }
   - Expresada:   const nombre = function(...) { ... }
   - Flecha:      const nombre = (...) => ...
   ============================================================ */

// ------------------------------------------------------------
// 1) CONSTANTES: valores que no cambian durante el programa
// ------------------------------------------------------------
const REFUGIO = "Sociedad Patitas";
const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;
const LARGO_MINIMO_NOMBRE = 3;
const MAX_INTENTOS = 3;
const PUNTOS_POR_SI = 2;
const PUNTAJE_MAXIMO = 13; // 3 de vivienda + 5 preguntas x 2 puntos
const PUNTAJE_APROBADO = 11;
const PUNTAJE_SEGUIMIENTO = 7;
const MAX_SOLICITUDES = 10; // tope del bucle principal

// LISTA FIJA: las preguntas del cuestionario.
const PREGUNTAS = [
  "¿Puedes cubrir gastos de comida, vacunas y veterinario?",
  "¿Hay alguien en casa durante buena parte del día?",
  "¿Tu vivienda tiene rejas, balcón cerrado o patio seguro?",
  "¿Todas las personas que viven contigo están de acuerdo?",
  "¿Te comprometes a castrar al animal y recibir una visita de seguimiento?"
];

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

/* ============================================================
   FUNCIONES FLECHA
   Resuelven procesos simples en una sola línea.
   ============================================================ */

// Parámetro: texto. Retorna true o false.
const esAfirmativa = (texto) => texto === "si" || texto === "Si" || texto === "SI";

// Parámetro: texto. Retorna true o false.
const esNegativa = (texto) => texto === "no" || texto === "No" || texto === "NO";

// Parámetros: puntaje y minimo. Retorna cuántos puntos faltaron.
const puntosQueFaltan = (puntaje, minimo) => minimo - puntaje;

/* ============================================================
   1) FUNCIONES DE ENTRADA DE DATOS
   Piden información con prompt, la validan y RETORNAN el dato
   ya limpio. Si la persona falla todos los intentos, retornan
   un valor vacío para que el programa principal se dé cuenta.
   ============================================================ */

// Declarada. Parámetros: mensaje y largoMinimo. Retorna un texto.
function pedirTexto(mensaje, largoMinimo) {
  // "valor" e "intentos" son variables LOCALES: solo existen
  // acá adentro y se reinician en cada llamada a la función
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

    // Invoco las funciones flecha para no repetir las comparaciones
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
   2) FUNCIONES DE PROCESAMIENTO
   Reciben datos por parámetro, los evalúan y RETORNAN un resultado.
   ============================================================ */

// Declarada. Parámetro: opcion. Retorna un OBJETO con las dos
// características de la vivienda: su nombre y los puntos que suma.
// Un objeto agrupa varios datos relacionados en una sola variable,
// y a cada dato se accede con un punto: vivienda.nombre, vivienda.puntos
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

// Declarada. Parámetros: puntos de vivienda. Retorna una recomendación.
function obtenerRecomendacion(puntosVivienda) {
  let texto = "";

  if (puntosVivienda === 3) {
    texto = "🐶 Puedes adoptar un perro de cualquier tamaño.";
  } else if (puntosVivienda === 2) {
    texto = "🐕 Te conviene un perro chico o mediano, o un gato.";
  } else {
    texto = "🐱 Un gato o un perro de raza pequeña es tu mejor opción.";
  }

  return texto;
}

/* ============================================================
   3) FUNCIONES DE SALIDA
   Muestran resultados por consola y por alert. Comunican.
   ============================================================ */

// Declarada. Parámetros: nombre, puntaje, maximo y estado.
function mostrarResultado(nombre, puntaje, maximo, estado) {
  console.log("");
  console.log("📊 Puntaje final de " + nombre + ": " + puntaje + " de " + maximo);

  if (estado === "APROBADA") {
    console.log("✅ Solicitud APROBADA. Puedes coordinar el encuentro con tu futuro compañero.");
    alert("✅ ¡Felicitaciones, " + nombre + "!\n\nPuntaje: " + puntaje + "/" + maximo + "\nTu solicitud fue APROBADA. 🐾");
  } else if (estado === "PREAPROBADA") {
    console.log("🟡 Solicitud PREAPROBADA. Coordinamos una visita al domicilio antes de confirmar.");
    alert("🟡 " + nombre + ", tu solicitud quedó PREAPROBADA.\n\nPuntaje: " + puntaje + "/" + maximo + "\nCoordinamos una visita antes de confirmar.");
  } else {
    // Invoco la función flecha para saber cuánto le faltó
    const faltaron = puntosQueFaltan(puntaje, PUNTAJE_SEGUIMIENTO);

    console.log("⛔ Solicitud RECHAZADA por ahora. Te faltaron " + faltaron + " puntos.");
    alert("⛔ " + nombre + ", por ahora no podemos aprobar la adopción.\n\nPuntaje: " + puntaje + "/" + maximo + "\nTe faltaron " + faltaron + " puntos.\n¿Te sumas como hogar de tránsito? 🐾");
  }
}

// Declarada. Parámetro: numero de solicitud.
function mostrarEncabezado(numero) {
  console.log("");
  console.log("===============================");
  console.log("NUEVA SOLICITUD Nº " + numero);
  console.log("===============================");
}

// Declarada. Parámetros: evaluadas y aprobadas.
function mostrarResumen(evaluadas, aprobadas) {
  console.log("");
  console.log("===============================");
  console.log("RESUMEN DE LA SESIÓN");
  console.log("===============================");
  console.log("Solicitudes evaluadas: " + evaluadas);
  console.log("Aprobadas o preaprobadas: " + aprobadas);

  if (aprobadas > 0) {
    console.log("🎉 ¡Gracias por adoptar en " + REFUGIO + "!");
  } else {
    console.log("🐾 Gracias por tu interés en " + REFUGIO + ". Te esperamos.");
  }

  alert("Simulador finalizado.\n\nEvaluadas: " + evaluadas + "\nAprobadas o preaprobadas: " + aprobadas + "\n\n¡Gracias por pasar por " + REFUGIO + "! 🐾");
}

/* ============================================================
   PROGRAMA PRINCIPAL
   Acá invoqué las funciones definidas arriba.
   ============================================================ */

console.log("🐾 Simulador de adopción de " + REFUGIO);
alert("🐾 " + REFUGIO + "\n\nVamos a simular tu solicitud de adopción.\nAbre la consola con F12 para ver el detalle.");

do {
  // Variables LOCALES de cada vuelta del bucle
  let tipoVivienda = "";
  let puntosVivienda = 0;
  let puntaje = 0;
  let solicitudValida = true;

  mostrarEncabezado(solicitudesEvaluadas + 1);

  // ----- ENTRADA: nombre -----
  // El return de pedirTexto se guarda acá y después viaja como
  // argumento a pedirNumeroEntero y a mostrarResultado
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

      // Una sola llamada devuelve el objeto con los dos datos
      const vivienda = obtenerVivienda(opcion);
      puntosVivienda = vivienda.puntos;

      if (puntosVivienda === 0) {
        intentosVivienda++;
        console.log("❌ Opción inválida. Intentos restantes: " + (MAX_INTENTOS - intentosVivienda));
        alert("Opción inválida. Elije un número del 1 al 4.");
      } else {
        tipoVivienda = vivienda.nombre;
        puntaje = puntaje + puntosVivienda;
        console.log("🏠 Vivienda: " + tipoVivienda + " (+" + puntosVivienda + " puntos)");
      }
    }

    if (puntosVivienda === 0) {
      solicitudValida = false;
    }
  }

  // ----- ENTRADA: cuestionario recorriendo el arreglo con for -----
  if (solicitudValida) {
    console.log("");
    console.log("--- Cuestionario de responsabilidad (" + PREGUNTAS.length + " preguntas) ---");

    for (let i = 0; i < PREGUNTAS.length && solicitudValida; i++) {
      // Invoco la función de entrada pasándole la pregunta de la posición i
      const respuesta = pedirRespuestaSiNo(PREGUNTAS[i], i + 1, PREGUNTAS.length);

      if (respuesta === "si") {
        puntaje = puntaje + PUNTOS_POR_SI;
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
    // CADENA DE FUNCIONES:
    // el puntaje que se armó con obtenerVivienda y pedirRespuestaSiNo
    // entra en clasificarSolicitud, y lo que ésta retorna entra como
    // argumento en mostrarResultado
    const estado = clasificarSolicitud(puntaje);

    mostrarResultado(nombre, puntaje, PUNTAJE_MAXIMO, estado);

    // Otra cadena: los puntos que retornó obtenerVivienda alimentan
    // directamente a obtenerRecomendacion
    console.log("💡 Recomendación: " + obtenerRecomendacion(puntosVivienda));

    if (estado !== "RECHAZADA") {
      solicitudesAprobadas++;
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
mostrarResumen(solicitudesEvaluadas, solicitudesAprobadas);