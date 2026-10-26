'use strict';
// Synthetic posterior invariants; four-side number locking remains PROVISIONAL.
const e=require('./engine'),init=require('./initializer'),r=require('./round-driver');
const p=require('./pass-two-sided-ablation'),u=require('./hidden-world-mobility');
const ok=(v,m)=>{if(!v)throw Error('pass-posterior-contract: '+m);};
const eq=(a,b,m)=>ok(JSON.stringify(a)===JSON.stringify(b),m);
function test(){
 const s=init.initializeThreePlayerRound({seed:1562080,isFirstRound:false,previousWinnerIndex:0});
 ok(s.kind==='ready'&&s.stock.length===0,'no-stock fixture');
 const f=s.currentPlayer,n=(f+1)%3,o=(f+2)%3,mem=[new Set(),new Set(),new Set()];
 const sample=(state,mode)=>p.conditionalWorld(state,f,mem,271828,mode);
 eq(sample(s,'both'),sample(s,'uniform'),'empty uniform equivalence');
 eq(sample(s,'both'),sample(s,'next'),'empty next equivalence');
 eq(sample(s,'both'),sample(s,'other'),'empty other equivalence');
 mem[n].add(e.tileKey(s.hands[o][0]));eq(sample(s,'both'),sample(s,'next'),'next-only equivalence');
 mem[n].clear();mem[o].add(e.tileKey(s.hands[n][0]));eq(sample(s,'both'),sample(s,'other'),'other-only equivalence');
 mem[n].add(e.tileKey(s.hands[o][0]));const both=sample(s,'both');
 ok(both.hands[n].every(t=>!mem[n].has(e.tileKey(t)))&&both.hands[o].every(t=>!mem[o].has(e.tileKey(t))),'pass exclusions');
 const swapped=r.cloneRoundState(s);[swapped.hands[n][0],swapped.hands[o][0]]=[swapped.hands[o][0],swapped.hands[n][0]];
 eq(sample(swapped,'both'),both,'actual hidden-hand independence');
 const keys=[...both.hands.flat(),...both.stock,...u.visibleFromState(s,f).played].map(e.tileKey);
 ok(keys.length===28&&new Set(keys).size===28,'28 tile conservation');
 const c=mem.map(v=>new Set(v));c[o].add(e.tileKey(s.hands[o][0]));
 let rejected=false;try{p.conditionalWorld(s,f,c,271828,'both');}catch{rejected=true;}ok(rejected,'contradictory pass rejection');
 return{passed:true,seed:1562080,checks:9,scope:'synthetic posterior; branch semantics unconfirmed'};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={test};
