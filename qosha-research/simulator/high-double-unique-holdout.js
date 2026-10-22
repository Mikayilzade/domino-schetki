'use strict';
// Exact small supports, otherwise distinct pass-constrained hidden worlds.
// node qosha-research/simulator/high-double-unique-holdout.js test
// node qosha-research/simulator/high-double-unique-holdout.js 1311840 2000 25 128
const e=require('./engine'),r=require('./round-driver');
const {collect,rollout}=require('./high-double-paired');
const {conditionalWorld}=require('./pass-choice-regret-runner');
const {hidden}=require('./pass-choice-outlier-audit');
const profiles=['min-hand-pips','closed-branch-control'],numbers=[3,4,5,6];
const mean=a=>a.reduce((s,v)=>s+v,0)/a.length;
function exactWorlds(p,c){
 const out=[];
 function visit(start,need,pick){
  if(!need){const selected=new Set(pick),w=r.cloneRoundState(p.state);
   w.hands[c.n]=c.mustN.concat(pick.map(i=>c.flex[i]));
   w.hands[c.o]=c.mustO.concat(c.flex.filter((_,i)=>!selected.has(i)));
   out.push(w);return;}
  for(let i=start;i<=c.flex.length-need;i++)visit(i+1,need-1,[...pick,i]);
 }
 visit(0,c.take,[]);
 if(out.length!==c.support)throw Error('support mismatch');
 return out;
}
function sampleUnique(p,c,n){
 const out=[],seen=new Set();
 for(let i=0;out.length<n&&i<50000;i++){
  const seed=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^
   Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0);
  const w=conditionalWorld(p,seed),fp=w.hands[c.n].map(e.tileKey).sort().join(',');
  if(seen.has(fp))continue;
  seen.add(fp);out.push(w);
 }
 if(out.length!==n)throw Error('insufficient unique worlds');
 return out;
}
function check(p,c,w){
 const all=[...p.known,...w.hands.flat()],ks=all.map(e.tileKey);
 if(all.length!==28||new Set(ks).size!==28)throw Error('deck integrity');
 if(w.currentPlayer!==p.seat||JSON.stringify(w.hands[p.seat])!==JSON.stringify(p.state.hands[p.seat]))
  throw Error('focal state changed');
 for(const seat of [c.n,c.o])for(const t of w.hands[seat])
  if(p.forbidden[seat].includes(e.tileKey(t)))throw Error('pass contradiction');
}
function interval(v){
 if(v.length<2)return null;
 const m=mean(v),sd=Math.sqrt(v.reduce((s,x)=>s+(x-m)**2,0)/(v.length-1));
 return [100*(m-2.735*sd/Math.sqrt(v.length)),100*(m+2.735*sd/Math.sqrt(v.length))];
}
function run(start=1311840,count=2000,cap=25,worlds=128){
 if(![start,count,cap,worlds].every(Number.isInteger)||count<1||cap<1||worlds<1)throw Error('args');
 const found=collect(start,count,cap),rows=[];
 for(const p of found.positions){
  const frozen=JSON.stringify(p.state),c=hidden(p),exact=c.support<=worlds;
  const ws=exact?exactWorlds(p,c):sampleUnique(p,c,worlds),a=[],b=[];
  for(const w of ws){check(p,c,w);a.push(rollout(w,p.open,p.profile,p.seat));
   b.push(rollout(w,p.defer,p.profile,p.seat));}
  if(JSON.stringify(p.state)!==frozen)throw Error('source mutation');
  const delta=k=>mean(b.map(x=>x[k]))-mean(a.map(x=>x[k]));
  rows.push({profile:p.profile,number:p.number,seed:p.seed,seat:p.seat,turn:p.turn,
   hand:p.state.hands[p.seat].map(e.tileKey),opponentSizes:p.state.hands.map(h=>h.length),
   forbiddenSizes:p.forbidden.map(f=>f.length),open:p.open,defer:p.defer,
   support:c.support,exact,uniqueWorlds:ws.length,
   openWin:mean(a.map(x=>x.win)),deferWin:mean(b.map(x=>x.win)),
   winDelta:delta('win'),pipsDelta:delta('pips'),minusDelta:delta('minus'),blockDelta:delta('block')});
 }
 const summaries=[];
 for(const profile of profiles)for(const number of numbers){
  const a=rows.filter(x=>x.profile===profile&&x.number===number),v=a.map(x=>x.winDelta);
  summaries.push({profile,number,positions:a.length,exactPositions:a.filter(x=>x.exact).length,
   uniqueHiddenWorlds:a.reduce((s,x)=>s+x.uniqueWorlds,0),
   deferMinusOpenWinPP:a.length?100*mean(v):null,
   bonferroni95ExploratoryPP:a.length?interval(v):null,
   deferMinusOpenPips:a.length?mean(a.map(x=>x.pipsDelta)):null,
   deferMinusOpenMinusPP:a.length?100*mean(a.map(x=>x.minusDelta)):null,
   deferMinusOpenBlockPP:a.length?100*mean(a.map(x=>x.blockDelta)):null,
   deferBetter:a.filter(x=>x.winDelta>1e-12).length,
   openBetter:a.filter(x=>x.winDelta< -1e-12).length,
   tied:a.filter(x=>Math.abs(x.winDelta)<=1e-12).length});
 }
 const uniqueHiddenWorlds=rows.reduce((s,x)=>s+x.uniqueWorlds,0);
 return {schema:'qosa-high-double-unique-holdout/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9',startSeed:start,endSeed:start+count-1,scanned:found.scanned,
  positions:rows.length,worldLimit:worlds,uniqueHiddenWorlds,
  exactPositions:rows.filter(x=>x.exact).length,counterfactualContinuations:2*uniqueHiddenWorlds,
  comparison:'First optional single high double chosen by a20-joint after observed no-stock opponent pass: open vs defer',
  assumptions:'Fixed focal hand and played tiles; uniform pass-constrained hidden allocations, exact support if <= world limit, else unique deterministic samples; identical worlds and fixed continuation bots.',
  limitations:'First-eligible selection, fixed bots, provisional branch semantics, no block winner, prior opponent-action likelihood omitted; exploratory Bonferroni normal intervals ignore seed clustering; forced choices not full-deal win rates.',
  summaries,rows};
}
function test(){
 const a=run(1311840,40,1,8),b=run(1311840,40,1,8);
 if(!a.positions||JSON.stringify(a)!==JSON.stringify(b)||
  a.rows.some(x=>x.uniqueWorlds!==Math.min(x.support,8))||
  a.counterfactualContinuations!==2*a.uniqueHiddenWorlds)throw Error('replay');
 return {passed:true,positions:a.positions,uniqueHiddenWorlds:a.uniqueHiddenWorlds};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1311840),
 +(a[1]||2000),+(a[2]||25),+(a[3]||128)),null,2));}
module.exports={run,test,exactWorlds,sampleUnique,check};
