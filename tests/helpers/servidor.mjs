/* ============================================================
   Servidor HTTP local para el entorno de pruebas

   El simulador carga datos desde rescatados.json con fetch,
   que requiere protocolo HTTP (no funciona con file://).
   Este módulo levanta un servidor en un puerto libre antes
   de correr los tests y lo apaga al terminar.

   También resuelve las librerías SweetAlert2 y Toastify
   desde node_modules en lugar de CDN, para que las pruebas
   no dependan de conexión a internet.
   ============================================================ */
import { createServer } from "http";
import { readFile } from "fs/promises";
import { resolve, extname } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

const TIPOS_MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

// SweetAlert2 y Toastify se sirven desde node_modules
// para que los tests no dependan de conexión a internet.
const CDN_LOCAL = {
  "/cdn/sweetalert2.min.css": "node_modules/sweetalert2/dist/sweetalert2.min.css",
  "/cdn/sweetalert2.min.js": "node_modules/sweetalert2/dist/sweetalert2.all.min.js",
  "/cdn/toastify.min.css": "node_modules/toastify-js/src/toastify.css",
  "/cdn/toastify.min.js": "node_modules/toastify-js/src/toastify.js",
};

function crearServidor() {
  return createServer(async (pedido, respuesta) => {
    const ruta = pedido.url.split("?")[0];

    if (CDN_LOCAL[ruta]) {
      try {
        const contenido = await readFile(resolve(ROOT, CDN_LOCAL[ruta]));
        const extension = extname(CDN_LOCAL[ruta]);
        const tipo = TIPOS_MIME[extension] || "application/octet-stream";
        respuesta.writeHead(200, { "Content-Type": tipo });
        respuesta.end(contenido);
        return;
      } catch { /* sigue al flujo normal */ }
    }

    let archivo = resolve(ROOT, "." + ruta);
    if (archivo.endsWith("/")) archivo += "index.html";

    try {
      const contenido = await readFile(archivo);
      const extension = extname(archivo);
      const tipo = TIPOS_MIME[extension] || "application/octet-stream";
      respuesta.writeHead(200, { "Content-Type": tipo });
      respuesta.end(contenido);
    } catch {
      respuesta.writeHead(404);
      respuesta.end("No encontrado");
    }
  });
}

export async function iniciarServidor() {
  const servidor = crearServidor();
  await new Promise((resolve) => servidor.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${servidor.address().port}`;
  return { servidor, url };
}

export function detenerServidor(servidor) {
  servidor?.close();
}