/* ============================================================
   SOCIEDAD PATITAS - Simulador de solicitud de adopción
   Pre-Entrega 4: Uso e interacción con Arrays

   Tipos de función usados:
   - Declaradas:  function nombre(...) { ... }
   - Expresada:   const nombre = function(...) { ... }
   - Flecha:      const nombre = (...) => ...

   Métodos de array usados:
   push, unshift, pop, includes, indexOf y splice
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

// LISTA DE RESCATADOS DISPONIBLES PARA ADOPTAR.
// Va cambiando durante el día: entran rescatados nuevos y salen los adoptados.
// Está declarada con const porque la variable nunca se reasigna:
// lo que cambia es el contenido del array, no la variable en sí.
// "Sin nombre" es un rescatado que todavía no fue bautizado.
const rescatados = ["Rocco", "Luna", "Sin nombre", "Nube", "Tobías"];

// Datos de los movimientos del día
const CASO_URGENTE = "Nina";
const INGRESO_NUEVO = "Milo";
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

/* ============================================================
   FUNCIONES FLECHA
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

// Declarada. Parámetro: puntos de vivienda. Retorna una recomendación.
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
   3) FUNCIONES DE GESTIÓN DE LA LISTA DE RESCATADOS
   Trabajan sobre el array que reciben por parámetro.
   ============================================================ */

// Declarada. Parámetros: lista y nombre.
// push() agrega el nuevo rescatado AL FINAL de la lista.
// Retorna cuántos rescatados quedaron.
function registrarIngreso(lista, nombre) {
  lista.push(nombre);
  console.log("🐾 Ingresó " + nombre + " al refugio. Ahora hay " + lista.length + " rescatados.");
  return lista.length;
}

// Declarada. Parámetros: lista y nombre.
// unshift() lo agrega AL PRINCIPIO, porque los casos urgentes
// tienen prioridad para conseguir hogar.
// Retorna cuántos rescatados quedaron.
function registrarUrgencia(lista, nombre) {
  lista.unshift(nombre);
  console.log("🚑 " + nombre + " entró como caso urgente y quedó primero en la lista.");
  return lista.length;
}

// Declarada. Parámetro: lista.
// pop() saca el ÚLTIMO elemento y lo devuelve.
// Retorna el nombre del rescatado que salió.
function registrarAdopcion(lista) {
  const adoptado = lista.pop();
  console.log("Se ha eliminado el elemento: " + adoptado);
  console.log("   (se fue con su nueva familia 🏡)");
  return adoptado;
}

// Declarada. Parámetros: lista y nombre.
// includes() responde true o false. indexOf() dice la posición.
// Retorna el índice, o -1 si el rescatado no está en la lista.
function buscarRescatado(lista, nombre) {
  let indice = -1;

  if (lista.includes(nombre)) {
    indice = lista.indexOf(nombre);
  }

  return indice;
}

// Declarada. Parámetros: lista y nombre.
// includes() e indexOf() comparan de forma EXACTA, así que "nina"
// no coincidiría con "Nina". Para que no importen las mayúsculas,
// armo una copia de la lista en minúsculas y busco sobre esa copia.
// Retorna el índice, o -1 si el rescatado no está en la lista.
function buscarRescatado(lista, nombre) {
  let indice = -1;
  const listaEnMinusculas = [];

  for (const rescatado of lista) {
    listaEnMinusculas.push(rescatado.toLowerCase());
  }

  // trim() saca los espacios de más que puedan quedar al escribir
  const buscado = nombre.trim().toLowerCase();

  if (listaEnMinusculas.includes(buscado)) {
    indice = listaEnMinusculas.indexOf(buscado);
  }

  return indice;
}

// Declarada. Parámetros: lista, indice y nuevoNombre.
// splice(indice, 1, nuevoNombre) borra 1 elemento en esa posición
// y pone el nuevo en su lugar.
// Retorna el nombre que tenía antes.
function corregirNombre(lista, indice, nuevoNombre) {
  const anterior = lista[indice];

  lista.splice(indice, 1, nuevoNombre);
  console.log("✏️ Posición " + indice + ": \"" + anterior + "\" pasó a llamarse \"" + nuevoNombre + "\".");

  return anterior;
}

/* ============================================================
   4) FUNCIONES DE SALIDA
   Muestran resultados por consola y por alert.
   ============================================================ */

// Declarada. Parámetro: lista.
// Recorre el array con for...of, que en cada vuelta entrega
// directamente el VALOR del elemento (no su índice).
// Retorna un texto con un rescatado por línea, para poder mostrarlo
// tanto en la consola como dentro de un prompt o un alert y así el usuario pueda verlo.
function armarTextoRescatados(lista) {
  let texto = "";

  for (const rescatado of lista) {
    texto = texto + "• Rescatado: " + rescatado + "\n";
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

// Declarada. Parámetros: evaluadas, aprobadas y lista.
function mostrarResumen(evaluadas, aprobadas, lista) {
  console.log("");
  console.log("===============================");
  console.log("RESUMEN DE LA SESIÓN");
  console.log("===============================");
  console.log("Solicitudes evaluadas: " + evaluadas);
  console.log("Aprobadas o preaprobadas: " + aprobadas);
  console.log("Rescatados que siguen esperando hogar: " + lista.length);

  if (aprobadas > 0) {
    console.log("🎉 ¡Gracias por adoptar en " + REFUGIO + "!");
  } else {
    console.log("🐾 Gracias por tu interés en " + REFUGIO + ". Te esperamos.");
  }

  alert("Simulador finalizado.\n\nEvaluadas: " + evaluadas + "\nAprobadas o preaprobadas: " + aprobadas + "\nRescatados esperando hogar: " + lista.length + "\n\n¡Gracias por pasar por " + REFUGIO + "! 🐾");
}

/* ============================================================
   PROGRAMA PRINCIPAL
   Aquí se invocan las funciones definidas arriba.
   ============================================================ */

console.log("🐾 Simulador de adopción de " + REFUGIO);
alert("🐾 " + REFUGIO + "\n\nVamos a simular tu solicitud de adopción.\nAbre la consola con F12 para ver el detalle.");

// ------------------------------------------------------------
// MOVIMIENTOS DEL REFUGIO DE HOY
// Antes de abrir las solicitudes, se actualiza la lista de rescatados
// ------------------------------------------------------------
console.log("");
console.log("--- Movimientos del refugio de hoy ---");
console.log("Lista al abrir: " + rescatados.length + " rescatados");

// Guardo lo que retorna cada función para armar después el resumen
registrarUrgencia(rescatados, CASO_URGENTE);    // unshift: entra al principio
const adoptado = registrarAdopcion(rescatados); // pop: sale el último
registrarIngreso(rescatados, INGRESO_NUEVO);    // push: entra al final

// CADENA DE FUNCIONES: buscarRescatado retorna el índice y ese
// índice entra como argumento en corregirNombre
const indiceSinNombre = buscarRescatado(rescatados, NOMBRE_PROVISORIO);
let textoBautizo = "";

if (indiceSinNombre !== -1) {
  // corregirNombre usa splice y retorna el nombre que tenía antes
  const anterior = corregirNombre(rescatados, indiceSinNombre, NOMBRE_DEFINITIVO);
  textoBautizo = "✏️ \"" + anterior + "\" ya tiene nombre: " + NOMBRE_DEFINITIVO + ".\n";
}

mostrarRescatados(rescatados); // for...of por consola

// El mismo resumen se muestra por alert, para quien no tenga la consola abierta
alert(
  "📋 Movimientos del refugio de hoy\n\n" +
  "🚑 " + CASO_URGENTE + " ingresó como caso urgente y quedó primero.\n" +
  "🏡 Se ha eliminado el elemento: " + adoptado + " (fue adoptado).\n" +
  "🐾 " + INGRESO_NUEVO + " ingresó al refugio.\n" +
  textoBautizo +
  "\n🏠 Rescatados esperando hogar (" + rescatados.length + "):\n\n" +
  armarTextoRescatados(rescatados)
);

// ============================================================
// BUCLE PRINCIPAL (do...while)
// ============================================================
do {
  // Variables LOCALES de cada vuelta del bucle
  let tipoVivienda = "";
  let puntosVivienda = 0;
  let puntaje = 0;
  let solicitudValida = true;

  mostrarEncabezado(solicitudesEvaluadas + 1);

  // ----- ENTRADA: nombre -----
  // El return de pedirTexto se guarda aquí y después viaja como
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

      // Una sola llamada me devuelve el objeto con los dos datos
      const vivienda = obtenerVivienda(opcion);
      puntosVivienda = vivienda.puntos;

      if (puntosVivienda === 0) {
        intentosVivienda++;
        console.log("❌ Opción inválida. Intentos restantes: " + (MAX_INTENTOS - intentosVivienda));
        alert("Opción inválida. Elige un número del 1 al 4.");
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
    // a obtenerRecomendacion
    console.log("💡 Recomendación: " + obtenerRecomendacion(puntosVivienda));

    if (estado !== "RECHAZADA") {
      solicitudesAprobadas++;

      // ----- BÚSQUEDA EN LA LISTA DE RESCATADOS -----
      mostrarRescatados(rescatados);

      // El texto de la lista va DENTRO del prompt, para que la persona
      // vea los nombres disponibles en el mismo cuadro donde va a escribir
      const buscado = prompt(
        "🏠 Rescatados disponibles en " + REFUGIO + " (" + rescatados.length + "):\n\n" +
        armarTextoRescatados(rescatados) +
        "\n¿Quieres consultar por alguno?\nEscribe su nombre tal como aparece (o Cancelar para omitir):"
      );

      if (buscado !== null && buscado !== "") {
        // buscarRescatado usa includes() e indexOf() por dentro
        const posicion = buscarRescatado(rescatados, buscado);

        if (posicion === -1) {
          console.log("❌ " + buscado + " no está en la lista de disponibles.");
          alert("❌ " + buscado + " no figura entre nuestros rescatados disponibles.");
        } else {
          console.log("✅ " + buscado + " está disponible, en la posición " + posicion + " de la lista.");
          alert("✅ ¡" + buscado + " está disponible!\n\nEstá en la posición " + posicion + " de la lista de espera.");
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
mostrarResumen(solicitudesEvaluadas, solicitudesAprobadas, rescatados);