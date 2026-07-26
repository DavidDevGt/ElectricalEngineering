import { marked } from "marked";
import type { Plugin } from "vite";
import fs from "fs";
import path from "path";

const ROOT = process.cwd();

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

export function markdownPlugin(): Plugin {
  return {
    name: "vite-plugin-markdown",
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
  };
}
