'use strict';
const late=require('./branch-late-hand-strata');
const ab=require('./branch-unlock-delay-ablation');
const e=require('./engine');
const PROFILES=['min-hand-pips','closed-branch-control'];
const GROUPS=['1','2','3-4'];
function fingerprint(w){return w.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+w.stock.map(e.tileKey).sort().join(',');}
function mean(xs){return xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;}
function ci(xs){if(!xs.length)return{n:0,mean:null,halfWidth95:null};const m=mean(xs),v=xs.length>1?xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1):0;return{n:xs.length,mean:m,halfWidth95:xs.length>1?1.96*Math.sqrt(v/xs.length):null};}
function auditDeals(scan){
 const seen=new Map(),duplicates=[];let draws=0,tileChecks=0,shapeChecks=0;
 for(const profile of PROFILES){const w=scan[profile];for(let seed=w.seedStart;seed<=w.seedEnd;seed++){
  const deal=e.dealThreeByNine(seed);if(deal.hands.length!==3||deal.hands.some(h=>h.length!==9)||deal.stock.length!==1)throw Error('deal shape '+seed);
  const all=[...deal.hands.flat(),...deal.stock].map(e.tileKey);if(all.length!==28||new Set(all).size!==28)throw Error('tile conservation '+seed);
  tileChecks++;shapeChecks++;const fp=deal.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'#'+deal.stock.map(e.tileKey).sort().join(',');
  draws++;if(!seen.has(fp))seen.set(fp,seed);else duplicates.push({firstSeed:seen.get(fp),duplicateSeed:seed,profile});
 }}
 return{seedDealDraws:draws,uniqueCompleteAllocations:seen.size,duplicateAllocations:duplicates.length,duplicateSeedPairs:duplicates,tileConservationChecks:tileChecks,dealShapeChecks:shapeChecks};
}
function run(start=3416220,count=2400,quota=12,worlds=24){
 if(![start,count,quota,worlds].every(Number.isInteger)||count<2||count%2||quota<1||worlds<1||worlds>128)throw Error('invalid args');
 const disc=late.collect(start,count,quota),rows=[],profiles={};let draws=0,uniqueTotal=0,duplicates=0,essTotal=0,minUnique=Infinity,maxUnique=0,paired=0;const duplicateSeedPairs=[];
 for(const pos of disc.positions){
  const seen=new Map(),counts=new Map(),before=JSON.stringify(pos.state);
  for(let i=0;i<worlds;i++){const seed=(4000000000+(pos.seed-start)*256+pos.seat*64+i)>>>0,world=ab.sample(pos,seed),fp=fingerprint(world);draws++;counts.set(fp,(counts.get(fp)||0)+1);
   if(!seen.has(fp))seen.set(fp,{world,seed,index:i});else{const first=seen.get(fp);duplicateSeedPairs.push({visibleSeed:pos.seed,profile:pos.profile,seat:pos.seat,firstIndex:first.index,duplicateIndex:i,firstSeed:first.seed,duplicateSeed:seed});}}
  const unique=[...seen.values()],n=unique.length,sumSq=[...counts.values()].reduce((s,c)=>s+c*c,0),ess=worlds*worlds/sumSq;
  uniqueTotal+=n;duplicates+=worlds-n;essTotal+=ess;minUnique=Math.min(minUnique,n);maxUnique=Math.max(maxUnique,n);
  const totals={win:0,pips:0,minus:0,block:0,nextPass:0,nextPlayable:0,immediateNextFinish:0,turns:0,remainingDoubles:0},minusCounts={immediate:{},delayed:{}};
  for(const item of unique){const im=ab.rollout(item.world,pos,pos.profile,item.seed,false),de=ab.rollout(item.world,pos,pos.profile,item.seed,true);if(im.handAfter!==de.handAfter)throw Error('paired focal hand mismatch');
   for(const k of Object.keys(totals))totals[k]+=(im[k]-de[k])/n;
   for(const [arm,v] of [['immediate',im],['delayed',de]])minusCounts[arm][v.minusCode]=(minusCounts[arm][v.minusCode]||0)+1;paired+=2;}
  if(JSON.stringify(pos.state)!==before)throw Error('source mutation');
  rows.push({seed:pos.seed,profile:pos.profile,seat:pos.seat,turn:pos.turn,group:pos.group,nextHandSize:pos.nextHandSize,focalHandSize:pos.focalHandSize,number:pos.number,startingDoubles:pos.state.hands[pos.seat].filter(t=>t[0]===t[1]).length,draws:worlds,uniqueWorlds:n,duplicateDraws:worlds-n,drawEss:ess,minusCounts,...Object.fromEntries(Object.entries(totals).map(([k,v])=>[k+'Delta',v]))});
 }
 for(const profile of PROFILES){profiles[profile]={};for(const group of GROUPS){const sub=rows.filter(x=>x.profile===profile&&x.group===group),metric=k=>ci(sub.map(x=>x[k])),opp=metric('immediateNextFinishDelta'),win=metric('winDelta'),minus=metric('minusDelta'),block=metric('blockDelta'),minusSummary={};
  for(const arm of ['immediate','delayed']){minusSummary[arm]={};for(const code of ['none','0','-10','-20','-30','-40'])minusSummary[arm][code]=sub.reduce((s,x)=>s+(x.minusCounts[arm][code]||0),0);}
  profiles[profile][group]={positions:sub.length,hiddenWorldDraws:sub.reduce((s,x)=>s+x.draws,0),uniqueWorlds:sub.reduce((s,x)=>s+x.uniqueWorlds,0),duplicateDraws:sub.reduce((s,x)=>s+x.duplicateDraws,0),meanUniqueWorlds:mean(sub.map(x=>x.uniqueWorlds)),meanDrawEss:mean(sub.map(x=>x.drawEss)),pairedContinuations:2*sub.reduce((s,x)=>s+x.uniqueWorlds,0),nextPassDelta:metric('nextPassDelta'),nextPlayableDelta:metric('nextPlayableDelta'),nextOpponentFinishDeltaPP:{mean:100*opp.mean,halfWidth95:100*opp.halfWidth95},focalFinishFirstDeltaPP:{mean:100*win.mean,halfWidth95:100*win.halfWidth95},focalRemainderPipsDelta:metric('pipsDelta'),focalMinusFinishDeltaPP:{mean:100*minus.mean,halfWidth95:100*minus.halfWidth95},blockDeltaPP:{mean:100*block.mean,halfWidth95:100*block.halfWidth95},turnLengthDelta:metric('turnsDelta'),meanStartingDoubles:mean(sub.map(x=>x.startingDoubles)),focalMinusCounts:minusSummary};
 }}
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-late-next-hand-unlock-delay-dedup/v1',timestampAsiaBaku:stamp,engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; global number-unlock model PROVISIONAL',startSeed:start,reservedEndSeed:start+count-1,seedWindows:disc.scan,allocationAudit:auditDeals(disc.scan),uniqueDiscoveryDeals:Object.values(disc.scan).reduce((s,x)=>s+x.dealsScanned,0),discoveryRounds:disc.fullRounds,discoveryFinishes:disc.finishes,discoveryBlocks:disc.blocks,discoveryUnresolved:disc.unresolved,positions:rows.length,worldsPerPositionRequested:worlds,hiddenWorldDraws:draws,uniqueWorldAssignmentsWithinVisibleStates:uniqueTotal,duplicateWorldDraws:duplicates,meanUniqueWorldsPerPosition:rows.length?uniqueTotal/rows.length:null,minUniqueWorldsPerPosition:rows.length?minUnique:null,maxUniqueWorldsPerPosition:rows.length?maxUnique:null,meanDrawEss:rows.length?essTotal/rows.length:null,postDedupPairedContinuations:paired,profiles,rows,duplicateSeedPairs,worldSeedFormula:'(4000000000+(dealSeed-startSeed)*256+seat*64+worldIndex)>>>0',selection:'One eligible position per unique seed/profile; next opponent hand-size strata 1, 2, 3-4; disjoint profile seed windows. Existing late-strata collector uses seeded symmetric opening follow-up side selection; continuation policies use action-orbit tie-break.',intervention:'Both arms force the same legal single double. Immediate arm unlocks the number now; delayed arm artificially hides it for exactly the next opponent turn, then unlocks. Delayed arm is NOT a legal move.',sampler:'Uniform conditional hidden allocation from unseen double-six tiles with observed no-stock pass exclusions; deduplicated within each visible state. No opponent action-choice likelihood.',limitations:'Position-cluster approximate 95% intervals are exploratory. Global number-unlock geometry remains provisional; synthetic previous winner; simple continuation policies; delayed arm nonlegal; no block winner, loneZero, bust/101 match scoring. Mechanism sensitivity only, not tactic promotion.',nextAction:'On fresh seeds 3418620 onward, compare the opening double with actual legal alternative actions under identical hidden worlds, stratified by next-opponent hand size; continue seeking an authentic branch/block rule trace.'};
}
function test(){const x=run(3416220,800,1,3),y=run(3416220,800,1,3);delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;if(JSON.stringify(x)!==JSON.stringify(y)||x.positions!==6||x.discoveryUnresolved||x.uniqueWorldAssignmentsWithinVisibleStates>x.hiddenWorldDraws||x.duplicateWorldDraws!==x.hiddenWorldDraws-x.uniqueWorldAssignmentsWithinVisibleStates||x.duplicateSeedPairs.length!==x.duplicateWorldDraws||x.allocationAudit.uniqueCompleteAllocations!==x.allocationAudit.seedDealDraws||x.allocationAudit.tileConservationChecks!==x.allocationAudit.seedDealDraws)throw Error('deterministic/dedup/allocation regression');return{passed:true,assertions:8,positions:x.positions,draws:x.hiddenWorldDraws,uniqueWorlds:x.uniqueWorldAssignmentsWithinVisibleStates,duplicates:x.duplicateWorldDraws,dealAllocations:x.allocationAudit.uniqueCompleteAllocations};}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||3416220),+(args[1]||2400),+(args[2]||12),+(args[3]||24)),null,2));}
module.exports={run,test,fingerprint};
