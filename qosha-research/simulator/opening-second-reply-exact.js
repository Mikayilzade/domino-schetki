'use strict';
// Exhaustive fixed-hand, two-opponent-turn opening analysis (3 x 9, first-round 1-1).
// No late-arrival branch assumptions, no complete-round or win-rate claims.
// Run: node qosha-research/simulator/opening-second-reply-exact.js [test]
const assert = require('assert');
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
const key=t=>t.join('-'),pips=t=>t[0]+t[1];
const fixtures=[
 {name:'small-gap-c2',x:2,y:3,hand:[[1,2],[1,3],[2,2],[0,0],[0,4],[0,5],[2,5],[4,5],[4,6]]},
 {name:'large-gap-c2',x:0,y:6,hand:[[0,1],[1,6],[0,0],[2,3],[3,4],[4,5],[2,5],[3,5],[5,6]]},
 {name:'small-gap-c3',x:2,y:4,hand:[[0,1],[1,2],[1,4],[2,2],[0,0],[0,3],[2,5],[3,5],[5,6]]}
];
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function init(x){return {ends:[x,1,1,1],locked:[true,false,false,false],opened:[1]};}
function legal(board,hand){const out=[];
 for(let i=0;i<hand.length;i++){
  const t=hand[i],dbl=t[0]===t[1];
  for(let side=0;side<4;side++){
   const end=board.ends[side];
   if(dbl){if(t[0]===end&&!board.opened.includes(t[0]))out.push({i,side,t,double:true,to:end});}
   else if(!board.locked[side]&&(t[0]===end||t[1]===end))out.push({i,side,t,double:false,to:t[0]===end?t[1]:t[0]});
  }
 }
 return out;
}
function choose(acts,policy){if(!acts.length)return null;return acts.slice().sort((a,b)=>
 (policy==='high'?pips(b.t)-pips(a.t):pips(a.t)-pips(b.t))||key(a.t).localeCompare(key(b.t))||a.side-b.side)[0];}
function apply(board,act,model){const next={ends:board.ends.slice(),locked:board.locked.slice(),opened:board.opened.slice()};
 if(act.double){next.locked[act.side]=false;next.opened.push(act.to);}
 else {next.ends[act.side]=act.to;next.locked[act.side]=!(model==='global'&&next.opened.includes(act.to));}
 return next;
}
function hasLegalByIndependentMask(board,hand){
 const open=[],locked=[];for(let i=0;i<4;i++)(board.locked[i]?locked:open).push(board.ends[i]);
 return hand.some(([a,b])=>a===b?(locked.includes(a)&&!board.opened.includes(a)):(open.includes(a)||open.includes(b)));
}
function window(x,h1,h2,policy,model){let b=init(x),first=choose(legal(b,h1),policy),second;
 let firstPips=0,secondPips=0;
 if(first){firstPips=pips(first.t);b=apply(b,first,model);}
 second=choose(legal(b,h2),policy);
 assert.equal(Boolean(second),hasLegalByIndependentMask(b,h2));
 if(second)secondPips=pips(second.t);
 return {firstPass:!first,secondPass:!second,bothPass:!first&&!second,
   firstPips,secondPips,shed:firstPips+secondPips,moves:Number(!!first)+Number(!!second),
   firstDouble:Boolean(first&&first.double),secondDouble:Boolean(second&&second.double),
   secondPassAfterFirstPlay:Boolean(first&&!second),secondPassAfterFirstPass:Boolean(!first&&!second)};
}
function analyseFixture(f){const known=new Set(['1-1',...f.hand.map(key)]),pool=deck.filter(t=>!known.has(key(t)));
 assert.equal(known.size,10);assert.equal(pool.length,18);
 assert(known.has(f.x+'-'+f.x));assert(!known.has(f.y+'-'+f.y));
 assert(known.has(key([Math.min(1,f.x),Math.max(1,f.x)])));
 assert(known.has(key([Math.min(1,f.y),Math.max(1,f.y)])));
 const metrics=['firstPass','secondPass','bothPass','firstPips','secondPips','shed','moves','firstDouble','secondDouble','secondPassAfterFirstPlay','secondPassAfterFirstPass'];
 const results={};for(const policy of ['high','low'])results[policy]={n:0,own:{},unowned:{},delta:{},firstPassOwnOnly:0,secondPassOwnOnly:0,secondPassUnownedOnly:0,secondPassSame:0,firstResponseDisagreement:0,modelDisagreements:0};
 const chosen=[];function visit(start){
  if(chosen.length===9){const a=chosen.map(i=>pool[i]),ids=new Set(chosen),b=pool.filter((_,i)=>!ids.has(i));
   assert.equal(a.length,9);assert.equal(b.length,9);
   for(const policy of ['high','low']){
    const r=results[policy];r.n++;
    const own=window(f.x,a,b,policy,'global'),unowned=window(f.y,a,b,policy,'global');
    const ownCurrent=window(f.x,a,b,policy,'current'),unCurrent=window(f.y,a,b,policy,'current');
    for(const m of metrics){
     if(own[m]!==ownCurrent[m]||unowned[m]!==unCurrent[m])r.modelDisagreements++;
     r.own[m]=(r.own[m]||0)+Number(own[m]);r.unowned[m]=(r.unowned[m]||0)+Number(unowned[m]);
    }
    r.firstPassOwnOnly+=Number(own.firstPass&&!unowned.firstPass);
    r.secondPassOwnOnly+=Number(own.secondPass&&!unowned.secondPass);
    r.secondPassUnownedOnly+=Number(!own.secondPass&&unowned.secondPass);
    r.secondPassSame+=Number(own.secondPass===unowned.secondPass);
    r.firstResponseDisagreement+=Number(own.firstPips!==unowned.firstPips);
   }return;
  }
  for(let i=start;i<=18-(9-chosen.length);i++){chosen.push(i);visit(i+1);chosen.pop();}
 }
 visit(0);
 for(const [policy,r] of Object.entries(results)){
  assert.equal(r.n,C(18,9));assert.equal(r.modelDisagreements,0);
  const connectors=f.hand.filter(t=>t[0]!==t[1]&&t.includes(1)).length;
  const pOwn=C(18-(6-connectors),9)/r.n,pUn=C(18-(7-connectors),9)/r.n;
  assert(Math.abs(r.own.firstPass/r.n-pOwn)<1e-12);
  assert(Math.abs(r.unowned.firstPass/r.n-pUn)<1e-12);
  assert.equal(r.firstPassOwnOnly,r.own.firstPass-r.unowned.firstPass);
  assert.equal(r.secondPassOwnOnly+r.secondPassUnownedOnly+r.secondPassSame,r.n);
  for(const m of metrics){r.own[m]/=r.n;r.unowned[m]/=r.n;r.delta[m]=r.own[m]-r.unowned[m];}
  for(const k of ['firstPassOwnOnly','secondPassOwnOnly','secondPassUnownedOnly','secondPassSame','firstResponseDisagreement'])r[k]/=r.n;
 }
 return {name:f.name,x:f.x,y:f.y,gap:f.y-f.x,connectors:f.hand.filter(t=>t[0]!==t[1]&&t.includes(1)).length,partitions:C(18,9),results};
}
function test(){
 const b=init(2);assert(!legal(b,[[0,2]]).length);assert(legal(b,[[2,2]]).some(q=>q.double));
 const opened=apply(b,legal(b,[[2,2]])[0],'global');assert(legal(opened,[[0,2]]).length);
 const next=apply(b,legal(b,[[1,3]])[0],'global');assert(!legal(next,[[3,6]]).length);
 const a=legal(b,[[1,5],[2,2]]);assert.equal(choose(a,'high').t.join('-'),'1-5');assert.equal(choose(a,'low').t.join('-'),'2-2');
 const cases=fixtures.map(analyseFixture);
 for(const f of cases)for(const r of Object.values(f.results)){
  assert(r.delta.firstPass>0);assert(r.firstPassOwnOnly>0);assert.equal(r.modelDisagreements,0);
 }
 return {passed:true,fixtures:cases.length,exactPartitions:cases.length*C(18,9),twoPolicies:true,branchModelsChecked:2};
}
function run(){const cases=fixtures.map(analyseFixture);return {schema:'qosha-opening-second-reply-exact/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',engine:'qosa-research-0.5.3+opening-second-reply-exact-1.0',rules:'recovered qosa-1.0.0, confirmed first-round 3x9 opening, one legal tile per opponent turn (optional multi-double declined)',seedSet:null,newSeededDeals:0,newSeededHiddenWorlds:0,newCompleteRounds:0,newForcedContinuations:0,exactOpponentPartitions:cases.length*C(18,9),strategies:['same known starter hand: 1-X retaining owned X-X','same hand: 1-Y with Y-Y unowned'],opponentPolicies:['highest-pip legal single action','lowest-pip legal single action'],metrics:cases,validation:'C(18,9) independent partitions per fixture; first-pass combinatorial identities, 28-tile uniqueness, legal locked-double opening, both provisional branch models produce identical two-turn metrics',limitations:['Three deliberately selected fixed hands, not a population-level estimate','Two opponent turns only, no win/first-place or minus results','Optional multi-double continuations declined, a valid but not universal policy','Human choice not modeled; branch late-arrival and blocked ties still unverified','No randomized seeded worlds; exact partitions must not be counted as new Monte Carlo samples'],nextAction:'Test on disjoint seed-selected hands with balanced connector count and pip gap; authenticate physical late-arrival and blocked-tie rules before complete-round rankings.'};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={test,run,analyseFixture,window};
