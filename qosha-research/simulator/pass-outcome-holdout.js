'use strict';
// Paired high-versus-low exact-pass continuation experiment (3x9).
// node qosha-research/simulator/pass-outcome-holdout.js 800000 830000 30 24
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const {sampleWorld}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {chooseBy}=require('./strategy-runner');
const r=require('./round-driver'),e=require('./engine');
const policies=['closed-branch-control','min-hand-pips','fast-doubles'];
function rollout(w,key,policy,seed){
 let first=true;
 const s=r.runRound(w,(opts,st)=>{
  if(first){first=false;return opts.actions.find(a=>actionKey(a)===key);}
  return chooseBy(policy,opts,{seed,turns:st.turns,player:st.currentPlayer});
 },{maxTurns:200});
 if(s.outcome.kind==='unresolved')throw Error('unresolved');
 return {win:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===w.currentPlayer),
  pips:e.pipSum(s.hands[w.currentPlayer]),minus:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===w.currentPlayer&&s.outcome.minus<0)};
}
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
function run(start=800000,end=830000,limit=30,n=24){
 const found=collect(start,end,limit),rows=[];let continuations=0;
 for(const p of found.out){
  const s=p.state,f=s.currentPlayer,x=evaluate(p),gap=x.passDelta;
  const keys=[p.pair.connector,p.pair.other],high=gap>1e-12?0:gap< -1e-12?1:-1;
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:0,visibleState:s};
  const values=Object.fromEntries(policies.map(k=>[k,{win:[],pips:[],minus:[]}]));
  for(let j=0;j<n;j++){
   const seed=(1800000000+Math.imul(p.seed,103)+j)>>>0,w=sampleWorld(spec,seed);
   for(const policy of policies){
    const a=rollout(w,keys[0],policy,seed),b=rollout(w,keys[1],policy,seed);continuations+=2;
    const sign=high===1?-1:1;
    for(const metric of ['win','pips','minus'])values[policy][metric].push(sign*(a[metric]-b[metric]));
   }
  }
  rows.push({seed:p.seed,turn:p.turn,exactPass:[x.connector.pass,x.unrelated.pass],highPass:high===0?'connector':high===1?'unrelated':'tie',
   byPolicy:Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,avg(values[k][m])]))]))});
 }
 const informative=rows.filter(x=>x.highPass!=='tie');
 const summary=Object.fromEntries(policies.map(k=>[k,Object.fromEntries(['win','pips','minus'].map(m=>[m,informative.length?avg(informative.map(x=>x.byPolicy[k][m])):null]))]));
 return{schema:'qosa-pass-outcome-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedRange:[start,end-1],scannedDeals:found.scanned,
  positions:rows.length,informativePositions:informative.length,hiddenWorlds:rows.length*n,continuations,worldsPerPosition:n,
  worldSeedFormula:'(1800000000+Math.imul(dealSeed,103)+worldIndex)>>>0',policies,summary,rows,
  limitations:'First eligible selected positions; uniform hidden worlds not conditioned on history; fixed bots; assumed branch semantics; branch geometry confounds pass; block winner not assigned; finish-first not match win.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(run(+(a[0]||800000),+(a[1]||830000),+(a[2]||30),+(a[3]||24)),null,2));}
module.exports={run,rollout};
