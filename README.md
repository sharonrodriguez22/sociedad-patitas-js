# 🐾 Sociedad Patitas — Pre-Entrega 4

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

## Qué hace el simulador

Evalúa si una persona está en condiciones de adoptar un rescatado:

1. Valida el nombre (máximo 3 intentos).
2. Valida la edad (máximo 3 intentos) y rechaza a menores de 18.
3. Pide el tipo de vivienda con un menú de 4 opciones fijas → suma de 1 a 3 puntos.
4. Recorre un cuestionario de 5 preguntas sí/no → 2 puntos por cada "sí".
5. Clasifica el resultado según el puntaje sobre 13:
   - **11 a 13** → APROBADA
   - **7 a 10** → PREAPROBADA (con visita de seguimiento)
   - **0 a 6** → RECHAZADA
6. Da una recomendación de tamaño de mascota según el espacio disponible.
7. Permite repetir la simulación y muestra un resumen final de la sesión.

## La lista de rescatados (arrays)

El refugio mantiene una lista viva de los animales que esperan hogar:

```js
const rescatados = ["Rocco", "Luna", "Sin nombre", "Nube", "Tobías"];
```

Está declarada con `const` porque **la variable nunca se reasigna**: lo que
cambia es el contenido del array, no la variable en sí.

### Movimientos del refugio

Antes de abrir las solicitudes, el script simula el movimiento de un día real:

| Método | Qué representa en el refugio | Resultado |
|---|---|---|
| `unshift("Nina")` | Caso urgente: entra con prioridad al principio | Nina queda en la posición 0 |
| `pop()` | El último de la lista fue adoptado | Sale Tobías y se guarda en una variable |
| `push("Milo")` | Llega un rescatado nuevo, al final | Milo queda último |
| `splice(3, 1, "Pelusa")` | El que estaba como "Sin nombre" ya tiene nombre | Se reemplaza en su posición |
| `includes()` + `indexOf()` | Buscar si un animal está disponible y en qué lugar | Retorna el índice, o `-1` |

Estado inicial (5) → después de los movimientos (6):

```
["Nina", "Rocco", "Luna", "Pelusa", "Nube", "Milo"]
```

### Búsqueda por parte del usuario

Cuando una solicitud queda aprobada o preaprobada, se muestra la lista y se
puede consultar por un rescatado concreto. La función `buscarRescatado` usa
`includes()` para saber si está, y `indexOf()` para decir en qué posición:

```js
function buscarRescatado(lista, nombre) {
  let indice = -1;

  if (lista.includes(nombre)) {
    indice = lista.indexOf(nombre);
  }

  return indice;
}
```

### Recorrido con `for...of`

`mostrarRescatados` recorre la lista con `for...of`, que en cada vuelta entrega
directamente el **valor** del elemento, sin necesidad de un índice:

```js
for (const rescatado of lista) {
  console.log("   • Rescatado: " + rescatado);
}
```

En el cuestionario, en cambio, se usa un `for` clásico con `.length`, porque
ahí **sí** hace falta el índice para numerar las preguntas.

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
| `obtenerVivienda` | Declarada | `opcion` | Un **objeto** `{ nombre, puntos }` |
| `clasificarSolicitud` | **Expresada** | `puntaje` | `"APROBADA"`, `"PREAPROBADA"` o `"RECHAZADA"` |
| `obtenerRecomendacion` | Declarada | `puntosVivienda` | Texto con la recomendación |
| `esAfirmativa` | **Flecha** | `texto` | `true` o `false` |
| `esNegativa` | **Flecha** | `texto` | `true` o `false` |
| `puntosQueFaltan` | **Flecha** | `puntaje`, `minimo` | Cuántos puntos faltaron |

### 3. Gestión de la lista de rescatados

| Función | Tipo | Parámetros | Retorna |
|---|---|---|---|
| `registrarIngreso` | Declarada | `lista`, `nombre` | Cantidad de rescatados (`push`) |
| `registrarUrgencia` | Declarada | `lista`, `nombre` | Cantidad de rescatados (`unshift`) |
| `registrarAdopcion` | Declarada | `lista` | El rescatado que salió (`pop`) |
| `buscarRescatado` | Declarada | `lista`, `nombre` | El índice, o `-1` (`includes` + `indexOf`) |
| `corregirNombre` | Declarada | `lista`, `indice`, `nuevoNombre` | El nombre anterior (`splice`) |

### 4. Salida de resultados

| Función | Tipo | Parámetros | Retorna |
|---|---|---|---|
| `mostrarRescatados` | Declarada | `lista` | Nada: recorre con `for...of` y muestra |
| `mostrarEncabezado` | Declarada | `numero` | Nada: solo muestra |
| `mostrarResultado` | Declarada | `nombre`, `puntaje`, `maximo`, `estado` | Nada: solo muestra |
| `mostrarResumen` | Declarada | `evaluadas`, `aprobadas` | Nada: solo muestra |