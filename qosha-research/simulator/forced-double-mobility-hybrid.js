'use strict';
// Mobility-gated forced-double ablation. Branch number-locking remains PROVISIONAL.
// node qosha-research/simulator/forced-double-mobility-hybrid.js test
// node qosha-research/simulator/forced-double-mobility-hybrid.js 1403240 2400
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver');
const base=require('./strategy-runner'),forced=require('./forced-double-count-ablation'),d=require('./turn-dispatcher');
const H='pip-late-mobility-gated-doubles',F=forced.FEW,M=forced.MANY;
const PROFILES=[[H,F,M],[H,F,'min-hand-pips'],[H,M,'closed-branch-control'],[H,F,'random-legal']];
const DECK=e.createDoubleSixDeck();
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
function median(xs){const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;}
function afterAction(opts,state,action){
 const next=e.applyDoubleOpeningSequence(state.branchState,state.openingState,action.sequence);
 const played=new Set(action.tiles.map(e.tileKey));
 const remaining=opts.hand.filter(t=>!played.has(e.tileKey(t)));
 const own=new Set();
 for(const tile of remaining){
  if(tile[0]===tile[1]){
   if(e.candidateDoubleOpenings(next.branchState,next.openingState,[tile]).length)own.add(e.tileKey(tile));
  }else if(d.openedSinglePlacements(next.branchState,next.openingState,tile).length)own.add(e.tileKey(tile));
 }
 const catalog=DECK.filter(t=>t[0]!==t[1]&&d.openedSinglePlacements(next.branchState,next.openingState,t).length).length;
 return {own:own.size,catalog,remainingPips:e.pipSum(remaining)};
}
function preferMany(few,many){return many.own>few.own&&3*(many.own-few.own)>=(many.catalog-few.catalog);}
function choose(name,opts,ctx={}){
 if(name!==H){
  if(name===F||name===M)return forced.choose(name,opts,ctx);
  return base.chooseBy(name,opts,ctx);
 }
 const few=forced.choose(F,opts,ctx),many=forced.choose(M,opts,ctx);
 if(few.type!=='double-sequence'||many.type!=='double-sequence'||few.tiles.length===many.tiles.length)return few;
 if(!ctx.state)throw Error('state required for mobility gate');
 const f=afterAction(opts,ctx.state,few),m=afterAction(opts,ctx.state,many);
 return preferMany(f,m)?many:few;
}
function empty(){return {appearances:0,finishFirst:0,pips:[],actions:0,variable:0,hybridLong:0,postOpeningInitialDoubles:0,finalDoubles:0,forcedDoubleTurns:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};}
function ci(xs){const m=mean(xs),v=xs.reduce((s,x)=>s+(x-m)**2,0)/(xs.length-1);return {estimate:m,halfWidth95:2.07*Math.sqrt(v/xs.length),clusters:xs.length};}
function run(startSeed=1403240,count=2400,maxTurns=200){
 if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<100||count%100)throw Error('count must be positive multiple of 100');
 const now=new Date();
 const baku=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(now)+' +04';
 const out={schema:'qosha-forced-double-mobility-hybrid/v1',timestampBaku:baku,engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9, PROVISIONAL number-lock four branches',startSeed,endSeed:startSeed+count-1,uniqueDeals:count,continuations:0,hiddenWorldContinuations:0,profiles:{},hypothesis:'Choose max-pips multi-double rather than fewest only when post-action distinct own playable tiles rise and 3*own mobility gain >= increase in full-deck ordinary-tile access proxy. Otherwise choose fewest. All policies delay doubles when an ordinary tile is legal.',limitations:'Full-deck access is a geometric proxy NOT a sampled opponent probability and includes played tiles. Initial followup default, synthetic previous winner when 1-1 stock, no block winner, loneZero, bust or 101 match. Real four-branch number locking unverified; seat rotations and profiles correlated.'};
 for(const names of PROFILES){
  const label=names.join(' / '),s=Object.fromEntries(names.map(n=>[n,empty()])),clusters=Array.from({length:count/100},()=>({rounds:0,wins:Object.fromEntries(names.map(n=>[n,0])),pips:Object.fromEntries(names.map(n=>[n,0]))}));
  let rounds=0,finishes=0,blocks=0,unresolved=0,turns=0;
  for(let seed=startSeed;seed<startSeed+count;seed++){
   const original=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(original.kind!=='ready')throw Error('initializer unresolved '+seed);
   const cl=clusters[Math.floor((seed-startSeed)/100)];
   for(let rotation=0;rotation<3;rotation++){
    const seats=[0,1,2].map(i=>names[(i+rotation)%3]);
    for(let seat=0;seat<3;seat++)s[seats[seat]].postOpeningInitialDoubles+=original.hands[seat].filter(t=>t[0]===t[1]).length;
    const chooser=(opts,state)=>{
     const name=seats[state.currentPlayer],m=s[name];m.actions++;
     const doubles=opts.actions.filter(a=>a.type==='double-sequence');
     const forcedTurn=doubles.length&&!opts.actions.some(a=>a.type==='single'||a.type==='mixed-finish');
     if(forcedTurn)m.forcedDoubleTurns++;
     const variable=forcedTurn&&new Set(doubles.map(a=>a.tiles.length)).size>1;
     if(variable)m.variable++;
     const action=choose(name,opts,{state,seed,rotation,turns:state.turns,player:state.currentPlayer});
     if(variable&&name===H&&action.tiles.length>Math.min(...doubles.map(a=>a.tiles.length)))m.hybridLong++;
     return action;
    };
    const result=round.runRound(original,chooser,{maxTurns});rounds++;turns+=result.turns;cl.rounds++;
    if(result.outcome.kind==='finish'){
     finishes++;const name=seats[result.outcome.playerIndex];s[name].finishFirst++;s[name].minus[String(result.outcome.minus||0)]++;cl.wins[name]++;
    }else if(result.outcome.kind==='block')blocks++;else unresolved++;
    for(let seat=0;seat<3;seat++){
     const name=seats[seat],m=s[name],p=e.pipSum(result.hands[seat]);
     m.appearances++;m.pips.push(p);m.finalDoubles+=result.hands[seat].filter(t=>t[0]===t[1]).length;cl.pips[name]+=p;
    }
   }
  }
  const byStrategy={};
  for(const name of names){const m=s[name];byStrategy[name]={appearances:m.appearances,finishFirstCount:m.finishFirst,finishFirstRate:m.finishFirst/m.appearances,meanFinalPips:mean(m.pips),medianFinalPips:median(m.pips),actions:m.actions,forcedDoubleTurns:m.forcedDoubleTurns,variableCountOpportunities:m.variable,hybridSelectedLong:m.hybridLong,meanPostOpeningInitialDoubles:m.postOpeningInitialDoubles/m.appearances,meanFinalDoubles:m.finalDoubles/m.appearances,minusFinishes:m.minus};}
  const paired={};
  for(const other of names.filter(n=>n!==H)){
   paired['hybrid-minus-'+other]={finishFirstPP:ci(clusters.map(c=>100*(c.wins[H]-c.wins[other])/c.rounds)),meanFinalPips:ci(clusters.map(c=>(c.pips[H]-c.pips[other])/c.rounds))};
  }
  out.profiles[label]={strategies:names,rounds,finishes,blocks,unresolved,meanTurns:turns/rounds,byStrategy,paired,clusterSizeDeals:100,confidence:'exploratory uncorrected t(23) 95% half-widths; 24 nonoverlapping seed clusters',clusters:clusters.map((c,i)=>({startSeed:startSeed+100*i,...c}))};
  out.continuations+=rounds;
 }
 return out;
}
function test(){
 const ok=(x,msg)=>{if(!x)throw Error(msg);};
 ok(preferMany({own:1,catalog:4},{own:3,catalog:10}),'mobility beats access at equality');
 ok(!preferMany({own:1,catalog:4},{own:2,catalog:10}),'access gate');
 ok(!preferMany({own:1,catalog:4},{own:1,catalog:4}),'no own mobility gain');
 const one={type:'double-sequence',tiles:[[2,2]],numbers:[2]},two={type:'double-sequence',tiles:[[2,2],[3,3]],numbers:[2,3]},single={type:'single',tile:[1,5],side:'up',to:5},mixed={type:'mixed-finish',tiles:[[1,5],[5,5]],numbers:[5]};
 ok(choose(H,{actions:[single,one,two]})===single,'late opening priority');
 ok(choose(H,{actions:[mixed,one,two]})===mixed,'mixed finish priority');
 ok(choose(H,{actions:[one]})===one,'no conflict');
 const a=run(1403240,100),b=run(1403240,100);
 delete a.timestampBaku;delete b.timestampBaku;ok(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');
 ok(a.continuations===1200&&Object.values(a.profiles).every(p=>p.unresolved===0),'round accounting');
 return {passed:true,checks:['mobility threshold','access gate','no mobility gain','late opening','mixed finish','no conflict','100-seed replay'],replayContinuations:1200};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1403240),+(a[1]||2400)),null,2));}
module.exports={choose,run,test,preferMany,afterAction,H,F,M,PROFILES};