import { marked } from "marked";
import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

/** Directorios que nunca contienen documentación propia del proyecto — se podan durante el
 * recorrido recursivo para no perder tiempo bajando a node_modules en cada build. */
const IGNORED_DIRS = new Set(["node_modules", ".git", "dist", ".claude"]);

function mdToHtml(mdContent: string): string {
  const body = marked.parse(mdContent, { async: false });
  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Documentación</title>
    <style>
      :root {
        color-scheme: dark;
        --panel-bg: rgba(15, 18, 22, 0.92);
        --panel-border: rgba(255, 255, 255, 0.12);
        --text: #e6e9ee;
        --accent: #4fc3f7;
        --code-bg: rgba(79, 195, 247, 0.08);
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      html, body {
        height: 100%;
        font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
        color: var(--text);
        background: #05070a;
        line-height: 1.6;
      }
      body { padding: 2rem 1rem; }
      .container { max-width: 800px; margin: 0 auto; width: 100%; }
      a { color: var(--accent); text-decoration: none; }
      a:hover { text-decoration: underline; }
      code {
        background: var(--code-bg);
        padding: 0.15em 0.4em;
        border-radius: 4px;
        font-size: 0.9em;
        word-break: break-word;
      }
      pre {
        background: var(--code-bg);
        padding: 1rem;
        border-radius: 8px;
        overflow-x: auto;
        border: 1px solid var(--panel-border);
        -webkit-overflow-scrolling: touch;
      }
      pre code { background: none; padding: 0; white-space: pre; word-break: normal; }
      table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
      th, td { border: 1px solid var(--panel-border); padding: 0.5rem 0.75rem; text-align: left; }
      th { background: rgba(79, 195, 247, 0.1); }
      hr { border: none; border-top: 1px solid var(--panel-border); margin: 2rem 0; }
      blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 1rem 0; opacity: 0.85; }
      h1, h2, h3 { margin: 1.5rem 0 0.75rem; color: var(--accent); word-wrap: break-word; }
      h1 { font-size: 1.5rem; }
      h2 { font-size: 1.25rem; }
      h3 { font-size: 1.1rem; }
      p { margin: 0.75rem 0; }
      ul, ol { padding-left: 1.5rem; margin: 0.5rem 0; }
      li { margin: 0.25rem 0; }
      .back-link { display: inline-block; margin-bottom: 1rem; font-size: 0.85rem; opacity: 0.7; }
      .back-link:hover { opacity: 1; }
      img { max-width: 100%; height: auto; }
      @media (max-width: 640px) {
        body { padding: 1rem 0.5rem; }
        h1 { font-size: 1.25rem; }
        h2 { font-size: 1.1rem; }
        h3 { font-size: 1rem; }
        th, td { padding: 0.35rem 0.5rem; font-size: 0.85rem; }
        pre { padding: 0.75rem; font-size: 0.85rem; }
        .container { padding: 0; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <a class="back-link" href="/">&larr; Volver al simulador</a>
      ${body}
    </div>
  </body>
</html>`;
}

/** Recorre el proyecto buscando archivos .md, podando los directorios de IGNORED_DIRS y
 * cualquier carpeta oculta — sin depender de una librería de glob externa. */
function findMarkdownFiles(dir: string, results: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || IGNORED_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findMarkdownFiles(fullPath, results);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      results.push(fullPath);
    }
  }
  return results;
}

export function markdownPlugin(): Plugin {
  return {
    name: "vite-plugin-markdown",

    // Sirve los .md como HTML renderizado durante `vite dev` — pero este hook SOLO existe en el
    // servidor de desarrollo. Un despliegue estático (Netlify, cualquier CDN) no ejecuta ningún
    // proceso Node por request, así que sin el hook de abajo esto no tiene ningún efecto en
    // producción.
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0];
        if (!url || !url.endsWith(".md")) return next();

        const filePath = path.join(ROOT, url);
        if (!fs.existsSync(filePath)) return next();

        const content = fs.readFileSync(filePath, "utf-8");
        const html = mdToHtml(content);
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.setHeader("Content-Length", Buffer.byteLength(html));
        res.end(html);
      });
    },

    // Equivalente para producción: corre una sola vez al final de `vite build` y escribe la
    // misma conversión a HTML como archivos estáticos dentro de dist/, preservando la extensión
    // .md y la ruta relativa exacta de cada documento. Sin esto, los .md ni siquiera llegan al
    // build (ningún módulo JS los importa) y cualquier enlace a ellos da 404 en Netlify.
    // Mantener la extensión .md (en vez de renombrar a .html) es deliberado: así los enlaces
    // relativos que ya existen en toda la documentación (ej. "../investigaciones/01-x.md") siguen
    // resolviendo sin tener que reescribir docenas de archivos. Netlify necesita, además, que se
    // le diga explícitamente que sirva estos .md con Content-Type text/html — ver public/_headers.
    writeBundle(options) {
      const outDir = options.dir ?? path.join(ROOT, "dist");
      for (const filePath of findMarkdownFiles(ROOT)) {
        const relative = path.relative(ROOT, filePath);
        const outPath = path.join(outDir, relative);
        const html = mdToHtml(fs.readFileSync(filePath, "utf-8"));
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, html, "utf-8");
      }
    },
  };
}
