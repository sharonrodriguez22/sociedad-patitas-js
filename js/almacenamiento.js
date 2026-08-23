/* ============================================================
   SOCIEDAD PATITAS · Refugio canino · Pre-Entrega 8
   almacenamiento.js · La memoria del navegador

   Toda la conversación con el Web Storage pasa por este archivo.
   Ninguna otra parte del proyecto llama a localStorage directamente.

   Se usan los dos tipos de almacenamiento, cada uno donde tiene
   sentido:

   · localStorage   → los perros del refugio y el registro de salidas.
                      Son los datos del refugio: tienen que seguir ahí
                      mañana, aunque se cierre el navegador.

   · sessionStorage → la solicitud que se está evaluando. Es un dato
                      de la visita actual: sobrevive a un F5, pero se
                      borra al cerrar la pestaña.
   ============================================================ */

/* ------------------------------------------------------------
   1) GUARDAR Y LEER
   Los datos del refugio se guardan como texto y se recuperan como
   objetos, siempre a través de estas dos funciones.
   ------------------------------------------------------------ */

// Convierte el dato a texto y lo guarda. Retorna true si pudo.
function guardarEn(almacen, clave, valor) {
  try {
    almacen.setItem(clave, JSON.stringify(valor));
    return true;
  } catch (error) {
    // El navegador puede negarse: modo privado, storage lleno o
    // bloqueado por configuración. El simulador sigue funcionando,
    // pero sin memoria entre sesiones.
    return false;
  }
}

// Recupera el dato y lo convierte de texto a objeto o array.
// Retorna null si no había nada guardado o si el texto está roto.
function leerDe(almacen, clave) {
  try {
    const texto = almacen.getItem(clave);

    return texto ? JSON.parse(texto) : null;
  } catch (error) {
    return null;
  }
}

// Borra una clave puntual.
function borrarDe(almacen, clave) {
  try {
    almacen.removeItem(clave);
    return true;
  } catch (error) {
    return false;
  }
}

/* ------------------------------------------------------------
   2) ATAJOS POR TIPO DE ALMACÉN
   Para no repetir el objeto localStorage o sessionStorage en cada
   llamada del resto del proyecto.
   ------------------------------------------------------------ */

const guardarLocal = (clave, valor) => guardarEn(localStorage, clave, valor);
const leerLocal = (clave) => leerDe(localStorage, clave);
const borrarLocal = (clave) => borrarDe(localStorage, clave);

const guardarSesion = (clave, valor) => guardarEn(sessionStorage, clave, valor);
const leerSesion = (clave) => leerDe(sessionStorage, clave);
const borrarSesion = (clave) => borrarDe(sessionStorage, clave);

/* ------------------------------------------------------------
   3) ESTADO DEL ALMACENAMIENTO
   Sirve para avisarle al usuario si el navegador no deja guardar.
   ------------------------------------------------------------ */

// Escribe y borra una clave de prueba para saber si hay memoria.
function hayAlmacenamiento() {
  const CLAVE_PRUEBA = "patitas.prueba";

  if (guardarLocal(CLAVE_PRUEBA, true) === false) {
    return false;
  }

  borrarLocal(CLAVE_PRUEBA);
  return true;
}

// Deja el armario vacío: borra todo lo que guardó el simulador.
// No se usa localStorage.clear() a propósito, porque borraría también
// lo que hayan guardado otras páginas del mismo dominio.
function vaciarAlmacenamiento() {
  borrarLocal(CLAVE_RESCATADOS);
  borrarLocal(CLAVE_SALIDAS);
  borrarSesion(CLAVE_SOLICITUD);
}