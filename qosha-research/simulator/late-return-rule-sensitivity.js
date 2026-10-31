'use strict';
// Reproducible 3x9 chronological fixture. Both branch models PROVISIONAL.
// node qosha-research/simulator/late-return-rule-sensitivity.js [--integration]
const assert=require('node:assert/strict');
const SIDES=['up','left','right','down'];
const key=t=>[...t].sort((a,b)=>a-b).join('-');
const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
const initial=[
 [[5,6],[1,3],[1,6],[1,5],[2,2],[1,4],[3,6],[4,5],[3,5]],
 [[0,0],[1,2],[0,1],[0,2],[0,4],[1,1],[0,3],[3,4],[2,4]],
 [[4,4],[0,5],[0,6],[3,3],[2,5],[5,5],[6,6],[4,6],[2,6]]
];
const stock=[2,3],starter=1;
const trace=[
 {seat:1,t:[0,1],side:0},{seat:2,pass:true},
 {seat:0,t:[1,3],side:1},{seat:1,t:[0,0]},
 {seat:2,t:[0,5],side:0},{seat:0,t:[1,4],side:2},
 {seat:1,t:[1,2],side:3},{seat:2,t:[3,3]},
 {seat:0,t:[2,2]}
];
const choices=[
 {t:[0,2],side:3},{t:[0,3],side:1},{t:[3,4],side:1},
 {t:[2,4],side:3},{t:[2,3],side:1},{t:[2,3],side:3}
];
function fresh(model){
 assert(['global-ever-open','all-current-only'].includes(model));
 const all=[...initial.flat(),stock].map(key);
 assert.equal(new Set(all).size,28);assert.deepEqual(new Set(all),new Set(deck.map(key)));
 const hands=initial.map(h=>h.map(t=>[...t]));
 assert(hands[starter].some(t=>key(t)==='1-1'));
 hands[starter].splice(hands[starter].findIndex(t=>key(t)==='1-1'),1);
 hands[starter].push([...stock]);
 return {model,hands,ends:[1,1,1,1],unlocked:[true,true,true,true],opened:new Set([1]),played:['1-1'],stock:[],turn:starter};
}
function clone(s){return {...s,hands:s.hands.map(h=>h.map(t=>[...t])),ends:s.ends.slice(),unlocked:s.unlocked.slice(),opened:new Set(s.opened),played:s.played.slice()};}
function actions(s,p){
 const out=[];
 for(const t of s.hands[p]){
  const [a,b]=t;
  if(a===b){if(!s.opened.has(a)&&s.ends.includes(a))out.push({t,side:null,to:a});}
  else for(let side=0;side<4;side++)if(s.unlocked[side]&&(s.ends[side]===a||s.ends[side]===b))
   out.push({t,side,to:s.ends[side]===a?b:a});
 }
 return out;
}
function apply(s,p,a){
 assert(a&&actions(s,p).some(x=>key(x.t)===key(a.t)&&x.side===a.side),'illegal action '+JSON.stringify(a));
 const index=s.hands[p].findIndex(t=>key(t)===key(a.t));assert(index>=0);
 s.hands[p].splice(index,1);s.played.push(key(a.t));
 if(a.side===null){
  const n=a.t[0];s.opened.add(n);
  for(let side=0;side<4;side++)if(s.ends[side]===n)s.unlocked[side]=true;
 }else{
  s.ends[a.side]=a.to;
  s.unlocked[a.side]=s.model==='global-ever-open'&&s.opened.has(a.to);
 }
 s.turn=(p+1)%3;
}
function policy(acts){return acts.slice().sort((a,b)=>
 (a.t[0]+a.t[1])-(b.t[0]+b.t[1])||key(a.t).localeCompare(key(b.t))||
 (a.side??-1)-(b.side??-1))[0]||null;}
function replay(model){
 const s=fresh(model);let p=starter;
 for(const [i,step] of trace.entries()){
  assert.equal(step.seat,p,'clockwise seat at '+i);
  const opts=actions(s,p);
  if(step.pass){assert.equal(opts.length,0,'genuine no-stock pass at '+i);s.turn=(p+1)%3;}
  else{const a=opts.find(x=>key(x.t)===key(step.t)&&x.side===(step.side??null));
   assert(a,'scripted move must be legal '+i);apply(s,p,a);}
  p=s.turn;
 }
 assert.equal(p,starter);assert.deepEqual(s.ends,[5,3,4,2]);
 assert.deepEqual([...s.opened].sort(),[0,1,2,3]);
 assert.deepEqual(s.hands.map(h=>h.length),[6,6,7]);
 assert.equal(new Set([...s.played,...s.hands.flat().map(key)]).size,28);
 assert.deepEqual(s.unlocked,[false,true,false,true]);
 return s;
}
function evaluate(s,choice){
 const v=clone(s);const a=actions(v,starter).find(x=>key(x.t)===key(choice.t)&&x.side===choice.side);
 assert(a,'candidate legal in both models');apply(v,starter,a);
 const replies=[];
 for(const p of [(starter+1)%3,(starter+2)%3]){
  const opts=actions(v,p),picked=policy(opts);
  if(picked)apply(v,p,picked);else v.turn=(p+1)%3;
  replies.push({seat:p,action:picked?{tile:key(picked.t),side:picked.side===null?'double':SIDES[picked.side]}:'pass'});
  assert(v.hands[p].length>0,'no early finish in two-turn horizon');
 }
 const stones=[...new Set(actions(v,starter).map(a=>key(a.t)))];
 return {candidate:key(choice.t)+'@'+SIDES[choice.side],returnPass:stones.length===0,returnLegalStones:stones.length,
  replies,ends:v.ends.slice(),unlocked:v.unlocked.slice()};
}
function run(){
 const g=replay('global-ever-open'),c=replay('all-current-only');
 const global=choices.map(a=>evaluate(g,a)),current=choices.map(a=>evaluate(c,a));
 assert.deepEqual(global.map(x=>x.returnLegalStones),[0,3,0,2,2,4]);
 assert.deepEqual(current.map(x=>x.returnLegalStones),[3,0,0,2,0,3]);
 assert.equal(global.filter(x=>x.returnPass).length,2);
 assert.equal(current.filter(x=>x.returnPass).length,3);
 const reversals=global.filter((x,i)=>x.returnPass!==current[i].returnPass).map(x=>x.candidate);
 assert.deepEqual(reversals,['0-2@down','0-3@left','2-3@left']);
 return {schema:'qosha-late-return-rule-sensitivity/v1',rules:'qosa-1.0.0 3x9; both branch models PROVISIONAL',
  deal:'fixed 28-tile chronological fixture common to both models; no random seed',
  opening:'seat1 1-1, stock draw 2-3, 9 checked chronological moves/passes',
  checkedCandidateActions:choices.length,checkedTwoTurnContinuations:12,
  newDeals:0,newSeededWorlds:0,newCompleteRounds:0,
  policy:'minimum pip legal response; one tile/double per turn; tie by key and side',
  global,current,passStatusReversals:reversals,
  limitation:'No physical branch interpretation authenticated; structural sensitivity witness, not win-rate or strategy recommendation'};
}
// Cross-check global-ever-open against actual research dispatcher, when available.
function integration(){
 const e=require('./engine'),d=require('./turn-dispatcher');
 let b=e.createBranchState([1,1]),o=e.createOpeningState([1]);
 let h=fresh('global-ever-open').hands;
 const actionKey=a=>key((a.tiles||[a.tile])[0]);
 const pick=acts=>acts.slice().sort((a,b)=>{
  const x=(a.tiles||[a.tile])[0],y=(b.tiles||[b.tile])[0];
  return x[0]+x[1]-y[0]-y[1]||key(x).localeCompare(key(y))||
   ((a.side?SIDES.indexOf(a.side):-1)-(b.side?SIDES.indexOf(b.side):-1))||
   ((a.numbers||[]).length-(b.numbers||[]).length);
 })[0]||null;
 const step=(p,a)=>{
  const opts=d.actionsForHand(b,o,h[p]);let selected=null;
  if(a){selected=opts.find(x=>actionKey(x)===key(a.t)&&
   (a.side===undefined?x.type==='double-sequence'&&x.numbers.length===1:
     x.type==='single'&&x.side===SIDES[a.side]));assert(selected,'dispatcher scripted action');}
  else assert.equal(opts.length,0,'dispatcher scripted pass');
  const r=d.applyTurn(b,o,h[p],[],selected);b=r.branchState;o=r.openingState;h[p]=r.hand;
 };
 for(const t of trace)step(t.seat,t.pass?null:t);
 const independent=replay('global-ever-open');
 assert.deepEqual(SIDES.map(x=>b.branches[x].end),independent.ends);
 assert.deepEqual([...o.openedNumbers].sort(),[...independent.opened].sort());
 const expected=choices.map(a=>evaluate(independent,a));
 for(let i=0;i<choices.length;i++){
  const a=choices[i];let bb=e.cloneBranchState(b),oo=e.cloneOpeningState(o),hh=h.map(v=>v.slice());
  const candidate=d.actionsForHand(bb,oo,hh[starter]).find(x=>x.type==='single'&&actionKey(x)===key(a.t)&&x.side===SIDES[a.side]);
  assert(candidate);let r=d.applyTurn(bb,oo,hh[starter],[],candidate);
  bb=r.branchState;oo=r.openingState;hh[starter]=r.hand;
  for(const p of [(starter+1)%3,(starter+2)%3]){
   const choice=pick(d.actionsForHand(bb,oo,hh[p]));
   r=d.applyTurn(bb,oo,hh[p],[],choice);bb=r.branchState;oo=r.openingState;hh[p]=r.hand;
  }
  const stoneCount=new Set(d.actionsForHand(bb,oo,hh[starter]).flatMap(x=>(x.tiles||[x.tile]).map(key))).size;
  assert.equal(stoneCount,expected[i].returnLegalStones,'dispatcher return mobility '+i);
 }
 return {integrationPassed:true,checkedGlobalCandidates:choices.length,chronologicalSteps:trace.length};
}
if(require.main===module)console.log(JSON.stringify(process.argv.includes('--integration')?{...run(),...integration()}:run(),null,2));
module.exports={run,integration};
