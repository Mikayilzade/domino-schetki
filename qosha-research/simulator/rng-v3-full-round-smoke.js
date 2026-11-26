// 2026-11-26 10:47 Asia/Baku; qosha-research-0.5.3 / qosa-1.0.0; opt-in RNG v3.
// Executed in V8 CommonJS adapter, not native Node gate. {"start":33000000,"end":33000999,"N":1000,"replays":1000,"assertions":297488,"unique":1000,"finish":964,"block":36,"turns":23630,"minus":{"0":929,"-10":35,"-20":0,"-30":0,"-40":0},"maxTurns":35}
// Random legal policy (domain 3), continuation rounds, previous winner seed%3; modulo selection is smoke-only.
// 1000 unique deals + 1000 exact replays; no strategy comparison. Branch unlock, block allocation, loneZero provisional.
// Historical 180000 separate. Next: full native validation gates and matched strategy pilot only after validation.
'use strict';
const e=require('./engine'), a=require('./rng-v3-adapter-test'), r=require('./round-driver'), d=require('./turn-dispatcher'), v=require('./rng-v3-domain-experimental');
function test(start=33000000,N=1000){
const deck=e.createDoubleSixDeck().map(e.tileKey).sort().join(), seen=new Set(), totals={finish:0,block:0,turns:0,minus:{0:0,'-10':0,'-20':0,'-30':0,'-40':0},maxTurns:0};let assertions=0;
function check(x,msg){assertions++;if(!x)throw Error(msg)}
function run(seed){const deal=a.dealV3(seed),key=deal.hands.map(h=>h.map(e.tileKey).sort().join()).join('|')+'|'+deal.stock.map(e.tileKey);let s=a.initializeV3({seed,isFirstRound:false,previousWinnerIndex:seed%3});check(s.kind==='ready','init');let played=[[1,1],...(s.openingFollowup?[s.openingFollowup.tile]:[])];const rng=v.rng(seed,3);let steps=0;const trace=[];
function conserve(){check(s.hands.flat().concat(s.stock,played).map(e.tileKey).sort().join()===deck,'conservation')}
conserve();while(!s.outcome&&steps<250){const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);check(s.stock.length===0,'stock exhausted after opening');const choice=opts.phase==='play'?opts.actions[rng()%opts.actions.length]:null;const tr=d.applyTurn(s.branchState,s.openingState,s.hands[p],s.stock,choice);const next=r.stepRound(s,()=>choice);played.push(...tr.playedTiles);check(next.turns===s.turns+1,'turn');check(next.consecutivePasses===(tr.passed?s.consecutivePasses+1:0),'pass');check(next.outcome||next.currentPlayer===(p+1)%3,'clockwise');check(JSON.stringify(next.hands[p])===JSON.stringify(tr.hand),'hand');trace.push([p,choice,next.outcome]);s=next;steps++;conserve()}
check(!!s.outcome,'terminal');check(s.outcome.remainders.every((x,i)=>x===e.pipSum(s.hands[i])),'pips');if(s.outcome.kind==='finish'){check(s.hands[s.outcome.playerIndex].length===0,'empty');check(Object.hasOwn(totals.minus,s.outcome.minus),'minus range')}else{check(s.outcome.kind==='block'&&s.consecutivePasses>=3,'block')}
return {key,steps,outcome:s.outcome,trace}}
for(let seed=start;seed<start+N;seed++){const x=run(seed),y=run(seed);check(JSON.stringify(x)===JSON.stringify(y),'replay');check(!seen.has(x.key),'duplicate allocation');seen.add(x.key);totals[x.outcome.kind]++;totals.turns+=x.steps;totals.maxTurns=Math.max(totals.maxTurns,x.steps);if(x.outcome.kind==='finish')totals.minus[x.outcome.minus]++}
return {start,end:start+N-1,N,replays:N,assertions,unique:seen.size,...totals}}
module.exports={test};if(require.main===module)console.log(JSON.stringify(test()));
