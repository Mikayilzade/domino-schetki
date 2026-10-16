'use strict';
// Deal-clustered uncertainty for matched two-double policies; no PWA imports.
// node qosha-research/simulator/two-double-cluster.js 1085000 2000
const base=require('./two-double-confound-runner');
function atom(g){return {n:g?.n||0,d:(g?.pairedGain||0)-(g?.pairedLoss||0)};}
function summarize(rows,key){const n=rows.reduce((s,x)=>s+x[key].n,0),d=rows.reduce((s,x)=>s+x[key].d,0),m=d/n,k=rows.length;
 const se=Math.sqrt(k/(k-1)*rows.reduce((s,x)=>s+(x[key].d-m*x[key].n)**2,0))/n;
 return {n,deltaPP:100*m,ci95PP:[100*(m-1.96*se),100*(m+1.96*se)]};}
function run(start,count){const rows=[];for(let seed=start;seed<start+count;seed++){const row={};for(const [name,policy] of [['hold','moderate-double-hold'],['fast','fast-doubles']]){const x=base.run(seed,1,policy);if(x.checks.unresolved)throw Error('unresolved');row[name]=atom(x.all);row[name+'26']=atom(x.pairs['2-6']);}rows.push(row);}
 return {start,end:start+count-1,deals:count,hold:summarize(rows,'hold'),fast:summarize(rows,'fast'),hold26:summarize(rows,'hold26'),fast26:summarize(rows,'fast26')};}
if(require.main===module)console.log(JSON.stringify(run(Number(process.argv[2]),Number(process.argv[3])),null,2));
module.exports={run,summarize};
