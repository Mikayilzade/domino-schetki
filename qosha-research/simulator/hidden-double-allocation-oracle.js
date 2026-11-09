'use strict';
// Exact hidden-world allocation oracle for two nine-tile opponent hands.
// Condition: after 1-1 opening and mandatory stock draw, starter's nine tiles
// are known, 18 unknown tiles remain, and stock is empty.
// The two specified candidate doubles are distinct tiles among these 18.
// No branch legality, opponent policy, or scoring assumption is used.
const assert = require('node:assert/strict');
const choose = (n,k) => {let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
const total = choose(18,9);
assert.equal(total,48620);
const one = choose(17,8); // one specified unseen double at next seat
const both = choose(16,7); // both specified unseen doubles at next seat
const neither = choose(16,9);
const exactlyOne = 2*choose(16,8);
assert.equal(one*2,total);
assert.equal(both*2+exactlyOne+neither*2,total);
assert.equal(both,11440);
assert.equal(exactlyOne,25740);
assert.equal(neither,11440);
assert.equal(both/total,4/17);
assert.equal(exactlyOne/total,9/17);
assert.equal(neither/total,4/17);
const together = (both+neither)/total;
assert.equal(together,8/17);
assert.equal(exactlyOne/total,9/17);
const report={schema:'qosha-hidden-double-oracle/v1',rules:'qosa-1.0.0 opening only',mode:'3x9+1 stock',opponentAllocations:total,oneUnseenDoubleNextSeatProbability:one/total,twoUnseenDoublesNextSeatCount:{zero:neither,one:exactlyOne,two:both},twoUnseenDoublesTogetherProbability:together,twoUnseenDoublesSplitProbability:exactlyOne/total,atLeastOneNextSeatProbability:(both+exactlyOne)/total};
console.log(JSON.stringify(report,null,2));
