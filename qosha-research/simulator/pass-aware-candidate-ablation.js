'use strict';
// Matched four-policy proposal vs up-to-eight legal-candidate ablation; number-lock PROVISIONAL.\n// node qosha-research/simulator/pass-aware-altbots.js test\n// node qosha-research/simulator/pass-aware-candidate-ablation.js 1566240 300 24 24
// node qosha-research/simulator/pass-aware-advisor.js test
// node qosha-research/simulator/pass-aware-advisor.js 1563080 360 8 16
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),h=require('./mobility-hybrid-holdout');
const u=require('./hidden-world-mobility'),p=require('./pass-two-sided-ablation');
const MIXES=[['min-hand-pips','min-hand-pips'],['tempo-hybrid','min-hand-pips']],POLICIES=['closed-branch-control','min-hand-pips','mobility-hybrid','tempo-hybrid'];
const ok=(v,m)=>{if(!v)throw Error('pass-aware-advisor: '+m);};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
// Expand four policy proposals with distinct-tile legal alternatives, max eight.
function candidates(opts,s,seed,seat){
 const seen=new Set(),out=[],tileIds=new Set();
 const identity=a=>a.type==='single'?e.tileKey(a.tile):a.type+':'+(a.numbers||[]).join(',');
 const add=(action,source)=>{const k=key(action);if(seen.has(k))return false;seen.add(k);out.push({key:k,action,source});tileIds.add(identity(action));return true;};
 for(const name of POLICIES){const action=h.choose(name,opts,s,seed,seat);ok(!!action,'candidate policy has no move');add(action,name);}
 const extra=[...opts.actions].sort((a,b)=>key(a).localeCompare(key(b)));
 for(let pass=0;pass<2&&out.length<8;pass++)
  for(const action of extra){if(out.length>=8)break;if(pass===0&&tileIds.has(identity(action)))continue;add(action,'legal-extra');}
 ok(out.length<=8&&out.length>0,'candidate count');return out;
}
function continuation(world,action,seat,profiles,seed){
 let s=r.cloneRoundState(world),forced=false;
 while(!s.outcome&&s.turns<200)s=r.stepRound(s,(opts,st)=>{
  if(!forced){forced=true;const a=opts.actions.find(x=>key(x)===key(action));ok(!!a,'forced action not legal');return a;}
  return h.choose(profiles[st.currentPlayer],opts,st,seed,seat);
 });
 ok(s.outcome&&s.outcome.kind!=='unresolved','unresolved rollout');
 const first=+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat);
 return{first,pips:e.pipSum(s.hands[seat]),minus:+(first&&s.outcome.minus<0),block:+(s.outcome.kind==='block')};
}
function rank(cands,scores){
 const baseline=cands[0].key;
 return [...cands].sort((a,b)=>{
  const x=scores[a.key],y=scores[b.key];
  if(Math.abs(x.first-y.first)>1e-10)return y.first-x.first;
  if(Math.abs(x.pips-y.pips)>1e-10)return x.pips-y.pips;
  if(a.key===baseline)return -1;if(b.key===baseline)return 1;
  return a.key.localeCompare(b.key);
 })[0].key;
}
function scores(s,seat,mem,profiles,seed,cands,salt,count,mode){
 const sums=Object.fromEntries(cands.map(c=>[c.key,{first:0,pips:0,minus:0,block:0}]));
 for(let wi=0;wi<count;wi++){
  const ws=e.mixSeed32((salt^Math.imul(wi+1,0x9e3779b9))>>>0);
  const world=p.conditionalWorld(s,seat,mem,ws,mode);
  for(const c of cands){const z=continuation(world,c.action,seat,profiles,seed),v=sums[c.key];
   for(const k of Object.keys(v))v[k]+=z[k];
  }
 }
 for(const v of Object.values(sums))for(const k of Object.keys(v))v[k]/=count;
 return sums;
}
function ci(rows,field){
 const seeds=[...new Set(rows.map(x=>x.seed))];
 const a=seeds.map(seed=>avg(rows.filter(x=>x.seed===seed).map(x=>x[field]))),m=avg(a);
 return{deals:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):null};
}
function summarize(rows){
 const z={positions:rows.length,deals:new Set(rows.map(x=>x.seed)).size,
  expanded:rows.filter(x=>x.candidates>x.candidate4).length,
  meanPolicyCandidates:avg(rows.map(x=>x.candidate4)),
  expandedChanges:rows.filter(x=>x.conditionalKey!==x.conditional4Key).length,
  uniformExpandedChanges:rows.filter(x=>x.uniformKey!==x.uniform4Key).length,
  choicesDiffer:rows.filter(x=>x.conditionalKey!==x.uniformKey).length,
  conditionalChanges:rows.filter(x=>x.conditionalKey!==x.controlKey).length,
  uniformChanges:rows.filter(x=>x.uniformKey!==x.controlKey).length,
  meanCandidates:avg(rows.map(x=>x.candidates)),
  meanForbiddenNext:avg(rows.map(x=>x.forbiddenNext)),meanForbiddenOther:avg(rows.map(x=>x.forbiddenOther))};
 for(const f of ['conditional8Minus4PP','uniform8Minus4PP','conditional8Minus4Pips','conditional8Minus4MinusPP','passEffect4PP',
  'conditionalVsControlPP','uniformVsControlPP','conditionalVsUniformPP',
  'conditionalPipsVsControl','conditionalMinusVsControlPP','controlOracleRegretPP',
  'conditionalOracleRegretPP','uniformOracleRegretPP'])z[f]=ci(rows,f);
 return z;
}
function run(start=1566240,count=300,trainWorlds=24,evalWorlds=24){
 ok([start,count,trainWorlds,evalWorlds].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1000&&trainWorlds>=2&&trainWorlds<=64&&evalWorlds>=2&&evalWorlds<=64,'arguments');
 let baselineRounds=0,finishes=0,blocks=0,passEvents=0,eligibleStates=0,turnTotal=0,forced=0,trainAllocations=0,evalAllocations=0;
 const minus={'-10':0,'-20':0,'-30':0,'-40':0},rows=[];
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(base.kind==='ready','initializer');
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<MIXES.length;mi++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mi][0];profiles[(seat+2)%3]=MIXES[mi][1];
   const mem=[new Set(),new Set(),new Set()];let s=r.cloneRoundState(base),selected=false;
   if(base.openingPassed){p.rememberPass(mem,s,base.starter);passEvents++;}
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&s.stock.length===0){p.rememberPass(mem,s);passEvents++;}
    if(!selected&&s.currentPlayer===seat&&opts.phase==='play'&&opts.actions.length>1&&s.stock.length===0){
     const n=(seat+1)%3,o=(seat+2)%3,vis=u.visibleFromState(s,seat);
     const known=new Set([...vis.focalHand,...vis.played].map(e.tileKey));
     const unseen=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
     const fn=unseen.filter(t=>mem[n].has(e.tileKey(t))).length,fo=unseen.filter(t=>mem[o].has(e.tileKey(t))).length;
     if(fn>0&&fo>0){
      eligibleStates++;const cs=candidates(opts,s,seed,seat);
      if(cs.length>1){
       selected=true;const salt=(seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mi+1,0xc2b2ae35)^Math.imul(s.turns+1,0x27d4eb2d))>>>0;
       const snapshot=JSON.stringify(s);
       const trainC=scores(s,seat,mem,profiles,seed,cs,salt^0x42a8bd31,trainWorlds,'both');
       const trainU=scores(s,seat,mem,profiles,seed,cs,salt^0x42a8bd31,trainWorlds,'uniform');
       const evalC=scores(s,seat,mem,profiles,seed,cs,salt^0x96e57c4d,evalWorlds,'both');
       ok(JSON.stringify(s)===snapshot,'source state mutation');
       const c4=cs.filter(c=>c.source!=='legal-extra');
       ok(c4.length>=1&&c4.length<=4&&c4.every((c,i)=>c.key===cs[i].key),'policy proposal prefix');
       const conditional4Key=rank(c4,trainC),uniform4Key=rank(c4,trainU);
       const controlKey=cs[0].key,conditionalKey=rank(cs,trainC),uniformKey=rank(cs,trainU),oracleKey=rank(cs,evalC);
       const ctrl=evalC[controlKey],cond=evalC[conditionalKey],uni=evalC[uniformKey],oracle=evalC[oracleKey];
       rows.push({seed,seat,mix:mi,turn:s.turns,candidates:cs.length,candidate4:c4.length,
        conditional4Key,uniform4Key,
        candidateSources:cs.map(c=>c.source),handSize:s.hands[seat].length,forbiddenNext:fn,forbiddenOther:fo,
        controlKey,conditionalKey,uniformKey,oracleKey,
        conditionalVsControlPP:100*(cond.first-ctrl.first),
        uniformVsControlPP:100*(uni.first-ctrl.first),
        conditional8Minus4PP:100*(cond.first-evalC[conditional4Key].first),
        uniform8Minus4PP:100*(uni.first-evalC[uniform4Key].first),
        conditional8Minus4Pips:cond.pips-evalC[conditional4Key].pips,
        conditional8Minus4MinusPP:100*(cond.minus-evalC[conditional4Key].minus),
        passEffect4PP:100*(evalC[conditional4Key].first-evalC[uniform4Key].first),
        conditionalVsUniformPP:100*(cond.first-uni.first),
        conditionalPipsVsControl:cond.pips-ctrl.pips,
        conditionalMinusVsControlPP:100*(cond.minus-ctrl.minus),
        controlOracleRegretPP:100*(oracle.first-ctrl.first),
        conditionalOracleRegretPP:100*(oracle.first-cond.first),
        uniformOracleRegretPP:100*(oracle.first-uni.first),
        evalControl:ctrl,evalConditional:cond,evalUniform:uni,
        trainControl:trainC[controlKey],trainSelected:trainC[conditionalKey],
        openingSwitch:(cs.find(c=>c.key===conditionalKey).action.type==='double-sequence')!==(cs[0].action.type==='double-sequence')});
       trainAllocations+=trainWorlds*2;evalAllocations+=evalWorlds;
       forced+=cs.length*(trainWorlds*2+evalWorlds);
      }
     }
    }
    s=r.stepRound(s,(o,st)=>h.choose(profiles[st.currentPlayer],o,st,seed,seat));
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','baseline unresolved');
   baselineRounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}
   else blocks++;
  }
 }
 const half=start+count/2;
 const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-candidate-ablation/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds,finishes,blocks,unresolved:0,
  meanRoundTurns:turnTotal/baselineRounds,minusFinishes:minus,passEvents,eligibleStates,
  positions:rows.length,trainWorlds,evalWorlds,trainAllocations,evalAllocations,
  forcedHiddenWorldContinuations:forced,strategies:POLICIES,opponentMixes:MIXES,
  summary:{discovery:summarize(rows.filter(x=>x.seed<half)),holdout:summarize(rows.filter(x=>x.seed>=half)),combined:summarize(rows)},
  rows,selection:'First both-pass focal multi-choice state per seat/mix; compare up-to-four policy proposals against their strict prefix plus legal extras up to eight. Both arms see identical train/evaluation worlds; no hidden hand leakage.',
  sampling:'Independent train/eval salts; both-pass-compatible held-out worlds; alternative opponent mixes min-pips+min-pips and tempo+min-pips; focal continuation uses closed-control.',
  limitations:'Provisional number-lock; block winner, loneZero, bust/101-match unresolved. Finish-first != match win. Sparse selected positions; candidate-limited; 8-world training may overfit; evaluation-oracle regret is optimistic. Uniform pass-compatible prior ignores opponent action likelihood. Deal-cluster exploratory 95% intervals uncorrected.',
  nextAction:'Independently replicate candidate expansion in positions with >4 distinct legal actions on fresh seeds; validate authentic branch and blocked-round winner fixtures.'};
}
function test(){
 const s=init.initializeThreePlayerRound({seed:1563080,isFirstRound:false,previousWinnerIndex:0});
 ok(s.kind==='ready'&&s.stock.length===0,'no-stock fixture');
 const seat=s.currentPlayer,mem=[new Set(),new Set(),new Set()],n=(seat+1)%3,o=(seat+2)%3;
 mem[n].add(e.tileKey(s.hands[o][0]));mem[o].add(e.tileKey(s.hands[n][0]));
 const a=p.conditionalWorld(s,seat,mem,12345,'both'),b=p.conditionalWorld(s,seat,mem,12345,'both');
 ok(JSON.stringify(a)===JSON.stringify(b),'posterior deterministic');
 const swapped=r.cloneRoundState(s);[swapped.hands[n][0],swapped.hands[o][0]]=[swapped.hands[o][0],swapped.hands[n][0]];
 ok(JSON.stringify(p.conditionalWorld(swapped,seat,mem,12345,'both'))===JSON.stringify(a),'hidden hand independence');
 const fake=[{key:'a'},{key:'b'}],scores={a:{first:0,pips:10},b:{first:0,pips:10}};
 ok(rank(fake,scores)==='a','tie chooses baseline');
 const t=run(1563080,2,2,2),v=run(1563080,2,2,2);
 delete t.timestampAsiaBaku;delete v.timestampAsiaBaku;
 ok(JSON.stringify(t)===JSON.stringify(v),'replay');
 ok(t.baselineRounds===12&&t.forcedHiddenWorldContinuations===t.rows.reduce((z,x)=>z+x.candidates*6,0),'accounting');
 let testState,opts,ss=1563080;for(;ss<1563110;ss++){testState=init.initializeThreePlayerRound({seed:ss,isFirstRound:false,previousWinnerIndex:0});opts=d.turnOptions(testState.branchState,testState.openingState,testState.hands[testState.currentPlayer],testState.stock);if(opts.phase==='play')break;}ok(opts.phase==='play','candidate fixture play');const cs=candidates(opts,testState,ss,testState.currentPlayer);ok(cs.length<=8&&cs.length<=opts.actions.length,'candidate limit and legality');ok(new Set(cs.map(c=>c.key)).size===cs.length,'candidate uniqueness');ok(cs.every(c=>opts.actions.some(a=>key(a)===c.key)),'candidate legal');if(opts.actions.length<=8)ok(cs.length===opts.actions.length,'complete legal coverage for small action sets');const c4=cs.filter(c=>c.source!=='legal-extra');ok(c4.length>=1&&c4.length<=4&&c4.every((c,i)=>c.key===cs[i].key),'candidate prefix');
 ok(t.rows.every(x=>x.candidate4<=4&&x.candidates<=8),'run candidate caps');
 return{passed:true,checks:11,replayDeals:2};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
 run(+(a[0]||1566240),+(a[1]||300),+(a[2]||24),+(a[3]||24)),null,2));}
module.exports={run,test,candidates,continuation,rank,scores};