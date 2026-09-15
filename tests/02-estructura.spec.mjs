/* ============================================================
   Test 02 — Estructura del simulador

   Verifica que los elementos principales de la página estén
   presentes y visibles: los cuatro paneles del simulador,
   el header, el footer y la navegación del sitio.
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
  await page.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
});

test("Los cuatro paneles del simulador están visibles", async ({ page }) => {
  await expect(page.locator("#panel-destacado")).toBeVisible();
  await expect(page.locator("#panel-refugio")).toBeVisible();
  await expect(page.locator("#panel-solicitud")).toBeVisible();
  await expect(page.locator("#panel-alta")).toBeVisible();
});

test("El header y footer del sitio están intactos", async ({ page }) => {
  await expect(page.locator(".site-header")).toBeVisible();
  await expect(page.locator(".site-footer")).toBeVisible();
  await expect(page.locator(".nav__menu")).toBeVisible();
});