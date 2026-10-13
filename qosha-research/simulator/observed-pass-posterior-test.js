'use strict';
const e=require('./engine'),d=require('./turn-dispatcher'),hw=require('./hidden-world');
const p=require('./observed-pass-posterior');
const check=(x,msg)=>{if(!x)throw Error(msg||'assertion failed');};
const mustThrow=(fn,part)=>{let msg='';try{fn();}catch(err){msg=String(err.message);}check(msg.includes(part),'expected rejection: '+part+'; got '+msg);};
const focalHand=[[1,2],[1,3]];
const knownTiles=[[1,1],[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[2,2],[2,3]];
const branchState=e.createBranchState([3,3]),openingState=e.createOpeningState([3]);
const visibleState={branchState,openingState,hands:[focalHand,[],[]],stock:[],
  currentPlayer:0,consecutivePasses:1,turns:10,outcome:null};
const spec={focalPlayer:0,focalHand,knownTiles,hiddenHandSizes:[2,8,8],stockSize:0,visibleState};
const obs={kind:'observed-pass',playerIndex:2,turn:9,stockSizeAtPass:0,handSizeAtPass:8,
  branchState:e.cloneBranchState(branchState),openingState:e.cloneOpeningState(openingState),
  evidence:{passObserved:true,snapshotVerified:true,fullTurnLogVerified:true},eventsSincePass:[]};
const before=JSON.stringify(spec);
const a=p.samplePosterior(spec,[obs],{startSeed:9300,count:500});
const b=p.samplePosterior(spec,[obs],{startSeed:9300,count:500});
check(a.accepted>0&&a.accepted<500,'fixture must discriminate hidden worlds');
check(a.accepted===b.accepted&&JSON.stringify(a.acceptedIndices)===JSON.stringify(b.acceptedIndices),'deterministic posterior');
check(a.worlds.every(w=>d.actionsForHand(obs.branchState,obs.openingState,w.hands[2]).length===0),'posterior contradicts pass');
check(JSON.stringify(spec)===before,'source state mutated');
for(const w of a.worlds){const all=[...knownTiles,...w.hands.flat(),...w.stock].map(e.tileKey);
 check(all.length===28&&new Set(all).size===28,'tile integrity');}
const prior=Array.from({length:500},(_,i)=>hw.sampleWorld(spec,9300+i));
check(prior.filter(w=>p.consistent(w,obs)).length===a.accepted,'manual filtering mismatch');
mustThrow(()=>p.samplePosterior(spec,[{...obs,evidence:{passObserved:true}}],{count:2}),'verified observed-pass');
mustThrow(()=>p.samplePosterior(spec,[{...obs,stockSizeAtPass:1}],{count:2}),'stock must be empty');
mustThrow(()=>p.samplePosterior(spec,[{...obs,handSizeAtPass:7}],{count:2}),'hand size changed');
mustThrow(()=>p.samplePosterior(spec,[{...obs,eventsSincePass:null}],{count:2}),'turn log');
mustThrow(()=>p.samplePosterior(spec,[{...obs,branchState:null}],{count:2}),'snapshot');
mustThrow(()=>p.samplePosterior(spec,[{...obs,turn:8,playerIndex:1,eventsSincePass:[]}],{count:2}),'turn log');
mustThrow(()=>p.samplePosterior(spec,[{...obs,branchState:e.createBranchState([1,1])}],{count:2}),'contradicts');
const wrongActive=e.cloneBranchState(branchState);wrongActive.branches.up.active=false;
mustThrow(()=>p.samplePosterior(spec,[{...obs,branchState:wrongActive}],{count:2}),'contradicts');
const altered={...spec,hiddenHandSizes:[2,7,9]};
mustThrow(()=>p.samplePosterior(altered,[obs],{count:2}),'hand size changed');
const rejected=prior.find(w=>!p.consistent(w,obs));
check(!!rejected,'rejected world fixture');
mustThrow(()=>p.filterWorlds(spec,[obs],[rejected]),'zero posterior support');
console.log(JSON.stringify({passed:true,proposed:a.proposed,accepted:a.accepted,rejected:a.rejected,
  acceptanceRate:a.acceptanceRate,distinctAccepted:new Set(a.worlds.map(w=>JSON.stringify(w.hands[2].map(e.tileKey).sort()))).size}));
