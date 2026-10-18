'use strict';
// Pass-only conditional hidden-world enumeration for 3x9 late positions.
// node qosha-research/simulator/pass-conditioned-mobility.js test
// node qosha-research/simulator/pass-conditioned-mobility.js 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const i=require('./initializer'),{chooseBy}=require('./strategy-runner'),{actionKey}=require('./decision-regret');
const input=require('../runs/2026-10-18-2153-next-third-mobility.json');
const mean=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:null;
function assignments(pool,k,visit){
 const picked=[];function walk(j){if(picked.length===k){const ids=new Set(picked.map(e.tileKey));visit(picked.slice(),pool.filter(t=>!ids.has(e.tileKey(t))));return;}
 for(let x=j;x<=pool.length-(k-picked.length);x++){picked.push(pool[x]);walk(x+1);picked.pop();}}
 walk(0);
}
function replay(seed,turn){
 let s=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
 if(s.kind!=='ready')throw Error('unready seed '+seed);
 const passes=[];function pass(seat){passes.push({seat,branch:e.cloneBranchState(s.branchState),opening:e.cloneOpeningState(s.openingState)});}
 if(s.openingPassed)pass(s.starter);
 while(!s.outcome&&s.turns<turn){
   const o=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
   if(o.phase==='pass'){if(s.stock.length)throw Error('pass before stock exhausted');pass(s.currentPlayer);}
   s=r.stepRound(s,(opts,v)=>chooseBy('closed-branch-control',opts,{seed,turns:v.turns,player:v.currentPlayer}));
 }
 if(s.outcome||s.turns!==turn)throw Error('target not reached '+seed);
 return {s,passes};
}
function analyze(row){
 const {s,passes}=replay(row.seed,row.turn),me=row.seat,n=(me+1)%3,t=(me+2)%3;
 if(s.currentPlayer!==me||s.stock.length||s.hands[me].length!==row.handSize||s.hands[n].length!==row.nextHandSize)throw Error('state mismatch '+row.seed);
 const acts=d.turnOptions(s.branchState,s.openingState,s.hands[me],s.stock).actions;
 const moves=[row.connector,row.control].map(key=>acts.find(a=>actionKey(a)===key));
 if(moves.some(x=>!x))throw Error('action mismatch '+row.seed);
 const boards=moves.map(a=>d.applyTurn(s.branchState,s.openingState,s.hands[me],s.stock,a));
 const current=new Set(s.hands.flat().map(e.tileKey)),ours=new Set(s.hands[me].map(e.tileKey));
 const pool=e.createDoubleSixDeck().filter(tile=>current.has(e.tileKey(tile))&&!ours.has(e.tileKey(tile)));
 if(pool.length!==s.hands[n].length+s.hands[t].length)throw Error('pool mismatch');
 const forbidden={};for(const seat of [n,t])forbidden[seat]=new Set();
 for(const p of passes)if(p.seat!==me)for(const tile of pool)
   if(d.actionsForHand(p.branch,p.opening,[tile]).length)forbidden[p.seat].add(e.tileKey(tile));
 const valid=(seat,hand)=>hand.every(tile=>!forbidden[seat].has(e.tileKey(tile)));
 if(!valid(n,s.hands[n])||!valid(t,s.hands[t]))throw Error('true hidden hand conflicts with public passes');
 const playable=(b,hand)=>+(d.actionsForHand(b.branchState,b.openingState,hand).length>0);
 const obs=[[playable(boards[0],s.hands[n]),playable(boards[1],s.hands[n])],
            [playable(boards[0],s.hands[t]),playable(boards[1],s.hands[t])]];
 const sums=[[[0,0],[0,0]],[[0,0],[0,0]]];let all=0,kept=0;
 assignments(pool,s.hands[n].length,(hn,ht)=>{
   all++;const allowed=valid(n,hn)&&valid(t,ht);
   if(allowed)kept++;
   [hn,ht].forEach((hand,player)=>boards.forEach((board,move)=>{
     const y=playable(board,hand);sums[player][move][0]+=y;if(allowed)sums[player][move][1]+=y;
   }));
 });
 if(!kept)throw Error('no pass-compatible allocations');
 const uncond=sums.map(p=>p.map(x=>x[0]/all)),cond=sums.map(p=>p.map(x=>x[1]/kept));
 const delta=x=>x.map(p=>p[0]-p[1]);
 const du=delta(uncond),dc=delta(cond);
 if(Math.abs(du[0]-row.exact.delta)>1e-10||Math.abs(du[1]-row.thirdExactCanPlayDelta)>1e-10)throw Error('uniform exact check '+row.seed);
 const brier=pred=>mean(pred.flatMap((p,j)=>p.map((v,k)=>(v-obs[j][k])**2)));
 return {seed:row.seed,turn:row.turn,seat:me,nextHandSize:s.hands[n].length,thirdHandSize:s.hands[t].length,
  passes:passes.length,opponentPasses:passes.filter(p=>p.seat!==me).length,
  forbidden:[forbidden[n].size,forbidden[t].size],assignments:all,passCompatible:kept,
  next:{uniform:uncond[0],passOnly:cond[0],observed:obs[0],uniformDelta:du[0],passOnlyDelta:dc[0]},
  third:{uniform:uncond[1],passOnly:cond[1],observed:obs[1],uniformDelta:du[1],passOnlyDelta:dc[1]},
  brierUniform:brier(uncond),brierPassOnly:brier(cond)};
}
function run(limit=64){
 const rows=input.positions.slice(0,limit).map(analyze);
 function summary(a){return {positions:a.length,assignments:a.reduce((n,x)=>n+x.assignments,0),passCompatible:a.reduce((n,x)=>n+x.passCompatible,0),
   brierUniform:mean(a.map(x=>x.brierUniform)),brierPassOnly:mean(a.map(x=>x.brierPassOnly)),
   nextUniformDelta:mean(a.map(x=>x.next.uniformDelta)),nextPassOnlyDelta:mean(a.map(x=>x.next.passOnlyDelta)),
   thirdUniformDelta:mean(a.map(x=>x.third.uniformDelta)),thirdPassOnlyDelta:mean(a.map(x=>x.third.passOnlyDelta)),
   nextSignCategoryChanged:a.filter(x=>Math.sign(x.next.uniformDelta)!==Math.sign(x.next.passOnlyDelta)).length};}
 return {schema:'qosa-pass-only-mobility/v1',timestampAsiaBaku:'2026-10-18T22:53 +04:00',
 engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',mode:'3x9 later-round',
 source:'runs/2026-10-18-2153-next-third-mobility.json',seedSet:rows.map(x=>x.seed),
 strategies:['closed-branch-control (public trace)','connector-X-Y-retain-X-X','unrelated-equal-pips-retain-X-X'],
 newCompleteRounds:0,newPairedContinuations:0,
 summary:{all:summary(rows),opponentPass:summary(rows.filter(x=>x.opponentPasses>0)),effectiveFilter:summary(rows.filter(x=>x.passCompatible<x.assignments))},
 finding:'Public passes improve mobility prediction on this simulated cohort; no causal strategy-win finding.',
 limitations:'Only pass-event consistency, not full action-history likelihood; deterministic bot-generated passes, selected first-eligible positions, provisional branch rules; no conditioned rollout or human inference.',
 nextAction:'Paired continuation rollouts on pass-compatible allocations and fresh seed holdout controlling open-end identities.',
 rows};
}
function test(){let n=0;assignments([[0,0],[0,1],[1,1],[1,2]],2,()=>n++);if(n!==6)throw Error('combinations');
 const a=analyze(input.positions[0]),b=analyze(input.positions[0]);if(JSON.stringify(a)!==JSON.stringify(b)||a.passCompatible<1)throw Error('determinism');
 return {passed:true,fixtureSeed:a.seed,assignments:a.assignments,passCompatible:a.passCompatible};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(+(process.argv[2]||64)),null,2));
module.exports={assignments,replay,analyze,run,test};
