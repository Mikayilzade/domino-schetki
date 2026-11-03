'use strict';
const assert = require('node:assert/strict');
const { finishOutcomeToDeltas, applyFinishOutcomeToMatch } = require('./finish-score-match-integration');
function test() {
  let assertions = 0;
  const eq = (a,b,msg) => { assert.equal(a,b,msg); assertions++; };
  const deep = (a,b,msg) => { assert.deepEqual(a,b,msg); assertions++; };
  const entities = scores => scores.map((score,i)=>({id:'P'+i,score,exploded:false}));
  deep(finishOutcomeToDeltas({kind:'finish',playerIndex:0,minus:0,remainders:[0,14,23]}).deltas,[0,14,23],'ordinary finish deltas');
  deep(finishOutcomeToDeltas({kind:'finish',playerIndex:1,minus:-20,remainders:[9,0,6]}).deltas,[9,-20,6],'multi-double finish deltas');
  assert.throws(()=>finishOutcomeToDeltas({kind:'finish',playerIndex:0,minus:-50,remainders:[0,2,3]}),/unsupported/); assertions++;
  assert.throws(()=>finishOutcomeToDeltas({kind:'finish',playerIndex:0,minus:0,remainders:[1,2,3]}),/finisher remainder/); assertions++;
  const beforeBlock=entities([41,77,99]);
  const block=applyFinishOutcomeToMatch(beforeBlock,{kind:'block',playerIndex:null,minus:0,remainders:[4,8,12]});
  eq(block.unscored,true,'block is explicitly unscored'); eq(block.events.length,0,'block creates no score events');
  deep(block.entities,beforeBlock,'block leaves score state unchanged'); eq(block.mapping.reason,'block winner/tie allocation unresolved','block limitation recorded');
  const floor=applyFinishOutcomeToMatch(entities([5,12,30]),{kind:'finish',playerIndex:0,minus:-20,remainders:[0,0,0]});
  eq(floor.entities[0].score,0,'score floor applied through finish mapping'); eq(floor.entities[0].exploded,false,'negative finish does not explode');
  eq(floor.finished,false,'minus-only round does not finish match'); eq(floor.events.length,3,'zero deltas are harmless no-ops for other seats');
  const bust=applyFinishOutcomeToMatch(entities([100,30,20]),{kind:'finish',playerIndex:2,minus:0,remainders:[1,0,0]});
  eq(bust.entities[0].score,101,'round remainder increments to 101'); eq(bust.entities[0].exploded,true,'101 marks player exploded');
  eq(bust.finished,true,'two survivors end three-player PWA match');
  deep(bust.places,[{entityId:'P2',place:1,points:2},{entityId:'P1',place:2,points:1}],'survivors placed by score');
  deep(bust.pendingSeats,[1,2],'later same-round events stop after PWA match finish');
  let match=entities([97,99,50]);
  const r1=applyFinishOutcomeToMatch(match,{kind:'finish',playerIndex:2,minus:0,remainders:[3,1,0]}); match=r1.entities;
  deep(match.map(x=>x.score),[100,100,50],'first round progresses scores'); eq(r1.finished,false,'first round leaves match active');
  const r2=applyFinishOutcomeToMatch(match,{kind:'finish',playerIndex:1,minus:-10,remainders:[1,0,4]});
  eq(r2.entities[0].score,101,'second round first seat reaches bust'); eq(r2.finished,true,'second round ends match immediately');
  deep(r2.places,[{entityId:'P2',place:1,points:2},{entityId:'P1',place:2,points:1}],'second-round survivor ranking');
  deep(r2.pendingSeats,[1,2],'remaining score events are not applied after stop');
  const orderOutcome={kind:'finish',playerIndex:2,minus:0,remainders:[1,1,0]};
  const orderA=applyFinishOutcomeToMatch(entities([100,100,0]),orderOutcome,{seatOrder:[0,1,2]});
  const orderB=applyFinishOutcomeToMatch(entities([100,100,0]),orderOutcome,{seatOrder:[1,0,2]});
  deep(orderA.entities.map(x=>x.exploded),[true,false,false],'seat zero busts first in order A');
  deep(orderB.entities.map(x=>x.exploded),[false,true,false],'seat one busts first in order B');
  eq(orderA.finished,true,'order A ends match'); eq(orderB.finished,true,'order B ends match');
  const minuses=[0,-10,-20,-30,-40];
  for(let start=0;start<=100;start++)for(const minus of minuses){
    const out=applyFinishOutcomeToMatch(entities([start,0,0]),{kind:'finish',playerIndex:0,minus,remainders:[0,0,0]});
    eq(out.entities[0].score,Math.max(0,start+minus),'floor '+start+'/'+minus);
    eq(out.entities[0].exploded,false,'no bust '+start+'/'+minus);
  }
  for(let start=0;start<=100;start++){
    const increment=100-start;
    const at100=applyFinishOutcomeToMatch(entities([start,25,10]),{kind:'finish',playerIndex:2,minus:0,remainders:[increment,0,0]});
    eq(at100.entities[0].score,100,'below bust '+start); eq(at100.entities[0].exploded,false,'100 stays alive '+start);
    const at101=applyFinishOutcomeToMatch(entities([start,25,10]),{kind:'finish',playerIndex:2,minus:0,remainders:[increment+1,0,0]});
    eq(at101.entities[0].score,101,'threshold '+start); eq(at101.entities[0].exploded,true,'101 explodes '+start);
    eq(at101.finished,true,'101 terminates three-player match '+start);
  }
  return {passed:true,assertions,scoreFloorCases:505,bustBoundaryPairs:101,blockScoring:'intentionally omitted',eventOrder:'ascending seat index; harness convention only'};
}
if(require.main===module)process.stdout.write(JSON.stringify(test(),null,2)+'\n');
module.exports={test};
