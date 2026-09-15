/* ============================================================
   Test 03 — Renderizado dinámico

   Verifica que el simulador carga los datos desde
   rescatados.json y genera las tarjetas de los perros
   en el DOM. También comprueba que el panel del rescatado
   de la semana se complete con contenido.
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

test.beforeEach(async ({ page }) => {
  await redirigirCDN(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
});

test("Las tarjetas de rescatados se generan desde el JSON", async ({ page }) => {
  await page.waitForSelector(".tarjeta", { timeout: 10000 });
  const cantidad = await page.locator(".tarjeta").count();
  expect(cantidad).toBe(7);
});

test("El rescatado de la semana muestra contenido", async ({ page }) => {
  await page.waitForSelector(".tarjeta", { timeout: 10000 });
  await page.waitForTimeout(1500);

  const texto = await page.locator("#contenido-destacado").textContent();
  expect(texto.length).toBeGreaterThan(10);
});