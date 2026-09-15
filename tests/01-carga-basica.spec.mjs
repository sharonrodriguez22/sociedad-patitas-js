/* ============================================================
   Test 01 — Carga básica

   Verifica que la página de adopciones carga correctamente
   sin errores de JavaScript en la consola del navegador.
   ============================================================ */
import { test, expect } from "@playwright/test";
import { iniciarServidor, detenerServidor } from "./helpers/servidor.mjs";
import { redirigirCDN } from "./helpers/cdn.mjs";

let servidor;
let URL_BASE;

test.beforeAll(async () => {
  const resultado = await iniciarServidor();
  servidor = resultado.servidor;
  URL_BASE = resultado.url;
});

test.afterAll(() => {
  detenerServidor(servidor);
});

test("La página de adopciones carga sin errores", async ({ page }) => {
  const errores = [];
  page.on("pageerror", (error) => errores.push(error.message));

  await redirigirCDN(page);
  await page.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);

  expect(errores).toEqual([]);
});