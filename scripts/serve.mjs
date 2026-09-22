import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname } from 'node:path';

const root = resolve('out'),
  port = Number(process.env.PORT || 4416);
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.pdf': 'application/pdf',
  '.xml': 'application/xml',
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (process.env.PORTFOLIO_QA === '1' && url.pathname === '/__qa') {
      const width = Math.max(280, Math.min(1600, Number(url.searchParams.get('width')) || 390));
      const path = url.searchParams.get('path') || '/';
      if (!/^\/[a-z0-9\/-]*$/.test(path)) throw new Error('Invalid preview path');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.end(
        `<style>body{margin:20px;background:#25272b;color:#ddd;font:14px sans-serif}iframe{display:block;width:${width}px;height:850px;border:0;margin-top:15px}</style>${width}px · ${path}<iframe title="Portfolio preview" src="${path}"></iframe>`,
      );
      return;
    }
    let file = resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + '/')) throw new Error('Invalid path');
    let info = await stat(file).catch(() => null);
    if (info?.isDirectory()) {
      file = resolve(file, 'index.html');
      info = await stat(file).catch(() => null);
    }
    if (!info) {
      res.statusCode = 404;
      file = resolve(root, '404.html');
      info = await stat(file);
    }
    const rsc = /\/(?:index|__next\.[^/]+)\.txt$/.test(file);
    res.setHeader(
      'Content-Type',
      rsc ? 'text/x-component' : types[extname(file)] || 'application/octet-stream',
    );
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Accept-Ranges', 'bytes');
    const range = req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range) {
      const start = Number(range[1]),
        end = Math.min(Number(range[2] || info.size - 1), info.size - 1);
      if (start > end || start >= info.size) {
        res.writeHead(416, { 'Content-Range': `bytes */${info.size}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${info.size}`,
        'Content-Length': end - start + 1,
      });
      if (req.method === 'HEAD') res.end();
      else createReadStream(file, { start, end }).pipe(res);
      return;
    }
    res.setHeader('Content-Length', info.size);
    if (req.method === 'HEAD') res.end();
    else res.end(await readFile(file));
  } catch {
    res.writeHead(400);
    res.end('Bad request');
  }
}).listen(port, '127.0.0.1', () => console.log(`Portfolio preview: http://127.0.0.1:${port}`));
