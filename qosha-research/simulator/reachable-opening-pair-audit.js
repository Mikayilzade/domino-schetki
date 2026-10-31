'use strict';
// 2026-10-31 04:48 +04 (Asia/Baku): chronological 3x9 opening contract.
// Exact conditional census, not seeded random worlds or independent complete rounds.
// Reproduce: node qosha-research/simulator/reachable-opening-pair-audit.js
// Engine qosa-research-0.5.3 / recovered qosa-1.0.0; branch rule PROVISIONAL.
const e=require('./engine'),d=require('./turn-dispatcher'),t=require('./turn-kernel');
const check=(v,msg)=>{if(!v)throw Error(msg)};
const key=e.tileKey, played=[[1,1],[1,2]],stockDraw=[1,2],knownSeat1=[3,3];
const focal=[[0,1],[1,3],[1,4],[1,5],[1,6],[0,2],[2,3],[2,2]];
function choose(n,r){let x=1;for(let i=1;i<=r;i++)x=x*(n-r+i)/i;return Math.round(x)}
function opening(){
 const initial=[[1,1],...focal];
 check(initial.length===9&&!initial.some(x=>key(x)===key(stockDraw)),'starter 9 and separate stock');
 check(played.length+focal.length+9+9===28,'post-opening seat sizes must be 8+9+9');
 const b=e.applySinglePlacement(e.createBranchState([1,1]),{tile:stockDraw,side:'up',to:2});
 const o=e.createOpeningState([1]);
 check(b.branches.up.end===2,'opening end');
 // Previous 2026-10-31 03:57 synthetic fixture: 2 played, focal 9,
 // seat1 9, seat2 8. Conserves 28 but is NOT a chronological
 // 3x9+stock state after the starter draws once and plays twice.
 check(9!==focal.length,'old nonchronological fixture must not pass');
 return {b,o};
}
function run(){
 const {b,o}=opening(),used=new Set([...played,...focal].map(key));
 check(used.size===10,'known tile duplication');
 const unknown=e.createDoubleSixDeck().filter(x=>!used.has(key(x)));
 check(unknown.length===18,'hidden capacity');
 const pool=unknown.filter(x=>key(x)!=='3-3');
 check(pool.length===17,'known seat1 3-3');
 const acts=d.actionsForHand(b,o,focal);
 const a=acts.find(x=>x.type==='single'&&key(x.tile)==='1-3'&&x.side==='left');
 const z=acts.find(x=>x.type==='single'&&key(x.tile)==='1-4'&&x.side==='left');
 check(a&&z,'both focal candidates legal');
 const ba=e.applySinglePlacement(b,a),bz=e.applySinglePlacement(b,z);
 const stats={worlds:0,openingSeat1Pass:0,openingSeat2Pass:0,seat1PassA:0,seat1PassB:0,seat1PlayedA:0,seat1PlayedB:0,seat2PassA:0,seat2PassB:0,seat2CanOpenDoubleA:0,seat2CanOpenDoubleB:0};
 for(let mask=0;mask<(1<<17);mask++){
  let bits=mask,count=0;while(bits){bits&=bits-1;count++}if(count!==8)continue;
  const s1=[knownSeat1],s2=[];
  for(let i=0;i<17;i++)(mask&(1<<i)?s1:s2).push(pool[i]);
  check(s1.length===9&&s2.length===9,'hidden hand sizes');
  if(stats.worlds<3)check(new Set([...played,...focal,...s1,...s2].map(key)).size===28,'tile conservation');
  check(d.turnOptions(b,o,s1,[]).phase==='pass'&&d.turnOptions(b,o,s2,[]).phase==='pass','chronological passes');
  stats.openingSeat1Pass++;stats.openingSeat2Pass++;
  for(const [name,branch] of [['A',ba],['B',bz]]){
   const replies=d.actionsForHand(branch,o,s1);
   check(replies.every(x=>x.type==='double-sequence'&&x.numbers.length===1),'unexpected seat1 action');
   const r=d.applyTurn(branch,o,s1,[],replies.length?replies[0]:null);
   stats['seat1Pass'+name]+=+r.passed;
   stats['seat1Played'+name]+=r.playedTiles.length;
   const s2replies=d.actionsForHand(r.branchState,r.openingState,s2);
   stats['seat2Pass'+name]+=+(s2replies.length===0);
   stats['seat2CanOpenDouble'+name]+=+s2replies.some(x=>x.type==='double-sequence');
  }
  stats.worlds++;
 }
 check(stats.worlds===choose(17,8)&&stats.worlds===24310,'exact worlds');
 check(stats.seat1PassA===0&&stats.seat1PassB===12870,'seat1 pass exact oracle');
 check(stats.seat1PlayedA===24310&&stats.seat1PlayedB===11440,'seat1 play exact oracle');
 check(!t.isBlocked({stock:[],consecutivePasses:2,players:3}),'two passes are not a block');
 return {schema:'qosha-reachable-opening-pair-audit/v1',timestampAsiaBaku:'2026-10-31 04:48 +04',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9; PROVISIONAL global-ever-open',seeds:null,newDeals:0,newSeededWorlds:0,newFullRounds:0,newForcedContinuations:0,exactConditionalWorlds:stats.worlds,opening:['seat0 1-1','draw stock 1-2','seat0 1-2 up','seat1 pass','seat2 pass','seat0 candidate left'],focalHand:focal.map(key),knownSeat1:'3-3',candidates:['1-3 left','1-4 left'],stats,limitations:'One constructed reachable first-round position, not human-play prevalence. Uniform hidden allocation conditional on known seat1 3-3; branch reopening, blocked ties and match scoring unresolved. No full-game winning tactic.'};
}
if(require.main===module)console.log(JSON.stringify(run(),null,2));
module.exports={run,opening};
