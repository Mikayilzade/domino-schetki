'use strict';
// Chronological PUBLIC trace replay for recovered 3x9 opening, global-ever-open model.
// No opponent hands or stock tile identities are invented. Branch legality is PROVISIONAL.
// node qosha-research/simulator/public-history-replay.js test
// node qosha-research/simulator/public-history-replay.js 2042000 12000
const e=require('./engine'),d=require('./turn-dispatcher'),post=require('./midgame-exact-posterior');
const key=e.tileKey,deck=e.createDoubleSixDeck,SIDES=e.SIDES;
const clone=a=>a.map(t=>t.slice());
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function fixture(){
 return {model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
  events:[{player:0,type:'double-sequence',numbers:[2]},{player:1,type:'pass'}],
  focalHand:[[0,1],[1,3],[1,4],[1,5],[1,6],[0,2],[2,3],[2,4]],
  knownOpponentTiles:{1:[],2:[]}};
}
function replay(spec){
 if(!spec||spec.model!=='provisional-global-ever-open')throw Error('explicit provisional branch model required');
 const o=spec.opening;
 const fromStock=o&&o.fromStock===true;
 if(!o||!Number.isInteger(o.starter)||o.starter<0||o.starter>2||!Array.isArray(spec.events)||
  (fromStock
   ? (o.stockDraw!==false||o.isFirstRound!==false||o.previousWinnerIndex!==o.starter||o.drawnTile!==undefined)
   : o.stockDraw!==true))
  throw Error('confirmed 3x9 opening provenance and event log required');
 if(o.followup&&o.passed)throw Error('opening cannot both play and pass');
 if(!o.followup&&o.passed!==true)throw Error('explicit opening follow-up or pass required');
 let branch=e.createBranchState([1,1]),opening=e.createOpeningState([1]);
 const handSizes=[9,9,9],acquisitions=[0,0,0],played=[[1,1]],playedKeys=new Set(['1-1']);
 let stockSize=1,currentPlayer=(o.starter+1)%3,pendingDraw=null;
 const passes=[],lateArrivals=[],modelDivergences=[],openedAtDouble=new Map([[1,new Set(SIDES)]]);
 const knownDraws=new Map(),eventCounts={single:0,double:0,mixed:0,pass:0,draw:fromStock?0:1,openingFromStock:fromStock?1:0};
 function invariant(){
  if(handSizes.some(n=>n<0)||stockSize<0||played.length+handSizes.reduce((a,b)=>a+b,0)+stockSize!==28)
   throw Error('28-tile count or hand size mismatch');
 }
 function addPlayed(tile,player){
  const k=key(tile);
  if(playedKeys.has(k))throw Error('duplicate public tile '+k);
  if(knownDraws.has(k)&&knownDraws.get(k)!==player)throw Error('played by non-owner of known draw');
  for(const p of passes)if(p.player===player&&acquisitions[player]===p.acquisitionsAtPass&&p.forbiddenSet.has(k))
   throw Error('later played tile contradicts earlier no-acquisition pass: '+k);
  if(handSizes[player]===0)throw Error('player has no tiles');
  handSizes[player]--;played.push(e.canonicalTile(...tile));playedKeys.add(k);
 }
 function placeSingle(tile,side,player,index){
  if(!Array.isArray(tile)||tile.length!==2||tile[0]===tile[1]||!SIDES.includes(side))
   throw Error('single tile and side required');
  const options=d.openedSinglePlacements(branch,opening,tile),hit=options.find(p=>p.side===side);
  if(!hit)throw Error('illegal single under provisional opened-number rule');
  const before=branch.branches[side].end;
  if(openedAtDouble.has(before)&&!openedAtDouble.get(before).has(side))
   modelDivergences.push({eventIndex:index,side,number:before,tile:key(tile),
    meaning:'legal global-ever-open; locked under all-current-only'});
  branch=e.applySinglePlacement(branch,hit);
  addPlayed(tile,player);
  if(hit.to!==before&&openedAtDouble.has(hit.to)&&!openedAtDouble.get(hit.to).has(side))
   lateArrivals.push({eventIndex:index,side,number:hit.to,afterDouble:hit.to+'-'+hit.to});
 }
 function playDoubles(numbers,player){
  if(!Array.isArray(numbers)||!numbers.length||numbers.length>4)throw Error('1..4 doubles required');
  for(const n of numbers){
   if(!Number.isInteger(n)||n<0||n>6)throw Error('invalid double number');
   const tile=[n,n],opts=e.candidateDoubleOpenings(branch,opening,[tile]);
   if(!opts.length)throw Error('double not legal or already opened: '+n);
   openedAtDouble.set(n,new Set(opts[0].sides));
   opening=e.openNumber(opening,n);addPlayed(tile,player);
  }
 }
 function recordPass(player,index,openingPass=false){
  if(handSizes[player]===0)throw Error('empty hand cannot pass');
  const forbidden=deck().filter(t=>!playedKeys.has(key(t))&&d.actionsForHand(branch,opening,[t]).length>0);
  if([...knownDraws].some(([k,owner])=>owner===player&&!playedKeys.has(k)&&forbidden.some(t=>key(t)===k)))
   throw Error('observed pass contradicts known playable held draw');
  passes.push({player,eventIndex:index,openingPass,stockSizeAtPass:stockSize,
   acquisitionsAtPass:acquisitions[player],forbiddenTiles:clone(forbidden),
   forbiddenSet:new Set(forbidden.map(key)),playedAtPass:clone(played),
   ends:Object.fromEntries(SIDES.map(s=>[s,branch.branches[s].end])),
   openedNumbers:[...opening.openedNumbers].sort((a,b)=>a-b)});
 }
 // Two CONFIRMED opening sources. A later-round stock 1-1 is played by the
 // previous winner, without a replacement draw; no private tile identity is inferred.
 if(fromStock){
  stockSize--;
 }else{
  handSizes[o.starter]--;handSizes[o.starter]++;stockSize--;acquisitions[o.starter]++;
  if(o.drawnTile){
   const k=key(o.drawnTile);if(k==='1-1')throw Error('drawn 1-1 was already played');
   knownDraws.set(k,o.starter);
  }
 }
 if(o.followup){
  placeSingle(o.followup.tile,o.followup.side,o.starter,-1);
 }else recordPass(o.starter,-1,true);
 invariant();
 for(let i=0;i<spec.events.length;i++){
  const ev=spec.events[i];
  if(!ev||ev.player!==currentPlayer)throw Error('wrong turn order at event '+i);
  if(ev.type==='draw'){
   if(pendingDraw||stockSize===0)throw Error('draw unavailable or duplicated');
   stockSize--;handSizes[ev.player]++;acquisitions[ev.player]++;
   if(ev.tile){
    const k=key(ev.tile);if(playedKeys.has(k)||knownDraws.has(k))throw Error('duplicate known draw');
    knownDraws.set(k,ev.player);
   }
   pendingDraw={player:ev.player,tile:ev.tile||null};eventCounts.draw++;invariant();continue;
  }
  if(!['single','double-sequence','mixed-finish','pass'].includes(ev.type))throw Error('unknown public event');
  if(ev.type==='pass'){
   if(stockSize>0&&!pendingDraw)throw Error('pass without required stock draw');
   recordPass(ev.player,i);eventCounts.pass++;
  }else if(ev.type==='single'){
   placeSingle(ev.tile,ev.side,ev.player,i);eventCounts.single++;
  }else if(ev.type==='double-sequence'){
   playDoubles(ev.numbers,ev.player);eventCounts.double+=ev.numbers.length;
  }else{
   if(!Array.isArray(ev.numbers)||!ev.numbers.length)throw Error('mixed finish doubles required');
   placeSingle(ev.tile,ev.side,ev.player,i);playDoubles(ev.numbers,ev.player);
   if(handSizes[ev.player]!==0)throw Error('mixed finish did not empty public hand count');
   eventCounts.mixed++;
  }
  pendingDraw=null;currentPlayer=(currentPlayer+1)%3;invariant();
  if(handSizes.some(n=>n===0)&&i!==spec.events.length-1)
   throw Error('events after a player finished');
 }
 if(pendingDraw)throw Error('unresolved draw event at end of trace');
 // Retrospective evidence: the current known hand must not contain a tile that
 // would have made its owner's earlier no-acquisition pass impossible.
 // A known draw identity is private evidence, NOT implied by a public draw event.
 const knownOpponentTiles={1:clone((spec.knownOpponentTiles||{})[1]||[]),
  2:clone((spec.knownOpponentTiles||{})[2]||[])};
 if(spec.focalHand){
  const focalKeys=new Set(spec.focalHand.map(key));
  for(const p of passes)if(p.player===0&&acquisitions[0]===p.acquisitionsAtPass)
   for(const k of focalKeys)if(p.forbiddenSet.has(k))
    throw Error('known focal hand contradicts observed no-acquisition pass: '+k);
  for(const [k,owner] of knownDraws)if(!playedKeys.has(k)){
   if(owner===0){
    if(!focalKeys.has(k))throw Error('known focal draw absent from final hand: '+k);
   }else{
    const other=owner===1?2:1;
    if(knownOpponentTiles[other].some(t=>key(t)===k))
     throw Error('known draw assigned to wrong opponent: '+k);
    if(!knownOpponentTiles[owner].some(t=>key(t)===k))
     knownOpponentTiles[owner].push(k.split('-').map(Number));
   }
  }
 }
 // Focal passes are checked against the known focal hand above. The hidden-world
 // posterior only accepts constraints on the TWO unknown opponent hands.
 const passObservations=passes.filter(p=>p.player!==0&&p.stockSizeAtPass===0&&acquisitions[p.player]===p.acquisitionsAtPass)
  .map(p=>({player:p.player,forbiddenTiles:clone(p.forbiddenTiles),noInterveningDraw:true,
   source:'chronological public pass at event '+p.eventIndex+'; provisional global-ever-open'}));
 const result={model:spec.model,openingSource:fromStock?'stock-1-1-previous-winner':'hand-1-1-with-draw',playedTiles:clone(played),handSizes:handSizes.slice(),stockSize,
  branchEnds:Object.fromEntries(SIDES.map(s=>[s,branch.branches[s].end])),
  openedNumbers:[...opening.openedNumbers].sort((a,b)=>a-b),currentPlayer,
  knownDrawAudit:[...knownDraws].map(([tile,owner])=>({tile,owner,stillHeld:!playedKeys.has(tile)})),
  passCount:passes.length,focalPassCount:passes.filter(p=>p.player===0).length,
  activeNoStockPasses:passObservations.length,
  discardedPasses:passes.length-passObservations.length,passObservations,
  passAudit:passes.map(p=>({player:p.player,eventIndex:p.eventIndex,openingPass:p.openingPass,
   stockSizeAtPass:p.stockSizeAtPass,forbiddenTiles:p.forbiddenTiles.map(key).sort(),
   eligible:passObservations.some(x=>x.source.includes('event '+p.eventIndex+';')&&x.player===p.player),
   branchEnds:p.ends,openedNumbers:p.openedNumbers})),
  lateArrivals,modelDivergences,eventCounts};
 if(spec.focalHand){
  if(!Array.isArray(spec.focalHand)||spec.focalHand.length!==handSizes[0])throw Error('focal hand count mismatch');
  result.posteriorSpec={playedTiles:clone(played),focalHand:clone(spec.focalHand),
   knownOpponentTiles,
   handSizes:handSizes.slice(),stockSize,passObservations};
  // Fail closed if known hand contradicts played history or inferred pass evidence.
  post.prepare(result.posteriorSpec);
 }
 return result;
}
function focalPassFixture(){
 // Seat 0's known eight-tile hand has no legal move after these four public
 // plays. Its forced pass is verified locally, NOT treated as an opponent mask.
 return {model:'provisional-global-ever-open',
  opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
  events:[{player:0,type:'double-sequence',numbers:[2]},
   {player:1,type:'single',tile:[0,1],side:'left'},
   {player:2,type:'single',tile:[2,3],side:'up'},
   {player:0,type:'pass'}],
  focalHand:[[2,4],[2,5],[2,6],[4,4],[4,5],[4,6],[5,5],[5,6]],
  knownOpponentTiles:{1:[],2:[]}};
}
function lateArrivalFixture(){
 return {model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
  events:[{player:0,type:'double-sequence',numbers:[2]},
   {player:1,type:'single',tile:[1,3],side:'left'},
   {player:2,type:'double-sequence',numbers:[3]},
   {player:0,type:'single',tile:[2,3],side:'left'},
   {player:1,type:'single',tile:[2,4],side:'left'}]};
}
function test(){
 const before=fixture(),f=JSON.stringify(before),r=replay(before),p=post.prepare(r.posteriorSpec);
 if(!same(r.playedTiles.map(key).sort(),['1-1','1-2','2-2'])||
  !same(r.handSizes,[8,9,8])||r.stockSize!==0||r.activeNoStockPasses!==1||
  r.passAudit[0].forbiddenTiles.length!==10||p.total!==5005n)
  throw Error('chronological pass fixture or exact posterior mismatch');
 if(JSON.stringify(before)!==f)throw Error('source fixture mutated');
 const focalPass=focalPassFixture(),focalReplay=replay(focalPass);
 if(focalReplay.passCount!==1||focalReplay.focalPassCount!==1||
  focalReplay.activeNoStockPasses!==0||focalReplay.discardedPasses!==1||
  focalReplay.posteriorSpec.passObservations.length!==0||
  post.prepare(focalReplay.posteriorSpec).total!==6435n)
  throw Error('known focal forced pass must not become an opponent posterior constraint');
 const invalidFocal=focalPassFixture();invalidFocal.focalHand[0]=[1,4];
 let focalRejected=false;try{replay(invalidFocal);}catch(err){focalRejected=/known focal hand contradicts observed/.test(err.message);}
 if(!focalRejected)throw Error('known playable focal tile must invalidate observed forced pass');
 const late=replay(lateArrivalFixture());
 if(late.lateArrivals.length!==1||late.lateArrivals[0].side!=='left'||
  late.lateArrivals[0].number!==2||late.modelDivergences.length!==1||
  late.modelDivergences[0].tile!=='2-4')throw Error('late-arrival branch diagnostic failed');
 const forcedOpening=replay({model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,passed:true},
  events:[{player:0,type:'pass'}]});
 if(forcedOpening.activeNoStockPasses!==2||forcedOpening.passAudit[0].forbiddenTiles.length!==6||
  forcedOpening.passAudit[1].forbiddenTiles.length!==6)throw Error('opening pass chronology failed');
 const multi=replay({model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
  events:[{player:0,type:'single',tile:[1,3],side:'left'},
   {player:1,type:'double-sequence',numbers:[2,3]}]});
 if(!same(multi.openedNumbers,[1,2,3])||multi.eventCounts.double!==2)throw Error('multi-double chronology failed');
 const knownDraw=fixture();knownDraw.opening.drawnTile=[3,6];
 const knownReplay=replay(knownDraw),knownPosterior=post.prepare(knownReplay.posteriorSpec);
 if(knownPosterior.total!==2002n||!knownReplay.posteriorSpec.knownOpponentTiles[2].some(t=>key(t)==='3-6'))
  throw Error('known drawn tile must constrain hidden allocations');
 const stockCase=fixture();
 stockCase.opening={starter:2,fromStock:true,stockDraw:false,isFirstRound:false,previousWinnerIndex:2,
  followup:{tile:[1,2],side:'up'}};
 const stockReplay=replay(stockCase),stockPosterior=post.prepare(stockReplay.posteriorSpec);
 if(stockReplay.openingSource!=='stock-1-1-previous-winner'||
  stockReplay.eventCounts.draw!==0||stockReplay.eventCounts.openingFromStock!==1||
  !same(stockReplay.playedTiles,r.playedTiles)||!same(stockReplay.handSizes,r.handSizes)||
  stockPosterior.total!==p.total||!same(stockReplay.passAudit,r.passAudit))
  throw Error('later-round stock-1-1 opening provenance or posterior mismatch');
 const playedDraw=fixture();playedDraw.opening.drawnTile=[1,2];
 if(post.prepare(replay(playedDraw).posteriorSpec).total!==5005n)
  throw Error('known draw played on opening must not remain fixed in hand');
 const badFocalPass={model:'provisional-global-ever-open',
  opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
  events:[{player:0,type:'pass'}],focalHand:fixture().focalHand.concat([[0,6]])};
 const badKnownFocalDraw={model:'provisional-global-ever-open',
  opening:{starter:0,stockDraw:true,drawnTile:[3,6],followup:{tile:[1,2],side:'up'}},
  events:[],focalHand:fixture().focalHand};
 const badKnownOwner=fixture();badKnownOwner.opening.drawnTile=[3,6];
 badKnownOwner.knownOpponentTiles={1:[[3,6]],2:[]};
 const bad=[
  badFocalPass,badKnownFocalDraw,badKnownOwner,
  {...stockCase,opening:{...stockCase.opening,isFirstRound:true}},
  {...stockCase,opening:{...stockCase.opening,previousWinnerIndex:1}},
  {...stockCase,opening:{...stockCase.opening,drawnTile:[3,6]}},
  {...stockCase,opening:{...stockCase.opening,stockDraw:true}},
  {...stockCase,opening:{...stockCase.opening,previousWinnerIndex:null}},
  {...fixture(),events:[{player:1,type:'pass'}]},
  {...fixture(),opening:{starter:2,stockDraw:true,followup:{tile:[3,4],side:'up'}}},
  {...fixture(),events:[{player:0,type:'single',tile:[2,3],side:'up'}]},
  {...fixture(),events:[{player:0,type:'double-sequence',numbers:[3]}]},
  {...fixture(),events:[{player:0,type:'draw'}]},
  {...fixture(),events:[{player:0,type:'single',tile:[1,2],side:'up'}]},
  {...fixture(),focalHand:[[0,1]]},
  {model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,passed:true,drawnTile:[1,4]},events:[]},
  {model:'provisional-global-ever-open',opening:{starter:2,stockDraw:true,passed:true},
   events:[{player:0,type:'pass'},{player:1,type:'pass'},
    {player:2,type:'single',tile:[1,4],side:'up'}]},
  {...fixture(),events:[{player:0,type:'pass'},{player:1,type:'single',tile:[1,3],side:'left'},
    {player:2,type:'single',tile:[1,4],side:'right'},
    {player:0,type:'single',tile:[1,5],side:'down'}]}
 ];
 let rejected=0;for(const b of bad){try{replay(b);}catch(err){rejected++;}}
 if(rejected!==bad.length)throw Error('chronological negative guards failed '+rejected+'/'+bad.length);
 for(let i=0;i<100;i++){
  const a=post.samplePrepared(p,2042000+i),b=post.samplePrepared(p,2042000+i);
  post.assertWorld(p,a);if(!same(a,b))throw Error('posterior deterministic replay failed');
 }
 return {passed:true,chronologicalPassMask:10,exactCompatible:Number(p.total),
  lateArrivalDiagnostics:late.lateArrivals.length,allCurrentDivergentMoves:late.modelDivergences.length,
  openingPassesChecked:2,focalPassesChecked:1,focalPassInvalidHandRejected:true,
  multiDoubleSequenceChecked:true,knownDrawPartitions:Number(knownPosterior.total),
  knownDrawOwner:2,retrospectiveFocalPassGuard:true,stockOpeningExactPartitions:Number(stockPosterior.total),stockOpeningProvenance:true,negativeGuards:rejected,seedReplay:100};
}
function run(start=2042000,count=12000){
 if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<100)throw Error('seed range');
 const t=test(),r=replay(fixture()),p=post.prepare(r.posteriorSpec);
 let hits=0;const distinct=new Set();
 for(let i=0;i<count;i++){
  const w=post.samplePrepared(p,start+i);post.assertWorld(p,w);
  hits+=+w.hands[1].some(t=>key(t)==='3-6');
  distinct.add(w.hands[1].map(key).sort().join(','));
 }
 const expected=0.6,rate=hits/count,z=(rate-expected)/Math.sqrt(expected*(1-expected)/count);
 if(Math.abs(z)>5)throw Error('calibration failed');
 return {schema:'qosha-public-history-replay/v1',
  timestampBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',dateStyle:'short',timeStyle:'medium'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + public-history-replay-1.0',
  rules:'recovered qosa-1.0.0 3x9, PROVISIONAL global-ever-open',
  seeds:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,
  hiddenWorldAllocations:count,strategies:'none; public-trace validation + conditional uniform posterior',
  publicTrace:{opening:fixture().opening,events:fixture().events,played:r.playedTiles.map(key),
   ends:r.branchEnds,opened:r.openedNumbers,passAudit:r.passAudit,handSizes:r.handSizes},
  exact:{unrestrictedPartitions:24310,compatiblePartitions:Number(p.total),seat1Has36:expected},
  sampled:{worlds:count,distinctSeat1Hands:distinct.size,seat1Has36:hits,rate,z},
  tests:t,branchCounterfactual:replay(lateArrivalFixture()).modelDivergences,
  finding:'Chronological public 1-1/draw/1-2/2-2/pass reconstructs the ten-tile legal exclusion mask without caller-supplied ends or opened doubles; late arrival is a provisional-rule discriminator.',
  confidence:'Deterministic trace replay and exact 5005/24310 conditional partition benchmark; synthetic fixture only',
  limitations:['No authenticated physical-game trace or late-arrival ruling',
   'No private-hand proof of a claimed pass; observed passes are input evidence',
   'Global-ever-open and blocked winner/101 scoring not authenticated',
   'No opponent-choice posterior or human-game winning tactic'],
  nextAction:'Validate a real timestamped public move/pass trace, especially late arrival at a previously doubled number; resolve block ties before strategic ranking'};
}
if(require.main===module){
 const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2042000),+(a[1]||12000)),null,2));
}
module.exports={fixture,focalPassFixture,lateArrivalFixture,replay,test,run};
