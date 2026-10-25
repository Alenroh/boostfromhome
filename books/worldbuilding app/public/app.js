'use strict';
/* ==========================================================================
   Worldbuilder — an encyclopedia of your own story, styled after Wikipedia.
   Fully offline: everything is stored by the local server in ./data.
   web.js adds the relationship web view.
   ========================================================================== */

const MONTHS = [['mar', 'March'], ['apr', 'April'], ['may', 'May'], ['jun', 'June'], ['jul', 'July'], ['aug', 'August'],
  ['sep', 'September'], ['oct', 'October'], ['nov', 'November'], ['dec', 'December'], ['jan', 'January'], ['feb', 'February']]
  .map(([k, n]) => ({ k, n, s: n.slice(0, 3) }));

const REL_TYPES = [
  { k: 'family', n: 'Family', c: '#b0672a' },
  { k: 'romance', n: 'Romance', c: '#c2336b' },
  { k: 'friend', n: 'Friend', c: '#3a8a45' },
  { k: 'ally', n: 'Ally', c: '#1f8a94' },
  { k: 'mentor', n: 'Mentor / student', c: '#7b4bb0' },
  { k: 'clinical', n: 'Clinical', c: '#2f6f9f' },
  { k: 'work', n: 'Work', c: '#56707e' },
  { k: 'rival', n: 'Rival', c: '#e0851d' },
  { k: 'enemy', n: 'Enemy', c: '#c83a32' },
  { k: 'acquaint', n: 'Acquaintance', c: '#999189' },
  { k: 'other', n: 'Other', c: '#7a5c48' },
];
const REL_PLURAL = { clinical: 'doctor and patient', family: 'family', romance: 'lovers', friend: 'friends', ally: 'allies', mentor: 'mentor and student', work: 'colleagues', rival: 'rivals', enemy: 'enemies', acquaint: 'acquainted', other: 'connected' };
const relType = k => REL_TYPES.find(t => t.k === k) || REL_TYPES[REL_TYPES.length - 1];

const STATUSES = ['', 'Alive', 'Deceased', 'Missing', 'Unknown', 'Undead', 'Legendary'];
const LOC_TYPES = ['Continent', 'Country', 'Region', 'City', 'Town', 'Village', 'District', 'Street', 'Building', 'House',
  'Inn / tavern', 'Shop', 'Castle / fortress', 'Temple', 'School', 'Room', 'Landmark', 'Forest', 'Mountain', 'River / lake',
  'Sea / coast', 'Island', 'Road / route', 'Ruin', 'Other realm'];

// [key, article heading, edit label, big box?]
/* Personal details: grouped identifying information for characters.
   [key, label, placeholder, suggestions?, showInInfobox?] — values live in c.info[key] */
const PERSONAL = [
  { g: 'identity', n: 'Identity', rows: [
    ['legalName', 'Full legal name', 'As on a birth certificate', null, true],
    ['birthName', 'Birth / maiden name', ''],
    ['title', 'Title or honorific', 'Dr., Father, Captain…'],
    ['gender', 'Gender', '', ['Man', 'Woman', 'Non-binary', 'Genderfluid', 'Agender', 'Unknown'], true],
    ['sexAtBirth', 'Sex assigned at birth', '', ['Male', 'Female', 'Intersex']],
    ['orientation', 'Sexual orientation', '', ['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual', 'Asexual', 'Queer', 'Unknown']],
    ['dob', 'Date of birth', 'e.g. 14 May 1982'],
    ['zodiac', 'Star sign', '', ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']],
    ['nationality', 'Nationality / citizenship', 'American', null, true],
    ['race', 'Race', '', null, true],
    ['ethnicity', 'Ethnicity / heritage', 'Italian-American', null, true],
    ['languages', 'Languages', 'English (native), some Italian'],
    ['religion', 'Religion', 'Lapsed Catholic', null, true],
    ['politics', 'Politics', ''],
  ] },
  { g: 'physical', n: 'Physical description', rows: [
    ['height', 'Height', '5′11″ or 180 cm — both are shown', null, true],
    ['weight', 'Weight', '185 lb or 84 kg', null, true],
    ['build', 'Build', '', ['Slight', 'Slim', 'Lean', 'Athletic', 'Average', 'Stocky', 'Muscular', 'Heavyset', 'Going soft'], true],
    ['hairColor', 'Hair colour', '', ['Black', 'Dark brown', 'Brown', 'Light brown', 'Auburn', 'Red', 'Strawberry blonde', 'Blonde', 'Platinum', 'Grey', 'Salt and pepper', 'White', 'Bald', 'Dyed'], true],
    ['hairStyle', 'Hair style', 'Mullet, same bun every morning…'],
    ['eyeColor', 'Eye colour', '', ['Brown', 'Dark brown', 'Hazel', 'Amber', 'Green', 'Blue', 'Grey', 'Heterochromia'], true],
    ['skin', 'Skin tone / complexion', 'Olive, freckled…'],
    ['facialHair', 'Facial hair', '', ['Clean-shaven', 'Stubble', 'Beard', 'Goatee', 'Moustache']],
    ['vision', 'Vision', '', ['Perfect', 'Glasses', 'Reading glasses', 'Contacts', 'Blind in one eye']],
    ['marks', 'Scars / birthmarks', ''],
    ['tattoos', 'Tattoos', ''],
    ['piercings', 'Piercings', ''],
    ['handedness', 'Handedness', '', ['Right-handed', 'Left-handed', 'Ambidextrous']],
    ['bloodType', 'Blood type', '', ['O+', 'O−', 'A+', 'A−', 'B+', 'B−', 'AB+', 'AB−']],
    ['voiceSound', 'Voice', 'Low, gravelly, Pittsburgh vowels…'],
    ['gait', 'Posture / walk', ''],
    ['clothing', 'Usual clothing', ''],
    ['scent', 'Smell / scent', 'Lavender candle, cigarette smoke…'],
    ['resemblance', 'Looks like (casting)', 'Adrien Brody'],
  ] },
  { g: 'documents', n: 'Documents & ID numbers', rows: [
    ['dlNumber', 'Driver’s licence no.', ''],
    ['dlState', 'Licence state / country', 'Pennsylvania'],
    ['dlClass', 'Licence class', '', ['C (standard)', 'M (motorcycle)', 'CDL A', 'CDL B', 'Learner’s permit', 'None']],
    ['dlExpires', 'Licence expires', ''],
    ['dlRestrictions', 'Licence restrictions', 'Corrective lenses'],
    ['stateId', 'State ID no.', ''],
    ['passport', 'Passport no.', ''],
    ['ssn', 'Social Security no.', 'Fictional — e.g. 000-00-0000'],
    ['profLicense', 'Professional licence', 'Medical licence MD-000000'],
    ['badge', 'Badge / employee no.', ''],
    ['inmateNo', 'Inmate / DOC no.', ''],
    ['caseNo', 'Case / docket no.', ''],
    ['studentId', 'Student ID', ''],
    ['firearms', 'Firearms licence / carry permit', ''],
    ['otherIds', 'Other ID', 'Library card, union card, parish register…'],
  ] },
  { g: 'vehicle', n: 'Vehicle', rows: [
    ['vehicle', 'Vehicle', 'Ford F-150', null, true],
    ['vehicleYear', 'Year', '2021'],
    ['vehicleColor', 'Colour', ''],
    ['plate', 'Licence plate', ''],
    ['plateState', 'Plate state', ''],
    ['vin', 'VIN', ''],
    ['vehicleNotes', 'Condition / features', 'Working, strong, neat, useful'],
    ['otherVehicles', 'Other vehicles', ''],
  ] },
  { g: 'contact', n: 'Address & contact', rows: [
    ['address', 'Home address', ''],
    ['mailing', 'Mailing address', ''],
    ['phone', 'Mobile phone', ''],
    ['workPhone', 'Work phone', ''],
    ['email', 'Email', ''],
    ['social', 'Social media', ''],
    ['phoneModel', 'Phone / devices', 'iPhone, Apple Watch'],
    ['emergency', 'Emergency contact', ''],
  ] },
  { g: 'background', n: 'Background', rows: [
    ['education', 'Education', '', null, true],
    ['employer', 'Employer', ''],
    ['pastJobs', 'Previous jobs', ''],
    ['income', 'Income / class', ''],
    ['military', 'Military service', ''],
    ['marital', 'Marital status', '', ['Single', 'Dating', 'Engaged', 'Married', 'Partnered', 'Separated', 'Divorced', 'Widowed'], true],
    ['children', 'Children', ''],
    ['criminal', 'Criminal record', ''],
    ['pets', 'Pets', ''],
  ] },
  { g: 'health', n: 'Health', rows: [
    ['conditions', 'Medical conditions', ''],
    ['medications', 'Medications', ''],
    ['allergies', 'Allergies', ''],
    ['disabilities', 'Disabilities', ''],
    ['mentalHealth', 'Mental health', ''],
    ['substances', 'Alcohol / smoking / drugs', ''],
    ['doctor', 'Doctor / therapist', ''],
    ['sleep', 'Sleep', ''],
  ] },
  { g: 'habits', n: 'Habits & tastes', rows: [
    ['hobbies', 'Hobbies', ''],
    ['habits', 'Habits & tics', ''],
    ['food', 'Favourite food & drink', ''],
    ['music', 'Music / TV / books', ''],
    ['sports', 'Sports & teams', ''],
    ['routine', 'Daily routine', ''],
    ['phrases', 'Catchphrases', ''],
    ['fears', 'Fears / phobias', ''],
    ['personalityType', 'Personality type', 'MBTI, Enneagram…'],
  ] },
];
/* Show heights and weights in both systems: "5′11″ (180 cm)" */
function withUnits(key, v) {
  if (!v) return v;
  const t = v.trim();
  if (key === 'height') {
    let m = /^(\d+(?:\.\d+)?)\s*cm$/i.exec(t);
    if (m) { const inch = Math.round(m[1] / 2.54); return `${Math.floor(inch / 12)}′${inch % 12}″ (${Math.round(m[1])} cm)`; }
    m = /^(\d+)\s*(?:'|′|ft|feet)\s*(\d+(?:\.\d+)?)?\s*(?:"|″|in|inches)?$/i.exec(t);
    if (m) { const inch = +m[1] * 12 + (+m[2] || 0); return `${m[1]}′${m[2] || 0}″ (${Math.round(inch * 2.54)} cm)`; }
  }
  if (key === 'weight') {
    let m = /^(\d+(?:\.\d+)?)\s*(?:lb|lbs|pounds)$/i.exec(t);
    if (m) return `${Math.round(m[1])} lb (${Math.round(m[1] * 0.4536)} kg)`;
    m = /^(\d+(?:\.\d+)?)\s*(?:kg|kilos?)$/i.exec(t);
    if (m) return `${Math.round(m[1] / 0.4536)} lb (${Math.round(m[1])} kg)`;
  }
  return v;
}
const infoVal = (c, k) => ((c.info || {})[k] || '').trim();
const CHAR_TEXT = [
  ['backstory', 'Background', 'Background & backstory', true], ['appearance', 'Appearance', 'Appearance'],
  ['personality', 'Personality', 'Personality'], ['voice', 'Voice and mannerisms', 'Voice & mannerisms'],
  ['wants', 'Motivations', 'Wants & fears'], ['secrets', 'Secrets', 'Secrets'], ['notes', 'Notes', 'Notes', true],
];
const LOC_TEXT = [
  ['description', 'Description', 'Description', true], ['geography', 'Geography and climate', 'Geography & climate'],
  ['culture', 'People and culture', 'People & culture'], ['sights', 'Atmosphere', 'Sights, sounds & smells'],
  ['history', 'History', 'History', true], ['secrets', 'Secrets', 'Secrets'], ['notes', 'Notes', 'Notes', true],
];

let W = null;                  // the world
const VIEWS = {};              // extra views registered by other scripts
const S = { dirty: false, saving: false, again: false, timer: null, focusName: false };

/* ---------- tiny DOM helper ---------- */
function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') {
      for (const [sk, sv] of Object.entries(v)) sk.startsWith('--') ? el.style.setProperty(sk, sv) : (el.style[sk] = sv);
    } else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (['value', 'checked', 'selected', 'disabled', 'open', 'multiple'].includes(k)) el[k] = v;
    else if (k === 'dataset') Object.assign(el.dataset, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  append(el, kids);
  return el;
}
function append(el, kids) {
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k instanceof Node ? k : String(k));
  return el;
}
/* replaceChildren that skips null/false and flattens arrays */
function fill(el, ...kids) { el.replaceChildren(); return append(el, kids); }
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
/* put a separator between nodes: a, b and c */
function joinNodes(items, sep = ', ') { return items.flatMap((x, i) => i ? [sep instanceof Node ? sep.cloneNode(true) : sep, x] : [x]); }

/* ---------- ids, lookups ---------- */
const uid = () => Date.now().toString(36).slice(-5) + Math.random().toString(36).slice(2, 7);
const charById = id => W.characters.find(c => c.id === id);
const locById = id => W.locations.find(l => l.id === id);
const byName = (a, b) => (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' });
function hue(id) { let x = 7; for (const ch of String(id)) x = (x * 31 + ch.charCodeAt(0)) >>> 0; return x % 360; }
function initials(name) { return (name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') || '?'; }
const photoSrc = (p, big) => '/photos/' + encodeURIComponent(big ? p.file : (p.thumb || p.file));
const locName = id => locById(id)?.name || '';
function touch(e) { if (e && e.id) e.updated = Date.now(); }
function plural(n, one, many) { return `${n} ${n === 1 ? one : (many || one + 's')}`; }
function firstLine(s, n = 70) { const t = (s || '').trim().split('\n')[0]; return t.length > n ? t.slice(0, n - 1) + '…' : t; }
function stripWiki(s) { return (s || '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2').replace(/\[\[([^\]]+)\]\]/g, '$1').replace(/'{2,3}/g, ''); }
function ago(t) {
  if (!t) return '';
  const s = (Date.now() - t) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + ' min ago';
  if (s < 86400) return Math.floor(s / 3600) + ' h ago';
  if (s < 86400 * 30) return Math.floor(s / 86400) + ' d ago';
  return new Date(t).toLocaleDateString();
}
const kindOf = e => W.characters.includes(e) ? 'c' : W.locations.includes(e) ? 'l' : 'a';
const allPages = () => [...W.characters, ...W.locations, ...W.articles];
const artById = id => W.articles.find(a => a.id === id);
const byKind = (k, id) => k === 'c' ? charById(id) : k === 'l' ? locById(id) : k === 'a' ? artById(id) : null;
/* "March 2030" when the world has a starting year set */
function monthLabel(m) {
  const y = parseInt(W.startYear, 10);
  return y ? `${m.n} ${y + (MONTHS.indexOf(m) >= 10 ? 1 : 0)}` : m.n;
}
const pageHref = (e, mode) => `#/${kindOf(e)}/${e.id}${mode ? '/' + mode : ''}`;
const entityLink = (e, label) => h('a', { href: pageHref(e), title: e.name }, label || e.name || 'Untitled');

/* ---------- world data ---------- */
function emptyWorld() {
  return { version: 3, name: 'My World', characters: [], locations: [], articles: [], relationships: [], layout: {}, created: Date.now() };
}
function normExtras(e) { e.facts ||= []; e.sections ||= []; e.places ||= []; return e; }
function normChar(c) {
  normExtras(c);
  if (!c.info || typeof c.info !== 'object') c.info = {};
  c.photos ||= []; c.tags ||= []; c.frequents ||= []; c.months ||= {};
  for (const m of MONTHS) {
    const e = c.months[m.k] ||= {};
    e.base ??= ''; e.visits ||= []; e.events ??= ''; e.notes ??= '';
  }
  return c;
}
function normLoc(l) { normExtras(l); l.photos ||= []; l.tags ||= []; return l; }
function normArticle(a) { normExtras(a); a.photos ||= []; a.tags ||= []; return a; }
function normalize(w) {
  w = Object.assign(emptyWorld(), w || {});
  for (const k of ['characters', 'locations', 'articles', 'relationships']) if (!Array.isArray(w[k])) w[k] = [];
  if (!w.layout || typeof w.layout !== 'object') w.layout = {};
  w.characters.forEach(normChar); w.locations.forEach(normLoc); w.articles.forEach(normArticle);
  w.relationships.forEach(r => { r.roles ||= {}; });
  return w;
}
function newCharacter(name, extra = {}) {
  const c = normChar({ id: uid(), name: name || 'New character', created: Date.now(), updated: Date.now(), ...extra });
  W.characters.push(c); save(); return c;
}
function newLocation(name, extra = {}) {
  const l = normLoc({ id: uid(), name: name || 'New place', type: '', parentId: '', created: Date.now(), updated: Date.now(), ...extra });
  W.locations.push(l); save(); return l;
}
function newArticle(name, extra = {}) {
  const a = normArticle({ id: uid(), name: name || 'New article', created: Date.now(), updated: Date.now(), ...extra });
  W.articles.push(a); save(); return a;
}
function deleteArticle(a) { W.articles = W.articles.filter(x => x !== a); save(); }
function deleteCharacter(c) {
  W.characters = W.characters.filter(x => x !== c);
  W.relationships = W.relationships.filter(r => r.a !== c.id && r.b !== c.id);
  delete W.layout[c.id];
  save();
}
function deleteLocation(l) {
  W.locations = W.locations.filter(x => x !== l);
  for (const x of W.locations) if (x.parentId === l.id) x.parentId = l.parentId || '';
  for (const e of allPages()) for (const p of e.places || []) if (p.locId === l.id) p.locId = '';
  for (const c of W.characters) {
    if (c.homeId === l.id) c.homeId = '';
    c.frequents = c.frequents.filter(id => id !== l.id);
    for (const m of MONTHS) {
      const e = c.months[m.k];
      if (e.base === l.id) e.base = '';
      e.visits = e.visits.filter(id => id !== l.id);
    }
  }
  delete W.layout['L' + l.id];
  save();
}

/* Locations as an indented tree (guards against loops) */
function locTree() {
  const kids = new Map();
  for (const l of W.locations) {
    const p = l.parentId && locById(l.parentId) ? l.parentId : '';
    if (!kids.has(p)) kids.set(p, []);
    kids.get(p).push(l);
  }
  const out = [], seen = new Set();
  (function walk(pid, depth) {
    for (const l of (kids.get(pid) || []).sort(byName)) {
      if (seen.has(l.id)) continue;
      seen.add(l.id); out.push({ l, depth }); walk(l.id, depth + 1);
    }
  })('', 0);
  for (const l of W.locations) if (!seen.has(l.id)) out.push({ l, depth: 0 });
  return out;
}
function descendants(id) {
  const out = new Set([id]); let grew = true;
  while (grew) { grew = false; for (const l of W.locations) if (l.parentId && out.has(l.parentId) && !out.has(l.id)) { out.add(l.id); grew = true; } }
  return out;
}
function locPath(id) {
  const parts = []; const seen = new Set(); let l = locById(id);
  while (l && !seen.has(l.id)) { seen.add(l.id); parts.unshift(l); l = locById(l.parentId); }
  return parts;
}
/* "Saltmere, Varenhold" with links */
function placeWithParents(id) {
  const path = locPath(id).reverse();
  return path.length ? joinNodes(path.slice(0, 3).map(l => entityLink(l))) : null;
}

/* Where is a character in a given month? Falls back to their home. */
function whereIs(c, mk) {
  const e = c.months[mk];
  return { base: e.base || c.homeId || '', implied: !e.base && !!c.homeId, visits: e.visits.filter(locById) };
}
/* Who is at a location (optionally including places inside it) in a month? */
function presentAt(locId, mk, withInside = true) {
  const ids = withInside ? descendants(locId) : new Set([locId]);
  const out = [];
  for (const c of W.characters) {
    const w = whereIs(c, mk);
    if (ids.has(w.base)) out.push({ c, how: w.implied ? 'home' : 'based', at: w.base });
    else { const v = w.visits.find(id => ids.has(id)); if (v) out.push({ c, how: 'visit', at: v }); }
  }
  return out.sort((a, b) => byName(a.c, b.c));
}
function allTags() {
  const s = new Set();
  for (const e of allPages()) e.tags.forEach(t => s.add(t));
  return [...s].sort((a, b) => a.localeCompare(b));
}
function relsOf(c) {
  return W.relationships.filter(r => r.a === c.id || r.b === c.id)
    .map(r => ({ r, o: charById(r.a === c.id ? r.b : r.a) })).filter(x => x.o).sort((x, y) => byName(x.o, y.o));
}
/* Find a page by name or alias (for [[links]]) */
function findPage(name) {
  const n = name.trim().toLowerCase();
  const hit = e => (e.name || '').toLowerCase() === n || (e.aliases || '').toLowerCase().split(/\s*[,;]\s*/).includes(n);
  return W.characters.find(hit) || W.locations.find(hit) || W.articles.find(hit) || null;
}

/* ---------- saving ---------- */
function setSaveState(text, cls = '') { const el = $('#saveState'); el.textContent = text; el.className = cls; }
function save() {
  S.dirty = true; setSaveState('Saving…');
  clearTimeout(S.timer); S.timer = setTimeout(flush, 600);
}
function saveConflict() {
  S.conflict = true;
  setSaveState('Not saved — the world was changed elsewhere', 'err');
  const m = modal('This world was changed somewhere else', h('div', null,
    h('p', null, 'Another window or tab saved changes to this world after this page was opened. Saving now would erase them.'),
    h('p', null, h('b', null, 'Reload'), ' to get the latest version. Anything you typed here in the last few seconds will be lost, so copy it first if it matters.'),
    h('div', { class: 'row end' },
      btn('Overwrite with this page', async () => { if (await confirmBox('Replace the saved world with what this page has? The other changes will be lost (a backup is kept in data/backups).', 'Overwrite')) { m.close(); S.conflict = false; S.rev = (await fetch('/api/world').then(r => r.json())).rev; save(); } }, 'danger'),
      btn('Reload', () => { S.dirty = false; location.reload(); }, 'primary'))));
}
async function flush() {
  if (!S.dirty) return;
  if (S.saving) { S.again = true; return; }
  if (S.conflict) return;
  S.saving = true; S.dirty = false; setSaveState('Saving…');
  try {
    // Was the world saved from somewhere else (another tab, an import) since we loaded it?
    const remote = await fetch('/api/world', { cache: 'no-store' }).then(r => r.json()).catch(() => null);
    if (remote && remote.rev && remote.rev !== S.rev) { S.dirty = true; S.saving = false; return saveConflict(); }
    W.rev = uid();
    const r = await fetch('/api/world', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(W) });
    if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.status);
    S.rev = W.rev;
    setSaveState('All changes saved', 'ok');
  } catch (e) {
    S.dirty = true; setSaveState('Couldn’t save — is the app window open? Retrying…', 'err');
    clearTimeout(S.timer); S.timer = setTimeout(flush, 3000);
  } finally {
    S.saving = false;
    if (S.again) { S.again = false; flush(); }
  }
}
window.addEventListener('beforeunload', e => {
  if (!S.dirty || S.conflict) return;
  const ok = navigator.sendBeacon('/api/world', new Blob([JSON.stringify(W)], { type: 'application/json' }));
  if (!ok) { e.preventDefault(); e.returnValue = ''; }
});

/* ---------- photos (local files only) ---------- */
function loadImg(src) {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}
function resizeToBlob(img, max, q = 0.88) {
  const s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const cv = document.createElement('canvas');
  cv.width = Math.max(1, Math.round(img.naturalWidth * s)); cv.height = Math.max(1, Math.round(img.naturalHeight * s));
  cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
  return new Promise(r => cv.toBlob(r, 'image/webp', q));
}
async function uploadBlob(blob) {
  const r = await fetch('/api/photos', { method: 'POST', headers: { 'Content-Type': blob.type }, body: blob });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error || 'Upload failed');
  return j.file;
}
async function addPhotoFromFile(e, file) {
  if (!file.type.startsWith('image/')) throw new Error(`${file.name} is not an image`);
  let main = file, thumb;
  if (!/gif|svg/.test(file.type)) {
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImg(url);
      if (Math.max(img.naturalWidth, img.naturalHeight) > 2400 || file.size > 4e6) main = await resizeToBlob(img, 2400, 0.9);
      try { thumb = await uploadBlob(await resizeToBlob(img, 400, 0.82)); } catch { }
    } finally { URL.revokeObjectURL(url); }
  }
  const name = await uploadBlob(main);
  e.photos.push({ file: name, thumb, caption: (file.name || '').replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ') });
  touch(e); save();
}
async function addFiles(e, files) {
  files = [...files].filter(f => f.type.startsWith('image/'));
  if (!files.length) return;
  toast(`Adding ${plural(files.length, 'image')}…`);
  for (const f of files) { try { await addPhotoFromFile(e, f); } catch (err) { toast(err.message, 'err'); } }
  toast('Image added'); rerender();
}
function pickPhotos(e) {
  const input = h('input', { type: 'file', accept: 'image/*', multiple: true, onchange: () => addFiles(e, input.files) });
  input.click();
}

/* ---------- UI bits ---------- */
function toast(msg, cls = '') {
  const t = $('#toast'); t.textContent = msg; t.className = 'show ' + cls;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.className = '', 2600);
}
function modal(title, body, { wide, onClose } = {}) {
  const root = $('#modalRoot');
  const box = h('div', { class: 'modal' + (wide ? ' wide' : ''), role: 'dialog' },
    h('header', null, h('h3', null, title), h('button', { class: 'icon-btn', title: 'Close', onclick: () => close() }, '✕')),
    h('div', { class: 'modal-body' }, body));
  const back = h('div', { class: 'backdrop', onmousedown: ev => { if (ev.target === back) close(); } }, box);
  const esc = ev => { if (ev.key === 'Escape' && root.lastElementChild === back) close(); };
  document.addEventListener('keydown', esc);
  root.append(back);
  function close() { back.remove(); document.removeEventListener('keydown', esc); onClose?.(); }
  return { close, box };
}
function ask(title, placeholder = '', value = '') {
  return new Promise(resolve => {
    let done = false;
    const input = h('input', { type: 'text', placeholder, value, class: 'big-input' });
    const finish = v => { if (done) return; done = true; m.close(); resolve(v); };
    const form = h('form', { class: 'ask', onsubmit: ev => { ev.preventDefault(); finish(input.value.trim() || null); } },
      input, h('div', { class: 'row end' }, h('button', { type: 'button', class: 'btn', onclick: () => finish(null) }, 'Cancel'), h('button', { class: 'btn primary' }, 'OK')));
    const m = modal(title, form, { onClose: () => { if (!done) { done = true; resolve(null); } } });
    setTimeout(() => { input.focus(); input.select(); });
  });
}
function confirmBox(msg, okText = 'Delete') {
  return new Promise(resolve => {
    let done = false;
    const finish = v => { if (done) return; done = true; m.close(); resolve(v); };
    const m = modal('Are you sure?', h('div', null, h('p', null, msg),
      h('div', { class: 'row end' }, h('button', { class: 'btn', onclick: () => finish(false) }, 'Cancel'),
        h('button', { class: 'btn danger', onclick: () => finish(true) }, okText))),
      { onClose: () => { if (!done) { done = true; resolve(false); } } });
  });
}
function lightbox(photos, i) {
  const img = h('img'); const cap = h('div', { class: 'lb-cap' });
  const show = () => {
    const p = photos[i]; img.src = photoSrc(p, true);
    fill(cap, h('span', null, p.caption || ''), photos.length > 1 ? h('span', { class: 'muted' }, `${i + 1} / ${photos.length}`) : null);
  };
  const step = d => { i = (i + d + photos.length) % photos.length; show(); };
  const body = h('div', { class: 'lightbox' },
    photos.length > 1 ? h('button', { class: 'lb-nav l', onclick: () => step(-1) }, '‹') : null, img,
    photos.length > 1 ? h('button', { class: 'lb-nav r', onclick: () => step(1) }, '›') : null, cap);
  const key = ev => { if (ev.key === 'ArrowLeft') step(-1); if (ev.key === 'ArrowRight') step(1); };
  document.addEventListener('keydown', key);
  modal('', body, { wide: true, onClose: () => document.removeEventListener('keydown', key) }).box.classList.add('lb-modal');
  show();
}
function avatar(e, size = 32, square = false) {
  const el = h('span', { class: 'avatar' + (square ? ' sq' : ''), title: e.name, style: { width: size + 'px', height: size + 'px', fontSize: Math.round(size * 0.38) + 'px', '--h': hue(e.id) } });
  if (e.photos?.[0]) el.append(h('img', { src: photoSrc(e.photos[0]), loading: 'lazy', alt: '' }));
  else el.append(initials(e.name));
  return el;
}
const locStyle = id => ({ '--h': hue(id) });
function locChip(id, extra) {
  const l = locById(id); if (!l) return null;
  return h('a', { class: 'chip loc', href: '#/l/' + id, style: locStyle(id) }, l.name, extra);
}
function charChip(c, month) {
  return h('a', { class: 'chip person', href: `#/c/${c.id}${month ? '?m=' + month : ''}` }, avatar(c, 20), c.name);
}
function field(label, control, cls = '', hint, extra) {
  return h('div', { class: 'field ' + cls }, h('span', { class: 'field-label' }, label), control, hint ? h('span', { class: 'field-hint' }, hint) : null, extra);
}
function autosize(t) { t.style.height = 'auto'; t.style.height = (t.scrollHeight + 2) + 'px'; }
function bindInput(obj, key, { ph = '', type = 'text', cls = '', list, onInput } = {}) {
  return h('input', {
    type, class: cls, placeholder: ph, value: obj[key] ?? '', list,
    oninput: ev => { obj[key] = ev.target.value; touch(obj); save(); onInput?.(ev.target.value); },
  });
}
function bindText(obj, key, { ph = '', rows = 2, onInput } = {}) {
  return h('textarea', {
    placeholder: ph, rows, value: obj[key] ?? '',
    oninput: ev => { obj[key] = ev.target.value; autosize(ev.target); touch(obj); save(); onInput?.(ev.target.value); },
  });
}
function selectEl(options, value, onChange, cls = '') {
  const s = h('select', { class: cls, onchange: () => onChange(s.value) },
    options.map(o => typeof o === 'string' ? h('option', { value: o }, o || '—') : h('option', { value: o.v }, o.n)));
  s.value = value ?? '';
  return s;
}
function locOptions(exclude) {
  return locTree().filter(({ l }) => !exclude?.has(l.id)).map(({ l, depth }) => ({ v: l.id, n: ' '.repeat(depth) + l.name }));
}
/* A location dropdown with "+ New location…" and a jump link */
function locSelect(value, onChange, { placeholder = '— none —', exclude, noLink } = {}) {
  const s = h('select', { class: 'loc-select' });
  const go = h('a', { class: 'icon-btn go', title: 'Open this place' }, '→');
  let prev = value || '';
  const build = val => {
    s.replaceChildren(h('option', { value: '' }, placeholder),
      ...locOptions(exclude).map(o => h('option', { value: o.v }, o.n)),
      h('option', { value: '__new' }, '＋ New location…'));
    s.value = val || ''; prev = s.value;
    go.href = val ? '#/l/' + val : 'javascript:void 0'; go.hidden = !val;
  };
  build(value);
  s.addEventListener('change', async () => {
    if (s.value === '__new') {
      const name = await ask('New location', 'Name of the place');
      if (!name) { s.value = prev; return; }
      const l = newLocation(name); build(l.id); onChange(l.id); return;
    }
    build(s.value); onChange(s.value);
  });
  return noLink ? s : h('span', { class: 'loc-pick' }, s, go);
}
/* ---------- named places: "Born in — Saltmere", linked to a location when the name matches ---------- */
const PLACE_TITLES_C = ['Born in', 'Home', 'Childhood home', 'Grew up in', 'Family home', 'Parents’ home', 'Works at', 'School', 'Worships at', 'Hideout', 'Favourite place', 'Died in', 'Buried at'];
const PLACE_TITLES_L = ['Nearest town', 'Capital', 'Owned by', 'Across from', 'Road to', 'Twin town', 'Sister site'];
function normName(s) {
  return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’‘]/g, "'")
    .replace(/^the\s+/, '').replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function editDistance(a, b) {
  if (Math.abs(a.length - b.length) > 3) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
const locNames = l => [l.name, ...(l.aliases || '').split(/\s*[,;]\s*/)].map(normName).filter(Boolean);
function exactLocation(name) {
  const n = normName(name); if (!n) return null;
  return W.locations.find(l => locNames(l).includes(n)) || null;
}
/* Locations whose name is close to what was typed, best first */
function similarLocations(name, limit = 4) {
  const n = normName(name); if (n.length < 2) return [];
  const words = n.split(' ').filter(w => w.length > 2);
  return W.locations.map(l => {
    let best = 99;
    for (const x of locNames(l)) {
      if (x === n) best = 0;
      else if (x.startsWith(n) || n.startsWith(x)) best = Math.min(best, 1);
      else if (x.includes(n) || n.includes(x)) best = Math.min(best, 2);
      else if (editDistance(x, n) <= Math.max(1, Math.floor(n.length / 5))) best = Math.min(best, 2.5);
      else if (words.some(w => x.split(' ').includes(w))) best = Math.min(best, 3);
    }
    return { l, best };
  }).filter(x => x.best < 99).sort((a, b) => a.best - b.best || byName(a.l, b.l)).slice(0, limit).map(x => x.l);
}
/* The location an entry points at: its saved link, or an exact name match */
const placeLoc = p => locById(p.locId) || (p.nolink ? null : exactLocation(p.name));
function placeLink(p) {
  const l = placeLoc(p);
  if (l) return entityLink(l);
  if (!(p.name || '').trim()) return null;
  return h('a', {
    class: 'new', href: '#', title: `${p.name} (page does not exist)`, onclick: async ev => {
      ev.preventDefault();
      if (!await confirmBox(`There’s no location called “${p.name}” yet. Create it?`, 'Create location')) return;
      const nl = newLocation(p.name.trim()); p.locId = nl.id; save(); location.hash = pageHref(nl, 'edit');
    },
  }, p.name);
}
const isBirth = p => /born|birth/i.test(p.label || '');
function placesEditor(e, titles) {
  const wrap = h('div', { class: 'places-edit' });
  const listId = 'place-titles-' + (titles === PLACE_TITLES_C ? 'c' : 'l');
  const statusFor = (p, box) => {
    const l = locById(p.locId);
    const link = target => { p.locId = target.id; p.name = target.name; p.nolink = false; touch(e); save(); draw(); };
    if (l) {
      fill(box, h('span', { class: 'ok' }, '✓ Linked to '), entityLink(l), l.type || l.parentId ? h('span', { class: 'muted' }, ' — ' + describe(l)) : null, ' ',
        h('a', { href: 'javascript:void 0', class: 'small', onclick: () => { p.locId = ''; p.nolink = true; touch(e); save(); draw(); } }, 'unlink'));
      return;
    }
    if (!(p.name || '').trim()) { fill(box, h('span', { class: 'muted' }, 'Type a place name — it links to a matching location automatically.')); return; }
    const near = similarLocations(p.name);
    fill(box,
      near.length ? [h('span', { class: 'muted' }, 'Did you mean '), joinNodes(near.map(x => h('button', { class: 'chip loc small', style: locStyle(x.id), onclick: () => link(x), title: 'Link to ' + x.name }, x.name)), ' '), h('span', { class: 'muted' }, '? · ')] : h('span', { class: 'muted' }, 'No location by that name. '),
      h('a', { href: 'javascript:void 0', onclick: () => { const nl = newLocation(p.name.trim()); link(nl); toast(`Created location “${nl.name}”`); } }, `Create “${p.name.trim()}” as a new location`),
      near.length ? null : h('span', { class: 'muted' }, ' — or leave it as plain text.'));
  };
  const draw = () => {
    fill(wrap,
      e.places.length ? e.places.map((p, i) => {
        const status = h('div', { class: 'place-status' });
        const nameIn = h('input', {
          class: 'place-name', placeholder: 'Place name', value: p.name || '',
          oninput: ev => {
            p.name = ev.target.value;
            const ex = exactLocation(p.name);
            p.locId = ex ? ex.id : ''; p.nolink = false;
            touch(e); save(); statusFor(p, status);
          },
        });
        statusFor(p, status);
        return h('div', { class: 'place-row' },
          h('input', { class: 'place-title', placeholder: 'Title — e.g. Born in', list: listId, value: p.label || '', oninput: ev => { p.label = ev.target.value; touch(e); save(); } }),
          nameIn,
          h('span', { class: 'row-tools' },
            btn('↑', () => { if (i) { e.places.splice(i - 1, 0, ...e.places.splice(i, 1)); touch(e); save(); draw(); } }, 'mini', 'Move up'),
            btn('✕', () => { e.places.splice(i, 1); touch(e); save(); draw(); }, 'mini', 'Remove')),
          status);
      }) : null,
      h('div', { class: 'row wrap' },
        titles === PLACE_TITLES_C && !e.places.some(isBirth) ? btn('＋ Place of birth', () => addRow('Born in'), 'mini') : null,
        btn('＋ Add a place', () => addRow(''), 'mini'),
        h('span', { class: 'field-hint' }, 'Give each place a title (how it relates) and a name. Names that match a location become links.')),
      h('datalist', { id: listId }, titles.map(t => h('option', { value: t }))));
  };
  const addRow = label => {
    e.places.push({ label, name: '', locId: '' }); touch(e); save(); draw();
    const rows = $$('.place-row', wrap), last = rows[rows.length - 1];
    (label ? $('.place-name', last) : $('.place-title', last))?.focus();
  };
  draw(); return wrap;
}
/* Infobox rows for named places; the birthplace folds into "Born" like Wikipedia does */
function placeRows(e, bornText) {
  const rows = [];
  const birth = e.places.find(p => isBirth(p) && placeLink(p));
  if (bornText || birth) rows.push(['Born', [bornText || null, bornText && birth ? h('br') : null, birth ? placeWithParents(placeLoc(birth)?.id) || placeLink(birth) : null]]);
  for (const p of e.places) {
    if (p === birth) continue;
    const v = placeLoc(p) ? placeWithParents(placeLoc(p).id) : placeLink(p);
    if (v) rows.push([p.label || 'Place', v]);
  }
  return rows;
}
function locMulti(arr, onChange) {
  const wrap = h('div', { class: 'chips' });
  const draw = () => fill(wrap,
    arr.map((id, i) => locChip(id, h('button', { class: 'chip-x', title: 'Remove', onclick: ev => { ev.preventDefault(); arr.splice(i, 1); onChange(); draw(); } }, '×'))),
    locSelect('', v => { if (v && !arr.includes(v)) { arr.push(v); onChange(); } draw(); }, { placeholder: '＋ add a place…', noLink: true }));
  draw(); return wrap;
}
function tagEditor(e) {
  const wrap = h('div', { class: 'chips tags' });
  const draw = () => {
    const input = h('input', {
      class: 'tag-input', placeholder: '＋ category', list: 'tags-dl',
      onkeydown: ev => {
        if ((ev.key === 'Enter' || ev.key === ',') && input.value.trim()) {
          ev.preventDefault();
          const t = input.value.trim().replace(/,$/, '');
          if (!e.tags.includes(t)) { e.tags.push(t); touch(e); save(); }
          draw(); $('.tag-input', wrap).focus();
        } else if (ev.key === 'Backspace' && !input.value && e.tags.length) { e.tags.pop(); touch(e); save(); draw(); $('.tag-input', wrap).focus(); }
      },
      onchange: () => { const t = input.value.trim(); if (t && !e.tags.includes(t)) { e.tags.push(t); touch(e); save(); draw(); } },
    });
    fill(wrap, e.tags.map((t, i) => h('span', { class: 'chip tag' }, t,
      h('button', { class: 'chip-x', onclick: () => { e.tags.splice(i, 1); touch(e); save(); draw(); } }, '×'))),
      input, h('datalist', { id: 'tags-dl' }, allTags().map(t => h('option', { value: t }))));
  };
  draw(); return wrap;
}
function btn(label, onclick, cls = '', title) { return h('button', { class: 'btn ' + cls, onclick, title, type: 'button' }, label); }
function emptyState(icon, title, text, actions) {
  return h('div', { class: 'empty' }, h('div', { class: 'empty-icon' }, icon), h('h3', null, title), h('p', null, text), h('div', { class: 'row center' }, actions));
}
function dropTarget(el, e) {
  el.addEventListener('dragover', ev => { if ([...ev.dataTransfer.types].includes('Files')) { ev.preventDefault(); el.classList.add('drop'); } });
  el.addEventListener('dragleave', () => el.classList.remove('drop'));
  el.addEventListener('drop', ev => { ev.preventDefault(); el.classList.remove('drop'); addFiles(e, ev.dataTransfer.files); });
}

/* ---------- wikitext: [[links]], '''bold''', ''italic'', * lists ---------- */
function wikiText(src) {
  const frag = document.createDocumentFragment();
  // <pre> ... </pre> keeps text exactly as typed (documents, forms, notebook pages)
  const parts = (src || '').replace(/\r/g, '').split(/<pre>\n?([\s\S]*?)\n?<\/pre>/);
  parts.forEach((part, i) => { if (i % 2) frag.append(h('pre', null, part)); else wikiBlocks(part, frag); });
  return frag;
}
function wikiBlocks(src, frag) {
  // Blank lines split paragraphs; "== Heading ==" lines become sub-headings;
  // runs of lines starting with * or # become bullet / numbered lists.
  for (const raw of src.split(/\n\s*\n/)) {
    let p = null, list = null;
    for (const l of raw.split('\n')) {
      if (/^(={2,4})\s*(.+?)\s*\1\s*$/.test(l)) { p = list = null; frag.append(h('h3', null, inline(l.replace(/^=+\s*|\s*=+$/g, '')))); continue; }
      const li = /^\s*([*#])\s?(.*)$/.exec(l);
      if (li) {
        const tag = li[1] === '#' ? 'OL' : 'UL';
        if (!list || list.tagName !== tag) { list = h(tag.toLowerCase()); frag.append(list); }
        list.append(h('li', null, inline(li[2]))); p = null; continue;
      }
      if (!l.trim()) continue;
      list = null;
      if (p) p.append(h('br')); else { p = h('p'); frag.append(p); }
      append(p, [inline(l)]);
    }
  }
}
function inline(s) {
  const out = []; const re = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|'''(.+?)'''|''(.+?)''/g;
  let last = 0, m;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    if (m[1]) out.push(wikiLink(m[1].trim(), m[2]?.trim()));
    else if (m[3]) out.push(h('b', null, inline(m[3])));
    else out.push(h('i', null, inline(m[4])));
    last = re.lastIndex;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}
function wikiLink(target, label) {
  const e = findPage(target);
  if (e) return entityLink(e, label || target);
  return h('a', { class: 'new', href: '#', title: `${target} (page does not exist)`, onclick: ev => { ev.preventDefault(); createFromRedLink(target); } }, label || target);
}
function createFromRedLink(name) {
  const m = modal(`Create “${name}”`, h('div', null,
    h('p', null, 'This page doesn’t exist yet. What is it?'),
    h('div', { class: 'row end' }, btn('Cancel', () => m.close()),
      btn('Story notes', () => { m.close(); location.hash = pageHref(newArticle(name), 'edit'); }),
      btn('A location', () => { m.close(); location.hash = pageHref(newLocation(name), 'edit'); }),
      btn('A character', () => { m.close(); location.hash = pageHref(newCharacter(name), 'edit'); }, 'primary'))));
}

/* ---------- chrome: tabs, search ---------- */
function setTabs(left, right = []) {
  const tab = x => h('a', { class: 'tab' + (x.on ? ' selected' : ''), href: x.href || 'javascript:void 0', onclick: x.onclick }, h('span', null, x.label));
  fill($('#tabsLeft'), left.map(tab));
  fill($('#tabsRight'), right.map(tab));
}
function entityTabs(e, mode) {
  const k = kindOf(e);
  setTabs([{ label: k === 'c' ? 'Character' : k === 'l' ? 'Location' : 'Article', href: pageHref(e), on: mode !== 'talk' }, { label: 'Talk', href: pageHref(e, 'talk'), on: mode === 'talk' }],
    [{ label: 'Read', href: pageHref(e), on: mode === 'read' }, { label: 'Edit', href: pageHref(e, 'edit'), on: mode === 'edit' }]);
}
function searchMatches(q, limit = 8) {
  q = q.trim().toLowerCase(); if (!q) return [];
  const all = allPages();
  const score = e => {
    const n = (e.name || '').toLowerCase(), a = (e.aliases || '').toLowerCase();
    if (n === q) return 0; if (n.startsWith(q)) return 1; if (n.split(/\s+/).some(w => w.startsWith(q))) return 2;
    if (a.includes(q)) return 3; if (n.includes(q)) return 4; return 9;
  };
  return all.map(e => ({ e, s: score(e) })).filter(x => x.s < 9).sort((a, b) => a.s - b.s || byName(a.e, b.e)).slice(0, limit).map(x => x.e);
}
function describe(e) {
  if (kindOf(e) === 'a') return stripWiki(firstLine(e.summary, 60)) || 'Story notes';
  return kindOf(e) === 'c' ? [e.occupation, locName(e.homeId)].filter(Boolean).join(', ') || 'Character'
    : [e.type, locName(e.parentId)].filter(Boolean).join(', ') || 'Location';
}
function setupSearch() {
  const input = $('#search'), box = $('#suggest');
  let items = [], sel = -1;
  const close = () => { box.hidden = true; sel = -1; };
  const draw = () => {
    items = searchMatches(input.value);
    if (!input.value.trim()) return close();
    fill(box, items.map((e, i) => h('a', { class: 'sug' + (i === sel ? ' on' : ''), href: pageHref(e), onmousedown: ev => ev.preventDefault(), onclick: () => { input.value = ''; close(); } },
      avatar(e, 34, kindOf(e) !== 'c'), h('span', null, h('b', null, e.name), h('small', null, describe(e))))),
      h('a', { class: 'sug all', href: '#/search?q=' + encodeURIComponent(input.value.trim()), onmousedown: ev => ev.preventDefault(), onclick: () => close() },
        '🔍 Search for pages containing ', h('b', null, input.value.trim())));
    box.hidden = false;
  };
  input.addEventListener('input', () => { sel = -1; draw(); });
  input.addEventListener('focus', draw);
  input.addEventListener('blur', () => setTimeout(close, 100));
  input.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown') { sel = Math.min(items.length - 1, sel + 1); draw(); ev.preventDefault(); }
    else if (ev.key === 'ArrowUp') { sel = Math.max(-1, sel - 1); draw(); ev.preventDefault(); }
    else if (ev.key === 'Escape') { input.blur(); }
    else if (ev.key === 'Enter') {
      const q = input.value.trim(); if (!q) return;
      const exact = sel >= 0 ? items[sel] : items.find(e => e.name.toLowerCase() === q.toLowerCase());
      location.hash = exact ? pageHref(exact) : '#/search?q=' + encodeURIComponent(q);
      input.value = ''; close(); input.blur();
    }
  });
}
function randomPage() {
  const all = allPages();
  if (!all.length) return toast('Nothing to pick from yet');
  location.hash = pageHref(all[Math.random() * all.length | 0]);
}
function createCharacter() { const c = newCharacter(); S.focusName = true; location.hash = pageHref(c, 'edit'); }
function createArticle() { const a = newArticle(); S.focusName = true; location.hash = pageHref(a, 'edit'); }
function createLocation() { const l = newLocation(); S.focusName = true; location.hash = pageHref(l, 'edit'); }

/* ---------- routing ---------- */
function route() {
  const [path, query] = location.hash.slice(1).split('?');
  return { parts: (path || '').split('/').filter(Boolean).map(decodeURIComponent), q: new URLSearchParams(query || '') };
}
let lastHash = null;
function render(keepScroll = false) {
  const { parts, q } = route();
  const [a, b, mode = 'read'] = parts;
  let node, title = '';
  setTabs([{ label: 'Special page', on: true }]);
  if (!a) { node = viewMainPage(); title = 'Main Page'; setTabs([{ label: 'Main Page', href: '#/', on: true }]); }
  else if (a === 'characters') { node = viewList('c'); title = 'List of characters'; }
  else if (a === 'locations') { node = viewList('l'); title = 'List of locations'; }
  else if (a === 'articles') { node = viewArticleList(); title = 'Story notes'; }
  else if (a === 'timeline') { node = viewTimeline(q); title = 'The Year'; }
  else if (a === 'settings') { node = viewSettings(); title = 'Settings'; }
  else if (a === 'search') { node = viewSearch(q.get('q') || ''); title = 'Search results'; }
  else if (a === 'categories') { node = viewCategories(); title = 'Categories'; }
  else if (a === 'category') { node = viewCategory(b || ''); title = 'Category:' + b; }
  else if (['c', 'l', 'a'].includes(a) && byKind(a, b)) {
    const e = byKind(a, b);
    entityTabs(e, mode);
    title = mode === 'edit' ? 'Editing ' + e.name : mode === 'talk' ? 'Talk:' + e.name : e.name;
    node = mode === 'edit' ? (a === 'c' ? editCharacter(e, q) : a === 'l' ? editLocation(e) : editArticle(e))
      : mode === 'talk' ? viewTalk(e) : (a === 'c' ? readCharacter(e, q) : a === 'l' ? readLocation(e) : readArticle(e));
  }
  else if (VIEWS[a]) { node = VIEWS[a](q, b); title = a[0].toUpperCase() + a.slice(1); }
  else node = h('div', null, h('h1', { class: 'firstHeading' }, 'Page not found'),
    h('p', null, 'There is no page here — it may have been deleted. ', h('a', { href: '#/' }, 'Return to the Main Page'), '.'));

  const y = window.scrollY;
  fill($('#view'), node);
  document.title = (title ? title + ' — ' : '') + (W.name || 'My World');
  $$('#sidebar a[data-nav]').forEach(n => n.classList.toggle('active', n.dataset.nav === (a || 'home')));
  fill($('#logoName'), W.name || 'My World');
  $('#logoName').classList.toggle('long', (W.name || '').length > 14);
  $('#search').placeholder = 'Search ' + (W.name || 'My World');
  $$('textarea', node).forEach(autosize);
  document.body.classList.remove('nav-open');
  if (keepScroll) window.scrollTo(0, y);
  else if (q.get('m')) setTimeout(() => $('#month-' + q.get('m'))?.scrollIntoView({ block: 'center' }), 30);
  else if (location.hash !== lastHash) window.scrollTo(0, 0);
  lastHash = location.hash;
  if (S.focusName) { S.focusName = false; const n = $('.name-input', node); n?.focus(); n?.select(); }
}
const rerender = () => render(true);

/* ======================================================================
   Article (read) pages
   ====================================================================== */
function infobox(e, rows) {
  const p = e.photos[0];
  const body = [];
  for (const r of rows) {
    if (!r) continue;
    if (r.header) body.push(h('tr', null, h('th', { colspan: 2, class: 'ib-header' }, r.header)));
    else if (r.full) body.push(h('tr', null, h('td', { colspan: 2, class: 'ib-full' }, r.full)));
    else {
      const v = r[1];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) continue;
      body.push(h('tr', null, h('th', { scope: 'row' }, r[0]), h('td', null, v)));
    }
  }
  // drop header rows that ended up with nothing under them
  const cleaned = body.filter((tr, i) => !$('.ib-header', tr) || (body[i + 1] && !$('.ib-header', body[i + 1])));
  return h('table', { class: 'infobox' }, h('tbody', null,
    h('tr', null, h('th', { colspan: 2, class: 'ib-above' }, e.name || 'Untitled')),
    h('tr', null, h('td', { colspan: 2, class: 'ib-image' },
      p ? [h('img', { src: photoSrc(p, true), alt: e.name, onclick: () => lightbox(e.photos, 0) }), p.caption ? h('div', { class: 'ib-caption' }, p.caption) : null]
        : h('a', { class: 'ib-noimg', href: pageHref(e, 'edit') + '?photos=1' }, h('span', null, initials(e.name)), 'Add an image'))),
    cleaned));
}
function articleShell(e, info, lead, sections) {
  sections = sections.filter(Boolean);
  sections.forEach((s, i) => { s.id = 'sec-' + i; s.num = i + 1; });
  const words = [e.summary, ...CHAR_TEXT.map(([k]) => e[k]), ...LOC_TEXT.map(([k]) => e[k]), ...e.sections.map(x => x.text)].join(' ').trim().split(/\s+/).filter(Boolean).length;
  const toc = sections.length >= 3 ? h('div', { class: 'toc', role: 'navigation' },
    h('div', { class: 'toc-title' }, h('b', null, 'Contents'), ' ', h('span', { class: 'toc-toggle' }, '[', h('a', { href: 'javascript:void 0', onclick: ev => { const ul = ev.target.closest('.toc').querySelector('ul'); ul.hidden = !ul.hidden; ev.target.textContent = ul.hidden ? 'show' : 'hide'; } }, 'hide'), ']')),
    h('ul', null, sections.map(s => h('li', null, h('a', { href: 'javascript:void 0', onclick: () => $('#' + s.id).scrollIntoView({ behavior: 'smooth' }) }, h('span', { class: 'tocnumber' }, s.num), ' ', s.title))))) : null;
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, e.name || 'Untitled'),
    h('div', { class: 'siteSub' }, 'From ' + (W.name || 'My World') + ', the story encyclopedia'),
    h('div', { class: 'mw-body' },
      words < 40 ? h('div', { class: 'ambox' }, h('span', { class: 'ambox-icon' }, '✎'),
        h('span', null, 'This article is a ', h('b', null, 'stub'), '. You can help ', W.name || 'My World', ' by ', h('a', { href: pageHref(e, 'edit') }, 'expanding it'), '.')) : null,
      info, lead, toc,
      sections.map(s => [h('h2', { id: s.id }, h('span', null, s.title), h('span', { class: 'editsection' }, '[', h('a', { href: pageHref(e, 'edit') + (s.editQ || '') }, 'edit'), ']')), s.node])),
    catBox(e),
    h('div', { class: 'footer-info' }, 'This page was last edited on ', new Date(e.updated || Date.now()).toLocaleString(undefined, { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), '.'));
}
function catBox(e) {
  const k = kindOf(e);
  const cats = [k === 'c' ? 'Characters' : k === 'l' ? 'Locations' : 'Story notes', ...e.tags];
  return h('div', { class: 'catlinks' }, h('a', { href: '#/categories' }, 'Categories'), ': ',
    h('ul', null, cats.map((t, i) => h('li', null, i === 0 ? h('a', { href: k === 'c' ? '#/characters' : k === 'l' ? '#/locations' : '#/articles' }, t) : h('a', { href: '#/category/' + encodeURIComponent(t) }, t)))));
}
function leadPara(e, auto) {
  const s = (e.summary || '').trim();
  if (!s) return h('p', null, auto);
  const frag = wikiText(s);
  const first = frag.firstElementChild;
  // bold the page's own name the first time it appears, as Wikipedia does
  if (first && first.firstChild?.nodeType === 3 && e.name && first.firstChild.data.startsWith(e.name)) {
    const t = first.firstChild; t.data = t.data.slice(e.name.length); first.insertBefore(h('b', null, e.name), t);
  }
  return frag;
}
function textSection(e, key, title) {
  return (e[key] || '').trim() ? { title, node: wikiText(e[key]), editQ: '?f=' + key } : null;
}
const factRows = e => e.facts.filter(f => (f.label || '').trim() || (f.value || '').trim()).map(f => [f.label || '—', inline(f.value || '')]);
const customSections = e => e.sections.map((x, i) => ({ x, i })).filter(({ x }) => (x.title || '').trim() || (x.text || '').trim())
  .map(({ x, i }) => ({ title: x.title || 'Untitled section', node: wikiText(x.text), editQ: '?f=sec' + i }));
function gallerySection(e) {
  if (e.photos.length < 2) return null;
  return {
    title: 'Gallery', editQ: '?photos=1', node: h('ul', { class: 'gallery-r' }, e.photos.map((p, i) => h('li', null,
      h('div', { class: 'gb' }, h('img', { src: photoSrc(p), loading: 'lazy', alt: '', onclick: () => lightbox(e.photos, i) })), h('div', { class: 'gtext' }, p.caption || ''))))
  };
}

const openMonths = {}; // entity id -> Set of open month keys
function readCharacter(c, q) {
  const rels = relsOf(c);
  const relRows = (types, label) => {
    const list = rels.filter(x => types.includes(x.r.type));
    return [label, list.length ? joinNodes(list.map(x => [entityLink(x.o), x.r.roles[x.o.id] ? h('span', { class: 'muted' }, ` (${x.r.roles[x.o.id]})`) : null]), h('br')) : null];
  };
  const info = infobox(c, [
    ['Also known as', c.aliases],
    ['Status', c.status],
    { header: 'Personal information' },
    ...placeRows(c, c.born), ['Age', c.age], ['Pronouns', c.pronouns],
    ...personalInfoboxRows(c).filter(r => !['Education', 'Marital status', 'Vehicle'].includes(r[0])),
    ['Occupation', c.occupation], ['Affiliation', c.affiliation],
    ['Residence', c.homeId ? placeWithParents(c.homeId) : null],
    ['Frequents', c.frequents.filter(locById).length ? joinNodes(c.frequents.filter(locById).map(id => entityLink(locById(id))), h('br')) : null],
    ...personalInfoboxRows(c).filter(r => ['Education', 'Marital status', 'Vehicle'].includes(r[0])),
    ...factRows(c),
    { header: 'Relationships' },
    relRows(['family'], 'Family'), relRows(['romance'], 'Partner'),
    relRows(['friend', 'ally'], 'Friends & allies'), relRows(['mentor'], 'Mentor / student'), relRows(['clinical'], 'Clinical'), relRows(['work'], 'Work'),
    relRows(['rival', 'enemy'], 'Rivals & enemies'), relRows(['acquaint', 'other'], 'Other'),
  ]);
  const home = locById(c.homeId);
  const auto = [h('b', null, c.name), c.aliases ? [' (also known as ', h('i', null, c.aliases), ')'] : null, ' is ',
    c.occupation ? [/^[aeiou]/i.test(c.occupation) ? 'an ' : 'a ', c.occupation.toLowerCase()] : 'a character',
    home ? [' living in ', entityLink(home)] : null, '.'];
  const relSection = rels.length ? {
    title: 'Relationships', editQ: '?f=rels', node: h('ul', null, rels.map(({ r, o }) => h('li', null,
      entityLink(o), ' — ', r.roles[o.id] ? [`${c.name}’s `, h('i', null, r.roles[o.id])] : relType(r.type).n.toLowerCase(),
      r.roles[c.id] ? h('span', { class: 'muted' }, `; ${c.name} is their ${r.roles[c.id]}`) : null,
      r.note ? ['. ', inline(r.note)] : null)))
  } : null;
  const byKey = k => { const d = CHAR_TEXT.find(x => x[0] === k); return textSection(c, k, d[1]); };
  return articleShell(c, info, leadPara(c, auto), [
    byKey('backstory'), byKey('appearance'), byKey('personality'), byKey('voice'), byKey('wants'),
    personalSection(c),
    ...customSections(c),
    relSection,
    { title: 'Whereabouts, ' + monthLabel(MONTHS[0]) + ' to ' + monthLabel(MONTHS[11]), node: monthsRead(c, q), editQ: '?f=year' },
    byKey('secrets'), byKey('notes'), gallerySection(c),
  ]);
}
function monthsRead(c, q) {
  const open = openMonths[c.id] ||= new Set();
  if (q?.get('m')) open.add(q.get('m'));
  const wrap = h('div', { class: 'months-r' });
  const dets = MONTHS.map(m => {
    const w = whereIs(c, m.k), e = c.months[m.k];
    const company = w.base ? presentAt(w.base, m.k, false).filter(x => x.c !== c) : [];
    const empty = !e.base && !e.visits.length && !e.events.trim() && !e.notes.trim();
    const det = h('details', { class: 'month-r' + (empty ? ' blank' : ''), id: 'month-' + m.k, open: open.has(m.k) },
      h('summary', null, h('span', { class: 'mname' }, monthLabel(m)),
        h('span', { class: 'msum' }, w.base ? [w.implied ? 'at home in ' : '', locName(w.base)] : 'whereabouts unknown',
          w.visits.length ? ` · travels to ${w.visits.map(locName).join(', ')}` : '',
          e.events.trim() ? h('span', { class: 'mev' }, ' — ' + stripWiki(firstLine(e.events, 90))) : '')),
      h('div', { class: 'mbody' },
        h('table', { class: 'kv' }, h('tbody', null,
          h('tr', null, h('th', null, 'Based at'), h('td', null, w.base ? [placeWithParents(w.base), w.implied ? h('span', { class: 'muted' }, ' (home)') : null] : h('span', { class: 'muted' }, 'Unknown'))),
          w.visits.length ? h('tr', null, h('th', null, 'Travels to'), h('td', null, joinNodes(w.visits.map(id => entityLink(locById(id)))))) : null,
          company.length ? h('tr', null, h('th', null, 'Also there'), h('td', null, joinNodes(company.map(x => [entityLink(x.c), x.how === 'visit' ? h('span', { class: 'muted' }, ' (visiting)') : null])))) : null)),
        e.events.trim() ? wikiText(e.events) : null,
        e.notes.trim() ? h('div', { class: 'hatnote' }, h('b', null, 'Notes: '), inline(e.notes)) : null,
        empty ? h('p', { class: 'muted' }, `Nothing recorded for ${m.n}. `, h('a', { href: pageHref(c, 'edit') + '?m=' + m.k }, 'Add something'), '.') : null,
        h('div', { class: 'mfoot' }, '[', h('a', { href: pageHref(c, 'edit') + '?m=' + m.k }, 'edit ' + m.n), ']')));
    det.addEventListener('toggle', () => det.open ? open.add(m.k) : open.delete(m.k));
    return det;
  });
  append(wrap, [h('div', { class: 'mw-toggles' },
    '[', h('a', { href: 'javascript:void 0', onclick: () => dets.forEach(d => d.open = true) }, 'expand all'), '] [',
    h('a', { href: 'javascript:void 0', onclick: () => dets.forEach(d => d.open = false) }, 'collapse all'), ']'), dets]);
  return wrap;
}

/* Every page whose named places point at this location (or somewhere inside it) */
function connectedSection(l) {
  const within = descendants(l.id);
  const items = [];
  for (const e of allPages()) for (const p of e.places || []) {
    const t = placeLoc(p);
    if (e !== l && t && within.has(t.id)) items.push({ e, p, t });
  }
  if (!items.length) return null;
  items.sort((a, b) => byName(a.e, b.e));
  return {
    title: 'Connected people and places', editQ: '', node: h('ul', null, items.map(({ e, p, t }) => h('li', null,
      entityLink(e), ' — ', (p.label || 'connected').toLowerCase(), t.id !== l.id ? [' ', entityLink(t)] : null)))
  };
}
function readLocation(l) {
  const within = descendants(l.id);
  const residents = W.characters.filter(c => within.has(c.homeId)).sort(byName);
  const kids = W.locations.filter(x => x.parentId === l.id).sort(byName);
  const regulars = W.characters.filter(c => c.frequents.some(id => within.has(id))).sort(byName);
  const info = infobox(l, [
    ['Type', l.type],
    ['Part of', l.parentId ? placeWithParents(l.parentId) : null],
    ['Population', l.population], ['Ruled / run by', l.ruler],
    ...placeRows(l, ''),
    ...factRows(l),
    { header: 'People' },
    ['Residents', residents.length ? joinNodes(residents.slice(0, 12).map(c => entityLink(c)), h('br')) : null],
    ['Regulars', regulars.length ? joinNodes(regulars.slice(0, 8).map(c => entityLink(c)), h('br')) : null],
    { header: 'Places within' },
    kids.length ? { full: h('div', { class: 'ib-list' }, joinNodes(kids.map(k => entityLink(k)), ' · ')) } : null,
  ]);
  const parent = locById(l.parentId);
  const auto = [h('b', null, l.name), ' is ', l.type ? [/^[aeiou]/i.test(l.type) ? 'an ' : 'a ', l.type.toLowerCase()] : 'a place', parent ? [' in ', entityLink(parent)] : null, '.'];
  const presence = h('table', { class: 'wikitable presence-r' },
    h('thead', null, h('tr', null, h('th', null, 'Month'), h('th', null, 'Who is here'))),
    h('tbody', null, MONTHS.map(m => {
      const here = presentAt(l.id, m.k);
      return h('tr', null, h('th', null, m.n), h('td', null, here.length ? joinNodes(here.map(x => [entityLink(x.c),
        x.how === 'visit' ? h('span', { class: 'muted' }, ' (visiting)') : x.at !== l.id ? h('span', { class: 'muted' }, ` (${locName(x.at)})`) : null])) : h('span', { class: 'muted' }, '—')));
    })));
  const byKey = k => { const d = LOC_TEXT.find(x => x[0] === k); return textSection(l, k, d[1]); };
  return articleShell(l, info, leadPara(l, auto), [
    byKey('description'), byKey('geography'), byKey('culture'), byKey('sights'), byKey('history'),
    ...customSections(l),
    kids.length ? { title: 'Places within', node: h('ul', null, kids.map(k => h('li', null, entityLink(k), k.type ? h('span', { class: 'muted' }, ' — ' + k.type) : null, k.summary ? ': ' + stripWiki(firstLine(k.summary, 100)) : null))) } : null,
    connectedSection(l),
    { title: 'Who is here, month by month', node: presence },
    byKey('secrets'), byKey('notes'), gallerySection(l),
  ]);
}

function viewTalk(e) {
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, 'Talk:' + e.name),
    h('div', { class: 'siteSub' }, 'Your notes to yourself about this page — questions, to-dos, continuity worries.'),
    h('div', { class: 'talk-box' }, bindText(e, 'talk', { rows: 12, ph: '== Things to check ==\n* Does she know about the ledger yet?\n* Age doesn’t match the flashback in chapter 3' })),
    h('p', { class: 'muted small' }, 'Saved automatically. Use [[Name]] to mention other pages.'),
    (e.talk || '').trim() ? [h('h2', null, 'Preview'), h('div', { class: 'talk-preview' }, wikiText(e.talk))] : null);
}

/* ======================================================================
   Edit pages
   ====================================================================== */
function editHead(e) {
  return [h('h1', { class: 'firstHeading' }, 'Editing ', h('i', null, e.name || 'Untitled')),
  h('div', { class: 'edit-notice' }, 'Changes save automatically. In any text box you can link to another page with ',
    h('code', null, '[[Name]]'), ', and use ', h('code', null, "''italic''"), ' or ', h('code', null, "'''bold'''"), '. Start a line with ', h('code', null, '*'), ' for a bullet list.')];
}
function editSection(title, body, id, actions) {
  return h('fieldset', { class: 'edit-sec', id }, h('legend', null, title), actions ? h('div', { class: 'edit-actions' }, actions) : null, body);
}
function coverEdit(e) {
  const box = h('div', { class: 'cover-edit' });
  fill(box, e.photos[0] ? h('img', { src: photoSrc(e.photos[0], true), alt: '', onclick: () => lightbox(e.photos, 0) }) : h('span', { class: 'big-initials', style: { '--h': hue(e.id) } }, initials(e.name)),
    btn(e.photos.length ? 'Add another image' : 'Upload an image', () => pickPhotos(e), 'mini'));
  dropTarget(box, e);
  return box;
}
function galleryEdit(e) {
  const grid = h('div', { class: 'gallery' });
  e.photos.forEach((p, i) => grid.append(h('figure', { class: 'ph' },
    h('img', { src: photoSrc(p), loading: 'lazy', onclick: () => lightbox(e.photos, i) }),
    h('div', { class: 'ph-tools' },
      i === 0 ? h('span', { class: 'badge' }, 'Infobox image') : btn('★', () => { e.photos.unshift(...e.photos.splice(i, 1)); touch(e); save(); rerender(); }, 'mini', 'Use in infobox'),
      btn('✕', async () => { if (await confirmBox('Remove this image?', 'Remove')) { e.photos.splice(i, 1); touch(e); save(); rerender(); } }, 'mini', 'Remove image')),
    h('input', { class: 'caption', placeholder: 'Caption…', value: p.caption || '', oninput: ev => { p.caption = ev.target.value; touch(e); save(); } }))));
  grid.append(h('button', { class: 'ph add', onclick: () => pickPhotos(e) }, '＋', h('small', null, 'Upload image')));
  dropTarget(grid, e);
  return h('div', null, grid, h('p', { class: 'field-hint' }, 'You can also drag images here, or paste one with Ctrl+V anywhere on this page. The first image appears in the infobox.'));
}
function editFooter(e, onDelete) {
  return h('div', { class: 'edit-footer' },
    h('a', { class: 'btn primary', href: pageHref(e) }, 'Show page'),
    h('span', { class: 'muted small' }, 'All changes are saved as you type.'),
    h('span', { class: 'grow' }),
    btn('Delete page', onDelete, 'danger'));
}
function scrollToQ(node, q) {
  const f = q?.get('f'), photos = q?.get('photos');
  if (f === 'year') { setTimeout(() => $('#edit-year', node)?.scrollIntoView({ block: 'start' }), 40); return; }
  const target = f ? $(`[data-f="${f}"]`, node) || $('#edit-' + f, node) : photos ? $('#edit-photos', node) : null;
  if (target) setTimeout(() => { target.scrollIntoView({ block: 'center' }); $('textarea, input', target)?.focus(); }, 40);
}

function editCharacter(c, q) {
  const open = openMonths[c.id] ||= new Set();
  if (q.get('m')) open.add(q.get('m'));
  const monthsWrap = h('div', { class: 'months' }, MONTHS.map((m, i) => monthBlock(c, m, i, open)));
  const node = h('div', { class: 'article edit' }, editHead(c),
    editSection('Infobox', h('div', { class: 'edit-top' }, coverEdit(c), h('div', { class: 'edit-grid' },
      field('Name', bindInput(c, 'name', { cls: 'name-input', onInput: () => { document.title = 'Editing ' + c.name; } }), 'span-2'),
      field('Also known as', bindInput(c, 'aliases', { ph: 'Nicknames, titles — separate with commas' }), 'span-2'),
      field('Status', selectEl(STATUSES, c.status || '', v => { c.status = v; touch(c); save(); })),
      field('Born', bindInput(c, 'born', { ph: 'e.g. Winter, year 312' })),
      field('Age', bindInput(c, 'age')),
      field('Pronouns', bindInput(c, 'pronouns')),
      field('Occupation', bindInput(c, 'occupation')),
      field('Affiliation', bindInput(c, 'affiliation', { ph: 'Family, guild, faction…' }))))),
    editSection('Opening paragraph', field('', bindText(c, 'summary', { ph: `${c.name} is a smuggler from [[Saltmere]] who…`, rows: 3 }), '',
      'Shown at the top of the article. Start with their name and it’ll appear in bold.'), 'edit-summary'),
    editSection('Places', h('div', null,
      placesEditor(c, PLACE_TITLES_C),
      h('div', { class: 'edit-grid places-core' },
        field('Lives in (used for The Year)', locSelect(c.homeId, v => { c.homeId = v; touch(c); save(); rerender(); }, { placeholder: '— not set —' })),
        field('Often goes to', locMulti(c.frequents, () => { touch(c); save(); })))), 'edit-places'),
    editSection('The year · ' + monthLabel(MONTHS[0]) + ' → ' + monthLabel(MONTHS[11]), monthsWrap, 'edit-year', [
      btn('Expand all', () => { MONTHS.forEach(m => open.add(m.k)); $$('details', monthsWrap).forEach(d => d.open = true); }, 'mini'),
      btn('Collapse all', () => { open.clear(); $$('details', monthsWrap).forEach(d => d.open = false); }, 'mini')]),
    editSection('Personal details', personalEditor(c), 'edit-personal'),
    editSection('Extra infobox rows', factsEditor(c), 'edit-facts'),
    editSection('Relationships', relEditor(c), 'edit-rels'),
    editSection('Article sections', h('div', { class: 'edit-grid' },
      CHAR_TEXT.map(([k, , label, big]) => h('div', { class: 'span-2', dataset: { f: k } }, field(label, bindText(c, k, { rows: big ? 5 : 3 })))))),
    editSection('Your own sections', sectionsEditor(c), 'edit-sec'),
    editSection('Images', galleryEdit(c), 'edit-photos'),
    editSection('Categories', h('div', null, tagEditor(c), h('p', { class: 'field-hint' }, 'Group pages however you like — “Saltmere”, “The Holt family”, “Book 2”, “Villains”. Each category gets its own page.'))),
    editFooter(c, async () => {
      if (await confirmBox(`Delete the page “${c.name}”? Their relationships will be removed too.`)) { deleteCharacter(c); location.hash = '#/characters'; }
    }));
  scrollToQ(node, q);
  return node;
}

function monthBlock(c, m, i, open) {
  const e = c.months[m.k];
  const sum = h('span', { class: 'month-sum' });
  const body = h('div', { class: 'month-body' });
  const drawSummary = () => {
    const w = whereIs(c, m.k);
    const filled = e.base || e.visits.length || e.events.trim() || e.notes.trim();
    fill(sum,
      w.base ? h('span', { class: 'chip loc small' + (w.implied ? ' implied' : ''), style: locStyle(w.base) }, (w.implied ? '⌂ ' : '📍 ') + locName(w.base)) : h('span', { class: 'muted' }, 'whereabouts unknown'),
      w.visits.length ? h('span', { class: 'muted' }, ` ✈ ${w.visits.map(locName).join(', ')}`) : null,
      e.events.trim() ? h('span', { class: 'ev' }, ' — ' + stripWiki(firstLine(e.events, 80))) : null);
    det.classList.toggle('filled', !!filled);
  };
  const drawBody = () => {
    const w = whereIs(c, m.k);
    const company = w.base ? presentAt(w.base, m.k, false).filter(x => x.c !== c) : [];
    const prev = i > 0 ? c.months[MONTHS[i - 1].k] : null;
    fill(body,
      h('div', { class: 'edit-grid' },
        field('Based at', locSelect(e.base, v => { e.base = v; touch(c); save(); drawSummary(); drawBody(); },
          { placeholder: c.homeId ? `— at home (${locName(c.homeId)}) —` : '— not set —' })),
        field('Travels to', locMulti(e.visits, () => { touch(c); save(); drawSummary(); })),
        field('What happens', bindText(e, 'events', { ph: 'Events, scenes, turning points…', rows: 3, onInput: () => { touch(c); drawSummary(); } }), 'span-2'),
        field('Notes', bindText(e, 'notes', { ph: 'Mood, appearance, what they know, loose ends…', rows: 2, onInput: () => { touch(c); drawSummary(); } }), 'span-2')),
      company.length ? h('div', { class: 'company' }, h('span', { class: 'muted' }, `Also at ${locName(w.base)} in ${m.n}: `), company.map(x => charChip(x.c, m.k))) : null,
      h('div', { class: 'row month-tools' },
        prev ? btn('↧ Same place as ' + MONTHS[i - 1].s, () => { e.base = prev.base; e.visits = [...prev.visits]; touch(c); save(); drawSummary(); drawBody(); }, 'mini') : null,
        btn('Clear month', async () => {
          if (await confirmBox(`Clear everything in ${m.n}?`, 'Clear')) { e.base = ''; e.visits = []; e.events = ''; e.notes = ''; touch(c); save(); drawSummary(); drawBody(); }
        }, 'mini')));
    $$('textarea', body).forEach(t => requestAnimationFrame(() => autosize(t)));
  };
  const det = h('details', { class: 'month', id: 'month-' + m.k, open: open.has(m.k) },
    h('summary', null, h('span', { class: 'month-name' }, monthLabel(m)), sum), body);
  det.addEventListener('toggle', () => { det.open ? open.add(m.k) : open.delete(m.k); if (det.open) $$('textarea', body).forEach(autosize); });
  drawSummary(); drawBody();
  return det;
}

function relEditor(c) {
  const wrap = h('div', { class: 'rels' });
  const draw = () => {
    const rels = relsOf(c);
    const others = W.characters.filter(x => x !== c).sort(byName);
    let pick = '', type = 'friend';
    const pickSel = selectEl([{ v: '', n: 'Choose a character…' }, ...others.map(o => ({ v: o.id, n: o.name })), { v: '__new', n: '＋ New character…' }], '', async v => {
      if (v === '__new') { const n = await ask('New character', 'Name'); if (!n) { pickSel.value = ''; return; } const nc = newCharacter(n); pickSel.append(h('option', { value: nc.id }, n)); pickSel.value = nc.id; pick = nc.id; }
      else pick = v;
    });
    fill(wrap,
      rels.length ? h('div', { class: 'rel-list' }, rels.map(({ r, o }) => {
        const t = relType(r.type);
        return h('div', { class: 'rel', style: { '--rel': t.c } },
          h('a', { class: 'rel-who', href: '#/c/' + o.id }, avatar(o, 40), h('b', null, o.name)),
          h('div', { class: 'rel-fields' },
            h('div', { class: 'rel-line' }, selectEl(REL_TYPES.map(x => ({ v: x.k, n: x.n })), r.type, v => { r.type = v; save(); draw(); }, 'rel-type'),
              h('span', { class: 'muted' }, `${o.name} is ${c.name}’s`), bindInput(r.roles, o.id, { ph: 'e.g. older sister', onInput: () => save() })),
            h('div', { class: 'rel-line' }, h('span', { class: 'muted' }, `${c.name} is ${o.name}’s`), bindInput(r.roles, c.id, { ph: 'e.g. little brother', onInput: () => save() })),
            bindInput(r, 'note', { ph: 'History, tension, what’s unsaid…', cls: 'rel-note', onInput: () => save() })),
          h('button', {
            class: 'icon-btn', title: 'Remove relationship', onclick: async () => {
              if (await confirmBox(`Remove the relationship between ${c.name} and ${o.name}?`, 'Remove')) { W.relationships = W.relationships.filter(x => x !== r); save(); draw(); }
            },
          }, '✕'));
      })) : h('p', { class: 'muted' }, 'No relationships yet.'),
      h('div', { class: 'rel-add row wrap' }, h('span', { class: 'muted' }, 'Connect to'), pickSel, h('span', { class: 'muted' }, 'as'),
        selectEl(REL_TYPES.map(x => ({ v: x.k, n: x.n })), type, v => type = v),
        btn('＋ Add', () => {
          if (!pick) return toast('Choose a character first');
          W.relationships.push({ id: uid(), a: c.id, b: pick, type, roles: {}, note: '' }); touch(c); save(); draw();
        }, 'primary mini')));
  };
  draw(); return wrap;
}

function editLocation(l) {
  const { q } = route();
  const node = h('div', { class: 'article edit' }, editHead(l),
    editSection('Infobox', h('div', { class: 'edit-top' }, coverEdit(l), h('div', { class: 'edit-grid' },
      field('Name', bindInput(l, 'name', { cls: 'name-input', onInput: () => { document.title = 'Editing ' + l.name; } }), 'span-2'),
      field('Also known as', bindInput(l, 'aliases', { ph: 'Other names — separate with commas' }), 'span-2'),
      field('Type', bindInput(l, 'type', { ph: 'City, tavern…', list: 'loc-types' })),
      field('Inside', locSelect(l.parentId, v => { l.parentId = v; touch(l); save(); rerender(); }, { placeholder: '— top level —', exclude: descendants(l.id) })),
      field('Population', bindInput(l, 'population')),
      field('Ruled / run by', bindInput(l, 'ruler')),
      h('datalist', { id: 'loc-types' }, LOC_TYPES.map(t => h('option', { value: t })))))),
    editSection('Opening paragraph', field('', bindText(l, 'summary', { ph: `${l.name} is a harbour city on the coast of [[Varenhold]]…`, rows: 3 }), '',
      'Shown at the top of the article. Start with the place’s name and it’ll appear in bold.'), 'edit-summary'),
    editSection('Related places', placesEditor(l, PLACE_TITLES_L), 'edit-places'),
    editSection('Places inside', h('div', { class: 'chips' },
      W.locations.filter(x => x.parentId === l.id).sort(byName).map(k => locChip(k.id)),
      btn('＋ Add a place inside', async () => { const n = await ask(`New place inside ${l.name}`, 'Name'); if (n) { newLocation(n, { parentId: l.id }); rerender(); } }, 'mini'))),
    editSection('Extra infobox rows', factsEditor(l), 'edit-facts'),
    editSection('Article sections', h('div', { class: 'edit-grid' },
      LOC_TEXT.map(([k, , label, big]) => h('div', { class: 'span-2', dataset: { f: k } }, field(label, bindText(l, k, { rows: big ? 5 : 3 })))))),
    editSection('Your own sections', sectionsEditor(l), 'edit-sec'),
    editSection('Images', galleryEdit(l), 'edit-photos'),
    editSection('Categories', tagEditor(l)),
    editFooter(l, async () => {
      if (await confirmBox(`Delete the page “${l.name}”? Characters who lived or went here will be unlinked; places inside it move up a level.`)) { deleteLocation(l); location.hash = '#/locations'; }
    }));
  scrollToQ(node, q);
  return node;
}

/* Personal details editor: one fold-out group per category */
const openInfoGroups = new Set(['identity', 'physical']);
function personalEditor(c) {
  c.info ||= {};
  return h('div', { class: 'pinfo' }, PERSONAL.map(grp => {
    const count = h('span', { class: 'pinfo-count' });
    const recount = () => { const n = grp.rows.filter(([k]) => infoVal(c, k)).length; count.textContent = n ? `${n} of ${grp.rows.length} filled` : ''; };
    recount();
    const det = h('details', { class: 'pinfo-group', open: openInfoGroups.has(grp.g) },
      h('summary', null, h('b', null, grp.n), count),
      h('div', { class: 'edit-grid pinfo-grid' }, grp.rows.map(([k, label, ph, opts]) => {
        const listId = opts ? 'pi-' + k : null;
        const input = h('input', {
          value: c.info[k] || '', placeholder: ph || '', list: listId,
          oninput: ev => { c.info[k] = ev.target.value; touch(c); save(); recount(); hint.textContent = unitHint(k, ev.target.value); },
        });
        const unitHint = (key, v) => { const u = withUnits(key, v); return u && u !== v ? '→ ' + u : ''; };
        const hint = h('span', { class: 'field-hint' }, unitHint(k, c.info[k]));
        return field(label, [input, opts ? h('datalist', { id: listId }, opts.map(o => h('option', { value: o }))) : null], '', null, hint);
      })));
    det.addEventListener('toggle', () => det.open ? openInfoGroups.add(grp.g) : openInfoGroups.delete(grp.g));
    return det;
  }),
  h('p', { class: 'field-hint' }, 'Only filled-in details appear on the article. Key ones (gender, height, eyes, vehicle…) also go in the infobox. For anything not listed, use “Extra infobox rows” below.'));
}
/* The short list that belongs in the infobox */
function personalInfoboxRows(c) {
  const rows = [];
  for (const grp of PERSONAL) for (const [k, label, , , inBox] of grp.rows) {
    const v = infoVal(c, k);
    if (inBox && v) rows.push([label, inline(withUnits(k, v))]);
  }
  const plate = [infoVal(c, 'vehicleYear'), infoVal(c, 'vehicleColor')].filter(Boolean).join(' ');
  const veh = rows.find(r => r[0] === 'Vehicle');
  if (veh && plate) veh[1] = [plate + ' ', veh[1]];
  return rows;
}
/* The full record, as an article section with one table per group */
function personalSection(c) {
  const groups = PERSONAL.map(grp => ({ grp, rows: grp.rows.filter(([k]) => infoVal(c, k)) })).filter(x => x.rows.length);
  if (!groups.length) return null;
  return {
    title: 'Personal details', editQ: '?f=personal', node: h('div', { class: 'pinfo-read' }, groups.map(({ grp, rows }) => h('table', { class: 'wikitable pinfo-table' },
      h('caption', null, grp.n),
      h('tbody', null, rows.map(([k, label]) => h('tr', null, h('th', { scope: 'row' }, label), h('td', null, inline(withUnits(k, infoVal(c, k))))))))))
  };
}

/* Extra infobox rows: any label/value pairs you like */
function factsEditor(e) {
  const wrap = h('div');
  const draw = () => fill(wrap,
    e.facts.length ? h('div', { class: 'facts-edit' }, e.facts.map((f, i) => h('div', { class: 'fact-row' },
      h('input', { class: 'fact-label', placeholder: 'Label (e.g. Hand)', value: f.label || '', oninput: ev => { f.label = ev.target.value; touch(e); save(); } }),
      h('input', { placeholder: 'Value — [[links]] work here', value: f.value || '', oninput: ev => { f.value = ev.target.value; touch(e); save(); } }),
      h('span', { class: 'row-tools' },
        btn('↑', () => { if (i) { e.facts.splice(i - 1, 0, ...e.facts.splice(i, 1)); touch(e); save(); draw(); } }, 'mini', 'Move up'),
        btn('✕', () => { e.facts.splice(i, 1); touch(e); save(); draw(); }, 'mini', 'Remove row'))))) : null,
    h('div', { class: 'row' }, btn('＋ Add a row', () => { e.facts.push({ label: '', value: '' }); touch(e); save(); draw(); $$('.fact-label', wrap).pop()?.focus(); }, 'mini'),
      h('span', { class: 'field-hint' }, 'Shown in the infobox — handwriting, vehicle, faith, anything.')));
  draw(); return wrap;
}
/* Your own article sections: heading + text, reorderable */
function sectionsEditor(e) {
  const wrap = h('div');
  const draw = () => {
    fill(wrap,
      e.sections.map((x, i) => h('div', { class: 'sec-edit', dataset: { f: 'sec' + i } },
        h('div', { class: 'row' },
          h('input', { class: 'sec-title', placeholder: 'Section heading', value: x.title || '', oninput: ev => { x.title = ev.target.value; touch(e); save(); } }),
          btn('↑', () => { if (i) { e.sections.splice(i - 1, 0, ...e.sections.splice(i, 1)); touch(e); save(); draw(); } }, 'mini', 'Move up'),
          btn('↓', () => { if (i < e.sections.length - 1) { e.sections.splice(i + 1, 0, ...e.sections.splice(i, 1)); touch(e); save(); draw(); } }, 'mini', 'Move down'),
          btn('✕', async () => { if (!(x.text || '').trim() || await confirmBox(`Remove the section “${x.title || 'Untitled'}”?`, 'Remove')) { e.sections.splice(i, 1); touch(e); save(); draw(); } }, 'mini', 'Remove section')),
        bindText(x, 'text', { rows: 4, ph: 'Text… Use == Sub-heading ==, * bullets, and <pre> … </pre> for documents typed exactly.', onInput: () => touch(e) }))),
      h('div', { class: 'row' }, btn('＋ Add a section', () => { e.sections.push({ title: '', text: '' }); touch(e); save(); draw(); $$('.sec-title', wrap).pop()?.focus(); }, 'mini')));
    $$('textarea', wrap).forEach(t => requestAnimationFrame(() => autosize(t)));
  };
  draw(); return wrap;
}

/* ---------- story notes (general articles) ---------- */
function readArticle(a) {
  const rows = factRows(a);
  const info = a.photos.length || rows.length ? infobox(a, rows) : null;
  const auto = [h('b', null, a.name), ' is a page of story notes. ', h('a', { href: pageHref(a, 'edit') }, 'Add something'), '.'];
  return articleShell(a, info, leadPara(a, auto), [...customSections(a), gallerySection(a)]);
}
function editArticle(a) {
  const { q } = route();
  const node = h('div', { class: 'article edit' }, editHead(a),
    editSection('Title', field('', bindInput(a, 'name', { cls: 'name-input', onInput: () => { document.title = 'Editing ' + a.name; } }))),
    editSection('Opening paragraph', field('', bindText(a, 'summary', { rows: 3, ph: 'What this page is about…' })), 'edit-summary'),
    editSection('Sections', sectionsEditor(a), 'edit-sec'),
    editSection('Infobox rows (optional)', factsEditor(a), 'edit-facts'),
    editSection('Images', galleryEdit(a), 'edit-photos'),
    editSection('Categories', tagEditor(a)),
    editFooter(a, async () => { if (await confirmBox(`Delete the page “${a.name}”?`)) { deleteArticle(a); location.hash = '#/articles'; } }));
  scrollToQ(node, q);
  return node;
}
function viewArticleList() {
  const groups = new Map();
  for (const a of W.articles.slice().sort(byName)) {
    const g = a.tags[0] || 'Other';
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g).push(a);
  }
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, 'Story notes'),
    h('div', { class: 'siteSub' }, `From ${W.name || 'My World'}, the story encyclopedia`),
    h('p', null, 'Pages about the book itself: rules, structure, plans, production. Grouped by their first category.'),
    h('div', { class: 'row' }, btn('＋ Create a page', createArticle, 'primary')),
    W.articles.length ? [...groups].map(([g, list]) => [h('h2', null, g),
      h('ul', null, list.map(a => h('li', null, entityLink(a), a.summary ? h('span', { class: 'muted' }, ' — ' + stripWiki(firstLine(a.summary, 110))) : null)))])
      : h('p', { class: 'muted' }, 'None yet.'));
}

/* ======================================================================
   Special pages
   ====================================================================== */
function mpBox(title, body, color) {
  return h('div', { class: 'mp-box ' + color }, h('h2', { class: 'mp-h2' }, title), h('div', { class: 'mp-body' }, body));
}
function viewMainPage() {
  const total = W.characters.length + W.locations.length;
  const welcome = h('div', { class: 'mp-welcome' },
    h('div', { class: 'mp-welcome-title' }, 'Welcome to ', h('a', { href: '#/settings' }, W.name || 'My World'), ','),
    h('div', null, 'the story encyclopedia that only you can edit.'),
    h('div', { class: 'mp-count' }, h('a', { href: '#/characters' }, plural(W.characters.length, 'character')), ' and ',
      h('a', { href: '#/locations' }, plural(W.locations.length, 'location')), ' and ', h('a', { href: '#/articles' }, plural(W.articles.length, 'page') + ' of story notes')));
  if (!total) {
    return h('div', { class: 'mainpage' }, welcome,
      mpBox('Getting started', h('div', null,
        h('p', null, 'Every character gets an article with an infobox, where they live and where they go, their relationships, and a dropdown for each month from ', h('b', null, 'March to February'), '. Locations nest inside each other, so a tavern can sit in a city, in a kingdom.'),
        h('p', null, 'Use the ', h('b', null, 'Edit'), ' tab on any page to change it, and type ', h('code', null, '[[Name]]'), ' to link to another page. Red links are pages that don’t exist yet — click one to create it.'),
        h('div', { class: 'row' }, btn('Create a character', createCharacter, 'primary'), btn('Create a location', createLocation))), 'green'));
  }
  // Featured article: prefer a page with a picture and some text
  const pool = W.characters.filter(e => e.photos.length && (e.summary || '').trim());
  const pool2 = W.characters.filter(e => (e.summary || '').trim());
  const featPool = pool.length ? pool : pool2.length ? pool2 : allPages();
  const feat = featPool[Math.floor(Date.now() / 864e5) % featPool.length];
  const featured = h('div', null,
    feat.photos[0] ? h('img', { class: 'mp-thumb', src: photoSrc(feat.photos[0]), alt: '' }) : null,
    h('p', null, leadPara(feat, [h('b', null, entityLink(feat)), ' — ', describe(feat), '.']),
      ' (', h('a', { href: pageHref(feat) }, 'Full article…'), ')'),
    h('div', { class: 'mp-more' }, 'Recently edited: ', joinNodes(allPages().sort((a, b) => (b.updated || 0) - (a.updated || 0)).slice(0, 5).map(e => entityLink(e)), ' · ')));

  // Did you know…
  const facts = [];
  for (const r of W.relationships) {
    const a = charById(r.a), b = charById(r.b); if (!a || !b) continue;
    if (r.roles[b.id]) facts.push(['… that ', entityLink(b), ' is ', entityLink(a), '’s ', r.roles[b.id], '?']);
    else if (r.roles[a.id]) facts.push(['… that ', entityLink(a), ' is ', entityLink(b), '’s ', r.roles[a.id], '?']);
    else facts.push(['… that ', entityLink(a), ' and ', entityLink(b), ` are ${REL_PLURAL[r.type] || 'connected'}?`]);
  }
  for (const c of W.characters) {
    if (c.homeId && locById(c.homeId)) facts.push(['… that ', entityLink(c), ' lives in ', entityLink(locById(c.homeId)), '?']);
    const trip = MONTHS.find(m => c.months[m.k].base && c.months[m.k].base !== c.homeId);
    if (trip) facts.push(['… that ', entityLink(c), ' spends ', trip.n, ' in ', entityLink(locById(c.months[trip.k].base)), '?']);
  }
  for (const l of W.locations) if (locById(l.parentId) && l.type) facts.push(['… that ', entityLink(l), ` is ${/^[aeiou]/i.test(l.type) ? 'an' : 'a'} ${l.type.toLowerCase()} in `, entityLink(locById(l.parentId)), '?']);
  const dyk = facts.sort(() => Math.random() - .5).slice(0, 5);

  // This month in the story
  const realMonth = MONTHS[(new Date().getMonth() + 10) % 12].k;
  const monthBox = h('div');
  const drawMonth = mk => {
    const m = MONTHS.find(x => x.k === mk);
    const happenings = W.characters.filter(c => c.months[mk].events.trim()).sort(byName);
    const places = new Map();
    for (const c of W.characters) { const w = whereIs(c, mk); if (w.base) { if (!places.has(w.base)) places.set(w.base, []); places.get(w.base).push(c); } }
    fill(monthBox,
      h('div', { class: 'row' }, h('span', null, 'Show:'), selectEl(MONTHS.map(x => ({ v: x.k, n: x.n })), mk, drawMonth, 'auto-w')),
      happenings.length ? h('ul', null, happenings.map(c => h('li', null, h('b', null, entityLink(c)), ': ', inline(firstLine(c.months[mk].events, 160)), ' ', h('a', { href: pageHref(c) + '?m=' + mk, class: 'muted' }, '→')))) : h('p', { class: 'muted' }, `Nothing written for ${m.n} yet.`),
      places.size ? h('p', { class: 'mp-more' }, h('b', null, 'Where everyone is: '), joinNodes([...places].map(([id, cs]) => [entityLink(locById(id)), ` (${cs.length})`]), ' · ')) : null);
  };
  drawMonth(realMonth);

  return h('div', { class: 'mainpage' }, welcome,
    h('div', { class: 'mp-cols' },
      h('div', { class: 'mp-left' },
        mpBox('From today’s featured article', featured, 'green'),
        mpBox('This month in the story', monthBox, 'green')),
      h('div', { class: 'mp-right' },
        mpBox('Did you know…', dyk.length ? h('ul', null, dyk.map(f => h('li', null, f))) : h('p', { class: 'muted' }, 'Add homes and relationships and facts will appear here.'), 'blue'),
        mpBox('Other areas', h('ul', null,
          h('li', null, h('a', { href: '#/timeline' }, 'The Year'), ' — everyone’s whereabouts, month by month'),
          h('li', null, h('a', { href: '#/web' }, 'Relationship web'), ' — who knows whom'),
          h('li', null, h('a', { href: '#/articles' }, 'Story notes'), ' — ', plural(W.articles.length, 'page'), ' about the book itself'),
          h('li', null, h('a', { href: '#/categories' }, 'Categories'), ' — ', plural(allTags().length, 'category', 'categories')),
          h('li', null, h('a', { href: 'javascript:void 0', onclick: randomPage }, 'Random article'), ' — for when you’re stuck')), 'blue'))));
}

/* A sortable Wikipedia-style table */
function wikitable(cols, rows, sortState) {
  const table = h('table', { class: 'wikitable sortable' });
  const draw = () => {
    const col = cols[sortState.col] || cols[0];
    const sorted = rows.slice().sort((a, b) => {
      const x = col.sort(a), y = col.sort(b);
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y), undefined, { sensitivity: 'base', numeric: true });
      return sortState.dir * r;
    });
    fill(table,
      h('thead', null, h('tr', null, cols.map((c, i) => h('th', {
        class: c.sort ? 'sort' + (i === sortState.col ? (sortState.dir > 0 ? ' asc' : ' desc') : '') : '',
        onclick: c.sort ? () => { sortState.dir = sortState.col === i ? -sortState.dir : 1; sortState.col = i; draw(); } : null,
      }, c.label)))),
      h('tbody', null, sorted.map(r => h('tr', null, cols.map(c => h('td', { class: c.cls }, c.cell(r)))))));
  };
  draw(); return table;
}
const listSort = { c: { col: 1, dir: 1 }, l: { col: 1, dir: 1 } };
function viewList(k) {
  const isC = k === 'c';
  const list = isC ? W.characters : W.locations;
  const catLinks = e => joinNodes(e.tags.map(t => h('a', { href: '#/category/' + encodeURIComponent(t) }, t)));
  const cols = isC ? [
    { label: '', cell: e => h('a', { href: pageHref(e) }, avatar(e, 44)), cls: 'img' },
    { label: 'Name', sort: e => e.name, cell: e => [h('b', null, entityLink(e)), e.aliases ? h('div', { class: 'muted small' }, e.aliases) : null] },
    { label: 'Occupation', sort: e => e.occupation || '', cell: e => e.occupation || '' },
    { label: 'Residence', sort: e => locName(e.homeId), cell: e => e.homeId ? entityLink(locById(e.homeId)) : '' },
    { label: 'Status', sort: e => e.status || '', cell: e => e.status || '' },
    { label: 'Age', sort: e => parseFloat(e.age) || 0, cell: e => e.age || '' },
    { label: 'Categories', cell: catLinks },
    { label: 'Last edited', sort: e => -(e.updated || 0), cell: e => h('span', { class: 'muted small' }, ago(e.updated)) },
  ] : [
    { label: '', cell: e => h('a', { href: pageHref(e) }, avatar(e, 44, true)), cls: 'img' },
    { label: 'Name', sort: e => e.name, cell: e => h('b', null, entityLink(e)) },
    { label: 'Type', sort: e => e.type || '', cell: e => e.type || '' },
    { label: 'Part of', sort: e => locName(e.parentId), cell: e => e.parentId ? placeWithParents(e.parentId) : '' },
    { label: 'Residents', sort: e => W.characters.filter(c => descendants(e.id).has(c.homeId)).length, cell: e => W.characters.filter(c => descendants(e.id).has(c.homeId)).length || '' },
    { label: 'Categories', cell: catLinks },
    { label: 'Last edited', sort: e => -(e.updated || 0), cell: e => h('span', { class: 'muted small' }, ago(e.updated)) },
  ];
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, isC ? 'List of characters' : 'List of locations'),
    h('div', { class: 'siteSub' }, `From ${W.name || 'My World'}, the story encyclopedia`),
    h('p', null, `This is a list of all ${plural(list.length, isC ? 'character' : 'location')} in `, h('i', null, W.name || 'My World'), '. Click a column heading to sort.'),
    h('div', { class: 'row' }, btn(isC ? '＋ Create a character' : '＋ Create a location', isC ? createCharacter : createLocation, 'primary'),
      !isC && W.locations.length ? h('span', { class: 'muted small' }, 'Tip: set “Inside” on a location’s edit page to nest it.') : null),
    list.length ? wikitable(cols, list, listSort[k]) : h('p', { class: 'muted' }, 'None yet.'));
}

function viewSearch(q) {
  const ql = q.toLowerCase();
  const fields = e => [e.name, e.aliases, e.summary, e.occupation, e.type, e.talk, ...e.sections.flatMap(x => [x.title, x.text]), ...e.facts.map(f => f.value), ...(e.places || []).map(p => `${p.label} ${p.name}`), ...Object.values(e.info || {}), ...CHAR_TEXT.map(([k]) => e[k]), ...LOC_TEXT.map(([k]) => e[k]),
    ...(e.months ? MONTHS.flatMap(m => [e.months[m.k].events, e.months[m.k].notes]) : []), ...e.tags].filter(Boolean).map(stripWiki);
  const hits = ql ? allPages().map(e => {
    const f = fields(e); const text = f.find(t => t.toLowerCase().includes(ql));
    return text ? { e, text, titleHit: (e.name || '').toLowerCase().includes(ql) } : null;
  }).filter(Boolean).sort((a, b) => (b.titleHit - a.titleHit) || byName(a.e, b.e)) : [];
  const snippet = t => {
    const i = t.toLowerCase().indexOf(ql), s = Math.max(0, i - 60);
    return [s ? '…' : '', t.slice(s, i), h('span', { class: 'searchmatch' }, t.slice(i, i + q.length)), t.slice(i + q.length, i + q.length + 100), '…'];
  };
  const exact = findPage(q);
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, 'Search results'),
    q && !exact ? h('p', { class: 'mw-search-createlink' }, 'Create the page “', h('a', { class: 'new', href: '#', onclick: ev => { ev.preventDefault(); createFromRedLink(q); } }, q), '” in ', W.name || 'My World', '.') : null,
    h('p', { class: 'muted' }, hits.length ? `${plural(hits.length, 'result')} for “${q}”` : `There were no results matching “${q}”.`),
    h('ul', { class: 'search-results' }, hits.map(({ e, text }) => h('li', null,
      h('div', { class: 'sr-head' }, avatar(e, 40, kindOf(e) !== 'c'), h('div', null, h('a', { href: pageHref(e), class: 'sr-title' }, e.name), h('div', { class: 'sr-text' }, snippet(text)),
        h('div', { class: 'muted small' }, describe(e), ' · edited ', ago(e.updated))))))));
}

function viewCategories() {
  const tags = allTags();
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, 'Categories'),
    h('p', null, 'Categories group pages together. Add them at the bottom of any edit page.'),
    tags.length ? h('ul', { class: 'cat-cols' }, tags.map(t => {
      const n = allPages().filter(e => e.tags.includes(t)).length;
      return h('li', null, h('a', { href: '#/category/' + encodeURIComponent(t) }, t), h('span', { class: 'muted' }, ` (${plural(n, 'member')})`));
    })) : h('p', { class: 'muted' }, 'No categories yet.'));
}
function viewCategory(tag) {
  const chars = W.characters.filter(c => c.tags.includes(tag)).sort(byName);
  const locs = W.locations.filter(l => l.tags.includes(tag)).sort(byName);
  const arts = W.articles.filter(l => l.tags.includes(tag)).sort(byName);
  const alpha = list => {
    const groups = new Map();
    for (const e of list) { const L = (e.name || '?')[0].toUpperCase(); if (!groups.has(L)) groups.set(L, []); groups.get(L).push(e); }
    return h('div', { class: 'cat-cols' }, [...groups].map(([L, es]) => h('div', { class: 'cat-group' }, h('h3', null, L), h('ul', null, es.map(e => h('li', null, entityLink(e)))))));
  };
  return h('div', { class: 'article' },
    h('h1', { class: 'firstHeading' }, 'Category:' + tag),
    h('div', { class: 'siteSub' }, `From ${W.name || 'My World'}, the story encyclopedia`),
    chars.length ? [h('h2', null, `Characters in category “${tag}”`), h('p', { class: 'muted' }, `The following ${plural(chars.length, 'page is', 'pages are')} in this category.`), alpha(chars)] : null,
    locs.length ? [h('h2', null, `Locations in category “${tag}”`), alpha(locs)] : null,
    arts.length ? [h('h2', null, `Story notes in category “${tag}”`), alpha(arts)] : null,
    !chars.length && !locs.length && !arts.length ? h('p', { class: 'muted' }, 'This category is empty.') : null,
    h('div', { class: 'catlinks' }, h('a', { href: '#/categories' }, 'All categories')));
}

/* ---------- the year (timeline) ---------- */
const tlState = { mode: 'people', q: '', tag: '' };
function viewTimeline() {
  const st = tlState;
  const holder = h('div', { class: 'tl-holder' });
  const draw = () => fill(holder, st.mode === 'people' ? tlPeople() : tlPlaces());
  const tlPeople = () => {
    const list = W.characters.filter(c => (!st.q || searchMatches(st.q, 999).includes(c)) && (!st.tag || c.tags.includes(st.tag))).sort(byName);
    if (!list.length) return h('p', { class: 'muted' }, 'No characters to show.');
    return h('div', { class: 'tl-scroll' }, h('table', { class: 'wikitable tl' },
      h('thead', null, h('tr', null, h('th', { class: 'tl-name' }, 'Character'), MONTHS.map(m => h('th', null, m.s)))),
      h('tbody', null, list.map(c => h('tr', null,
        h('th', { class: 'tl-name' }, h('a', { href: '#/c/' + c.id }, avatar(c, 24), h('span', null, c.name))),
        MONTHS.map(m => {
          const w = whereIs(c, m.k); const e = c.months[m.k];
          const tip = [`${c.name} · ${m.n}`, w.base ? (w.implied ? 'At home: ' : 'Based at: ') + locName(w.base) : 'Whereabouts unknown',
            w.visits.length ? 'Travels to: ' + w.visits.map(locName).join(', ') : '', stripWiki(e.events.trim())].filter(Boolean).join('\n');
          return h('td', { class: 'tl-cell' + (w.implied ? ' implied' : '') + (w.base ? '' : ' none'), style: w.base ? locStyle(w.base) : null, title: tip, onclick: () => location.hash = `#/c/${c.id}?m=${m.k}` },
            h('span', { class: 'tl-loc' }, w.base ? locName(w.base) : '—'),
            w.visits.length ? h('span', { class: 'tl-visits' }, '✈' + (w.visits.length > 1 ? w.visits.length : '')) : null,
            e.events.trim() ? h('span', { class: 'tl-ev' }, '✎') : null);
        }))))));
  };
  const tlPlaces = () => {
    const rows = locTree().map(({ l, depth }) => ({ l, depth, cols: MONTHS.map(m => presentAt(l.id, m.k, false)) }))
      .filter(r => r.cols.some(x => x.length));
    if (!rows.length) return h('p', { class: 'muted' }, 'Nobody is anywhere yet — give characters a home or plan their months.');
    return h('div', { class: 'tl-scroll' }, h('table', { class: 'wikitable tl places' },
      h('thead', null, h('tr', null, h('th', { class: 'tl-name' }, 'Place'), MONTHS.map(m => h('th', null, m.s)))),
      h('tbody', null, rows.map(r => h('tr', null,
        h('th', { class: 'tl-name', style: { paddingLeft: (8 + r.depth * 12) + 'px' } }, h('a', { href: '#/l/' + r.l.id }, h('span', { class: 'dot', style: locStyle(r.l.id) }), h('span', null, r.l.name))),
        r.cols.map((ps, i) => h('td', { class: 'tl-people' }, ps.map(x => h('a', { class: 'tl-av ' + x.how, href: `#/c/${x.c.id}?m=${MONTHS[i].k}`, title: `${x.c.name} (${x.how === 'visit' ? 'visiting' : x.how === 'home' ? 'at home' : 'based here'})` }, avatar(x.c, 24))))))))));
  };
  draw();
  const tags = allTags();
  return h('div', { class: 'article wide' },
    h('h1', { class: 'firstHeading' }, 'The Year'),
    h('p', null, 'Where everyone is from March through February. Striped cells mean “at home” (no place set for that month). Click any cell to open that month on the character’s page.'),
    h('div', { class: 'toolbar' },
      h('div', { class: 'seg' },
        h('button', { class: st.mode === 'people' ? 'on' : '', onclick: ev => { st.mode = 'people'; segOn(ev); draw(); } }, 'By character'),
        h('button', { class: st.mode === 'places' ? 'on' : '', onclick: ev => { st.mode = 'places'; segOn(ev); draw(); } }, 'By place')),
      h('input', { type: 'search', placeholder: 'Filter characters…', value: st.q, oninput: ev => { st.q = ev.target.value; draw(); } }),
      tags.length ? selectEl([{ v: '', n: 'All categories' }, ...tags], st.tag, v => { st.tag = v; draw(); }) : null,
      h('span', { class: 'legend muted' }, h('span', null, '✈ travels'), h('span', null, '✎ events written'))),
    holder);
}
function segOn(ev) { $$('button', ev.target.parentElement).forEach(b => b.classList.toggle('on', b === ev.target)); }

/* ---------- settings ---------- */
function viewSettings() {
  const fileIn = h('input', {
    type: 'file', accept: '.json,application/json', hidden: true, onchange: async () => {
      const f = fileIn.files[0]; if (!f) return;
      try {
        const data = JSON.parse(await f.text());
        if (!Array.isArray(data.characters)) throw new Error('That file isn’t a Worldbuilder world.');
        if (!await confirmBox('Replace your current world with this file? (A backup of the current one is kept in data/backups.)', 'Replace')) return;
        W = normalize(data); save(); await flush(); toast('World imported'); render();
      } catch (e) { toast(e.message, 'err'); }
    },
  });
  const dataDir = h('code', null, '…');
  fetch('/api/info').then(r => r.json()).then(j => dataDir.textContent = j.dataDir).catch(() => { });
  const theme = localStorage.getItem('wb-theme') || 'auto';
  return h('div', { class: 'article edit' },
    h('h1', { class: 'firstHeading' }, 'Settings'),
    editSection('World', h('div', { class: 'edit-grid' },
      field('World name', bindInput(W, 'name', { onInput: () => fill($('#logoName'), W.name || 'My World') })),
      field('Year the story starts (March)', bindInput(W, 'startYear', { ph: 'e.g. 2030 — leave blank for no year' })),
      field('Appearance', selectEl([{ v: 'auto', n: 'Match my computer' }, { v: 'light', n: 'Light' }, { v: 'dark', n: 'Dark' }], theme, v => { localStorage.setItem('wb-theme', v); applyTheme(); })),
      field('About this world', bindText(W, 'about', { ph: 'Premise, era, tone, rules of magic…', rows: 4 }), 'span-2'))),
    editSection('Your data', h('div', null,
      h('p', null, 'Everything is saved automatically to ', dataDir, ', images included. Nothing is sent anywhere. A snapshot is kept in ', h('code', null, 'data/backups'), ' every ten minutes while you work.'),
      h('div', { class: 'row wrap' },
        btn('Export world (.json)', () => {
          const a = h('a', { href: URL.createObjectURL(new Blob([JSON.stringify(W, null, 1)], { type: 'application/json' })), download: (W.name || 'world').replace(/[^\w -]+/g, '') + '.json' });
          a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
        }),
        btn('Import world…', () => fileIn.click()), fileIn,
        btn('Tidy unused images', async () => {
          await flush();
          const r = await fetch('/api/photos/cleanup', { method: 'POST' }).then(r => r.json());
          toast(r.moved ? `Moved ${plural(r.moved, 'unused image')} to data/photos/.trash` : 'No unused images');
        })))),
    editSection('Shortcuts', h('ul', null,
      h('li', null, h('kbd', null, '/'), ' jump to the search box'),
      h('li', null, h('kbd', null, 'Ctrl'), '+', h('kbd', null, 'V'), ' on a page pastes an image into it'),
      h('li', null, 'Drag image files onto an edit page’s image area to add them'))));
}

/* ---------- theme, boot ---------- */
function applyTheme() {
  const t = localStorage.getItem('wb-theme') || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.dataset.theme = t;
}

async function init() {
  applyTheme();
  try {
    const r = await fetch('/api/world');
    W = normalize(await r.json());
    S.rev = W.rev;
    setSaveState('All changes saved', 'ok');
  } catch {
    W = normalize({});
    setSaveState('Not connected — start the app with Start Worldbuilder.bat', 'err');
  }
  window.addEventListener('hashchange', () => render());
  setupSearch();
  $('#randomLink').onclick = ev => { ev.preventDefault(); randomPage(); };
  $('#newChar').onclick = ev => { ev.preventDefault(); createCharacter(); };
  $('#newLoc').onclick = ev => { ev.preventDefault(); createLocation(); };
  $('#newArt').onclick = ev => { ev.preventDefault(); createArticle(); };
  $('#openNav').onclick = () => document.body.classList.toggle('nav-open');
  document.addEventListener('keydown', ev => {
    if (ev.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { ev.preventDefault(); $('#search').focus(); }
    if ((ev.ctrlKey || ev.metaKey) && ev.key === 's') { ev.preventDefault(); flush(); }
  });
  document.addEventListener('paste', ev => {
    const { parts } = route();
    const e = parts[0] === 'c' ? charById(parts[1]) : parts[0] === 'l' ? locById(parts[1]) : null;
    const files = [...(ev.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
    if (e && files.length) { ev.preventDefault(); addFiles(e, files); }
  });
  render();
}
window.addEventListener('DOMContentLoaded', init);
