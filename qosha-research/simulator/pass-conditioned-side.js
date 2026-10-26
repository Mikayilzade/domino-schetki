'use strict';
// Matched different-numerical-end side placements with a no-stock-pass posterior.
// Four-branch number-lock is PROVISIONAL; finish-first is NOT match victory.
// Usage: node qosha-research/simulator/pass-conditioned-side.js test
//        node qosha-research/simulator/pass-conditioned-side.js 1575740 600 8 12
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),b=require('./strategy-runner'),side=require('./side-equivariant-holdout');
const MIXES=[['min-hand-pips','min-hand-pips'],['fast-doubles','min-hand-pips']];
const check=(x,msg)=>{if(!x)throw Error('pass-conditioned-side: '+msg);};
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const med=a=>{const z=[...a].sort((x,y)=>x-y);return z.length?(z.length%2?z[(z.length-1)/2]:(z[z.length/2-1]+z[z.length/2])/2):null;};
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function legalKeys(s){
 const z=new Set();for(const tile of e.createDoubleSixDeck())
  if(d.actionsForHand(s.branchState,s.openingState,[tile]).length)z.add(e.tileKey(tile));
 return z;
}
function remember(mem,s,player){
 check(s.stock.length===0,'pass with stock');
 for(const k of legalKeys(s))mem[player].add(k);
 check(s.hands[player].every(t=>!mem[player].has(e.tileKey(t))),'observed pass contradiction');
}
function world(s,seat,mem,seed,conditional){
 check(s.stock.length===0&&s.currentPlayer===seat,'focal no-stock turn');
 const present=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
 check(present.size===s.hands.flat().length,'unique remaining tiles');
 const played=e.createDoubleSixDeck().filter(t=>!present.has(e.tileKey(t)));
 const known=new Set([...played,...s.hands[seat]].map(e.tileKey));
 const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
 const n=(seat+1)%3,o=(seat+2)%3;
 const rank=new Map(e.shuffledDeck(seed).map((t,i)=>[e.tileKey(t),i]));
 const sort=a=>a.sort((x,y)=>rank.get(e.tileKey(x))-rank.get(e.tileKey(y)));
 let mustN=[],mustO=[],flex=[];
 for(const t of pool){
  const k=e.tileKey(t),fn=conditional&&mem[n].has(k),fo=conditional&&mem[o].has(k);
  check(!(fn&&fo),'inconsistent pass exclusions');
  if(fn)mustO.push(t);else if(fo)mustN.push(t);else flex.push(t);
 }
 sort(flex);const needN=s.hands[n].length-mustN.length;
 check(needN>=0&&needN<=flex.length&&mustO.length+flex.length-needN===s.hands[o].length,'posterior capacity');
 const w=r.cloneRoundState(s);
 w.hands[n]=mustN.concat(flex.slice(0,needN));w.hands[o]=mustO.concat(flex.slice(needN));
 check(new Set([...w.hands.flat(),...played].map(e.tileKey)).size===28,'tile conservation');
 if(conditional)for(const p of [n,o])check(w.hands[p].every(t=>!mem[p].has(e.tileKey(t))),'pass violated');
 return w;
}
function cluster(rows,field){
 const m=new Map();for(const z of rows){if(!m.has(z.seed))m.set(z.seed,[]);m.get(z.seed).push(z[field]);}
 const values=[...m.values()].map(avg),v=avg(values);
 return{positions:rows.length,deals:values.length,mean:v,halfWidth95:values.length>1?
  1.96*Math.sqrt(values.reduce((a,x)=>a+(x-v)*(x-v),0)/(values.length-1)/values.length):null};
}
function summary(rows){
 const out={positions:rows.length,deals:new Set(rows.map(x=>x.seed)).size,
  choiceSwitches:rows.filter(x=>x.switch).length,
  informativeBoth:rows.filter(x=>x.forbiddenNext>0&&x.forbiddenOther>0).length};
 for(const field of ['conditionalMinusUniformFirstPP','conditionalMinusUniformPips',
  'conditionalMinusUniformMinusPP','conditionalMinusUniformBlockPP','pairAbsFirstPP',
  'pairAbsPips','conditionalRegretPP','uniformRegretPP'])
  out[field]=cluster(rows,field);
 return out;
}
function select(scores,actions){
 const sorted=actions.map((a,i)=>({a,i,first:avg(scores[i].map(x=>x.first)),
  pips:avg(scores[i].map(x=>x.pips)),id:key(a)}));
 sorted.sort((x,y)=>y.first-x.first||x.pips-y.pips||x.id.localeCompare(y.id));
 return sorted[0].i;
}
function run(start=1575740,count=600,train=8,evalN=12){
 check([start,count,train,evalN].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1200&&train>=2&&evalN>=2&&train<=64&&evalN<=64,'arguments');
 const rows=[],focal=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};
 let rounds=0,finishes=0,blocks=0,turnTotal=0,passEvents=0,forced=0,eligible=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  check(base.kind==='ready','initialization');
  let selected=false;
  for(let seat=0;seat<3;seat++)for(let mix=0;mix<MIXES.length;mix++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mix][0];profiles[(seat+2)%3]=MIXES[mix][1];
   const mem=[new Set(),new Set(),new Set()];
   if(base.openingPassed){remember(mem,base,base.starter);passEvents++;}
   let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    if(opts.phase==='pass'&&s.stock.length===0){remember(mem,s,s.currentPlayer);passEvents++;}
    if(!selected&&s.currentPlayer===seat&&s.stock.length===0&&opts.phase==='play'){
     const pair=side.pairs(opts.actions)['different-end'];
     if(pair){
      const n=(seat+1)%3,o=(seat+2)%3;
      const present=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
      const unknown=e.createDoubleSixDeck().filter(t=>present.has(e.tileKey(t))&&!s.hands[seat].some(h=>e.tileKey(h)===e.tileKey(t)));
      const fn=unknown.filter(t=>mem[n].has(e.tileKey(t))).length,fo=unknown.filter(t=>mem[o].has(e.tileKey(t))).length;
      if(fn+fo>0){
       selected=true;eligible++;
       const actions=[pair.a,pair.b],before=JSON.stringify(s),training=[[],[]];
       const salts=[0x36d9f09d,0x7f4a7c15,0x9e3779b9];
       const salt=(phase,i)=>e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mix+1,0xc2b2ae35)^
        Math.imul(s.turns+1,0x27d4eb2d)^Math.imul(i+1,0x165667b1)^salts[phase])>>>0);
       for(let mode=0;mode<2;mode++)for(let wi=0;wi<train;wi++){
        const w=world(s,seat,mem,salt(mode,wi),mode===0);
        for(let ai=0;ai<2;ai++){training[mode][ai]??=[];training[mode][ai].push(side.rollout(w,actions[ai],seat,profiles,seed,'equivariant'));forced++;}
       }
       const chosenConditional=select(training[0],actions),chosenUniform=select(training[1],actions);
       const evaluation=[[],[]];
       for(let wi=0;wi<evalN;wi++){
        const w=world(s,seat,mem,salt(2,wi),true);
        for(let ai=0;ai<2;ai++){evaluation[ai].push(side.rollout(w,actions[ai],seat,profiles,seed,'equivariant'));forced++;}
       }
       const m=(ai,f)=>avg(evaluation[ai].map(z=>z[f])),c=chosenConditional,u=chosenUniform;
       const bestFirst=Math.max(m(0,'first'),m(1,'first'));
       rows.push({seed,seat,mix,turn:s.turns,handSize:s.hands[seat].length,forbiddenNext:fn,forbiddenOther:fo,
        actions:actions.map(key),train,evalWorlds:evalN,chosenConditional:c,chosenUniform:u,switch:c!==u,
        conditionalMinusUniformFirstPP:100*(m(c,'first')-m(u,'first')),
        conditionalMinusUniformPips:m(c,'pips')-m(u,'pips'),
        conditionalMinusUniformMinusPP:100*(m(c,'minus')-m(u,'minus')),
        conditionalMinusUniformBlockPP:100*(m(c,'block')-m(u,'block')),
        pairAbsFirstPP:100*Math.abs(m(1,'first')-m(0,'first')),
        pairAbsPips:Math.abs(m(1,'pips')-m(0,'pips')),
        conditionalRegretPP:100*(bestFirst-m(c,'first')),
        uniformRegretPP:100*(bestFirst-m(u,'first')),
        trainingFirst:training.map(t=>t.map(z=>avg(z.map(x=>x.first)))),
        evaluationFirst:evaluation.map(z=>avg(z.map(x=>x.first))),
        evaluationPips:evaluation.map(z=>avg(z.map(x=>x.pips)))});
       check(JSON.stringify(s)===before,'state mutated');
      }
     }
    }
    s=r.stepRound(s,(o,st)=>b.chooseBy(profiles[st.currentPlayer],o,{seed,rotation:seat,turns:st.turns,player:st.currentPlayer}));
   }
   check(s.outcome&&s.outcome.kind!=='unresolved','baseline resolution');
   rounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}else blocks++;
   focal.push({first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),pips:e.pipSum(s.hands[seat]),
    starting:base.hands[seat].filter(t=>t[0]===t[1]).length,ending:s.hands[seat].filter(t=>t[0]===t[1]).length});
  }
 }
 const half=start+count/2,stamp=new Intl.DateTimeFormat('sv-SE',
  {timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 return{schema:'qosha-pass-conditioned-side/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,baselineRounds:rounds,finishes,blocks,
  unresolved:0,meanRoundTurns:turnTotal/rounds,blockRate:blocks/rounds,minusFinishes:minus,
  passEvents,selectedPositions:eligible,trainWorldsPerMode:train,evalWorldsPerPosition:evalN,
  forcedHiddenWorldContinuations:forced,strategies:['closed-branch-control','min-hand-pips','fast-doubles'],
  opponentMixes:MIXES,baseline:{finishFirst:avg(focal.map(z=>z.first)),
   meanRemainingPips:avg(focal.map(z=>z.pips)),medianRemainingPips:med(focal.map(z=>z.pips)),
   meanStartingDoubles:avg(focal.map(z=>z.starting)),meanEndingDoubles:avg(focal.map(z=>z.ending))},
  discovery:summary(rows.filter(z=>z.seed<half)),holdout:summary(rows.filter(z=>z.seed>=half)),
  combined:summary(rows),rows,
  design:'At most first no-stock same-tile/different-numerical-end side pair per deal with >=1 informative observed opponent pass. Train each of two side choices on identical 8/8 conditional/uniform hidden-world allocations per mode; evaluate on independent matched conditional worlds with permutation-equivariant continuation bots. First-finisher primary; pips/minus/block secondary. No opponent hidden-hand leakage into selection.',
  posterior:'Uniform over remaining hidden allocations conditioned on observed no-stock passes; opponent action likelihood ignored. Deterministic seed salts for training conditional/uniform and independent evaluation.',
  limitations:'Four-side number-lock PROVISIONAL; no authentic block winner/loneZero/bust/101-match. First eligible position per deal, simple continuation bots, training overfit risk, multiple exploratory tests; finish-first != match victory. Never promote an unreplicated tactic.',
  nextAction:'Replicate with fresh seeds and stronger opponent mixes; test alternative side-choice heuristics and authenticate branch lock/open.'};
}
function test(){
 const state=init.initializeThreePlayerRound({seed:1575740,isFirstRound:false,previousWinnerIndex:0});
 check(state.kind==='ready','fixture');const seat=state.currentPlayer,mem=[new Set(),new Set(),new Set()];
 const a=world(state,seat,mem,123,false),b=world(state,seat,mem,123,false);
 check(JSON.stringify(a)===JSON.stringify(b),'uniform deterministic');
 const n=(seat+1)%3,o=(seat+2)%3,k=e.tileKey(state.hands[o][0]);mem[n].add(k);
 const w=world(state,seat,mem,124,true);
 check(w.hands[n].every(t=>e.tileKey(t)!==k),'posterior exclusion');
 const x=run(1575740,2,2,2),y=run(1575740,2,2,2);
 delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
 check(JSON.stringify(x)===JSON.stringify(y),'replay');
 check(x.baselineRounds===12,'baseline count');
 check(x.forcedHiddenWorldContinuations===x.selectedPositions*12,'continuation accounting');
 check(x.rows.every(z=>z.forbiddenNext+z.forbiddenOther>0),'pass gate');
 return{passed:true,checks:6,replayDeals:2,positions:x.selectedPositions};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1575740),+(a[1]||600),+(a[2]||8),+(a[3]||12)),null,2));}
module.exports={run,test,world,remember,summary};
