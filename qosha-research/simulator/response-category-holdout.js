'use strict';
// Exact-world independent holdout: first opponent reply category vs later outcome.
// node qosha-research/simulator/response-category-holdout.js test
// node qosha-research/simulator/response-category-holdout.js 1200000 1320000 30
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const hold=require('./two-opponent-conditional-holdout'),exact=require('./exact-late-double-runner');
const first=require('./exact-first-response-runner'),reg=require('./decision-regret');
const P=['closed-branch-control','min-hand-pips','fast-doubles'],avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function stat(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;
return{n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function cat(a,b){const k=first.category(a,b);return k!=='pass-flip'?k:(a.kind==='pass'?'connector-forces-pass':'unrelated-forces-pass');}
function analyze(p){
const s=p.state,f=s.currentPlayer,before=JSON.stringify(s);
if(s.stock.length)throw Error('stock not empty');
const opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock),by=new Map(opts.actions.map(a=>[reg.actionKey(a),a]));
const a=by.get(p.pair.connector),b=by.get(p.pair.other);
if(!a||!b||a.type!=='single'||b.type!=='single'||e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('invalid pair');
const ac=r.stepRound(s,o=>o.actions.find(x=>reg.actionKey(x)===p.pair.connector));
const ao=r.stepRound(s,o=>o.actions.find(x=>reg.actionKey(x)===p.pair.other));
const endsChanged=e.SIDES.filter(x=>ac.branchState.branches[x].end!==ao.branchState.branches[x].end).length;
const openingChanged=[...new Set([...ac.openingState.openedNumbers,...ao.openingState.openedNumbers])].filter(x=>ac.openingState.openedNumbers.has(x)!==ao.openingState.openedNumbers.has(x)).length;
const worlds=exact.exactWorlds({...p,focal:f}),byPolicy=Object.fromEntries(P.map(k=>[k,[]]));let continuations=0;
for(let i=0;i<worlds.length;i++)for(const policy of P){
const w=worlds[i],seed=57000000+1000*p.seed+i,ca=first.firstResponse(w,a,policy,seed),ob=first.firstResponse(w,b,policy,seed);
const ev=reg.evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:policy,seed,maxTurns:200});
if(ev.kind!=='paired-world')throw Error('no choice');continuations+=ev.candidates.length;
const m=new Map(ev.candidates.map(x=>[x.actionKey,x])),x=m.get(p.pair.connector),y=m.get(p.pair.other);
if(!x||!y||x.outcome==='unresolved'||y.outcome==='unresolved')throw Error('unresolved');
byPolicy[policy].push({cat:cat(ca,ob),finish:+x.focalFinishedFirst- +y.focalFinishedFirst,
pips:x.focalRemainder-y.focalRemainder,minus:+(x.focalMinus<0)- +(y.focalMinus<0),nextFinish:ca.finished-ob.finished});
}
if(JSON.stringify(s)!==before)throw Error('mutated state');
return{seed:p.seed,turn:p.turn,x:p.x,handSizes:s.hands.map(h=>h.length),endsChanged,openingChanged,
exactAllocations:worlds.length,continuations,policy:Object.fromEntries(P.map(k=>{
const v=byPolicy[k],categories={};
for(const x of v){const q=categories[x.cat]||(categories[x.cat]={n:0,finish:0,pips:0,minus:0,nextFinish:0});
q.n++;q.finish+=x.finish;q.pips+=x.pips;q.minus+=x.minus;q.nextFinish+=x.nextFinish;}
return[k,{finish:avg(v.map(x=>x.finish)),pips:avg(v.map(x=>x.pips)),minus:avg(v.map(x=>x.minus)),categories}];}))};
}
function summarize(rows){
const out={positions:rows.length,exactAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
endsChanged:Object.fromEntries([0,1,2,3,4].map(n=>[n,rows.filter(x=>x.endsChanged===n).length])),
openingChangedPositions:rows.filter(x=>x.openingChanged>0).length,policies:{}};
for(const policy of P){const cats={};
for(const row of rows)for(const [k,v] of Object.entries(row.policy[policy].categories)){
const a=cats[k]||(cats[k]={worlds:0,positions:0,finish:0,pips:0,minus:0,nextFinish:0,means:[]});
a.worlds+=v.n;a.positions++;a.finish+=v.finish;a.pips+=v.pips;a.minus+=v.minus;a.nextFinish+=v.nextFinish;a.means.push(v.finish/v.n);}
out.policies[policy]={finish:stat(rows.map(x=>x.policy[policy].finish)),pips:stat(rows.map(x=>x.policy[policy].pips)),
minus:stat(rows.map(x=>x.policy[policy].minus)),categories:Object.fromEntries(Object.entries(cats).map(([k,v])=>
[k,{worlds:v.worlds,positions:v.positions,pooledFinishDelta:v.finish/v.worlds,meanPositionConditionalFinishDelta:avg(v.means),
exploratoryPositionCI95:stat(v.means).exploratoryCI95,pooledPipsDelta:v.pips/v.worlds,pooledMinusDelta:v.minus/v.worlds,
pooledNextFinishDelta:v.nextFinish/v.worlds}]))};}
return out;
}
function run(start=1200000,end=1320000,limit=30){
const found=hold.collect(start,end,limit),rows=found.out.map(analyze);
if(!rows.length)throw Error('no eligible positions');
return{schema:'qosa-response-category-holdout/v1',timestampAsiaBaku:new Date(Date.now()+14400000).toISOString().slice(0,19)+' +04:00',
engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,limit,scannedDeals:found.scanned,
positions:rows.length,selectedSeeds:rows.map(x=>x.seed),exactHiddenAllocations:rows.reduce((s,x)=>s+x.exactAllocations,0),
candidateContinuations:rows.reduce((s,x)=>s+x.continuations,0),newFullStrategyRounds:0,verifiedPriorFullStrategyRounds:180000,
continuationSeedFormula:'57000000+1000*dealSeed+lexicographicAllocationIndex',
selection:'min-hand-pips first eligible equal-pip connector vs unrelated legal single retaining X-X',
comparison:'connector minus unrelated, same exhaustive hidden worlds, three deterministic continuation policies',
weighting:'uniform allocations per position, equal position weighting for unconditional deltas; category subsets are descriptive post-action mediators',
summary:summarize(rows),rows,limitations:'Category is post-treatment and NOT causal. Branch geometry differs; uniform allocations ignore observed history; bots, assumed branch semantics, no block winner; exploratory intervals.',
next:'replicate pass-direction effects on fresh seeds; seek same-side four-end-matched choices; do not interpret category-conditioned differences causally.'};
}
function selfTest(){const a=run(1100000,1120000,2),b=run(1100000,1120000,2);
if(a.positions!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('nondeterministic');
for(const row of a.rows)for(const k of P)if(Object.values(row.policy[k].categories).reduce((s,c)=>s+c.n,0)!==row.exactAllocations)throw Error('coverage');
return{passed:true,seeds:a.selectedSeeds,allocations:a.exactHiddenAllocations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||1200000),+(a[1]||1320000),+(a[2]||30)),null,2));}
module.exports={cat,analyze,summarize,run,selfTest};
