'use strict';
// Deal-clustered paired-policy comparison. All eligible seats from one seed are one cluster.
// node qosha-research/simulator/two-double-cluster.js 1085000 2000
const base=require('./two-double-confound-runner');
function atom(g){return {n:g?.n||0,d:(g?.pairedGain||0)-(g?.pairedLoss||0),gain:g?.pairedGain||0,loss:g?.pairedLoss||0};}
function otherSix(p){const o={n:0,d:0,gain:0,loss:0};for(const k of ['0-6','3-6','4-6','5-6']){const a=atom(p[k]);for(const f of Object.keys(o))o[f]+=a[f];}return o;}
function summary(rows,key){const n=rows.reduce((s,x)=>s+x[key].n,0),d=rows.reduce((s,x)=>s+x[key].d,0),gain=rows.reduce((s,x)=>s+x[key].gain,0),loss=rows.reduce((s,x)=>s+x[key].loss,0),k=rows.length;
 if(!n)return {n,gain,loss,deltaPP:null,ci95PP:null};const m=d/n;
 const se=Math.sqrt(k/(k-1)*rows.reduce((s,x)=>s+(x[key].d-m*x[key].n)**2,0))/n;
 return {n,gain,loss,deltaPP:100*m,ci95PP:[100*(m-1.96*se),100*(m+1.96*se)]};}
function contrast(rows,ka,kb){const a=summary(rows,ka),b=summary(rows,kb);if(!a.n||!b.n)return null;
 const u=a.deltaPP/100,v=b.deltaPP/100,k=rows.length;
 const se=Math.sqrt(k/(k-1)*rows.reduce((s,x)=>s+((x[ka].d-u*x[ka].n)/a.n-(x[kb].d-v*x[kb].n)/b.n)**2,0));
 return {nA:a.n,nB:b.n,deltaPP:100*(u-v),ci95PP:[100*(u-v-1.96*se),100*(u-v+1.96*se)]};}
function run(start,count){if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('seed/count');
 const rows=[];let completeRounds=0,unresolved=0;
 for(let seed=start;seed<start+count;seed++){const row={};for(const [name,policy] of [['hold','moderate-double-hold'],['fast','fast-doubles']]){const x=base.run(seed,1,policy);completeRounds+=x.checks.rounds;unresolved+=x.checks.unresolved;if(x.checks.unresolved)throw Error('unresolved '+seed);row[name]=atom(x.all);row[name+'26']=atom(x.pairs['2-6']);row[name+'Other6']=otherSix(x.pairs);}rows.push(row);}
 return {engine:base.ENGINE,start,end:start+count-1,deals:count,completeRounds,unresolved,
  hold:summary(rows,'hold'),fast:summary(rows,'fast'),policyInteraction:contrast(rows,'fast','hold'),
  pair26:{hold:summary(rows,'hold26'),fast:summary(rows,'fast26'),other6Hold:summary(rows,'holdOther6'),other6Fast:summary(rows,'fastOther6'),
   incrementalHold:contrast(rows,'hold26','holdOther6'),incrementalFast:contrast(rows,'fast26','fastOther6')},
  caveat:'Exploratory normal 95% deal-cluster CIs; pair comparisons unadjusted for hand composition; no block winner.'};}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]),Number(process.argv[3])),null,2));
module.exports={run,summary,contrast};
