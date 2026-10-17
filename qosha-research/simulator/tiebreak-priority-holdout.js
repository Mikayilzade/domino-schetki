'use strict';
// Matched-deal diagnostic: separate side-label priority, end-number priority,
// and tile priority in otherwise identical primary strategy scoring.
const e=require('./engine'),init=require('./initializer'),round=require('./round-driver'),strategies=require('./strategy-runner');
const POLICIES=['closed-branch-control','min-hand-pips','fast-doubles'];
const MODES=['legacy','side-free','tile-first','to-first'];
function tiles(a){return a.type==='single'?[a.tile]:(a.tiles||[]);}
function pips(a){return e.pipSum(tiles(a));}
function doubles(a){return tiles(a).filter(t=>t[0]===t[1]).length;}
function primary(name,a){
 const f=a.type==='mixed-finish'?1:0,p=pips(a);
 if(name==='closed-branch-control')return [f,-(a.type==='double-sequence'?(a.numbers||[]).length:0),p];
 if(name==='min-hand-pips')return [f,p];
 if(name==='fast-doubles')return [f,doubles(a),p];
 throw Error('unknown policy '+name);
}
function cmpPrimary(name,a,b){const x=primary(name,a),y=primary(name,b);for(let i=0;i<x.length;i++)if(x[i]!==y[i])return y[i]-x[i];return 0;}
function key(a,mode){
 const pre=a.type+':'+(a.numbers||[]).join(',')+':',tile=e.tileKey(a.tile||[0,0]),side=a.side||'',to=a.to??'';
 if(mode==='tile-first')return pre+tile+':'+to+':'+side;
 if(mode==='to-first')return pre+to+':'+side+':'+tile;
 throw Error('not a new key mode');
}
function choose(name,opts,ctx,mode){
 if(mode==='legacy')return strategies.chooseBy(name,opts,{...ctx,sideFree:false});
 if(mode==='side-free')return strategies.chooseBy(name,opts,{...ctx,sideFree:true});
 return [...opts.actions].sort((a,b)=>cmpPrimary(name,a,b)||key(a,mode).localeCompare(key(b,mode)))[0];
}
function actionTile(a){return a.type+':'+(a.type==='single'?e.tileKey(a.tile):(a.numbers||[]).join(','));}
function empty(){const byStrategy={};for(const s of POLICIES)byStrategy[s]={appearances:0,finishWins:0,pips:[],minusWins:{'0':0,'-10':0,'-20':0,'-30':0,'-40':0}};return{rounds:0,finishes:0,blocks:0,unresolved:0,turnTotal:0,byStrategy};}
function run({startSeed=818000,count=800}={}){
 const byMode=Object.fromEntries(MODES.map(m=>[m,empty()])),diagnostic=Object.fromEntries(MODES.filter(m=>m!=='legacy').map(m=>[m,{choices:0,differentAction:0,differentTile:0,sameTileDifferentSide:0,primaryMismatch:0}]));
 const changed=Object.fromEntries(MODES.filter(m=>m!=='legacy').map(m=>[m,{finishOrBlockOutcome:0,blockStatus:0}]));
 for(let seed=startSeed;seed<startSeed+count;seed++){
  const base=init.initializeThreePlayerRound({seed,isFirstRound:false,previousWinnerIndex:seed%3});if(base.kind!=='ready')throw Error('init '+seed);
  for(let rotation=0;rotation<3;rotation++){
   const outcomes={};
   for(const mode of MODES){
    const m=byMode[mode];
    const out=round.runRound(base,(opts,state)=>{
     const name=POLICIES[(state.currentPlayer+rotation)%3],ctx={seed,rotation,turns:state.turns,player:state.currentPlayer};
     const chosen=choose(name,opts,ctx,mode);
     if(mode==='legacy'){
      for(const alt of Object.keys(diagnostic)){
       const d=diagnostic[alt],other=choose(name,opts,ctx,alt);d.choices++;
       if(chosen!==other){d.differentAction++;if(actionTile(chosen)!==actionTile(other))d.differentTile++;else if(chosen.side!==other.side)d.sameTileDifferentSide++;}
       if(cmpPrimary(name,chosen,other)!==0)d.primaryMismatch++;
      }
     }
     return chosen;
    },{maxTurns:200});
    if(out.outcome.kind==='unresolved')throw Error('unresolved '+seed+'/'+mode);
    m.rounds++;m.turnTotal+=out.turns;
    if(out.outcome.kind==='finish'){m.finishes++;const s=POLICIES[(out.outcome.playerIndex+rotation)%3],b=m.byStrategy[s];b.finishWins++;b.minusWins[String(out.outcome.minus||0)]++;}
    else if(out.outcome.kind==='block')m.blocks++;
    for(let seat=0;seat<3;seat++){const s=POLICIES[(seat+rotation)%3],b=m.byStrategy[s];b.appearances++;b.pips.push(e.pipSum(out.hands[seat]));}
    outcomes[mode]=out.outcome.kind==='finish'?'finish:'+out.outcome.playerIndex+':'+(out.outcome.minus||0):out.outcome.kind;
   }
   for(const mode of Object.keys(changed)){if(outcomes[mode]!==outcomes.legacy)changed[mode].finishOrBlockOutcome++;if((outcomes[mode]==='block')!==(outcomes.legacy==='block'))changed[mode].blockStatus++;}
  }
 }
 for(const m of Object.values(byMode)){m.meanTurns=m.turnTotal/m.rounds;delete m.turnTotal;for(const s of POLICIES){const x=m.byStrategy[s],a=x.pips.sort((a,b)=>a-b),n=a.length;x.finishWinRate=x.finishWins/x.appearances;x.meanFinalPips=a.reduce((a,b)=>a+b,0)/n;x.medianFinalPips=n%2?a[(n-1)/2]:(a[n/2-1]+a[n/2])/2;delete x.pips;}}
 for(const d of Object.values(diagnostic))if(d.primaryMismatch)throw Error('primary policy score changed');
 return{schema:'qosa-tiebreak-priority-holdout/v1',engine:'qosa-research-0.5.3',rules:'qosa-1.0.0',seedRange:startSeed+'..'+(startSeed+count-1),deals:count,roundsPerMode:count*3,strategies:POLICIES,modes:MODES,byMode,legacyPathDecisionComparison:diagnostic,pairedOutcomeChanges:changed};
}
function test(){
 const a=run({startSeed:854000,count:12}),b=run({startSeed:854000,count:12});
 if(JSON.stringify(a)!==JSON.stringify(b))throw Error('not deterministic');
 if(a.legacyPathDecisionComparison['tile-first'].differentTile===0)throw Error('tile-first did not exercise distinct-tile tie');
 return{passed:true,seedRange:'854000..854011',roundsPerMode:36,primaryScoreInvariant:true,deterministic:true};
}
if(require.main===module){const mode=process.argv[2]||'test';console.log(JSON.stringify(mode==='test'?test():run({startSeed:Number(process.argv[3]||818000),count:Number(process.argv[4]||800)}),null,2));}
module.exports={POLICIES,MODES,primary,cmpPrimary,key,choose,run,test};