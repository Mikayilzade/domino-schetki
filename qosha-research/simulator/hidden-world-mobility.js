'use strict';
// Uniform hidden-world paired decision study, NOT a history-conditioned posterior.
// Only own hand + public played tile identities + opponent hand counts + stock size are retained.
// Four-branch number locking is PROVISIONAL; finish-first is not match victory.
// node qosha-research/simulator/hidden-world-mobility.js test
// node qosha-research/simulator/hidden-world-mobility.js 1561060 40 12
const e=require('./engine'), d=require('./turn-dispatcher'), r=require('./round-driver');
const init=require('./initializer'), h=require('./mobility-hybrid-holdout');
const ARMS=['mobility-hybrid','tempo-hybrid'];
const MIXES=[['closed-branch-control','closed-branch-control'],['random-legal','closed-branch-control']];
const check=(x,m)=>{if(!x)throw Error('hidden-world: '+m);};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ci(a){const m=mean(a);return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):null};}
function key(a){return [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');}
function tiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function mobility(s,opts,a){const tr=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,a);
 return new Set(d.actionsForHand(tr.branchState,tr.openingState,tr.hand).flatMap(x=>tiles(x).map(e.tileKey))).size;}
function visibleFromState(s,seat){
 const all=[...s.hands.flat(),...s.stock].map(e.tileKey);
 check(new Set(all).size===all.length,'duplicate in remaining stones');
 const occupied=new Set(all),deck=e.createDoubleSixDeck();
 const played=deck.filter(t=>!occupied.has(e.tileKey(t)));
 check(played.length+all.length===28,'deck conservation');
 return{focalHand:s.hands[seat].map(t=>[...t]),played,
  otherCounts:[s.hands[(seat+1)%3].length,s.hands[(seat+2)%3].length],
  stockCount:s.stock.length};
}
function sampleHidden(s,seat,randomSeed,worldIndex){
 const v=visibleFromState(s,seat),known=new Set([...v.focalHand,...v.played].map(e.tileKey));
 const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t))).map(t=>[...t]);
 check(pool.length===v.otherCounts[0]+v.otherCounts[1]+v.stockCount,'unknown pool');
 let x=e.mixSeed32((randomSeed^Math.imul(worldIndex+1,0x9e3779b9))>>>0);
 const rand=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
 for(let i=pool.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}
 const out=r.cloneRoundState(s);let offset=0;
 for(let k=0;k<2;k++){const p=(seat+k+1)%3,n=v.otherCounts[k];
  out.hands[p]=pool.slice(offset,offset+n);offset+=n;}
 out.stock=pool.slice(offset);
 check(out.stock.length===v.stockCount,'stock count');
 check(JSON.stringify(out.hands[seat])===JSON.stringify(v.focalHand),'focal unchanged');
 return out;
}
function continuation(world,action,seat,profiles,seed){
 let s=r.cloneRoundState(world),forced=false,nextMobility=null;
 while(!s.outcome&&s.turns<200){
  if(forced&&s.currentPlayer===seat&&nextMobility===null)
   nextMobility=new Set(d.actionsForHand(s.branchState,s.openingState,s.hands[seat]).flatMap(a=>tiles(a).map(e.tileKey))).size;
  s=r.stepRound(s,(opts,t)=>{
   if(!forced){forced=true;const hit=opts.actions.find(a=>key(a)===key(action));
    check(!!hit,'forced action missing');return hit;}
   return h.choose(profiles[t.currentPlayer],opts,t,seed,seat);
  });
 }
 check(!!s.outcome&&s.outcome.kind!=='unresolved','continuation unresolved');
 const won=s.outcome.kind==='finish'&&s.outcome.playerIndex===seat;
 return{first:+won,pips:e.pipSum(s.hands[seat]),minus:+(won&&s.outcome.minus<0),
  block:+(s.outcome.kind==='block'),nextMobility};
}
function summarize(rows){
 const seeds=[...new Set(rows.map(x=>x.seed))];
 const bySeed=seeds.map(seed=>rows.filter(x=>x.seed===seed));
 const out={positions:rows.length,deals:seeds.length,
  hiddenWorlds:rows.reduce((s,x)=>s+x.worlds,0),
  forcedContinuations:2*rows.reduce((s,x)=>s+x.worlds,0)};
 for(const [field,mul] of [['deltaFirst',1],['deltaPips',1],['deltaMinus',1],['deltaBlock',1]]){
  out[field]=ci(bySeed.map(g=>mean(g.map(x=>x[field]))*mul));
 }
 out.immediateProxyGain=mean(rows.map(x=>x.proxyGain));
 out.nextMobilityGain=mean(rows.filter(x=>x.nextObserved).map(x=>x.nextGain));
 out.nextObservedWorldPairs=rows.reduce((s,x)=>s+x.nextObserved,0);
 out.openingTypeSwitches=rows.filter(x=>x.openingTypeSwitch).length;
 out.bySwitch={};
 for(const kind of ['opening-switch','same-type']){
  const subset=rows.filter(x=>(x.openingTypeSwitch?'opening-switch':'same-type')===kind);
  out.bySwitch[kind]={positions:subset.length,deltaFirstPP:mean(subset.map(x=>x.deltaFirst)),deltaPips:mean(subset.map(x=>x.deltaPips))};
 }
 return out;
}
function run(start=1561060,count=40,worldCount=12){
 check(Number.isInteger(start)&&Number.isInteger(count)&&count>=2&&count%2===0&&count<=1000,'seed range');
 check(Number.isInteger(worldCount)&&worldCount>=2&&worldCount<=100,'world count');
 const rows=[];let baselineRounds=0,finishes=0,blocks=0,turnTotal=0;
 const minus={'-10':0,'-20':0,'-30':0,'-40':0};let sampledWorlds=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
   let s=r.cloneRoundState(base);const seen=new Set();
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(s.currentPlayer===seat&&opts.phase==='play'&&opts.actions.length>1){
     const ctrl=h.choose('closed-branch-control',opts,s,seed,seat);
     for(let ai=0;ai<ARMS.length;ai++){
      const arm=ARMS[ai];if(seen.has(arm))continue;
      const alt=h.choose(arm,opts,s,seed,seat);
      if(key(ctrl)===key(alt))continue;
      seen.add(arm);
      const salt=(seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mi+1,0xc2b2ae35)^Math.imul(ai+1,0x27d4eb2d)^Math.imul(s.turns+1,0x165667b1))>>>0;
      const c=[],a=[];let nextGain=0,nextObserved=0;
      const original=JSON.stringify(s);
      for(let wi=0;wi<worldCount;wi++){
       const world=sampleHidden(s,seat,salt,wi);
       const cc=continuation(world,ctrl,seat,profiles,seed);
       const aa=continuation(world,alt,seat,profiles,seed);
       c.push(cc);a.push(aa);
       if(cc.nextMobility!==null&&aa.nextMobility!==null){nextGain+=aa.nextMobility-cc.nextMobility;nextObserved++;}
      }
      check(JSON.stringify(s)===original,'source state mutated');
      sampledWorlds+=worldCount;
      rows.push({seed,seat,mix:mi,arm,turn:s.turns,handSize:s.hands[seat].length,
       controlType:ctrl.type,hybridType:alt.type,
       openingTypeSwitch:(ctrl.type==='double-sequence')!==(alt.type==='double-sequence'),
       proxyGain:mobility(s,opts,alt)-mobility(s,opts,ctrl),
       worlds:worldCount,nextObserved,nextGain:nextObserved?nextGain/nextObserved:null,
       deltaFirst:100*(mean(a.map(x=>x.first))-mean(c.map(x=>x.first))),
       deltaPips:mean(a.map(x=>x.pips))-mean(c.map(x=>x.pips)),
       deltaMinus:100*(mean(a.map(x=>x.minus))-mean(c.map(x=>x.minus))),
       deltaBlock:100*(mean(a.map(x=>x.block))-mean(c.map(x=>x.block)))});
     }
    }
    s=r.stepRound(s,(o,st)=>h.choose(profiles[st.currentPlayer],o,st,seed,seat));
   }
   check(!!s.outcome&&s.outcome.kind!=='unresolved','baseline unresolved');
   baselineRounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}
   else blocks++;
  }
 }
 const mid=start+count/2,summary={};
 for(const [cohort,filter] of [['discovery',x=>x.seed<mid],['holdout',x=>x.seed>=mid],['combined',()=>true]]){
  summary[cohort]={};
  for(const arm of ARMS){
   summary[cohort][arm]=summarize(rows.filter(x=>filter(x)&&x.arm===arm));
   for(let mi=0;mi<MIXES.length;mi++)
    summary[cohort][arm+'|'+MIXES[mi].join('+')]=summarize(rows.filter(x=>filter(x)&&x.arm===arm&&x.mix===mi));
  }
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-hidden-world-mobility/v1',timestampAsiaBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0, 3x9; four-side number lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],holdout:[mid,start+count-1],
  arms:ARMS,opponentMixes:MIXES,worldsPerDecision:worldCount,
  baselineRounds,finishes,blocks,unresolved:0,meanBaselineTurns:turnTotal/baselineRounds,minusFinishes:minus,
  positions:rows.length,hiddenWorldSamples:sampledWorlds,forcedHiddenWorldContinuations:2*sampledWorlds,
  summary,rows,
  design:'First changed choice per hybrid per baseline seat and opponent mix; hold focal hand and played tile identities fixed; sample uniform unknown opponent hands/stock by counts. Both actions share identical sampled hidden world and continuation policies. Discovery/holdout split by deal; seed-cluster exploratory 95% normal CI uncorrected.',
  limitations:'Sampler is uniform over unknown allocations and does NOT condition on pass/draw/choice history; not calibrated posterior for a real table. Hidden pool reconstructed from union of all actual unknown stones, which equals complement of public played and own hand; assignment is discarded before resampling. Multiple selected states within deal correlate. Number-lock/four-side provisional; block winner, loneZero, bust and 101-match unvalidated. Finish-first != match victory.',
  next:'Condition hidden worlds on publicly observed passes/draws; replicate on larger disjoint seeds, stratify opening switches; authenticate branch lock/open and block scoring.'};
}
function test(){
 check(require('./four-branch-lock-kernel-test').test().passed,'four-branch');
 check(require('./scoring-contract-test').test().passed,'scoring');
 const s=init.initializeThreePlayerRound({seed:1561060,isFirstRound:false,previousWinnerIndex:0});
 const a=sampleHidden(s,0,123,0),b=sampleHidden(s,0,123,0);
 check(JSON.stringify(a)===JSON.stringify(b),'sample replay');
 const swapped=r.cloneRoundState(s);[swapped.hands[1],swapped.hands[2]]=[swapped.hands[2],swapped.hands[1]];
 // Reordering hidden hands is allowed only if counts match; test public-invariance with same counts.
 if(swapped.hands[1].length===s.hands[1].length)
  check(JSON.stringify(sampleHidden(swapped,0,123,0))===JSON.stringify(a),'no hidden assignment leakage');
 const x=run(1561060,2,2),y=run(1561060,2,2);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'run replay');
 check(x.baselineRounds===12&&x.forcedHiddenWorldContinuations===2*x.hiddenWorldSamples,'accounting');
 return{passed:true,fixtureRounds:12,positions:x.positions,forced:x.forcedHiddenWorldContinuations};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1561060),+(a[1]||40),+(a[2]||12)),null,2));}
module.exports={run,test,visibleFromState,sampleHidden,ARMS,MIXES};
