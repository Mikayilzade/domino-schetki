'use strict';
// Independent preregistered immediate-next-player mobility holdout.
// Reproduce: node qosha-research/simulator/late-open-number-independent.js test
// node qosha-research/simulator/late-open-number-independent.js 1260000 145000 48 40
const late=require('./late-equal-accessible-reply');
const e=require('./engine'),d=require('./turn-dispatcher'),h=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const POL=['closed-branch-control','moderate-double-hold'];
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
function ci(a){
  if(a.length<2)return null;
  const m=mean(a),se=Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length*(a.length-1)));
  return[m-1.96*se,m+1.96*se];
}
function pAnyPlayable(U,L,k){
  if(!Number.isInteger(U)||!Number.isInteger(L)||!Number.isInteger(k)||U<0||L<0||L>U||k<0||k>U)throw Error('invalid hypergeometric inputs');
  if(k===0||L===0)return 0;
  if(U-L<k)return 1;
  let none=1;for(let j=0;j<k;j++)none*=(U-L-j)/(U-j);
  return 1-none;
}
function exactMobility(c){
  const s=c.state,seat=c.seat,k=c.nextHandSize,before=JSON.stringify(s);
  const acts=d.turnOptions(s.branchState,s.openingState,s.hands[seat],s.stock).actions;
  const a=acts.find(x=>actionKey(x)===c.connector),b=acts.find(x=>actionKey(x)===c.other);
  if(!a||!b)throw Error('candidate missing');
  const A=d.applyTurn(s.branchState,s.openingState,s.hands[seat],s.stock,a);
  const B=d.applyTurn(s.branchState,s.openingState,s.hands[seat],s.stock,b);
  if(s.stock.length!==0||A.hand.length===0||B.hand.length===0)throw Error('late-position prerequisite');
  const live=new Set([...s.hands.flat(),...s.stock].map(e.tileKey));
  const known=e.createDoubleSixDeck().filter(t=>!live.has(e.tileKey(t)));
  const pool=h.hiddenPool({focalHand:s.hands[seat],knownTiles:known});
  const playable=after=>pool.filter(t=>d.actionsForHand(after.branchState,after.openingState,[t]).length>0).length;
  const la=playable(A),lb=playable(B),U=pool.length;
  if(JSON.stringify(s)!==before)throw Error('visible source mutated');
  return{unknownPool:U,nextHandSize:k,legalUnknownConnector:la,legalUnknownControl:lb,
    connector:pAnyPlayable(U,la,k),control:pAnyPlayable(U,lb,k),
    delta:pAnyPlayable(U,la,k)-pAnyPlayable(U,lb,k)};
}
function group(xs){
  return{n:xs.length,exactNextCanPlayDelta:mean(xs.map(x=>x.exact.delta)),
    empiricalNextCanPlayDelta:mean(xs.map(x=>x.replyDelta.canPlay)),
    policy:Object.fromEntries(POL.map(p=>[p,{
      first:mean(xs.map(x=>x.byPolicy[p].first)),
      ci95PositionExploratory:ci(xs.map(x=>x.byPolicy[p].first)),
      pips:mean(xs.map(x=>x.byPolicy[p].pips)),
      minus:mean(xs.map(x=>x.byPolicy[p].minus))
    }]))};
}
function run(start=1260000,scan=145000,limit=48,worlds=40){
  const base=late.run(start,scan,limit,worlds);
  const rows=base.positions.map(x=>({...x,exact:exactMobility(late.find(x.seed))}));
  const restrict=rows.filter(x=>x.exact.delta<=-0.05);
  const enable=rows.filter(x=>x.exact.delta>=0.05);
  const neutral=rows.filter(x=>Math.abs(x.exact.delta)<0.05);
  const positions=rows.map(x=>({
    seed:x.seed,turn:x.turn,seat:x.seat,x:x.x,handSize:x.handSize,nextHandSize:x.nextHandSize,
    connector:x.connector,control:x.other,accessibleCount:x.accessibleCount,
    accessibleNumbersConnector:x.accessibleNumbersConnector,accessibleNumbersControl:x.accessibleNumbersOther,
    exact:x.exact,empiricalNextCanPlayDelta:x.replyDelta.canPlay,
    byPolicy:x.byPolicy
  }));
  return{schema:'qosa-late-open-number-independent/v1',
    timestampAsiaBaku:new Date(Date.now()+4*3600000).toISOString().slice(0,16)+' +04:00',
    engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9 later-round',
    seedScanRequested:[start,start+scan-1],seedScanActual:base.seedScanActual,
    scannedDeals:base.scannedDeals,selectedPositions:rows.length,selectedSeeds:rows.map(x=>x.seed),
    hiddenAllocations:base.hiddenAllocations,forcedContinuations:base.forcedContinuations,
    worldsPerPosition:worlds,newFullStrategyRounds:0,previousReportedFullStrategyRounds:215520,
    strategies:base.strategies,continuationPolicies:POL,worldSeed:base.worldSeed,
    comparison:'equal discarded pips and equal accessible-end count, X-X retained; connector X-Y vs unrelated single',
    preregisteredStrata:'exact next clockwise opponent P(any legal tile) delta connector-minus-control: restrict <= -0.05, enable >= 0.05, neutral otherwise; grouping does not use outcomes',
    exactFormula:'1-C(U-L,k)/C(U,k); U unknown tiles, L tiles individually legal after forced action, k next opponent hand size; valid for uniform unseen hands and empty stock',
    summary:{all:group(rows),restrict:group(restrict),enable:group(enable),neutral:group(neutral),
      exactVsEmpiricalMobilityMeanAbsError:mean(rows.map(x=>Math.abs(x.exact.delta-x.replyDelta.canPlay)))},
    limitations:'7/10 non-neutral positions only; exploratory normal position CIs; hidden allocations correlated within position; first eligible per deal; two fixed bots; opponent prior-play history ignored; different exact end numbers; provisional branch semantics; block winner unassigned; no causal human-game guarantee',
    nextAction:'Independent fresh-seed holdout stratified by exact end-number identities and next-hand size, then test third-player mobility and historical-pass-conditioned hidden worlds',
    positions};
}
function test(){
  const t=late.test();
  if(!t.passed||Math.abs(pAnyPlayable(5,2,2)-0.7)>1e-12||pAnyPlayable(5,5,1)!==1||pAnyPlayable(5,0,4)!==0)throw Error('hypergeom or dependency');
  const c=late.find(1099589),a=exactMobility(c),b=exactMobility(c);
  if(JSON.stringify(a)!==JSON.stringify(b)||a.connector<0||a.connector>1||a.control<0||a.control>1)throw Error('exact replay');
  const x=run(1099589,1,1,2),y=run(1099589,1,1,2);
  // Ignore timestamp in deterministic replay.
  delete x.timestampAsiaBaku;delete y.timestampAsiaBaku;
  if(JSON.stringify(x)!==JSON.stringify(y)||x.forcedContinuations!==8)throw Error('holdout replay');
  return{passed:true,fixture:1099589,continuations:8};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1260000),+(a[1]||145000),+(a[2]||48),+(a[3]||40)),null,2));}
module.exports={pAnyPlayable,exactMobility,run,test};
