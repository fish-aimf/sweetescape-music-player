const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'public');
const port = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav'
};

function resolve(urlPath) {
  let pathname = urlPath.split('?')[0].split('#')[0];
  try {
    pathname = decodeURIComponent(pathname);
  } catch (error) {
    return null;
  }
  if (pathname === '/' || pathname === '') {
    pathname = '/index.html';
  }
  const target = path.resolve(root, '.' + pathname);
  if (target !== root && !target.startsWith(root + path.sep)) {
    return null;
  }
  const candidates = [ target ];
  if (!path.extname(target)) {
    candidates.push(target + '.html');
  }
  return candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || null;
}

const server = http.createServer((req, res) => {
  const file = resolve(req.url);
  if (!file) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('not found');
    return;
  }
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store'
  });
  fs.createReadStream(file).pipe(res);
});

server.on('error', error => {
  if (error.code === 'EADDRINUSE') {
    console.error(`port ${port} is already in use`);
    process.exit(1);
  }
  throw error;
});

server.listen(port, () => {
  console.log(`serving ${root} on http://localhost:${port}`);
});
