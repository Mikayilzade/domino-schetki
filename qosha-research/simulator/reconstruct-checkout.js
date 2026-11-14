#!/usr/bin/env node
'use strict';
// Recover ONLY the research simulator from a pinned GitHub commit.
// Usage: node qosha-research/simulator/reconstruct-checkout.js
// Requires network access to api.github.com; optional GITHUB_TOKEN for rate limits.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..', '..');
const RESEARCH = path.join(ROOT, 'qosha-research');
const INVENTORY = path.join(RESEARCH, 'simulator-checkout-inventory-2026-11-14.md');
const PIN = 'cdb2a10e50e58314e4af5472838b31e5740db2f9';
const OWNER = 'Mikayilzade', REPO = 'domino-schetki';
const token = process.env.GITHUB_TOKEN;
function sha1GitBlob(data) {
  return crypto.createHash('sha1').update(Buffer.from('blob ' + data.length + '\0')).update(data).digest('hex');
}
function withinResearch(rel) {
  if (!rel.startsWith('qosha-research/') || rel.includes('\\') || rel.split('/').some(x => x === '..' || x === '.' || x === '')) throw new Error('Unsafe path: ' + rel);
  const full = path.resolve(ROOT, rel);
  if (!full.startsWith(RESEARCH + path.sep)) throw new Error('Escaping research folder: ' + rel);
  return full;
}
async function download(rel, expected, bytes) {
  const dest = withinResearch(rel);
  if (fs.existsSync(dest)) {
    if (!fs.statSync(dest).isFile()) throw new Error('Not a regular file: ' + rel);
    const existing = fs.readFileSync(dest);
    if (existing.length === bytes && sha1GitBlob(existing) === expected) return 'verified';
    throw new Error('Existing file differs from pinned commit; refusing overwrite: ' + rel);
  }
  const url = 'https://api.github.com/repos/' + OWNER + '/' + REPO + '/contents/' + rel.split('/').map(encodeURIComponent).join('/') + '?ref=' + PIN;
  const headers = {'Accept':'application/vnd.github.raw+json','User-Agent':'qosha-research-reconstruction','X-GitHub-Api-Version':'2022-11-28'};
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(url, {headers});
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + rel);
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length !== bytes || sha1GitBlob(data) !== expected) throw new Error('SHA/length mismatch for ' + rel);
  fs.mkdirSync(path.dirname(dest), {recursive:true});
  const tmp = dest + '.partial-' + process.pid;
  fs.writeFileSync(tmp, data, {flag:'wx'});
  fs.renameSync(tmp, dest);
  return 'downloaded';
}
async function main() {
  const inventory = fs.readFileSync(INVENTORY, 'utf8');
  if (!inventory.includes(PIN)) throw new Error('Inventory commit does not match pin');
  const entries = [...inventory.matchAll(/^`(qosha-research\/simulator\/[^\x60\r\n]+)` ([a-f0-9]{40}) (\d+)$/gm)]
    .map(m => ({rel:m[1], sha:m[2], bytes:Number(m[3])}));
  if (entries.length !== 387) throw new Error('Expected 387 simulator entries; got ' + entries.length);
  const contracts = ['README.md','RULES.md','EXPERIMENTS.md','RESULTS.md'];
  const count = {verified:0, downloaded:0};
  for (const item of entries) {
    const state = await download(item.rel, item.sha, item.bytes);
    count[state]++;
  }
  // Contract files must be present locally. They are not overwritten because
  // the inventory pins simulator blobs only, not contract blob hashes.
  for (const file of contracts) {
    if (!fs.statSync(path.join(RESEARCH,file), {throwIfNoEntry:false})?.isFile()) throw new Error('Missing contract: '+file);
  }
  process.stdout.write(JSON.stringify({pin:PIN, files:entries.length, ...count, contractsPresent:contracts.length, validationExecuted:false},null,2)+'\n');
  process.stdout.write('Next: node qosha-research/simulator/validation-checkout-preflight.js\n');
}
main().catch(e => {console.error(e.message);process.exitCode=1;});
