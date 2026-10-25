'use strict';
// Public-information 6-6 mobility/pass gate, 3x9. Four-branch number-lock PROVISIONAL.
// CLI: node qosha-research/simulator/six-public-response-gate.js test
//      node qosha-research/simulator/six-public-response-gate.js 1558140 1000
const e=require('./engine'),d=require('./turn-dispatcher'),r=require('./round-driver'),i=require('./initializer'),b=require('./strategy-runner');
const deck=e.createDoubleSixDeck(),key=e.tileKey;
const mixes=[['closed-branch-control','closed-branch-control'],['min-hand-pips','min-hand-pips'],['closed-branch-control','min-hand-pips']];
const ts=a=>a.type==='single'?[a.tile]:(a.tiles||[]);
const has6=a=>ts(a).some(t=>t.includes(6));
function after(s,a){return d.applyTurn(s.branchState,s.openingState,s.hands[s.currentPlayer],s.stock,a);}
function mob(x){return new Set(d.actionsForHand(x.branchState,x.openingState,x.hand).flatMap(a=>ts(a).map(key))).size;}
function passChance(unseen,x,k){const n=unseen.length,L=unseen.filter(t=>d.actionsForHand(x.branchState,x.openingState,[t]).length>0).length;
 if(k<0||k>n)throw Error('bad hidden count');let p=1;for(let j=0;j<k;j++)p*=(n-L-j)/(n-j);return Math.max(0,p);}
function select(opts,s,known,signal){
 const f=s.currentPlayer,h=s.hands[f],next=(f+1)%3,other=(f+2)%3;
 const baseline=b.chooseBy('closed-branch-control',opts,{seed:0,turns:s.turns,player:f});
 if(h.length<=3||!h.some(t=>key(t)==='6-6')||h.filter(t=>t[0]!==t[1]&&t.includes(6)).length<2||
  s.hands[next].length<=4||s.hands[other].length<=4||!has6(baseline))return baseline;
 const alt=opts.actions.filter(a=>!has6(a));if(!alt.length)return baseline;
 signal.eligible++;
 const used=new Set([...known,...h.map(key)]),unseen=deck.filter(t=>!used.has(key(t)));
 if(unseen.length!==s.hands[next].length+s.hands[other].length+s.stock.length)throw Error('public tile conservation');
 const initial=after(s,baseline),baseP=passChance(unseen,initial,s.hands[next].length),baseM=mob(initial);
 let best=baseline,pBest=baseP,mBest=baseM;
 for(const a of alt){const x=after(s,a),m=mob(x),p=passChance(unseen,x,s.hands[next].length);
  if(m>=baseM&&p>baseP+0.05&&p>pBest+1e-12){best=a;pBest=p;mBest=m;}
 }
 if(best!==baseline){
  signal.changed++;signal.predicted+=pBest-baseP;signal.mobility+=mBest-baseM;
  const actuallyPass=x=>+!d.actionsForHand(x.branchState,x.openingState,s.hands[next]).length;
  signal.observed+=actuallyPass(after(s,best))-actuallyPass(initial);
 }
 return best;
}
function mean(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:null;}
function median(a){if(!a.length)return null;const z=[...a].sort((x,y)=>x-y),n=z.length;return n%2?z[(n-1)/2]:(z[n/2-1]+z[n/2])/2;}
function ci(a){if(!a.length)return{n:0,mean:null,halfWidth95:null};const m=mean(a),v=a.length>1?mean(a.map(x=>(x-m)**2))*a.length/(a.length-1):0;return{n:a.length,mean:m,halfWidth95:a.length>1?1.96*Math.sqrt(v/a.length):null};}
function summarize(rows){
 const by=new Map();for(const x of rows){if(!by.has(x[0]))by.set(x[0],[]);by.get(x[0]).push(x);}
 const groups=[...by.values()],n=rows.length,sum=j=>rows.reduce((s,x)=>s+x[j],0),changes=sum(7);
 return{observations:n,deals:groups.length,controlFinishRate:mean(rows.map(x=>x[4][0])),
  gateFinishRate:mean(rows.map(x=>x[5][0])),controlPips:mean(rows.map(x=>x[4][1])),
  gatePips:mean(rows.map(x=>x[5][1])),gateMedianPips:median(rows.map(x=>x[5][1])),
  winDeltaPP:ci(groups.map(g=>mean(g.map(x=>100*(x[5][0]-x[4][0]))))),
  pipsDelta:ci(groups.map(g=>mean(g.map(x=>x[5][1]-x[4][1])))),
  minusDeltaPP:ci(groups.map(g=>mean(g.map(x=>100*(x[5][2]-x[4][2]))))),
  blockDeltaPP:ci(groups.map(g=>mean(g.map(x=>100*(x[5][3]-x[4][3]))))),
  eligible:sum(6),changed:changes,predictedPassGainPP:changes?100*sum(8)/changes:null,
  actualNextPassGainPP_DIAGNOSTIC:changes?100*sum(9)/changes:null,
  ownMobilityGain:changes?sum(10)/changes:null};
}
function run(start=1558140,count=1000){
 if(!Number.isInteger(start)||!Number.isInteger(count)||count<2||count%2||count>10000)throw Error('seed args');
 const rows=[],minus={'-10':0,'-20':0,'-30':0,'-40':0};let rounds=0,finishes=0,blocks=0,turns=0;
 for(let seed=start;seed<start+count;seed++){
  const base=i.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(base.kind!=='ready')throw Error('init');
  for(let seat=0;seat<3;seat++)for(let mi=0;mi<3;mi++){
   const outputs=[],signals=[];
   for(let arm=0;arm<2;arm++){
    const profiles=[null,null,null];profiles[seat]=arm?'six-public-response-gate':'closed-branch-control';
    profiles[(seat+1)%3]=mixes[mi][0];profiles[(seat+2)%3]=mixes[mi][1];
    const known=new Set(['1-1']);if(base.openingFollowup)known.add(key(base.openingFollowup.tile));
    const sig={eligible:0,changed:0,predicted:0,observed:0,mobility:0};
    const out=r.runRound(base,(opts,s)=>{
     const p=s.currentPlayer,profile=profiles[p],a=profile==='six-public-response-gate'?select(opts,s,known,sig):
      b.chooseBy(profile,opts,{seed,seat,turns:s.turns,player:p});
     for(const t of ts(a)){const k=key(t);if(known.has(k))throw Error('duplicate played tile');known.add(k);}
     return a;
    },{maxTurns:200});
    rounds++;turns+=out.turns;
    if(out.outcome.kind==='finish'){finishes++;if(out.outcome.minus<0)minus[String(out.outcome.minus)]++;}
    else if(out.outcome.kind==='block')blocks++;else throw Error('unresolved '+seed);
    outputs.push([+(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat),e.pipSum(out.hands[seat]),
      +(out.outcome.kind==='finish'&&out.outcome.playerIndex===seat&&out.outcome.minus<0),+(out.outcome.kind==='block'),
      out.turns,out.hands[seat].filter(t=>t[0]===t[1]).length]);
    signals.push(sig);
   }
   const hand=base.hands[seat],six=hand.some(t=>key(t)==='6-6');
   const category=six?(hand.filter(t=>t[0]!==t[1]&&t.includes(6)).length>=2?2:1):0;
   const sig=signals[1];rows.push([seed,seat,mi,category,outputs[0],outputs[1],sig.eligible,sig.changed,sig.predicted,sig.observed,sig.mobility]);
  }
 }
 const half=start+count/2,summary={};
 for(const [name,fn] of [['discovery',x=>x[0]<half],['holdout',x=>x[0]>=half],['combined',()=>true]]){
  summary[name]={};for(let mi=0;mi<3;mi++){const xs=rows.filter(x=>fn(x)&&x[2]===mi);
   summary[name][mixes[mi].join('+')]={all:summarize(xs),initialSixTwoPlus:summarize(xs.filter(x=>x[3]===2))};
  }
 }
 return{schema:'qosha-six-public-response-gate/v1',timestampAsiaBaku:new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Baku',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'}).format(new Date())+' +04',
  engine:'qosa-research-0.5.3',rules:'recovered qosa-1.0.0 3x9, number-lock PROVISIONAL',
  seedStart:start,seedEnd:start+count-1,deals:count,discovery:[start,half-1],holdout:[half,start+count-1],
  fullRounds:rounds,finishes,blocks,unresolved:0,meanTurns:turns/rounds,minusFinishes:minus,
  strategies:['closed-branch-control','six-public-response-gate'],opponentMixes:mixes,
  rowFormat:'[seed,seat,mix,initialSixCat,control[finish,pips,minus,block,turns,endingDoubles],gate[same],eligible,changed,predictedPassGain,observedPassGainDiagnostic,ownMobilityGain]',
  summary,rows,
  design:'18 full rounds per seeded deal, same initial hands, focal seat and opponent mix for both arms. 3 focal rotations, 3 opponent mixes, two halves; exploratory deal-cluster normal 95% CI uncorrected.',
  hypothesis:'Keep 6-6 plus >=2 6-connectors only when a public unseen-tile next-pass estimator predicts >5pp pass improvement by choosing a non-6 legal move, and focal distinct playable-tile mobility does not fall.',
  limitations:'Provisional number-lock/four-branch model; uniform unseen hands ignores prior actions/pass likelihood. Public estimator excludes already played tiles and focal hand; actual opponent tile identities used only in post-decision diagnostic. Simple fixed bots, correlated seats, subgroup selection, no 101 match/block winner/loneZero/bust scoring. Finish-first is not match victory.',
  next:'Fresh independent seeds if effect robust; if gate too rare, inspect predicted pass/mobility constraints. Authenticate real-game four-branch and block-winner fixtures.'};
}
function test(){
 const x=e.createBranchState([1,1]),o=e.createOpeningState([1]);
 if(Math.abs(passChance([[0,0],[0,1],[1,1],[1,2]],{branchState:x,openingState:o},1)-0.5)>1e-12)throw Error('hypergeometric fixture');
 const a=run(1558140,6),z=run(1558140,6);delete a.timestampAsiaBaku;delete z.timestampAsiaBaku;
 if(JSON.stringify(a)!==JSON.stringify(z)||a.fullRounds!==108||a.rows.length!==54||a.unresolved)throw Error('replay');
 if(a.rows.some(x=>x[7]>x[6]||x[10]<0))throw Error('gate invariant');
 return{passed:true,fixture:'2 of 4 tiles playable, k=1, P(pass)=0.5',replayDeals:6,replayRounds:108};
}
if(require.main===module){const a=process.argv.slice(2);console.log(JSON.stringify(a[0]==='test'?test():run(+(a[0]||1558140),+(a[1]||1000)),null,2));}
module.exports={run,test,select,passChance,mob};
