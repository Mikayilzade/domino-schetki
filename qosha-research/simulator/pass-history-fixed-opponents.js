'use strict';
// Reproducible fixed-opponent ablation, contrasted with descriptive mixed three-way tournaments.
// node qosha-research/simulator/pass-history-fixed-opponents.js test
// node qosha-research/simulator/pass-history-fixed-opponents.js 2026300 300
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {publicPlayed,choosePublic}=require('./public-pass-tournament');
const {recordPass,posteriorRows,run:historyTournament}=require('./public-pass-history-tournament');
const BOTS=['closed-branch-control','min-hand-pips'];
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:null;
const med=x=>{const a=[...x].sort((a,b)=>a-b),n=a.length;return n?n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2:null;};
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function play(base,seed,seat,policy,bot){
 let s=r.cloneRoundState(base),forbidden=[new Set(),new Set(),new Set()],changed=0,choices=0,changesAtNext2=0;
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  if(opts.phase==='pass')recordPass(s,forbidden);
  const played=publicPlayed(s);
  s=r.stepRound(s,(o,st)=>{
   if(p!==seat)return chooseBy(bot,o,{seed,turns:st.turns,player:p});
   if(o.actions.length>1)choices++;
   const rows=posteriorRows(o,st,played,forbidden);
   const uniform=choosePublic(rows.rows.map(x=>({...x,prob:x.uniformPass})),true).action;
   const history=choosePublic(rows.rows,true).action;
   if(o.actions.length>1&&key(uniform)!==key(history)){changed++;if(st.hands[(p+1)%3].length<=2)changesAtNext2++;}
   return policy==='history'?history:uniform;
  });
 }
 if(!s.outcome)throw Error('turn limit '+seed);
 return{win:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
  pips:e.pipSum(s.hands[seat]),block:+(s.outcome.kind==='block'),turns:s.turns,
  minus:s.outcome.kind==='finish'&&s.outcome.playerIndex===seat?s.outcome.minus:0,
  endDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,changed,choices,changesAtNext2};
}
function blank(){return{wins:[],pips:[],blocks:[],turns:[],endDoubles:[],minus:{'-10':0,'-20':0,'-30':0,'-40':0},changed:0,choices:0,changesAtNext2:0};}
function add(s,x){for(const k of ['pips','blocks','turns','endDoubles'])s[k].push(x[k]);s.wins.push(x.win);if(x.minus<0)s.minus[String(x.minus)]++;s.changed+=x.changed;s.choices+=x.choices;s.changesAtNext2+=x.changesAtNext2;}
function summary(x){return{appearances:x.wins.length,finishFirstRate:mean(x.wins),meanRemainder:mean(x.pips),medianRemainder:med(x.pips),
 blockRate:mean(x.blocks),meanTurns:mean(x.turns),meanEndingDoubles:mean(x.endDoubles),minus:x.minus,
 changedVsUniform:x.changed,choices:x.choices,changesAtNext2:x.changesAtNext2};}
function ci(x){const n=x.length,m=mean(x),se=Math.sqrt(x.reduce((a,v)=>a+(v-m)**2,0)/(n-1)/n);return{delta:m,ci95:[m-1.96*se,m+1.96*se],seedClusters:n};}
function run(start=2026300,count=300){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count>2000)throw Error('invalid range');
 const paired={};let rounds=0;
 for(const bot of BOTS){
  const h=blank(),u=blank(),winSeed=[],pipSeed=[];
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('init '+seed);
   const w=[],p=[];
   for(let seat=0;seat<3;seat++){
    const a=play(base,seed,seat,'history',bot),b=play(base,seed,seat,'uniform',bot);
    add(h,a);add(u,b);w.push(a.win-b.win);p.push(a.pips-b.pips);rounds+=2;
   }
   winSeed.push(mean(w));pipSeed.push(mean(p));
  }
  paired[bot]={history:summary(h),uniform:summary(u),finishDelta:ci(winSeed),pipDelta:ci(pipSeed)};
 }
 const mixed={},allMixed=historyTournament(start,count).arms;
 for(const bot of BOTS){
  const x=allMixed.find(a=>a.strategies[2]===bot);
  if(!x)throw Error('missing mixed arm '+bot);
  if(x.unresolved||x.rounds!==count*3)throw Error('mixed outcome mismatch');
  rounds+=x.rounds;
  mixed[bot]={rounds:x.rounds,blocks:x.blocks,meanTurns:x.meanTurns,
   history:x.byStrategy['public-history-pass'],uniform:x.byStrategy['public-next-pass'],
   descriptiveFinishDelta:x.byStrategy['public-history-pass'].finishFirstRate-x.byStrategy['public-next-pass'].finishFirstRate};
 }
 return{schema:'qosa-pass-history-fixed-opponents/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',seedRange:[start,start+count-1],uniqueDeals:count,rounds,unresolved:0,
  paired,mixed,design:'Paired focal policies face two identical fixed bots on same seed and focal seat. Mixed tournament is a different opponent composition, not a causal history estimate.',
  limitations:'Pass-only posterior; deterministic bots; provisional branch rules; block winner unassigned; no 101 scoring; exploratory seed-cluster CIs. All counts separate from historical baseline.'};
}
function test(){const a=run(2026300,2),b=run(2026300,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==36||a.unresolved)throw Error('deterministic replay');
 for(const bot of BOTS)if(a.paired[bot].history.appearances!==6||a.mixed[bot].rounds!==6)throw Error('seat accounting');
 return{passed:true,rounds:a.rounds};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2026300),+(a[1]||300)),null,2));}
module.exports={run,test,play};
