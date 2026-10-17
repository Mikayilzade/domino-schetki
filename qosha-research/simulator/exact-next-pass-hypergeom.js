'use strict';
// Exact P(next player passes) under uniform unknown allocations, stock empty.
// Reproduce: node qosha-research/simulator/exact-next-pass-hypergeom.js test
//            node qosha-research/simulator/exact-next-pass-hypergeom.js 760000 780000 30
const e=require('./engine'),d=require('./turn-dispatcher');
const {hiddenPool}=require('./hidden-world');
const {actionKey}=require('./decision-regret');
const {collect}=require('./two-opponent-conditional-holdout');
function pass(n,m,k){if(k>n-m)return 0;let p=1;for(let i=0;i<k;i++)p*=(n-m-i)/(n-i);return p;}
function evaluate(p){
 const s=p.state,f=s.currentPlayer,k=s.hands[(f+1)%3].length;
 if(s.stock.length)throw Error('stock not empty');
 const pool=hiddenPool({focalHand:s.hands[f],knownTiles:p.known});
 if(pool.length!==s.hands[(f+1)%3].length+s.hands[(f+2)%3].length)throw Error('pool mismatch');
 const options=d.turnOptions(s.branchState,s.openingState,s.hands[f],s.stock).actions;
 function candidate(key){
  const a=options.find(a=>actionKey(a)===key);
  if(!a||a.type!=='single')throw Error('missing legal single');
  const t=d.applyTurn(s.branchState,s.openingState,s.hands[f],s.stock,a);
  if(t.hand.length===0||t.stock.length)throw Error('no next hand or stock');
  const legal=pool.filter(tile=>d.actionsForHand(t.branchState,t.openingState,[tile]).length>0);
  return{legalUnknown:legal.length,pass:pass(pool.length,legal.length,k),
   ends:e.SIDES.map(side=>t.branchState.branches[side].end),
   opened:[...t.openingState.openedNumbers].sort((a,b)=>a-b)};
 }
 const connector=candidate(p.pair.connector),unrelated=candidate(p.pair.other);
 return{seed:p.seed,turn:p.turn,unknownPool:pool.length,nextHandSize:k,connector,unrelated,
  passDelta:connector.pass-unrelated.pass};
}
function run(start=760000,end=780000,limit=30){
 const f=collect(start,end,limit),rows=f.out.map(evaluate),xs=rows.map(r=>r.passDelta);
 const mean=xs.reduce((s,x)=>s+x,0)/xs.length,sd=Math.sqrt(xs.reduce((s,x)=>s+(x-mean)**2,0)/(xs.length-1));
 return{engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9',start,end,scanned:f.scanned,
  selectedSeeds:rows.map(r=>r.seed),positions:rows.length,newFullRounds:0,priorVerifiedFullRounds:186000,
  strategies:{discovery:'min-hand-pips',continuation:'none; exact immediate pass only'},
  summary:{meanPassDelta:mean,exploratoryCI95:[mean-1.96*sd/Math.sqrt(xs.length),mean+1.96*sd/Math.sqrt(xs.length)],
   connectorMorePass:xs.filter(x=>x>1e-12).length,unrelatedMorePass:xs.filter(x=>x< -1e-12).length,
   equal:xs.filter(x=>Math.abs(x)<1e-12).length},
  limitations:'Exact only under uniform hidden allocation; earlier opponent choices ignored; branch opening provisional; first eligible selection; not win probability',rows};
}
function test(){
 const f=collect(715654,715655,1);if(f.out.length!==1)throw Error('missing seed');
 const x=evaluate(f.out[0]);if(x.unknownPool!==7||x.nextHandSize!==2||
 x.connector.legalUnknown!==3||x.unrelated.legalUnknown!==1||
 Math.abs(x.passDelta+3/7)>1e-12)throw Error('fixture failed');
 return x;
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||760000),+(a[1]||780000),+(a[2]||30)),null,2));}
module.exports={pass,evaluate,run,test};
