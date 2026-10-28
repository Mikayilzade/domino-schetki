'use strict';
// Matched-world two-cycle action + focal-continuation policy audit.
// All branch rules PROVISIONAL. No complete-round or win-rate claims.
// node qosha-research/simulator/midgame-double-continuation-robust.js test
// node qosha-research/simulator/midgame-double-continuation-robust.js 2797200 4000 4000
const base=require('./midgame-double-rich');
const two=require('./midgame-double-two-cycle');
const assert=(x,m)=>{if(!x)throw Error(m);};
const actions=['single0','single6','chain06'];
const focalPolicies=['high','low'];
const plans=actions.flatMap(a=>focalPolicies.map(f=>a+'/'+f));
const configs=['global-ever-open','all-current-only'].flatMap(m=>['high','low','double-first'].map(o=>({model:m,opponent:o})));
function audit(worlds){
 const out={n:worlds.length,plans:{},safePlanCountDistribution:[0,0,0,0,0,0,0],anySafeWorlds:0};
 for(const p of plans)out.plans[p]={safeWorlds:0,scenarioPasses:0,netTotal:0,worstNetTotal:0,byConfig:Object.fromEntries(configs.map(c=>[c.model+'/'+c.opponent,{passes:0,netTotal:0}]))};
 for(const w of worlds){
  let safeCount=0;
  for(const p of plans){
   const [action,focal]=p.split('/'),s=out.plans[p];let pass=0,worst=Infinity;
   for(const c of configs){
    const r=two.simulate(c.model,action,w,c.opponent,focal);
    assert(r.terminal==='none'&&r.ownReturnPass!==null,'unexpected terminal in two-cycle fixture');
    const k=c.model+'/'+c.opponent;
    s.byConfig[k].passes+=r.ownReturnPass;
    s.byConfig[k].netTotal+=r.netStones;
    s.netTotal+=r.netStones;
    pass+=r.ownReturnPass;
    worst=Math.min(worst,r.netStones);
   }
   s.scenarioPasses+=pass;s.worstNetTotal+=worst;
   if(pass===0){s.safeWorlds++;safeCount++;}
  }
  out.safePlanCountDistribution[safeCount]++;
  out.anySafeWorlds+=+(safeCount>0);
 }
 for(const p of plans){
  const s=out.plans[p];s.meanNetStones=s.netTotal/(worlds.length*configs.length);
  s.meanWorstNetStones=s.worstNetTotal/worlds.length;
  s.scenarioPassRate=s.scenarioPasses/(worlds.length*configs.length);
  for(const v of Object.values(s.byConfig)){v.passRate=v.passes/worlds.length;v.meanNetStones=v.netTotal/worlds.length;delete v.netTotal;}
  delete s.netTotal;delete s.worstNetTotal;
 }
 return out;
}
function test(){
 base.test();two.test();
 const ex=audit(base.exactWorlds());
 assert(ex.n===924,'exact 12 choose 6');
 assert(ex.plans['single0/low'].safeWorlds===924,'single0 low safe in all exact worlds');
 assert(ex.plans['single6/high'].safeWorlds===924,'single6 high safe in all exact worlds');
 assert(ex.plans['chain06/low'].safeWorlds<924,'chain low must have counterexamples');
 assert(ex.anySafeWorlds===924,'at least one safe plan in every exact world');
 for(let i=0;i<100;i++)assert(JSON.stringify(base.world(2797200+i))===JSON.stringify(base.world(2797200+i)),'seed replay');
 const w=base.world(2785200);
 assert(two.simulate('all-current-only','chain06',w,'high','low').ownReturnPass===1,'seed trap');
 assert(two.simulate('all-current-only','single0',w,'high','low').ownReturnPass===0,'seed alternative');
 return{passed:true,exactPartitions:924,seedReplays:100,branchModels:2,opponentPolicies:3,focalPolicies:2,plans:6};
}
function run(start=2797200,n1=4000,n2=4000){
 assert(Number.isInteger(start)&&start>=2797200&&Number.isInteger(n1)&&n1>=1000&&Number.isInteger(n2)&&n2>=1000,'seed args');
 const checks=test();
 const exact=audit(base.exactWorlds());
 const cohort1=audit(Array.from({length:n1},(_,i)=>base.world(start+i)));
 const cohort2=audit(Array.from({length:n2},(_,i)=>base.world(start+n1+i)));
 return{schema:'qosha-double-continuation-robust/v1',timestampAsiaBaku:'2026-10-28 20:48 +04:00',
  engine:'qosa-research-0.5.3 + midgame-double-continuation-robust-1.0',
  rules:'recovered qosa-1.0.0, 3x9; both branch interpretations PROVISIONAL',
  seedRange:[start,start+n1+n2-1],cohorts:[[start,start+n1-1],[start+n1,start+n1+n2-1]],
  newHiddenAllocations:n1+n2,completeRounds:0,forcedFullGameContinuations:0,exactPartitions:924,
  plans,configs,checks,exact,cohort1,cohort2,
  metricContract:'Safe means a legal focal move exists on second return after 2 opponent cycles under each of 6 branch/opponent configurations, with the specified focal first-return greedy policy. Scenarios are not equiprobable; scenarioPassRate is not a real-game probability.',
  limitations:['Fixed synthetic trace and focal hand, not authenticated human play','Both branch interpretations unverified','Greedy high/low focal continuation policies and 3 artificial opponent policies','Conditional uniform unknown hands, no full-history posterior','No full-game win, minus, block-tie or 101 scoring inference'],
  nextAction:'Authenticate late-arrival branch unlock and optional double chains in physical play; then test continuation-conditioned double retention on varied chronological states with full-history posterior.'};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2797200),+(a[1]||4000),+(a[2]||4000)),null,2));}
module.exports={audit,test,run};
