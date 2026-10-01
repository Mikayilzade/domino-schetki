'use strict';
const assert=require('assert');
const e=require('./engine');
const d=require('./turn-dispatcher');
function fixture(n){
  const branches={};
  for(let i=0;i<4;i++)branches[e.SIDES[i]]={active:i<n,end:i<n?i:6};
  return{branchState:{center:[6,6],branches},openingState:e.createOpeningState(),hand:Array.from({length:n},(_,i)=>[i,i])};
}
for(let n=1;n<=4;n++){
  const f=fixture(n);
  const opts=d.turnOptions(f.branchState,f.openingState,f.hand,[]);
  const seqs=opts.actions.filter(a=>a.type==='double-sequence');
  assert(seqs.length>0);
  assert(seqs.every(a=>a.tiles.length===n));
  const tr=d.applyTurn(f.branchState,f.openingState,f.hand,[],seqs[0]);
  assert.equal(tr.hand.length,0);
  const out=d.roundOutcome({hands:[tr.hand,[[6,6]],[[5,6]]],stock:[],consecutivePasses:0,lastPlayerIndex:0,lastTurnResult:tr,players:3});
  assert.equal(out.kind,'finish');
  assert.equal(out.minus,-10*n);
}
console.log('qosa finish-minus integration: OK');
