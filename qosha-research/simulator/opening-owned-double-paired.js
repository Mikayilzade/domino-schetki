'use strict';
// Exact one-ply paired owned-double vs unowned-double comparison on dealt 3x9 openings.
// Node 22: node qosha-research/simulator/opening-owned-double-paired.js [startSeed] [dealCount] [worldStart] [worldCount]
// This is NOT a full-game strategy comparison; late-arrival branches and block scoring remain unvalidated.
const run=function run(start=2120000,count=60000,worldStart=2180000,worldCount=20000){
  const deck=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)deck.push([a,b]);
  const key=t=>t[0]+'-'+t[1], otherEnd=t=>t[0]===1?t[1]:t[0];
  const C=(n,k)=>{if(k<0||k>n)return 0;let v=1;for(let i=1;i<=k;i++)v=v*(n-i+1)/i;return Math.round(v);};
  const randGen=seed=>{let z=(seed>>>0)+0x9e3779b9;z=Math.imul(z^(z>>>16),0x21f0aaad);z=Math.imul(z^(z>>>15),0x735a2d97);z=(z^(z>>>15))>>>0||0x9e3779b9;return()=>{z^=z<<13;z^=z>>>17;z^=z<<5;return(z>>>0)/4294967296;};};
  const shuffle=(arr,seed)=>{const a=arr.slice(),rand=randGen(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
  const deal=seed=>{const a=shuffle(deck,seed);return{hands:[a.slice(0,9),a.slice(9,18),a.slice(18,27)],stock:a[27]};};
  const pPass=(c,own)=>C(18-(6-c+(own?0:1)),9)/C(18,9);
  const canReply=(h,x)=>h.some(t=>t[0]===1||t[1]===1||(t[0]===x&&t[1]===x));
  const stats={seeds:[start,start+count-1],deals:count,reshuffles:0,valid:0,forcedStarterPass:0,oneChoice:0,multipleChoice:0,pairedHands:0,pairedCandidatePairs:0,ownedCandidateHands:0,unownedCandidateHands:0,byConnectors:Array.from({length:7},(_,c)=>({c,valid:0,paired:0,passOwn:pPass(c,true),passUnowned:pPass(c,false),pairedPipCostSum:0,pairedPassLiftSum:0})),pipCostSum:0,pipCostPositive:0,pipCostNegative:0,pipCostZero:0,passOwnSum:0,passUnownedSum:0,passLiftSum:0};
  const paired=[];
  for(let seed=start;seed<start+count;seed++){
    const d=deal(seed),all=d.hands.flat().concat([d.stock]);
    if(new Set(all.map(key)).size!==28)throw Error('deck uniqueness');
    if(key(d.stock)==='1-1'){stats.reshuffles++;continue;}
    const starter=d.hands.find(h=>h.some(t=>key(t)==='1-1'));
    if(!starter)throw Error('starter missing');
    const hand=starter.filter(t=>key(t)!=='1-1').concat([d.stock]),keys=new Set(hand.map(key));
    if(hand.length!==9||keys.size!==9)throw Error('post-draw hand');
    stats.valid++;
    const connectors=hand.filter(t=>t[0]===1||t[1]===1),c=connectors.length;
    stats.byConnectors[c].valid++;
    if(c===0){stats.forcedStarterPass++;continue;}
    if(c===1)stats.oneChoice++;else stats.multipleChoice++;
    const owned=connectors.filter(t=>{const x=otherEnd(t);return keys.has(x+'-'+x);}).map(otherEnd);
    const unowned=connectors.filter(t=>{const x=otherEnd(t);return !keys.has(x+'-'+x);}).map(otherEnd);
    if(owned.length)stats.ownedCandidateHands++;
    if(unowned.length)stats.unownedCandidateHands++;
    if(!owned.length||!unowned.length)continue;
    const xOwn=Math.min(...owned),xUnowned=Math.min(...unowned),cost=xOwn-xUnowned;
    const ownPass=pPass(c,true),unPass=pPass(c,false),lift=ownPass-unPass;
    stats.pairedHands++;stats.pairedCandidatePairs+=owned.length*unowned.length;
    stats.byConnectors[c].paired++;stats.byConnectors[c].pairedPipCostSum+=cost;stats.byConnectors[c].pairedPassLiftSum+=lift;
    stats.pipCostSum+=cost;stats.pipCostPositive+=+(cost>0);stats.pipCostNegative+=+(cost<0);stats.pipCostZero+=+(cost===0);
    stats.passOwnSum+=ownPass;stats.passUnownedSum+=unPass;stats.passLiftSum+=lift;
    if(paired.length<1000)paired.push({seed,hand,unknown:deck.filter(t=>key(t)!=='1-1'&&!keys.has(key(t))),c,xOwn,xUnowned,ownPass,unPass});
  }
  if(paired.length!==1000)throw Error('too few paired hands');
  const brute=[];
  for(const pos of paired.slice(0,4)){
    const a=pos.unknown;if(a.length!==18)throw Error('unknown pool size');
    let n=0,passOwn=0,passUnowned=0;const pick=[];
    const visit=s=>{
      if(pick.length===9){n++;const h=pick.map(i=>a[i]);passOwn+=+(!canReply(h,pos.xOwn));passUnowned+=+(!canReply(h,pos.xUnowned));return;}
      for(let i=s;i<=18-(9-pick.length);i++){pick.push(i);visit(i+1);pick.pop();}
    };visit(0);
    if(n!==48620||passOwn!==Math.round(pos.ownPass*n)||passUnowned!==Math.round(pos.unPass*n))throw Error('independent brute mismatch '+pos.seed+' '+JSON.stringify({passOwn,passUnowned,expectedOwn:pos.ownPass*n,expectedUnowned:pos.unPass*n}));
    brute.push({seed:pos.seed,connectors:pos.c,partitions:n,passOwned:passOwn,passUnowned});
  }
  for(let i=0;i<100;i++){const a=deal(start+i),b=deal(start+i);if(JSON.stringify(a)!==JSON.stringify(b))throw Error('deal replay');const h=shuffle(deck,worldStart+i);if(JSON.stringify(h)!==JSON.stringify(shuffle(deck,worldStart+i)))throw Error('world replay');}
  const world={seeds:[worldStart,worldStart+worldCount-1],allocations:worldCount,positions:1000,worldsPerPosition:worldCount/1000,passOwned:0,passUnowned:0,expectedOwned:0,expectedUnowned:0,expectedLift:0,varianceOwned:0,varianceUnowned:0,varianceLift:0,violations:0};
  for(let i=0;i<worldCount;i++){
    const pos=paired[Math.floor(i/(worldCount/1000))],opp=shuffle(pos.unknown,worldStart+i).slice(0,9);
    const a=!canReply(opp,pos.xOwn),b=!canReply(opp,pos.xUnowned);
    world.passOwned+=+a;world.passUnowned+=+b;world.violations+=+(!a&&b);
    world.expectedOwned+=pos.ownPass;world.expectedUnowned+=pos.unPass;world.expectedLift+=pos.ownPass-pos.unPass;
    world.varianceOwned+=pos.ownPass*(1-pos.ownPass);world.varianceUnowned+=pos.unPass*(1-pos.unPass);
    const diff=pos.ownPass-pos.unPass;world.varianceLift+=diff*(1-diff);
  }
  world.zOwned=(world.passOwned-world.expectedOwned)/Math.sqrt(world.varianceOwned);
  world.zUnowned=(world.passUnowned-world.expectedUnowned)/Math.sqrt(world.varianceUnowned);
  world.zLift=((world.passOwned-world.passUnowned)-world.expectedLift)/Math.sqrt(world.varianceLift);
  if(world.violations||Math.max(Math.abs(world.zOwned),Math.abs(world.zUnowned),Math.abs(world.zLift))>5)throw Error('paired-world calibration failed');
  const summary={pairedShareValid:stats.pairedHands/stats.valid,pairedSharePlayable:stats.pairedHands/(stats.valid-stats.forcedStarterPass),meanPassOwned:stats.passOwnSum/stats.pairedHands,meanPassUnowned:stats.passUnownedSum/stats.pairedHands,meanPassLift:stats.passLiftSum/stats.pairedHands,meanMinCandidatePipCost:stats.pipCostSum/stats.pairedHands,pipCostPositiveShare:stats.pipCostPositive/stats.pairedHands};
  return {schema:'qosha-opening-owned-double-paired/v1',timestampAsiaBaku:'2026-10-28T08:50:09+04:00',engine:'qosa-research-0.5.3 deal kernel + opening-owned-double-paired-1.0',rules:'recovered qosa-1.0.0, first-round 1-1 with stock draw; one-ply four-branch lock only',strategies:'matched candidate 1-X with own X-X vs 1-Y with unseen Y-Y; minimum-X representative per group; no game policy',fullModelRounds:0,forcedContinuations:0,stats,summary,world,tests:{passed:true,independentBrute:brute,seedReplay:100,deckConservation:count,formula:'C(18 - (6-c + indicator(X-X unseen)),9)/C(18,9)'},finding:'Owning X-X removes one possible opponent reply after 1-X; paired pass advantage is exact, but its pip cost and future win impact are not resolved.',limitations:['No future win-rate inference or branch-late-arrival rule assumed','Uniform unseen worlds; next player pass only; no opponent strategy modeling','Paired candidates chosen as minimum pip X within each class; descriptive deal frequencies','No Node CLI execution; V8 tests and exhaustive four-hand check only'],nextAction:'Test the observed immediate-pass advantage against 2-turn opponent response and retained X-X tempo under both explicitly provisional branch models, using matched deals; authenticate late-arrival branch opening and block ties before win claims.'};
};
if(typeof require!=='undefined' && require.main===module){const a=process.argv.slice(2).map(Number);console.log(JSON.stringify(run(a[0]||2120000,a[1]||60000,a[2]||2180000,a[3]||20000),null,2));}
module.exports={run};
