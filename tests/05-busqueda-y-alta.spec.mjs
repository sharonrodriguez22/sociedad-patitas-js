/* ============================================================
   Test 05 — Búsqueda y alta de rescatados

   Verifica el filtro de búsqueda por nombre en tiempo real
   y el registro de un nuevo rescatado desde el formulario
   de ingreso.
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

test("La búsqueda filtra tarjetas y se puede limpiar", async ({ page }) => {
  const totalAntes = await page.locator(".tarjeta").count();

  // Buscar un nombre que no existe
  await page.locator("#input-buscar").pressSequentially("zzznombreimposiblezzz", { delay: 30 });
  await page.waitForTimeout(600);
  await expect(page.locator(".vacio")).toBeVisible();

  // Limpiar la búsqueda y verificar que vuelven todas
  await page.locator("#input-buscar").click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await page.waitForTimeout(600);

  const totalDespues = await page.locator(".tarjeta").count();
  expect(totalDespues).toBe(totalAntes);
});

test("Registrar un ingreso agrega una tarjeta nueva", async ({ page }) => {
  const antes = await page.locator(".tarjeta").count();

  await page.fill("#input-nombre-perro", "Playwright");
  await page.selectOption("#select-sexo", "macho");
  await page.fill("#input-edad-perro", "3");
  await page.selectOption("#select-porte", "mediano");
  await page.fill("#input-costo", "12000");

  await page.click('#form-rescatado button[type="submit"]');
  await page.waitForTimeout(1500);

  const despues = await page.locator(".tarjeta").count();
  expect(despues).toBe(antes + 1);
});