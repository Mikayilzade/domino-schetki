'use strict';
// Reproduce: node qosha-research/simulator/connector-lock-control.js test
// node qosha-research/simulator/connector-lock-control.js 1315640 1200 12 64
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver');
const init=require('./initializer'),{chooseBy}=require('./strategy-runner');
const deck=e.createDoubleSixDeck(),profiles=['min-hand-pips','closed-branch-control'],numbers=[3,5];
const mean=a=>a.reduce((s,x)=>s+x,0)/a.length;
const key=a=>[a.type,a.side||'',a.to??'',(a.numbers||[]).join(','),(a.tiles||[a.tile].filter(Boolean)).map(e.tileKey).join(',')].join('|');
const played=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
function collect(start,count,cap){
 const positions=[],scanned={};
 for(const profile of profiles){
  const hits={3:0,5:0};let scannedSeeds=0;
  outer:for(let seed=start;seed<start+count;seed++){
   const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});
   if(base.kind!=='ready')throw Error('initializer');scannedSeeds++;
   for(let seat=0;seat<3;seat++){
    let s=r.cloneRoundState(base),picked=false;
    const live=new Set([...base.hands.flat(),...base.stock].map(e.tileKey));
    const known=deck.filter(t=>!live.has(e.tileKey(t))),forbidden=[new Set(),new Set(),new Set()];
    while(!s.outcome&&s.turns<200){
     const p=s.currentPlayer,o=d.turnOptions(s.branchState,s.openingState,s.hands[p],s.stock);
     if(o.phase==='pass'&&!s.stock.length){
      for(const t of deck)if(d.actionsForHand(s.branchState,s.openingState,[t]).length)forbidden[p].add(e.tileKey(t));
      if(s.hands[p].some(t=>forbidden[p].has(e.tileKey(t))))throw Error('pass contradiction');
     }
     if(!picked&&p===seat&&o.phase==='play'&&(forbidden[(p+1)%3].size||forbidden[(p+2)%3].size)){
      const choices=[];
      for(const n of numbers){
       if(hits[n]>=cap)continue;
       const open=o.actions.find(a=>a.type==='double-sequence'&&a.numbers.length===1&&a.numbers[0]===n);
       if(!open)continue;
       const connectors=o.actions.filter(a=>a.type==='single'&&a.tile.includes(n));
       const others=o.actions.filter(a=>a.type==='single'&&!a.tile.includes(n));
       const pairs=[];
       for(const a of connectors)for(const b of others)if(a.side===b.side)
        pairs.push({a,b,gap:Math.abs(e.pipSum([a.tile])-e.pipSum([b.tile]))});
       pairs.sort((x,y)=>x.gap-y.gap||key(x.a).localeCompare(key(y.a))||key(x.b).localeCompare(key(y.b)));
       if(pairs.length)choices.push({n,open,...pairs[0]});
      }
      choices.sort((a,b)=>hits[a.n]-hits[b.n]||a.n-b.n);
      if(choices.length){
       const x=choices[0];positions.push({profile,number:x.n,seed,seat,turn:s.turns,
        state:r.cloneRoundState(s),known:known.map(t=>t.slice()),forbidden:forbidden.map(z=>[...z]),
        open:key(x.open),connector:key(x.a),nonconnector:key(x.b),
        pipGap:e.pipSum([x.a.tile])-e.pipSum([x.b.tile]),side:x.a.side,
        remainingConnectors:s.hands[seat].filter(t=>t[0]!==t[1]&&t.includes(x.n)).length-1});
       hits[x.n]++;picked=true;
      }
     }
     const action=o.phase==='play'?chooseBy(profile,o):null;
     s=r.stepRound(s,()=>action);if(action)known.push(...played(action));
    }
    if(!s.outcome)throw Error('discovery unresolved');
   }
   if(numbers.every(n=>hits[n]>=cap))break outer;
  }
  if(numbers.some(n=>hits[n]<cap))throw Error('quota not met '+profile+' '+JSON.stringify(hits));
  scanned[profile]={seedsScanned:scannedSeeds,positions:hits};
 }
 return {positions,scanned};
}
function comb(n,k){if(k<0||k>n)return 0;let z=1;for(let i=1;i<=k;i++)z=z*(n-k+i)/i;return Math.round(z);}
function worlds(p,limit){
 const n=(p.seat+1)%3,o=(p.seat+2)%3;
 const visible=[...p.known,...p.state.hands[p.seat]],seen=new Set(visible.map(e.tileKey));
 if(visible.length!==seen.size)throw Error('duplicate visible');
 const pool=deck.filter(t=>!seen.has(e.tileKey(t))),mustN=[],mustO=[],flex=[];
 for(const t of pool){const z=e.tileKey(t),a=p.forbidden[n].includes(z),b=p.forbidden[o].includes(z);
  if(a&&b)throw Error('incompatible pass');
  if(a)mustO.push(t);else if(b)mustN.push(t);else flex.push(t);}
 const take=p.state.hands[n].length-mustN.length,support=comb(flex.length,take);
 if(take<0||take>flex.length||mustO.length+flex.length-take!==p.state.hands[o].length)throw Error('hand sizes');
 const out=[],seenWorld=new Set();
 function add(idx){
  const picked=new Set(idx),w=r.cloneRoundState(p.state);
  w.hands[n]=mustN.concat(idx.map(i=>flex[i]));
  w.hands[o]=mustO.concat(flex.filter((_,i)=>!picked.has(i)));
  const fp=w.hands[n].map(e.tileKey).sort().join(',');
  if(seenWorld.has(fp))return;seenWorld.add(fp);
  const all=[...p.known,...w.hands.flat()].map(e.tileKey);
  if(all.length!==28||new Set(all).size!==28)throw Error('deck');
  for(const seat of [n,o])for(const t of w.hands[seat])
   if(p.forbidden[seat].includes(e.tileKey(t)))throw Error('forbidden');
  out.push(w);
 }
 if(support<=limit){
  function rec(start,k,chosen){if(!k){add(chosen);return;}
   for(let i=start;i<=flex.length-k;i++)rec(i+1,k-1,[...chosen,i]);}
  rec(0,take,[]);
 }else{
  for(let i=0;out.length<limit&&i<50000;i++){
   let x=e.mixSeed32((p.seed^Math.imul(p.turn+1,0x9e3779b9)^Math.imul(p.seat+1,0x85ebca6b)^Math.imul(i+1,0xc2b2ae35))>>>0)||0x9e3779b9;
   const rand=()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};
   const ix=Array.from({length:flex.length},(_,j)=>j);
   for(let j=ix.length-1;j>0;j--){const k=Math.floor(rand()*(j+1));[ix[j],ix[k]]=[ix[k],ix[j]];}
   add(ix.slice(0,take));
  }
 }
 if(out.length!==Math.min(support,limit))throw Error('world diversity');
 return {support,exact:support<=limit,states:out};
}
function rollout(w,actionKey,policy,seat){
 const opts=d.turnOptions(w.branchState,w.openingState,w.hands[seat],w.stock);
 const action=opts.actions.find(a=>key(a)===actionKey);if(!action)throw Error('missing candidate');
 const after=r.stepRound(w,()=>action);
 const next=after.outcome?null:d.turnOptions(after.branchState,after.openingState,after.hands[after.currentPlayer],after.stock);
 const end=after.outcome?after:r.runRound(after,x=>chooseBy(policy,x),{maxTurns:200});
 if(!end.outcome||end.outcome.kind==='unresolved')throw Error('rollout unresolved');
 return {win:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat),
  pips:e.pipSum(end.hands[seat]),minus:+(end.outcome.kind==='finish'&&end.outcome.playerIndex===seat&&end.outcome.minus<0),
  block:+(end.outcome.kind==='block'),nextPass:next?+(next.phase==='pass'):0,
  nextActions:next?next.actions.length:0};
}
function ci(rows,field){
 if(rows.length<2)return null;
 const m=mean(rows.map(x=>x[field])),groups=new Map();
 for(const x of rows){const a=groups.get(x.seed)||[];a.push(x[field]);groups.set(x.seed,a);}
 if(groups.size<2)return null;
 let sq=0;for(const a of groups.values())sq+=Math.pow(a.reduce((s,v)=>s+v-m,0),2);
 const se=Math.sqrt(groups.size/(groups.size-1)*sq/(rows.length*rows.length));
 return [100*(m-3*se),100*(m+3*se)];
}
function run(start=1315640,count=1200,cap=12,limit=64){
 const found=collect(start,count,cap),rows=[];let totalWorlds=0,exactPositions=0;
 for(const p of found.positions){
  const frozen=JSON.stringify(p.state),w=worlds(p,limit);
  totalWorlds+=w.states.length;if(w.exact)exactPositions++;
  for(const policy of profiles){
   const a={open:[],connector:[],nonconnector:[]};
   for(const state of w.states)for(const k of Object.keys(a))a[k].push(rollout(state,p[k],policy,p.seat));
   const avg=(k,f)=>mean(a[k].map(z=>z[f])),delta=(x,y,f)=>avg(x,f)-avg(y,f);
   rows.push({discoveryProfile:p.profile,continuationPolicy:policy,number:p.number,
    seed:p.seed,seat:p.seat,turn:p.turn,side:p.side,hand:p.state.hands[p.seat].map(e.tileKey),
    open:p.open,connector:p.connector,nonconnector:p.nonconnector,
    pipGap:p.pipGap,remainingConnectors:p.remainingConnectors,support:w.support,
    exact:w.exact,uniqueWorlds:w.states.length,
    connectorMinusNonWin:delta('connector','nonconnector','win'),
    connectorMinusNonPips:delta('connector','nonconnector','pips'),
    connectorMinusNonMinus:delta('connector','nonconnector','minus'),
    connectorMinusNonBlock:delta('connector','nonconnector','block'),
    connectorMinusNonNextPass:delta('connector','nonconnector','nextPass'),
    connectorMinusNonNextActions:delta('connector','nonconnector','nextActions'),
    connectorMinusOpenWin:delta('connector','open','win'),
    nonMinusOpenWin:delta('nonconnector','open','win')});
  }
  if(JSON.stringify(p.state)!==frozen)throw Error('visible mutated');
 }
 const summaries=[];
 for(const discoveryProfile of profiles)for(const number of numbers)for(const continuationPolicy of profiles){
  const a=rows.filter(x=>x.discoveryProfile===discoveryProfile&&x.number===number&&x.continuationPolicy===continuationPolicy);
  if(a.length!==cap)throw Error('stratum quota');
  summaries.push({discoveryProfile,number,continuationPolicy,positions:a.length,
   distinctSeeds:new Set(a.map(x=>x.seed)).size,
   connectorMinusNonWinPP:100*mean(a.map(x=>x.connectorMinusNonWin)),
   exploratorySeedClusterCI95PP:ci(a,'connectorMinusNonWin'),
   connectorMinusNonNextPassPP:100*mean(a.map(x=>x.connectorMinusNonNextPass)),
   connectorMinusNonPips:mean(a.map(x=>x.connectorMinusNonPips)),
   connectorMinusOpenWinPP:100*mean(a.map(x=>x.connectorMinusOpenWin)),
   nonMinusOpenWinPP:100*mean(a.map(x=>x.nonMinusOpenWin)),
   meanPipGap:mean(a.map(x=>x.pipGap)),
   retainedOtherConnectorPositions:a.filter(x=>x.remainingConnectors>0).length});
 }
 const overall=profiles.map(continuationPolicy=>{
  const a=rows.filter(x=>x.continuationPolicy===continuationPolicy);
  return {continuationPolicy,positions:a.length,distinctSeeds:new Set(a.map(x=>x.seed)).size,
   connectorMinusNonWinPP:100*mean(a.map(x=>x.connectorMinusNonWin)),
   exploratorySeedClusterCI95PP:ci(a,'connectorMinusNonWin'),
   connectorMinusNonNextPassPP:100*mean(a.map(x=>x.connectorMinusNonNextPass)),
   connectorMinusNonPips:mean(a.map(x=>x.connectorMinusNonPips)),
   connectorMinusOpenWinPP:100*mean(a.map(x=>x.connectorMinusOpenWin)),
   nonMinusOpenWinPP:100*mean(a.map(x=>x.nonMinusOpenWin)),
   meanPipGap:mean(a.map(x=>x.pipGap))};
 });
 return {schema:'qosa-connector-lock-control/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',
  mode:'3x9',startSeed:start,endSeed:start+count-1,scanned:found.scanned,
  selectedPositions:found.positions.length,exactPositions,uniqueHiddenWorlds:totalWorlds,
  forcedCounterfactualContinuations:totalWorlds*6,worldLimit:limit,capPerNumberAndDiscoveryProfile:cap,
  comparison:'same-side connector X-Y vs nonconnector U-Y while X-X also openable; three forced actions on identical pass-constrained hidden worlds, crossed continuation bots',
  structuralConstraint:'equal pip sums impossible for X-Y versus U-Y on same side when U!=X',
  limitations:'Selected first eligible positions, different pip removal and resulting branch endpoints, provisional branch rules, deterministic bots, no block winner, no prior action likelihood; exploratory seed-cluster intervals.',
  overall,summaries,rows};
}
function test(){
 const a=run(1315640,500,1,4),b=run(1315640,500,1,4);
 if(JSON.stringify(a)!==JSON.stringify(b)||a.selectedPositions!==4||
 a.forcedCounterfactualContinuations!==a.uniqueHiddenWorlds*6||
 a.rows.some(x=>!Number.isFinite(x.connectorMinusNonWin)||x.pipGap===0))
 throw Error('deterministic paired regression');
 return {passed:true,positions:a.selectedPositions,worlds:a.uniqueHiddenWorlds};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():
 run(+(a[0]||1315640),+(a[1]||1200),+(a[2]||12),+(a[3]||64)),null,2));}
module.exports={collect,worlds,rollout,run,test};
