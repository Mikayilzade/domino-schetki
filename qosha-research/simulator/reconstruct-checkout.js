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
// Resolve one immutable HEAD commit and its complete recursive tree at run time.
// Do not reuse the obsolete 398-file snapshot for a modern checkout.
let PIN;
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
function rejectSymlinkComponents(dest) {
  // existsSync() follows links and returns false for dangling symlinks.
  // lstatSync() detects both dangling and resolvable links; ENOENT is
  // acceptable only when a component has not been created yet.
  function rejectLink(component) {
    try {
      if (fs.lstatSync(component).isSymbolicLink()) throw new Error('Symlink in reconstruction path: ' + component);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  for (let cur = RESEARCH; ; cur = path.dirname(cur)) {
    rejectLink(cur);
    if (cur === ROOT) break;
  }
  let cur = RESEARCH;
  for (const part of path.relative(RESEARCH, dest).split(path.sep)) {
    cur = path.join(cur, part);
    rejectLink(cur);
  }
}
async function githubJSON(url) {
  const headers = {'Accept':'application/vnd.github+json','User-Agent':'qosha-research-reconstruction','X-GitHub-Api-Version':'2022-11-28'};
  if (token) headers.Authorization = 'Bearer ' + token;
  const response = await fetch(url, {headers});
  if (!response.ok) throw new Error('GitHub HTTP ' + response.status + ': ' + url);
  return response.json();
}
async function getPinnedInventory() {
  const base='https://api.github.com/repos/'+OWNER+'/'+REPO;
  const branch=await githubJSON(base+'/commits/HEAD');
  PIN=branch.sha;
  if (!/^[a-f0-9]{40}$/.test(PIN)) throw new Error('Invalid HEAD SHA');
  const tree=await githubJSON(base+'/git/trees/'+PIN+'?recursive=1');
  if (tree.truncated || !Array.isArray(tree.tree)) throw new Error('Incomplete GitHub tree');
  const prefix='qosha-research/simulator/';
  const requiredContracts=['README.md','RULES.md','EXPERIMENTS.md','RESULTS.md','STATUS.md'];
  // Include nested fixtures/, runs/, and other research-only files, not just\n  // simulator/ and root contracts. Recursive Git trees include directory\n  // entries. They are not files to
  // download, but must be checked for unexpected types/modes separately.
  const inScope = row => row.path.startsWith('qosha-research/');
  const scopedAll=tree.tree.filter(inScope);
  for (const row of scopedAll) {
    if (row.type === 'tree' && row.mode === '040000') continue;
    if (row.type === 'blob' && ['100644','100755'].includes(row.mode)) continue;
    throw new Error('Unsafe entry in pinned research tree: ' + row.path);
  }
  const scoped=scopedAll.filter(row=>row.type==='blob');
  // GitHub represents symlinks as blobs with mode 120000. Never reconstruct
  // those as ordinary files: the checkout must reject unsafe source trees.
  for (const row of scoped) {
    if (row.type !== 'blob' || !['100644','100755'].includes(row.mode))
      throw new Error('Nonregular or symlink entry in pinned research tree: ' + row.path);
  }
  const files=scoped;
  const simulatorCount=files.filter(row=>row.path.startsWith(prefix)).length;
  if (simulatorCount<415) throw new Error('Unexpectedly small current simulator tree: '+simulatorCount);
  for(const contract of requiredContracts) if(!files.some(row=>row.path==='qosha-research/'+contract)) throw new Error('Missing pinned contract: '+contract);
  const entries=files.map(row=>{
    const rel=row.path;
    withinResearch(rel);
    if (!/^[a-f0-9]{40}$/.test(row.sha) || !Number.isSafeInteger(row.size))
      throw new Error('Invalid GitHub blob metadata: '+rel);
    return {rel,sha:row.sha,bytes:row.size};
  });
  if (new Set(entries.map(x=>x.rel)).size!==entries.length) throw new Error('Duplicate paths in GitHub tree');
  return entries;
}
async function download(rel, expected, bytes) {
  const dest = withinResearch(rel);
  rejectSymlinkComponents(dest);
  if (fs.existsSync(dest)) {
    if (!fs.statSync(dest).isFile()) throw new Error('Not a regular file: ' + rel);
    const existing = fs.readFileSync(dest);
    if (existing.length === bytes && sha1GitBlob(existing) === expected) return 'verified';
    throw new Error('Existing file differs from pinned commit; refusing overwrite: ' + rel);
  }
  // Raw CDN downloads do not consume GitHub REST API's per-hour request quota.
  // The immutable commit SHA plus the Git blob hash/byte count below preserve
  // exact source identity even if the CDN response is stale or corrupted.
  const url = 'https://raw.githubusercontent.com/' + OWNER + '/' + REPO + '/' + PIN + '/' + rel.split('/').map(encodeURIComponent).join('/');
  const res = await fetch(url, {headers:{'User-Agent':'qosha-research-reconstruction'}});
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + rel);
  const data = Buffer.from(await res.arrayBuffer());
  if (data.length !== bytes || sha1GitBlob(data) !== expected) throw new Error('SHA/length mismatch for ' + rel);
  fs.mkdirSync(path.dirname(dest), {recursive:true});
  rejectSymlinkComponents(dest);
  const tmp = dest + '.partial-' + process.pid;
  fs.writeFileSync(tmp, data, {flag:'wx'});
  fs.renameSync(tmp, dest);
  return 'downloaded';
}
async function main() {
  const entries = await getPinnedInventory();
  const contracts = ['README.md','RULES.md','EXPERIMENTS.md','RESULTS.md','STATUS.md'];
  const count = {verified:0, downloaded:0};
  for (const item of entries) {
    const state = await download(item.rel, item.sha, item.bytes);
    count[state]++;
  }
  // All top-level research contracts and historical manifests are downloaded
  // and verified against the same immutable HEAD as the simulator. This includes
  // preflight-required inventory/manifest files absent from a simulator-only copy.
  for (const file of contracts) {
    if (!fs.statSync(path.join(RESEARCH,file), {throwIfNoEntry:false})?.isFile()) throw new Error('Missing contract: '+file);
  }
  process.stdout.write(JSON.stringify({pin:PIN, simulatorFiles:entries.filter(e=>e.rel.startsWith('qosha-research/simulator/')).length, researchRootFiles:entries.filter(e=>!e.rel.startsWith('qosha-research/simulator/')).length, ...count, validationExecuted:false},null,2)+'\n');
  process.stdout.write('Next: node qosha-research/simulator/validation-checkout-preflight.js\n');
}
main().catch(e => {console.error(e.message);process.exitCode=1;});
