'use strict';
// Two-cycle Qoşa açdı midgame audit; both branch models PROVISIONAL.
// node qosha-research/simulator/midgame-double-two-cycle.js test
// node qosha-research/simulator/midgame-double-two-cycle.js 2785200 6000 6000
const base=require('./midgame-double-rich');
const assert=(x,m)=>{if(!x)throw Error(m);};
const key=t=>t.join('-'),pips=t=>t[0]+t[1];
const models=['global-ever-open','all-current-only'],opPolicies=['high','low','double-first'],focalPolicies=['high','low'],actions=['single0','single6','chain06'];
function clone(b){return{model:b.model,ends:b.ends.slice(),locks:b.locks.slice(),global:new Set(b.global),bySide:b.bySide.map(x=>new Set(x))};}
function cmp(policy,a,b){if(policy==='double-first'&&a.dbl!==b.dbl)return a.dbl?-1:1;
 const d=policy==='low'?pips(a.t)-pips(b.t):pips(b.t)-pips(a.t);return d||key(a.t).localeCompare(key(b.t))||a.s-b.s;}
function finishSequence(b,h){
 if(!h.length||h.length>4||h.some(t=>t[0]!==t[1]))return null;
 function dfs(bb,hh,seq){if(!hh.length)return seq;
  for(const a of base.legal(bb,hh).filter(x=>x.dbl)){
   const nb=clone(bb),nh=hh.slice();base.place(nb,a);nh.splice(a.i,1);
   const v=dfs(nb,nh,seq.concat([a.t[0]]));if(v)return v;}return null;}
 return dfs(b,h,[]);
}
function turn(b,h,policy){
 const opts=base.legal(b,h).sort((a,c)=>cmp(policy,a,c));
 if(!opts.length)return{played:0,pass:1,mixed:0};
 let a=opts[0],count=0,mixed=0,chain=a.dbl;
 while(a){base.place(b,a);h.splice(a.i,1);count++;
  if(!h.length)break;
  if(!chain){const finish=finishSequence(b,h);
   if(finish)for(const n of finish){const d=base.legal(b,h).find(x=>x.dbl&&x.t[0]===n);
    assert(d,'mixed finish legality');base.place(b,d);h.splice(d.i,1);count++;mixed++;}break;}
  if(count>=4)break;
  a=base.legal(b,h).filter(x=>x.dbl).sort((x,y)=>cmp(policy,x,y))[0]||null;
 }
 return{played:count,pass:0,mixed};
}
function simulate(model,action,w,op,fp,debug=false){
 const f=base.focalAction(model,action),b=f.b,hands=[w.h0.slice(),w.h1.slice(),f.h.slice()];
 const trace=debug?[{stage:'initial',ends:b.ends.slice(),locks:b.locks.slice(),focal:hands[2].map(key)}]:null;
 let oppFirst=0,oppSecond=0,ownResponse=0,ownResponsePass=0,oppPass=0,terminal=null,consecutive=0;
 for(let step=0;step<5;step++){
  const seat=[0,1,2,0,1][step],r=turn(b,hands[seat],seat===2?fp:op);
  if(seat===2){ownResponse=r.played;ownResponsePass=r.pass;}
  else{if(step<2)oppFirst+=r.played;else oppSecond+=r.played;oppPass+=r.pass;}
  consecutive=r.pass?consecutive+1:0;
  if(trace)trace.push({step,seat,played:r.played,pass:r.pass,ends:b.ends.slice(),locks:b.locks.slice(),focal:hands[2].map(key)});
  if(!hands[seat].length){terminal={type:'empty',seat};break;}
  if(consecutive===3){terminal={type:'block'};break;}
 }
 const ownReturnLegal=terminal?null:new Set(base.legal(b,hands[2]).map(x=>x.i)).size;
 return{oppFirst,oppSecond,ownResponse,ownResponsePass,oppPass,ownPlayed:f.played+ownResponse,
  oppPlayed:oppFirst+oppSecond,netStones:f.played+ownResponse-oppFirst-oppSecond,
  ownRemaining:hands[2].length,ownPips:hands[2].reduce((s,t)=>s+pips(t),0),
  ownReturnLegal,ownReturnPass:terminal?null:+(ownReturnLegal===0),
  terminal:terminal?.type||'none',terminalSeat:terminal?.seat??null,...(trace?{trace}:{})};
}
function summarize(worlds,model,op,fp){
 const fields=['oppFirst','oppSecond','ownResponse','ownResponsePass','oppPass','ownPlayed','oppPlayed','netStones','ownRemaining','ownPips','ownReturnLegal','ownReturnPass'];
 const sums=Object.fromEntries(actions.map(a=>[a,Object.fromEntries(fields.map(f=>[f,0]))]));
 const term=Object.fromEntries(actions.map(a=>[a,{emptyFocal:0,emptyOpponent:0,block:0,none:0}]));
 const best=Object.fromEntries(actions.map(a=>[a,0])),regret=Object.fromEntries(actions.map(a=>[a,0]));
 const pairs=Object.fromEntries(['single0','single6'].map(a=>['chain06_vs_'+a,{netBetter:0,netEqual:0,netWorse:0,returnPassDisagree:0}]));
 for(const w of worlds){const rows={};for(const a of actions){const r=simulate(model,a,w,op,fp);rows[a]=r;
  for(const f of fields)if(r[f]!==null)sums[a][f]+=r[f];
  if(r.terminal==='none')term[a].none++;else if(r.terminal==='block')term[a].block++;
  else if(r.terminalSeat===2)term[a].emptyFocal++;else term[a].emptyOpponent++;
 }
 const top=Math.max(...actions.map(a=>rows[a].netStones));
 for(const a of actions){best[a]+=+(rows[a].netStones===top);regret[a]+=top-rows[a].netStones;}
 for(const a of ['single0','single6']){const d=rows.chain06.netStones-rows[a].netStones,p=pairs['chain06_vs_'+a];
  p[d>0?'netBetter':d<0?'netWorse':'netEqual']++;
  if(rows.chain06.ownReturnPass!==null&&rows[a].ownReturnPass!==null&&rows.chain06.ownReturnPass!==rows[a].ownReturnPass)p.returnPassDisagree++;}
 }
 const n=worlds.length,stats={};for(const a of actions){const eligible=term[a].none;
  stats[a]={...Object.fromEntries(fields.map(f=>[f,sums[a][f]/(['ownReturnLegal','ownReturnPass'].includes(f)?(eligible||1):n)])),
   returnEligible:eligible,terminal:term[a],bestNetShare:best[a]/n,meanNetRegret:regret[a]/n};}
 return{n,stats,pairs};
}
function test(){base.test();assert(base.exactWorlds().length===924,'exact partitions');
 for(const m of models){const f=base.focalAction(m,'single0');assert(f.b.locks[1],'optional double stop');
  const chain=base.focalAction(m,'chain06');assert(!chain.b.locks[0]&&!chain.b.locks[1],'double chain');
  for(let i=0;i<50;i++){const w=base.world(2785200+i);assert(JSON.stringify(w)===JSON.stringify(base.world(2785200+i)),'seed replay');
   for(const a of actions)assert(simulate(m,a,w,'high','low').ownRemaining>=0,'hand nonnegative');}}
 const w=base.world(2785200),a=simulate('all-current-only','chain06',w,'high','low',true),b=simulate('all-current-only','single0',w,'high','low',true);
 assert(a.ownReturnPass===1&&b.ownReturnPass===0&&a.trace.length===6&&b.trace.length===6,'future pass counterexample');
 const board=base.init('global-ever-open');board.ends=[1,1,1,1];board.locks=[false,false,false,false];board.global=new Set([1]);
 const h=[[1,4],[4,4]],r=turn(board,h,'high');assert(r.played===2&&r.mixed===1&&h.length===0,'mixed finish');
 const board2=base.init('global-ever-open');board2.ends=[1,1,1,1];board2.locks=[false,false,false,false];board2.global=new Set([1]);
 const h2=[[1,4],[5,5]],r2=turn(board2,h2,'high');assert(r2.played===1&&h2.length===1,'no illegal append');
 return{passed:true,exactPartitions:924,seedReplays:100,models:2,optionalDoubleStop:true,mixedFinish:true,secondReturnCounterexampleSeed:2785200};
}
function run(start=2785200,n1=6000,n2=6000){assert(Number.isInteger(start)&&start>=2785200&&Number.isInteger(n1)&&n1>=1000&&Number.isInteger(n2)&&n2>=1000,'seeds');
 const checks=test(),ex=base.exactWorlds(),c1=Array.from({length:n1},(_,i)=>base.world(start+i)),c2=Array.from({length:n2},(_,i)=>base.world(start+n1+i));
 const modes={};for(const m of models)for(const op of opPolicies)for(const fp of focalPolicies){const k=m+'/'+op+'/'+fp;
  modes[k]={exact:summarize(ex,m,op,fp),cohort1:summarize(c1,m,op,fp),cohort2:summarize(c2,m,op,fp)};}
 return{schema:'qosha-midgame-double-two-cycle/v1',timestampAsiaBaku:'2026-10-28 19:50 +04:00',
  engine:'qosa-research-0.5.3 + midgame-double-two-cycle-1.0',rules:'recovered qosa-1.0.0 3x9; both branch models provisional',
  seedRange:[start,start+n1+n2-1],cohorts:[[start,start+n1-1],[start+n1,start+n1+n2-1]],
  newHiddenAllocations:n1+n2,exactPartitions:924,completeRounds:0,forcedFullGameContinuations:0,
  actions,opponentPolicies:opPolicies,focalContinuationPolicies:focalPolicies,checks,modes,
  metricContract:'netStones=focal initial+response stones minus opponents stones over two cycles; regret=best minus action netStones, NOT win chance; return pass conditional on no early termination',
  limitations:['Synthetic public history and uniform hidden worlds, not conditioned on previous choices','Both branch unlock models provisional','Greedy continuation policies, not human behaviour','Blocks and empty-hand terminals recorded without assigning scores','No full-game win/minus/tie/101 outcome inference'],
  nextAction:'Confirm late-arrival branch unlocking and blocked ties from authentic play before full-game ranking; audit optional multi-double timing.'};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2785200),+(a[1]||6000),+(a[2]||6000)),null,2));}
module.exports={turn,simulate,test,run};
