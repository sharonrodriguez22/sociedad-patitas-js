/* ============================================================
   Test 04 - Formulario de solicitud de adopción

   Verifica la validación del formulario (campos vacíos) y el
   flujo completo: llenar los datos, responder el cuestionario,
   enviar y comprobar que se muestra el resultado.
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
  await page.waitForSelector(".tarjeta", { timeout: 10000 });
});

test("Enviar solicitud vacía muestra error de validación", async ({ page }) => {
  await page.click('#form-solicitud button[type="submit"]');
  await page.waitForTimeout(800);

  const tieneError = await page.evaluate(() => {
    return document.querySelectorAll(".campo-error").length > 0
        || document.querySelector(".swal2-popup") !== null;
  });

  expect(tieneError).toBe(true);
});

test("Solicitud completa muestra el resultado", async ({ page }) => {
  await page.fill("#input-nombre", "Test Adoptante");
  await page.fill("#input-edad", "28");
  await page.selectOption("#select-vivienda", { index: 1 });

  const checks = page.locator(".check-pregunta");
  const cantidad = await checks.count();
  for (let i = 0; i < cantidad; i++) {
    await checks.nth(i).check();
  }

  await page.click('#form-solicitud button[type="submit"]');
  await page.waitForTimeout(800);

  const swal = page.locator(".swal2-confirm");
  if (await swal.isVisible()) {
    await swal.click();
    await page.waitForTimeout(300);
  }

  await expect(page.locator("#resultado-solicitud")).not.toBeEmpty();
});