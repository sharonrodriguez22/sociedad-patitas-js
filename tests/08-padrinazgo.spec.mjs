/* ============================================================
   TEST 08 - Padrinazgo
   Verifica el flujo de apadrinamiento: que un nombre vacío sea
   rechazado con error visible, y que un nombre válido quede
   reflejado en la tarjeta del rescatado.
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
  await page.addInitScript(() => localStorage.clear());
  await redirigirCDN(page, URL_BASE);
  await page.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(2000);
});

test("Apadrinar sin nombre muestra un error", async ({ page }) => {
  await page.fill("#input-padrino", "");
  const botonApadrinar = page.locator('[data-accion="apadrinar"]').first();
  await botonApadrinar.click();
  await page.waitForTimeout(300);

  const tieneError =
    (await page.locator(".campo-error").count()) > 0 ||
    (await page.locator(".error-campo").count()) > 0;

  expect(tieneError).toBe(true);
});

test("Apadrinar con nombre válido actualiza la tarjeta", async ({ page }) => {
  await page.fill("#input-padrino", "María García");

  const botonApadrinar = page.locator('[data-accion="apadrinar"]').first();
  await botonApadrinar.click();
  await page.waitForTimeout(500);

  const textoApadrinado = page.locator(".tarjeta__actions button", {
    hasText: "María García",
  });
  expect(await textoApadrinado.count()).toBeGreaterThan(0);
});