'use strict';
// Exact two-opponent opening pass census. No full-round, late-branch or blocked-tie assumptions.
// Run: node qosha-research/simulator/opening-two-opponent-pass-census.js [test]
function C(n,k){if(k<0||k>n)return 0;let z=1;for(let i=1;i<=k;i++)z=z*(n-i+1)/i;return Math.round(z);}
function pop(n){let c=0;while(n){n&=n-1;c++;}return c;}
function metrics(k){
 const p=C(18-k,9)/C(18,9);
 return {firstPass:p,bothReadyBeforeAnyReply:k===0?0:1-2*p,
  bothForcedPass:k===0?1:0,secondCanReplyGivenFirstPass:k===0?0:1};
}
function census(){
 const nums=[0,2,3,4,5,6],rows=Array.from({length:7},(_,c)=>({connectors:c,hands:0,conflicts:0,locks:0,ownedPass:0,unownedPass:0,ownedBothReady:0,unownedBothReady:0}));
 let allHands=0,mixedHands=0,conflictHands=0,conflictFullLocks=0;
 for(let s=0;s<64;s++)for(let d=0;d<64;d++){
  const c=pop(s),w=C(15,9-c-pop(d));if(!w)continue;
  allHands+=w;rows[c].hands+=w;
  const owned=[],unowned=[];
  for(let i=0;i<6;i++)if(s&(1<<i))((d&(1<<i))?owned:unowned).push(nums[i]);
  if(!owned.length||!unowned.length)continue;
  mixedHands+=w;
  // Same-hand, pip-conflict selection as opening-first-turn-exact.js:
  // max owned X versus max unowned Y with Y>X.
  if(Math.max(...unowned)<=Math.max(...owned))continue;
  conflictHands+=w;const r=rows[c];r.conflicts+=w;
  const a=metrics(6-c),b=metrics(7-c);
  conflictFullLocks+=w*a.bothForcedPass;r.locks+=w*a.bothForcedPass;
  r.ownedPass+=w*a.firstPass;r.unownedPass+=w*b.firstPass;
  r.ownedBothReady+=w*a.bothReadyBeforeAnyReply;r.unownedBothReady+=w*b.bothReadyBeforeAnyReply;
 }
 return {allHands,mixedHands,conflictHands,conflictFullLocks,
  conflictNoFullLock:conflictHands-conflictFullLocks,fullLockFraction:conflictFullLocks/conflictHands,
  rows:rows.filter(r=>r.conflicts).map(r=>({connectors:r.connectors,conflicts:r.conflicts,locks:r.locks,
   ownedFirstPass:r.ownedPass/r.conflicts,unownedFirstPass:r.unownedPass/r.conflicts,
   ownedBothReadyBeforeAnyReply:r.ownedBothReady/r.conflicts,unownedBothReadyBeforeAnyReply:r.unownedBothReady/r.conflicts})),
  weighted:{ownedFirstPass:rows.reduce((s,r)=>s+r.ownedPass,0)/conflictHands,
   unownedFirstPass:rows.reduce((s,r)=>s+r.unownedPass,0)/conflictHands,
   ownedBothReadyBeforeAnyReply:rows.reduce((s,r)=>s+r.ownedBothReady,0)/conflictHands,
   unownedBothReadyBeforeAnyReply:rows.reduce((s,r)=>s+r.unownedBothReady,0)/conflictHands}};
}
function brute(hand,x,y){
 const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
 const key=t=>t.join('-'),known=new Set(['1-1',...hand.map(key)]),pool=deck.filter(t=>!known.has(key(t)));
 if(pool.length!==18)throw Error('fixture pool');
 const legal=(t,end)=>t.includes(1)||(t[0]===end&&t[1]===end);
 const out=[x,y].map(end=>({end,k:pool.filter(t=>legal(t,end)).length,firstPass:0,bothReady:0,bothPass:0,secondReplyAfterFirstPass:0}));
 let n=0;const selected=[];
 function visit(start){
  if(selected.length===9){
   n++;const a=new Set(selected);
   for(const z of out){
    let first=0,second=0;
    for(let i=0;i<18;i++)if(legal(pool[i],z.end)){if(a.has(i))first++;else second++;}
    z.firstPass+=Number(!first);z.bothReady+=Number(!!first&&!!second);
    z.bothPass+=Number(!first&&!second);z.secondReplyAfterFirstPass+=Number(!first&&!!second);
   }
   return;
  }
  for(let i=start;i<=18-(9-selected.length);i++){selected.push(i);visit(i+1);selected.pop();}
 }
 visit(0);
 return {partitions:n,choices:out.map(z=>({end:z.end,k:z.k,firstPass:z.firstPass/n,
  bothReady:z.bothReady/n,bothPass:z.bothPass/n,
  secondReplyGivenFirstPass:z.firstPass?z.secondReplyAfterFirstPass/z.firstPass:null}))};
}
function test(){
 const a=census();
 if(a.allHands!==4686825||a.mixedHands!==1749665||a.conflictHands!==969475||a.conflictFullLocks!==685)throw Error('census mismatch');
 const fixtures=[
  {h:[[0,1],[1,6],[0,0],[2,3],[3,4],[4,5],[2,5],[3,5],[5,6]],x:0,y:6},
  {h:[[1,2],[1,3],[2,2],[0,0],[0,4],[0,5],[2,5],[4,5],[4,6]],x:2,y:3},
  {h:[[0,1],[1,2],[1,3],[1,4],[1,5],[1,6],[0,0],[2,2],[3,4]],x:0,y:4}
 ];
 const checked=[];
 for(const f of fixtures){
  const z=brute(f.h,f.x,f.y),c=f.h.filter(t=>t.includes(1)).length;
  if(z.partitions!==48620)throw Error('partition count');
  for(let i=0;i<2;i++){
   const m=metrics(6-c+i),q=z.choices[i];
   if(q.k!==6-c+i||Math.abs(q.firstPass-m.firstPass)>1e-12||
    Math.abs(q.bothReady-m.bothReadyBeforeAnyReply)>1e-12||
    q.bothPass!==m.bothForcedPass||
    (q.firstPass>0&&Math.abs(q.secondReplyGivenFirstPass-m.secondCanReplyGivenFirstPass)>1e-12))
    throw Error('independent brute mismatch');
  }
  checked.push({connectors:c,partitions:z.partitions,k:z.choices.map(q=>q.k)});
 }
 return {passed:true,exhaustivePartitions:fixtures.length*48620,fixtures:checked};
}
function run(){
 const tests=test(),results=census();
 return {schema:'qosha-opening-two-opponent-pass-census/v1',engine:'qosa-research-0.5.3+opening-two-opponent-pass-census-1.0',
  rules:'recovered qosa-1.0.0, confirmed first-round 3x9, 1-1 plus stock draw',seeds:null,
  newDeals:0,newFullRounds:0,newSeededHiddenWorlds:0,newForcedContinuations:0,
  strategies:['same-hand owned X-X lower-pip 1-X','same-hand unowned Y-Y higher-pip 1-Y'],
  results,tests,
  finding:'Among 969475 pip-conflict hands, only 685 owned-double choices guarantee both opponents pass; all other first-opponent forced passes imply that the second opponent has a legal reply.',
  limitations:['Second-opponent reply conditional on first pass is exact; both-ready is a pre-move snapshot, NOT a prediction after the first opponent plays',
   'No optional chains, no later branch behavior, block/tie, minus, win or match score','Uniform 9/9 opponent split of 18 unknown stones'],
  next:'Authenticate physical branch unlocking and blocked ties; test longer matched-world outcomes with provisional assumptions labelled.'};
}
if(typeof require!=='undefined'&&require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
if(typeof module!=='undefined')module.exports={C,metrics,census,brute,test,run};
