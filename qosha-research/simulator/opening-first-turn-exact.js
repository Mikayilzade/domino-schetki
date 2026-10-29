'use strict';
// Exact rule-invariant first opponent turn, no random worlds or full-game claims.
// node qosha-research/simulator/opening-first-turn-exact.js test
// node qosha-research/simulator/opening-first-turn-exact.js
function C(n,k){if(k<0||k>n)return 0;let z=1;for(let i=1;i<=k;i++)z=z*(n-i+1)/i;return Math.round(z);}
function pop(n){let c=0;while(n){n&=n-1;c++;}return c;}
function expectedPips(vals,policy){
 const den=C(18,9),uniq=[...new Set(vals)].sort((a,b)=>a-b);
 let total=0;
 for(const v of uniq){
  const fewer=vals.filter(q=>q<v).length,atMost=vals.filter(q=>q<=v).length;
  const more=vals.filter(q=>q>v).length,atLeast=vals.filter(q=>q>=v).length;
  const p=policy==='high'?(C(18-more,9)-C(18-atLeast,9))/den:(C(18-fewer,9)-C(18-atMost,9))/den;
  total+=v*p;
 }
 return total;
}
function census(){
 const nums=[0,2,3,4,5,6],buckets={small:{hands:0,gapSum:0,passSum:0,high:0,low:0},large:{hands:0,gapSum:0,passSum:0,high:0,low:0}},total={hands:0,mixed:0,conflict:0};
 const perGap={};
 for(let s=0;s<64;s++)for(let d=0;d<64;d++){
  const c=pop(s),w=C(15,9-c-pop(d));total.hands+=w;
  if(!w)continue;
  const own=[],unown=[],legal=[];
  for(let i=0;i<6;i++){
   if(s&(1<<i)){if(d&(1<<i))own.push(nums[i]);else unown.push(nums[i]);}
   else legal.push(1+nums[i]);
  }
  if(!own.length||!unown.length)continue;
  total.mixed+=w;
  const x=Math.max(...own),y=Math.max(...unown),gap=y-x;
  if(gap<=0)continue;
  total.conflict+=w;
  const b=buckets[gap<=2?'small':'large'],g=perGap[gap]||(perGap[gap]={hands:0,high:0,low:0,passSum:0});
  const pass=(C(18-legal.length,9)-C(18-legal.length-1,9))/C(18,9);
  const high=expectedPips([...legal,2*y],'high')-expectedPips(legal,'high')-gap;
  const low=expectedPips([...legal,2*y],'low')-expectedPips(legal,'low')-gap;
  b.hands+=w;b.gapSum+=w*gap;b.passSum+=w*pass;b.high+=w*high;b.low+=w*low;
  g.hands+=w;g.high+=w*high;g.low+=w*low;g.passSum+=w*pass;
 }
 const shape=b=>({hands:b.hands,meanGap:b.gapSum/b.hands,passAdvantagePp:100*b.passSum/b.hands,highSinglePipMarginDelta:b.high/b.hands,lowSinglePipMarginDelta:b.low/b.hands,highPolicyBreakEven:b.high>0&&b.low<0?-b.low/(b.high-b.low):null});
 const all=Object.values(buckets).reduce((a,b)=>{for(const k of ['hands','gapSum','passSum','high','low'])a[k]=(a[k]||0)+b[k];return a;},{});
 return {total,buckets:{'1-2':shape(buckets.small),'3+':shape(buckets.large)},all:shape(all),perGap:Object.entries(perGap).map(([gap,g])=>({gap:+gap,hands:g.hands,high:g.high/g.hands,low:g.low/g.hands,passAdvantagePp:100*g.passSum/g.hands}))};
}
function brute(hand,x,y){
 const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
 const key=t=>t[0]+'-'+t[1],known=new Set(['1-1',...hand.map(key)]),pool=deck.filter(t=>!known.has(key(t)));
 if(pool.length!==18)throw Error('bad fixture');
 const vals=pool.map(t=>({pip:t[0]+t[1],isConnector:t[0]===1||t[1]===1,ownDouble:t[0]===x&&t[1]===x,unownDouble:t[0]===y&&t[1]===y}));
 let n=0,passA=0,passB=0,ha=0,hb=0,la=0,lb=0;
 const chosen=[];
 function rec(start){
  if(chosen.length===9){
   n++;
   const common=chosen.filter(i=>vals[i].isConnector).map(i=>vals[i].pip);
   const a=common.concat(chosen.filter(i=>vals[i].ownDouble).map(i=>vals[i].pip));
   const b=common.concat(chosen.filter(i=>vals[i].unownDouble).map(i=>vals[i].pip));
   passA+=Number(!a.length);passB+=Number(!b.length);
   ha+=a.length?Math.max(...a):0;hb+=b.length?Math.max(...b):0;
   la+=a.length?Math.min(...a):0;lb+=b.length?Math.min(...b):0;
   return;
  }
  for(let i=start;i<=18-(9-chosen.length);i++){chosen.push(i);rec(i+1);chosen.pop();}
 }
 rec(0);return {n,passA:passA/n,passB:passB/n,high:hb/n-ha/n-(y-x),low:lb/n-la/n-(y-x)};
}
function test(){
 const f1=[[0,1],[1,6],[0,0],[2,3],[3,4],[4,5],[2,5],[3,5],[5,6]];
 const f2=[[1,2],[1,3],[2,2],[0,0],[0,4],[0,5],[2,5],[4,5],[4,6]];
 const fixtures=[[f1,0,6],[f2,2,3]],results=[];
 for(const [hand,x,y] of fixtures){
  const keys=new Set(hand.map(t=>t[0]+'-'+t[1]));
  if(keys.size!==9||keys.has('1-1')||!keys.has(x+'-'+x)||keys.has(y+'-'+y))throw Error('fixture invalid');
  const nums=[0,2,3,4,5,6],legal=nums.filter(z=>!keys.has(Math.min(1,z)+'-'+Math.max(1,z))).map(z=>1+z);
  const high=expectedPips([...legal,2*y],'high')-expectedPips(legal,'high')-(y-x);
  const low=expectedPips([...legal,2*y],'low')-expectedPips(legal,'low')-(y-x);
  const exact=brute(hand,x,y),passA=C(18-legal.length,9)/C(18,9),passB=C(17-legal.length,9)/C(18,9);
  if(exact.n!==48620||Math.abs(exact.high-high)>1e-10||Math.abs(exact.low-low)>1e-10||Math.abs(exact.passA-passA)>1e-10||Math.abs(exact.passB-passB)>1e-10)throw Error('exact brute disagreement');
  results.push({gap:y-x,partitions:exact.n,high,low,passAdvantagePp:100*(passA-passB)});
 }
 const v=census();
 if(v.total.hands!==4686825||v.total.mixed!==1749665||v.total.conflict!==969475||v.buckets['1-2'].hands+v.buckets['3+'].hands!==v.total.conflict)throw Error('census regression');
 if(!(v.buckets['1-2'].highSinglePipMarginDelta>0&&v.buckets['3+'].highSinglePipMarginDelta<0&&v.buckets['1-2'].lowSinglePipMarginDelta<0))throw Error('direction regression');
 return {passed:true,exactFixturePartitions:97240,fixtures:results,maskPairs:4096};
}
function run(){
 const tests=test(),exact=census();
 return {schema:'qosha-opening-first-turn-exact/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',engine:'qosa-research-0.5.3+opening-first-turn-exact-1.0',rules:'recovered qosa-1.0.0 confirmed first-round 3x9 1-1 opening; one immediate opponent single-tile turn only',seeds:null,newDeals:0,newCompleteRounds:0,newHiddenAllocations:0,newForcedContinuations:0,strategies:['starter 1-X retaining owned X-X (max owned X)','starter higher-pip 1-Y where Y-Y unowned (max unowned Y)','opponent highest-pip legal single','opponent lowest-pip legal single'],metrics:exact,tests,definition:'delta = [opponent remaining pips - starter remaining pips] after first opponent turn, owned-X-X choice minus higher-pip Y choice; forced passes shed zero',finding:'In exact population of 969475 pip-conflict starter hands, small sacrifices 1-2 have +1.2304 pip margin against high-pip opponent and -0.8720 against low-pip; sacrifices 3+ have -1.0682 and -3.3855. One-turn scope only.',confidence:'Exact combinatorial weighting over all 4686825 post-draw starter hands; two independent exhaustive 48620-world opponent-hand fixtures.',limitations:['Only immediate first opponent turn, not two-turn continuation, game win or minus','Uniform hidden opponent hand distribution; no human policy inference','One legal stone per opponent turn; no optional chained doubles','Connector values, geometry and double ownership confounded; no causal isolation','Late-arrival branch and blocked-tie/101 scoring not used or validated'],nextAction:'Validate physical late-arrival branch reopening and blocked tie rules; compare matched full-round outcomes only after that. Independent gap-balanced two-turn holdout remains a priority.'};
}
if(typeof require!=='undefined'&&require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
if(typeof module!=='undefined')module.exports={C,pop,expectedPips,census,brute,test,run};
