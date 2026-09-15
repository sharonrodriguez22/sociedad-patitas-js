/* ============================================================
   TEST 07 - Flujo completo de adopción
   Verifica el happy path principal: aprobar una solicitud,
   adoptar un perro mediante confirmación con SweetAlert2, y
   comprobar que el perro sale de la lista y queda registrado
   en el historial de salidas.
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

test("Adoptar un perro lo saca de la lista y lo registra en salidas", async ({ page }) => {
  const tarjetasAntes = await page.locator(".tarjeta").count();

  // Solicitud con puntaje máximo → APROBADA
  // Casa con patio (3) + 5 preguntas (10) = 13
  await page.fill("#input-nombre", "Test Adopción");
  await page.fill("#input-edad", "30");
  await page.selectOption("#select-vivienda", "3");

  const preguntas = page.locator(".check-pregunta");
  const cantidad = await preguntas.count();
  for (let i = 0; i < cantidad; i++) {
    await preguntas.nth(i).check();
  }

  await page.click('#form-solicitud button[type="submit"]');
  await page.waitForTimeout(500);

  const swalResultado = page.locator(".swal2-confirm");
  if (await swalResultado.isVisible()) {
    await swalResultado.click();
    await page.waitForTimeout(300);
  }

  const resultado = page.locator("#resultado-solicitud");
  await expect(resultado).toContainText("APROBADA");

  // Adoptar el primer perro disponible
  const botonAdoptar = page.locator('[data-accion="adoptar"]').first();
  await botonAdoptar.click();
  await page.waitForTimeout(500);

  // Confirmar en SweetAlert
  const swalConfirmar = page.locator(".swal2-confirm");
  await expect(swalConfirmar).toBeVisible();
  await swalConfirmar.click();
  await page.waitForTimeout(500);

  // Cerrar el SweetAlert de éxito
  const swalFinal = page.locator(".swal2-confirm");
  if (await swalFinal.isVisible()) {
    await swalFinal.click();
    await page.waitForTimeout(300);
  }

  // Debe haber una tarjeta menos
  const tarjetasDespues = await page.locator(".tarjeta").count();
  expect(tarjetasDespues).toBe(tarjetasAntes - 1);

  // El registro de salidas debe mostrar la adopción
  const panelSalidas = page.locator("#panel-salidas");
  await expect(panelSalidas).toBeVisible();

  const salidas = page.locator("#contenedor-salidas .salida--adopcion");
  expect(await salidas.count()).toBeGreaterThan(0);
});