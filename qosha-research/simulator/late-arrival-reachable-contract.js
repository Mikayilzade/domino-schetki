'use strict';
// Reproducible, assumption-labelled late-arrival four-branch contract.
// node qosha-research/simulator/late-arrival-reachable-contract.js
// node qosha-research/simulator/late-arrival-reachable-contract.js --independent
// The default run also cross-checks the existing provisional research kernel.
// Neither interpretation has been authenticated against physical table rules.
const assert = require('assert');
const DECK=[];
for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)DECK.push([a,b]);
const key=t=>[...t].sort((a,b)=>a-b).join('-');
const tile=(a,b)=>a<=b?[a,b]:[b,a];
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const values=[0,2,3,4,5,6];
function legal(b,t,side){
  const [a,c]=t,end=b.ends[side];
  if(a===c)return a===end&&!b.opened.includes(a);
  return !b.locks[side]&&(a===end||c===end);
}
function applyIndependent(b,t,side,model){
  assert(legal(b,t,side),'illegal scripted move '+key(t));
  const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};
  if(t[0]===t[1]){n.locks[side]=false;n.opened.push(t[0]);}
  else{n.ends[side]=t[0]===b.ends[side]?t[1]:t[0];
    n.locks[side]=!(model==='global'&&n.opened.includes(n.ends[side]));}
  return n;
}
function witness(x,y,z,w,production){
  const steps=[
    {seat:0,t:[1,1],special:true},
    {seat:0,t:tile(1,x)},
    {seat:1,t:tile(x,x)},
    {seat:2,t:tile(x,y)},
    {seat:0,t:tile(y,y)},
    {seat:1,t:tile(y,z)},
    {seat:2,t:tile(z,z)},
    {seat:0,t:tile(z,x)},
    {seat:1,t:tile(x,w)}
  ];
  assert(new Set(steps.map(s=>key(s.t))).size===9,'nine unique chronological tiles');
  const hands=[[],[],[]];
  for(const s of steps)hands[s.seat].push(s.t);
  const used=new Set(steps.map(s=>key(s.t)));
  const fillers=DECK.filter(t=>!used.has(key(t)));
  const stock=fillers.pop();
  for(let p=0;p<3;p++)while(hands[p].length<9)hands[p].push(fillers.shift());
  assert(fillers.length===0&&hands.every(h=>h.length===9),'3x9 plus one stock');
  assert(new Set([...hands.flat(),stock].map(key)).size===28,'28 unique stones');
  const before=[];
  for(const model of ['global','current']){
    const h=hands.map(v=>v.slice());
    const take=(seat,t)=>{const i=h[seat].findIndex(q=>key(q)===key(t));
      assert(i>=0,'stone owned by scheduled player');h[seat].splice(i,1);};
    take(0,[1,1]);h[0].push(stock); // Confirmed 3-player 1-1 starter draws stock.
    let board={ends:[1,1,1,1],locks:[false,false,false,false],opened:[1]};
    for(let i=1;i<8;i++){
      const s=steps[i];assert(legal(board,s.t,0),'independent chronology '+i);
      if(production){
        const a=production.actions(board,h[s.seat]).find(a=>a.side===0&&key(a.t)===key(s.t));
        assert(a,'production chronology '+i);
        assert(same(production.apply(board,a,model),applyIndependent(board,s.t,0,model)),
          'independent/production state mismatch '+i);
      }
      board=applyIndependent(board,s.t,0,model);take(s.seat,s.t);
    }
    assert(board.ends[0]===x&&board.opened.includes(x),'previously opened x returns');
    assert(!h.flat().some(t=>key(t)===key([x,x])),'unique x-x already spent');
    const candidate=steps[8].t;
    const expected=model==='global';
    assert(legal(board,candidate,0)===expected,'late-arrival contrast');
    if(production){
      const got=production.actions(board,h[1]).some(a=>a.side===0&&key(a.t)===key(candidate));
      assert(got===expected,'production late-arrival contrast');
    }
    assert(board.locks[0]===!expected,'return lock state');
    before.push({model,legal:expected,lock:board.locks[0],opened:board.opened.slice()});
  }
  return {x,y,z,w,steps:steps.map(s=>key(s.t)),before};
}
function test(independentOnly=false){
  const production=independentOnly?null:require('./opening-double-followup-new-hands');
  let traces=0;let example=null;
  for(const x of values)for(const y of values)for(const z of values){
    if(new Set([x,y,z]).size!==3)continue;
    for(let w=0;w<=6;w++){
      if([1,x,y,z].includes(w))continue;
      const result=witness(x,y,z,w,production);
      traces++;
      if(x===2&&y===4&&z===5&&w===6)example=result;
    }
  }
  assert(traces===360&&example,'all 360 labelled witnesses');
  return {passed:true,chronologicalWitnesses:traces,
    independentOnly,initialDeal:'3 players x 9 stones, 1 stock; 1-1 starter draws stock',
    example:example.steps,globalLegal:true,currentLegal:false,
    scope:'360 relabelled forced legal traces, not independent games or sampled deals',
    caveat:'Both late-arrival branch interpretations remain provisional; no block or match-scoring inference'};
}
if(require.main===module)console.log(JSON.stringify(test(process.argv[2]==='--independent'),null,2));
module.exports={test,witness,legal,applyIndependent};
