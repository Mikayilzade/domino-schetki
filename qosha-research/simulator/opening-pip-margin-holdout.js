'use strict';
// Independent holdout: immediate pip sacrifice versus opponents' pip shedding in the next two turns. No full-game scoring claims.
// node qosha-research/simulator/opening-cost-matched.js [dealStart] [dealCount] [worldStart] [worldsPerPosition] [positionsPerBucket]
const run=function run(ds=2855320,dn=30000,ws=2885320,wpp=32,perBucket=300){
 const check=(v,m)=>{if(!v)throw Error('opening-cost-matched: '+m);};
 const key=t=>Math.min(...t)+'-'+Math.max(...t),pip=t=>t[0]+t[1],other=t=>t[0]===1?t[1]:t[0];
 const deck=[];for(let a=0;a<7;a++)for(let b=a;b<7;b++)deck.push([a,b]);
 const rng=seed=>{let s=(seed>>>0)+0x9e3779b9;s=Math.imul(s^(s>>>16),0x21f0aaad);s=Math.imul(s^(s>>>15),0x735a2d97);s=(s^(s>>>15))>>>0||0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/4294967296;};};
 const shuffle=(src,seed)=>{const a=src.slice(),r=rng(seed);for(let i=a.length-1;i>0;i--){let j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
 const C=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
 const init=x=>({ends:[x,1,1,1],locks:[true,false,false,false],opened:[1]});
 function legal(b,h){const out=[];for(let i=0;i<h.length;i++)for(let side=0;side<4;side++){const t=h[i],v=b.ends[side],dbl=t[0]===t[1];if(dbl&&t[0]===v)out.push({i,side,t,dbl,to:v});else if(!dbl&&!b.locks[side]&&(t[0]===v||t[1]===v))out.push({i,side,t,dbl,to:t[0]===v?t[1]:t[0]});}return out;}
 function apply(b,a,global){const n={ends:b.ends.slice(),locks:b.locks.slice(),opened:b.opened.slice()};if(a.dbl){if(!n.opened.includes(a.to))n.opened.push(a.to);if(global){for(let s=0;s<4;s++)if(n.ends[s]===a.to)n.locks[s]=false;}else n.locks[a.side]=false;}else{n.ends[a.side]=a.to;n.locks[a.side]=!(global&&n.opened.includes(a.to));}return n;}
 const choose=(as,pol,decisionSeed)=>pol==='random'?as[Math.floor(rng(decisionSeed)()*as.length)]:as.slice().sort((a,b)=>(pol==='high'?pip(b.t)-pip(a.t):pip(a.t)-pip(b.t))||key(a.t).localeCompare(key(b.t))||a.side-b.side)[0];
 function window(x,focal,h1,h2,pol,chain,global,worldSeed){
  let b=init(x),moves=0,extra=0,pass1=0,pass2=0,oppPipsShed=0;
  for(const [seat,hand] of [h1,h2].entries()){
   const h=hand.slice();let a=choose(legal(b,h),pol,worldSeed+seat*104729);
   if(!a){if(seat===0)pass1=1;else pass2=1;continue;}
   let count=0;while(a){b=apply(b,a,global);h.splice(a.i,1);moves++;oppPipsShed+=pip(a.t);if(count>0)extra++;count++;if(!chain||!a.dbl||count>=4)break;a=choose(legal(b,h).filter(q=>q.dbl&&!b.opened.includes(q.to)),pol,worldSeed+seat*104729+count*7919);}
  }
  return{moves,extra,pass1,pass2,oppPipsShed,returnLegal:new Set(legal(b,focal).map(a=>a.i)).size};
 }
 check(deck.length===28&&new Set(deck.map(key)).size===28,'deck');
 check(legal(init(2),[[0,2]]).length===0&&legal(init(2),[[2,2]]).length===1,'locked');
 check(window(2,[],[[1,3]],[[2,2],[3,3]],'high',true,true).moves===3,'chain');
 check(window(2,[],[[1,3],[2,2]],[],'low',true,true).moves===1,'no ordinary append');
 const buckets={'1-2':[],'3+':[]};let reshuffles=0,valid=0,eligible=0,conflict=0;
 for(let seed=ds;seed<ds+dn;seed++){
  const d=shuffle(deck,seed);if(key(d[27])==='1-1'){reshuffles++;continue;}valid++;
  const hands=[d.slice(0,9),d.slice(9,18),d.slice(18,27)],starter=hands.find(h=>h.some(t=>key(t)==='1-1'));
  check(!!starter,'starter');const hand=starter.filter(t=>key(t)!=='1-1').concat([d[27]]);
  const known=new Set(hand.map(key));check(hand.length===9&&known.size===9,'post-draw');
  const con=hand.filter(t=>t[0]!==t[1]&&t.includes(1)).map(other);
  const owned=con.filter(x=>known.has(x+'-'+x)),unowned=con.filter(x=>!known.has(x+'-'+x));
  if(!owned.length||!unowned.length)continue;eligible++;
  const x=Math.max(...owned),y=Math.max(...unowned),gap=y-x;if(gap<=0)continue;conflict++;
  const label=gap<=2?'1-2':'3+';if(buckets[label].length>=perBucket)continue;
  const pool=deck.filter(t=>key(t)!=='1-1'&&!known.has(key(t)));check(pool.length===18,'pool');
  buckets[label].push({seed,hand,pool,x,y,gap,c:con.length});
 }
 check(buckets['1-2'].length===perBucket&&buckets['3+'].length===perBucket,'bucket quotas');
 const positions=buckets['1-2'].concat(buckets['3+']).sort((a,b)=>a.seed-b.seed),fields=['moves','extra','pass1','pass2','returnLegal','oppPipsShed','relativePipMargin'],modes={};
 let expected=0;for(const p of positions){expected+=(C(18-(6-p.c),9)-C(18-(7-p.c),9))/C(18,9);}
 for(const pol of ['high','low','random'])for(const chain of [false,true])for(const global of [true,false]){
  const name=pol+'-'+(chain?'chain':'single')+'-'+(global?'global':'current'),totals={},rows=[],strata={};
  for(const f of fields)totals[f]={owned:0,highPip:0,delta:0};
  for(let i=0;i<positions.length;i++){
   const p=positions[i],fx=p.hand.filter(t=>key(t)!==key([1,p.x])),fy=p.hand.filter(t=>key(t)!==key([1,p.y]));
   check(fx.length===8&&fy.length===8&&fx.some(t=>key(t)===p.x+'-'+p.x)&&!fy.some(t=>key(t)===p.y+'-'+p.y),'actual choices');
   const row={gap:p.gap,bucket:p.gap<=2?'1-2':'3+',c:p.c};for(const f of fields)row[f]=0;
   for(let j=0;j<wpp;j++){
    const u=shuffle(p.pool,ws+i*wpp+j),h1=u.slice(0,9),h2=u.slice(9);
    check(new Set([...p.hand,...u,[1,1]].map(key)).size===28,'conservation');
    const a=window(p.x,fx,h1,h2,pol,chain,global,ws+i*wpp+j),b=window(p.y,fy,h1,h2,pol,chain,global,ws+i*wpp+j);
    const initialOppPips=h1.concat(h2).reduce((s,t)=>s+pip(t),0);
    a.relativePipMargin=initialOppPips-a.oppPipsShed-fx.reduce((s,t)=>s+pip(t),0);
    b.relativePipMargin=initialOppPips-b.oppPipsShed-fy.reduce((s,t)=>s+pip(t),0);
    check(a.relativePipMargin-b.relativePipMargin===-a.oppPipsShed+b.oppPipsShed-p.gap,'margin accounting');
    for(const f of fields){totals[f].owned+=a[f];totals[f].highPip+=b[f];totals[f].delta+=a[f]-b[f];row[f]+=(a[f]-b[f])/wpp;}
   }rows.push(row);
  }
  const N=positions.length*wpp,means={},ci95={};
  for(const f of fields){const mean=totals[f].delta/N,se=Math.sqrt(rows.reduce((s,r)=>s+(r[f]-mean)**2,0)/(rows.length-1)/rows.length);means[f]={owned:totals[f].owned/N,highPip:totals[f].highPip/N,delta:mean};ci95[f]=[mean-1.96*se,mean+1.96*se];}
  for(const bucket of ['1-2','3+']){const rr=rows.filter(r=>r.bucket===bucket);strata[bucket]={positions:rr.length,meanGap:rr.reduce((s,r)=>s+r.gap,0)/rr.length};for(const f of fields)strata[bucket][f+'Delta']=rr.reduce((s,r)=>s+r[f],0)/rr.length;}
  const exactPass=expected/positions.length,z=(means.pass1.delta-exactPass)/Math.sqrt(.5/N);
  check(Math.abs(z)<5,'pass calibration');modes[name]={means,ci95,strata,exactFirstPassDelta:exactPass,passCalibrationConservativeZ:z};
 }
 for(let i=0;i<20;i++)check(JSON.stringify(shuffle(deck,ds+i))===JSON.stringify(shuffle(deck,ds+i)),'replay');
 const modelSensitivity={};for(const pol of ['high','low','random'])for(const ch of ['single','chain']){
  const a=modes[pol+'-'+ch+'-global'],b=modes[pol+'-'+ch+'-current'];
  modelSensitivity[pol+'-'+ch]={movesDeltaDifference:a.means.moves.delta-b.means.moves.delta,returnLegalDeltaDifference:a.means.returnLegal.delta-b.means.returnLegal.delta};
 }
 return{schema:'qosha-opening-pip-margin-holdout/v1',timestampAsiaBaku:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Baku'}).replace(' ','T')+'+04:00',
  engine:'qosa-research-0.5.3+opening-pip-margin-holdout-1.0',rules:'recovered qosa-1.0.0 3x9 first-round 1-1 opening; global-ever-open and all-current-only branch models PROVISIONAL',
  dealSeeds:[ds,ds+dn-1],worldSeeds:[ws,ws+positions.length*wpp-1],deals:dn,valid,reshuffles,eligible,conflict,positions:positions.length,worldsPerPosition:wpp,
  newHiddenAllocations:positions.length*wpp,newCompleteRounds:0,newForcedContinuations:0,
  strategies:['same-hand 1-X with matching X-X held, maximum owned X','same-hand 1-Y highest pip Y, unowned Y-Y, Y>X'],
  opponentPolicies:['highest-pip, lowest-pip, seeded random legal; single tile or optional greedy/seeded double chain (max 4)'],
  positionSelection:'first 120 eligible conflict hands each for sacrifice 1-2 and 3+; nonrepresentative',immediatePipSacrificeMean:positions.reduce((s,p)=>s+p.gap,0)/positions.length,relativePipMarginDefinition:'sum of two opponents remaining pips minus focal remaining pips, after exactly two opponent turns; positive owned-minus-high means owned connector improved relative pip margin',
  modes,modelSensitivity,tests:{deck28:true,legalLocked:true,doubleChain:true,noOrdinaryAppend:true,conservation:true,seedReplay:20,firstPassCalibrated:true},
  limitations:['Two opponent turns only; no win/minus/complete-game regret','Two branch models are provisional; separately reported','Connector pip and geometry confounded with double ownership','First-eligible seed selection; simplistic deterministic opponent policies','Block ties, loneZero, bust, 101 unresolved'],
  nextAction:'Authenticate physical late-arrival and blocked-tie rules; compare paired full-round first-finish and minus regret on confirmed rules. Test neutral policies and pip-balanced connector controls.'};
};
function test(){const a=run(2855320,500,2885320,8,2),b=run(2855320,500,2885320,8,2);delete a.timestampAsiaBaku;delete b.timestampAsiaBaku;const ok=(v,m)=>{if(!v)throw Error('test: '+m);};ok(JSON.stringify(a)===JSON.stringify(b),'deterministic replay');ok(a.newHiddenAllocations===32&&Object.keys(a.modes).length===12,'sample size and policies');for(const mode of Object.values(a.modes))ok(Math.abs(mode.means.relativePipMargin.delta+mode.means.oppPipsShed.delta+a.immediatePipSacrificeMean)<1e-9,'margin identity');return {passed:true,smallDealSeeds:[2855320,2855819],smallWorldSeeds:[2885320,2885351],pairedWorlds:32,policyModes:12};}
if(typeof require!=='undefined'&&require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(a[0]===undefined?2855320:+a[0],a[1]===undefined?30000:+a[1],a[2]===undefined?2885320:+a[2],a[3]===undefined?32:+a[3],a[4]===undefined?300:+a[4]),null,2));}
if(typeof module!=='undefined')module.exports={run,test};
