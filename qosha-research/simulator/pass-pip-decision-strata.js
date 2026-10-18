'use strict';
// Fixed-visible, paired hidden-world decision study. No opponent tile identities are
// used for the public choice. Reproduce with Node:
// node qosha-research/simulator/pass-pip-decision-strata.js test
// node qosha-research/simulator/pass-pip-decision-strata.js 1064160 600 60 12
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),pub=require('./public-pass-tournament');
const frontier=require('./public-pass-pip-frontier'),hidden=require('./hidden-world');
const {chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const OPPONENTS=['closed-branch-control','moderate-double-hold'];
function avg(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:null;}
function ci(a){if(a.length<2)return null;const m=avg(a),se=Math.sqrt(a.reduce((s,x)=>s+(x-m)*(x-m),0)/(a.length*(a.length-1)));return [m-1.96*se,m+1.96*se];}
function stratum(n){return n<=3?'1-3':n<=6?'4-6':'7-9';}
function gapStratum(n){return n===0?'0':n<=3?'1-3':'4+';}
function findChoice(base,seat,seed,maxTurns=200){
 let s=r.cloneRoundState(base);
 while(!s.outcome&&s.turns<maxTurns){
  const p=s.currentPlayer;
  if(p===seat){
   const opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
   if(opts.phase==='play'&&opts.actions.length>1){
    const rows=pub.publicChoices(opts,s,pub.publicPlayed(s));
    const pass=frontier.choose(rows,'pass'),hybrid=frontier.choose(rows,'pass-pip-0.01');
    if(actionKey(pass.action)!==actionKey(hybrid.action)){
     return {state:s,seat,seed,turn:s.turns,handSize:s.hands[seat].length,
      pass:{key:actionKey(pass.action),prob:pass.prob,pips:pass.pips},
      hybrid:{key:actionKey(hybrid.action),prob:hybrid.prob,pips:hybrid.pips},
      options:opts.actions.length};
    }
   }
  }
  s=r.stepRound(s,(opts,st)=>st.currentPlayer===seat?
   frontier.choose(pub.publicChoices(opts,st,pub.publicPlayed(st)),'pass').action:
   chooseBy('closed-branch-control',opts,{seed,turns:st.turns,player:st.currentPlayer}));
 }
 if(!s.outcome)throw Error('discovery unresolved '+seed+'/'+seat);
 return null;
}
function forced(world,key,policy,worldSeed){
 let first=true;
 const out=r.runRound(world,(opts,s)=>{
  if(first){first=false;const a=opts.actions.find(x=>actionKey(x)===key);if(!a)throw Error('forced action absent');return a;}
  return chooseBy(policy,opts,{seed:worldSeed,turns:s.turns,player:s.currentPlayer});
 },{maxTurns:200});
 if(out.outcome.kind==='unresolved')throw Error('continuation unresolved');
 return {first:+(out.outcome.kind==='finish'&&out.outcome.playerIndex===world.currentPlayer),
  pips:e.pipSum(out.hands[world.currentPlayer]),
  block:+(out.outcome.kind==='block'),
  minus:+(out.outcome.kind==='finish'&&out.outcome.playerIndex===world.currentPlayer&&out.outcome.minus<0),
  minusValue:out.outcome.kind==='finish'&&out.outcome.playerIndex===world.currentPlayer?out.outcome.minus:0,
  turns:out.turns};
}
function evaluate(choice,worlds){
 const s=choice.state,known=pub.publicPlayed(s);
 const spec={visibleState:s,focalPlayer:choice.seat,focalHand:s.hands[choice.seat],
  knownTiles:e.createDoubleSixDeck().filter(t=>known.has(e.tileKey(t))),
  hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length};
 const byPolicy={};
 for(const policy of OPPONENTS){
  const diffs={first:[],pips:[],block:[],minus:[],turns:[]};
  for(let i=0;i<worlds;i++){
   const ws=(Math.imul(choice.seed,1009)+Math.imul(choice.seat+1,1000003)+i+17000000)>>>0;
   const world=hidden.sampleWorld(spec,ws);
   const before=JSON.stringify(world);
   const a=forced(world,choice.pass.key,policy,ws),b=forced(world,choice.hybrid.key,policy,ws);
   if(JSON.stringify(world)!==before)throw Error('world mutated');
   for(const k of Object.keys(diffs))diffs[k].push(b[k]-a[k]);
  }
  byPolicy[policy]=Object.fromEntries(Object.entries(diffs).map(([k,v])=>[k,avg(v)]));
 }
 return {seed:choice.seed,seat:choice.seat,turn:choice.turn,handSize:choice.handSize,
  handStratum:stratum(choice.handSize),pipGap:choice.hybrid.pips-choice.pass.pips,
  pipGapStratum:gapStratum(Math.abs(choice.hybrid.pips-choice.pass.pips)),
  publicPassGap:choice.hybrid.prob-choice.pass.prob,options:choice.options,
  pass:choice.pass,hybrid:choice.hybrid,byPolicy};
}
function summarize(rows){
 const cells={};
 for(const policy of OPPONENTS){
  const groups={'all':rows};
  for(const row of rows){
   for(const k of ['hand:'+row.handStratum,'pipGap:'+row.pipGapStratum,'hand:'+row.handStratum+'|pipGap:'+row.pipGapStratum]){
    (groups[k]||(groups[k]=[])).push(row);
   }
  }
  cells[policy]=Object.fromEntries(Object.entries(groups).map(([k,rs])=>[k,{
   nPositions:rs.length,delta:Object.fromEntries(['first','pips','block','minus','turns'].map(m=>{
    const vals=rs.map(row=>row.byPolicy[policy][m]);return [m,{mean:avg(vals),ci95:ci(vals)}];
   }))
  }]));
 }
 return cells;
}
function run(start=1064160,scan=600,limit=60,worlds=12){
 if(![start,scan,limit,worlds].every(Number.isInteger)||scan<1||limit<1||worlds<1)throw Error('bad arguments');
 const rows=[],seeds=[];
 for(let seed=start;seed<start+scan&&rows.length<limit;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer');
  let picked=null;
  for(let seat=0;seat<3;seat++){const c=findChoice(base,seat,seed);if(c){picked=c;break;}}
  if(picked){rows.push(evaluate(picked,worlds));seeds.push(seed);}
 }
 return {schema:'qosa-pass-pip-decision-strata/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',timestamp:null,seedScan:[start,start+scan-1],selectedSeeds:seeds,
  selectedPositions:rows.length,worldsPerPosition:worlds,hiddenAllocations:rows.length*worlds,
  continuations:rows.length*worlds*2*OPPONENTS.length,fullStrategyRounds:0,
  selection:'first focal-seat public-pass vs pass-pip-0.01 disagreement per seed, discovered under pass focal / closed-branch-control opponents; one position per seed',
  comparison:'force each candidate in identical uniformly sampled hidden worlds; then both arms use the same named continuation policy for all three seats',
  assumptions:'known played tiles fixed, hidden opponents/stock uniformly reassigned; opponent history ignored; provisional branch semantics; finish-first not match winner; block winner unassigned',
  note:'strata pre-registered: hand size 1-3/4-6/7-9; absolute discarded-pip gap 0/1-3/4+. Position-level normal CIs exploratory, no multiple-comparison correction.',
  summary:summarize(rows),positions:rows};
}
function test(){
 const a=run(1064160,6,2,2),b=run(1064160,6,2,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions<1||a.continuations!==a.selectedPositions*8)throw Error('replay/invariants');
 if(a.positions.some(p=>p.pass.key===p.hybrid.key))throw Error('not a divergent choice');
 return {passed:true,positions:a.selectedPositions,continuations:a.continuations};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1064160),+(a[1]||600),+(a[2]||60),+(a[3]||12)),null,2));}
module.exports={findChoice,forced,evaluate,run,test};