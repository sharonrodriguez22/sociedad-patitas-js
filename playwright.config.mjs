/* ============================================================
   Configuración de Playwright para Sociedad Patitas
   ============================================================ */
import { defineConfig } from "@playwright/test";

export default defineConfig({

  // Carpeta donde Playwright busca los archivos de test
  testDir: "./tests",

  // Tiempo máximo que puede durar UN test antes de fallar (30 segundos)
  timeout: 30000,

  // Navegador que se usa para las pruebas
  use: {
    // Chromium es el motor de Chrome
    browserName: "chromium",

    // headless: true significa que el navegador corre "invisible",
    // sin abrir una ventana. Ideal para correr tests rápido.
    // Si lo pones en false, vas a ver el navegador abrirse solo.
    headless: true,
  },
});