'use strict';
// Qoşa research: canonical four-branch tie-break audit (model-only assumption).
// Usage: node qosha-research/runs/2026-10-20-2352-canonical-geometry.js test
//        node qosha-research/runs/2026-10-20-2352-canonical-geometry.js 1307840 240
const e=require('../simulator/engine'),d=require('../simulator/turn-dispatcher');
const r=require('../simulator/round-driver'),init=require('../simulator/initializer');
const {chooseBy}=require('../simulator/strategy-runner');
const policies=['min-hand-pips','closed-branch-control'];
function key(a){return[a.type,a.side||'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join('|');}
function signature(s,a){
 const t=d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);
 return JSON.stringify([t.hand.map(e.tileKey).sort(),
  e.SIDES.map(x=>[+t.branchState.branches[x].active,t.branchState.branches[x].end])
   .sort((a,b)=>a[0]-b[0]||a[1]-b[1]),
  [...t.openingState.openedNumbers].sort((a,b)=>a-b)]);
}
function chooseCanonical(policy,opts,s){
 const scored=opts.actions.map(a=>{const tiles=a.type==='single'?[a.tile]:(a.tiles||[]);
  return{a,p:e.pipSum(tiles),openings:a.type==='double-sequence'?(a.numbers||[]).length:0,sig:signature(s,a)};});
 scored.sort((x,y)=>{let v=+(y.a.type==='mixed-finish')-+(x.a.type==='mixed-finish');
  if(v)return v;if(policy==='closed-branch-control'&&(v=x.openings-y.openings))return v;
  if((v=y.p-x.p))return v;return x.sig.localeCompare(y.sig)||key(x.a).localeCompare(key(y.a));});
 return scored[0].a;
}
function continuation(s,a,policy,canonical){
 let first=true;
 return r.runRound(s,(opts,state)=>{if(first){first=false;const hit=opts.actions.find(x=>key(x)===key(a));
  if(!hit)throw Error('forced action missing');return hit;}
  return canonical?chooseCanonical(policy,opts,state):chooseBy(policy,opts,{seed:0,turns:state.turns,player:state.currentPlayer});},{maxTurns:200});
}
function run(start=1307840,count=240){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<1)throw Error('invalid seeds');
 const out={schema:'qosa-canonical-geometry/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  seedStart:start,seedEndExclusive:start+count,scanned:0,positions:0,rawActions:0,
  uniqueCanonicalActions:0,pairedPositions:0,continuations:0,unresolved:0,policies:{}};
 for(const p of policies)out.policies[p]={legacy:{compared:0,finishMismatch:0,remainderMismatch:0,outcomeMismatch:0},
  canonical:{compared:0,finishMismatch:0,remainderMismatch:0,outcomeMismatch:0}};
 for(let seed=start;seed<start+count;seed++){
  out.scanned++;let s=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(s.kind!=='ready')throw Error('initializer unresolved');let selected=null;
  while(!s.outcome&&s.turns<120){
   const opts=d.turnOptions(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock);
   if(opts.phase==='play'&&opts.actions.length>=2){
    const groups=new Map();
    for(const a of opts.actions){const sig=signature(s,a),arr=groups.get(sig)||[];arr.push(a);groups.set(sig,arr);}
    out.positions++;out.rawActions+=opts.actions.length;out.uniqueCanonicalActions+=groups.size;
    const group=[...groups.values()].find(arr=>arr.filter(a=>a.type==='single').length>=2);
    if(group){const pair=group.filter(a=>a.type==='single').slice(0,2);
     if(pair[0].side===pair[1].side||e.tileKey(pair[0].tile)!==e.tileKey(pair[1].tile))throw Error('pair mismatch');
     selected={state:r.cloneRoundState(s),pair};break;}
   }
   s=r.stepRound(s,opts=>chooseBy('min-hand-pips',opts,{seed,turns:s.turns,player:s.currentPlayer}));
  }
  if(!selected)continue;out.pairedPositions++;
  for(const policy of policies)for(const canonical of [false,true]){
   const [a,b]=selected.pair.map(x=>continuation(selected.state,x,policy,canonical));
   out.continuations+=2;if(a.outcome.kind==='unresolved'||b.outcome.kind==='unresolved')out.unresolved++;
   const focal=selected.state.currentPlayer,win=x=>+(x.outcome.kind==='finish'&&x.outcome.playerIndex===focal);
   const pa=e.pipSum(a.hands[focal]),pb=e.pipSum(b.hands[focal]);
   const m=out.policies[policy][canonical?'canonical':'legacy'];m.compared++;
   m.finishMismatch+=+(win(a)!==win(b));m.remainderMismatch+=+(pa!==pb);
   m.outcomeMismatch+=+(JSON.stringify(a.outcome)!==JSON.stringify(b.outcome));
  }
 }
 out.duplicateActionFraction=out.rawActions?1-out.uniqueCanonicalActions/out.rawActions:null;
 return out;
}
function test(){const x=run(1307600,3);
 if(x.scanned!==3||x.pairedPositions!==3||x.unresolved!==0||
  policies.some(p=>x.policies[p].canonical.outcomeMismatch!==0))throw Error('symmetry regression');
 return{passed:true,seeds:'1307600..1307602'};}
if(require.main===module){
 console.log(JSON.stringify(process.argv[2]==='test'?test():run(Number(process.argv[2]||1307840),Number(process.argv[3]||240)),null,2));
}
module.exports={run,test,signature,chooseCanonical};
