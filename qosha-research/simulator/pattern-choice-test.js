'use strict';
const assert=require('assert');
const {targets,classify,comparableChoices}=require('./pattern-choice-classifier');

const hand=[[2,2],[1,2],[2,5],[4,6]];
const ts=targets(hand);
assert.deepStrictEqual(ts,[{number:2,tileCount:3,connectorCount:2}]);

const spend={tiles:[[2,2]]};
const preserve={tile:[4,6]};
assert.deepStrictEqual(classify(hand,spend,2),{usesDouble:true,usesConnector:false,keepsPair:true});
assert.deepStrictEqual(classify(hand,preserve,2),{usesDouble:false,usesConnector:false,keepsPair:true});

const choices=comparableChoices(hand,[spend,preserve]);
assert.strictEqual(choices.length,1);
assert.strictEqual(choices[0].number,2);
assert.strictEqual(choices[0].spendDouble.length,1);
assert.strictEqual(choices[0].preservePair.length,1);

// Spending the only connector is not a preserve-pair action.
const connectorSpend={tile:[1,2]};
const c=classify([[2,2],[1,2],[3,4]],connectorSpend,2);
assert.strictEqual(c.keepsPair,false);

console.log('pattern-choice classifier regression: ok');
