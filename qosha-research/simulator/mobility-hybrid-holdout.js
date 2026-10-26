'use strict';
// Matched 3x9 policy stress test: branch control vs mobility/tempo hybrids.
// Number-lock and four-side geometry are PROVISIONAL, not authenticated table rules.
// node qosha-research/simulator/mobility-hybrid-holdout.js test
// node qosha-research/simulator/mobility-hybrid-holdout.js 1560580 240
const e=require('./engine'), d=require('./turn-dispatcher'), r=require('./round-driver');
const init=require('./initializer'), b=require('./strategy-runner');
const ARMS=['closed-branch-control','mobility-hybrid','tempo-hybrid'];
const MIXES=[['closed-branch-control','closed-branch-control'],
 ['random-legal','closed-branch-control'],['random-legal','tempo-hybrid']];
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const median=a=>{if(!a.length)return null;const z=[...a].sort((x,y)=>x-y),n=z.length;return n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2;};
const ci=a=>{const m=mean(a),v=a.length>1?a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1):0;
 return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(v/a.length):null};};
const check=(x,msg)=>{if(!x)throw Error('mobility-hybrid: '+msg);};
function key(a){return [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');}
function tiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function choose(name,opts,s,seed,seat){
 if(name==='closed-branch-control'||name==='random-legal'||name==='min-hand-pips')
  return b.chooseBy(name,opts,{seed,rotation:seat,turns:s.turns,player:s.currentPlayer});
 if(name!=='mobility-hybrid'&&name!=='tempo-hybrid')throw Error('unknown '+name);
 let best=null,bestScore=-Infinity,bestKey='';
 for(const action of opts.actions){
  const tr=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,action);
  const playable=d.actionsForHand(tr.branchState,tr.openingState,tr.hand);
  const distinct=new Set(playable.flatMap(a=>tiles(a).map(e.tileKey))).size;
  const shed=tiles(action).length,removed=e.pipSum(tiles(action));
  const opened=action.type==='double-sequence'?(action.numbers||[]).length:0;
  const finished=tr.hand.length===0;
  const score=finished?1e8:
   name==='mobility-hybrid'?(2.3*distinct+0.6*removed+2*shed-3*opened-(distinct===0?3:0)):
   (1.1*distinct+0.65*removed+4*shed-1.5*opened-(distinct===0?1:0));
  const k=key(action);
  if(score>bestScore+1e-9||(Math.abs(score-bestScore)<1e-9&&k<bestKey)){
   best=action;bestScore=score;bestKey=k;
  }
 }
 return best;
}
function summarize(rows){
 const out={observations:rows.length,distinctDeals:new Set(rows.map(x=>x[0])).size,byArm:{},pairedVsClosed:{}};
 const seeds=[...new Set(rows.map(x=>x[0]))],clusters=seeds.map(seed=>rows.filter(x=>x[0]===seed));
 for(let ai=0;ai<ARMS.length;ai++){
  const z=rows.map(x=>x[4+ai]);
  out.byArm[ARMS[ai]]={
   finishFirstRate:mean(z.map(x=>x[0])),meanFinalPips:mean(z.map(x=>x[1])),
   medianFinalPips:median(z.map(x=>x[1])),blockRate:mean(z.map(x=>x[3])),
   focalMinusFinishRate:mean(z.map(x=>+(x[2]<0))),meanRoundTurns:mean(z.map(x=>x[4])),
   meanStartingDoubles:mean(rows.map(x=>x[3].length)),
   meanEndingDoubles:mean(z.map(x=>x[5])),meanFocalDoubleOpenings:mean(z.map(x=>x[6])),
   meanFocalMultiChoicePoints:mean(z.map(x=>x[7]))};
  if(ai){
   const paired=f=>ci(clusters.map(group=>mean(group.map(x=>f(x[4+ai],x[4])))));
   out.pairedVsClosed[ARMS[ai]]={
    finishFirstDeltaPP:paired((a,c)=>100*(a[0]-c[0])),
    finalPipsDelta:paired((a,c)=>a[1]-c[1]),
    blockDeltaPP:paired((a,c)=>100*(a[3]-c[3])),
    minusFinishDeltaPP:paired((a,c)=>100*(+(a[2]<0)-+(c[2]<0))),
    focalOpeningDelta:paired((a,c)=>a[6]-c[6])};
  }
 }
 return out;
}
function run(start=1560580,count=240){
 check(Number.isInteger(start)&&Number.isInteger(count)&&count>=2&&count%2===0&&count<=2000,'arguments');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turns=0,unresolved=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initializer '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const doubles=base.hands[seat].filter(t=>t[0]===t[1]).map(t=>t[0]).sort((a,b)=>a-b);
   const results=[];
   for(let ai=0;ai<ARMS.length;ai++){
    const profiles=[];profiles[seat]=ARMS[ai];
    profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
    let opened=0,choices=0;
    const out=r.runRound(base,(opts,s)=>{
     const p=s.currentPlayer,action=choose(profiles[p],opts,s,seed,seat);
     if(p===seat){
      choices+=+(opts.actions.length>1);
      if(action.type==='double-sequence'||action.type==='mixed-finish')
       opened+=(action.numbers||[]).length;
     }
     return action;
    },{maxTurns:200});
    check(out.outcome.kind!=='unresolved','unresolved '+seed);
    rounds++;turns+=out.turns;
    if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minus[String(out.outcome.minus)]++;}
    else if(out.outcome.kind==='block')blocks++;
    else unresolved++;
    const won=out.outcome.kind==='finish'&&out.outcome.playerIndex===seat;
    results.push([+won,e.pipSum(out.hands[seat]),won?out.outcome.minus:0,
     +(out.outcome.kind==='block'),out.turns,out.hands[seat].filter(t=>t[0]===t[1]).length,opened,choices]);
   }
   rows.push([seed,seat,mi,doubles,...results]);
  }
 }
 const mid=start+count/2,summary={};
 for(const [name,filter] of [['discovery',x=>x[0]<mid],['holdout',x=>x[0]>=mid],['combined',()=>true]]){
  summary[name]={};
  for(let mi=0;mi<MIXES.length;mi++)
   summary[name][MIXES[mi].join('+')]=summarize(rows.filter(x=>filter(x)&&x[2]===mi));
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-mobility-hybrid-holdout/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; 3x9; number-lock/four-side PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,mid-1],
  holdout:[mid,start+count-1],arms:ARMS,opponentMixes:MIXES,
  fullRounds:rounds,finishes,blocks,unresolved,meanTurns:turns/rounds,minusFinishes:minus,summary,
  rowFormat:'[seed,focalSeat,mixIndex,initialDoubleNumbers,closed[finish,pips,minus,block,turns,endingDoubles,openings,choices],mobility[same],tempo[same]]',
  rows,design:'Same seeded deal, seat and opponent mix for each focal arm. Three seats, three opponent mixes, three arms. Seed-disjoint 50/50 discovery and holdout. Paired 95% normal exploratory half-width clustered by deal; no multiplicity correction.',
  hybridDefinition:'For each legal action, apply provisional kernel to score own next-turn distinct playable tile identities. Mobility: 2.3*playable+0.6*discardPips+2*discardTiles-3*newDoubleOpenings-3*noNextPlay. Tempo: 1.1*playable+0.65*discardPips+4*discardTiles-1.5*newDoubleOpenings-1*noNextPlay. Immediate empty-hand finish overrides; stable lexical tie break. These are heuristic probes, not optimized strategies.',
  limitations:'Number locking/four-side geometry provisional; block winner, loneZero, bust, 101-point match scoring unvalidated. Finish-first != match win. Repeated seat/mix trajectories correlate; uncertainty exploratory and uncorrected. Opponent bots are not humans. Mobility is a proxy computed with current public branch state and own hand, not an opponent-model posterior. No new hidden-world regret estimates.',
  next:'Independently replicate any promising hybrid on fresh disjoint seeds; compare on same hidden worlds at multi-choice states, stratify opening-vs-single decisions. Authenticate real four-branch locking and block winner before human advice.'};
}
function test(){
 const four=require('./four-branch-lock-kernel-test'),score=require('./scoring-contract-test');
 check(four.test().passed&&score.test().passed,'kernel and scoring fixtures');
 const x=run(1560580,2),y=run(1560580,2);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'deterministic replay');
 check(x.fullRounds===54&&x.rows.length===18&&x.unresolved===0,'round accounting');
 for(const mix of Object.values(x.summary.combined)){
  for(const arm of Object.values(mix.byArm)){
   check(arm.blockRate>=0&&arm.blockRate<=1,'block rate');
   check(arm.focalMinusFinishRate>=0&&arm.focalMinusFinishRate<=1,'minus rate');
   check(Number.isFinite(arm.meanRoundTurns),'mean turns');
  }
 }
 return{passed:true,replayDeals:2,replayRounds:54,contract:'four-branch synthetic and scoring fixtures'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1560580),+(a[1]||240)),null,2));}
module.exports={run,test,ARMS,MIXES,choose};