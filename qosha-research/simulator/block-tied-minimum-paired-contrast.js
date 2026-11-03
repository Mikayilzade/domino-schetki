'use strict';
const audit=require('./block-tied-minimum-stratified-audit');
const MODELS=['global','currentAll','localFirst','localLast'];
function key(seed,model,mix,rotation){return[seed,model,mix,rotation].join('|');}
function traceIndex(traces){
 const out=new Map();
 for(const t of traces||[]){const k=key(t.seed,t.model,t.mix,t.rotation);if(out.has(k))throw new Error('duplicate trace key '+k);out.set(k,t);}
 return out;
}
function meanCI(values,lower,upper){
 const n=values.length;if(n<2)return{estimate:n?values[0]:null,se:null,ci95:null,n};
 const estimate=values.reduce((s,x)=>s+x,0)/n,ss=values.reduce((s,x)=>s+(x-estimate)*(x-estimate),0),se=Math.sqrt(ss/(n*(n-1)));
 let lo=estimate-1.96*se,hi=estimate+1.96*se;if(Number.isFinite(lower)){lo=Math.max(lower,lo);hi=Math.min(upper,hi);}
 return{estimate,se,ci95:[lo,hi],n};
}
function pairedBinaryValues(a,b){
 if(a.length!==b.length||a.length<2)throw new Error('paired vectors must have same length >= 2');
 const d=[];let sa=0,sb=0,discordant=0,aOnly=0,bOnly=0;
 for(let i=0;i<a.length;i++){if((a[i]!==0&&a[i]!==1)||(b[i]!==0&&b[i]!==1))throw new Error('binary values required');sa+=a[i];sb+=b[i];const x=b[i]-a[i];d.push(x);if(x!==0)discordant++;if(x<0)aOnly++;if(x>0)bOnly++;}
 const ci=meanCI(d,-1,1);return{n:a.length,rateA:sa/a.length,rateB:sb/b.length,diff:ci.estimate,se:ci.se,ci95:ci.ci95,discordant,aOnly,bOnly};
}
function validSeeds(result){const excluded=new Set(result.duplicateAllocationSeeds||[]),out=[];for(let s=result.seedStart;s<=result.seedEnd;s++)if(!excluded.has(s))out.push(s);if(out.length!==result.uniqueAllocations)throw new Error('unique seed census mismatch');return out;}
function analyze(result){
 const idx=traceIndex(result.traces||[]),seeds=validSeeds(result),cells=[],mixContrasts=[],rotationContrasts=[],interactions=[];
 const has=(s,m,mix,r)=>idx.has(key(s,m,mix,r))?1:0;
 for(const model of MODELS){
  for(let mix=1;mix<=2;mix++)for(let rotation=0;rotation<3;rotation++){
   const ts=seeds.map(s=>idx.get(key(s,model,mix,rotation))).filter(Boolean),n=ts.length;
   cells.push({model,mix,rotation,deals:seeds.length,tiedTraceCount:n,tiedTraceRate:n/seeds.length,
    lastPasserInMinPipSetRate:n?ts.filter(t=>t.lastPasserInMinPipSet).length/n:null,
    minPipVsFewestTileSetAgreementRate:n?ts.filter(t=>t.minPipVsFewestTileSetAgreement).length/n:null,
    meanMinPipCandidateSetSize:n?ts.reduce((s,t)=>s+t.minPipCandidates.length,0)/n:null});
  }
  for(let rotation=0;rotation<3;rotation++)mixContrasts.push({model,rotation,contrast:'mix 1 -> mix 2',...pairedBinaryValues(seeds.map(s=>has(s,model,1,rotation)),seeds.map(s=>has(s,model,2,rotation)))});
  for(let mix=1;mix<=2;mix++)for(let r1=0;r1<3;r1++)for(let r2=r1+1;r2<3;r2++)rotationContrasts.push({model,mix,rotationPair:r1+' vs '+r2,...pairedBinaryValues(seeds.map(s=>has(s,model,mix,r1)),seeds.map(s=>has(s,model,mix,r2)))});
  for(let r1=0;r1<3;r1++)for(let r2=r1+1;r2<3;r2++){const d=seeds.map(s=>(has(s,model,2,r1)-has(s,model,1,r1))-(has(s,model,2,r2)-has(s,model,1,r2)));interactions.push({model,rotationPair:r1+' vs '+r2,...meanCI(d,-2,2)});}
 }
 const hashes=(result.traces||[]).map(t=>t.traceChecksum).sort();let h=2166136261;
 for(const s of hashes){for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}h^=10;h=Math.imul(h,16777619);}
 return{schema:'qosha-block-tied-minimum-paired-contrast/v1',seedStart:result.seedStart,seedEnd:result.seedEnd,seedDraws:result.seedDraws,uniqueAllocations:result.uniqueAllocations,duplicateAllocationCount:(result.duplicateAllocationSeeds||[]).length,tiedTraceCount:hashes.length,traceChecksum:(h>>>0).toString(16).padStart(8,'0'),cells,mixContrasts,rotationContrasts,interactions};
}
function compareLeadingInteractions(discovery,holdout){
 return MODELS.map(model=>{const d=discovery.interactions.filter(x=>x.model===model).slice().sort((a,b)=>Math.abs(b.estimate)-Math.abs(a.estimate))[0],h=holdout.interactions.find(x=>x.model===model&&x.rotationPair===d.rotationPair);return{model,selectedRotationPair:d.rotationPair,discovery:{estimate:d.estimate,se:d.se,ci95:d.ci95,n:d.n},holdout:h?{estimate:h.estimate,se:h.se,ci95:h.ci95,n:h.n}:null,selection:'largest absolute discovery interaction among three rotation pairs; identical contrast fixed in disjoint holdout'};});
}
function run(seedStart=9004000,deals=2000,timestampOverride=null,verifyTraces=true){const raw=audit.run(seedStart,deals,timestampOverride,verifyTraces);return{raw,analysis:analyze(raw)};}
function test(){
 let assertions=0;const check=(v,m)=>{assertions++;if(!v)throw new Error('paired-contrast test: '+m);};
 const p=pairedBinaryValues([1,0,1,0],[0,1,1,0]);check(p.diff===0,'paired mean difference');check(p.discordant===2,'discordance count');check(p.aOnly===1&&p.bOnly===1,'discordant directions');check(p.ci95[0]<=0&&p.ci95[1]>=0,'CI includes zero');
 const fake={seedStart:10,seedEnd:13,seedDraws:4,uniqueAllocations:4,duplicateAllocationSeeds:[],traces:[]};
 fake.traces.push({seed:10,model:'global',mix:2,rotation:0,lastPasserInMinPipSet:false,minPipVsFewestTileSetAgreement:true,minPipCandidates:[0,1],traceChecksum:'a'});
 fake.traces.push({seed:11,model:'global',mix:2,rotation:0,lastPasserInMinPipSet:false,minPipVsFewestTileSetAgreement:true,minPipCandidates:[0,1],traceChecksum:'b'});
 const z=analyze(fake),c=z.mixContrasts.find(x=>x.model==='global'&&x.rotation===0),did=z.interactions.find(x=>x.model==='global'&&x.rotationPair==='0 vs 1');
 check(c.rateA===0&&c.rateB===0.5&&c.diff===0.5,'seed-paired mix contrast');check(did.estimate===0.5&&did.n===4,'difference-in-differences');check(z.cells.find(x=>x.model==='global'&&x.mix===2&&x.rotation===0).tiedTraceCount===2,'cell trace census');
 return{passed:true,assertions,checks:'paired binary rates/differences, discordance, cluster CI, cell census, mix-by-rotation difference-in-differences'};
}
module.exports={run,analyze,test,pairedBinaryValues,meanCI,compareLeadingInteractions};
