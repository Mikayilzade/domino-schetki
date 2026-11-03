'use strict';
/**
 * Fast trace-level regression. Full 4-cohort census is deliberately opt-in:
 *   node simulator/pwa-v16-eleven-tie-traces-regression.js --full
 * This is research-only; no scoreboard files are written.
 */
const assert=require('node:assert/strict');
const traces=require('./pwa-v16-eleven-tie-traces');
const entities=scores=>scores.map((score,i)=>({id:'P'+i,score,exploded:false}));
function test(full=false){
 let checks=0;
 const eq=(a,b,label)=>{assert.deepStrictEqual(a,b,label);checks++;};
 // Seat 0 busts first: equal survivors, and a nonzero event is pending.
 let t=traces.trace(entities([100,70,70]),[1,10,0],[0,1,2]);
 eq(t.finished,true,'bust finishes');
 eq(t.isDraw,true,'tie before pending event');
 eq(t.pending,[1],'pending nonzero');
 eq(t.skippedZero,[2],'zero event separately tracked');
 eq(t.events.map(e=>e.seat),[0],'stop at bust');
 eq(t.places.map(p=>p.points),[1.5,1.5],'tie points');
 // Enter survivor delta first: same hand outcome, different ranking.
 t=traces.trace(entities([100,70,70]),[1,10,0],[1,0,2]);
 eq(t.finished,true,'later bust');
 eq(t.isDraw,false,'survivor delta breaks tie');
 eq(t.pending,[],'no pending nonzero');
 eq(t.events.map(e=>e.seat),[1,0],'event ordering preserved');
 eq(t.places.map(p=>p.points),[2,1],'ranked survivors');
 // Zero deltas do not become pending even when positioned after bust.
 t=traces.trace(entities([100,70,70]),[1,0,0],[0,2,1]);
 eq(t.pending,[],'zero-only tail is not pending');
 eq(t.skippedZero,[2,1],'zero order is preserved');
 eq(t.events.length,1,'zero not applied as a score event');
 // Negative adjustment obeys score floor.
 t=traces.trace(entities([100,2,70]),[1,-10,0],[1,0,2]);
 eq(t.entities[1].score,0,'score floor');
 eq(t.events[0].postScore,0,'floor reflected in event trace');
 let census=null;
 if(full){
  const r=traces.run();
  eq(r.results.length,4,'four disjoint cohorts');
  eq(r.results.reduce((n,x)=>n+x.accepted,0),4000,'accepted deal census');
  eq(r.results.reduce((n,x)=>n+x.tieArmEvents,0),30,'tie arm census');
  eq(r.results.reduce((n,x)=>n+x.uniqueTieBoundaries,0),11,'unique boundary census');
  for(const c of r.results)for(const b of c.ties){
   eq(b.arms.length,6,'all six orders including non-draw');
   eq(b.arms.some(a=>a.isDraw),true,'tie-containing boundary');
   eq(new Set(b.arms.map(a=>a.order)).size,6,'unique orders');
  }
  census={accepted:4000,uniqueTieBoundaries:11,tieArms:30,traceArms:66};
 }
 return {passed:true,assertions:checks,full,census};
}
if(require.main===module)process.stdout.write(JSON.stringify(test(process.argv.includes('--full')),null,2)+'\n');
module.exports={test};
