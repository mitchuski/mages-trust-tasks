#!/usr/bin/env node
// Validate the mages family with the Trust Tasks TF's own tooling.
//
//   node tools/check.mjs <path-to-pinned-dtgwg-trust-tasks-tf-checkout>
//
// The pinned checkout must have `npm ci` run in it. Our specs use private
// Type URIs (SPEC §6.5) under https://tasks.mages.city/spec/; the TF
// build only knows https://trusttasks.org/spec/, so for validation ONLY the
// family is copied into the checkout with that prefix rewritten (the "$id
// shim"), validated, and removed again. Nothing in this repo is rewritten.
// Never commit the shimmed copy anywhere.
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const repo = resolve(here, '..');
const pin = process.argv[2];
if (!pin || !existsSync(join(pin, 'scripts', 'build-registry.mjs'))) {
  console.error('usage: node tools/check.mjs <pinned dtgwg-trust-tasks-tf checkout with npm ci done>');
  process.exit(2);
}
const PRIVATE = 'https://tasks.mages.city/spec/';
const PUBLIC = 'https://trusttasks.org/spec/';

function walk(d, out = []) {
  for (const n of readdirSync(d)) {
    const p = join(d, n);
    statSync(p).isDirectory() ? walk(p, out) : out.push(p);
  }
  return out;
}

// --- 1. leaf claims: a spec that states "its leaf is `<hex>`" over its first
// request example must be right (presence/thumb). JCS here is enough for
// documents of strings and objects only, which is all the family's examples use.
function jcs(v) {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(jcs).join(',') + ']';
  return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + jcs(v[k])).join(',') + '}';
}
let leafFail = 0, leafOk = 0;
for (const f of walk(join(repo, 'specs')).filter(f => f.endsWith('spec.md'))) {
  const t = readFileSync(f, 'utf8');
  const m = t.match(/its leaf is\s*`([0-9a-f]{64})`[\s\S]*?```json\n([\s\S]*?)```/);
  if (!m) continue;
  const got = createHash('sha256').update(jcs(JSON.parse(m[2]))).digest('hex');
  if (got === m[1]) leafOk++; else { leafFail++; console.log(`LEAF MISMATCH ${f}: states ${m[1]}, example hashes to ${got}`); }
}
console.log(`leaf claims: ${leafOk} ok, ${leafFail} wrong`);

// --- 2. shim copy + TF validate
const dest = join(pin, 'specs', 'mages');
if (existsSync(dest)) rmSync(dest, { recursive: true });
cpSync(join(repo, 'specs', 'mages'), dest, { recursive: true });
for (const f of walk(dest)) {
  const t = readFileSync(f, 'utf8');
  if (t.includes(PRIVATE)) writeFileSync(f, t.split(PRIVATE).join(PUBLIC));
}
const r = spawnSync(process.execPath, ['scripts/build-registry.mjs', '--validate-only'], { cwd: pin, encoding: 'utf8' });
const lines = (r.stdout + r.stderr).split(/\r?\n/);
const ours = lines.filter(l => /mages\//.test(l));
const summary = lines.filter(l => l.trim() && !/mages\//.test(l) && !/^\s+warn: /.test(l)).slice(-3);
console.log(ours.join('\n') || '(no findings name the mages family)');
console.log(summary.join('\n'));
console.log(`TF validate exit ${r.status}`);

// --- 3. ceremonies, with the same shim. Upstream validate-ceremonies.mjs resolves specs from
// import.meta.url's pathname, which breaks on Windows; a patched copy reads specs from the root.
const cdest = join(pin, 'ceremonies', 'mages');
if (existsSync(cdest)) rmSync(cdest, { recursive: true });
cpSync(join(repo, 'ceremonies', 'mages'), cdest, { recursive: true });
for (const f of walk(cdest)) {
  const t = readFileSync(f, 'utf8');
  if (t.includes(PRIVATE)) writeFileSync(f, t.split(PRIVATE).join(PUBLIC));
}
const vsrc = readFileSync(join(pin, 'scripts', 'validate-ceremonies.mjs'), 'utf8')
  .replace(/^const SPECS = .*$/m, "const SPECS = join(ROOT, 'specs');");
const vwin = join(pin, 'scripts', 'validate-ceremonies.mages-check.mjs');
writeFileSync(vwin, vsrc);
const c = spawnSync(process.execPath, [vwin], { cwd: pin, encoding: 'utf8', env: { ...process.env, CEREMONY_ROOT: pin.replace(/\\/g, '/') } });
rmSync(vwin); rmSync(cdest, { recursive: true }); rmSync(dest, { recursive: true });
const clines = (c.stdout + c.stderr).split(/\r?\n/);
console.log(clines.filter(l => /mages/.test(l)).join('\n') || '(no mages ceremony found)');
console.log(clines.filter(l => /^(Validated|FAILED)/.test(l)).join('\n'));
console.log(`TF validate-ceremonies exit ${c.status}`);
process.exit(r.status || c.status || leafFail ? 1 : 0);
