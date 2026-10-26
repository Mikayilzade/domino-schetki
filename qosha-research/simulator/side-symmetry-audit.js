'use strict';
// Provisional four-branch number-lock side-label symmetry check.
// Run: node qosha-research/simulator/side-symmetry-audit.js test
//      node qosha-research/simulator/side-symmetry-audit.js RUN.json ...
const e=require('./engine'),d=require('./turn-dispatcher');
const mean=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function ends(s){return e.SIDES.map(side=>s.branches[side].end).sort((a,b)=>a-b).join(',');}
function actions(s,o,h){return d.actionsForHand(s,o,h).map(a=>a.type==='single'?'single:'+e.tileKey(a.tile)+':'+a.from+':'+a.to:a.type+':'+(a.numbers||[]).join(',')).sort().join('|');}
function verifyPair(s,o,h,a,b){
 if(a.side===b.side||e.tileKey(a.tile)!==e.tileKey(b.tile))throw Error('same tile different sides required');
 const x=e.applySinglePlacement(s,a),y=e.applySinglePlacement(s,b);
 return{sameEnd:a.from===b.from&&a.to===b.to,endsInvariant:ends(x)===ends(y),actionsInvariant:actions(x,o,h)===actions(y,o,h)};
}
function cluster(rows,field){
 const by=new Map();for(const r of rows){const a=by.get(r.seed)||[];a.push(r[field]);by.set(r.seed,a);}
 const a=[...by.values()].map(mean),m=mean(a);
 return{positions:rows.length,dealClusters:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):null};
}
function analyze(runs){
 const seen=new Set(),strict=[],side=[];let deals=0,rounds=0,forced=0;
 for(const r of runs){
  if(r.schema!=='qosha-strict-four-eight/v1'||r.engine!=='qosa-research-0.5.3'||r.trainWorlds!==24||r.evalWorlds!==24)throw Error('incompatible cohort');
  for(let s=r.seedStart;s<=r.seedEnd;s++){if(seen.has(s))throw Error('overlapping seed '+s);seen.add(s);}
  deals+=r.deals;rounds+=r.baselineRounds;forced+=r.forcedHiddenWorldContinuations;strict.push(...r.strictRows);side.push(...r.sideRows);
 }
 const strata={};
 for(const kind of ['same-end','different-end']){
  const a=side.filter(x=>x.kind===kind);
  strata[kind]={positions:a.length,changedChoice:a.filter(x=>x.changed).length,trainedMinusLexicalPP:cluster(a,'selectedMinusBaselinePP'),absoluteHeldoutDifferencePP:cluster(a,'absSideDifferencePP')};
 }
 return{schema:'qosha-side-symmetry-audit/v1',engine:'qosa-research-0.5.3',deals,baselineRounds:rounds,forcedHiddenWorldContinuations:forced,
  strict:{positions:strict.length,dealClusters:new Set(strict.map(x=>x.seed)).size,changedChoice:strict.filter(x=>x.key4!==x.key8).length,deltaPP:cluster(strict,'deltaPP')},
  side:{positions:side.length,dealClusters:new Set(side.map(x=>x.seed)).size,strata},
  finding:'Same tile and same numerical from/to on two different branches preserves sorted four-end multiset and side-free legal-action multiset under the provisional kernel. Bot side-label tie-breaking can create apparent differences.',
  limitations:'Not a human-rule validation. Different-end moves can change geometry. Bot policies are not permutation-equivariant; exploratory clustered intervals, nonrandom candidate prefix, sparse >=8 states and multiple comparisons. Finish-first != match victory.',
  nextAction:'Test permutation-equivariant continuation or joint side-label randomization; obtain authentic branch and block-winner fixtures.'};
}
function test(){
 const o=e.createOpeningState([0,1,2,3,4,5,6]),s=e.createBranchState([1,1]);
 s.branches.up.end=1;s.branches.left.end=1;s.branches.right.end=2;s.branches.down.end=3;
 const hand=[[1,5],[4,5],[2,2],[3,6]],p=e.legalSinglePlacements(s,[1,4]);
 const x=verifyPair(s,o,hand,p.find(z=>z.side==='up'),p.find(z=>z.side==='left'));
 if(!x.sameEnd||!x.endsInvariant||!x.actionsInvariant)throw Error('same-end invariant');
 const t=e.createBranchState([1,1]);t.branches.up.end=1;t.branches.left.end=2;t.branches.right.end=3;t.branches.down.end=4;
 const q=e.legalSinglePlacements(t,[1,2]),y=verifyPair(t,o,hand,q.find(z=>z.side==='up'),q.find(z=>z.side==='left'));
 if(y.sameEnd||y.endsInvariant)throw Error('different-end control');
 const fake={schema:'qosha-strict-four-eight/v1',engine:'qosa-research-0.5.3',trainWorlds:24,evalWorlds:24,seedStart:1,seedEnd:2,deals:2,baselineRounds:12,forcedHiddenWorldContinuations:10,strictRows:[],sideRows:[{seed:1,kind:'same-end',changed:false,selectedMinusBaselinePP:0,absSideDifferencePP:0}]};
 if(analyze([fake]).side.strata['same-end'].positions!==1)throw Error('strata');
 let rejected=false;try{analyze([fake,fake]);}catch(err){rejected=/overlapping/.test(err.message);}if(!rejected)throw Error('overlap');
 return{passed:true,checks:7};
}
if(require.main===module){const fs=require('fs'),a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():analyze(a.flatMap(p=>{const z=JSON.parse(fs.readFileSync(p,'utf8'));return z.runs||[z];})),null,2));}
module.exports={analyze,test,verifyPair};
