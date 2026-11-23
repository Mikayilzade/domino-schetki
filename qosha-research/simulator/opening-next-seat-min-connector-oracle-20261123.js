#!/usr/bin/env node
'use strict';
// Exact combinatorial oracle, not a full gameplay simulation.
// Conditional on the 1-1 starter being forced to pass AFTER its compulsory draw.
// The six ordinary 1-x connectors (x=0,2,3,4,5,6) are all in opponents' hands.
// Each opponent has nine tiles, with 12 other nonconnector tiles shared between them.
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
const values=[0,2,3,4,5,6],denominator=choose(18,9),counts={none:0};
for(const v of values)counts[String(v)]=0;
for(let mask=0;mask<64;mask++){
 const selected=values.filter((_,i)=>mask&(1<<i));
 const weight=choose(12,9-selected.length);
 counts[selected.length?String(Math.min(...selected)):'none']+=weight;
}
assert.equal(Object.values(counts).reduce((a,b)=>a+b,0),denominator);
assert.equal(counts.none,220);
assert.equal(counts['0'],denominator/2);
const hasConnector=denominator-counts.none;
const meanMinGivenPlayable=values.reduce((a,v)=>a+v*counts[String(v)],0)/hasConnector;
const output={oracle:'opening-next-seat-min-connector/v1',condition:'uniform 3x9+1 deal; 1-1 starter forced to pass after compulsory draw; all six 1-x connectors are in opponents hands',denominator,minimumOuterPipCounts:counts,probabilityNextSeatHasConnector:hasConnector/denominator,probabilityNextSeatCanPlayOneZero:counts['0']/denominator,meanMinimumOuterPipGivenConnector:meanMinGivenPlayable,limitations:'Ownership and pip arithmetic only. Branch legality, choice policy, first-place and strategic advantage not inferred.'};
console.log(JSON.stringify(output,null,2));
