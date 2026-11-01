'use strict';
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer'),strat=require('./strategy-runner');
const MIXES=[['random-legal','min-hand-pips','closed-branch-control'],['fast-doubles','moderate-double-hold','closed-branch-control']];
function setMin(v){const m=Math.min(...v);return v.map((x,i)=>x===m?i:-1).filter(i=>i>=0);}
function classifyBlock(pips,tileCounts,lastPasser){const minPips=setMin(pips),fewestTiles=setMin(tileCounts);return{minPips,fewestTiles,lastPasser:[lastPasser],noWinner:[],lastPasserInMinPips:minPips.includes(lastPasser),lastPasserInFewestTiles:fewestTiles.includes(lastPasser),candidateSetsEqual:JSON.stringify(minPips)===JSON.stringify(fewestTiles)};}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function timestamp(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';}
function run(seedStart=3415120,deals=500){
 if(!Number.isInteger(seedStart)||!Number.isInteger(deals)||deals<1||deals>50000)throw Error('invalid seed range');
 const z={schema:'qosha-block-winner-identity-sensitivity/v1',timestampAsiaBaku:timestamp(),engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; global number-unlock model provisional',seedStart,seedEnd:seedStart+deals-1,seedDraws:deals,uniqueAllocations:0,duplicateAllocationSeeds:[],rounds:0,finishes:0,blocks:0,unresolved:0,minPipUnique:0,minPipTied:0,fewestTilesUnique:0,fewestTilesTied:0,lastPasserInMinPipsSet:0,lastPasserOutsideMinPipsSet:0,lastPasserInFewestTilesSet:0,lastPasserOutsideFewestTilesSet:0,sameCandidateSets:0,differentCandidateSets:0,bothUniqueSameWinner:0,bothUniqueDifferentWinner:0,onlyMinPipsUnique:0,onlyFewestTilesUnique:0,bothTied:0,minPipCandidateByStrategy:{},fewestTileCandidateByStrategy:{},lastPasserCandidateByStrategy:{},examples:[],strategies:MIXES,seatRotations:3,assumptions:['Block winner candidates are end-of-round identity diagnostics only.','Minimum pips is a candidate, not authenticated.','Fewest tiles is a contrast metric only.','Last passer is diagnostic only.','Current model assigns no block winner; no scoring or 101-match outcome is inferred.']};
 const seen=new Set();
 for(let seed=seedStart;seed<seedStart+deals;seed++){
  const deal=e.dealThreeByNine(seed),fp=deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+deal.stock.map(e.tileKey).sort().join(',');
  if(seen.has(fp))z.duplicateAllocationSeeds.push(seed);else seen.add(fp);
  const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});if(base.kind!=='ready')throw Error('initializer '+seed);
  for(let mix=0;mix<MIXES.length;mix++)for(let rotation=0;rotation<3;rotation++){
   const policies=[0,1,2].map(p=>MIXES[mix][(p+rotation)%3]);let s=r.cloneRoundState(base),lastActor=null;
   for(let turn=0;turn<200&&!s.outcome;turn++){const before=s,p=before.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock),action=opts.phase==='play'?strat.chooseBy(policies[p],opts,{seed,rotation,turns:s.turns,player:p,salt:mix+1}):null;s=r.stepRound(before,()=>action);lastActor=p;}
   z.rounds++;if(!s.outcome||s.outcome.kind==='unresolved'){z.unresolved++;continue;}if(s.outcome.kind==='finish'){z.finishes++;continue;}if(s.outcome.kind!=='block')throw Error('unknown outcome');
   z.blocks++;if(s.stock.length!==0||s.consecutivePasses<3||!Number.isInteger(lastActor))throw Error('block contract');
   const pips=s.hands.map(e.pipSum),counts=s.hands.map(h=>h.length),c=classifyBlock(pips,counts,lastActor);
   if(c.minPips.length===1)z.minPipUnique++;else z.minPipTied++;if(c.fewestTiles.length===1)z.fewestTilesUnique++;else z.fewestTilesTied++;
   if(c.lastPasserInMinPips)z.lastPasserInMinPipsSet++;else z.lastPasserOutsideMinPipsSet++;if(c.lastPasserInFewestTiles)z.lastPasserInFewestTilesSet++;else z.lastPasserOutsideFewestTilesSet++;
   if(c.candidateSetsEqual)z.sameCandidateSets++;else z.differentCandidateSets++;
   if(c.minPips.length===1&&c.fewestTiles.length===1){if(c.minPips[0]===c.fewestTiles[0])z.bothUniqueSameWinner++;else z.bothUniqueDifferentWinner++;}else if(c.minPips.length===1)z.onlyMinPipsUnique++;else if(c.fewestTiles.length===1)z.onlyFewestTilesUnique++;else z.bothTied++;
   const mn=c.minPips.length===1?policies[c.minPips[0]]:'tie',fn=c.fewestTiles.length===1?policies[c.fewestTiles[0]]:'tie',ln=policies[lastActor];
   z.minPipCandidateByStrategy[mn]=(z.minPipCandidateByStrategy[mn]||0)+1;z.fewestTileCandidateByStrategy[fn]=(z.fewestTileCandidateByStrategy[fn]||0)+1;z.lastPasserCandidateByStrategy[ln]=(z.lastPasserCandidateByStrategy[ln]||0)+1;
   if(z.examples.length<20)z.examples.push({seed,mix,rotation,pips,tileCounts:counts,lastPasser:lastActor,minPipsSet:c.minPips,fewestTilesSet:c.fewestTiles,policies});
  }
 }
 z.uniqueAllocations=seen.size;z.duplicateAllocations=deals-z.uniqueAllocations;z.blockRate=z.rounds?z.blocks/z.rounds:null;z.minPipUniqueRate=z.blocks?z.minPipUnique/z.blocks:null;z.fewestTilesUniqueRate=z.blocks?z.fewestTilesUnique/z.blocks:null;z.lastPasserInMinPipsRate=z.blocks?z.lastPasserInMinPipsSet/z.blocks:null;z.candidateSetAgreement=z.blocks?z.sameCandidateSets/z.blocks:null;return z;
}
function test(){const a=classifyBlock([3,3,8],[1,2,1],1);if(JSON.stringify(a.minPips)!=='[0,1]'||JSON.stringify(a.fewestTiles)!=='[0,2]'||!a.lastPasserInMinPips||a.lastPasserInFewestTiles||a.candidateSetsEqual)throw Error('identity fixture');const b=classifyBlock([1,4,8],[2,2,1],2);if(JSON.stringify(b.minPips)!=='[0]'||JSON.stringify(b.fewestTiles)!=='[2]'||b.lastPasserInMinPips||!b.lastPasserInFewestTiles)throw Error('unique fixture');const x=run(3415120,8),y=run(3415120,8);delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;if(JSON.stringify(x)!==JSON.stringify(y)||x.rounds!==48||x.unresolved!==0)throw Error('replay');return{passed:true,assertions:8,pilotDeals:8,pilotRounds:48};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(+(process.argv[2]||3415120),+(process.argv[3]||500)),null,2));
module.exports={run,test,classifyBlock,setMin};
