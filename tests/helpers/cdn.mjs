/* ============================================================
   Interceptor de CDN para el entorno de pruebas

   La página de adopciones carga SweetAlert2 y Toastify desde
   CDN en producción. Este módulo intercepta esas peticiones
   y las redirige a las copias locales en node_modules,
   aislando los tests de dependencias externas.
   ============================================================ */
import { readFile } from "fs/promises";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

let htmlModificado = null;

async function obtenerHTMLModificado() {
  if (htmlModificado) return htmlModificado;

  let html = await readFile(resolve(ROOT, "page/adopciones.html"), "utf-8");

  html = html.replace(
    'href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css"',
    'href="/cdn/sweetalert2.min.css"'
  );
  html = html.replace(
    'src="https://cdn.jsdelivr.net/npm/sweetalert2@11"',
    'src="/cdn/sweetalert2.min.js"'
  );
  html = html.replace(
    'href="https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css"',
    'href="/cdn/toastify.min.css"'
  );
  html = html.replace(
    'src="https://cdn.jsdelivr.net/npm/toastify-js"',
    'src="/cdn/toastify.min.js"'
  );

  htmlModificado = html;
  return html;
}

export async function redirigirCDN(page) {
  const html = await obtenerHTMLModificado();

  await page.route("**/page/adopciones.html", (route) => {
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: html,
    });
  });
}