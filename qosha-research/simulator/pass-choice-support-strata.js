'use strict';
// Exact-support/unique-world independent pass-choice holdout.
// node qosha-research/simulator/pass-choice-support-strata.js test
// node qosha-research/simulator/pass-choice-support-strata.js 1305440 450 18 128
const e=require('./engine'),r=require('./round-driver');
const {collect,conditionalWorld}=require('./pass-choice-regret-runner');
const {hidden,force}=require('./pass-choice-outlier-audit');
const profiles=['min-hand-pips','closed-branch-control'];
function exactWorlds(p,c){
 const out=[];
 function visit(start,need,pick){
  if(!need){
   const chosen=new Set(pick),w=r.cloneRoundState(p.state);
   w.hands[c.n]=c.mustN.concat(pick.map(i=>c.flex[i]));
   w.hands[c.o]=c.mustO.concat(c.flex.filter((_,i)=>!chosen.has(i)));
   out.push(w);return;
  }
  for(let i=start;i<=c.flex.length-need;i++)visit(i+1,need-1,[...pick,i]);
 }
 visit(0,c.take,[]);
 if(out.length!==c.support)throw Error('exact support mismatch');
 return out;
}
function sampleUnique(p,c,count){
 const out=[],seen=new Set();
 for(let i=0;out.length<count&&i<15000;i++){
  const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
  const w=conditionalWorld(p,seed),fp=w.hands[c.n].map(e.tileKey).sort().join(',');
  if(seen.has(fp))continue;
  seen.add(fp);out.push(w);
 }
 if(out.length!==count)throw Error('not enough distinct hidden worlds');
 return out;
}
function checkWorld(p,c,w){
 const all=[...p.known,...w.hands.flat()],keys=all.map(e.tileKey);
 if(all.length!==28||new Set(keys).size!==28)throw Error('deck integrity');
 for(const seat of [c.n,c.o])for(const t of w.hands[seat])
  if(p.forbidden[seat].includes(e.tileKey(t)))throw Error('pass contradiction');
}
function summarize(rows){
 if(!rows.length)return null;
 const mean=k=>rows.reduce((s,x)=>s+x[k],0)/rows.length;
 const m=mean('winDelta'),sd=Math.sqrt(rows.reduce((s,x)=>s+(x.winDelta-m)**2,0)/(rows.length-1||1));
 return {positions:rows.length,uniqueWorlds:rows.reduce((s,x)=>s+x.worlds,0),
  winPP:100*m,win95ExploratoryPP:rows.length>1?[100*(m-2.11*sd/Math.sqrt(rows.length)),100*(m+2.11*sd/Math.sqrt(rows.length))]:null,
  pipsDelta:mean('pipsDelta'),minusPP:100*mean('minusDelta'),blockPP:100*mean('blockDelta'),
  better:rows.filter(x=>x.winDelta>1e-9).length,worse:rows.filter(x=>x.winDelta< -1e-9).length,
  tied:rows.filter(x=>Math.abs(x.winDelta)<=1e-9).length};
}
function run(start=1305440,count=450,limit=18,worlds=128){
 if(![start,count,limit,worlds].every(Number.isInteger)||count<1||limit<1||worlds<1)throw Error('bad arguments');
 const discovery=collect(start,count,limit),rows=[];
 for(const p of discovery.positions){
  const c=hidden(p),exact=c.support<=worlds,ws=exact?exactWorlds(p,c):sampleUnique(p,c,worlds);
  const original=JSON.stringify(p.state),scores=[];
  for(const w of ws){
   checkWorld(p,c,w);
   const a=force(p,w,'one'),b=force(p,w,'joint');
   const win=x=>+(x.outcome.kind==='finish'&&x.outcome.playerIndex===p.seat);
   const minus=x=>+(win(x)&&x.outcome.minus<0);
   scores.push({dw:win(b)-win(a),dp:b.remaining-a.remaining,dm:minus(b)-minus(a),
    db:+(b.outcome.kind==='block')- +(a.outcome.kind==='block')});
  }
  if(JSON.stringify(p.state)!==original)throw Error('visible source state mutated');
  const mean=k=>scores.reduce((s,x)=>s+x[k],0)/scores.length;
  rows.push({profile:p.profile,seed:p.seed,seat:p.seat,turn:p.turn,support:c.support,exact,
   worlds:ws.length,passHistories:p.forbidden.filter((f,i)=>i!==p.seat&&f.length).length,
   hand:p.state.hands[p.seat].map(e.tileKey),one:p.one,joint:p.joint,
   winDelta:mean('dw'),pipsDelta:mean('dp'),minusDelta:mean('dm'),blockDelta:mean('db')});
 }
 const uniqueWorlds=rows.reduce((s,x)=>s+x.worlds,0);
 return {schema:'qosa-pass-support-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,discoveryScanned:discovery.scanned,
  discoveryTrajectories:discovery.trajectories,selectedPositions:rows.length,
  exactPositions:rows.filter(x=>x.exact).length,sampledPositions:rows.filter(x=>!x.exact).length,
  exactThreshold:worlds,uniqueHiddenWorlds:uniqueWorlds,counterfactualContinuations:2*uniqueWorlds,
  comparison:'a20-joint minus a20-one, forced actions, identical hidden worlds and continuation bots',
  assumptions:'Uniform pass-constrained hidden allocations; exact when support<=threshold, otherwise unique deterministic samples. Prior opponent choice likelihood not conditioned.',
  limitations:'Selected changed-choice states, provisional branch semantics, deterministic bots, no block winner, exploratory position intervals and possible same-deal correlation. Not a full-round win rate.',
  summaries:Object.fromEntries(profiles.map(profile=>{const x=rows.filter(a=>a.profile===profile);
   return [profile,{all:summarize(x),exact:summarize(x.filter(a=>a.exact)),
    sampled:summarize(x.filter(a=>!a.exact)),bothHistory:summarize(x.filter(a=>a.passHistories===2))}];})),
  rows};
}
function test(){
 const {positions}=collect(1305440,20,2);
 if(positions.length!==4)throw Error('discovery regression');
 for(const p of positions){const c=hidden(p);
  if(c.support<=128){const worlds=exactWorlds(p,c);for(const w of worlds)checkWorld(p,c,w);}
  else {const worlds=sampleUnique(p,c,16);const fingerprints=worlds.map(w=>w.hands[c.n].map(e.tileKey).sort().join(','));
   if(new Set(fingerprints).size!==16)throw Error('duplicate hidden allocation');
   for(const w of worlds)checkWorld(p,c,w);}
 }
 return {passed:true,positions:positions.length};
}
if(require.main===module){
 const args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||1305440),+(args[1]||450),+(args[2]||18),+(args[3]||128)),null,2));
}
module.exports={run,test,exactWorlds,sampleUnique,summarize};