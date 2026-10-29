'use strict';
// Exact two-opponent-turn return mobility, same 24 balanced hands as second-reply holdout.
// Node 22: node qosha-research/simulator/opening-third-return-exact.js [test]
const assert=require('assert');
const {selectFixtures}=require('./opening-second-reply-holdout');
const {createDoubleSixDeck,tileKey}=require('./engine');
const deck=createDoubleSixDeck(),pips=t=>t[0]+t[1];
const metrics=['firstPass','secondPass','legalTiles','legalActions','legalDoubles','anyLegal','ownDoubleLegal','nonOneLegal','availableOneEnds'];
function choose(acts,policy){if(!acts.length)return null;let best=acts[0];for(let j=1;j<acts.length;j++){const a=acts[j],d=pips(a.t)-pips(best.t);if((policy==='high'?d>0:d<0)||(d===0&&(tileKey(a.t)<tileKey(best.t)||(tileKey(a.t)===tileKey(best.t)&&a.side<best.side))))best=a;}return best;}
const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
function actions(b,h){const out=[];for(let i=0;i<h.length;i++){const t=h[i],dbl=t[0]===t[1];for(let side=0;side<4;side++){const end=b.ends[side];if(dbl){if(t[0]===end&&!b.opened.includes(end))out.push({i,side,t,dbl,to:end});}else if(!b.locks[side]&&(t[0]===end||t[1]===end))out.push({i,side,t,dbl,to:t[0]===end?t[1]:t[0]});}}return out;}
function apply(b,a,model){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){n.locks[a.side]=false;n.opened.push(a.to);}else{n.ends[a.side]=a.to;n.locks[a.side]=!(model==='global'&&n.opened.includes(a.to));}return n;}
function window(f,h1,h2,choice,policy,model){const x=choice==='own'?f.x:f.y;let b=init(x);const a1=choose(actions(b,h1),policy);if(a1)b=apply(b,a1,model);const a2=choose(actions(b,h2),policy);if(a2)b=apply(b,a2,model);
 const removeKey=tileKey([Math.min(1,x),Math.max(1,x)]),focal=f.hand.filter(t=>tileKey(t)!==removeKey);assert.equal(focal.length,8);
 const acts=actions(b,focal),tiles=new Set(acts.map(a=>a.i)),doubles=new Set(acts.filter(a=>a.dbl).map(a=>a.i));
 const independent=focal.reduce((n,t)=>n+Number(t[0]===t[1]?b.ends.some((e,i)=>b.locks[i]&&e===t[0]&&!b.opened.includes(e)):b.ends.some((e,i)=>!b.locks[i]&&(t[0]===e||t[1]===e))),0);
 assert.equal(tiles.size,independent,'independent return legality mask');
 return{firstPass:+!a1,secondPass:+!a2,legalTiles:tiles.size,legalActions:acts.length,legalDoubles:doubles.size,anyLegal:+(tiles.size>0),ownDoubleLegal:+acts.some(a=>tileKey(a.t)===tileKey([f.x,f.x])),nonOneLegal:+acts.some(a=>!a.t.includes(1)),availableOneEnds:b.ends.filter((e,i)=>e===1&&!b.locks[i]).length};}
function C(n,k){if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);}
function run(){const {selected,validDeals,eligibleDeals}=selectFixtures(2904520,20000,2);assert.equal(selected.length,24);
 const results={};for(const policy of ['high','low'])for(const model of ['global','current']){const r=results[policy+'-'+model]={n:0,own:{},unowned:{},delta:{},perHand:[],passGainMobilityLoss:0};for(const m of metrics)r.own[m]=r.unowned[m]=r.delta[m]=0;}
 for(const f of selected){const known=new Set(['1-1',...f.hand.map(tileKey)]),pool=deck.filter(t=>!known.has(tileKey(t)));assert.equal(known.size,10);assert.equal(pool.length,18);assert.equal(new Set([...known,...pool.map(tileKey)]).size,28);
  const per={};for(const k of Object.keys(results)){per[k]={n:0,delta:{}};for(const m of metrics)per[k].delta[m]=0;}
  const picks=[];function visit(start){if(picks.length===9){const h1=picks.map(i=>pool[i]),ids=new Set(picks),h2=pool.filter((_,i)=>!ids.has(i));for(const policy of ['high','low'])for(const model of ['global','current']){const k=policy+'-'+model,r=results[k],p=per[k],a=window(f,h1,h2,'own',policy,model),b=window(f,h1,h2,'unowned',policy,model);r.n++;p.n++;for(const m of metrics){r.own[m]+=a[m];r.unowned[m]+=b[m];r.delta[m]+=a[m]-b[m];p.delta[m]+=a[m]-b[m];}r.passGainMobilityLoss+=+(a.secondPass>b.secondPass&&a.legalTiles<b.legalTiles);}return;}for(let i=start;i<=18-(9-picks.length);i++){picks.push(i);visit(i+1);picks.pop();}}visit(0);
  for(const [k,p] of Object.entries(per)){assert.equal(p.n,48620);const row={seed:f.seed,c:f.c,x:f.x,y:f.y};for(const m of metrics)row[m]=p.delta[m]/p.n;results[k].perHand.push(row);}
 }
 for(const r of Object.values(results)){assert.equal(r.n,24*48620);for(const m of metrics){r.own[m]/=r.n;r.unowned[m]/=r.n;r.delta[m]/=r.n;}r.passGainMobilityLoss/=r.n;r.positiveHands=r.perHand.filter(x=>x.legalTiles>0).length;r.negativeHands=r.perHand.filter(x=>x.legalTiles<0).length;}
 for(const policy of ['high','low']){const g=results[policy+'-global'],c=results[policy+'-current'];for(const m of metrics)assert(Math.abs(g.delta[m]-c.delta[m])<1e-12,'branch-model delta mismatch '+m);for(const row of g.perHand){const expected=(C(18-(6-row.c),9)-C(18-(7-row.c),9))/48620;assert(Math.abs(row.firstPass-expected)<1e-12);}assert(Math.abs(g.delta.secondPass-(policy==='high'?0.0512186343068696:0.04236425339366516))<1e-10,'previous second-pass regression');}
 return{schema:'qosha-opening-third-return-exact/v1',engine:'qosa-research-0.5.3+opening-third-return-exact-1.0',rules:'first-round 3x9 1-1; opponents play at most one tile; two provisional late-arrival branch models',dealSeedSet:[2904520,2924519],reusedDeals:20000,validDeals,eligibleDeals,selectedHands:24,exactPartitions:24*48620,newDeals:0,newRandomHiddenWorlds:0,newFullRounds:0,newForcedContinuations:0,results};}
function test(){const b=init(2);assert.equal(actions(b,[[0,2]]).length,0);assert.equal(actions(b,[[2,2]]).length,1);assert(actions(apply(b,actions(b,[[2,2]])[0],'global'),[[0,2]]).length);return{passed:true,selected:selectFixtures(2904520,20000,2).selected.length};}
if(require.main===module)console.log(JSON.stringify(process.argv[2]==='test'?test():run(),null,2));
module.exports={run,test};
