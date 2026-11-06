'use strict';
// Research-only executable regression for validation evidence identity.
// Run: node qosha-research/simulator/validation-fingerprint-replay-test.js
// No file writes; does not touch the live PWA.
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const crypto = require('node:crypto');
const gate = path.join(__dirname, 'validation-gate.js');
function execute() {
  const p = spawnSync(process.execPath, [gate], {
    encoding: 'utf8', timeout: 600000, maxBuffer: 32 * 1024 * 1024
  });
  if (p.error) throw p.error;
  let report;
  try { report = JSON.parse(p.stdout); }
  catch { throw new Error('Gate did not emit JSON; exit=' + p.status + '; stderr=' + p.stderr.slice(-1000)); }
  assert.equal(report.schema, 'qosha-validation-gate/v1');
  assert.equal(report.suites.length, 17);
  assert.equal(typeof report.validationFingerprintSha256, 'string');
  assert.match(report.validationFingerprintSha256, /^[0-9a-f]{64}$/);
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
assert.deepEqual(a.suites.map(x => [x.suite,x.passed,x.summary]),
  b.suites.map(x => [x.suite,x.passed,x.summary]));
// Wall-clock report digests may coincide if both executions occur in the same ms;
// instead prove report hashing includes timestamp by reconstructing a synthetic
// timestamp change without sleeping or modifying the real report.
const synthetic = {...a, executedAt:'2000-01-01T00:00:00.000Z'};
const digest = crypto.createHash('sha256').update(JSON.stringify({...synthetic,reportSha256:null})).digest('hex');
assert.notEqual(digest, a.reportSha256, 'timestamp must affect full report digest');
console.log(JSON.stringify({
  schema:'qosha-validation-fingerprint-replay/v1',passed:true,
  suites:a.suites.length,gatePassed:a.passed,
  fingerprint:a.validationFingerprintSha256,
  sourceManifest:a.sourceManifestSha256,contractManifest:a.contractManifestSha256,
  firstReportSha256:a.reportSha256,secondReportSha256:b.reportSha256,
  dealsExecutedPerGate:a.dealsExecuted,
  limitation:'Replay equivalence checks implementation stability, not physical game-rule correctness.'
},null,2));
