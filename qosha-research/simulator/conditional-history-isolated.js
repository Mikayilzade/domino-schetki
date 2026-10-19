'use strict';
// Paired focal-player experiment. All policy variants replay the SAME seed, focal seat,
// and two fixed opponent policies; this avoids direct policy competition confounding.
// node qosha-research/simulator/conditional-history-isolated.js test
// node qosha-research/simulator/conditional-history-isolated.js 2025200 1000
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),init=require('./initializer');
const {chooseBy}=require('./strategy-runner');
const {recordPass,posteriorRows}=require('./public-pass-history-tournament');
const {publicPlayed,choosePublic}=require('./public-pass-tournament');
const MODES=['history-all','history-next-2','history-none'];
const OPPONENTS=['closed-branch-control','min-hand-pips'];
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),e.tileKey(a.tile||[0,0])].join(':');
const mean=xs=>xs.reduce((a,b)=>a+b,0)/xs.length;
const median=xs=>{const a=[...xs].sort((x,y)=>x-y),n=a.length;return n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;};
function one(base,seed,focal,opponent,mode){
 let s=r.cloneRoundState(base),changed=0,choices=0,conditionalChoices=0,passes=0;
 const forbidden=[new Set(),new Set(),new Set()];
 while(!s.outcome&&s.turns<200){
  const p=s.currentPlayer,opts=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
  if(opts.phase==='pass'){recordPass(s,forbidden);passes++;}
  const played=publicPlayed(s);
  s=r.stepRound(s,(o,state)=>{
   if(p!==focal)return chooseBy(opponent,o,{seed,rotation:0,turns:state.turns,player:p});
   if(o.actions.length>1)choices++;
   const rows=posteriorRows(o,state,played,forbidden).rows;
   const uniform=choosePublic(rows.map(x=>({...x,prob:x.uniformPass})),true);
   const useHistory=mode==='history-all'||(mode==='history-next-2'&&state.hands[(p+1)%3].length<=2);
   if(useHistory&&state.hands[(p+1)%3].length<=2&&o.actions.length>1)conditionalChoices++;
   const selected=useHistory?choosePublic(rows,true):uniform;
   if(o.actions.length>1&&key(selected.action)!==key(uniform.action))changed++;
   return selected.action;
  });
 }
 if(!s.outcome)throw Error('unresolved seed='+seed+' focal='+focal+' '+mode);
 const winner=s.outcome.kind==='finish'&&s.outcome.playerIndex===focal;
 return{win:+winner,pips:e.pipSum(s.hands[focal]),turns:s.turns,block:+(s.outcome.kind==='block'),
  minus:winner?(s.outcome.minus||0):0,changed,choices,conditionalChoices,passes};
}
function ciCluster(deltas){
 const n=deltas.length,m=mean(deltas),v=deltas.reduce((s,x)=>s+(x-m)**2,0)/(n-1);
 const se=Math.sqrt(v/n);return{delta:m,ci95:[m-1.96*se,m+1.96*se],se};
}
function run(start=2025200,count=1000){
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(count)||count<2||count>20000)throw Error('invalid seed/count');
 const groups={};for(const opponent of OPPONENTS){
  const byMode={};for(const mode of MODES)byMode[mode]={wins:0,pips:[],turns:0,blocks:0,minus:{'-10':0,'-20':0,'-30':0,'-40':0},changed:0,choices:0,conditionalChoices:0,passes:0};
  groups[opponent]={byMode,clusterAllVsNone:[],clusterNext2VsNone:[],clusterAllVsNext2:[],clusterPipsAllVsNone:[]};
 }
 for(let seed=start;seed<start+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
  if(base.kind!=='ready')throw Error('bad initializer seed='+seed);
  for(const opponent of OPPONENTS){
   const batch={};for(const mode of MODES)batch[mode]=[];
   for(let focal=0;focal<3;focal++)for(const mode of MODES){
    const x=one(base,seed,focal,opponent,mode),b=groups[opponent].byMode[mode];
    batch[mode].push(x);b.wins+=x.win;b.pips.push(x.pips);b.turns+=x.turns;b.blocks+=x.block;
    if(x.minus<0)b.minus[String(x.minus)]++;
    b.changed+=x.changed;b.choices+=x.choices;b.conditionalChoices+=x.conditionalChoices;b.passes+=x.passes;
   }
   const g=groups[opponent],avg=(mode,k)=>mean(batch[mode].map(x=>x[k]));
   g.clusterAllVsNone.push(avg('history-all','win')-avg('history-none','win'));
   g.clusterNext2VsNone.push(avg('history-next-2','win')-avg('history-none','win'));
   g.clusterAllVsNext2.push(avg('history-all','win')-avg('history-next-2','win'));
   g.clusterPipsAllVsNone.push(avg('history-all','pips')-avg('history-none','pips'));
  }
 }
 const result={schema:'qosa-conditional-history-isolated/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9 later-round',seedRange:[start,start+count-1],uniqueDeals:count,
  rounds:count*3*MODES.length*OPPONENTS.length,unresolved:0,
  comparison:'Paired focal policy replay against two fixed opponent bots; no head-to-head focal policy interaction',
  uncertainty:'Normal 95% CI clustered by deal seed (three focal seats within each seed); exploratory',
  assumptions:'Provisional branch rules; pass-only posterior, no voluntary move likelihood; no block winner; no 101 score',
  opponents:{}};
 for(const opponent of OPPONENTS){
  const g=groups[opponent],byMode={};
  for(const mode of MODES){const x=g.byMode[mode],n=count*3;byMode[mode]={
   appearances:n,finishFirst:x.wins,finishFirstRate:x.wins/n,meanRemainder:mean(x.pips),
   medianRemainder:median(x.pips),meanTurns:x.turns/n,blockRate:x.blocks/n,
   minus:x.minus,changedVsUniform:x.changed,choices:x.choices,conditionalChoices:x.conditionalChoices,passEvents:x.passes};}
  result.opponents[opponent]={byMode,paired:{allVsNone:ciCluster(g.clusterAllVsNone),
   next2VsNone:ciCluster(g.clusterNext2VsNone),allVsNext2:ciCluster(g.clusterAllVsNext2),
   remainderAllVsNone:ciCluster(g.clusterPipsAllVsNone)}};
 }
 return result;
}
function test(){
 const a=run(2025200,3),b=run(2025200,3);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.rounds!==54||a.unresolved!==0)throw Error('replay');
 for(const v of Object.values(a.opponents)){
  if(v.byMode['history-none'].changedVsUniform!==0)throw Error('uniform policy mismatch');
  if(v.byMode['history-next-2'].changedVsUniform>v.byMode['history-all'].choices)throw Error('count mismatch');
 }
 return{passed:true,rounds:a.rounds,seeds:a.seedRange};
}
if(require.main===module){const args=process.argv.slice(2);console.log(JSON.stringify(args[0]==='test'?test():run(+(args[0]||2025200),+(args[1]||1000)),null,2));}
module.exports={run,test,one,ciCluster};
