'use strict';
// Stratify paired late-return candidate comparisons by exact branch signature
// and count of focal hand tiles shared across low/high chronological extensions.
// Both physical late-arrival branch models remain PROVISIONAL.
// node qosha-research/simulator/late-return-common-candidate-strata.js [start=3398216] [count=2048]
const assert=require('node:assert/strict');
const {sample}=require('./late-return-hidden-holdout');
const {advance}=require('./late-return-second-cycle-holdout');
const {actions,key}=require('./late-return-rule-sensitivity');
const {evaluate}=require('./late-return-voluntary-double-stop');
const MODELS=['global-ever-open','all-current-only'];
const STYLES=['low','high','double-first','double-last'];
const STOPS=['single','greedy'];
const id=a=>key(a.t)+'@'+(a.side===null?'D':a.side);
function candidates(states){
 const b=new Set(actions(states[1],1).filter(a=>a.side!==null).map(id));
 const seen=new Set();
 return actions(states[0],1).filter(a=>a.side!==null&&b.has(id(a))&&!seen.has(id(a))&&seen.add(id(a)));
}
function bits(xs){return xs.map(Number).join('');}
function extensionSignature(states){
 const g=states[0],c=states[1];
 return 'ends='+g.ends.join(',')+';G='+bits(g.unlocked)+';C='+bits(c.unlocked)+
  ';open='+[...g.opened].sort((a,b)=>a-b).join('');
}
function compareExtension(ext,c){
 let passes=0,legalStoneSum=0,extraDoubleSum=0;
 for(let mi=0;mi<2;mi++)for(const style of STYLES)for(const stop of STOPS){
  const r=evaluate(ext.states[mi],c,style,stop);
  passes+=Number(r.pass);legalStoneSum+=r.legalStones;
  extraDoubleSum+=r.extraDoubles.reduce((a,b)=>a+b,0);
 }
 return {passes,safe:passes===0,meanReturnLegalStones:legalStoneSum/16,extraDoubleSum};
}
function one(seed){
 const hands=sample(seed),lo=advance(hands,'low'),hi=advance(hands,'high');
 const lowAccepted=!!lo.accepted,highAccepted=!!hi.accepted;
 const lc=lowAccepted?candidates(lo.states):[],hc=highAccepted?candidates(hi.states):[];
 const lowCandidateEligible=lowAccepted&&lc.length>=2,highCandidateEligible=highAccepted&&hc.length>=2;
 if(!lowAccepted||!highAccepted)return {eligible:false,reason:'extension-not-accepted',lowAccepted,highAccepted,lowCandidateEligible,highCandidateEligible,lowCandidates:lc.length,highCandidates:hc.length};
 if(!lowCandidateEligible||!highCandidateEligible)return {eligible:false,reason:'fewer-than-two-candidates',lowAccepted,highAccepted,lowCandidateEligible,highCandidateEligible,lowCandidates:lc.length,highCandidates:hc.length};
 const hmap=new Map(hc.map(a=>[id(a),a]));
 const common=lc.filter(a=>hmap.has(id(a)));
 const lhand=new Set(lo.states[0].hands[1].map(key));
 const hhand=new Set(hi.states[0].hands[1].map(key));
 const matching=[...lhand].filter(t=>hhand.has(t)).length;
 const branchPair=extensionSignature(lo.states)+' => '+extensionSignature(hi.states);
 const sameHistory=lo.history.join('|')===hi.history.join('|');
 let lowOnly=0,highOnly=0,bothSafe=0,neitherSafe=0;
 let lowPass=0,highPass=0,lowMore=0,highMore=0,equal=0;
 for(const c of common){
  const a=compareExtension(lo,c),b=compareExtension(hi,c);
  if(sameHistory)assert.deepEqual(a,b,'same history must imply same candidate outcomes');
  lowPass+=a.passes;highPass+=b.passes;
  lowMore+=Number(a.passes>b.passes);highMore+=Number(b.passes>a.passes);equal+=Number(a.passes===b.passes);
  if(a.safe&&b.safe)bothSafe++;
  else if(a.safe)lowOnly++;
  else if(b.safe)highOnly++;
  else neitherSafe++;
 }
 return {eligible:true,seed,lowAccepted,highAccepted,lowCandidateEligible,highCandidateEligible,
  matchingHandTiles:matching,branchPair,sameHistory,
  lowCandidates:lc.length,highCandidates:hc.length,commonCandidates:common.length,
  lowOnly,highOnly,bothSafe,neitherSafe,lowPass,highPass,lowMore,highMore,equal};
}
function run(start=3398216,count=2048){
 assert(Number.isSafeInteger(start)&&start>=0&&Number.isInteger(count)&&count>0&&count<=10000);
 const out={schema:'qosha-late-return-common-candidate-strata/v1',
  engine:'qosa-research-0.5.3 + late-return-common-candidate-strata/v1',
  rules:'recovered qosa-1.0.0 3x9; both late-arrival branch models PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,seededConditionalWorlds:count,
  extensionPolicies:['low','high'],models:MODELS,opponentPolicies:STYLES,stopping:STOPS,
  lowExtensionAccepted:0,highExtensionAccepted:0,lowCandidateEligible:0,highCandidateEligible:0,
  eligibleWorlds:0,excludedExtension:0,excludedCandidateCount:0,
  worldsWithCommonCandidates:0,zeroCommonCandidateWorlds:0,
  commonCandidateComparisons:0,twoOpponentContinuations:0,
  sameHistoryWorlds:0,worldsWithAnySafetyFlip:0,worldsWithLowOnlySafe:0,worldsWithHighOnlySafe:0,
  lowOnlySafe:0,highOnlySafe:0,bothSafe:0,neitherSafe:0,
  lowPassOutcomes:0,highPassOutcomes:0,lowMorePassCandidates:0,highMorePassCandidates:0,equalPassCandidates:0,
  uniqueAllocations:0,matchingHandTileWorldHistogram:{},matchingHandTileCandidateHistogram:{},
  byMatchingHandTiles:{},branchSignatureStrata:[],
  completeRounds:0,fullGameContinuations:0};
 const allocations=new Set(),sigMap=new Map();
 for(let i=0;i<count;i++){
  const seed=start+i,h=sample(seed);
  allocations.add(h.map(hand=>hand.map(key).sort().join(',')).join('|'));
  if(i<16)assert.deepEqual(sample(seed),h,'same-seed allocation replay');
  const r=one(seed);
  if(i<16)assert.deepEqual(one(seed),r,'same-seed continuation replay');
  out.lowExtensionAccepted+=Number(r.lowAccepted);
  out.highExtensionAccepted+=Number(r.highAccepted);
  out.lowCandidateEligible+=Number(r.lowCandidateEligible);
  out.highCandidateEligible+=Number(r.highCandidateEligible);
  if(!r.eligible){
   if(r.reason==='extension-not-accepted')out.excludedExtension++;
   else out.excludedCandidateCount++;
   continue;
  }
  out.eligibleWorlds++;
  out.sameHistoryWorlds+=Number(r.sameHistory);
  const m=String(r.matchingHandTiles);
  out.matchingHandTileWorldHistogram[m]=(out.matchingHandTileWorldHistogram[m]||0)+1;
  if(r.commonCandidates>0)out.worldsWithCommonCandidates++;
  else out.zeroCommonCandidateWorlds++;
  const str=out.byMatchingHandTiles[m]||(out.byMatchingHandTiles[m]={
   worlds:0,candidates:0,lowOnlySafe:0,highOnlySafe:0,bothSafe:0,neitherSafe:0,
   worldsWithAnySafetyFlip:0,worldsWithLowOnlySafe:0,worldsWithHighOnlySafe:0});
  str.worlds++;str.candidates+=r.commonCandidates;
  str.lowOnlySafe+=r.lowOnly;str.highOnlySafe+=r.highOnly;
  str.bothSafe+=r.bothSafe;str.neitherSafe+=r.neitherSafe;
  str.worldsWithAnySafetyFlip+=Number(r.lowOnly+r.highOnly>0);
  str.worldsWithLowOnlySafe+=Number(r.lowOnly>0);
  str.worldsWithHighOnlySafe+=Number(r.highOnly>0);
  out.commonCandidateComparisons+=r.commonCandidates;
  out.twoOpponentContinuations+=r.commonCandidates*32;
  out.lowOnlySafe+=r.lowOnly;out.highOnlySafe+=r.highOnly;
  out.bothSafe+=r.bothSafe;out.neitherSafe+=r.neitherSafe;
  out.lowPassOutcomes+=r.lowPass;out.highPassOutcomes+=r.highPass;
  out.lowMorePassCandidates+=r.lowMore;out.highMorePassCandidates+=r.highMore;out.equalPassCandidates+=r.equal;
  out.worldsWithAnySafetyFlip+=Number(r.lowOnly+r.highOnly>0);
  out.worldsWithLowOnlySafe+=Number(r.lowOnly>0);
  out.worldsWithHighOnlySafe+=Number(r.highOnly>0);
  const candidateHistogram=out.matchingHandTileCandidateHistogram;
  candidateHistogram[m]=(candidateHistogram[m]||0)+r.commonCandidates;
  const sg=sigMap.get(r.branchPair)||{branchPair:r.branchPair,worlds:0,candidates:0,
   lowOnlySafe:0,highOnlySafe:0,bothSafe:0,neitherSafe:0};
  sg.worlds++;sg.candidates+=r.commonCandidates;
  sg.lowOnlySafe+=r.lowOnly;sg.highOnlySafe+=r.highOnly;
  sg.bothSafe+=r.bothSafe;sg.neitherSafe+=r.neitherSafe;
  sigMap.set(r.branchPair,sg);
 }
 out.uniqueAllocations=allocations.size;
 out.branchSignatureStrata=[...sigMap.values()].sort((a,b)=>b.candidates-a.candidates||b.worlds-a.worlds).slice(0,12);
 assert.equal(out.eligibleWorlds+out.excludedExtension+out.excludedCandidateCount,count);
 assert.equal(out.lowOnlySafe+out.highOnlySafe+out.bothSafe+out.neitherSafe,out.commonCandidateComparisons);
 assert.equal(out.lowMorePassCandidates+out.highMorePassCandidates+out.equalPassCandidates,out.commonCandidateComparisons);
 out.limitations='Reanalysis is conditional on one synthetic public prefix and sampled hidden allocations; low/high extensions are policy-selected, common legal candidates are a selected subset, and all branch models are provisional. Candidate rows within a world are correlated. No full-game win/minus/regret inference.';
 out.nextSeed=start+count;
 return out;
}
if(require.main===module){
 if(process.argv[2]==='test')console.log(JSON.stringify(run(3398216,64),null,2));
 else console.log(JSON.stringify(run(Number(process.argv[2]||3398216),Number(process.argv[3]||2048)),null,2));
}
module.exports={run,one,candidates,extensionSignature};
