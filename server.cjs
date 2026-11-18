'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };
const publicFiles = new Set(['index.html', 'app.js', 'engine.js', 'style.css']);
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (!publicFiles.has(file)) { res.writeHead(404); res.end('Introuvable'); return; }
  res.writeHead(200, { 'Content-Type': types[path.extname(file)], 'Cache-Control': 'no-store' });
  fs.createReadStream(path.join(__dirname, file)).pipe(res);
});
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Jeu disponible : http://127.0.0.1:${server.address().port}`));
