# 🐾 Sociedad Patitas — Pre-Entrega 2

Simulador de solicitud de adopción del refugio **Sociedad Patitas**.
Curso de JavaScript · Carrera de Desarrollo de Aplicaciones · Coderhouse.

## Estructura

```
sociedad-patitas-preentrega2/
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
