'use strict';
// Reproduce: node qosha-research/simulator/equal-accessible-holdout.js 1092000 6000 40 40
// Equal pip sum AND equal count of currently accessible ends; end-number identities are NOT controlled.
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer'),h=require('./hidden-world');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const POL=['closed-branch-control','moderate-double-hold'];
const MET=['first','pips','minus','block','turns'];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function accessible(s){return e.SIDES.filter(z=>s.branchState.branches[z].active&&s.openingState.openedNumbers.has(s.branchState.branches[z].end));}
function eligible(s){
 const seat=s.currentPlayer,hand=s.hands[seat],next=s.hands[(seat+1)%3];
 if(hand.length<4||hand.length>7||next.length>5||s.stock.length)return null;
 const opts=d.turnOptions(s.branchState,s.openingState,hand,s.stock);
 if(opts.phase!=='play'||opts.drawn)return null;
 const singles=opts.actions.filter(a=>a.type==='single');
 for(let x=0;x<=6;x++){
  if(!hand.some(t=>t[0]===x&&t[1]===x))continue;
  const connectors=hand.filter(t=>t[0]!==t[1]&&t.includes(x));
  if(connectors.length<2)continue;
  for(const a of singles.filter(z=>z.tile.includes(x))){
   if(!connectors.some(t=>e.tileKey(t)!==e.tileKey(a.tile)))continue;
   for(const b of singles.filter(z=>!z.tile.includes(x)&&e.pipSum([z.tile])===e.pipSum([a.tile]))){
    const A=d.applyTurn(s.branchState,s.openingState,hand,s.stock,a),B=d.applyTurn(s.branchState,s.openingState,hand,s.stock,b);
    if(accessible(A).length!==accessible(B).length)continue;
    const sig=z=>e.SIDES.map(k=>z.branchState.branches[k].end).sort((p,q)=>p-q).join(',');
    if(sig(A)===sig(B))throw Error('distinct-tile full geometry unexpectedly identical');
    return {seat,x,connector:actionKey(a),other:actionKey(b),pips:e.pipSum([a.tile]),
      accessibleCount:accessible(A).length,accessibleNumbersConnector:accessible(A).map(z=>A.branchState.branches[z].end).sort(),
      accessibleNumbersOther:accessible(B).map(z=>B.branchState.branches[z].end).sort(),handSize:hand.length,nextHandSize:next.length};
   }
  }
 }
 return null;
}
function find(seed){
 let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('init unresolved '+seed);
 while(!s.outcome&&s.turns<200){
  const c=eligible(s);if(c)return {...c,seed,turn:s.turns,state:s};
  s=r.stepRound(s,(o,v)=>chooseBy('closed-branch-control',o,{seed,turns:v.turns,player:v.currentPlayer}));
 }
 if(!s.outcome)throw Error('discovery unresolved '+seed);return null;
}
function forced(world,key,policy,seed){
 let first=true;
 const out=r.runRound(world,(opts,s)=>{
  if(first){first=false;const a=opts.actions.find(x=>actionKey(x)===key);if(!a)throw Error('forced action absent');return a;}
  return chooseBy(policy,opts,{seed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 if(out.outcome.kind==='unresolved')throw Error('continuation unresolved');
 const win=out.outcome.kind==='finish'&&out.outcome.playerIndex===world.currentPlayer;
 return {first:+win,pips:e.pipSum(out.hands[world.currentPlayer]),minus:+(win&&out.outcome.minus<0),
  block:+(out.outcome.kind==='block'),turns:out.turns};
}
function evaluate(c,n){
 const s=c.state,before=JSON.stringify(s),live=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 const spec={visibleState:s,focalPlayer:c.seat,focalHand:s.hands[c.seat],
  knownTiles:e.createDoubleSixDeck().filter(t=>!live.has(e.tileKey(t))),
  hiddenHandSizes:s.hands.map(t=>t.length),stockSize:s.stock.length};
 const diffs=Object.fromEntries(POL.map(p=>[p,Object.fromEntries(MET.map(k=>[k,[]]))]));
 for(let k=0;k<n;k++){
  const ws=(Math.imul(c.seed,1009)+Math.imul(c.seat+1,1000003)+k+21000000)>>>0;
  const w=h.sampleWorld(spec,ws),snapshot=JSON.stringify(w);
  for(const p of POL){
   const a=forced(w,c.connector,p,ws),b=forced(w,c.other,p,ws);
   for(const key of MET)diffs[p][key].push(a[key]-b[key]);
  }
  if(JSON.stringify(w)!==snapshot)throw Error('hidden world mutated');
 }
 if(JSON.stringify(s)!==before)throw Error('visible state mutated');
 const {state,...row}=c;
 return {...row,byPolicy:Object.fromEntries(POL.map(p=>[p,Object.fromEntries(MET.map(k=>[k,mean(diffs[p][k])]))]))};
}
function ci(a){if(a.length<2)return null;const m=mean(a),se=Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length*(a.length-1)));return [m-1.96*se,m+1.96*se];}
function summarize(rows){return Object.fromEntries(POL.map(p=>[p,Object.fromEntries(MET.map(k=>{const v=rows.map(x=>x.byPolicy[p][k]);return[k,{mean:mean(v),ci95:ci(v)}];}))]));}
function run(start=1092000,scan=6000,limit=40,worlds=40){
 if(![start,scan,limit,worlds].every(Number.isInteger)||scan<1||limit<1||worlds<1)throw Error('bad args');
 const rows=[];let scanned=0;
 for(let seed=start;seed<start+scan&&rows.length<limit;seed++){scanned++;const c=find(seed);if(c)rows.push(evaluate(c,worlds));}
 if(!rows.length)throw Error('no eligible positions; widen search');
 return {schema:'qosa-equal-accessible-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',seedScanRequested:[start,start+scan-1],seedScanActual:[start,start+scanned-1],
  scannedDeals:scanned,selectedPositions:rows.length,selectedSeeds:rows.map(x=>x.seed),worldsPerPosition:worlds,
  hiddenAllocations:rows.length*worlds,forcedContinuations:rows.length*worlds*POL.length*2,
  newFullStrategyRounds:0,priorVerifiedFullRounds:215520,
  strategies:['connector-X-Y-retain-X-X','unrelated-equal-pips-retain-X-X'],
  continuationPolicies:POL,worldSeed:'(Math.imul(dealSeed,1009)+Math.imul(seat+1,1000003)+worldIndex+21000000)>>>0',
  selection:'first reachable matched ordinary action pair per deal; 4..7 focal tiles; next opponent <=5; equal discarded pips, same accessible-end count, X-X and another X-Y retained',
  limitations:'different accessible end NUMBER values despite equal count; provisional branch opening semantics; uniform hidden worlds ignore prior opponent decisions; first eligible per deal; two fixed bots; block winner unassigned; uncorrected exploratory position-level normal intervals; not human-play causal evidence',
  summary:summarize(rows),positions:rows};
}
function test(){const a=find(1082030),b=find(1082030);if(!a||JSON.stringify({...a,state:null})!==JSON.stringify({...b,state:null}))throw Error('discovery replay');
 const x=run(1082030,50,1,2),y=run(1082030,50,1,2);if(JSON.stringify(x)!==JSON.stringify(y)||x.forcedContinuations!==8)throw Error('world replay');return{passed:true,seed:x.selectedSeeds[0],continuations:x.forcedContinuations};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1092000),+(a[1]||6000),+(a[2]||40),+(a[3]||40)),null,2));}
module.exports={accessible,eligible,find,forced,evaluate,run,test};
