'use strict';
// Exact, branch-model-labelled chronological counterexample.
// Run: node qosha-research/simulator/branch-order-history-test.js
// Does NOT establish which branch rule is used in physical Qoşa.
const e=require('./engine');
const ok=(x,m)=>{if(!x)throw Error('branch-order: '+m);};
const S=e.SIDES;
const early=[
 {type:'single',tile:[1,2],side:'up'},
 {type:'single',tile:[1,3],side:'left'},
 {type:'double',number:3,side:'left'},
 {type:'single',tile:[2,3],side:'left'},
 {type:'double',number:2,side:'up'},
 {type:'single',tile:[2,4],side:'up'}
];
const late=[
 {type:'single',tile:[1,2],side:'up'},
 {type:'double',number:2,side:'up'},
 {type:'single',tile:[2,4],side:'up'},
 {type:'single',tile:[1,3],side:'left'},
 {type:'double',number:3,side:'left'},
 {type:'single',tile:[2,3],side:'left'}
];
function replay(events){
 let board=e.createBranchState([1,1]);
 const global=new Set([1]),local=Object.fromEntries(S.map(s=>[s,new Set([1])]));
 const played=new Set(['1-1']),doubles=new Set([1]);
 for(const ev of events){
  if(ev.type==='single'){
   const k=e.tileKey(ev.tile);
   ok(ev.tile[0]!==ev.tile[1],'single event is a double');
   ok(!played.has(k),'duplicate tile '+k);
   const p=e.legalSinglePlacements(board,ev.tile).find(x=>x.side===ev.side);
   ok(p,'no geometric placement '+k);
   ok(global.has(p.from)&&local[ev.side].has(p.from),'step illegal in one of the two models: '+k);
   board=e.applySinglePlacement(board,p);played.add(k);
  }else if(ev.type==='double'){
   const n=ev.number,k=n+'-'+n;
   ok(Number.isInteger(n)&&n>=0&&n<=6,'invalid double');
   ok(!played.has(k)&&!doubles.has(n),'reused double');
   const sides=e.sidesEndingIn(board,n);
   ok(sides.includes(ev.side),'double not on stated end '+k);
   for(const side of sides)local[side].add(n);
   global.add(n);played.add(k);doubles.add(n);
  }else throw Error('unknown event');
 }
 function canPlace(tile,model,side){
  const k=e.tileKey(tile);if(played.has(k))return false;
  if(tile[0]===tile[1])return e.sidesEndingIn(board,tile[0]).length>0;
  return e.legalSinglePlacements(board,tile).some(p=>
   (side===undefined||p.side===side)&&
   (model==='global-ever-open'?global.has(p.from):local[p.side].has(p.from)));
 }
 function legalKeys(model){return e.createDoubleSixDeck().filter(t=>canPlace(t,model)).map(e.tileKey).sort();}
 return {board,global,local,played,canPlace,legalKeys,
  ends:Object.fromEntries(S.map(s=>[s,board.branches[s].end]))};
}
function test(){
 const a=replay(early),b=replay(late);
 const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
 ok(eq(a.ends,b.ends),'final ends differ');
 ok(eq([...a.played].sort(),[...b.played].sort()),'played sets differ');
 ok(eq([...a.global].sort(),[...b.global].sort()),'global openings differ');
 ok(a.local.left.has(2)&&!b.local.left.has(2),'local opening chronology not distinguished');
 const tile=[2,6];
 ok(a.canPlace(tile,'all-current-only','left'),'early current left 2-6 illegal');
 ok(!b.canPlace(tile,'all-current-only','left'),'late current left 2-6 legal');
 ok(a.canPlace(tile,'global-ever-open','left')&&b.canPlace(tile,'global-ever-open','left'),'global 2-6 differs');
 const ag=a.legalKeys('global-ever-open'),bg=b.legalKeys('global-ever-open');
 const ac=a.legalKeys('all-current-only'),bc=b.legalKeys('all-current-only');
 ok(eq(ag,bg)&&eq(ag,ac),'early or global pass masks differ');
 const removed=ac.filter(k=>!bc.includes(k)),added=bc.filter(k=>!ac.includes(k));
 ok(eq(removed,['0-2','2-5','2-6'])&&added.length===0,'unexpected late pass-mask delta '+removed+'/'+added);
 let invalidRejected=false;
 try{replay([{type:'single',tile:[1,2],side:'up'},{type:'single',tile:[2,3],side:'left'}]);}
 catch(_){invalidRejected=true;}
 ok(invalidRejected,'invalid chronological step accepted');
 let duplicateRejected=false;
 try{replay([...early,{type:'single',tile:[1,2],side:'up'}]);}
 catch(_){duplicateRejected=true;}
 ok(duplicateRejected,'duplicate accepted');
 const c=replay(early);
 ok(eq(c.legalKeys('all-current-only'),ac),'non-deterministic replay');
 return {passed:true,engine:'qosa-research-0.5.3 branch-state primitives',
  rules:'recovered qosa-1.0.0 3x9; global-ever-open and all-current-only PROVISIONAL',
  exactHistories:2,newDeals:0,newHiddenAllocations:0,newModelRounds:0,newForcedContinuations:0,
  seeds:'not applicable: exact chronological fixtures',strategies:'none',
  samePlayedTiles:[...a.played].sort(),sameFinalEnds:a.ends,
  globalLegalCount:ag.length,earlyCurrentLegalCount:ac.length,lateCurrentLegalCount:bc.length,
  lateOnlyCurrentForbidden:removed,
  earlyLocalOpen2Sides:S.filter(s=>a.local[s].has(2)),
  lateLocalOpen2Sides:S.filter(s=>b.local[s].has(2)),
  checks:['same final played set and branch ends','both histories legal under both models',
   'global model order-invariant','all-current model order-sensitive','duplicate and illegal-step guards','deterministic replay'],
  interpretation:'A board snapshot and played-tile set do not determine a pass mask under the all-current-only interpretation; the chronological order of 2-2 and late arrival of 2 is necessary.',
  limitation:'Synthetic fixtures only; neither branch interpretation is authenticated by a real-game trace; no winner/minus/block result.'};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={early,late,replay,test};
