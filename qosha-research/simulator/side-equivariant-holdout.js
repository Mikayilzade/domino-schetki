'use strict';
// Side-label invariance experiment; four-branch number-lock PROVISIONAL.
// node qosha-research/simulator/side-equivariant-holdout.js test
// node qosha-research/simulator/side-equivariant-holdout.js 1575340 400 12
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer'),b=require('./strategy-runner');
const MIXES=[['min-hand-pips','min-hand-pips'],['fast-doubles','min-hand-pips']];
const ok=(x,m)=>{if(!x)throw Error('side-equivariant: '+m);};
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
const med=a=>{const z=[...a].sort((x,y)=>x-y),n=z.length;return n?n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2:null;};
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
const tiles=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const sideFree=a=>[a.type,a.from??'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function signature(branch,opening,hand){
 return e.SIDES.map(side=>branch.branches[side]).map(z=>+z.active+':'+z.end).sort().join(',')+'|'+
  [...opening.openedNumbers].sort((a,b)=>a-b).join(',')+'|'+hand.map(e.tileKey).sort().join(',');
}
function chooseEquivariant(name,opts,s){
 ok(['closed-branch-control','min-hand-pips','fast-doubles'].includes(name),'policy');
 const scored=opts.actions.map(a=>{
  const z=d.applyTurn(s.branchState,s.openingState,opts.hand,opts.stock,a);
  const ts=tiles(a),pip=e.pipSum(ts),nd=ts.filter(t=>t[0]===t[1]).length;
  const opening=a.type==='double-sequence'?(a.numbers||[]).length:0;
  const priority=name==='closed-branch-control'?[+(a.type==='mixed-finish'),-opening,pip]:
   name==='fast-doubles'?[+(a.type==='mixed-finish'),nd,pip]:[+(a.type==='mixed-finish'),pip];
  return{a,priority,sig:signature(z.branchState,z.openingState,z.hand),id:sideFree(a)};
 });
 scored.sort((a,b)=>{
  for(let i=0;i<a.priority.length;i++)if(a.priority[i]!==b.priority[i])return b.priority[i]-a.priority[i];
  return a.sig.localeCompare(b.sig)||a.id.localeCompare(b.id);
 });
 return scored[0].a;
}
function pairs(actions){
 const singles=actions.filter(a=>a.type==='single'),out={};
 for(let i=0;i<singles.length;i++)for(let j=i+1;j<singles.length;j++){
  const a=singles[i],b=singles[j];
  if(a.side===b.side||e.tileKey(a.tile)!==e.tileKey(b.tile))continue;
  const kind=a.from===b.from&&a.to===b.to?'same-end':'different-end';
  if(!out[kind])out[kind]={a,b};
 }
 return out;
}
function hidden(s,seat,seed){
 const occupied=[...s.hands.flat(),...s.stock].map(e.tileKey);
 ok(new Set(occupied).size===occupied.length,'remaining unique');
 const present=new Set(occupied),played=e.createDoubleSixDeck().filter(t=>!present.has(e.tileKey(t)));
 const known=new Set([...played,...s.hands[seat]].map(e.tileKey));
 const rank=new Map(e.shuffledDeck(seed).map((t,i)=>[e.tileKey(t),i]));
 const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t))).sort((a,b)=>rank.get(e.tileKey(a))-rank.get(e.tileKey(b)));
 const n=(seat+1)%3,o=(seat+2)%3,nc=s.hands[n].length,oc=s.hands[o].length;
 ok(pool.length===nc+oc+s.stock.length,'unknown count');
 const w=r.cloneRoundState(s);
 w.hands[n]=pool.slice(0,nc);w.hands[o]=pool.slice(nc,nc+oc);w.stock=pool.slice(nc+oc);
 return w;
}
function rollout(world,action,seat,profiles,seed,mode){
 let s=r.cloneRoundState(world),forced=false;
 while(!s.outcome&&s.turns<200)s=r.stepRound(s,(opts,st)=>{
  if(!forced){forced=true;const hit=opts.actions.find(a=>key(a)===key(action));ok(hit,'forced legal');return hit;}
  const name=profiles[st.currentPlayer];
  return mode==='equivariant'?chooseEquivariant(name,opts,st):
   b.chooseBy(name,opts,{seed,rotation:seat,turns:st.turns,player:st.currentPlayer});
 });
 ok(s.outcome&&s.outcome.kind!=='unresolved','resolved');
 const first=+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat);
 return{first,pips:e.pipSum(s.hands[seat]),minus:+(first&&s.outcome.minus<0),block:+(s.outcome.kind==='block')};
}
function clustered(rows,field){
 const by=new Map();
 for(const x of rows){if(!by.has(x.seed))by.set(x.seed,[]);by.get(x.seed).push(x[field]);}
 const z=[...by.values()].map(mean),m=mean(z);
 return{positions:rows.length,deals:z.length,mean:m,halfWidth95:z.length>1?1.96*Math.sqrt(z.reduce((a,x)=>a+(x-m)**2,0)/(z.length-1)/z.length):null};
}
function summary(rows){
 const out={positions:rows.length,deals:new Set(rows.map(x=>x.seed)).size,worlds:rows.reduce((a,x)=>a+x.worlds,0),
  equivariantIdenticalWorlds:rows.reduce((a,x)=>a+x.equivariantIdentical,0),
  legacyIdenticalWorlds:rows.reduce((a,x)=>a+x.legacyIdentical,0)};
 for(const f of ['equivariantAbsFirstPP','legacyAbsFirstPP','equivariantAbsPips','legacyAbsPips',
  'equivariantDeltaFirstPP','legacyDeltaFirstPP','equivariantDeltaPips','legacyDeltaPips'])out[f]=clustered(rows,f);
 return out;
}
function run(start=1575340,count=400,worlds=12){
 ok([start,count,worlds].every(Number.isInteger)&&count>=2&&count%2===0&&count<=1000&&worlds>=2&&worlds<=64,'args');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0},focal=[];
 let rounds=0,finishes=0,blocks=0,turnTotal=0,forced=0;
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  ok(base.kind==='ready','initializer');const used=new Set();
  for(let seat=0;seat<3;seat++)for(let mix=0;mix<MIXES.length;mix++){
   const profiles=[];profiles[seat]='closed-branch-control';
   profiles[(seat+1)%3]=MIXES[mix][0];profiles[(seat+2)%3]=MIXES[mix][1];
   let s=r.cloneRoundState(base);
   while(!s.outcome&&s.turns<200){
    if(s.currentPlayer===seat&&s.stock.length===0&&used.size<2){
     const opts=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock);
     if(opts.phase==='play'){
      const available=pairs(opts.actions);
      for(const kind of ['same-end','different-end']){
       if(used.has(kind)||!available[kind])continue;
       used.add(kind);const {a,b:alt}=available[kind],before=JSON.stringify(s);
       const z={seed,seat,mix,turn:s.turns,kind,worlds,handSize:s.hands[seat].length,
        actions:[key(a),key(alt)],equivariantIdentical:0,legacyIdentical:0};
       for(const mode of ['equivariant','legacy']){
        let first=0,pip=0,absFirst=0,absPip=0,minusDelta=0,blockDelta=0;
        for(let wi=0;wi<worlds;wi++){
         const salt=e.mixSeed32((seed^Math.imul(seat+1,0x85ebca6b)^Math.imul(mix+1,0xc2b2ae35)^
          Math.imul(s.turns+1,0x27d4eb2d)^Math.imul(kind==='same-end'?7:13,0x165667b1)^
          Math.imul(wi+1,0x9e3779b9))>>>0);
         const w=hidden(s,seat,salt),x=rollout(w,a,seat,profiles,seed,mode),y=rollout(w,alt,seat,profiles,seed,mode);
         const same=Object.keys(x).every(k=>x[k]===y[k]);
         if(same)z[mode+'Identical']++;
         if(kind==='same-end'&&mode==='equivariant')ok(same,'same-end invariant seed='+seed+' world='+wi);
         first+=y.first-x.first;pip+=y.pips-x.pips;minusDelta+=y.minus-x.minus;blockDelta+=y.block-x.block;
         absFirst+=Math.abs(y.first-x.first);absPip+=Math.abs(y.pips-x.pips);forced+=2;
        }
        z[mode+'DeltaFirstPP']=100*first/worlds;z[mode+'DeltaPips']=pip/worlds;
        z[mode+'AbsFirstPP']=100*absFirst/worlds;z[mode+'AbsPips']=absPip/worlds;
        z[mode+'DeltaMinusPP']=100*minusDelta/worlds;z[mode+'DeltaBlockPP']=100*blockDelta/worlds;
       }
       ok(JSON.stringify(s)===before,'baseline source mutated');rows.push(z);
      }
     }
    }
    s=r.stepRound(s,(opts,st)=>b.chooseBy(profiles[st.currentPlayer],opts,
     {seed,rotation:seat,turns:st.turns,player:st.currentPlayer}));
   }
   ok(s.outcome&&s.outcome.kind!=='unresolved','baseline resolved');
   rounds++;turnTotal+=s.turns;
   if(s.outcome.kind==='finish'){finishes++;if(s.outcome.minus<0)minus[String(s.outcome.minus)]++;}
   else blocks++;
   focal.push({first:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
    pips:e.pipSum(s.hands[seat]),starting:base.hands[seat].filter(t=>t[0]===t[1]).length,
    ending:s.hands[seat].filter(t=>t[0]===t[1]).length});
  }
 }
 const half=start+count/2,stamp=new Intl.DateTimeFormat('sv-SE',
  {timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04';
 const strata={};
 for(const kind of ['same-end','different-end']){
  const all=rows.filter(x=>x.kind===kind);
  strata[kind]={discovery:summary(all.filter(x=>x.seed<half)),holdout:summary(all.filter(x=>x.seed>=half)),combined:summary(all)};
 }
 return{schema:'qosha-side-equivariant-holdout/v1',timestampAsiaBaku:stamp,
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; four-side number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,half-1],holdout:[half,start+count-1],
  baselineRounds:rounds,finishes,blocks,unresolved:0,meanRoundTurns:turnTotal/rounds,minusFinishes:minus,
  blockRate:blocks/rounds,strategies:['closed-branch-control','min-hand-pips','fast-doubles'],
  opponentMixes:MIXES,worldsPerPosition:worlds,pairedHiddenWorlds:rows.length*worlds,
  forcedHiddenWorldContinuations:forced,
  baseline:{finishFirst:mean(focal.map(x=>x.first)),meanRemainingPips:mean(focal.map(x=>x.pips)),
   medianRemainingPips:med(focal.map(x=>x.pips)),meanStartingDoubles:mean(focal.map(x=>x.starting)),
   meanEndingDoubles:mean(focal.map(x=>x.ending))},strata,rows,
  worldSeedFormula:'mixSeed32(seed xor (seat+1)*0x85ebca6b xor (mix+1)*0xc2b2ae35 xor (turn+1)*0x27d4eb2d xor (kind?7:13)*0x165667b1 xor (world+1)*0x9e3779b9); then rank tiles by engine.shuffledDeck; Math.imul products',
  design:'First same-end and first different-end same-tile side pair per deal across six baseline trajectories; no-stock focal turn. Two forced sides on identical uniform hidden allocations; compare label-sensitive built-in bots vs successor-canonical permutation-equivariant bots. Discovery/holdout disjoint seeds; max two positions per deal.',
  limitations:'Four-side number-lock PROVISIONAL; canonical policy does not model humans. Uniform hidden worlds ignore past passes and choice likelihood; block winner, loneZero, bust/101 scoring unresolved. First-side-pair selection and bot-dependent trajectory; exploratory clustered intervals. Finish-first != match win.',
  nextAction:'Condition hidden worlds on pass history, test different-end side choices on matched hand/board geometry with independent seeds, authenticate branch lock/open and blocked-round winner fixtures.'};
}
function test(){
 const s=e.createBranchState([1,1]),o=e.createOpeningState([1,2,3,4,5,6]);
 s.branches.up.end=1;s.branches.left.end=1;s.branches.right.end=2;s.branches.down.end=3;
 const hand=[[1,5],[1,4],[2,3]],opts=d.turnOptions(s,o,hand,[]),pair=pairs(opts.actions)['same-end'];
 ok(pair,'same-end fixture');
 const x=d.applyTurn(s,o,hand,[],pair.a),y=d.applyTurn(s,o,hand,[],pair.b);
 ok(signature(x.branchState,x.openingState,x.hand)===signature(y.branchState,y.openingState,y.hand),'canonical invariant');
 const t=run(1575340,2,2),v=run(1575340,2,2);
 delete t.timestampAsiaBaku;delete v.timestampAsiaBaku;
 ok(JSON.stringify(t)===JSON.stringify(v),'replay');
 ok(t.baselineRounds===12&&t.forcedHiddenWorldContinuations===t.rows.length*8,'accounting');
 ok(t.rows.filter(x=>x.kind==='same-end').every(x=>x.equivariantIdentical===x.worlds),'same-end outcomes');
 return{passed:true,checks:6,replayDeals:2,positions:t.rows.length};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1575340),+(a[1]||400),+(a[2]||12)),null,2));}
module.exports={run,test,chooseEquivariant,pairs,signature,hidden,rollout};
