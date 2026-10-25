// Jules Apps — one tiny local server for Boost (the hub), SIE Study Desk and Worldbuilder.
// No dependencies; needs Node 18+. It only listens on this computer and never connects out.
//
//   /          Boost, with SIE Study and Worldbuilder as tabs
//   /sie/      SIE Study Desk  (SIE App/SIE_Study_App.html)
//   /world/    Worldbuilder    (books/worldbuilding app/public)
//   /api/…, /photos/…  Worldbuilder's own server (same data folder as before)

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { exec } = require('child_process');

const arg = name => (process.argv.find(a => a.startsWith(`--${name}=`)) || '').split('=').slice(1).join('=');
const PORT = Number(arg('port') || process.env.PORT) || 4747;
const HOST = '127.0.0.1';
const ROOT = __dirname;
const HUB_FILE = path.join(ROOT, 'boost', 'boostindex.html');
const SIE_FILE = path.join(ROOT, 'SIE App', 'SIE_Study_App.html');

// Worldbuilder's server, loaded as a module: same handlers, same data folder (or --data=…)
const world = require('./books/worldbuilding app/server.js');
const { send } = world;

function info() {
  return { app: 'jules-apps', version: 1, worldData: world.DATA, sie: fs.existsSync(SIE_FILE) };
}

function redirect(res, to) {
  res.writeHead(302, { Location: to, 'Cache-Control': 'no-store' });
  res.end();
}

async function serveHtml(res, file, inject = '') {
  let html;
  try { html = await fsp.readFile(file, 'utf8'); } catch { return send(res, 404, { error: 'Not found' }); }
  if (inject) html = html.includes('<head>') ? html.replace('<head>', () => '<head>\n    ' + inject) : inject + html;
  // no-cache (always checked) rather than no-store, so the browser can keep the page in its back/forward
  // cache: leaving Jules Apps and coming back with Back then doesn't reload the apps and lose their place
  const buf = Buffer.from(html);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Length': buf.length, 'Cache-Control': 'no-cache' });
  res.end(buf);
}

// Card terms from the SIE file's embedded data, for Boost's search. Re-read whenever the file changes.
let sieIndex = null, sieIndexStamp = 0;
async function getSieIndex() {
  let stamp;
  try { stamp = (await fsp.stat(SIE_FILE)).mtimeMs; } catch { return { cards: [] }; }
  if (sieIndex && stamp === sieIndexStamp) return sieIndex;
  try {
    const text = await fsp.readFile(SIE_FILE, 'utf8');
    const at = text.indexOf('window.SIE');
    const start = text.indexOf('{', at);
    const end = text.indexOf('</script>', start);
    const json = text.slice(start, end).trim().replace(/;\s*$/, '');
    const data = JSON.parse(json);
    const cards = (Array.isArray(data.cards) ? data.cards : [])
      .filter(c => c && c.term)
      .map(c => ({ id: c.id, term: String(c.term), chapter: c.chapter }));
    sieIndex = { cards };
  } catch (e) {
    console.error('Could not read the SIE cards for search:', e.message);
    sieIndex = { cards: [] };
  }
  sieIndexStamp = stamp;
  return sieIndex;
}

// Worldbuilder's own API routes (everything else under /api/ that isn't the hub's is a 404)
const WORLD_API = ['/api/world', '/api/photos', '/api/photos/cleanup', '/api/info'];

async function handle(req, res) {
  // Only answer to this computer's own names (stops other websites reaching in through DNS tricks)
  const host = String(req.headers.host || '').replace(/:\d+$/, '').toLowerCase();
  if (!['localhost', '127.0.0.1'].includes(host)) return send(res, 403, { error: 'Forbidden' });
  // Changes may only come from these pages, not from some other website open in the browser
  if (!['GET', 'HEAD'].includes(req.method)) {
    const origin = req.headers.origin;
    const site = req.headers['sec-fetch-site'];
    if ((origin && ![`http://localhost:${PORT}`, `http://127.0.0.1:${PORT}`].includes(origin)) || site === 'cross-site' || site === 'same-site') {
      return send(res, 403, { error: 'Forbidden' });
    }
  }
  // Browsers keep separate saved data for 127.0.0.1 and localhost, so always use localhost
  if (host === '127.0.0.1' && req.method === 'GET') return redirect(res, `http://localhost:${PORT}${req.url}`);

  const url = new URL(req.url, 'http://localhost');
  let p;
  try { p = decodeURIComponent(url.pathname); } catch { return send(res, 400, { error: 'Bad address' }); }

  if (p === '/' || p === '/index.html') {
    return serveHtml(res, HUB_FILE, `<script>window.JULES_APPS = ${JSON.stringify(info())};</script>`);
  }
  if (p === '/api/hub') return send(res, 200, info());
  if (p === '/api/sie-index') return send(res, 200, await getSieIndex());

  if (p === '/sie') return redirect(res, '/sie/' + url.search);
  if (p === '/sie/' || p === '/sie/index.html') return serveHtml(res, SIE_FILE);

  if (p === '/world') return redirect(res, '/world/' + url.search);
  if (p === '/world/' || p === '/world/index.html') return serveHtml(res, path.join(world.PUBLIC, 'index.html'));
  if (p.startsWith('/world/')) {
    req.url = (url.pathname.replace(/^\/[^/]*/, '') || '/') + url.search;   // drop the leading /world
    return world.handle(req, res);
  }
  if (WORLD_API.includes(p) || p.startsWith('/photos/')) return world.handle(req, res);
  if (p.startsWith('/api/')) return send(res, 404, { error: 'Not found' });

  if (p === '/favicon.ico') { res.writeHead(204); return res.end(); }
  return send(res, 404, { error: 'Not found' });
}

const server = http.createServer((req, res) => {
  handle(req, res).catch(err => {
    console.error(err);
    if (!res.headersSent) send(res, err.status || 500, { error: err.message });
  });
});

function openBrowser(url) {
  if (process.env.NO_BROWSER || process.argv.includes('--no-browser')) return;
  const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
  exec(cmd);
}

// Is whatever already holds the port Jules Apps itself?
function probe() {
  return new Promise(resolve => {
    const r = http.get({ host: HOST, port: PORT, path: '/api/hub', headers: { Host: 'localhost' }, timeout: 1500 }, res => {
      let body = '';
      res.on('data', c => body += c);
      res.on('end', () => { try { resolve(JSON.parse(body)); } catch { resolve(null); } });
    });
    r.on('timeout', () => { r.destroy(); resolve(null); });
    r.on('error', () => resolve(null));
  });
}

// --open=#world opens a tab straight away (Start Worldbuilder.bat uses it)
const open = arg('open');
const appUrl = `http://localhost:${PORT}/${/^[#/?]/.test(open) ? open.replace(/^\//, '') : ''}`;
server.on('error', async e => {
  if (e.code !== 'EADDRINUSE') throw e;
  const other = await probe();
  if (other && other.app === 'jules-apps') {
    console.log(`Jules Apps already seems to be running — opening ${appUrl}`);
    openBrowser(appUrl);
    setTimeout(() => process.exit(0), 500);
  } else {
    console.log(`\n  Something else is using port ${PORT} — most likely the old Worldbuilder window.`);
    console.log('  Close that window, then start Jules Apps again.\n');
    process.exitCode = 1;
  }
});
server.listen(PORT, HOST, () => {
  console.log(`\n  Jules Apps is running at http://localhost:${PORT}`);
  console.log(`  Boost, SIE Study and Worldbuilder are all in there.`);
  console.log(`  Your world is saved in ${world.DATA}`);
  console.log('  Close this window to stop.\n');
  openBrowser(appUrl);
});
