// Worldbuilder — a tiny local server. No dependencies; needs Node 18+.
// Stores everything in ./data (world.json, photos/, backups/).

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { exec } = require('child_process');

const arg = name => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=');
const PORT = Number(arg('port') || process.env.PORT) || 4747;
const HOST = '127.0.0.1';
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = arg('data') ? path.resolve(arg('data')) : path.join(ROOT, 'data');
const PHOTOS = path.join(DATA, 'photos');
const TRASH = path.join(PHOTOS, '.trash');
const BACKUPS = path.join(DATA, 'backups');
const WORLD = path.join(DATA, 'world.json');
const BACKUP_EVERY_MS = 10 * 60 * 1000;
const BACKUPS_KEPT = 40;
const MAX_PHOTO = 30 * 1024 * 1024;

for (const d of [DATA, PHOTOS, BACKUPS]) fs.mkdirSync(d, { recursive: true });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon',
};
const IMAGE_EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/avif': 'avif' };

function send(res, code, body, type = 'application/json; charset=utf-8') {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(typeof body === 'string' ? body : JSON.stringify(body));
  res.writeHead(code, { 'Content-Type': type, 'Content-Length': buf.length, 'Cache-Control': 'no-store' });
  res.end(buf);
}

function readBody(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(Object.assign(new Error('Too large'), { status: 413 })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// OneDrive sometimes holds a file lock for a moment; retry a few times.
async function writeFileSafe(file, data) {
  const tmp = file + '.tmp';
  for (let i = 0; i < 5; i++) {
    try {
      await fsp.writeFile(tmp, data);
      await fsp.rename(tmp, file);
      return;
    } catch (e) {
      if (i === 4) { await fsp.writeFile(file, data); return; }
      await new Promise(r => setTimeout(r, 120 * (i + 1)));
    }
  }
}

let lastBackup = 0;
async function maybeBackup() {
  if (Date.now() - lastBackup < BACKUP_EVERY_MS || !fs.existsSync(WORLD)) return;
  lastBackup = Date.now();
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
  await fsp.copyFile(WORLD, path.join(BACKUPS, `world-${stamp}.json`));
  const files = (await fsp.readdir(BACKUPS)).filter(f => f.startsWith('world-')).sort();
  for (const f of files.slice(0, Math.max(0, files.length - BACKUPS_KEPT))) await fsp.unlink(path.join(BACKUPS, f)).catch(() => {});
}

async function savePhoto(buf, ext) {
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(4).toString('hex')}.${ext}`;
  await fsp.writeFile(path.join(PHOTOS, name), buf);
  return name;
}

function extFromType(type) { return IMAGE_EXT[(type || '').split(';')[0].trim().toLowerCase()]; }

async function serveFile(res, file) {
  try {
    const data = await fsp.readFile(file);
    send(res, 200, data, MIME[path.extname(file).toLowerCase()] || 'application/octet-stream');
  } catch { send(res, 404, { error: 'Not found' }); }
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = decodeURIComponent(url.pathname);

  if (p === '/api/world') {
    if (req.method === 'GET') {
      if (!fs.existsSync(WORLD)) return send(res, 200, {});
      return serveFile(res, WORLD);
    }
    if (req.method === 'PUT' || req.method === 'POST') {
      const body = await readBody(req, 100 * 1024 * 1024);
      let parsed;
      try { parsed = JSON.parse(body.toString('utf8')); } catch { return send(res, 400, { error: 'Invalid JSON' }); }
      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.characters)) return send(res, 400, { error: 'Not a world' });
      await maybeBackup();
      await writeFileSafe(WORLD, JSON.stringify(parsed, null, 1));
      return send(res, 200, { ok: true, savedAt: Date.now() });
    }
  }

  // Upload raw image bytes. Content-Type header tells us the format.
  if (p === '/api/photos' && req.method === 'POST') {
    const ext = extFromType(req.headers['content-type']);
    if (!ext) return send(res, 415, { error: 'Unsupported image type' });
    const buf = await readBody(req, MAX_PHOTO);
    return send(res, 200, { file: await savePhoto(buf, ext) });
  }

  // Move photos no longer referenced by the world into photos/.trash
  if (p === '/api/photos/cleanup' && req.method === 'POST') {
    const text = fs.existsSync(WORLD) ? await fsp.readFile(WORLD, 'utf8') : '';
    await fsp.mkdir(TRASH, { recursive: true });
    let moved = 0;
    for (const f of await fsp.readdir(PHOTOS)) {
      if (f.startsWith('.')) continue;
      if (!text.includes(f)) { await fsp.rename(path.join(PHOTOS, f), path.join(TRASH, f)); moved++; }
    }
    return send(res, 200, { moved });
  }

  if (p === '/api/info') return send(res, 200, { dataDir: DATA });

  if (p.startsWith('/photos/')) return serveFile(res, path.join(PHOTOS, path.basename(p)));

  // Static app files
  const rel = p === '/' ? 'index.html' : path.normalize(p).replace(/^([/\\])+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC)) return send(res, 403, { error: 'Forbidden' });
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return serveFile(res, file);
  return serveFile(res, path.join(PUBLIC, 'index.html'));
}

function openBrowser(url) {
  if (process.env.NO_BROWSER || process.argv.includes('--no-browser')) return;
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd);
}

// Jules Apps (../../server.js) loads this file and serves Worldbuilder through handle().
module.exports = { handle, send, DATA, PUBLIC };

// Started on its own (Start Worldbuilder.bat): run the standalone server as before.
if (require.main === module) {
  const server = http.createServer((req, res) => {
    handle(req, res).catch(err => {
      console.error(err);
      if (!res.headersSent) send(res, err.status || 500, { error: err.message });
    });
  });

  const appUrl = `http://localhost:${PORT}`;
  server.on('error', e => {
    if (e.code === 'EADDRINUSE') {
      console.log(`Worldbuilder already seems to be running — opening ${appUrl}`);
      openBrowser(appUrl);
      setTimeout(() => process.exit(0), 500);
    } else { throw e; }
  });
  server.listen(PORT, HOST, () => {
    console.log(`\n  Worldbuilder is running at ${appUrl}`);
    console.log(`  Your world is saved in ${DATA}`);
    console.log('  Close this window to stop.\n');
    openBrowser(appUrl);
  });
}
