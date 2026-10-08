'use strict';
// node qosha-research/simulator/branch-side-sensitivity.js 110000 120000 10 25
// First vs last qualifying side in the SAME position and hidden worlds.
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer'),base=require('./connector-gap-pressure');
const {chooseBy}=require('./strategy-runner'),{runHiddenWorlds}=require('./hidden-world');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
function lastChoice(s){
 const original=e.SIDES.slice();
 try{e.SIDES.reverse();return base.eligible(s);}
 finally{e.SIDES.splice(0,e.SIDES.length,...original);}
}
function collect(start=110000,end=120000,quota=10){
 const positions=[],cells={};let lastScanned=start-1;
 for(let seed=start;seed<end;seed++){
  lastScanned=seed;
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')continue;
  while(!s.outcome&&s.turns<100){
   const first=base.eligible(s),last=first&&lastChoice(s);
   if(first&&last&&first.side!==last.side){
    const oppMin=Math.min(...s.hands.filter((h,j)=>j!==s.currentPlayer).map(h=>h.length));
    const cell=s.hands[s.currentPlayer].length+':'+(oppMin<=3?'late':'early');
    if((cells[cell]||0)<quota){
     const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
     positions.push({seed,cell,oppMin,focal:s.currentPlayer,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),first,last});
     cells[cell]=(cells[cell]||0)+1;
    }break;
   }
   s=r.stepRound(s,(o,st)=>chooseBy('min-hand-pips',o,{seed,turns:st.turns,player:st.currentPlayer}));
  }
  if(Object.keys(cells).length===4&&Object.values(cells).every(x=>x>=quota))break;
 }
 return{positions,cells,lastScanned};
}
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function stat(a){if(!a.length)return null;const m=mean(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,ci95:[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]};}
function analyze(p,n,policy){
 const s=p.state,spec={focalPlayer:p.focal,focalHand:s.hands[p.focal],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
 const worlds=runHiddenWorlds(spec,{count:n,startSeed:7200000+1000*p.seed,continuationStrategy:policy,maxTurns:200});
 const acc={first:{finish:[],pips:[],minus:[]},last:{finish:[],pips:[],minus:[]}};
 let continuations=0,opposite=0;
 for(const world of worlds.results){
  const map=new Map(world.candidates.map(x=>[x.actionKey,x]));continuations+=world.candidates.length;
  const f={};
  for(const label of ['first','last']){
   const c=p[label],lo=map.get(c.spendLow),hi=map.get(c.spendHigh);
   if(!lo||!hi||lo.outcome==='unresolved'||hi.outcome==='unresolved')throw Error('missing/unresolved candidate '+p.seed);
   f[label]=(+lo.focalFinishedFirst)-(+hi.focalFinishedFirst);
   acc[label].finish.push(f[label]);acc[label].pips.push(lo.focalRemainder-hi.focalRemainder);
   acc[label].minus.push(+(lo.focalMinus<0)-+(hi.focalMinus<0));
  }
  if(f.first*f.last<0)opposite++;
 }
 const a=Object.fromEntries(['first','last'].map(k=>[k,Object.fromEntries(['finish','pips','minus'].map(m=>[m,mean(acc[k][m])]))]));
 a.diff=Object.fromEntries(['finish','pips','minus'].map(m=>[m,a.last[m]-a.first[m]]));
 return{seed:p.seed,cell:p.cell,oppMin:p.oppMin,firstSide:p.first.side,lastSide:p.last.side,firstGap:p.first.high-p.first.low,lastGap:p.last.high-p.last.low,worldSeedStart:7200000+1000*p.seed,continuations,oppositeWorldRate:opposite/n,...a};
}
function run(start=110000,end=120000,quota=10,worlds=25){
 const sel=collect(start,end,quota);if(sel.positions.length!==quota*4)throw Error('incomplete quota '+JSON.stringify(sel.cells));
 const rows={},summary={};let continuations=0;
 for(const policy of POLICIES){
  rows[policy]=sel.positions.map(p=>analyze(p,worlds,policy));continuations+=rows[policy].reduce((s,x)=>s+x.continuations,0);
  summary[policy]={};
  for(const [name,a] of Object.entries({all:rows[policy],late:rows[policy].filter(x=>x.oppMin<=3),early:rows[policy].filter(x=>x.oppMin>=4)})){
   summary[policy][name]=Object.fromEntries(['first','last','diff'].flatMap(side=>['finish','pips','minus'].map(metric=>[side+'_'+metric,stat(a.map(x=>x[side][metric]))])));
   summary[policy][name].oppositeWorldRate=stat(a.map(x=>x.oppositeWorldRate));
  }
 }
 return{schema:'qosa-branch-side-sensitivity/v1',timestampAsiaBaku:'2026-10-08 21:51 +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  seedScan:[start,sel.lastScanned],selectedSeeds:sel.positions.map(p=>p.seed),cells:sel.cells,positionCount:sel.positions.length,worldsPerPosition:worlds,newHiddenWorlds:sel.positions.length*worlds,continuations,
  priorHiddenWorlds:38130,cumulativeHiddenWorlds:38130+sel.positions.length*worlds,priorFullRounds:180000,newFullRounds:0,
  discovery:'first multi-qualifying-side position per seed, min-hand-pips, balanced 4/5 hand x opponent <=3/>=4',
  worldSeedFormula:'7200000+1000*dealSeed+worldIndex',policies:POLICIES,
  comparison:'keep HIGH minus keep LOW, positive finish better, positive pips worse; diff=last-side minus first-side; same state/worlds for both sides',
  limitations:'Assumed branch rules, bot selection, exploratory CIs, no multiple-testing correction, side-specific gap/geometry confounded, no block winner',summary,rows};
}
function selfTest(){
 const s=collect(110000,110200,2);if(s.positions.length!==8)throw Error('quota');
 const p=s.positions[0],before=JSON.stringify(p.state),a=analyze(p,2,'min-hand-pips'),b=analyze(p,2,'min-hand-pips');
 if(JSON.stringify(a)!==JSON.stringify(b)||before!==JSON.stringify(p.state))throw Error('replay/immutability');
 return{passed:true,positions:s.positions.length};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?selfTest():run(...args.map(Number)),null,2));}
module.exports={lastChoice,collect,analyze,run,selfTest};
