'use strict';
const e=require('./engine'),p=require('./pass-history-posterior');
const pool=[[1,3],[1,4],[2,3],[2,4],[3,5],[4,5]];
const old=e.createBranchState([1,1],['up']),now=e.cloneBranchState(old);now.branches.up.end=2;
const opening=e.createOpeningState([1,2]);
const witness={observed:true,sameRound:true,stockSize:0,player:1,board:old,opening};
const args={unseen:pool,handSize:2,target:1,board:now,opening,passes:[witness]};
const r=p.forecast(args);
if(Math.abs(r.probability-1/6)>1e-12||Math.abs(r.unconditional-0.4)>1e-12)throw Error('posterior');
if(p.forecast({...args,board:old}).probability!==1)throw Error('same board');
let bad=false;try{p.forecast({...args,passes:[{...witness,stockSize:1}]});}catch(_){bad=true;}
if(!bad)throw Error('unsafe witness');
console.log(JSON.stringify({passed:true,conditional:r.probability,unconditional:r.unconditional}));
