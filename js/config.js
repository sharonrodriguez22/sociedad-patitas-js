/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 8
   config.js · Constantes de configuración

   Los valores fijos del refugio, todos juntos en un solo lugar.
   Si cambia una regla de negocio (el puntaje mínimo, la edad de
   corte de los cachorros), se toca solo este archivo.
   ============================================================ */

const REFUGIO = "Sociedad Patitas";
const EDAD_MINIMA = 18;
const EDAD_MAXIMA = 100;
const LARGO_MINIMO_NOMBRE = 3;
const PUNTOS_POR_SI = 2;
const PUNTAJE_MAXIMO = 13; // 3 de vivienda + 5 preguntas x 2 puntos
const PUNTAJE_APROBADO = 11;
const PUNTAJE_SEGUIMIENTO = 7;
const EDAD_CACHORRO = 2;      // hasta 2 años se considera cachorro
const DURACION_MENSAJE = 4500; // milisegundos que dura un aviso en pantalla

const PREGUNTAS = [
  "¿Puedes cubrir gastos de comida, vacunas y veterinario?",
  "¿Hay alguien en casa durante buena parte del día?",
  "¿Tu vivienda tiene rejas, balcón cerrado o patio seguro?",
  "¿Todas las personas que viven contigo están de acuerdo?",
  "¿Te comprometes a castrar al perro y recibir una visita de seguimiento?"
];

// Espacio mínimo que necesita cada porte, en puntos de vivienda
const PUNTOS_POR_PORTE = { chico: 1, mediano: 2, grande: 3 };

/* ------------------------------------------------------------
   CLAVES DEL WEB STORAGE
   Van con el prefijo "patitas." para no chocar con lo que puedan
   guardar otras páginas del mismo dominio.
   ------------------------------------------------------------ */
const CLAVE_RESCATADOS = "patitas.rescatados"; // localStorage
const CLAVE_SALIDAS = "patitas.salidas";       // localStorage
const CLAVE_SOLICITUD = "patitas.solicitud";   // sessionStorage