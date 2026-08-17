# 🐾 Sociedad Patitas — Pre-Entrega 5

Simulador de solicitud de adopción del refugio **Sociedad Patitas**.
Curso de JavaScript · Carrera de Desarrollo de Aplicaciones · Coderhouse.

## Estructura

```
sociedad-patitas-js/
├── index.html      # enlaza el CSS y el script con defer
├── css/
│   └── styles.css  # estilos de la página
├── js/
│   └── main.js     # toda la lógica de control de flujo
└── README.md
```

Vinculación en el `<head>` del HTML:

```html
<link rel="stylesheet" href="css/styles.css">
<script src="js/main.js" defer></script>
```

## Cómo se usa

1. Abrir `index.html` en el navegador.
2. Abrir la consola con `F12` → pestaña **Console**.
3. Responder las ventanas emergentes.

## Corrección de la devolución anterior

En la Pre-Entrega 4 la función `buscarRescatado` estaba declarada **dos veces**:
la segunda definición pisaba a la primera, así que la primera era código muerto.
Quedó una sola versión, la que compara sin distinguir mayúsculas.

## Qué se agregó en esta entrega

La Pre-Entrega 4 guardaba a los rescatados como una lista de textos:

```js
const rescatados = ["Rocco", "Luna", "Sin nombre", "Nube", "Tobías"];
```

El problema es que un texto no puede guardar el sexo, la edad ni el
espacio que necesita el perro, y tampoco puede *hacer* nada. Ahora cada
rescatado es un **objeto creado con una clase**, y la lista pasa a ser un
array de objetos.

## Qué hace el simulador

1. Verifica las clases por consola.
2. Simula los **movimientos del refugio del día** sobre el array de objetos.
3. Abre el ciclo de solicitudes (`do...while`):
   - Valida el nombre (máximo 3 intentos).
   - Valida la edad (máximo 3 intentos) y rechaza a menores de 18.
   - Pide el tipo de vivienda con un menú de 4 opciones → de 1 a 3 puntos.
   - Crea la instancia de `Solicitud` con los datos ya validados.
   - Recorre el cuestionario de 5 preguntas → `sumarPuntos(2)` por cada "sí".
   - `evaluar()` clasifica el puntaje sobre 13:
     - **11 a 13** → APROBADA
     - **7 a 10** → PREAPROBADA (con visita de seguimiento)
     - **0 a 6** → RECHAZADA
   - Si `fueAceptada()`, muestra **solo los rescatados compatibles y libres** de esa vivienda. Según el estado:
     - **APROBADA** → `adoptar()` y el perro sale de la lista con `splice`.
     - **PREAPROBADA** → `reservar()`: el perro queda apartado, sigue en el
       refugio y no aparece como disponible para otra persona.
4. Muestra un resumen final con evaluadas, aprobadas, adopciones concretadas
   y quiénes siguen esperando hogar.


## Las clases

### `Rescatado`

Modela a cada animal del refugio. El `constructor` recibe **5 parámetros**
y los guarda en el objeto con `this`.

| Propiedad | Origen | Ejemplo |
|---|---|---|
| `nombre` | parámetro | `"Rocco"` |
| `sexo` | parámetro | `"macho"` |
| `edad` | parámetro | `3` |
| `tamanio` | parámetro | `"grande"` |
| `puntosViviendaMinimos` | parámetro | `3` |
| `reservado` | valor fijo inicial | `false` |
| `reservadoPor` | valor fijo inicial | `""` |
| `adoptado` | valor fijo inicial | `false` |
| `adoptadoPor` | valor fijo inicial | `""` |

Las cuatro últimas no se piden por parámetro: todo rescatado nace disponible y
sin familia. Cambian recién cuando se ejecuta `reservar()` o `adoptar()`.

| Método | Qué hace | Retorna |
|---|---|---|
| `describir()` | **Informa**: arma la ficha del animal para consola o `alert` | Un texto |
| `esCompatibleCon(puntosVivienda)` | **Calcula**: compara el espacio de la vivienda con el que necesita | `true` / `false` |
| `estaDisponible()` | **Informa**: `true` solo si nadie lo adoptó ni lo reservó | `true` / `false` |
| `reservar(nombreAdoptante)` | **Modifica**: lo aparta para una solicitud PREAPROBADA, sin sacarlo del refugio | `false` si ya estaba pedido |
| `bautizar(nuevoNombre)` | **Modifica**: le cambia el nombre al que entró sin identificar | El nombre anterior |
| `adoptar(nombreAdoptante)` | **Modifica**: marca `adoptado = true` y guarda quién se lo llevó | `false` si ya estaba adoptado o reservado por otro |


### `Solicitud`

Modela la postulación de cada persona. Antes el puntaje y el estado eran
variables sueltas dentro del bucle; ahora viven dentro del objeto.

| Propiedad | Ejemplo |
|---|---|
| `nombreAdoptante` | `"Sharon Rodríguez"` |
| `edad` | `30` |
| `tipoVivienda` | `"Casa con patio"` |
| `puntosVivienda` | `3` |
| `puntaje` | arranca con los puntos de la vivienda |
| `estado` | `"EN EVALUACIÓN"` hasta que se evalúa |

| Método | Qué hace | Retorna |
|---|---|---|
| `sumarPuntos(puntos)` | **Modifica** el puntaje acumulado | El puntaje actualizado |
| `evaluar()` | **Modifica** el estado. Reutiliza la función expresada `clasificarSolicitud` | `"APROBADA"`, `"PREAPROBADA"` o `"RECHAZADA"` |
| `fueAceptada()` | **Informa** si quedó aprobada o preaprobada | `true` / `false` |
| `resumen()` | **Informa**: una línea con todos los datos | Un texto |

## Instanciación con `new`

Cada objeto real se crea con `new` y se guarda en una **constante**:

```js
const rocco  = new Rescatado("Rocco", "macho", 3, "grande", 3);
const luna   = new Rescatado("Luna", "hembra", 2, "chico", 1);
const nube   = new Rescatado("Nube", "hembra", 5, "chico", 1);
const tobias = new Rescatado("Tobías", "macho", 7, "mediano", 2);
// ...

const rescatados = [rocco, luna, rescatadoSinNombre, nube, tobias];
```

`new` hace cuatro cosas automáticamente: crea un objeto vacío, apunta `this`
a ese objeto, ejecuta el constructor y devuelve el objeto ya armado.

Las instancias son **independientes**: adoptar a Rocco no cambia en nada a Luna.

Además, dentro del bucle principal se crea una instancia de `Solicitud` por
cada persona que usa el simulador.

## Verificación por consola

Apenas se abre la página, antes del simulador, el script comprueba que las
clases funcionan:

```
--- Verificación de la clase Rescatado ---
Rescatado { nombre: 'Rocco', sexo: 'macho', edad: 3, ... }
describir() → 🐶 Rocco · macho · porte grande · 3 años · disponible
¿Rocco entra en un depto sin balcón (1 punto)? false
¿Rocco entra en una casa con patio (3 puntos)? true
¿Se puede volver a adoptar a Carbón? false

--- Verificación de la clase Solicitud ---
Puntaje inicial (solo vivienda): 3
Puntaje tras el cuestionario: 13
evaluar() → APROBADA
resumen() → Prueba Automática · Casa con patio · 13/13 · APROBADA
```

## Los métodos de array (se mantienen de la Pre-Entrega 4)

Ahora operan sobre objetos en lugar de textos:

| Método | Función | Qué representa en el refugio |
|---|---|---|
| `push()` | `registrarIngreso` | Llega un rescatado nuevo, al final |
| `unshift()` | `registrarUrgencia` | Caso urgente: entra con prioridad al principio |
| `pop()` | `registrarAdopcionDelDia` | El último de la lista fue adoptado |
| `includes()` + `indexOf()` | `buscarRescatado` | Buscar si un animal está disponible y en qué lugar |
| `splice()` | `retirarDeLaLista` | Sacar de la lista al que acaban de adoptar |

Como la lista guarda **objetos**, `includes()` e `indexOf()` no pueden comparar
contra un texto directamente. Por eso `buscarRescatado` arma primero un array
auxiliar con los nombres en minúsculas y busca sobre ese:

```js
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
```

## Funciones del simulador

El script sigue el algoritmo básico de todo programa:
**entrada de datos → procesamiento → salida de resultados.**

### 1. Entrada de datos

| Función | Tipo | Parámetros | Retorna |
|---|---|---|---|
| `pedirTexto` | Declarada | `mensaje`, `largoMinimo` | El texto validado, o `""` si falla |
| `pedirNumeroEntero` | Declarada | `mensaje`, `minimo`, `maximo` | El número validado, o `0` si falla |
| `pedirRespuestaSiNo` | Declarada | `pregunta`, `numero`, `total` | `"si"`, `"no"` o `""` |

### 2. Procesamiento

| Función | Tipo | Parámetros | Retorna |
|---|---|---|---|
| `obtenerVivienda` | Declarada | `opcion` | Un objeto literal `{ nombre, puntos }` |
| `clasificarSolicitud` | **Expresada** | `puntaje` | El estado de la solicitud |
| `obtenerRecomendacion` | Declarada | `puntosVivienda` | Texto con la recomendación |
| `filtrarCompatibles` | Declarada | `lista`, `puntosVivienda` | Array con los rescatados que entran en esa vivienda |
| `esAfirmativa` | **Flecha** | `texto` | `true` o `false` |
| `esNegativa` | **Flecha** | `texto` | `true` o `false` |
| `puntosQueFaltan` | **Flecha** | `puntaje`, `minimo` | Cuántos puntos faltaron |

`obtenerVivienda` devuelve un **objeto literal** y no una instancia de clase
porque es un dato simple, de un solo uso y sin comportamiento propio: no
necesita métodos ni crear muchas copias iguales.

### 3. Gestión de la lista de rescatados

| Función | Parámetros | Retorna |
|---|---|---|
| `registrarIngreso` | `lista`, `rescatado` | Cantidad de rescatados (`push`) |
| `registrarUrgencia` | `lista`, `rescatado` | Cantidad de rescatados (`unshift`) |
| `registrarAdopcionDelDia` | `lista`, `familia` | El objeto que salió (`pop` + `adoptar()`) |
| `buscarRescatado` | `lista`, `nombre` | El índice, o `-1` (`includes` + `indexOf`) |
| `retirarDeLaLista` | `lista`, `indice` | El objeto retirado (`splice`) |

### 4. Salida de resultados

| Función | Parámetros | Retorna |
|---|---|---|
| `armarTextoRescatados` | `lista` | Texto con un rescatado por línea (`for...of` + `describir()`) |
| `mostrarRescatados` | `lista` | Nada: solo muestra |
| `mostrarEncabezado` | `numero` | Nada: solo muestra |
| `mostrarResultado` | `solicitud` | Nada: recibe el objeto completo |
| `mostrarResumen` | `evaluadas`, `aprobadas`, `adopciones`, `lista` | Nada: solo muestra |
