'use strict';
// Next-player mobility after the two pass-posterior actions; delta joint minus one.
// node qosha-research/simulator/next-mobility-pass.js test
// node qosha-research/simulator/next-mobility-pass.js 1311828 1318000 60 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const {collect}=require('./pass-disagreement-canonical'),{sample}=require('./pass-conditioned-sampler');
const {actionKey}=require('./decision-regret');
const fields=['pass','tileTypes','actions','canFinish','canMinus','opened'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function immediate(w,key){
 const s=r.stepRound(w,opts=>{const a=opts.actions.find(x=>actionKey(x)===key);
  if(!a)throw Error('forced action not legal');return a;});
 const opened=s.openingState.openedNumbers.size;
 if(s.outcome)return{pass:null,tileTypes:null,actions:null,canFinish:null,canMinus:null,opened};
 const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const tiles=new Set(opts.actions.map(a=>e.tileKey(a.tile||(a.tiles||[])[0])));
 let canFinish=0,canMinus=0;
 for(const a of opts.actions){const tr=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
  if(!tr.hand.length){canFinish=1;if(tr.finishDoubles.length)canMinus=1;}}
 return{pass:+(opts.phase==='pass'),tileTypes:tiles.size,actions:opts.actions.length,canFinish,canMinus,opened};
}
function run(start=1311828,end=1318000,limit=60,worlds=64){
 const f=collect(start,end,limit,20),rows=[];
 for(const p of f.positions){
  const diff=Object.fromEntries(fields.map(k=>[k,[]]));
  for(let j=0;j<worlds;j++){
   const seed=e.mixSeed32((p.seed+Math.imul(j+1,0x9e3779b9))>>>0);
   const w=sample(p.state,p.known,p.forbidden,seed);
   const a=immediate(w,p.oneKey),b=immediate(w,p.jointKey);
   for(const k of fields)if(a[k]!==null&&b[k]!==null)diff[k].push(b[k]-a[k]);
  }
  rows.push({seed:p.seed,seat:p.seat,turn:p.turn,nextHandSize:p.handSizes[(p.seat+1)%3],
   one:p.oneKey,joint:p.jointKey,oneType:p.oneType,jointType:p.jointType,
   onePips:p.onePips,jointPips:p.jointPips,oneOpenings:p.oneOpenings,jointOpenings:p.jointOpenings,
   immediate:Object.fromEntries(fields.map(k=>[k,diff[k].length?mean(diff[k]):null]))});
 }
 return{schema:'qosa-next-mobility-pass/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  start,endExclusive:end,scanned:f.scanned,positions:rows.length,worlds,
  allocations:rows.length*worlds,seedFormula:'mixSeed32((dealSeed + imul(worldIndex+1,0x9e3779b9)) >>> 0)',
  assumptions:'Branch opening provisional; uniform pass-conditioned hidden allocations, no opponent-choice likelihood.',
  rows};
}
function test(){const a=run(1311828,1312100,2,2),b=run(1311828,1312100,2,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.positions!==2)throw Error('replay');
 return{passed:true,positions:a.positions};}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1311828),+(a[1]||1318000),+(a[2]||60),+(a[3]||64)),null,2));}
module.exports={run,test,immediate};
