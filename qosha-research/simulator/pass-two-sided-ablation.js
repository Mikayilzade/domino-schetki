'use strict';
// Two-sided pass posterior ablation: fixed-visible matched action comparisons.
// Engine qosa-research-0.5.3; four-side number-lock PROVISIONAL.
// node qosha-research/simulator/pass-two-sided-ablation.js test
// node qosha-research/simulator/pass-conditioned-mobility.js 1561220 120 8
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),h=require('./mobility-hybrid-holdout'),u=require('./hidden-world-mobility');
const DECK=e.createDoubleSixDeck(),ARMS=[...u.ARMS,'min-hand-pips'],MIXES=u.MIXES;
const assert=(x,m)=>{if(!x)throw Error('pass-conditioned-mobility: '+m);};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const actionKey=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function legalKeys(s){return new Set(DECK.filter(t=>d.actionsForHand(s.branchState,s.openingState,[t]).length).map(e.tileKey));}
function rememberPass(mem,s,player=s.currentPlayer){
 assert(s.stock.length===0,'pass requires empty stock');
 for(const k of legalKeys(s))mem[player].add(k);
 assert(s.hands[player].every(t=>!mem[player].has(e.tileKey(t))),'observed pass contradicts actual hand');
}
function shuffle(a,seed){const z=a.map(t=>[...t]);let x=e.mixSeed32(seed)||0x9e3779b9;
 const rand=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
 for(let i=z.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[z[i],z[j]]=[z[j],z[i]];}return z;}
function conditionalWorld(s,seat,mem,seed,mode='both'){
 assert(s.currentPlayer===seat&&s.stock.length===0,'only no-stock focal turns');
 const visible=u.visibleFromState(s,seat),n=(seat+1)%3,o=(seat+2)%3;
 if(mode!=='both')mem=mem.map((v,i)=>((mode==='next'&&i===n)||(mode==='other'&&i===o))?v:new Set());
 const known=new Set([...visible.focalHand,...visible.played].map(e.tileKey));
 const pool=DECK.filter(t=>!known.has(e.tileKey(t)));
 assert(pool.length===s.hands[n].length+s.hands[o].length,'hidden count conservation');
 const mandatoryN=[],mandatoryO=[],flex=[];
 for(const tile of pool){const k=e.tileKey(tile),a=mem[n].has(k),b=mem[o].has(k);
  assert(!(a&&b),'impossible double-forbidden unknown tile '+k);
  if(b)mandatoryN.push(tile);else if(a)mandatoryO.push(tile);else flex.push(tile);
 }
 const needN=s.hands[n].length-mandatoryN.length;
 assert(needN>=0&&needN<=flex.length&&mandatoryO.length+flex.length-needN===s.hands[o].length,'conditional capacity');
 const z=shuffle(flex,seed),out=r.cloneRoundState(s);
 out.hands[n]=mandatoryN.concat(z.slice(0,needN));
 out.hands[o]=mandatoryO.concat(z.slice(needN));
 const keys=[...out.hands.flat(),...out.stock,...visible.played].map(e.tileKey);
 assert(keys.length===28&&new Set(keys).size===28,'28 tile integrity');
 for(const p of [n,o])assert(out.hands[p].every(t=>!mem[p].has(e.tileKey(t))),'pass constraint');
 return out;
}
function continuation(world,action,seat,profiles,seed){
 let s=r.cloneRoundState(world),forced=false;
 while(!s.outcome&&s.turns<200){
  s=r.stepRound(s,(opts,st)=>{
   if(!forced){forced=true;const hit=opts.actions.find(a=>actionKey(a)===actionKey(action));
    assert(!!hit,'candidate missing');return hit;}
   return h.choose(profiles[st.currentPlayer],opts,st,seed,seat);
  });
 }
 assert(s.outcome&&s.outcome.kind!=='unresolved','continuation unresolved');
 const win=s.outcome.kind==='finish'&&s.outcome.playerIndex===seat;
 return{first:+win,pips:e.pipSum(s.hands[seat]),minus:+(win&&s.outcome.minus<0),block:+(s.outcome.kind==='block')};
}
function ciSeed(rows,field){
 const seeds=[...new Set(rows.map(x=>x.seed))];
 const a=seeds.map(seed=>mean(rows.filter(x=>x.seed===seed).map(x=>x[field])));
 const m=mean(a);
 return{deals:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):null};
}
function summary(rows){
 const out={positions:rows.length,deals:new Set(rows.map(x=>x.seed)).size,worlds:rows.reduce((s,x)=>s+x.worlds,0),
  openingSwitches:rows.filter(x=>x.switch).length,uniformInvalidRate:mean(rows.map(x=>x.uniformInvalidRate)),
  meanForbiddenNext:mean(rows.map(x=>x.forbiddenNextUnknown)),meanForbiddenOther:mean(rows.map(x=>x.forbiddenOtherUnknown))};
 for(const field of ['bothFirstPP','nextFirstPP','otherFirstPP','uniformFirstPP',
  'bothPips','nextPips','otherPips','uniformPips',
  'bothMinusPP','nextMinusPP','otherMinusPP','uniformMinusPP',
  'posteriorShiftPP','bothMinusNextFirstPP','bothMinusOtherFirstPP','interactionFirstPP'])
  out[field]=ciSeed(rows,field);
 out.bySwitch={};
 for(const sw of [true,false]){
  const z=rows.filter(x=>x.switch===sw);
  out.bySwitch[sw?'opening-switch':'same-type']={positions:z.length,bothFirstPP:ciSeed(z,'bothFirstPP'),interactionFirstPP:ciSeed(z,'interactionFirstPP')};
 }
 return out;
}
function run(start=1561220,count=120,worlds=8){
 assert([start,count,worlds].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1000&&worlds>=2&&worlds<=64,'arguments');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let baselineRounds=0,finishes=0,blocks=0,passEvents=0,eligible=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  assert(base.kind==='ready','initializer '+seed);
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
   const mem=[new Set(),new Set(),new Set()];
   let s=r.cloneRoundState(base);const seen=new Set();
   if(base.openingPassed){const opening=r.cloneRoundState(s);rememberPass(mem,opening,base.starter);passEvents++;}
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&s.stock.length===0){rememberPass(mem,s);passEvents++;}
    if(s.currentPlayer===seat&&opts.phase==='play'&&opts.actions.length>1&&s.stock.length===0){
     const n=(seat+1)%3,o=(seat+2)%3,vis=u.visibleFromState(s,seat);
     const known=new Set([...vis.focalHand,...vis.played].map(e.tileKey));
     const unknown=DECK.filter(t=>!known.has(e.tileKey(t)));
     const forbiddenNext=unknown.filter(t=>mem[n].has(e.tileKey(t))).length;
     const forbiddenOther=unknown.filter(t=>mem[o].has(e.tileKey(t))).length;
     const restricted=forbiddenNext+forbiddenOther;
     if(forbiddenNext>0&&forbiddenOther>0){
      eligible++;
      const ctrl=h.choose('closed-branch-control',opts,s,seed,seat);
      for(let ai=0;ai<ARMS.length;ai++){
       const arm=ARMS[ai];if(seen.has(arm))continue;
       const alt=h.choose(arm,opts,s,seed,seat);
       if(actionKey(ctrl)===actionKey(alt))continue;
       seen.add(arm);
       const salt=(seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mi+1,0xc2b2ae35)^Math.imul(ai+1,0x27d4eb2d)^Math.imul(s.turns+1,0x165667b1))>>>0;
       const data={both:[],next:[],other:[],uniform:[]};let invalid=0;
       const snapshot=JSON.stringify(s);
       for(let wi=0;wi<worlds;wi++){
        const worldSeed=e.mixSeed32((salt^Math.imul(wi+1,0x9e3779b9))>>>0);
        const wc=conditionalWorld(s,seat,mem,worldSeed,'both'),wn=conditionalWorld(s,seat,mem,worldSeed,'next'),wo=conditionalWorld(s,seat,mem,worldSeed,'other'),wu=conditionalWorld(s,seat,mem,worldSeed,'uniform');
        invalid+=+[n,o].some(p=>wu.hands[p].some(t=>mem[p].has(e.tileKey(t))));
        for(const [label,world] of [['both',wc],['next',wn],['other',wo],['uniform',wu]]){
         const a=continuation(world,ctrl,seat,profiles,seed),b=continuation(world,alt,seat,profiles,seed);
         data[label].push({first:100*(b.first-a.first),pips:b.pips-a.pips,
          minus:100*(b.minus-a.minus),block:100*(b.block-a.block)});
        }
       }
       assert(JSON.stringify(s)===snapshot,'baseline state mutation');
       const v=(label,k)=>mean(data[label].map(x=>x[k]));
       rows.push({seed,seat,mix:mi,arm,turn:s.turns,worlds,handSize:s.hands[seat].length,
        nextSize:s.hands[n].length,otherSize:s.hands[o].length,forbiddenUnknown:restricted,
        forbiddenNextUnknown:forbiddenNext,forbiddenOtherUnknown:forbiddenOther,
        nextHistory:mem[n].size>0,otherHistory:mem[o].size>0,
        switch:(ctrl.type==='double-sequence')!==(alt.type==='double-sequence'),
        uniformInvalidRate:invalid/worlds,bothFirstPP:v('both','first'),nextFirstPP:v('next','first'),otherFirstPP:v('other','first'),uniformFirstPP:v('uniform','first'),
        bothPips:v('both','pips'),nextPips:v('next','pips'),otherPips:v('other','pips'),uniformPips:v('uniform','pips'),
        bothMinusPP:v('both','minus'),nextMinusPP:v('next','minus'),otherMinusPP:v('other','minus'),uniformMinusPP:v('uniform','minus'),
        posteriorShiftPP:v('both','first')-v('uniform','first'),
        bothMinusNextFirstPP:v('both','first')-v('next','first'),bothMinusOtherFirstPP:v('both','first')-v('other','first'),
        interactionFirstPP:v('both','first')-v('next','first')-v('other','first')+v('uniform','first')});
      }
     }
    }
    s=r.stepRound(s,(o,st)=>h.choose(profiles[st.currentPlayer],o,st,seed,seat));
   }
   assert(s.outcome&&s.outcome.kind!=='unresolved','baseline unresolved');
   baselineRounds++;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}
   else blocks++;
  }
 }
 const half=start+count/2,sums={};
 for(const [label,predicate] of [['discovery',x=>x.seed<half],['holdout',x=>x.seed>=half],['combined',()=>true]]){
  sums[label]={};
  for(const arm of ARMS)sums[label][arm]=summary(rows.filter(x=>predicate(x)&&x.arm===arm));
 }
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',
  day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-two-sided-ablation/v1',timestampAsiaBaku:stamp,engine:'qosa-research-0.5.3',
  rules:'recovered qosa-1.0.0 3x9; number-lock PROVISIONAL',seedStart:start,seedEnd:start+count-1,
  deals:count,baselineRounds,finishes,blocks,unresolved:0,minusFinishes:minus,passEvents,
  eligibleStates:eligible,positions:rows.length,worldsPerPosition:worlds,
  posteriorAllocations:rows.length*worlds*4,
  forcedHiddenWorldContinuations:rows.length*worlds*8,summary:sums,rows,
  selection:'First changed decision per arm/seat/mix where BOTH opponents have active pass exclusions on unseen tiles; control and alternatives share hidden worlds within each posterior mode.',
  sampler:'Four exact-uniform conditional allocations: neither pass, next opponent only, other opponent only, both opponents. Same deterministic world seed across posterior modes; paired actions share each mode world. Opponent action likelihood ignored.',
  worldSeedFormula:'salt=(dealSeed xor seat/mix/arm/turn salts); conditional mixSeed32(salt xor (worldIndex+1)*0x9e3779b9); uniform uses original hidden-world-mobility.sampleHidden(s,seat,salt,worldIndex)',
  limitations:'Pass posterior is exact conditional on observed no-stock passes and uniform prior, but ignores likelihood of opponents earlier choices. First eligible changed choices and correlated seats/mixes, exploratory deal-cluster CIs; double-opening switch is selected not causal. Provisional four-side number lock, block winner/loneZero/bust/101 match unresolved; finish-first != match win.',
  nextAction:'Increase independent two-sided pass-state sample and validate authentic branch lock/open and block-winner fixtures.'};
}
function test(){
 const s=init.initializeThreePlayerRound({seed:1561220,isFirstRound:false,previousWinnerIndex:0});
 assert(s.kind==='ready','fixture ready');
 const mem=[new Set(),new Set(),new Set()],f=s.currentPlayer,n=(f+1)%3,o=(f+2)%3;
 const pool=u.visibleFromState(s,f);
 const unseen=DECK.filter(t=>!new Set([...pool.focalHand,...pool.played].map(e.tileKey)).has(e.tileKey(t)));
 assert(unseen.length===s.hands[n].length+s.hands[o].length,'initial conservation');
 const k=e.tileKey(s.hands[o][0]);mem[n].add(k);
 const a=conditionalWorld(s,f,mem,123),b=conditionalWorld(s,f,mem,123);
 assert(JSON.stringify(a)===JSON.stringify(b),'conditional replay');
 assert(a.hands[n].every(t=>e.tileKey(t)!==k)&&a.hands[o].some(t=>e.tileKey(t)===k),'forced assignment');
 let threw=false;mem[o].add(k);try{conditionalWorld(s,f,mem,123);}catch(err){threw=true;}
 assert(threw,'contradiction rejection');
 const t=run(1561220,2,2),v=run(1561220,2,2);
 delete t.timestampAsiaBaku;delete v.timestampAsiaBaku;
 assert(JSON.stringify(t)===JSON.stringify(v),'deterministic replay');
 assert(t.baselineRounds===12&&t.forcedHiddenWorldContinuations===8*t.positions*2,'accounting');
 assert(t.rows.every(x=>x.forbiddenUnknown===x.forbiddenNextUnknown+x.forbiddenOtherUnknown),'pass-strata partition');
 assert(t.rows.every(x=>x.forbiddenUnknown>0),'active pass constraints');
 const m2=[new Set(),new Set(),new Set()],kn=e.tileKey(s.hands[n][0]),ko=e.tileKey(s.hands[o][0]);
 m2[n].add(ko);m2[o].add(kn);
 const both=conditionalWorld(s,f,m2,456);
 assert(both.hands[n].some(t=>e.tileKey(t)===kn)&&both.hands[o].some(t=>e.tileKey(t)===ko),'both-opponent forced assignments');
 return{passed:true,fixtureSeed:1561220,baselineRounds:t.baselineRounds,positions:t.positions,
  forced:t.forcedHiddenWorldContinuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
 run(+(a[0]||1561480),+(a[1]||600),+(a[2]||8)),null,2));}
module.exports={run,test,rememberPass,conditionalWorld,legalKeys};
