'use strict';
// Exact hand-perturbation robustness audit; provisional branch models. Standalone, no scoreboard imports.
// node qosha-research/simulator/double-hand-perturbation.js test
// node qosha-research/simulator/double-hand-perturbation.js 2805200 200
const history=[[[0,1],0],[[1,6],1],[[1,2],2],[[2,2],2],[[1,3],3],[[3,3],3],[[2,4],2],[[4,4],2]],played=[[1,1],[0,1],[1,6],[1,2],[2,2],[1,3],[3,3],[2,4],[4,4]],original=[[0,0],[6,6],[0,2],[1,4],[3,5],[4,5],[5,6]],swaps=[["keep-zero-bridge","0-2","0-3"],["remove-zero-bridge","0-2","2-5"],["add-zero-four","1-4","0-4"],["add-two-three","1-4","2-3"],["add-zero-five","3-5","0-5"],["add-three-six","3-5","3-6"],["add-double-five","4-5","5-5"],["replace-six-link","5-6","0-6"],["remove-six-link","5-6","1-5"],["add-four-six","4-5","4-6"]];
const actions=["single0","single6","chain06"],focalPolicies=["high","low"],opPolicies=["high","low","double-first"],models=["global-ever-open","all-current-only"];
function key(t){return t[0]+"-"+t[1];}

function pips(t){return t[0]+t[1];}

function assert(x,msg){if(!x)throw Error(msg);}

function deck(){const d=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)d.push([a,b]);return d;}

function buildVariant(spec){
 const f=original.map(t=>t.slice());if(spec){const i=f.findIndex(t=>key(t)===spec[1]);assert(i>=2,"swap cannot remove 0-0/6-6");const [a,b]=spec[2].split("-").map(Number);f[i]=[a,b];}
 const used=new Set([...played,...f].map(key));assert(used.size===16,"unique played+focal");const pool=deck().filter(t=>!used.has(key(t)));assert(pool.length===12,"12 unknown tiles");return {name:spec?spec[0]:"baseline",focal:f,pool};
}

function init(model){const b={model,ends:[1,1,1,1],locks:[false,false,false,false],global:new Set([1]),bySide:Array.from({length:4},()=>new Set([1]))};for(const [t,s] of history)place(b,{t,s,dbl:t[0]===t[1]});assert(b.ends.join(",")==="0,6,4,3"&&b.locks.join(",")==="true,true,false,false","history");return b;}

function clone(b){return{model:b.model,ends:b.ends.slice(),locks:b.locks.slice(),global:new Set(b.global),bySide:b.bySide.map(x=>new Set(x))};}

function place(b,a){const n=b.ends[a.s],t=a.t;assert(t[0]===n||t[1]===n,"touch");if(a.dbl){assert(t[0]===t[1]&&t[0]===n,"double match");b.global.add(n);for(let s=0;s<4;s++)if(b.ends[s]===n){b.locks[s]=false;b.bySide[s].add(n);}}else{assert(!b.locks[a.s],"locked");const to=t[0]===n?t[1]:t[0];b.ends[a.s]=to;b.locks[a.s]=b.model==="global-ever-open"?!b.global.has(to):!b.bySide[a.s].has(to);}}

function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let s=0;s<4;s++){const t=h[i],n=b.ends[s],dbl=t[0]===t[1];if(dbl?t[0]===n:!b.locks[s]&&(t[0]===n||t[1]===n))out.push({i,s,t,dbl});}return out;}

function cmp(policy,a,b){if(policy==="double-first"&&a.dbl!==b.dbl)return a.dbl?-1:1;const d=policy==="low"?pips(a.t)-pips(b.t):pips(b.t)-pips(a.t);return d||key(a.t).localeCompare(key(b.t))||a.s-b.s;}

function finishSequence(b,h){if(!h.length||h.length>4||h.some(t=>t[0]!==t[1]))return null;function dfs(bb,hh,seq){if(!hh.length)return seq;for(const a of legal(bb,hh).filter(x=>x.dbl)){const nb=clone(bb),nh=hh.slice();place(nb,a);nh.splice(a.i,1);const found=dfs(nb,nh,seq.concat([a.t[0]]));if(found)return found;}return null;}return dfs(b,h,[]);}

function turn(b,h,policy){let opts=legal(b,h).sort((a,c)=>cmp(policy,a,c));if(!opts.length)return{played:0,pass:1};let a=opts[0],count=0,chain=a.dbl;while(a){place(b,a);h.splice(a.i,1);count++;if(!h.length)break;if(!chain){const f=finishSequence(b,h);if(f)for(const n of f){const d=legal(b,h).find(x=>x.dbl&&x.t[0]===n);assert(d,"mixed finish");place(b,d);h.splice(d.i,1);count++;}break;}if(count>=4)break;a=legal(b,h).filter(x=>x.dbl).sort((x,y)=>cmp(policy,x,y))[0]||null;}return{played:count,pass:0};}

function focalAction(model,action,focal){const b=init(model),h=focal.slice(),seq=action==="single0"?[0]:action==="single6"?[6]:[0,6];for(const n of seq){const a=legal(b,h).find(x=>x.dbl&&x.t[0]===n);assert(a,"focal double action");place(b,a);h.splice(a.i,1);}return{b,h,played:seq.length};}

function simulate(model,action,w,op,fp,focal){const f=focalAction(model,action,focal),b=f.b,hands=[w.h0.slice(),w.h1.slice(),f.h.slice()];let consecutive=0,oppPlayed=0,ownPlayed=f.played,terminal="none";for(const seat of [0,1,2,0,1]){const r=turn(b,hands[seat],seat===2?fp:op);if(seat===2)ownPlayed+=r.played;else oppPlayed+=r.played;consecutive=r.pass?consecutive+1:0;if(!hands[seat].length){terminal="empty";break;}if(consecutive===3){terminal="block";break;}}return{terminal,net:ownPlayed-oppPlayed,secondPass:terminal==="none"?+(legal(b,hands[2]).length===0):null};}

function mix(z){z=(z>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);return(z^(z>>>15))>>>0;}

function world(pool,seed){const a=pool.slice();let z=mix(seed)||0x9e3779b9;for(let i=a.length-1;i>0;i--){z^=z<<13;z^=z>>>17;z^=z<<5;const j=Math.floor((z>>>0)/4294967296*(i+1));[a[i],a[j]]=[a[j],a[i]];}return{h0:a.slice(0,6),h1:a.slice(6)};}

function exactWorlds(pool){const out=[];function rec(start,idx){if(idx.length===6){const ids=new Set(idx);out.push({h0:idx.map(i=>pool[i]),h1:pool.filter((_,i)=>!ids.has(i))});return;}for(let i=start;i<=pool.length-(6-idx.length);i++)rec(i+1,idx.concat(i));}rec(0,[]);return out;}

function audit(variant,worlds){const out={n:worlds.length,plans:{}};for(const a of actions)for(const fp of focalPolicies)out.plans[a+"/"+fp]={safe:0,terminal:0,scenarioPasses:0,netSum:0};for(const w of worlds){for(const a of actions)for(const fp of focalPolicies){const s=out.plans[a+"/"+fp];let safe=true;for(const m of models)for(const op of opPolicies){const r=simulate(m,a,w,op,fp,variant.focal);s.netSum+=r.net;if(r.terminal!=="none"){s.terminal++;safe=false;}else if(r.secondPass){s.scenarioPasses++;safe=false;}}if(safe)s.safe++;}}for(const s of Object.values(out.plans)){s.safeFraction=s.safe/out.n;s.scenarioPassRate=s.scenarioPasses/(out.n*6);s.meanNet=s.netSum/(out.n*6);delete s.netSum;}return out;}

function test(){const variants=[buildVariant(null),...swaps.map(buildVariant)];assert(variants.length===11,"variants");for(const v of variants){assert(exactWorlds(v.pool).length===924,"924");assert(new Set([...played,...v.focal,...v.pool].map(key)).size===28,"28 tiles");for(const m of models)for(const a of actions)assert(focalAction(m,a,v.focal).h.length===7-(a==="chain06"?2:1),"initial action");}const v=variants[0],w=world(v.pool,2785200);assert(JSON.stringify(w)===JSON.stringify(world(v.pool,2785200)),"seed replay");const x=simulate("all-current-only","chain06",w,"high","low",v.focal),y=simulate("all-current-only","single0",w,"high","low",v.focal);assert(x.secondPass===1&&y.secondPass===0,"previous trap");const e=audit(v,exactWorlds(v.pool));assert(e.plans["single0/low"].safe===924&&e.plans["single6/high"].safe===924&&e.plans["chain06/high"].safe===500,"prior exact baseline");return{passed:true,variants:variants.length,partitionsPerVariant:924,previousExactBaseline:[924,924,500],seedTrap:true};}

function run(start=2805200,samplesPerVariant=200){const checks=test(),variants=[buildVariant(null),...swaps.map(buildVariant)],out=[];for(let i=0;i<variants.length;i++){const v=variants[i],exact=audit(v,exactWorlds(v.pool)),samples=audit(v,Array.from({length:samplesPerVariant},(_,j)=>world(v.pool,start+i*samplesPerVariant+j)));out.push({name:v.name,hand:v.focal.map(key),exact,samples});}return{schema:"qosha-double-hand-perturbation/v1",timestampAsiaBaku:"2026-10-28 21:53 +04:00",engine:"qosa-research-0.5.3 + double-hand-perturbation-1.0",rules:"recovered qosa-1.0.0, 3x9, both branch interpretations PROVISIONAL",seedRange:[start,start+variants.length*samplesPerVariant-1],newHiddenAllocations:variants.length*samplesPerVariant,completeRounds:0,forcedContinuations:0,exactPartitionsPerVariant:924,checks,variants:out,metricContract:"Safe: second return has at least one legal stone and no earlier terminal in ALL six model/opponent scenarios for a fixed action plus focal greedy continuation. Synthetic exact 12-choose-6 conditional on each focal hand. Six scenarios are not probabilities.",limitations:["Fixed synthetic public trace, 10 one-tile focal hand perturbations, not authentic game history","Different focal hands change conditional unknown pools; comparisons are structural robustness, not paired causal effect of tile swap","Branch models provisional; opponent/focal policies artificial","No full-round win, minus, block ties, loneZero, 101 scoring claims"],nextAction:"Seek real late-arrival branch and multi-double timing examples; test decision rules across authenticated chronological states and pass-conditioned hidden distributions."};}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||2805200),+(a[1]||200)),null,2));}
module.exports={buildVariant,exactWorlds,simulate,audit,test,run};
