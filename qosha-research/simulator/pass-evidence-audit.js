'use strict';
// Provisional global-ever-open branch model; NOT authentic real-table replay.
// Derive legal-tile exclusions from an explicitly observed no-stock pass snapshot.
// node qosha-research/simulator/pass-evidence-audit.js test
// node qosha-research/simulator/pass-evidence-audit.js 2030000 12000
const e=require('./engine'),d=require('./turn-dispatcher'),post=require('./midgame-exact-posterior');
const key=e.tileKey,deck=e.createDoubleSixDeck,SIDES=e.SIDES;
const keys=a=>a.map(key).sort();
const choose=(n,k)=>{let x=1;for(let i=1;i<=k;i++)x=x*(n-i+1)/i;return Math.round(x);};
function deriveMask(spec,obs){
 if(!obs||![1,2].includes(obs.player)||obs.observedPass!==true||!obs.source||
  obs.stockSizeAtPass!==0||obs.noAcquisitionAfterPass!==true||
  obs.model!=='provisional-global-ever-open'||!Array.isArray(obs.playedAtPass)||
  !obs.branchEnds||!Array.isArray(obs.openedNumbers))
  throw Error('documented no-stock pass and explicit provisional snapshot required');
 const final=new Set(keys(spec.playedTiles)),past=keys(obs.playedAtPass),played=new Set(past);
 if(played.size!==past.length||past.some(k=>!final.has(k))||!played.has('1-1'))
  throw Error('pass-time played tiles must be unique, public, and contain 1-1');
 const opened=new Set(obs.openedNumbers);
 if(opened.size!==obs.openedNumbers.length||!opened.has(1)||
   [...opened].some(n=>!Number.isInteger(n)||n<0||n>6||!played.has(n+'-'+n)))
  throw Error('opened number lacks public double at pass time');
 const b=e.createBranchState([1,1]);
 for(const side of SIDES){const n=obs.branchEnds[side];
  if(!Number.isInteger(n)||n<0||n>6)throw Error('four explicit ends required');
  b.branches[side].end=n;
 }
 const o=e.createOpeningState([...opened]);
 const forbiddenTiles=deck().filter(t=>!played.has(key(t))&&d.actionsForHand(b,o,[t]).length>0);
 return {player:obs.player,forbiddenTiles,noInterveningDraw:true,
  source:obs.source+'; global-ever-open provisional mask; NOT authentic replay'};
}
function synthetic(){
 const playedTiles=[[1,1],[1,2],[2,2]];
 const focalHand=[[0,1],[1,3],[1,4],[1,5],[1,6],[0,2],[2,3],[2,4]];
 const spec={playedTiles,focalHand,handSizes:[8,9,8],stockSize:0,knownOpponentTiles:{1:[],2:[]}};
 const pass={player:1,observedPass:true,source:'synthetic 1-1, 1-2, 2-2',
  stockSizeAtPass:0,noAcquisitionAfterPass:true,model:'provisional-global-ever-open',
  playedAtPass:playedTiles,openedNumbers:[1,2],branchEnds:{up:2,left:1,right:1,down:1}};
 return {spec,pass};
}
function test(){
 const {spec,pass}=synthetic(),mask=deriveMask(spec,pass);
 const expected=deck().filter(t=>!spec.playedTiles.some(x=>key(x)===key(t))&&(t.includes(1)||t.includes(2)));
 if(JSON.stringify(keys(mask.forbiddenTiles))!==JSON.stringify(keys(expected))||mask.forbiddenTiles.length!==10)
  throw Error('incorrect pass legal-tile mask');
 const p=post.prepare({...spec,passObservations:[mask]});
 if(p.total!==5005n||p.pool.length!==17||p.caps.join(',')!=='9,8,0')throw Error('exact count');
 for(let i=0;i<100;i++){
  const a=post.samplePrepared(p,2030000+i),b=post.samplePrepared(p,2030000+i);
  post.assertWorld(p,a);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('seed replay');
 }
 const invalid=[
  {...pass,openedNumbers:[1,2,6]}, {...pass,stockSizeAtPass:1},
  {...pass,noAcquisitionAfterPass:false},{...pass,playedAtPass:[[1,1],[1,2],[1,2]]},
  {...pass,branchEnds:{up:2,left:1,right:1}},
  {...pass,model:'unlabelled'},{...pass,observedPass:false}
 ];
 let rejected=0;for(const x of invalid)try{deriveMask(spec,x);}catch(err){rejected++;}
 if(rejected!==invalid.length)throw Error('invalid evidence accepted');
 const old={playedTiles:[[1,1],[0,0],[0,1],[0,2],[0,3],[0,4]]};
 let oldRejected=false;try{deriveMask(old,{...pass,playedAtPass:old.playedTiles,openedNumbers:[1,2,6]});}catch(err){oldRejected=true;}
 if(!oldRejected)throw Error('legacy synthetic masks wrongly authenticated');
 return {passed:true,maskSize:10,exactCompatible:5005,unconstrained:choose(17,9),
  legacyMasksNotAuthentic:true,invalidEvidenceRejected:rejected,replayChecks:100};
}
function run(start=2030000,count=12000){
 if(!Number.isInteger(start)||start<0||!Number.isInteger(count)||count<100)throw Error('seed range');
 const {spec,pass}=synthetic(),mask=deriveMask(spec,pass);
 const p=post.prepare({...spec,passObservations:[mask]});
 const exact=choose(15,9),unconstrained=choose(17,9);
 if(p.total!==BigInt(exact))throw Error('independent combinatorial mismatch');
 let hits=0;const distinct=new Set();
 for(let i=0;i<count;i++){const w=post.samplePrepared(p,start+i);post.assertWorld(p,w);
  hits+=+w.hands[1].some(t=>key(t)==='3-6');distinct.add(keys(w.hands[1]).join(','));}
 const expected=9/15,rate=hits/count,z=(rate-expected)/Math.sqrt(expected*(1-expected)/count);
 if(Math.abs(z)>5)throw Error('marginal calibration failed');
 return {schema:'qosha-pass-evidence-audit/v1',
  timestampBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',dateStyle:'short',timeStyle:'medium'}).format(new Date())+' +04:00',
  engine:'qosa-research-0.5.3 + pass-evidence-audit-1.0',
  rules:'recovered qosa-1.0.0, provisional global-ever-open',
  seeds:[start,start+count-1],deals:0,modelRounds:0,forcedContinuations:0,hiddenWorldAllocations:count,
  strategies:'none; exact posterior and legal-mask audit',
  fixture:{played:keys(spec.playedTiles),focal:keys(spec.focalHand),handSizes:spec.handSizes,
   branchEnds:pass.branchEnds,openedNumbers:pass.openedNumbers,forbiddenTiles:keys(mask.forbiddenTiles),
   provenance:'synthetic, NOT authentic game trace'},
  exact:{unconstrainedPartitions:unconstrained,passCompatiblePartitions:exact,
   conditionalFraction:exact/unconstrained,seat1Has36:expected},
  sampled:{worlds:count,distinctWorlds:distinct.size,seat1Has36:hits,rate,z},
  tests:test(),
  finding:'Prior synthetic 2-X and 6-X pass masks cannot be derived under global-ever-open without publicly played 2-2 and 6-6; pass masks require opened-double evidence.',
  confidence:'Exact choose(15,9) independent count, replay tests, 5-sigma seeded calibration',
  limitations:['Synthetic pass and branch ends; no authentic chronological replay',
   'Global-ever-open branch rule provisional','No later acquisition asserted, not reconstructed from event log',
   'Uniform hidden-world allocations ignore opponent choice bias','No winning tactic or minus probability inferred'],
  nextAction:'Add chronological pass-time board and draw replay; seek authentic branch unlock and block-tie examples'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2030000),+(a[1]||12000)),null,2));}
module.exports={deriveMask,synthetic,test,run};
