'use strict';
// Reproducible exact opening lock depth, independent of unconfirmed late-arrival/block rules.
const study=function study() {
  'use strict';
  // Exact repeated-pass locks after confirmed first-round 1-1 + stock draw.
  const assert=(v,m)=>{if(!v)throw Error('opening-lock-depth: '+m);};
  const C=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
  const key=t=>Math.min(...t)+'-'+Math.max(...t);
  const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
  const connector=x=>[Math.min(1,x),Math.max(1,x)];
  const six=[0,2,3,4,5,6].map(connector);
  const fillers=deck.filter(t=>key(t)!=='1-1'&&!six.some(s=>key(s)===key(t)));
  assert(fillers.length===21,'21 nonconnectors');
  const counts=[0,0,0,0];
  for(let a=0;a<21;a++)for(let b=a+1;b<21;b++)for(let c=b+1;c<21;c++){
    const f=[fillers[a],fillers[b],fillers[c]];
    const d=f.filter(t=>t[0]===t[1]).length;counts[d]++;
  }
  const analytic=[0,1,2,3].map(d=>C(6,d)*C(15,3-d));
  assert(counts.every((x,i)=>x===analytic[i])&&counts.reduce((a,b)=>a+b,0)===1330,'independent filler census');
  const total=C(27,9);
  const thresholds=[1,2,3].map(rotations=>{
    const hands=counts.slice(rotations).reduce((a,b)=>a+b,0);
    return {guaranteedFullOpponentRotations:rotations,atLeastHands:hands,
      fractionOfAllPostDrawStarterHands:hands/total,oneInHands:total/hands};
  });
  function legal(board,t) {
    for(const side of board){
      if(t[0]===t[1]){if(t[0]===side.end)return true;}
      else if(!side.locked&&(t[0]===side.end||t[1]===side.end))return true;
    }
    return false;
  }
  function trace(f,depth) {
    const hand=six.concat(f),known=new Set(hand.map(key));
    assert(known.size===9,'nine unique hand tiles');
    const owned=f.filter(t=>t[0]===t[1]).map(t=>t[0]).sort((a,b)=>a-b);
    assert(depth<=owned.length,'depth exceeds owned doubles');
    const pool=deck.filter(t=>key(t)!=='1-1'&&!known.has(key(t)));
    assert(pool.length===18,'18 unknown tiles');
    const board=[1,1,1,1].map(end=>({end,locked:false}));
    const steps=[];
    if(depth===0){
      board[0]={end:0,locked:true}; // unowned 0-0 is a legal opponent double
      assert(pool.some(t=>legal(board,t)),'no opponent reply in zero-owned control');
      steps.push({played:'0-1',heldDouble:null,opponentLegalTiles:pool.filter(t=>legal(board,t)).length});
    }
    for(let i=0;i<depth;i++){
      const x=owned[i];
      assert(board[i].end===1&&!board[i].locked,'unused open 1 branch');
      board[i]={end:x,locked:true}; // ordinary 1-X; own X-X is deliberately retained
      assert(pool.every(t=>!legal(board,t)),'unexpected legal opponent tile after safe connector');
      steps.push({played:key(connector(x)),heldDouble:key([x,x]),opponentLegalTiles:0});
    }
    return {hand:hand.map(key),ownedDoubles:owned,steps,pool,board};
  }
  const fixtures=[
    {fill:[[0,2],[0,3],[0,4]],depth:0},
    {fill:[[0,0],[0,2],[0,3]],depth:1},
    {fill:[[0,0],[2,2],[0,3]],depth:2},
    {fill:[[0,0],[2,2],[3,3]],depth:3}
  ];
  const brute=[];
  for(const {fill,depth} of fixtures){
    const x=trace(fill,depth);
    let partitions=0,allPass=0,nonzeroLegalWorlds=0;
    const pick=[];
    function visit(start){
      if(pick.length===9){
        partitions++;
        const selected=new Set(pick),a=pick.map(i=>x.pool[i]),b=x.pool.filter((_,i)=>!selected.has(i));
        const noReply=!a.some(t=>legal(x.board,t))&&!b.some(t=>legal(x.board,t));
        allPass+=Number(noReply);nonzeroLegalWorlds+=Number(!noReply);
        return;
      }
      for(let i=start;i<=18-(9-pick.length);i++){pick.push(i);visit(i+1);pick.pop();}
    }
    visit(0);
    assert(partitions===48620,'opponent partition count');
    assert(depth===0?allPass===0:allPass===48620,'partition reply mismatch');
    brute.push({matchingDoubles:depth,partitions,bothOpponentsPass:allPass,
      oneOrBothCanReply:nonzeroLegalWorlds,sequence:x.steps});
  }
  assert(thresholds[0].atLeastHands===875&&thresholds[1].atLeastHands===245&&thresholds[2].atLeastHands===20,'threshold counts');
  return {schema:'qosha-opening-lock-depth-exact/v1',
    engine:'qosa-research-0.5.3+opening-lock-depth-exact-1.0',
    rules:'recovered qosa-1.0.0; confirmed first-round 3x9 1-1 + stock draw, unused 1 branches and held X-X; no late-arrival assumption',
    newDeals:0,newCompleteRounds:0,newHiddenWorldAllocations:0,newForcedContinuations:0,seeds:null,
    exactPostDrawHands:total,allSixConnectorHands:1330,
    byMatchingDoubles:counts.map((hands,matchingDoubles)=>({matchingDoubles,hands})),
    thresholds,tests:{independent1330FillerEnumeration:true,exactOpponentPartitions:brute,
      conservation28:true,heldDoubleNotPlayed:true},
    finding:'With all six 1-X connectors, d matching X-X doubles allow d consecutive starter connector plays, each followed by two forced opponent passes, for d=1..3. Exactly 245 hands guarantee two such rotations, 20 guarantee three.',
    limitations:['Only first-round opening and initial untouched stock; not a win-rate or minus claim','The starter voluntarily holds matching doubles and plays ordinary connectors on distinct 1 sides','Very rare; no human opponent decision model','No authentic late-arrival, block-tie, loneZero or 101 scoring validation'],
    nextAction:'Seek authentic late-arrival and blocked-tie traces; if confirmed, compare multi-rotation tempo versus alternative moves on matched hidden worlds'};
};
if (typeof require!=='undefined' && require.main===module) console.log(JSON.stringify(study(),null,2));
if (typeof module!=='undefined') module.exports={study};
