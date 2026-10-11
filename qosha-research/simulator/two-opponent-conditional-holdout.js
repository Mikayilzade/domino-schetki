'use strict';
// Reproduce: node qosha-research/simulator/two-opponent-conditional-holdout.js 320000 400000 25 25
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {matches}=require('./connector-other-matches'),{chooseBy}=require('./strategy-runner');
const {sampleWorld}=require('./hidden-world'),{actionKey,evaluateDecisionInWorld}=require('./decision-regret');
const {mobility}=require('./connector-mobility-runner');
const P=['closed-branch-control','min-hand-pips','fast-doubles'];
const avg=a=>a.reduce((s,v)=>s+v,0)/a.length;
function stat(a){if(!a.length)return null;const m=avg(a),sd=a.length>1?Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)):0;return{n:a.length,mean:m,exploratoryCI95:a.length>1?[m-1.96*sd/Math.sqrt(a.length),m+1.96*sd/Math.sqrt(a.length)]:null};}
function collect(start,end,limit){
 const out=[];let scanned=0;
 for(let seed=start;seed<end&&out.length<limit;seed++){
  let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(s.kind!=='ready')continue;scanned++;
  while(!s.outcome&&s.turns<100){
   const f=matches(s);if(f.length){
    const pair=f[0].pairs[0],o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
    const by=new Map(o.actions.map(a=>[actionKey(a),a])),a=by.get(pair.connector),b=by.get(pair.other);
    if(!a||!b||a.type!=='single'||b.type!=='single'||e.pipSum([a.tile])!==e.pipSum([b.tile]))throw Error('bad equal-pip comparison');
    const hidden=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
    out.push({seed,turn:s.turns,x:f[0].x,pair,state:r.cloneRoundState(s),known:e.createDoubleSixDeck().filter(t=>!hidden.has(e.tileKey(t))),sides:[a.side,b.side]});break;
   }
   s=r.stepRound(s,(opts,st)=>chooseBy('min-hand-pips',opts,{seed,turns:st.turns,player:st.currentPlayer}));
  }
 }
 return{scanned,out};
}
function access(world,forced,x,policy,seed){
 let s=r.stepRound(world,opts=>opts.actions.find(a=>actionKey(a)===actionKey(forced)));
 for(let i=0;i<2&&!s.outcome;i++)s=r.stepRound(s,(opts,st)=>chooseBy(policy,opts,{seed,turns:st.turns,player:st.currentPlayer}));
 if(s.outcome)return{returned:0,access:0,available:0};
 if(s.currentPlayer!==world.currentPlayer)throw Error('turn mismatch');
 const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
 const keys=new Set(o.actions.filter(a=>a.type==='single'&&a.tile.includes(x)&&a.tile[0]!==a.tile[1]).map(a=>e.tileKey(a.tile)));
 return{returned:1,access:+(keys.size>0),available:keys.size};
}
function run(start=320000,end=400000,limit=25,n=25){
 const found=collect(start,end,limit),rows=[];let continuations=0;
 for(const p of found.out){
  const s=p.state,f=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock),by=new Map(opts.actions.map(a=>[actionKey(a),a])),ca=by.get(p.pair.connector),oa=by.get(p.pair.other);
  const spec={focalPlayer:f,focalHand:s.hands[f],knownTiles:p.known,hiddenHandSizes:s.hands.map(h=>h.length),stockSize:s.stock.length,visibleState:s};
  const values=Object.fromEntries(P.map(k=>[k,[]]));
  for(let j=0;j<n;j++){
   const seed=34000000+1000*p.seed+j,w=sampleWorld(spec,seed);
   const next=mobility(w,oa,(f+1)%3).playable-mobility(w,ca,(f+1)%3).playable;
   const third=mobility(w,oa,(f+2)%3).playable-mobility(w,ca,(f+2)%3).playable;
   for(const k of P){
    const o=evaluateDecisionInWorld(w,{focalPlayer:f,continuationStrategy:k,seed,maxTurns:200});
    if(o.kind!=='paired-world')throw Error('not paired');
    continuations+=o.candidates.length;
    const map=new Map(o.candidates.map(a=>[a.actionKey,a])),a=map.get(p.pair.connector),b=map.get(p.pair.other);
    if(!a||!b||a.outcome==='unresolved'||b.outcome==='unresolved')throw Error('unresolved/missing');
    const x=access(w,ca,p.x,k,seed),y=access(w,oa,p.x,k,seed);
    values[k].push({next,third,joint:next===0&&third===0,finish:+a.focalFinishedFirst- +b.focalFinishedFirst,pips:a.focalRemainder-b.focalRemainder,minus:+(a.focalMinus<0)- +(b.focalMinus<0),access:x.access-y.access,available:x.available-y.available,returned:x.returned-y.returned});
   }
  }
  const common=values[P[0]];
  rows.push({seed:p.seed,turn:p.turn,x:p.x,sides:p.sides,handSizes:s.hands.map(h=>h.length),bothUnchanged:common.filter(v=>v.joint).length,
    mobilityOtherMinusConnector:{next:avg(common.map(v=>v.next)),third:avg(common.map(v=>v.third))},
    policy:Object.fromEntries(P.map(k=>[k,{all:Object.fromEntries(['finish','pips','minus','access','available','returned'].map(m=>[m,avg(values[k].map(v=>v[m]))])),
      bothUnchanged:values[k].some(v=>v.joint)?Object.fromEntries(['finish','pips','minus','access'].map(m=>[m,avg(values[k].filter(v=>v.joint).map(v=>v[m]))])):null}]))});
 }
 const summary={mobilityOtherMinusConnector:Object.fromEntries(['next','third'].map(m=>[m,stat(rows.map(v=>v.mobilityOtherMinusConnector[m]))]))};
 for(const k of P)summary[k]={all:Object.fromEntries(['finish','pips','minus','access','available','returned'].map(m=>[m,stat(rows.map(v=>v.policy[k].all[m]))])),
  bothUnchangedPositionCluster:Object.fromEntries(['finish','pips','minus','access'].map(m=>[m,stat(rows.filter(v=>v.policy[k].bothUnchanged).map(v=>v.policy[k].bothUnchanged[m]))]))};
 return{schema:'qosa-two-opponent-conditional-holdout/v1',timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,19)+' +04:00',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',
  start,end,scannedDeals:found.scanned,positions:rows.length,worldsPerPosition:n,hiddenWorlds:rows.length*n,candidateContinuations:continuations,
  selectedSeeds:rows.map(v=>v.seed),bothOpponentMobilityUnchangedWorlds:rows.reduce((s,v)=>s+v.bothUnchanged,0),
  worldSeedFormula:'34000000+1000*dealSeed+worldIndex',discoveryPolicy:'min-hand-pips',continuationPolicies:P,
  comparison:'equal-pip connector vs unrelated; X-X and another X connector retained; both opponent immediate mobility BEFORE next player acts; next-turn connector availability AFTER both players act',
  limitations:'different branch sides confounded; both-mobility-unchanged post-treatment descriptive only, not causal; opponent history not conditioned; first eligible; assumed branch opening; block winner unassigned; position-normal CI exploratory',summary,rows};
}
function selfTest(){const a=run(320000,360000,1,2),b=run(320000,360000,1,2);if(a.positions!==1||a.hiddenWorlds!==2||JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('replay');return{passed:true,seed:a.selectedSeeds[0]};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?selfTest():run(+(a[0]||320000),+(a[1]||400000),+(a[2]||25),+(a[3]||25)),null,2));}
module.exports={collect,access,run,selfTest};