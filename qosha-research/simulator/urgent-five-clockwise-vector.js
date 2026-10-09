'use strict';
// Frozen first-eligible seeds from 826000..1225999, seed%17===0.
// Reproduce: node qosha-research/simulator/urgent-five-clockwise-vector.js
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const base=require('./double-connector-urgency-holdout'),{chooseBy}=require('./strategy-runner');
const CELLS={
 '2-4/X0':[841483,849728,1072649,1162460,1176723,1206320],
 '4-2/X0':[847008,857174,863906,873222,894013,908429],
 '2-4/X2':[864280,882538,935697,942089,943806,949909,1029503,1065407,1103062,1108570,1155286,1164993],
 '4-2/X2':[826540,833119,835499,876826,887026,908293,926024,946424,961843,980560,983484,984946]
};
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const METRICS=['first','pips','minus','block','turns'];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0,h=1.96*sd/Math.sqrt(a.length);return{n:a.length,mean:m,ci95PositionNormalApprox:[m-h,m+h],positive:a.filter(x=>x>0).length,negative:a.filter(x=>x<0).length,ties:a.filter(x=>x===0).length};}
function clockwise(s){const f=s.currentPlayer;return[s.hands[(f+1)%3].length,s.hands[(f+2)%3].length];}
function recover(seed,cell){
 const [vector,targetText]=cell.split('/'),target=Number(targetText.slice(1));
 let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('initializer failed '+seed);
 while(!s.outcome&&s.turns<100){
  const choices=base.eligible(s);
  if(choices.length){
   const c=choices.find(z=>z.x===target&&z.handSize===5&&clockwise(s).join('-')===vector);
   if(!c)throw Error('frozen first eligible mismatch '+cell+' '+seed);
   if(s.stock.length||s.hands[s.currentPlayer].length!==5)throw Error('hand/stock invariant');
   const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
   return{seed,group:'urgent',focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),choice:c};
  }
  s=r.stepRound(s,(opts,st)=>chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 throw Error('no eligible position '+seed);
}
function summarize(rows){
 const grouped={};
 for(const cell of Object.keys(CELLS))grouped[cell]=rows.filter(z=>z.clockwiseOppSizes.join('-')+'/X'+z.target===cell);
 for(const v of ['2-4','4-2'])grouped['clockwise/'+v]=rows.filter(z=>z.clockwiseOppSizes.join('-')===v);
 return Object.fromEntries(Object.entries(grouped).map(([key,a])=>[key,{
  positions:a.length,exhaustiveWorlds:a.reduce((s,z)=>s+z.worlds,0),seeds:a.map(z=>z.seed),
  immediateNextOpponentFinishDiff:ci(a.map(z=>z.immediateNextOpponentFinishDiff)),
  immediateNextOpponentMinusDiff:ci(a.map(z=>z.immediateNextOpponentMinusDiff)),
  immediateThreatPositionCount:a.filter(z=>z.immediateNextOpponentFinishDiff>0).length,
  policies:Object.fromEntries(POLICIES.map(p=>[p,Object.fromEntries(METRICS.map(k=>[k,ci(a.map(z=>z.policyDiff[p][k]))]))]))
 }]));
}
function run(){
 const guard=base.selfTest(),positions=[],seen=new Set();
 for(const [cell,seeds] of Object.entries(CELLS))for(const seed of seeds){
  if(seen.has(seed)||seed<826000||seed>=1226000||seed%17!==0)throw Error('bad seed '+seed);
  seen.add(seed);positions.push(recover(seed,cell));
 }
 const rows=positions.map(p=>{
  const z=base.analyze(p,15);
  if(z.maxDistinctAllocations!==15||z.worlds!==15||new Set(z.worldSeedOffsets).size!==15)throw Error('not exhaustive '+p.seed);
  return{...z,clockwiseOppSizes:clockwise(p.state),focalPlayer:p.focal};
 });
 const first={...rows[0]};delete first.clockwiseOppSizes;delete first.focalPlayer;
 if(JSON.stringify(base.analyze(positions[0],15))!==JSON.stringify(first))throw Error('replay failed');
 const worlds=rows.reduce((s,z)=>s+z.worlds,0);
 if(rows.length!==36||worlds!==540)throw Error('scale mismatch');
 return{
  schema:'qosa-urgent-five-clockwise-vector/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'})+' +04:00',
  engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedScan:'826000..1225999; seed%17===0; first eligible reachable state per seed with closed-branch-control',
  selectedByCell:CELLS,
  opponentVectorMeaning:'clockwise [NEXT, FOLLOWING], NOT player-index order',
  comparison:'X-X double opening now MINUS X-Y connector; same position, hidden worlds, side-neutral continuation',
  focalHandSize:5,targets:[0,2],worldSeedFormula:'22000000+1000*dealSeed+attemptOffset',
  hiddenAllocationMethod:'all 15 unique C(6,2) allocations per position, deterministic rejection sampling; offsets in rows',
  policies:POLICIES.map(p=>'side-neutral-'+p),
  positionCount:rows.length,newHiddenWorlds:worlds,pairedCandidateContinuations:worlds*2*POLICIES.length,
  newFullStrategyRounds:0,cumulativeCreditedHiddenWorlds:97391+worlds,cumulativeCreditedCompleteRounds:180000,
  validation:{baseSelfTest:guard,distinctPositionSeeds:true,firstPositionExactReplay:true,allWorldsExhaustive:true,allContinuationsResolved:true},
  summary:summarize(rows),rows,
  limitations:['Assumption-labelled branch locking; official block winner unknown','Previous opponentSizes arrays were in numeric player-index order, not clockwise','X4 excluded: insufficient next2 positions','Exhaustive worlds conditional on selected states, not exhaustive deals','Bots, first-eligible selection and board-state differences limit generalization','Exploratory unadjusted position-level normal CIs; Node CLI pending','5-player and loneZero unvalidated'],
  exactNextAction:'Disjoint seeds: next opponent=2, focal hand 3/4/5; isolate double openings that enable immediate finish, minus risk, and connector counterexamples.'
 };
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={CELLS,clockwise,recover,summarize,run};
