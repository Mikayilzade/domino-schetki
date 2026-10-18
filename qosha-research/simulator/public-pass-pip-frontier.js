'use strict';
// Public-information matched-seat policy frontier: exact pass vs pip-sensitive alternatives.
// Reproduce: node qosha-research/simulator/public-pass-pip-frontier.js test
//            node qosha-research/simulator/public-pass-pip-frontier.js 1063500 80
// No hidden opponent tile identities enter focal policy.
const e=require('./engine'),r=require('./round-driver'),init=require('./initializer');
const pub=require('./public-pass-tournament'),{chooseBy}=require('./strategy-runner');
const POLICIES=['pass','no-pass','pass-pip-0.01','pass-pip-0.025'];
const OPPONENTS=['closed-branch-control','moderate-double-hold'];
const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
const median=a=>{const x=[...a].sort((m,n)=>m-n),k=x.length;return k%2?x[(k-1)/2]:(x[k/2-1]+x[k/2])/2;};
function key(a){return [a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');}
function choose(rows,kind){
 if(kind==='pass'||kind==='no-pass')return pub.choosePublic(rows,kind==='pass');
 const weight=kind==='pass-pip-0.01'?0.01:kind==='pass-pip-0.025'?0.025:null;
 if(weight===null)throw Error('unknown policy '+kind);
 return [...rows].sort((a,b)=>b.finish-a.finish||
  (b.prob+weight*b.pips)-(a.prob+weight*a.pips)||
  a.openings-b.openings||b.pips-a.pips||key(a.action).localeCompare(key(b.action)))[0];
}
function play(base,seat,kind,opponent,seed){
 let s=r.cloneRoundState(base),choices=0,divergences=0,openingNumbers=0;
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer,played=pub.publicPlayed(s);
  s=r.stepRound(s,(opts,st)=>{
   if(p!==seat)return chooseBy(opponent,opts,{seed,turns:st.turns,player:p});
   const rows=pub.publicChoices(opts,st,played),pick=choose(rows,kind);
   if(rows.length>1){choices++;if(key(pick.action)!==key(choose(rows,'pass').action))divergences++;}
   if(pick.action.type==='double-sequence')openingNumbers+=(pick.action.numbers||[]).length;
   return pick.action;
  });
 }
 if(!s.outcome)throw Error('unresolved '+seed+'/'+seat+'/'+kind+'/'+opponent);
 return {finish:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
  pips:e.pipSum(s.hands[seat]),block:+(s.outcome.kind==='block'),turns:s.turns,
  minus:s.outcome.kind==='finish'&&s.outcome.playerIndex===seat?s.outcome.minus:0,
  endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,
  choices,divergences,openingNumbers};
}
function summarize(xs){
 return {n:xs.length,finishFirst:avg(xs.map(x=>x.finish)),meanPips:avg(xs.map(x=>x.pips)),
  medianPips:median(xs.map(x=>x.pips)),blockRate:avg(xs.map(x=>x.block)),
  meanTurns:avg(xs.map(x=>x.turns)),meanEndingDoubles:avg(xs.map(x=>x.endingDoubles)),
  minus:Object.fromEntries([-10,-20,-30,-40].map(k=>[k,xs.filter(x=>x.minus===k).length])),
  choices:xs.reduce((s,x)=>s+x.choices,0),
  divergencesFromPass:xs.reduce((s,x)=>s+x.divergences,0),
  openingNumbers:xs.reduce((s,x)=>s+x.openingNumbers,0)};
}
function pairedCI(values){
 const mean=avg(values),n=values.length;
 const se=Math.sqrt(values.reduce((s,v)=>s+(v-mean)**2,0)/(n*(n-1)));
 return {mean,ci95:[mean-1.96*se,mean+1.96*se]};
}
function cohort(start,count,opponent){
 const raw=Object.fromEntries(POLICIES.map(p=>[p,[]])),pairs=Object.fromEntries(POLICIES.filter(p=>p!=='pass').map(p=>[p,{finish:[],pips:[],blocks:[]}]));
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('initializer '+seed);
  const by=Object.fromEntries(POLICIES.map(p=>[p,[]]));
  for(let seat=0;seat<3;seat++){
   for(const policy of POLICIES){const result=play(base,seat,policy,opponent,seed);raw[policy].push(result);by[policy].push(result);}
  }
  for(const policy of POLICIES.filter(p=>p!=='pass')){
   for(const metric of ['finish','pips','blocks'])pairs[policy][metric].push(avg(by[policy].map((v,i)=>v[metric==='blocks'?'block':metric]-by.pass[i][metric==='blocks'?'block':metric])));
  }
 }
 return {opponent,seedRange:[start,start+count-1],deals:count,rounds:count*3*POLICIES.length,
  policies:Object.fromEntries(POLICIES.map(p=>[p,summarize(raw[p])])),
  pairedVsPass:Object.fromEntries(Object.entries(pairs).map(([p,v])=>[p,Object.fromEntries(Object.entries(v).map(([m,values])=>[m,pairedCI(values)]))]))};
}
function run(start=1063500,count=80){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2)throw Error('invalid seeds');
 const cohorts=[[start,count],[start+count,count]];
 return {schema:'qosa-public-pass-pip-frontier/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',policies:POLICIES,opponents:OPPONENTS,
  seedSet:cohorts.map(([s,n])=>[s,s+n-1]),deals:count*2,rounds:count*2*3*POLICIES.length*OPPONENTS.length,
  assumptions:'fixed 1-1 later-round initializer; public uniform unknown-pool pass; opponent histories ignored; branch semantics provisional; no block winner assigned',
  design:'all policies same deal, focal seat, two identical opponents; 2 disjoint seed cohorts, but opponent mixes reuse seeds; exploratory cluster CIs over seed with 3 seats averaged; pips are raw hand remainder, not match score',
  groups:OPPONENTS.flatMap(op=>cohorts.map(([s,n])=>cohort(s,n,op)))};
}
function test(){
 for(const kind of POLICIES){const base=init.initializeThreePlayerRound({seed:1063500,isFirstRound:false,previousWinnerIndex:0});if(base.kind!=='ready')throw Error('initializer');}
 const a=run(1063500,2),b=run(1063500,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==96)throw Error('replay');
 return {passed:true,rounds:a.rounds};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1063500),+(a[1]||80)),null,2));}
module.exports={choose,play,run,test};