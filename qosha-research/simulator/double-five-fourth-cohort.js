'use strict';
// Fourth disjoint 5-5 structural holdout; synthetic two-return mobility, NOT full-game win rate.
// node qosha-research/simulator/double-five-fourth-cohort.js test
// node qosha-research/simulator/double-five-fourth-cohort.js 2813544 64
const base=require('./double-hand-perturbation');
const strata=require('./double-connectivity-strata');
const names=['Z0/S0','Z+/S0','Z0/S+','Z+/S+'];
const plans=[['single0/low','single0','low'],['single6/high','single6','high'],['chain06/high','chain06','high'],['chain06/low','chain06','low']];
const models=['global-ever-open','all-current-only'];
const opponentPolicies=['high','low','double-first'];
const assert=(v,msg)=>{if(!v)throw Error(msg);};
function mix(z){z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}
function world(pool,seed){const a=pool.slice();let z=mix(seed)||0x9e3779b9;for(let i=a.length-1;i>0;i--){z^=z<<13;z^=z>>>17;z^=z<<5;const j=Math.floor((z>>>0)/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}return{h0:a.slice(0,6),h1:a.slice(6)};}
function selected(){const old=new Set(strata.choose(24).map(x=>x.signature));const a=strata.choose(32).filter(x=>Number(x.id.split('-').at(-1))>=24);assert(a.length===32,'32 new hands');assert(a.every(x=>!old.has(x.signature)),'no cohort overlap');for(const s of names)assert(a.filter(x=>x.features.stratum===s).length===8,'8 per stratum');return a;}
function safeFlags(w,focal){return plans.map(([,action,fp])=>{for(const model of models)for(const op of opponentPolicies){const r=base.simulate(model,action,w,op,fp,focal);if(r.terminal!=='none'||r.secondPass!==0)return false;}return true;});}
function test(){const baseline=base.test(),strataChecks=strata.test(),a=selected(),v=strata.variant(a[0]);assert(base.exactWorlds(v.pool).length===924,'924 worlds');assert(JSON.stringify(world(v.pool,2813544))===JSON.stringify(world(v.pool,2813544)),'replay');return{passed:true,baseline,strataChecks,selectedHands:a.length,disjoint:true,seedReplay:true};}
function run(start=2813544,samplesPerHand=64){
 assert(Number.isInteger(start)&&start>=2813544&&Number.isInteger(samplesPerHand)&&samplesPerHand>0,'seed arguments');
 const checks=test(),hands=selected(),rows=[];
 for(let i=0;i<hands.length;i++){
  const x=hands[i],v=strata.variant(x),worlds=base.exactWorlds(v.pool);assert(worlds.length===924,'world count');
  const safe=[0,0,0,0],sample=[0,0,0,0],chainVs0=[0,0,0,0],chainVs6=[0,0,0,0];
  for(const w of worlds){const a=safeFlags(w,v.focal);for(let k=0;k<4;k++)safe[k]+=+a[k];chainVs0[(+a[2])*2+(+a[0])]++;chainVs6[(+a[2])*2+(+a[1])]++;}
  for(let j=0;j<samplesPerHand;j++){const a=safeFlags(world(v.pool,start+i*samplesPerHand+j),v.focal);for(let k=0;k<4;k++)sample[k]+=+a[k];}
  assert(chainVs0.reduce((a,b)=>a+b,0)===924&&chainVs6.reduce((a,b)=>a+b,0)===924,'matched contingency');
  assert(chainVs0[1]+chainVs0[3]===safe[0]&&chainVs0[2]+chainVs0[3]===safe[2],'matched marginals');
  rows.push({id:x.id,hand:x.hand.map(t=>t.join('-')),stratum:x.features.stratum,has55:x.hand.some(t=>t.join('-')==='5-5'),safe,sample,chainVs0,chainVs6});
 }
 const groups=names.map(s=>{const r=rows.filter(x=>x.stratum===s),yes=r.filter(x=>x.has55),no=r.filter(x=>!x.has55);assert(yes.length&&no.length,'5-5 both groups');const avg=(a,k)=>a.reduce((v,x)=>v+x.safe[k],0)/(a.length*924);return{stratum:s,with55:yes.length,without55:no.length,chain55:avg(yes,2),chainNo55:avg(no,2),gap:avg(yes,2)-avg(no,2)};});
 const total=k=>rows.reduce((v,x)=>v+x.safe[k],0),cross=k=>[0,1,2,3].map(i=>rows.reduce((v,x)=>v+x[k][i],0));
 const overall=plans.map((p,k)=>({plan:p[0],safe:total(k),rate:total(k)/(rows.length*924)}));
 const out={schema:'qosha-double-five-fourth-cohort/v1',engine:'qosa-research-0.5.3 + double-five-fourth-cohort-1.0 (analysis only)',rules:'recovered qosa-1.0.0 3x9; both branch models PROVISIONAL',newFullRounds:0,newOpeningDeals:0,newForcedContinuations:0,seedRange:[start,start+hands.length*samplesPerHand-1],newHiddenAllocations:hands.length*samplesPerHand,exactConditionalPartitions:hands.length*924,checks,selection:'Unseen hash-ranked hands indices 24..31 per zero/six connector stratum, disjoint from prior three cohorts',plans:plans.map(x=>x[0]),groups,balancedGap:groups.reduce((v,x)=>v+x.gap,0)/4,overall,crossChainVs0:cross('chainVs0'),crossChainVs6:cross('chainVs6'),chainBetterHands:rows.filter(x=>x.safe[2]>x.safe[0]).length,chainTiedHands:rows.filter(x=>x.safe[2]===x.safe[0]).length,chainBetterHandsWith55:rows.filter(x=>x.has55&&x.safe[2]>x.safe[0]).length,has55Hands:rows.filter(x=>x.has55).length,sampleMaxAbsoluteError:Math.max(...rows.flatMap(x=>x.safe.map((v,k)=>Math.abs(v/924-x.sample[k]/samplesPerHand)))),metric:'Robust safety: no earlier terminal and a legal focal move on second return in ALL 2 branch interpretations x 3 greedy opponent policies. Cross arrays indexed 0=neither safe, 1=single-only, 2=chain-only, 3=both safe; exact paired hidden partition.',limitations:['Synthetic fixed public history and 6+6 opponent hands, not real observed history','Two branch interpretations and opponent continuations provisional','5-5 association across different hands is not causal; tiny 5-5 stratum cells','Exact partitions across hands are conditional evaluations, not independent random draws','No full-round wins, minus, block ties, loneZero or 101 scoring claims'],nextAction:'Authenticate physical late-arrival branch rule and block ties; evaluate matched within-hand policies on authenticated chronological pass-conditioned positions, not more blind 5-5 cohorts.',rows};
 assert(out.crossChainVs0.reduce((a,b)=>a+b,0)===rows.length*924,'total paired worlds');
 return out;
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2813544),+(a[1]||64)),null,2));}
module.exports={test,run,selected,safeFlags,world};
