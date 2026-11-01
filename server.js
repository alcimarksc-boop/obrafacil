// Servidor simples do ObraFácil. Requer Node.js 22.13 ou mais recente.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { handleChatRequest } from './server/gemini.mjs';

const porta = Number(process.env.PORT || 3000);
const tipos = {
  html: 'text/html; charset=utf-8',
  css: 'text/css; charset=utf-8',
  js: 'application/javascript; charset=utf-8',
  svg: 'image/svg+xml',
  jpg: 'image/jpeg',
  webp: 'image/webp',
};

http
  .createServer(async (req, res) => {
    const host = req.headers.host || 'localhost:' + porta;
    const url = new URL(req.url, 'http://' + host);
    if (url.pathname === '/api/chat') {
      try {
        let corpo = '';
        for await (const parte of req) {
          corpo += parte;
          if (corpo.length > 60000) {
            res.writeHead(413);
            res.end('Mensagem muito longa.');
            return;
          }
        }
        const request = new Request(url, {
          method: req.method,
          headers: req.headers,
          ...(req.method === 'POST' ? { body: corpo } : {}),
        });
        const resposta = await handleChatRequest(request, {
          apiKey: process.env.GEMINI_API_KEY,
          model: process.env.GEMINI_MODEL,
        });
        res.writeHead(resposta.status, Object.fromEntries(resposta.headers));
        res.end(await resposta.text());
      } catch {
        res.writeHead(500);
        res.end('Não foi possível processar a mensagem.');
      }
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405);
      res.end();
      return;
    }
    const arquivo = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    const permitido =
      ['index.html', 'style.css', 'script.js', 'favicon.svg'].includes(arquivo) ||
      /^imagens\/[a-z0-9-]+\.(jpg|webp|png)$/.test(arquivo);
    if (!permitido) {
      res.writeHead(404);
      res.end('Página não encontrada.');
      return;
    }
    try {
      const dados = await readFile(fileURLToPath(new URL('./' + arquivo, import.meta.url)));
      res.writeHead(200, {
        'Content-Type': tipos[arquivo.split('.').pop()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(req.method === 'HEAD' ? undefined : dados);
    } catch {
      res.writeHead(404);
      res.end('Arquivo não encontrado.');
    }
  })
  .listen(porta, () => console.log('ObraFácil disponível em http://localhost:' + porta));
