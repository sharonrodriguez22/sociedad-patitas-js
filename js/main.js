/* ============================================================
   SOCIEDAD PATITAS - Simulador de solicitud de adopción
   Pre-Entrega 2: Lógica de programación y control de flujo
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

// ------------------------------------------------------------
// 2) VARIABLES: valores que sí cambian durante el programa
// ------------------------------------------------------------
let seguirSimulando = true;
let solicitudesEvaluadas = 0;
let solicitudesAprobadas = 0;

console.log("🐾 Simulador de adopción de " + REFUGIO);
alert("🐾 " + REFUGIO + "\n\nVamos a simular tu solicitud de adopción.\nAbre la consola con F12 para ver el detalle.");

// ============================================================
// BUCLE PRINCIPAL (do...while)
// ============================================================
do {
  // Variables de esta solicitud
  let nombre = "";
  let edad = 0;
  let tipoVivienda = "";
  let puntosVivienda = 0;
  let puntaje = 0;
  let solicitudValida = true; // bandera: si pasa a false, se corta el flujo

  console.log("");
  console.log("===============================");
  console.log("NUEVA SOLICITUD Nº " + (solicitudesEvaluadas + 1));
  console.log("===============================");
  // ----------------------------------------------------------
  // PASO 1 - WHILE + IF/ELSE: validar el nombre
  // El bucle corta cuando el nombre es válido O cuando se agotan los 3 intentos, nunca puede volverse infinito
  // ----------------------------------------------------------
  
  let nombreValido = false;
  let intentosNombre = 0;

  while (!nombreValido && intentosNombre < MAX_INTENTOS) {
    let ingresoNombre = prompt("Ingresa tu nombre y apellido:");

    // Si aprieta "Cancelar", prompt devuelve null
    if (ingresoNombre === null || ingresoNombre.length < LARGO_MINIMO_NOMBRE) {
      intentosNombre++;
      console.log("❌ Nombre inválido. Intentos restantes: " + (MAX_INTENTOS - intentosNombre));
      alert("El nombre debe tener al menos " + LARGO_MINIMO_NOMBRE + " letras.\nTe quedan " + (MAX_INTENTOS - intentosNombre) + " intentos.");
    } else {
      nombre = ingresoNombre;
      nombreValido = true;
      console.log("✅ Nombre registrado: " + nombre + " (" + nombre.length + " caracteres)");
    }
  }

  if (!nombreValido) {
    solicitudValida = false;
  }

  // ----------------------------------------------------------
  // PASO 2 - WHILE + IF/ELSE: validar la edad
  // ----------------------------------------------------------
  if (solicitudValida) {
    let edadValida = false;
    let intentosEdad = 0;

    while (!edadValida && intentosEdad < MAX_INTENTOS) {
      let ingresoEdad = prompt(nombre + ", ¿cuántos años tienes?");
      let numeroEdad = Number(ingresoEdad);

      if (numeroEdad >= 1 && numeroEdad <= EDAD_MAXIMA && numeroEdad % 1 === 0) {
        edad = numeroEdad;
        edadValida = true;
        console.log("✅ Edad registrada: " + edad + " años");
      } else {
        intentosEdad++;
        console.log("❌ Edad inválida. Intentos restantes: " + (MAX_INTENTOS - intentosEdad));
        alert("Ingresa tu edad en números enteros, por ejemplo: 27");
      }
    }

    if (!edadValida) {
      solicitudValida = false;
    }
  }

  // ----------------------------------------------------------
  // PASO 3 - IF/ELSE: requisito excluyente de mayoría de edad
  // ----------------------------------------------------------
  if (solicitudValida) {
    if (edad < EDAD_MINIMA) {
      solicitudValida = false;
      console.log("⛔ " + nombre + " tiene " + edad + " años y el mínimo para adoptar es " + EDAD_MINIMA + ".");
      alert("⛔ Lo sentimos, " + nombre + ".\n\nPara adoptar hay que ser mayor de " + EDAD_MINIMA + " años.\nPero puedes sumarte como voluntario/a. 🐾");
    } else {
      console.log("✅ Cumple el requisito de edad mínima.");
    }
  }

  //----------------------------------------------------------
  // PASO 4 - WHILE + SWITCH: tipo de vivienda
  // ----------------------------------------------------------
  if (solicitudValida) {
    let viviendaValida = false;
    let intentosVivienda = 0;

    while (!viviendaValida && intentosVivienda < MAX_INTENTOS) {
      let opcion = prompt(
        "¿En qué tipo de vivienda vives?\n\n" +
        "1 - Casa con patio\n" +
        "2 - Casa sin patio\n" +
        "3 - Departamento con balcón\n" +
        "4 - Departamento sin balcón\n\n" +
        "Escribe el número:"
      );

      switch (opcion) {
        case "1":
          tipoVivienda = "Casa con patio";
          puntosVivienda = 3;
          viviendaValida = true;
          break;
        case "2":
          tipoVivienda = "Casa sin patio";
          puntosVivienda = 2;
          viviendaValida = true;
          break;
        case "3":
          tipoVivienda = "Departamento con balcón";
          puntosVivienda = 2;
          viviendaValida = true;
          break;
        case "4":
          tipoVivienda = "Departamento sin balcón";
          puntosVivienda = 1;
          viviendaValida = true;
          break;
        default:
          // Acá cae cualquier cosa que no sea 1, 2, 3 o 4 (incluido Cancelar)
          intentosVivienda++;
          console.log("❌ Opción inválida. Intentos restantes: " + (MAX_INTENTOS - intentosVivienda));
          alert("Opción inválida. Elige un número del 1 al 4.");
      }
    }

    if (!viviendaValida) {
      solicitudValida = false;
    } else {
      puntaje = puntaje + puntosVivienda;
      console.log("🏠 Vivienda: " + tipoVivienda + " (+" + puntosVivienda + " puntos)");
    }
  }

  // ----------------------------------------------------------
  // PASO 5 - FOR recorriendo el arreglo PREGUNTAS con .length
  // Uso for porque la cantidad de vueltas la define la lista,
  // y adentro va un while que valida cada respuesta
  // ----------------------------------------------------------
  if (solicitudValida) {
    console.log("");
    console.log("--- Cuestionario de responsabilidad (" + PREGUNTAS.length + " preguntas) ---");

    for (let i = 0; i < PREGUNTAS.length && solicitudValida; i++) {
      let respuestaValida = false;
      let intentosRespuesta = 0;

      // Bucle que repite la misma pregunta hasta que responda si o no, con tres intentos como tope
      while (!respuestaValida && intentosRespuesta < MAX_INTENTOS) {
        let ingreso = prompt("Pregunta " + (i + 1) + " de " + PREGUNTAS.length + "\n\n" + PREGUNTAS[i] + "\n\n(escribe si o no)");

        if (ingreso === "si" || ingreso === "Si" || ingreso === "SI") {
          respuestaValida = true;
          puntaje = puntaje + PUNTOS_POR_SI;
          console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → SÍ (+" + PUNTOS_POR_SI + " puntos)");
        } else if (ingreso === "no" || ingreso === "No" || ingreso === "NO") {
          respuestaValida = true;
          console.log("   " + (i + 1) + ". " + PREGUNTAS[i] + " → NO (+0 puntos)");
        } else {
          intentosRespuesta++;
          console.log("   ⚠️ Responde solo 'si' o 'no'. Intentos restantes: " + (MAX_INTENTOS - intentosRespuesta));
        }
      }

      if (!respuestaValida) {
        solicitudValida = false;
      }
    }
  }

  // ----------------------------------------------------------
  // PASO 6 - IF / ELSE IF / ELSE: resultado final
  // Ordenado de la condición más exigente a la más general
  // ----------------------------------------------------------
  if (solicitudValida) {
    console.log("");
    console.log("📊 Puntaje final de " + nombre + ": " + puntaje + " de " + PUNTAJE_MAXIMO);

    if (puntaje >= PUNTAJE_APROBADO) {
      solicitudesAprobadas++;
      console.log("✅ Solicitud APROBADA. Puedes coordinar el encuentro con tu futuro compañero.");
      alert("✅ ¡Felicitaciones, " + nombre + "!\n\nPuntaje: " + puntaje + "/" + PUNTAJE_MAXIMO + "\nTu solicitud fue APROBADA. 🐾");
    } else if (puntaje >= PUNTAJE_SEGUIMIENTO) {
      solicitudesAprobadas++;
      console.log("🟡 Solicitud PREAPROBADA. Coordinamos una visita al domicilio antes de confirmar.");
      alert("🟡 " + nombre + ", tu solicitud quedó PREAPROBADA.\n\nPuntaje: " + puntaje + "/" + PUNTAJE_MAXIMO + "\nCoordinamos una visita antes de confirmar.");
    } else {
      console.log("⛔ Solicitud RECHAZADA por ahora. Te invitamos a ser hogar de tránsito.");
      alert("⛔ " + nombre + ", por ahora no podemos aprobar la adopción.\n\nPuntaje: " + puntaje + "/" + PUNTAJE_MAXIMO + "\n¿Te sumas como hogar de tránsito? 🐾");
    }

    // --------------------------------------------------------
    // PASO 7 - IF / ELSE IF / ELSE: recomendación según el espacio
    // --------------------------------------------------------
    if (puntosVivienda === 3) {
      console.log("🐶 Recomendación: puedes adoptar un perro de cualquier tamaño.");
    } else if (puntosVivienda === 2) {
      console.log("🐕 Recomendación: te conviene un perro chico o mediano, o un gato.");
    } else {
      console.log("🐱 Recomendación: un gato o un perro de raza pequeña es tu mejor opción.");
    }
  } else {
    console.log("🔒 Solicitud cancelada o incompleta. No se pudo evaluar.");
    alert("Solicitud cancelada.\nPuedes volver a intentarlo cuando quieras. 🐾");
  }

  solicitudesEvaluadas++;

  // ----------------------------------------------------------
  // PASO 8 - IF/ELSE: ¿repetir la simulación?
  // ----------------------------------------------------------
  let otraVez = prompt("¿Quieres simular otra solicitud? (si / no)");

  if (otraVez === "si" || otraVez === "Si" || otraVez === "SI") {
    seguirSimulando = true;
  } else {
    seguirSimulando = false;
  }

  if (seguirSimulando && solicitudesEvaluadas >= MAX_SOLICITUDES) {
    console.log("⚠️ Se alcanzó el máximo de " + MAX_SOLICITUDES + " solicitudes por sesión.");
    alert("Llegaste al máximo de " + MAX_SOLICITUDES + " solicitudes.\nRecarga la página para seguir. 🐾");
  }

// La segunda condición asegura que el bucle principal siempre termina
} while (seguirSimulando && solicitudesEvaluadas < MAX_SOLICITUDES);

// ============================================================
// CIERRE: resumen de toda la sesión
// ============================================================
console.log("");
console.log("===============================");
console.log("RESUMEN DE LA SESIÓN");
console.log("===============================");
console.log("Solicitudes evaluadas: " + solicitudesEvaluadas);
console.log("Aprobadas o preaprobadas: " + solicitudesAprobadas);

if (solicitudesAprobadas > 0) {
  console.log("🎉 ¡Gracias por adoptar en " + REFUGIO + "!");
} else {
  console.log("🐾 Gracias por tu interés en " + REFUGIO + ". Te esperamos.");
}

alert("Simulador finalizado.\n\nEvaluadas: " + solicitudesEvaluadas + "\nAprobadas o preaprobadas: " + solicitudesAprobadas + "\n\n¡Gracias por pasar por " + REFUGIO + "! 🐾");
