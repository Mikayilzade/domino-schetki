'use strict';
// Exact opening stock rescue, 3 x 9 + 1; no gameplay-engine assumptions.
// Run: node qosha-research/simulator/opening-stock-rescue-oracle-20261122.js
const assert=require('node:assert/strict');
function choose(n,k){if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);}
const initialNoConnector=choose(21,8)/choose(27,8);
const rescueGivenNoConnector=6/19;
const passGivenNoConnector=13/19;
const finalPass=initialNoConnector*passGivenNoConnector;
const direct=choose(21,9)/choose(27,9);
assert(Math.abs(finalPass-direct)<1e-14);
assert.equal(choose(27,8),2220075);
const result={schema:'qosha-opening-stock-rescue/v1',rules:'qosa-1.0.0',engine:'independent-exact-oracle/v1',mode:'3x9+1',condition:'starter owns 1-1; eight other dealt stones; stock uniformly drawn',initialNoConnector,rescueGivenNoConnector,passGivenNoConnector,finalPass,directPassCrossCheck:direct,gameplayDeals:0,seedSet:null,assumptions:['uniform deal','only ordinary 1-x tiles count as immediate connector','no claim about locked-branch legality'],interpretation:'conditional tile availability only, not a strategy win probability'};
if(require.main===module)console.log(JSON.stringify(result,null,2));
module.exports={choose,result};
