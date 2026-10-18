'use strict';
// Reproduce: node qosha-research/simulator/late-equal-accessible-reply.js test
// node qosha-research/simulator/late-equal-accessible-reply.js 1098000 50000 12 30
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer');
const q=require('./equal-accessible-holdout'),h=require('./hidden-world');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const RM=['canPlay','legalActions','playableTiles','canFinish','canMinusFinish'];
const CM=['first','pips','minus','block','turns'],POL=['closed-branch-control','moderate-double-hold'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(a.length<2)return null;const m=mean(a),se=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1)));return[m-1.96*se,m+1.96*se];}
function find(seed){
 let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('init '+seed);
 while(!s.outcome&&s.turns<200){
  const c=q.eligible(s);
  if(c&&c.handSize>=4&&c.handSize<=5&&c.nextHandSize<=3)return {...c,seed,turn:s.turns,state:s};
  s=r.stepRound(s,(o,v)=>chooseBy('closed-branch-control',o,{seed,turns:v.turns,player:v.currentPlayer}));
 }
 if(!s.outcome)throw Error('unresolved '+seed);return null;
}
function reply(after,hand,stock){
 const o=d.turnOptions(after.branchState,after.openingState,hand,stock),unique=new Set();
 let finish=0,minus=0;
 for(const a of o.actions){
  for(const t of a.tiles||[a.tile])unique.add(e.tileKey(t));
  const z=d.applyTurn(after.branchState,after.openingState,hand,stock,a);
  if(!z.hand.length){finish=1;if(e.finishMinus(z.finishDoubles)<0)minus=1;}
 }
 return {canPlay:+(o.phase==='play'),legalActions:o.actions.length,playableTiles:unique.size,canFinish:finish,canMinusFinish:minus};
}
function evaluate(c,worlds){
 const s=c.state,before=JSON.stringify(s),next=(c.seat+1)%3;
 const actions=d.turnOptions(s.branchState,s.openingState,s.hands[c.seat],s.stock).actions;
 const a=actions.find(x=>actionKey(x)===c.connector),b=actions.find(x=>actionKey(x)===c.other);
 if(!a||!b)throw Error('candidate absent');
 const A=d.applyTurn(s.branchState,s.openingState,s.hands[c.seat],s.stock,a),B=d.applyTurn(s.branchState,s.openingState,s.hands[c.seat],s.stock,b);
 if(q.accessible(A).length!==q.accessible(B).length)throw Error('accessible mismatch');
 const live=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 const spec={visibleState:s,focalPlayer:c.seat,focalHand:s.hands[c.seat],knownTiles:e.createDoubleSixDeck().filter(t=>!live.has(e.tileKey(t))),hiddenHandSizes:s.hands.map(x=>x.length),stockSize:s.stock.length};
 const vals=Object.fromEntries(RM.map(m=>[m,[]]));let disagree=0;
 for(let k=0;k<worlds;k++){
  const ws=(Math.imul(c.seed,1009)+Math.imul(c.seat+1,1000003)+k+21000000)>>>0;
  const w=h.sampleWorld(spec,ws),snapshot=JSON.stringify(w);
  const x=reply(A,w.hands[next],w.stock),y=reply(B,w.hands[next],w.stock);
  for(const m of RM)vals[m].push(x[m]-y[m]);
  disagree+=+(x.canPlay!==y.canPlay);
  if(JSON.stringify(w)!==snapshot)throw Error('world mutated');
 }
 const base=q.evaluate(c,worlds);
 if(JSON.stringify(s)!==before)throw Error('source mutated');
 const {state,...row}=c;
 return {...row,byPolicy:base.byPolicy,replyDelta:Object.fromEntries(RM.map(m=>[m,mean(vals[m])])),replyDisagreementRate:disagree/worlds};
}
function summary(rows,field,metrics){
 return Object.fromEntries(metrics.map(m=>{const a=rows.map(x=>field(x,m));
  return[m,{mean:mean(a),ci95Position:ci(a),positivePositions:a.filter(x=>x>0).length,negativePositions:a.filter(x=>x<0).length,zeroPositions:a.filter(x=>x===0).length}];}));
}
function run(start=1098000,scan=50000,limit=12,worlds=30){
 if(![start,scan,limit,worlds].every(Number.isInteger)||scan<1||limit<1||worlds<1)throw Error('bad args');
 const rows=[];let scanned=0;
 for(let seed=start;seed<start+scan&&rows.length<limit;seed++){scanned++;const c=find(seed);if(c)rows.push(evaluate(c,worlds));}
 if(!rows.length)throw Error('no eligible positions');
 return {schema:'qosa-late-equal-accessible-reply/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9 later-round',
  seedScanRequested:[start,start+scan-1],seedScanActual:[start,start+scanned-1],scannedDeals:scanned,
  selectedPositions:rows.length,selectedSeeds:rows.map(x=>x.seed),worldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
  forcedContinuations:rows.length*worlds*4,newFullStrategyRounds:0,priorVerifiedFullRounds:215520,
  strategies:['connector-X-Y-retain-X-X','unrelated-equal-pips-retain-X-X'],continuationPolicies:POL,
  worldSeed:'(Math.imul(dealSeed,1009)+Math.imul(seat+1,1000003)+worldIndex+21000000)>>>0',
  selection:'first eligible per independent deal; focal hand 4..5; clockwise next opponent <=3; equal discarded pips and accessible-end count; X-X and second connector retained',
  structuralLimit:'focal hand 3 cannot satisfy X-X + two X-Y connectors + unrelated U-V: minimum 4 tiles',
  summary:{reply:summary(rows,(x,m)=>x.replyDelta[m],RM),
   continuation:Object.fromEntries(POL.map(p=>[p,summary(rows,(x,m)=>x.byPolicy[p][m],CM)])),
   replyDisagreementRate:mean(rows.map(x=>x.replyDisagreementRate)),
   byNextHandSize:Object.fromEntries([1,2,3].map(k=>[k,{n:rows.filter(x=>x.nextHandSize===k).length,replyCanPlayDelta:mean(rows.filter(x=>x.nextHandSize===k).map(x=>x.replyDelta.canPlay))}]))},
  limitations:'end-number identities differ; uniform hidden allocations ignore history; first eligible selection; provisional branch semantics; two deterministic bots; block winner unassigned; exploratory uncorrected position CIs; small late sample; not human-play causal evidence',
  nextAction:'Independent late holdout with focal 4..5 and next <=3, stratify by end-number overlap; for focal 3 use a less-controlled design',
  positions:rows};
}
function test(){const c=find(1099589);if(!c||c.handSize!==5||c.nextHandSize!==3)throw Error('fixture');
 const x=run(1099589,1,1,2),y=run(1099589,1,1,2);
 if(JSON.stringify(x)!==JSON.stringify(y)||x.forcedContinuations!==8)throw Error('replay');
 return {passed:true,seed:1099589,forcedContinuations:8};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1098000),+(a[1]||50000),+(a[2]||12),+(a[3]||30)),null,2));}
module.exports={find,reply,evaluate,run,test};
