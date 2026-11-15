'use strict';
// Self-contained regression of the pinned-inventory row contract.
// Does not validate the full checkout or execute the gameplay engine.
const assert = require('node:assert/strict');
const prefix = 'qosha-research/simulator/';
const row = /^\x60(qosha-research\/simulator\/[^\x60\r\n]+)\x60 ([0-9a-f]{40}) (\d+)$/gm;
const sha = 'a'.repeat(40);
function parse(text) {
  const entries = [...text.matchAll(row)];
  const seen = new Set();
  for (const m of entries) {
    const name = m[1].slice(prefix.length);
    assert(!seen.has(name), 'duplicate pinned path');
    seen.add(name);
    assert(name.split('/').every(x => x && x !== '.' && x !== '..'), 'unsafe pinned path');
    assert(!name.includes('\\'), 'backslash in pinned path');
    assert(Number.isSafeInteger(Number(m[3])), 'unsafe byte count');
  }
  return entries.length;
}
const valid = `\x60${prefix}initializer.js\x60 ${sha} 123\n`;
assert.equal(parse(valid), 1);
assert.equal(parse(valid + `\x60${prefix}kernel/round.js\x60 ${sha} 456\n`), 2);
assert.throws(() => parse(valid + valid), /duplicate/);
assert.throws(() => parse(`\x60${prefix}../escape.js\x60 ${sha} 1\n`), /unsafe/);
assert.throws(() => parse(`\x60${prefix}x\\y.js\x60 ${sha} 1\n`), /backslash/);
assert.equal(parse(`\x60${prefix}bad.js\x60 ${'z'.repeat(40)} 1\n`), 0);
assert.equal(parse(`\x60${prefix}bad.js\x60 ${sha} not-a-number\n`), 0);
console.log(JSON.stringify({schema:'qosha-pinned-inventory-parser-regression/v1',passed:true,assertionGroups:7,gameplayDeals:0,hiddenWorlds:0,limitation:'Isolated row-parser fixture only; not full preflight or gameplay validation.'}));
