/* ============================================================
   TEST 10 — Reserva, tránsito y rechazo
   Tres flujos secundarios que validan distintos caminos según
   el estado de la solicitud: reservar con solicitud preaprobada,
   enviar a tránsito con confirmación, y verificar que una
   solicitud rechazada bloquea las acciones de adopción.
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

// ---- RESERVA ----
// Solicitud PREAPROBADA (puntaje 7-10) permite reservar pero no adoptar.
// Depto sin balcón (1) + 4 preguntas (8) = 9 → PREAPROBADA

test("Una solicitud preaprobada permite reservar un perro", async ({ page }) => {
  await page.fill("#input-nombre", "Test Reserva");
  await page.fill("#input-edad", "25");
  await page.selectOption("#select-vivienda", "1");

  const preguntas = page.locator(".check-pregunta");
  for (let i = 0; i < 4; i++) {
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
  await expect(resultado).toContainText("PREAPROBADA");

  const botonReservar = page.locator('[data-accion="reservar"]').first();
  await botonReservar.click();
  await page.waitForTimeout(500);

  const textoReservado = page.locator("button", {
    hasText: "Reservado a tu nombre",
  });
  expect(await textoReservado.count()).toBeGreaterThan(0);
});

// ---- TRÁNSITO ----
// No requiere solicitud. El perro sale de la lista y queda en salidas.

test("Enviar un perro a tránsito lo saca de la lista", async ({ page }) => {
  const tarjetasAntes = await page.locator(".tarjeta").count();

  const botonTransito = page.locator('[data-accion="baja"]').first();
  await botonTransito.click();
  await page.waitForTimeout(500);

  const swalConfirmar = page.locator(".swal2-confirm");
  await expect(swalConfirmar).toBeVisible();
  await swalConfirmar.click();
  await page.waitForTimeout(500);

  const tarjetasDespues = await page.locator(".tarjeta").count();
  expect(tarjetasDespues).toBe(tarjetasAntes - 1);

  const panelSalidas = page.locator("#panel-salidas");
  await expect(panelSalidas).toBeVisible();

  const salidasTransito = page.locator("#contenedor-salidas .salida--transito");
  expect(await salidasTransito.count()).toBeGreaterThan(0);
});

// ---- RECHAZO ----
// Puntaje bajo (<7) rechaza la solicitud y no muestra botones de acción.
// Depto sin balcón (1) + 2 preguntas (4) = 5 → RECHAZADA

test("Una solicitud rechazada no permite adoptar ni reservar", async ({ page }) => {
  await page.fill("#input-nombre", "Test Rechazo");
  await page.fill("#input-edad", "25");
  await page.selectOption("#select-vivienda", "1");

  const preguntas = page.locator(".check-pregunta");
  for (let i = 0; i < 2; i++) {
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
  await expect(resultado).toContainText("RECHAZADA");

  const botonesAdoptar = page.locator('[data-accion="adoptar"]');
  const botonesReservar = page.locator('[data-accion="reservar"]');

  expect(await botonesAdoptar.count()).toBe(0);
  expect(await botonesReservar.count()).toBe(0);
});