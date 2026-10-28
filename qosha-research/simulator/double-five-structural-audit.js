'use strict';
// Reanalyse pre-existing exact 924-partition datasets. No new simulated deals/worlds.
// Run: node qosha-research/simulator/double-five-structural-audit.js
const fs=require('fs'),path=require('path');
const STRATA=["Z0/S0","Z+/S0","Z0/S+","Z+/S+"];
const PLANS=["single0/low","single6/high","chain06/high","chain06/low"];
const paths=["runs/2026-10-28-2254-double-connectivity-strata.json","runs/2026-10-28-2347-double-connectivity-holdout.json"];
function assert(v,msg){if(!v)throw Error(msg);}

function has55(r){return r.hand.includes("5-5");}

function score(r,p){return r.exact[p].safe/924;}

function mean(v,p){return v.reduce((a,r)=>a+score(r,p),0)/v.length;}

function group(rows,p){const yes=rows.filter(has55),no=rows.filter(r=>!has55(r));return{with55:{hands:yes.length,safeFraction:mean(yes,p)},without55:{hands:no.length,safeFraction:mean(no,p)},rawDifference:mean(yes,p)-mean(no,p)};}

function stratified(rows,p){const strata=STRATA.map(s=>{const r=rows.filter(x=>x.features.stratum===s);const g=group(r,p);return{stratum:s,...g};});return{strata,balancedDifference:strata.reduce((a,x)=>a+x.rawDifference,0)/4};}

function rng(seed){let z=seed>>>0;return()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};}

function bootstrap(rows,p,seed,B){const random=rng(seed),groups=STRATA.map(s=>{const r=rows.filter(x=>x.features.stratum===s);return[r.filter(has55),r.filter(x=>!has55(x))];});const results=[];for(let b=0;b<B;b++){let total=0;for(const [yes,no] of groups){let y=0,n=0;for(let i=0;i<yes.length;i++)y+=score(yes[Math.floor(random()*yes.length)],p);for(let i=0;i<no.length;i++)n+=score(no[Math.floor(random()*no.length)],p);total+=(y/yes.length-n/no.length)/4;}results.push(total);}results.sort((a,b)=>a-b);return{seed,replicates:B,percentile95:[results[Math.floor(B*.025)],results[Math.floor(B*.975)]]};}

function permutation(rows,p,seed,B){const random=rng(seed),groups=STRATA.map(s=>{const r=rows.filter(x=>x.features.stratum===s);return{scores:r.map(x=>score(x,p)),nYes:r.filter(has55).length};});const observed=stratified(rows,p).balancedDifference;let exceed=0;for(let b=0;b<B;b++){let total=0;for(const {scores,nYes} of groups){const a=scores.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const y=a.slice(0,nYes).reduce((x,z)=>x+z,0)/nYes,n=a.slice(nYes).reduce((x,z)=>x+z,0)/(a.length-nYes);total+=(y-n)/4;}if(Math.abs(total)>=Math.abs(observed)-1e-12)exceed++;}return{seed,replicates:B,twoSidedExploratoryP:(exceed+1)/(B+1),extremePermutations:exceed};}

function analyze(discovery,holdout){
 const datasets=[{name:"discovery",data:discovery},{name:"holdout",data:holdout}];
 const ids=new Set();for(const {name,data} of datasets){assert(data.rows.length===32,name+" 32 hands");for(const s of STRATA)assert(data.rows.filter(x=>x.features.stratum===s).length===8,name+" 8 per stratum");for(const r of data.rows){const sig=r.hand.slice().sort().join("|");assert(!ids.has(sig),"disjoint focal hands");ids.add(sig);assert(PLANS.every(p=>Number.isInteger(r.exact[p].safe)&&r.exact[p].safe>=0&&r.exact[p].safe<=924),"valid exact count");}}
 const cohorts={};for(const {name,data} of datasets){const rows=data.rows;cohorts[name]={hands:rows.length,exactPartitions:rows.length*924,groups:Object.fromEntries(PLANS.map(p=>[p,group(rows,p)])),balanced:Object.fromEntries(PLANS.map(p=>[p,stratified(rows,p)])),chainVsSingle0:{chainBetterHands:rows.filter(r=>r.exact["chain06/high"].safe>r.exact["single0/low"].safe).length,chainEqualHands:rows.filter(r=>r.exact["chain06/high"].safe===r.exact["single0/low"].safe).length}};}
 const p="chain06/high";const boot=bootstrap(holdout.rows,p,0x5a551029,10000),perm=permutation(holdout.rows,p,0x5a55102a,10000);
 assert(cohorts.discovery.balanced[p].strata.every(s=>s.rawDifference>0),"discovery four strata positive");
 assert(cohorts.holdout.balanced[p].strata.every(s=>s.rawDifference>0),"holdout four strata positive");
 return{schema:"qosha-double-five-structural-audit/v1",timestampAsiaBaku:"2026-10-29 00:51 +04:00",engine:"qosa-research-0.5.3 + double-five-structural-audit-1.0 (analysis only)",rules:"recovered qosa-1.0.0 3x9; two branch interpretations PROVISIONAL",sourceFiles:paths.map(p=>"qosha-research/"+p),newDeals:0,newHiddenAllocations:0,newFullRounds:0,newForcedContinuations:0,reusedExactHandWorldPartitions:64*924,seedRangeForNewSimulations:null,priorHiddenSeedRanges:[[2807400,2809447],[2809448,2811495]],statisticalResamplingSeeds:[0x5a551029,0x5a55102a],checks:{disjointHands:64,perStratumPerCohort:8,exactPartitionsPerHand:924,allEightStratumCohortEffectsPositive:true},cohorts,holdoutBootstrap:boot,holdoutPermutation:perm,interpretation:"5-5 predicts higher six-scenario second-return mobility when both 0-0 and 6-6 are spent, across all four zero/six-connector strata in both previously sampled cohorts. Post-hoc feature search, not causal or a winning tactic. Retaining 0-0 or 6-6 generally remains safer in this synthetic metric.",limitations:["No fresh deals or hidden worlds this run: reanalysis of prior exact enumerations","5-5 feature chosen after exploring multiple candidate features including holdout; bootstrap and permutation are exploratory, not confirmatory","Different focal hands imply different hidden tile pools; feature association not a matched causal tile replacement","Eight hands per stratum per cohort, hash-selected not representative","Both branch models and greedy opponent continuation policies unverified","Metric is robust mobility across six non-equiprobable scenarios, not win probability, minus or scoring"],nextAction:"Pre-register 5-5 prediction and test fresh hash-ranked hands 16..23 in each connector stratum, with 924 exact partitions per hand and matched plans; seek authentic late-arrival branch and block-tie fixtures."};
}
if(require.main===module){
 const [discovery,holdout]=paths.map(p=>JSON.parse(fs.readFileSync(path.join(__dirname,'..',p.replace(/^runs\//,'runs/')),'utf8')));
 console.log(JSON.stringify(analyze(discovery,holdout),null,2));
}
module.exports={analyze,group,stratified,bootstrap,permutation};
