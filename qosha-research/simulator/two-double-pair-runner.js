'use strict';
// Two-double exact-pair matched-deal study. Assumption-labelled branch semantics.
// node qosha-research/simulator/two-double-pair-runner.js 1070000 2500
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer'),s=require('./strategy-runner');
const ENGINE='qosa-research-0.5.3';
function pairFeatures(hand,starter){
  const ds=hand.filter(t=>t[0]===t[1]&&t[0]!==1).map(t=>t[0]).sort((a,b)=>a-b);
  if(ds.length!==2)return null;
  const ordinary=hand.filter(t=>t[0]!==t[1]);
  const [x,y]=ds;
  const touching=n=>ordinary.filter(t=>t.includes(n)).length;
  return {pair:x+'-'+y,gap:y-x,starter,sharedConnector:ordinary.some(t=>t.includes(x)&&t.includes(y)),
    bothConnected:touching(x)>0&&touching(y)>0,zeroDouble:x===0,sixDouble:y===6};
}
function blank(){return{n:0,controlFirst:0,moderateFirst:0,pairedGain:0,pairedLoss:0,controlPips:0,moderatePips:0,controlMinus:0,moderateMinus:0,controlBlocks:0,moderateBlocks:0,controlTurns:0,moderateTurns:0};}
function finish(g){return {...g,controlFirstRate:g.n?g.controlFirst/g.n:null,moderateFirstRate:g.n?g.moderateFirst/g.n:null,finishDeltaPP:g.n?100*(g.controlFirst-g.moderateFirst)/g.n:null,
  meanPipsDelta:g.n?(g.controlPips-g.moderatePips)/g.n:null,minusDeltaPP:g.n?100*(g.controlMinus-g.moderateMinus)/g.n:null,blockDeltaPP:g.n?100*(g.controlBlocks-g.moderateBlocks)/g.n:null,meanTurnDelta:g.n?(g.controlTurns-g.moderateTurns)/g.n:null};}
function run(startSeed,count){
  if(!Number.isInteger(startSeed)||!Number.isInteger(count)||count<1)throw Error('integer seed/count required');
  const groups={},byPair={},checks={deck:0,eligible:0,completeRounds:0,unresolved:0};
  function add(key,control,moderate,focal){
    const g=groups[key]||(groups[key]=blank());g.n++;
    const a=control.outcome.kind==='finish'&&control.outcome.playerIndex===focal;
    const b=moderate.outcome.kind==='finish'&&moderate.outcome.playerIndex===focal;
    g.controlFirst+=+a;g.moderateFirst+=+b;g.pairedGain+=+(a&&!b);g.pairedLoss+=+(b&&!a);
    g.controlPips+=e.pipSum(control.hands[focal]);g.moderatePips+=e.pipSum(moderate.hands[focal]);
    g.controlMinus+=+(a&&control.outcome.minus<0);g.moderateMinus+=+(b&&moderate.outcome.minus<0);
    g.controlBlocks+=+(control.outcome.kind==='block');g.moderateBlocks+=+(moderate.outcome.kind==='block');
    g.controlTurns+=control.turns;g.moderateTurns+=moderate.turns;
  }
  for(let seed=startSeed;seed<startSeed+count;seed++){
    const deal=e.dealThreeByNine(seed);
    if(new Set([...deal.hands.flat(),...deal.stock].map(e.tileKey)).size!==28)throw Error('deck integrity '+seed);
    checks.deck++;
    const base=init.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:false,previousWinnerIndex:seed%3});
    if(base.kind!=='ready')throw Error('initialization '+seed+':'+base.kind);
    for(let focal=0;focal<3;focal++){
      const f=pairFeatures(deal.hands[focal],focal===base.starter);if(!f)continue;
      checks.eligible++;
      const play=policy=>r.runRound(base,(opts,state)=>s.chooseBy(state.currentPlayer===focal?policy:'moderate-double-hold',opts,{seed,rotation:0,turns:state.turns,player:state.currentPlayer,salt:0}),{maxTurns:200});
      const control=play('closed-branch-control'),moderate=play('moderate-double-hold');
      if(control.outcome.kind==='unresolved'||moderate.outcome.kind==='unresolved'){checks.unresolved++;throw Error('unresolved '+seed+' '+focal);}
      checks.completeRounds+=2;
      for(const key of ['all','pair:'+f.pair,'gap:'+f.gap,'starter:'+f.starter,'sharedConnector:'+f.sharedConnector,
        'bothConnected:'+f.bothConnected,'zeroDouble:'+f.zeroDouble,'sixDouble:'+f.sixDouble,
        'pair:'+f.pair+'|starter:'+f.starter,'pair:'+f.pair+'|sharedConnector:'+f.sharedConnector])
        add(key,control,moderate,focal);
    }
  }
  const pairN=Object.entries(groups).filter(([k])=>/^pair:\d-\d$/.test(k)).reduce((n,[,g])=>n+g.n,0);
  if(pairN!==checks.eligible||groups.all.n!==checks.eligible||checks.completeRounds!==2*checks.eligible)throw Error('group accounting');
  return {startSeed,endSeed:startSeed+count-1,deals:count,checks,groups:Object.fromEntries(Object.entries(groups).map(([k,g])=>[k,finish(g)]))};
}
function selfTest(){const a=run(1070000,12),b=run(1070000,12);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('nondeterministic replay');return{deterministic12Seeds:true,deckChecks:a.checks.deck,unresolved:a.checks.unresolved};}
if(require.main===module){const start=Number(process.argv[2]||1070000),count=Number(process.argv[3]||2500);console.log(JSON.stringify({selfTest:selfTest(),result:run(start,count)},null,2));}
module.exports={ENGINE,pairFeatures,run,selfTest};
