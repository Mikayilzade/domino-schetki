'use strict';
// Assumption-labelled four-side kernel regression, NOT authentic real-table locking validation.
const e=require('./engine'),d=require('./turn-dispatcher');
function test(){
 const ok=(b,m)=>{if(!b)throw Error(m);},s=e.createBranchState([1,1]),o=e.createOpeningState([1]);
 ok(e.SIDES.length===4&&e.SIDES.every(k=>s.branches[k].active&&s.branches[k].end===1),'initial four sides');
 const up=e.applySinglePlacement(s,{side:'up',tile:[1,2],to:2});
 ok(up.branches.up.end===2&&e.SIDES.slice(1).every(k=>up.branches[k].end===1),'side isolation');
 ok(d.actionsForHand(up,o,[[2,6]]).length===0,'number 2 still locked');
 const dbl=d.actionsForHand(up,o,[[2,2]]).filter(a=>a.type==='double-sequence');
 ok(dbl.length===1,'exposed 2 double opens');
 const opened=e.applyDoubleOpeningSequence(up,o,dbl[0].sequence);
 ok(opened.openingState.openedNumbers.has(2)&&d.actionsForHand(opened.branchState,opened.openingState,[[2,6]]).some(a=>a.side==='up'),'unlocked 2 allows up');
 ok(d.actionsForHand(s,o,[[2,2]]).length===0,'unexposed double illegal');
 ok(d.actionsForHand(e.createBranchState([1,1],['up','left']),o,[[1,3]]).filter(a=>a.type==='single').length===2,'inactive sides locked');
 let four=e.createBranchState([1,1]);
 for(const [side,to] of [['up',2],['left',3],['right',4],['down',5]])four=e.applySinglePlacement(four,{side,tile:[1,to],to});
 ok(e.SIDES.map(k=>four.branches[k].end).join(',')==='2,3,4,5','four independent ends');
 const hand=[[2,2],[3,3],[4,4],[5,5]],options=d.turnOptions(four,o,hand,[]);
 const full=options.actions.filter(a=>a.type==='double-sequence'&&a.tiles.length===4);
 ok(full.length===24,'four-double sequences');
 const tr=d.applyTurn(four,o,hand,[],full[0]);
 const outcome=d.roundOutcome({hands:[tr.hand,[[0,1]],[[0,2]]],stock:[],consecutivePasses:0,lastPlayerIndex:0,lastTurnResult:tr,players:3});
 ok(tr.hand.length===0&&outcome.kind==='finish'&&outcome.minus===-40,'synthetic -40 finish');
 return{passed:true,fullSequences:full.length,minus:outcome.minus,scope:'kernel only, real four-branch semantics provisional'};
}
if(require.main===module)console.log(JSON.stringify(test()));
module.exports={test};
