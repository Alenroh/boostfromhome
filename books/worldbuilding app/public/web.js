'use strict';
/* ==========================================================================
   Relationship web — a draggable force-directed graph of characters.
   ========================================================================== */

const WEB = { types: new Set(REL_TYPES.map(t => t.k)), homes: false, view: { x: 0, y: 0, k: 1 } };
const SVGNS = 'http://www.w3.org/2000/svg';
function s(tag, attrs = {}, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) el.setAttribute(k, v);
  for (const k of kids.flat()) if (k != null) el.append(k instanceof Node ? k : document.createTextNode(k));
  return el;
}

VIEWS.web = function (q) {
  const focusId = q.get('focus');
  const box = h('div', { class: 'web-box card' });
  const info = h('div', { class: 'web-info' });
  const root = h('div', { class: 'page wide' },
    h('div', { class: 'page-head' }, h('div', null, h('h1', null, 'Relationship web'),
      h('p', { class: 'muted' }, 'Drag people around — the layout is remembered. Click someone to highlight their connections; double-click to open them. Scroll to zoom, drag the background to pan.'))),
    h('div', { class: 'toolbar' },
      h('div', { class: 'chips' }, REL_TYPES.map(t => h('button', {
        class: 'chip legend-chip' + (WEB.types.has(t.k) ? ' on' : ''), style: { '--rel': t.c },
        onclick: ev => { WEB.types.has(t.k) ? WEB.types.delete(t.k) : WEB.types.add(t.k); ev.currentTarget.classList.toggle('on'); build(); },
      }, h('i'), t.n))),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', checked: WEB.homes, onchange: ev => { WEB.homes = ev.target.checked; build(); } }), ' Show homes'),
      btn('Fit', () => fit()), btn('Re-arrange', () => { W.layout = {}; save(); build(true); })),
    box, info);

  let sim = null;
  const build = (reset) => { sim?.stop(); fill(box); sim = drawWeb(box, info, focusId, reset); };
  const fit = () => sim?.fit();
  if (!W.characters.length) {
    box.append(emptyState('⚭', 'No one to connect yet', 'Add characters and link them on their pages under “Relationships”.', btn('＋ New character', createCharacter, 'primary')));
  } else requestAnimationFrame(() => build());
  return root;
};

function drawWeb(box, info, focusId, reset) {
  const Wd = box.clientWidth || 900, Ht = Math.max(460, window.innerHeight - 260);
  const svg = s('svg', { class: 'web', width: '100%', height: Ht, viewBox: `0 0 ${Wd} ${Ht}` });
  const defs = s('defs', {}, s('clipPath', { id: 'clipC', clipPathUnits: 'objectBoundingBox' }, s('circle', { cx: .5, cy: .5, r: .5 })),
    s('clipPath', { id: 'clipR', clipPathUnits: 'objectBoundingBox' }, s('rect', { x: 0, y: 0, width: 1, height: 1, rx: .22 })));
  const world = s('g');
  const gEdges = s('g', { class: 'edges' }), gNodes = s('g', { class: 'nodes' });
  world.append(gEdges, gNodes); svg.append(defs, world); box.append(svg);

  // --- nodes & links
  const nodes = [], byId = new Map();
  const place = (id, key) => {
    const saved = !reset && W.layout[key];
    const n = { id, key, x: saved ? saved[0] : (Math.random() - .5) * 400, y: saved ? saved[1] : (Math.random() - .5) * 300, vx: 0, vy: 0, saved: !!saved };
    nodes.push(n); byId.set(key, n); return n;
  };
  for (const c of W.characters) Object.assign(place(c.id, c.id), { c, r: 26 });
  const links = W.relationships.filter(r => WEB.types.has(r.type) && byId.has(r.a) && byId.has(r.b))
    .map(r => ({ r, s: byId.get(r.a), t: byId.get(r.b), len: 150, color: relType(r.type).c }));
  if (WEB.homes) {
    for (const c of W.characters) {
      if (!locById(c.homeId)) continue;
      const key = 'L' + c.homeId;
      if (!byId.has(key)) Object.assign(place(c.homeId, key), { l: locById(c.homeId), r: 20 });
      links.push({ home: true, s: byId.get(c.id), t: byId.get(key), len: 90, color: 'var(--muted)' });
    }
  }
  // Multiple links between the same pair get curved apart.
  const pairCount = {};
  for (const L of links) { const k = [L.s.key, L.t.key].sort().join('|'); L.bend = (pairCount[k] = (pairCount[k] || 0) + 1) - 1; }
  const degree = new Map(nodes.map(n => [n.key, 0]));
  links.forEach(L => { degree.set(L.s.key, degree.get(L.s.key) + 1); degree.set(L.t.key, degree.get(L.t.key) + 1); });

  // --- draw
  for (const L of links) {
    L.el = s('path', { class: 'edge' + (L.home ? ' home' : ''), stroke: L.color });
    const label = L.home ? `${L.s.c.name} lives in ${L.t.l.name}` :
      `${relType(L.r.type).n}: ${L.s.c.name} & ${L.t.c.name}` +
      (L.r.roles?.[L.t.id] ? `\n${L.t.c.name} is ${L.s.c.name}’s ${L.r.roles[L.t.id]}` : '') +
      (L.r.roles?.[L.s.id] ? `\n${L.s.c.name} is ${L.t.c.name}’s ${L.r.roles[L.s.id]}` : '') + (L.r.note ? `\n${L.r.note}` : '');
    L.el.append(s('title', {}, label));
    gEdges.append(L.el);
  }
  for (const n of nodes) {
    const e = n.c || n.l, r = n.r, p = e.photos[0];
    const shape = n.c ? s('circle', { r, class: 'node-bg', style: `--h:${hue(e.id)}` }) : s('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: r * .44, class: 'node-bg', style: `--h:${hue(e.id)}` });
    n.el = s('g', { class: 'node' + (n.l ? ' place' : '') },
      shape,
      p ? s('image', { href: photoSrc(p), x: -r, y: -r, width: 2 * r, height: 2 * r, 'clip-path': `url(#${n.c ? 'clipC' : 'clipR'})`, preserveAspectRatio: 'xMidYMid slice' })
        : s('text', { class: 'node-ini', 'text-anchor': 'middle', dy: '.35em' }, initials(e.name)),
      n.c ? s('circle', { r, class: 'node-ring' }) : s('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, rx: r * .44, class: 'node-ring' }),
      s('text', { class: 'node-label', 'text-anchor': 'middle', y: r + 15 }, e.name));
    gNodes.append(n.el);
  }

  // --- view transform (pan/zoom)
  const V = WEB.view;
  const applyView = () => world.setAttribute('transform', `translate(${Wd / 2 + V.x},${Ht / 2 + V.y}) scale(${V.k})`);
  applyView();
  const toWorld = ev => {
    const rc = svg.getBoundingClientRect(), sc = Wd / rc.width;
    return [((ev.clientX - rc.left) * sc - Wd / 2 - V.x) / V.k, ((ev.clientY - rc.top) * sc - Ht / 2 - V.y) / V.k];
  };
  svg.addEventListener('wheel', ev => {
    ev.preventDefault();
    const [wx, wy] = toWorld(ev);
    const k = Math.min(3, Math.max(0.25, V.k * (ev.deltaY < 0 ? 1.12 : 1 / 1.12)));
    V.x -= wx * (k - V.k); V.y -= wy * (k - V.k); V.k = k; applyView();
  }, { passive: false });

  // --- highlight / info
  let selected = null;
  const select = n => {
    selected = n;
    const near = new Set(n ? [n.key] : []);
    if (n) links.forEach(L => { if (L.s === n) near.add(L.t.key); if (L.t === n) near.add(L.s.key); });
    nodes.forEach(m => m.el.classList.toggle('dim', !!n && !near.has(m.key)));
    links.forEach(L => L.el.classList.toggle('dim', !!n && L.s !== n && L.t !== n));
    nodes.forEach(m => m.el.classList.toggle('sel', m === n));
    if (!n) { fill(info); return; }
    if (n.l) { fill(info, h('div', { class: 'card web-card' }, avatar(n.l, 48, true), h('div', null, h('b', null, n.l.name), h('div', { class: 'muted' }, n.l.type || 'Location')), h('a', { class: 'btn mini', href: '#/l/' + n.l.id }, 'Open →'))); return; }
    const c = n.c;
    const mine = links.filter(L => !L.home && (L.s === n || L.t === n));
    fill(info, h('div', { class: 'card web-card' },
      avatar(c, 56),
      h('div', { class: 'grow' }, h('b', null, c.name), h('div', { class: 'muted' }, [c.occupation, locName(c.homeId)].filter(Boolean).join(' · ')),
        mine.length ? h('ul', { class: 'plain web-rels' }, mine.map(L => {
          const o = L.s === n ? L.t.c : L.s.c;
          const role = L.r.roles?.[o.id];
          return h('li', null, h('i', { style: { background: L.color } }), h('a', { href: '#/c/' + o.id }, o.name), ' — ', role || relType(L.r.type).n.toLowerCase(), L.r.note ? h('span', { class: 'muted' }, ' · ' + firstLine(L.r.note, 60)) : null);
        })) : h('div', { class: 'muted' }, 'No connections shown.')),
      h('a', { class: 'btn mini', href: '#/c/' + c.id }, 'Open →')));
  };

  // --- dragging nodes and panning
  let drag = null;
  svg.addEventListener('pointerdown', ev => {
    const g = ev.target.closest('.node');
    const n = g && nodes.find(m => m.el === g);
    svg.setPointerCapture(ev.pointerId);
    const [wx, wy] = toWorld(ev);
    drag = n ? { n, dx: n.x - wx, dy: n.y - wy, moved: false } : { pan: true, sx: ev.clientX, sy: ev.clientY, vx: V.x, vy: V.y, moved: false };
    if (n) { n.fixed = true; kick(0.3); }
  });
  svg.addEventListener('pointermove', ev => {
    if (!drag) return;
    if (drag.pan) {
      const sc = Wd / svg.getBoundingClientRect().width;
      V.x = drag.vx + (ev.clientX - drag.sx) * sc; V.y = drag.vy + (ev.clientY - drag.sy) * sc; applyView();
      if (Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) > 3) drag.moved = true;
    } else {
      const [wx, wy] = toWorld(ev);
      drag.n.x = wx + drag.dx; drag.n.y = wy + drag.dy; drag.n.vx = drag.n.vy = 0; drag.moved = true; kick(0.3);
    }
  });
  const endDrag = () => {
    if (!drag) return;
    if (drag.n) {
      drag.n.fixed = false;
      if (!drag.moved) select(selected === drag.n ? null : drag.n);
      persist();
    } else if (!drag.moved) select(null);
    drag = null;
  };
  svg.addEventListener('pointerup', endDrag);
  svg.addEventListener('pointercancel', endDrag);
  svg.addEventListener('dblclick', ev => {
    const g = ev.target.closest('.node'); const n = g && nodes.find(m => m.el === g);
    if (n) location.hash = n.c ? '#/c/' + n.c.id : '#/l/' + n.l.id;
  });

  const persist = () => { for (const n of nodes) W.layout[n.key] = [Math.round(n.x), Math.round(n.y)]; save(); };

  // --- simulation
  let alpha = nodes.every(n => n.saved) ? 0.02 : 1, raf = 0, stopped = false;
  const kick = a => { alpha = Math.max(alpha, a); if (!raf) raf = requestAnimationFrame(tick); };
  function step() {
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = Math.random() - .5; dy = Math.random() - .5; d2 = 1; }
        const d = Math.sqrt(d2), minD = a.r + b.r + 34;
        const f = (500 / d + (d < minD ? (minD - d) * 0.5 : 0)) * alpha;
        a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f;
      }
    }
    for (const L of links) {
      const dx = L.t.x - L.s.x, dy = L.t.y - L.s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - L.len) * 0.03 * alpha / Math.max(1, Math.min(degree.get(L.s.key), degree.get(L.t.key)) ** 0.5);
      L.s.vx += dx / d * f; L.s.vy += dy / d * f; L.t.vx -= dx / d * f; L.t.vy -= dy / d * f;
    }
    for (const n of nodes) {
      n.vx -= n.x * 0.02 * alpha; n.vy -= n.y * 0.02 * alpha;
      if (n.fixed) { n.vx = n.vy = 0; continue; }
      n.vx *= 0.6; n.vy *= 0.6; n.x += n.vx; n.y += n.vy;
    }
  }
  function tick() {
    raf = 0;
    if (stopped || !svg.isConnected) return;
    step();
    paint();
    alpha *= 0.985;
    if (alpha > 0.01 || drag) raf = requestAnimationFrame(tick);
    else if (!nodes.every(n => n.saved)) { nodes.forEach(n => n.saved = true); persist(); }
  }
  function paint() {
    for (const n of nodes) n.el.setAttribute('transform', `translate(${n.x.toFixed(1)},${n.y.toFixed(1)})`);
    for (const L of links) {
      const { x: x1, y: y1 } = L.s, { x: x2, y: y2 } = L.t;
      if (!L.bend) L.el.setAttribute('d', `M${x1},${y1}L${x2},${y2}`);
      else {
        const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1, d = Math.hypot(dx, dy) || 1;
        const off = 22 * Math.ceil(L.bend / 2) * (L.bend % 2 ? 1 : -1);
        L.el.setAttribute('d', `M${x1},${y1}Q${mx - dy / d * off * 2},${my + dx / d * off * 2} ${x2},${y2}`);
      }
    }
  }
  const fit = () => {
    if (!nodes.length) return;
    const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 70;
    V.k = Math.min(1.4, Math.max(0.3, Math.min(Wd / (maxX - minX), Ht / (maxY - minY))));
    V.x = -(minX + maxX) / 2 * V.k; V.y = -(minY + maxY) / 2 * V.k; applyView();
  };
  // Settle new layouts up-front so the first frame already looks tidy.
  if (!nodes.every(n => n.saved)) {
    for (let i = 0; i < 400; i++) { step(); alpha = Math.max(0.02, alpha * 0.985); }
    nodes.forEach(n => n.saved = true); persist(); alpha = 0.02;
  }
  paint(); fit();
  kick(alpha);
  const f = focusId && byId.get(focusId);
  if (f) select(f);
  return { stop: () => { stopped = true; cancelAnimationFrame(raf); }, fit };
}
