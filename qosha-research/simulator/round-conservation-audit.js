
'use strict';
const assert=require('node:assert/strict');
const e=require('./engine'),init=require('./initializer'),rd=require('./round-driver');
const d=require('./turn-dispatcher'),t=require('./turn-kernel');
const basePolicy=require('./strategy-runner'),symmetric=require('./branch-label-symmetric-tiebreak');
const MIX=['random-legal','min-hand-pips','closed-branch-control'];
const ARMS=['stable-key-baseline','symmetric-action-orbit'];
function inventory(s,played,expected,stats,label){
 const all=[...s.hands.flat().map(e.tileKey),...s.stock.map(e.tileKey),...played];
 assert.equal(all.length,28,label+' tile count');
 assert.equal(new Set(all).size,28,label+' duplicate tile identity');
 assert.deepEqual([...all].sort(),expected,label+' exact inventory');stats.inventorySnapshots++;
}
function project(s){return{center:s.branchState.center,branches:e.SIDES.map(x=>[x,s.branchState.branches[x].active,s.branchState.branches[x].end]),opened:[...s.openingState.openedNumbers].sort((a,b)=>a-b),hands:s.hands.map(h=>h.map(e.tileKey).sort()),stock:s.stock.map(e.tileKey),currentPlayer:s.currentPlayer,consecutivePasses:s.consecutivePasses,turns:s.turns,outcome:s.outcome};}
function dealKey(x,p){return x.hands.map(h=>h.map(e.tileKey).sort().join(',')).join('|')+'|stock='+x.stock.map(e.tileKey).join(',')+'|pw='+p;}
function choose(arm,seed,rotation){return(o,s)=>{const name=MIX[(s.currentPlayer+rotation)%3],ctx={seed,rotation,turns:s.turns,player:s.currentPlayer,salt:11};if(arm==='stable-key-baseline'||name==='random-legal')return basePolicy.chooseBy(name,o,ctx);return symmetric.chooseSymmetric(name,o,{...ctx,branchState:s.branchState},'orbit');};}
function stepAudit(input,chooser,expected,played,stats){
 const s=rd.cloneRoundState(input),p=s.currentPlayer,o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock),choice=o.phase==='play'?chooser(o,s):null,tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,choice);
 const consumed=s.stock.length-tr.stock.length;
 assert.ok(consumed===0||consumed===1,'at most one draw per turn');assert.equal(tr.drawn,consumed===1,'draw flag/stock delta');
 if(tr.drawn){assert.deepEqual(tr.drawnTile,s.stock[0],'draw only stock head');stats.inRoundDraws++;}
 stats.maxDrawsPerTurn=Math.max(stats.maxDrawsPerTurn,consumed);
 const local=new Set();
 for(const tile of tr.playedTiles){const k=e.tileKey(tile);assert.ok(!played.has(k),'no repeated play '+k);assert.ok(!local.has(k),'no duplicate in action '+k);assert.ok(o.hand.some(x=>e.tileKey(x)===k),'played tile came from hand/draw '+k);played.add(k);local.add(k);stats.playedTileChecks++;}
 if(tr.passed){assert.equal(tr.playedTiles.length,0,'pass plays none');stats.passTurns++;}else stats.actionTurns++;
 const passNext=tr.passed?s.consecutivePasses+1:0;assert.equal(t.nextPassCount(s.consecutivePasses,tr),passNext,'pass counter increments/reset');
 const manual=rd.cloneRoundState(s);manual.branchState=tr.branchState;manual.openingState=tr.openingState;manual.hands[p]=tr.hand;manual.stock=tr.stock;manual.consecutivePasses=passNext;manual.turns++;
 manual.outcome=d.roundOutcome({hands:manual.hands,stock:manual.stock,consecutivePasses:passNext,lastPlayerIndex:p,lastTurnResult:tr,players:manual.hands.length});
 if(!manual.outcome)manual.currentPlayer=(p+1)%manual.hands.length;
 const actual=rd.stepRound(s,chooser);assert.deepEqual(project(actual),project(manual),'round-driver exact transition');stats.driverEquivalenceChecks++;
 inventory(actual,played,expected,stats,'after turn '+actual.turns);return{state:actual,lastTurn:tr};
}
function oneRound(base,arm,seed,rotation,expected,maxTurns){
 const played=new Set(['1-1']);if(base.openingFollowup)played.add(e.tileKey(base.openingFollowup.tile));
 const stats={inventorySnapshots:0,driverEquivalenceChecks:0,playedTileChecks:0,inRoundDraws:0,maxDrawsPerTurn:0,passTurns:0,actionTurns:0,transitions:0,openingPassed:!!base.openingPassed,openingDraw:base.openingDraw?1:0};
 let s=rd.cloneRoundState(base),last=null;inventory(s,played,expected,stats,'after initializer');
 while(!s.outcome&&stats.transitions<maxTurns){const z=stepAudit(s,choose(arm,seed,rotation),expected,played,stats);s=z.state;last=z.lastTurn;stats.transitions++;}
 assert.ok(s.outcome,'round terminates');assert.ok(s.outcome.kind==='finish'||s.outcome.kind==='block','resolved kind');
 if(s.outcome.kind==='finish'){assert.equal(s.hands[s.outcome.playerIndex].length,0,'finish hand empty');assert.equal(s.outcome.minus,e.finishMinus(last.finishDoubles||[]),'minus matches closing doubles');}
 else{assert.equal(s.stock.length,0,'block stock empty');assert.ok(s.consecutivePasses>=s.hands.length,'block full pass cycle');assert.deepEqual(s.outcome.remainders,s.hands.map(e.pipSum),'block pips');}
 stats.outcome=s.outcome.kind;stats.winnerIndex=s.outcome.kind==='finish'?s.outcome.playerIndex:null;stats.turns=s.turns;stats.minus=s.outcome.minus||0;stats.finalPips=s.hands.reduce((a,h)=>a+e.pipSum(h),0);return stats;
}
function emptyArm(){return{rounds:0,finish:0,block:0,turnTotal:0,minus:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0},inventorySnapshots:0,driverEquivalenceChecks:0,playedTileChecks:0,inRoundDraws:0,maxDrawsPerTurn:0,passTurns:0,actionTurns:0,openingPasses:0,openingDraws:0,finalPipsTotal:0,transitions:0};}
function add(a,s){a.rounds++;a[s.outcome]++;a.turnTotal+=s.turns;a.minus[String(s.minus)]=(a.minus[String(s.minus)]||0)+1;for(const k of ['inventorySnapshots','driverEquivalenceChecks','playedTileChecks','inRoundDraws','passTurns','actionTurns','transitions'])a[k]+=s[k];a.maxDrawsPerTurn=Math.max(a.maxDrawsPerTurn,s.maxDrawsPerTurn);a.openingPasses+=s.openingPassed?1:0;a.openingDraws+=s.openingDraw;a.finalPipsTotal+=s.finalPips;}
function runAudit(startSeed=11000000,count=100,maxTurns=200){
 const expected=e.createDoubleSixDeck().map(e.tileKey).sort(),seen=new Map(),dups=[],arms={};for(const a of ARMS)arms[a]=emptyArm();
 const pair={rounds:0,kindChanged:0,bothFinish:0,winnerChanged:0,minusChanged:0,turnDelta:0};
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const deal=e.dealThreeByNine(seed),pw=seed%3,k=dealKey(deal,pw);if(seen.has(k))dups.push({seed,duplicateOfSeed:seen.get(k)});else seen.set(k,seed);
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:pw});assert.equal(base.kind,'ready','initializer ready');
  for(let rotation=0;rotation<3;rotation++){
   const x=oneRound(base,ARMS[0],seed,rotation,expected,maxTurns),y=oneRound(base,ARMS[1],seed,rotation,expected,maxTurns);add(arms[ARMS[0]],x);add(arms[ARMS[1]],y);pair.rounds++;
   if(x.outcome!==y.outcome)pair.kindChanged++;
   if(x.outcome==='finish'&&y.outcome==='finish'){pair.bothFinish++;if(x.winnerIndex!==y.winnerIndex)pair.winnerChanged++;if(x.minus!==y.minus)pair.minusChanged++;}
   pair.turnDelta+=y.turns-x.turns;
  }
 }
 for(const a of Object.values(arms)){a.meanTurns=a.rounds?a.turnTotal/a.rounds:null;a.blockRate=a.rounds?a.block/a.rounds:null;a.meanFinalPipsPerSeat=a.rounds?a.finalPipsTotal/(a.rounds*3):null;a.meanTransitions=a.rounds?a.transitions/a.rounds:null;}
 pair.kindChangeRate=pair.rounds?pair.kindChanged/pair.rounds:null;pair.winnerChangeRateAmongBothFinish=pair.bothFinish?pair.winnerChanged/pair.bothFinish:null;pair.minusChangeRateAmongBothFinish=pair.bothFinish?pair.minusChanged/pair.bothFinish:null;pair.meanTurnDelta=pair.rounds?pair.turnDelta/pair.rounds:null;delete pair.turnDelta;
 return{schema:'qosa-round-conservation-audit/v1',engine:'qosha-research-0.5.3',rules:'recovered qosa-1.0.0 coded model; primary 3x9 + one stock; physical branch/opening semantics provisional',seedStart:startSeed,seedEnd:startSeed+count-1,seedDraws:count,uniqueAllocations:seen.size,duplicateSeedPairs:dups,policyDesign:{mix:MIX,seatRotations:3,arms:ARMS,baseline:'existing stable-key policy; seeded random-legal',actionOrbit:'same primary rank; sample top action-orbits then members; same seeded random-legal',matchedBy:'same seed/deal and rotation'},metrics:{arms,paired:pair},invariantChecks:{allResolved:true,unresolvedRounds:0,expectedUniqueTiles:28,inventorySnapshots:arms[ARMS[0]].inventorySnapshots+arms[ARMS[1]].inventorySnapshots,driverEquivalenceChecks:arms[ARMS[0]].driverEquivalenceChecks+arms[ARMS[1]].driverEquivalenceChecks,playedTileChecks:arms[ARMS[0]].playedTileChecks+arms[ARMS[1]].playedTileChecks,inRoundDraws:arms[ARMS[0]].inRoundDraws+arms[ARMS[1]].inRoundDraws,maxDrawsPerTurn:Math.max(...ARMS.map(a=>arms[a].maxDrawsPerTurn)),passTurns:arms[ARMS[0]].passTurns+arms[ARMS[1]].passTurns,actionTurns:arms[ARMS[0]].actionTurns+arms[ARMS[1]].actionTurns,openingPasses:arms[ARMS[0]].openingPasses+arms[ARMS[1]].openingPasses,openingDraws:arms[ARMS[0]].openingDraws+arms[ARMS[1]].openingDraws},limitations:'Internal conservation/driver audit only. The single stock tile is consumed during mandatory 1-1 setup in 3x9, so in-round draws may be absent; separate fixture tests cover draw-enabled paths. No physical rule authentication or strategy superiority.'};
}
function test(){const a=runAudit(11000000,3,200),b=runAudit(11000000,3,200);assert.deepEqual(a,b,'deterministic replay');assert.equal(a.seedDraws,3);assert.equal(a.metrics.arms['stable-key-baseline'].rounds,9);assert.equal(a.metrics.arms['symmetric-action-orbit'].rounds,9);assert.equal(a.invariantChecks.unresolvedRounds,0);assert.ok(a.invariantChecks.maxDrawsPerTurn<=1,'draw cap');return{passed:true,seedDraws:3,pairedRounds:a.metrics.paired.rounds,inventorySnapshots:a.invariantChecks.inventorySnapshots,driverEquivalenceChecks:a.invariantChecks.driverEquivalenceChecks};}
if(require.main===module){const a=process.argv.slice(2);process.stdout.write(JSON.stringify(a[0]==='test'?test():runAudit(Number(a[0]||11000000),Number(a[1]||100),Number(a[2]||200)),null,2)+'\n');}
module.exports={runAudit,test};
