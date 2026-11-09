'use strict';
// Research-only executable regression for validation evidence identity.
// Run: node qosha-research/simulator/validation-fingerprint-replay-test.js
// No file writes; does not touch the live PWA.
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const fs = require('node:fs');
const gate = path.join(__dirname, 'validation-gate.js');
// Gate runs checkout preflight (120s spawn timeout) before 17 suites (120s each).
// Reserve the full nested timeout budget plus 60s for startup, hashing and JSON output.
const GATE_TIMEOUT_MS = 120000 + 17 * 120000 + 60000;
function execute() {
  const p = spawnSync(process.execPath, [gate], {
    encoding: 'utf8', timeout: GATE_TIMEOUT_MS, maxBuffer: 32 * 1024 * 1024
  });
  if (p.error) throw p.error;
  let report;
  try { report = JSON.parse(p.stdout); }
  catch { throw new Error('Gate did not emit JSON; exit=' + p.status + '; stderr=' + p.stderr.slice(-1000)); }
  assert.equal(report.schema, 'qosha-validation-gate/v1');
  // Independently verify the reported input manifests against the local checkout.
  // A self-consistent report digest is insufficient if input files were misidentified.
  const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
  // Independent recursive enumeration, not an import from the gate producer.
  // Include nested JS/JSON and reject symlinks rather than following outside inputs.
  function enumerate(dir, prefix='') {
    const found=[];
    for(const name of fs.readdirSync(dir)) {
      const rel=prefix ? prefix+'/'+name : name;
      const full=path.join(dir,name);
      const stat=fs.lstatSync(full);
      assert.equal(stat.isSymbolicLink(),false,'unexpected simulator symlink: '+rel);
      if(stat.isDirectory()) found.push(...enumerate(full,rel));
      else if(stat.isFile() && /\.(js|json)$/.test(name)) found.push(rel);
    }
    return found.sort();
  }
  const sourceNames = enumerate(__dirname);
  const actualSources = Object.fromEntries(sourceNames.map(n =>
    [n, hash(fs.readFileSync(path.join(__dirname,n)))]));
  assert.deepEqual(report.sourceHashes, actualSources, 'source manifest must cover recursive simulator JS/JSON');
  assert.equal(report.sourceManifestSha256, hash(JSON.stringify(actualSources)));
  const contractNames = ['README.md','RULES.md','EXPERIMENTS.md'];
  const actualContracts = Object.fromEntries(contractNames.map(n =>
    [n, hash(fs.readFileSync(path.join(__dirname,'..',n)))]));
  assert.deepEqual(report.contractHashes, actualContracts, 'rules manifest must match checkout');
  assert.equal(report.contractManifestSha256, hash(JSON.stringify(actualContracts)));
  assert.equal(report.suites.length, 17);
  assert.equal(typeof report.preflight?.passed,'boolean','preflight evidence required');
  assert.equal(typeof report.validationFingerprintSha256, 'string');
  assert.match(report.validationFingerprintSha256, /^[0-9a-f]{64}$/);
  // Independently reconstruct the stable evidence fingerprint. Equality across
  // two runs alone would accept a consistently wrong or hard-coded digest.
  const stablePayload = {
    schema:report.schema, engine:report.engine, rules:report.rules,
    seedSet:report.seedSet, strategies:report.strategies,
    sourceManifestSha256:report.sourceManifestSha256,
    contractManifestSha256:report.contractManifestSha256,
    preflight:{passed:report.preflight.passed,exitCode:report.preflight.exitCode,
      signal:report.preflight.signal,spawnErrorCode:report.preflight.spawnError?.code||null,
      summary:report.preflight.summary},
    suites:report.suites.map(({suite,suiteSha256,passed,exitCode,signal,spawnError,summary}) =>
      ({suite,suiteSha256,passed,exitCode,signal,
        spawnErrorCode:spawnError?.code||null,summary}))
  };
  const independentFingerprint = hash(JSON.stringify(stablePayload));
  assert.equal(report.validationFingerprintSha256, independentFingerprint,
    'stable fingerprint must match independently reconstructed evidence');
  const changedEvidence = {...stablePayload, seedSet:stablePayload.seedSet + '/tampered'};
  assert.notEqual(hash(JSON.stringify(changedEvidence)), report.validationFingerprintSha256,
    'changed seed contract must invalidate the stable fingerprint');
  assert.match(report.reportSha256, /^[0-9a-f]{64}$/, 'full report digest must be SHA-256');
  // Verify the producer's digest rather than trusting a self-reported hash.
  // JSON.parse retains the insertion order used by the gate's JSON.stringify.
  const actualDigest = crypto.createHash('sha256')
    .update(JSON.stringify({...report, reportSha256:null})).digest('hex');
  assert.equal(report.reportSha256, actualDigest, 'full report digest must match its payload');
  // A modified outcome must not validate under the original digest.
  const altered = {...report, passed:!report.passed, reportSha256:null};
  assert.notEqual(crypto.createHash('sha256').update(JSON.stringify(altered)).digest('hex'),
    report.reportSha256, 'tampered result must change digest');
  // A failing suite is evidence, not a reason to skip replay comparison.
  assert.equal(p.status, report.passed ? 0 : 1);
  return report;
}
const a = execute(), b = execute();
assert.equal(a.validationFingerprintSha256, b.validationFingerprintSha256,
  'unchanged source and suite outcomes must have identical evidence identity');
assert.equal(a.sourceManifestSha256, b.sourceManifestSha256);
assert.equal(a.contractManifestSha256, b.contractManifestSha256);
assert.deepEqual(a.preflight.summary,b.preflight.summary);
assert.equal(a.preflight.passed,b.preflight.passed);
assert.deepEqual(a.suites.map(x => [x.suite,x.passed,x.summary]),
  b.suites.map(x => [x.suite,x.passed,x.summary]));
// Wall-clock report digests may coincide if both executions occur in the same ms;
// instead prove report hashing includes timestamp by reconstructing a synthetic
// timestamp change without sleeping or modifying the real report.
const synthetic = {...a, executedAt:'2000-01-01T00:00:00.000Z'};
const digest = crypto.createHash('sha256').update(JSON.stringify({...synthetic,reportSha256:null})).digest('hex');
assert.notEqual(digest, a.reportSha256, 'timestamp must affect full report digest');
console.log(JSON.stringify({
  schema:'qosha-validation-fingerprint-replay/v1',passed:a.passed, replayConsistent:true,
  suites:a.suites.length,gatePassed:a.passed,
  fingerprint:a.validationFingerprintSha256,
  sourceManifest:a.sourceManifestSha256,contractManifest:a.contractManifestSha256,
  firstReportSha256:a.reportSha256,secondReportSha256:b.reportSha256,
  dealsExecutedPerGate:a.dealsExecuted,
  limitation:'Replay equivalence checks implementation stability, not physical game-rule correctness.'
},null,2));
if(!a.passed) process.exitCode=1; // Reproducible failure is not a green validation gate.
