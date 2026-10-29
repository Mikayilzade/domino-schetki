'use strict';
// Exact first-follow-up choice: 1-1 is on table and starter has nine post-draw stones.
// No unverified late-arrival branch or block scoring assumption.
// node qosha-research/simulator/opening-pass-choice-exact.js test
// node qosha-research/simulator/opening-pass-choice-exact.js
const e=require('./engine');
const check=(v,m)=>{if(!v)throw Error('opening-pass-choice: '+m);};
const C=(n,k)=>{if(k<0||k>n)return 0;let x=1;for(let j=1;j<=k;j++)x=x*(n-j+1)/j;return Math.round(x);};
const other=t=>t[0]===1?t[1]:t[0];
function handAdvice(hand){
 check(Array.isArray(hand)&&hand.length===9,'post-draw hand must have nine stones');
 const keys=hand.map(e.tileKey),set=new Set(keys);
 check(set.size===9&&!set.has('1-1'),'duplicate or already played 1-1');
 const connectors=hand.filter(t=>t[0]!==t[1]&&(t[0]===1||t[1]===1));
 const c=connectors.length,base=6-c;
 return {connectors:c,choices:connectors.map(t=>{
  const x=other(t),ownsDouble=set.has(x+'-'+x),k=base+Number(!ownsDouble);
  return {tile:e.tileKey(t),end:x,ownsDouble,hiddenLegalTypes:k,
   exactNextOpponentPass:C(18-k,9)/C(18,9)};
 })};
}
function exactDistribution(){
 const den=C(27,9),rows=[];let mixedTotal=0,weightedAdv=0,handTotal=0;
 for(let c=0;c<=6;c++){
  let total=0,mixed=0;
  for(let b=0;b<=c;b++)for(let d=0;d<=6-c;d++){
   const n=C(6,c)*C(c,b)*C(6-c,d)*C(15,9-c-b-d);
   total+=n;if(b>0&&b<c)mixed+=n;
  }
  check(total===C(6,c)*C(21,9-c),'connector stratum '+c);
  const ownedPass=c?C(18-(6-c),9)/C(18,9):null;
  const unownedPass=c?C(18-(7-c),9)/C(18,9):null;
  const advantage=c>=2?ownedPass-unownedPass:null;
  rows.push({connectors:c,hands:total,mixedChoiceHands:mixed,ownedPass,unownedPass,
   advantagePp:advantage===null?null:100*advantage});
  handTotal+=total;mixedTotal+=mixed;
  if(advantage!==null)weightedAdv+=mixed*advantage;
 }
 check(handTotal===den,'hand conservation');
 return {totalPostDrawHands:den,mixedChoiceHands:mixedTotal,
  mixedChoiceRate:mixedTotal/den,meanPassAdvantagePpGivenMixed:100*weightedAdv/mixedTotal,rows};
}
function bruteNextPass(hand,tile){
 const initial=e.createBranchState([1,1]);
 const p=e.legalSinglePlacements(initial,tile).find(q=>q.side==='up');
 check(p,'not a legal opening connector');
 const board=e.applySinglePlacement(initial,p),opening=e.createOpeningState([1]);
 const known=new Set(['1-1',...hand.map(e.tileKey)]);
 const pool=e.createDoubleSixDeck().filter(t=>!known.has(e.tileKey(t)));
 check(pool.length===18,'hidden pool');
 let total=0,passes=0;const chosen=[];
 function rec(start){
  if(chosen.length===9){
   total++;const h=chosen.map(i=>pool[i]);
   const singles=e.legalSinglesForHand(board,h).filter(a=>a.tile[0]!==a.tile[1]&&e.isNumberOpened(opening,a.from));
   const doubles=e.candidateDoubleOpenings(board,opening,h);
   if(!singles.length&&!doubles.length)passes++;
   return;
  }
  for(let i=start;i<=18-(9-chosen.length);i++){chosen.push(i);rec(i+1);chosen.pop();}
 }
 rec(0);return {total,passes};
}
function test(){
 const hand=[[0,1],[1,2],[1,3],[0,0],[3,3],[2,4],[4,5],[5,6],[0,6]];
 const advice=handAdvice(hand);
 check(advice.connectors===3,'fixture connectors');
 const owned=advice.choices.find(q=>q.end===0),unowned=advice.choices.find(q=>q.end===2);
 check(owned.ownsDouble&&!unowned.ownsDouble,'owned/unowned fixture');
 const bruteChecks=[];
 for(const q of [owned,unowned]){
  const brute=bruteNextPass(hand,q.tile.split('-').map(Number));
  check(brute.total===48620&&brute.passes===C(18-q.hiddenLegalTypes,9),'brute != formula');
  bruteChecks.push({tile:q.tile,brutePasses:brute.passes,partitions:brute.total});
 }
 const six=handAdvice([[0,1],[1,2],[1,3],[1,4],[1,5],[1,6],[0,0],[2,2],[3,3]]);
 check(six.choices.find(q=>q.end===0).exactNextOpponentPass===1,'six connectors owned');
 check(six.choices.find(q=>q.end===4).exactNextOpponentPass===0.5,'six connectors unowned');
 let rejected=false;try{handAdvice([[1,1],...hand.slice(0,8)]);}catch(_){rejected=true;}
 check(rejected,'played 1-1 accepted');
 const d=exactDistribution();
 check(d.mixedChoiceHands===1749665&&d.totalPostDrawHands===4686825,'exact mixed count');
 return {passed:true,bruteChecks,exactMixedChoiceHands:d.mixedChoiceHands,
  testedRuleScope:'first opponent after starter 1-X; no late-arrival'};
}
function run(){
 const tests=test(),metrics=exactDistribution();
 return {schema:'qosha-opening-pass-choice-exact/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3+opening-pass-choice-exact-1.0',
  rules:'recovered qosa-1.0.0 3x9; confirmed 1-1 opening only',
  seeds:null,newDeals:0,newCompleteRounds:0,newHiddenAllocations:0,
  strategies:['legal 1-X retaining owned X-X','legal 1-Y with unowned Y-Y'],
  metrics,tests,
  finding:'Owning the X-X matching a chosen 1-X increases exact next-opponent pass probability; the effect depends only on connector count c, not X. Mixed choices exist in 37.33% of post-draw hands.',
  confidence:'Exact combinatorial census; independently brute-checked against engine legal actions for two 48,620-partition fixtures.',
  limitations:['Immediate next pass only; not win/minus/regret','Uniform hidden allocations, not opponent choice likelihood','Unverified late-arrival and block-tie rules','Different connector pips/long-term geometry are confounded'],
  nextAction:'Use exact pass likelihood as a feature, not a policy; test matched opening choices against independent continuation bots and authenticate late-arrival/block-tie rules.'};
}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={handAdvice,exactDistribution,bruteNextPass,test,run};
