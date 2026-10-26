'use strict';
// Reproduce descriptive action-identity strata across nonoverlapping 24-train/24-eval wide-choice runs.
// Usage: node qosha-research/simulator/widechoice-action-strata.js test
//        node qosha-research/simulator/widechoice-action-strata.js RUN1.json RUN2.json ...
function action(k){const [type,side,to,numbers,tile]=String(k).split(':');return{type,side,to,numbers,tile};}
function category(a,b){
 if(a===b)return 'unchanged';
 const x=action(a),y=action(b);
 if(x.type!==y.type)return 'single-vs-double-sequence';
 if(x.type==='double-sequence')return 'double-sequence-length-or-number';
 if(x.type!=='single')return 'other-action';
 if(x.tile!==y.tile)return 'different-tile';
 if(x.side!==y.side)return 'same-tile-different-side';
 if(x.to!==y.to)return 'same-tile-other-end';
 return 'same-tile-other';
}
const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:null;
function cluster(rows,field){
 const by=new Map();for(const r of rows){const a=by.get(r.seed)||[];a.push(r[field]);by.set(r.seed,a);}
 const a=[...by.values()].map(avg),m=avg(a);
 const h=a.length>1?1.96*Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1)/a.length):null;
 return{positions:rows.length,dealClusters:a.length,meanPP:m,exploratory95HalfWidthPP:h};
}
function analyze(runs){
 if(!runs.length)throw Error('no runs');
 const seedSet=new Set(),rows=[];let deals=0,rounds=0,forced=0;
 for(const run of runs){
  if(run.schema!=='qosha-pass-widechoice/v1'||run.trainWorlds!==24||run.evalWorlds!==24)throw Error('incompatible settings');
  for(let s=run.seedStart;s<=run.seedEnd;s++){if(seedSet.has(s))throw Error('overlapping seeds '+s);seedSet.add(s);}
  deals+=run.deals;rounds+=run.baselineRounds;forced+=run.forcedHiddenWorldContinuations;
  for(const r of run.rows)rows.push({...r,actionChangeType:category(r.conditional4Key,r.conditionalKey)});
 }
 const groups={};
 for(const type of [...new Set(rows.map(r=>r.actionChangeType))].sort()){
  const subset=rows.filter(r=>r.actionChangeType===type);
  groups[type]={conditional8Minus4:cluster(subset,'conditional8Minus4PP'),
   meanRemainingPipsChange:avg(subset.map(r=>r.conditional8Minus4Pips)),
   positivePositions:subset.filter(r=>r.conditional8Minus4PP>0).length,
   negativePositions:subset.filter(r=>r.conditional8Minus4PP<0).length,
   zeroPositions:subset.filter(r=>r.conditional8Minus4PP===0).length};
 }
 return{schema:'qosha-widechoice-action-strata/v1',engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0; number-lock PROVISIONAL',
  deals,baselineRounds:rounds,forcedHiddenWorldContinuations:forced,positions:rows.length,dealClusters:new Set(rows.map(r=>r.seed)).size,
  cohorts:runs.map(run=>({seedStart:run.seedStart,seedEnd:run.seedEnd,positions:run.positions,dealClusters:run.summary.combined.deals,conditional8Minus4:run.summary.combined.conditional8Minus4PP})),
  overall:cluster(rows,'conditional8Minus4PP'),changes:rows.filter(r=>r.actionChangeType!=='unchanged').length,groups,
  limitations:'Exploratory deal-cluster normal intervals, no multiplicity adjustment; first eligible >=5-candidate both-pass states, correlated seats/mixes. Post-training action-change strata descriptive, NOT causal. Policy-only baseline may contain fewer than 4 proposals. Four-side lock provisional; block winner/loneZero/bust/101-match unresolved; finish-first != match win.',
  nextAction:'Preregister tile-change vs side-switch vs double-sequence hypotheses on new seeds; obtain authentic branch/block fixtures.'};
}
function test(){
 const cases=[
 ['single:left:2::2-5','single:right:2::2-5','same-tile-different-side'],
 ['single:left:2::2-5','single:left:5::2-5','same-tile-other-end'],
 ['single:left:2::2-5','single:left:2::2-4','different-tile'],
 ['double-sequence:::2,3:0-0','double-sequence:::2:0-0','double-sequence-length-or-number'],
 ['single:left:2::2-5','double-sequence:::2:0-0','single-vs-double-sequence'],
 ['single:left:2::2-5','single:left:2::2-5','unchanged']];
 for(const [a,b,want] of cases)if(category(a,b)!==want)throw Error('category '+want);
 const mock={schema:'qosha-pass-widechoice/v1',trainWorlds:24,evalWorlds:24,seedStart:1,seedEnd:2,deals:2,baselineRounds:12,forcedHiddenWorldContinuations:10,positions:2,summary:{combined:{deals:2,conditional8Minus4PP:{mean:2}}},rows:[
 {seed:1,conditional4Key:cases[0][0],conditionalKey:cases[0][1],conditional8Minus4PP:10,conditional8Minus4Pips:-1},
 {seed:2,conditional4Key:cases[5][0],conditionalKey:cases[5][1],conditional8Minus4PP:-6,conditional8Minus4Pips:0}]};
 const z=analyze([mock]);if(z.changes!==1||z.overall.meanPP!==2||z.groups['same-tile-different-side'].conditional8Minus4.meanPP!==10)throw Error('analysis fixture');
 let overlap=false;try{analyze([mock,mock]);}catch(e){overlap=/overlapping seeds/.test(e.message);}if(!overlap)throw Error('overlap not rejected');
 return{passed:true,checks:9};
}
if(require.main===module){
 const fs=require('fs'),args=process.argv.slice(2);
 console.log(JSON.stringify(args[0]==='test'?test():analyze(args.map(p=>JSON.parse(fs.readFileSync(p,'utf8')))),null,2));
}
module.exports={action,category,cluster,analyze,test};
