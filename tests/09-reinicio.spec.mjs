/* ============================================================
   TEST 09 - Reinicio del refugio
   Verifica la acción destructiva de reinicio: borra todo el
   estado guardado, restaura los 7 perros originales del JSON
   y oculta el registro de salidas.
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

test("Reiniciar el refugio restaura los 7 perros originales", async ({ page }) => {
  // Agregar un perro para modificar el estado
  await page.fill("#input-nombre-perro", "Temporal");
  await page.selectOption("#select-sexo", "macho");
  await page.fill("#input-edad-perro", "3");
  await page.selectOption("#select-porte", "mediano");
  await page.fill("#input-costo", "10000");
  await page.click('#form-rescatado button[type="submit"]');
  await page.waitForTimeout(500);

  const tarjetasAntes = await page.locator(".tarjeta").count();
  expect(tarjetasAntes).toBe(8);

  // Reiniciar y confirmar en SweetAlert
  await page.click("#btn-reiniciar");
  await page.waitForTimeout(500);

  const swalConfirmar = page.locator(".swal2-confirm");
  await expect(swalConfirmar).toBeVisible();
  await swalConfirmar.click();
  await page.waitForTimeout(1000);

  // Deben volver exactamente 7 tarjetas
  const tarjetasDespues = await page.locator(".tarjeta").count();
  expect(tarjetasDespues).toBe(7);

  // El registro de salidas debe estar oculto
  const panelSalidas = page.locator("#panel-salidas");
  await expect(panelSalidas).toHaveClass(/oculto/);
});