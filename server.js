// Static file server for the deployed build, with HTTP Basic Auth in front
// of it — see CONTEXT.md's "Deployment / access control" section. Local
// dev (`npm run dev`, vite) is completely unaffected; this only runs when
// Heroku's `npm start` invokes it (see package.json / Procfile).
//
// Credentials come from env vars (BASIC_AUTH_USER / BASIC_AUTH_PASS), with
// the agreed default values as a fallback so this works out of the box
// without any Heroku config — but the intent is to actually set them via
// `heroku config:set` so they aren't just sitting as a code default forever.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;
const USER = process.env.BASIC_AUTH_USER || 'platform-ia';
const PASS = process.env.BASIC_AUTH_PASS || 'futurestate';

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function checkAuth(req) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Basic ')) return false;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const separatorIndex = decoded.indexOf(':');
  const user = decoded.slice(0, separatorIndex);
  const pass = decoded.slice(separatorIndex + 1);
  return user === USER && pass === PASS;
}

const server = http.createServer((req, res) => {
  if (!checkAuth(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Platform IA prototype"' });
    res.end('Authentication required.');
    return;
  }

  // Resolve the request path against dist/, defaulting to index.html for
  // both the root and any unknown path (this is a single-page app with no
  // server-side routes — every path should fall through to index.html so
  // client-side navigation/refresh doesn't 404).
  const requestedPath = path.normalize(req.url.split('?')[0]);
  let filePath = path.join(DIST_DIR, requestedPath);
  if (!filePath.startsWith(DIST_DIR)) {
    // Path traversal guard — ../ escaping DIST_DIR.
    filePath = path.join(DIST_DIR, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Serving ${DIST_DIR} on port ${PORT} with Basic Auth enabled`);
});
