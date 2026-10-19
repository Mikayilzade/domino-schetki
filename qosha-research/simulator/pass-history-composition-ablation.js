'use strict';
// Paired focal history ablation against one fixed public-pass opponent and one fixed bot.
// node qosha-research/simulator/pass-history-composition-ablation.js test
// node qosha-research/simulator/pass-history-composition-ablation.js 2026600 200
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const {publicPlayed,choosePublic}=require('./public-pass-tournament');
const {recordPass,posteriorRows}=require('./public-pass-history-tournament');
const BOTS=['closed-branch-control','min-hand-pips'];
const PUBLIC=['public-next-pass','public-history-pass'];
const mean=x=>x.length?x.reduce((a,b)=>a+b,0)/x.length:null;
const median=x=>{const a=[...x].sort((a,b)=>a-b),n=a.length;return n?(n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2):null;};
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
function play(base,seed,seat,focalPolicy,opponents){
 let s=r.cloneRoundState(base),forbidden=[new Set(),new Set(),new Set()];
 let changed=0,choices=0,changesAtNext2=0,passEvents=0;
 const names=[null,null,null];names[seat]=focalPolicy;
 names[(seat+1)%3]=opponents[0];names[(seat+2)%3]=opponents[1];
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  if(opts.phase==='pass'){recordPass(s,forbidden);passEvents++;}
  const played=publicPlayed(s);
  s=r.stepRound(s,(o,st)=>{
   const name=names[p];
   if(name==='closed-branch-control'||name==='min-hand-pips')
    return chooseBy(name,o,{seed,turns:st.turns,player:p});
   const {rows}=posteriorRows(o,st,played,forbidden);
   const uniform=choosePublic(rows.map(x=>({...x,prob:x.uniformPass})),true).action;
   const history=choosePublic(rows,true).action;
   if(p===seat&&o.actions.length>1){
    choices++;
    if(key(uniform)!==key(history)){changed++;if(st.hands[(p+1)%3].length<=2)changesAtNext2++;}
   }
   return name==='public-history-pass'?history:uniform;
  });
 }
 if(!s.outcome)throw Error('turn limit '+seed);
 return{win:+(s.outcome.kind==='finish'&&s.outcome.playerIndex===seat),
  pips:e.pipSum(s.hands[seat]),block:+(s.outcome.kind==='block'),turns:s.turns,
  minus:s.outcome.kind==='finish'&&s.outcome.playerIndex===seat?s.outcome.minus:0,
  endingDoubles:s.hands[seat].filter(t=>t[0]===t[1]).length,
  changed,choices,changesAtNext2,passEvents};
}
function blank(){return{wins:[],pips:[],blocks:[],turns:[],endingDoubles:[],minus:{'-10':0,'-20':0,'-30':0,'-40':0},changed:0,choices:0,changesAtNext2:0,passEvents:0};}
function add(x,z){for(const k of ['pips','blocks','turns','endingDoubles'])x[k].push(z[k]);x.wins.push(z.win);
 if(z.minus<0)x.minus[String(z.minus)]++;for(const k of ['changed','choices','changesAtNext2','passEvents'])x[k]+=z[k];}
function summary(x){return{appearances:x.wins.length,finishFirstRate:mean(x.wins),meanRemainder:mean(x.pips),
 medianRemainder:median(x.pips),blockRate:mean(x.blocks),meanTurns:mean(x.turns),
 meanEndingDoubles:mean(x.endingDoubles),minus:x.minus,
 changedVsUniform:x.changed,choices:x.choices,changesAtNext2:x.changesAtNext2,passEvents:x.passEvents};}
function ci(x){const n=x.length,m=mean(x),se=Math.sqrt(x.reduce((a,v)=>a+(v-m)**2,0)/(n-1)/n);
 return{delta:m,ci95:[m-1.96*se,m+1.96*se],seedClusters:n};}
function run(start=2026600,count=200){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count>2000)throw Error('invalid range');
 const arms=[];let rounds=0;
 for(const bot of BOTS)for(const pub of PUBLIC)for(const publicIsNext of [true,false]){
  const opponents=publicIsNext?[pub,bot]:[bot,pub],h=blank(),u=blank(),winSeed=[],pipSeed=[];
  for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('init '+seed);
   const w=[],p=[];
   for(let seat=0;seat<3;seat++){
    const a=play(base,seed,seat,'public-history-pass',opponents);
    const b=play(base,seed,seat,'public-next-pass',opponents);
    add(h,a);add(u,b);w.push(a.win-b.win);p.push(a.pips-b.pips);rounds+=2;
   }
   winSeed.push(mean(w));pipSeed.push(mean(p));
  }
  arms.push({bot,publicOpponent:pub,publicIsNext,opponents,history:summary(h),uniform:summary(u),
   finishDelta:ci(winSeed),pipDelta:ci(pipSeed)});
 }
 return{schema:'qosa-pass-history-composition-ablation/v1',engine:'qosa-research-0.5.3',
  rules:'qosa-1.0.0',mode:'3x9 later-round',seedRange:[start,start+count-1],
  uniqueDeals:count,rounds,unresolved:0,arms,
  design:'For every seed and focal seat, swap only focal history/uniform policy; keep other seats fixed. Cross public-opponent policy and clockwise order with two bot types.',
  limitations:'Deterministic policies, provisional branch rules, public pass-only inference, no 101 scoring or block winner; exploratory seed-cluster CIs; shared seeds across arms.'};
}
function test(){const a=run(2026600,2),b=run(2026600,2);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==96||a.arms.some(x=>x.history.appearances!==6))throw Error('determinism/seat accounting');
 return{passed:true,rounds:a.rounds,arms:a.arms.length};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2026600),+(a[1]||200)),null,2));}
module.exports={run,test,play};