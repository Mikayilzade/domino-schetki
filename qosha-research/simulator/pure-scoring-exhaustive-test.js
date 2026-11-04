'use strict';
// Exhaustive pure scoring contract. Independent of ambiguous branch/block rules.
// Run: node qosha-research/simulator/pure-scoring-exhaustive-test.js
const assert=require('node:assert/strict');
const {createDoubleSixDeck,finishMinus,applyScoreDelta,pipSum}=require('./engine');
function combinations(items,k,start=0,prefix=[],out=[]){
 if(prefix.length===k){out.push(prefix);return out;}
 for(let i=start;i<=items.length-(k-prefix.length);i++)combinations(items,k,i+1,[...prefix,items[i]],out);
 return out;
}
function run(){
 const deck=createDoubleSixDeck(), doubles=deck.filter(([a,b])=>a===b);
 let minusCases=0, nonDoubleCases=0, floorCases=0;
 for(let n=1;n<=4;n++){
  for(const group of combinations(doubles,n)){
   assert.equal(finishMinus(group),-10*n);
   minusCases++;
  }
 }
 for(let n=1;n<=4;n++){
  for(const group of combinations(deck.filter(([a,b])=>a!==b),n)){
   assert.equal(finishMinus(group),0);
   nonDoubleCases++;
  }
 }
 // Adding any non-double to a set of doubles must not manufacture a minus.
 for(let n=1;n<=3;n++)for(const group of combinations(doubles,n)){
  assert.equal(finishMinus([...group,[0,1]]),0);
  nonDoubleCases++;
 }
 assert.equal(finishMinus([]),0);
 assert.equal(finishMinus(doubles.slice(0,5)),0);
 assert.equal(pipSum(deck),168,'double-six total pip count');
 for(let score=0;score<=110;score++)for(let delta=-50;delta<=50;delta++){
  const next=applyScoreDelta(score,delta);
  assert.equal(next,Math.max(0,score+delta));
  assert.ok(next>=0);
  floorCases++;
 }
 return {passed:true,schema:'qosha-pure-scoring-exhaustive/v1',
  engine:'qosha-research-0.5.3',minusCases,nonDoubleCases,floorCases,
  deals:0,seeds:[],strategies:[],
  limitation:'Pure arithmetic only; no branch legality, block allocation, or physical score-event order is inferred.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run};
