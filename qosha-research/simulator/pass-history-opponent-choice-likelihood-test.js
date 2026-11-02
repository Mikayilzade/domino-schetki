'use strict';
const assert=require('node:assert/strict');
const audit=require('./pass-history-opponent-choice-likelihood');
const result=audit.test();
assert.equal(result.passed,true);
assert.equal(result.assertions,9);
process.stdout.write(JSON.stringify(result,null,2)+'\n');
