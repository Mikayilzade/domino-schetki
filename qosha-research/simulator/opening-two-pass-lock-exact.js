'use strict';
// Exact two-pass lock after the confirmed first-round 1-1 + stock draw.
// Scope: 3 players x 9; starter plays one ordinary 1-X on an unused 1 side.
// No assumptions about late-arrival branches, block winner, or match scoring.
// node qosha-research/simulator/opening-two-pass-lock-exact.js test
// node qosha-research/simulator/opening-two-pass-lock-exact.js
const e = require('./engine');
const assert = (ok, why) => { if (!ok) throw Error('opening-two-pass-lock-exact: ' + why); };
const C = (n,k) => { if (k < 0 || k > n) return 0; let v=1; for(let i=1;i<=k;i++)v=v*(n-i+1)/i; return Math.round(v); };
const other = t => t[0]===1 ? t[1] : t[0];
function classify(hand) {
  assert(Array.isArray(hand) && hand.length===9,'nine post-draw stones');
  const keys=hand.map(e.tileKey), known=new Set(keys);
  assert(known.size===9 && !known.has('1-1'),'unique post-draw hand without 1-1');
  const connectors=hand.filter(t=>t[0]!==t[1] && t.includes(1));
  const c=connectors.length;
  return {connectors:c, options:connectors.map(t=>{
    const x=other(t),owned=known.has(x+'-'+x),unseen=6-c+Number(!owned);
    const oneOpponentPass=C(18-unseen,9)/C(18,9);
    return {tile:e.tileKey(t),end:x,ownedDouble:owned,unseenImmediateLegal:unseen,
      firstOpponentPass:oneOpponentPass,
      // The two opponents' hands partition all 18 unknown tiles. These
      // are FROZEN-BOARD capabilities, not two sequential pass outcomes.
      frozenAtLeastOneCannotReply:unseen===0?1:2*oneOpponentPass,
      guaranteedSequentialTwoPasses:unseen===0};
  })};
}
function census() {
  const total=C(27,9), rows=[];let sum=0,lockHands=0;
  for(let c=0;c<=6;c++){
    const hands=C(6,c)*C(21,9-c);
    // Pick c of six 1-X connectors, then 9-c of 21 non-connectors.
    // Of these 21, c are matching X-X doubles for the chosen connectors.
    const noOwned=C(6,c)*C(21-c,9-c);
    const withOwned=hands-noOwned;
    // Only c=6 can leave zero unseen 1-X; then an owned X-X also
    // removes the sole other immediate reply route.
    const locks=c===6?withOwned:0;
    sum+=hands;lockHands+=locks;
    rows.push({connectors:c,hands,handsWithMatchingDouble:withOwned,
      twoPassLockHands:locks});
  }
  assert(sum===total && lockHands===875,'census conservation');
  const byOwnedDoubles=[];
  for(let d=0;d<=3;d++)byOwnedDoubles.push({ownedDoubles:d,
    hands:C(6,d)*C(15,3-d)});
  assert(byOwnedDoubles.reduce((s,x)=>s+x.hands,0)===1330,'c=6 ownership partition');
  return {totalPostDrawHands:total,allSixConnectorsHands:1330,
    twoPassLockHands:lockHands,lockProbability:lockHands/total,
    oneInPostDrawHands:total/lockHands,byConnectorCount:rows,
    sixConnectorOwnership:byOwnedDoubles};
}
function canReplyOnOpening(board,opening,hand) {
  return e.legalSinglesForHand(board,hand).some(a=>a.tile[0]!==a.tile[1] &&
    e.isNumberOpened(opening,a.from)) ||
    e.candidateDoubleOpenings(board,opening,hand).length>0;
}
function brute(hand,connector) {
  const base=e.createBranchState([1,1]);
  const p=e.legalSinglePlacements(base,connector).find(a=>a.side==='up');
  assert(p,'legal opening connector');
  const board=e.applySinglePlacement(base,p),opening=e.createOpeningState([1]);
  const known=new Set(['1-1',...hand.map(e.tileKey)]);
  const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
  assert(pool.length===18,'18 hidden tiles');
  const selected=[];let partitions=0,firstPass=0,secondPass=0,bothPass=0;
  function visit(start) {
    if(selected.length===9){
      partitions++;
      const picked=new Set(selected),a=selected.map(i=>pool[i]);
      const b=pool.filter((_,i)=>!picked.has(i));
      const ap=!canReplyOnOpening(board,opening,a),bp=!canReplyOnOpening(board,opening,b);
      firstPass+=Number(ap);secondPass+=Number(bp);bothPass+=Number(ap&&bp);
      return;
    }
    for(let i=start;i<=18-(9-selected.length);i++){
      selected.push(i);visit(i+1);selected.pop();
    }
  }
  visit(0);
  return {partitions,firstPass,secondPass,bothPass};
}
function test(){
  const hand=[[0,1],[1,2],[1,3],[1,4],[1,5],[1,6],[0,0],[2,2],[3,3]];
  const classified=classify(hand);
  assert(classified.connectors===6,'six connector fixture');
  const owned=classified.options.find(x=>x.end===0),unowned=classified.options.find(x=>x.end===4);
  assert(owned.ownedDouble && !unowned.ownedDouble,'owned/unowned choices');
  assert(owned.guaranteedSequentialTwoPasses && !unowned.guaranteedSequentialTwoPasses,'lock flags');
  const a=brute(hand,[0,1]),b=brute(hand,[1,4]);
  assert(a.partitions===48620 && a.firstPass===48620 && a.secondPass===48620 && a.bothPass===48620,
    'owned lock brute');
  assert(b.partitions===48620 && b.firstPass===24310 && b.secondPass===24310 && b.bothPass===0,
    'unowned double brute');
  const low=classify([[0,1],[1,2],[1,3],[1,4],[1,5],[0,0],[2,2],[3,3],[4,4]]);
  assert(low.connectors===5 && low.options.find(x=>x.end===0).unseenImmediateLegal===1,
    'five connectors leaves a hidden legal tile');
  const n=census();
  assert(n.twoPassLockHands===875 && n.allSixConnectorsHands===1330,'exact census');
  assert(n.sixConnectorOwnership.map(x=>x.hands).join(',')==='455,630,225,20',
    'owned double multiplicity');
  return {passed:true,bruteOwned:a,bruteUnowned:b,independentPartitionCount:48620,
    censusHandCount:n.totalPostDrawHands};
}
function run(){
  const tests=test(),metrics=census();
  return {schema:'qosha-opening-two-pass-lock-exact/v1',
    timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
    engine:'qosa-research-0.5.3 + opening-two-pass-lock-exact-1.0',
    rules:'recovered qosa-1.0.0, confirmed first-round 3x9 1-1 + stock draw; only opening lock',
    newSeededDeals:0,newCompleteModelRounds:0,newHiddenWorldAllocations:0,
    exactHands:metrics.totalPostDrawHands,exactOpponentPartitionsPerFixture:48620,
    comparedActions:['1-X with owned X-X','1-Y with unowned Y-Y'],metrics,tests,
    finding:'When the starter has all six 1-connectors and chooses 1-X with X-X in hand, both opponents must pass; exactly 875 of 4,686,825 post-draw hands allow this opening two-pass lock.',
    confidence:'Exact combinatorial census and independent 48,620-partition engine legal-move checks for both owned/unowned choices.',
    limitations:['Extremely rare: 875/4,686,825 (~0.01867%)','Other c strata describe frozen-board availability, NOT actual sequential passes after a reply','No evidence of a higher full-game win rate','No late-arrival branch or blocked-tie assumption used'],
    nextAction:'Test whether the rare forced return can be converted to tempo advantage in actual human positions; authenticate physical late-arrival and block-tie rules before full-game strategy rankings.'};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={classify,census,brute,test,run};
