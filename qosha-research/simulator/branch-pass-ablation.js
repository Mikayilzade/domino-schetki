'use strict';
// Sensitivity of a synthetic pass posterior to UNVERIFIED late-arrival unlocking.
// node qosha-research/simulator/branch-pass-ablation.js test
// node qosha-research/simulator/branch-pass-ablation.js 2078000 12000
const e=require('./engine'),trace=require('./public-history-replay'),post=require('./midgame-exact-posterior');
const key=e.tileKey,check=(x,m)=>{if(!x)throw Error('branch-pass: '+m);};
function fixture(){return {model:'provisional-global-ever-open',
 opening:{starter:2,stockDraw:true,followup:{tile:[1,2],side:'up'}},
 events:[{player:0,type:'double-sequence',numbers:[2]},
 {player:1,type:'single',tile:[1,3],side:'left'},
 {player:2,type:'double-sequence',numbers:[3]},
 {player:0,type:'single',tile:[2,3],side:'left'},
 {player:1,type:'single',tile:[2,4],side:'up'},
 {player:2,type:'pass'}],
 focalHand:[[0,1],[1,4],[0,2],[2,5],[0,0],[0,3],[3,4]],
 knownOpponentTiles:{1:[],2:[]}};}
function allCurrentPassMask(spec){
 let b=e.createBranchState([1,1]);const used=new Set([1]);
 const opened=Object.fromEntries(e.SIDES.map(s=>[s,new Set([1])]));
 const played=new Set(['1-1']);
 function place(tile,side){
  const p=e.legalSinglePlacements(b,tile).find(x=>x.side===side);
  check(p&&opened[side].has(p.from),'illegal current-all placement '+key(tile));
  check(!played.has(key(tile)),'duplicate tile');
  b=e.applySinglePlacement(b,p);played.add(key(tile));
 }
 place(spec.opening.followup.tile,spec.opening.followup.side);
 let mask=null;
 for(const ev of spec.events){
  if(ev.type==='single')place(ev.tile,ev.side);
  else if(ev.type==='double-sequence'){
   for(const n of ev.numbers){
    const sides=e.sidesEndingIn(b,n);
    check(!used.has(n)&&sides.length>0,'illegal double');
    sides.forEach(s=>opened[s].add(n));used.add(n);played.add(n+'-'+n);
   }
  }else if(ev.type==='pass'){
   mask=e.createDoubleSixDeck().filter(t=>{
    if(played.has(key(t)))return false;
    if(t[0]===t[1])return !used.has(t[0])&&e.sidesEndingIn(b,t[0]).length>0;
    return e.legalSinglePlacements(b,t).some(p=>opened[p.side].has(p.from));
   });
  }else throw Error('unsupported event');
 }
 check(mask!==null,'no pass');
 return {mask,ends:Object.fromEntries(e.SIDES.map(s=>[s,b.branches[s].end]))};
}
function brute(p,mask){
 const forbidden=new Set(mask.map(key)),pool=p.pool,choose=p.caps[0],picked=[];
 let partitions=0,valid=0,seat1Has26=0;
 function visit(start){
  if(picked.length===choose){
   partitions++;const inSeat1=new Set(picked);
   for(let i=0;i<pool.length;i++)if(!inSeat1.has(i)&&forbidden.has(key(pool[i])))return;
   valid++;if(picked.some(i=>key(pool[i])==='2-6'))seat1Has26++;
   return;
  }
  for(let i=start;i<=pool.length-(choose-picked.length);i++){
   picked.push(i);visit(i+1);picked.pop();
  }
 }
 visit(0);return {partitions,valid,seat1Has26};
}
function prepare(){
 const spec=fixture(),global=trace.replay(spec),current=allCurrentPassMask(spec);
 check(JSON.stringify(global.branchEnds)===JSON.stringify(current.ends),'ends mismatch');
 check(global.lateArrivals.length===1&&global.lateArrivals[0].number===2,'late arrival missing');
 check(JSON.stringify(global.handSizes)==='[7,7,7]','hand sizes');
 const gm=global.passObservations[0].forbiddenTiles,cm=current.mask;
 const cset=new Set(cm.map(key)),onlyGlobal=gm.map(key).filter(k=>!cset.has(k)).sort();
 check(JSON.stringify(onlyGlobal)==='["0-2","2-5","2-6"]','pass-mask difference');
 const gp=post.prepare(global.posteriorSpec);
 const cp=post.prepare({...global.posteriorSpec,passObservations:[{
  player:2,forbiddenTiles:cm,noInterveningDraw:true,
  source:'synthetic pass; PROVISIONAL all-current-only branch unlocking'}]});
 const gb=brute(gp,gm),cb=brute(cp,cm);
 check(gb.partitions===3432&&cb.partitions===3432,'exhaustive size');
 check(gp.total===120n&&cp.total===330n&&gb.valid===120&&cb.valid===330,'exact counts');
 check(gb.seat1Has26===120&&cb.seat1Has26===120,'exact marginal');
 return {spec,global,current,gp,cp,gb,cb,onlyGlobal};
}
function test(){
 const p=prepare(),snap=JSON.stringify(p.spec);
 trace.replay(p.spec);allCurrentPassMask(p.spec);
 check(JSON.stringify(p.spec)===snap,'source mutated');
 for(let i=0;i<100;i++)for(const model of [p.gp,p.cp]){
  const x=post.samplePrepared(model,2078000+i),y=post.samplePrepared(model,2078000+i);
  post.assertWorld(model,x);check(JSON.stringify(x)===JSON.stringify(y),'seed replay');
 }
 return {passed:true,unrestrictedPartitions:3432,globalCompatible:120,currentCompatible:330,
  globalSeat1Has26:'120/120',currentSeat1Has26:'120/330',
  globalOnlyLegalTiles:p.onlyGlobal,seedReplaysPerModel:100};
}
function run(start=2078000,count=12000){
 check(Number.isInteger(start)&&start>=0&&Number.isInteger(count)&&count>=100,'seeds');
 const p=prepare(),checks=test(),sample={};
 for(const [name,model,expected] of [['global',p.gp,1],['allCurrent',p.cp,4/11]]){
  let hits=0;const distinct=new Set();
  for(let i=0;i<count;i++){
   const w=post.samplePrepared(model,start+i);post.assertWorld(model,w);
   hits+=+w.hands[1].some(t=>key(t)==='2-6');
   distinct.add(w.hands[1].map(key).sort().join(','));
  }
  const rate=hits/count,z=expected===1?null:(rate-expected)/Math.sqrt(expected*(1-expected)/count);
  check(expected===1?hits===count:Math.abs(z)<5,'sample calibration');
  sample[name]={worlds:count,seat1Has26:hits,rate,exactRate:expected,z,distinctHands:distinct.size};
 }
 return {schema:'qosha-branch-pass-ablation/v1',
  timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3+branch-pass-ablation-1.0',
  rules:'recovered qosa-1.0.0 3x9; BOTH branch models PROVISIONAL',
  seedRange:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,
  hiddenAllocations:count*2,strategies:'none; conditional uniform posterior',
  publicTrace:{opening:p.spec.opening,events:p.spec.events,played:p.global.playedTiles.map(key),
   handSizes:p.global.handSizes,ends:p.global.branchEnds,lateArrivals:p.global.lateArrivals},
  masks:{global:p.global.passObservations[0].forbiddenTiles.map(key).sort(),
   allCurrent:p.current.mask.map(key).sort(),onlyGlobal:p.onlyGlobal},
  exact:{unrestrictedPartitions:3432,globalCompatible:120,currentCompatible:330,
   globalSeat1Has26:'120/120',allCurrentSeat1Has26:'120/330'},
  sampled:sample,tests:checks,
  finding:'After a synthetic late-arrival pass, 2-6 must be with seat 1 under global-ever-open but has probability 4/11 under all-current-only.',
  confidence:'Exact exhaustive partitions; synthetic trace and UNVERIFIED branch models',
  limitations:['Neither branch rule authenticated','No gameplay-strength inference',
   'Uniform allocations ignore opponent policy','Block ties and 101 scoring unresolved'],
  nextAction:'Authenticate whether late arrival at a previously doubled number permits extension; then use the verified rule for real pass posterior and paired tactics'};
}
if(require.main===module){const a=process.argv.slice(2);
 console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2078000),+(a[1]||12000)),null,2));}
module.exports={fixture,allCurrentPassMask,brute,prepare,test,run};
