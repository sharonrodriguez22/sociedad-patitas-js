/* ============================================================
   Test 06 — Persistencia en localStorage

   Verifica que los datos del simulador sobreviven a una
   recarga de la página. Se agrega un rescatado, se abre
   una nueva página en el mismo contexto de navegador, y
   se comprueba que la tarjeta siga presente.
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

test("Los datos persisten después de recargar", async ({ page, context }) => {
  await redirigirCDN(page);
  await page.addInitScript(() => localStorage.clear());
  await page.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForSelector(".tarjeta", { timeout: 10000 });

  // Agregar un rescatado
  await page.fill("#input-nombre-perro", "Persistente");
  await page.selectOption("#select-sexo", "hembra");
  await page.fill("#input-edad-perro", "2");
  await page.selectOption("#select-porte", "chico");
  await page.fill("#input-costo", "8000");
  await page.click('#form-rescatado button[type="submit"]');
  await page.waitForTimeout(1200);

  const antes = await page.locator(".tarjeta").count();

  // Abrir una nueva página en el mismo contexto (comparte localStorage)
  const page2 = await context.newPage();
  await redirigirCDN(page2);
  await page2.goto(URL_BASE + "/page/adopciones.html", {
    waitUntil: "domcontentloaded",
  });
  await page2.waitForSelector(".tarjeta", { timeout: 10000 });
  await page2.waitForTimeout(500);

  const despues = await page2.locator(".tarjeta").count();
  expect(despues).toBe(antes);

  await page2.close();
});