'use strict';
const SIDES=['up','left','right','down'];
function canonicalTile(a,b){if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>6||b>6)throw new Error('pips 0..6');return a<=b?[a,b]:[b,a];}
function tileKey(t){const [a,b]=canonicalTile(t[0],t[1]);return a+'-'+b;}
function createDoubleSixDeck(){const d=[];for(let a=0;a<=6;a++)for(let b=a;b<=6;b++)d.push([a,b]);return d;}
function xorshift32(seed){let s=seed>>>0;if(s===0)s=0x9e3779b9;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return(s>>>0)/0x100000000;};}
function shuffledDeck(seed){const d=createDoubleSixDeck(),r=xorshift32(seed);for(let i=d.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[d[i],d[j]]=[d[j],d[i]];}return d;}
function dealThreeByNine(seed){const d=shuffledDeck(seed);return{hands:[d.slice(0,9),d.slice(9,18),d.slice(18,27)],stock:d.slice(27)};}
function pipSum(ts){return ts.reduce((s,[a,b])=>s+a+b,0);}
function finishMinus(ts){if(!Array.isArray(ts)||ts.length<1||ts.length>4||!ts.every(([a,b])=>a===b))return 0;return -10*ts.length;}
function applyScoreDelta(score,delta){return Math.max(0,score+delta);}
function createBranchState(centerDouble,activeSides=SIDES){if(!Array.isArray(centerDouble)||centerDouble.length!==2||centerDouble[0]!==centerDouble[1])throw new Error('centre must be double');const pip=centerDouble[0],active=new Set(activeSides);for(const side of active)if(!SIDES.includes(side))throw new Error('unknown side');return{center:[pip,pip],branches:Object.fromEntries(SIDES.map(side=>[side,{active:active.has(side),end:pip}]))};}
function cloneBranchState(s){return{center:[...s.center],branches:Object.fromEntries(SIDES.map(side=>[side,{...s.branches[side]}]))};}
function createOpeningState(openedNumbers=[]){const opened=new Set();for(const n of openedNumbers){if(!Number.isInteger(n)||n<0||n>6)throw new Error('opened number must be 0..6');opened.add(n);}return{openedNumbers:opened};}
function cloneOpeningState(s){return{openedNumbers:new Set(s.openedNumbers)};}
function isNumberOpened(s,n){return s.openedNumbers.has(n);}
function openNumber(s,n){if(!Number.isInteger(n)||n<0||n>6)throw new Error('opened number must be 0..6');const next=cloneOpeningState(s);next.openedNumbers.add(n);return next;}
function candidateDoubleOpenings(branchState,openingState,hand){const seen=new Set(),out=[];for(let handIndex=0;handIndex<hand.length;handIndex++){const [a,b]=canonicalTile(hand[handIndex][0],hand[handIndex][1]);if(a!==b||seen.has(a)||isNumberOpened(openingState,a))continue;const sides=sidesEndingIn(branchState,a);if(!sides.length)continue;seen.add(a);out.push({handIndex,tile:[a,b],number:a,sides:[...sides]});}return out;}
function applyCandidateDoubleOpening(branchState,openingState,candidate){const legal=candidateDoubleOpenings(branchState,openingState,[candidate.tile]);const hit=legal.find(x=>x.number===candidate.number);if(!hit)throw new Error('illegal double opening');return{branchState:cloneBranchState(branchState),openingState:openNumber(openingState,hit.number),opening:hit};}
function enumerateDoubleOpeningSequences(branchState,openingState,hand){const out=[];const recurse=(state,remaining,prefix)=>{const candidates=candidateDoubleOpenings(branchState,state,remaining);if(prefix.length)out.push(prefix);for(const candidate of candidates){const nextState=openNumber(state,candidate.number);const nextHand=remaining.filter((_,i)=>i!==candidate.handIndex);recurse(nextState,nextHand,[...prefix,candidate]);}};recurse(cloneOpeningState(openingState),hand,[]);return out;}
function applyDoubleOpeningSequence(branchState,openingState,sequence){let state=cloneOpeningState(openingState);const applied=[];for(const candidate of sequence){const result=applyCandidateDoubleOpening(branchState,state,candidate);state=result.openingState;applied.push(result.opening);}return{branchState:cloneBranchState(branchState),openingState:state,openings:applied};}
function sidesEndingIn(s,n){return SIDES.filter(side=>s.branches[side].active&&s.branches[side].end===n);}
function legalSinglePlacements(s,tile){const [a,b]=canonicalTile(tile[0],tile[1]),out=[];for(const side of SIDES){const br=s.branches[side];if(!br.active)continue;if(a===br.end||b===br.end){const to=a===b?a:(a===br.end?b:a);out.push({side,tile:[a,b],from:br.end,to});}}return out;}
function applySinglePlacement(s,p){const m=legalSinglePlacements(s,p.tile).find(x=>x.side===p.side&&x.to===p.to);if(!m)throw new Error('illegal placement');const n=cloneBranchState(s);n.branches[p.side].end=m.to;return n;}
function legalSinglesForHand(s,h){return h.flatMap((tile,handIndex)=>legalSinglePlacements(s,tile).map(p=>({handIndex,...p})));} 
module.exports={SIDES,canonicalTile,tileKey,createDoubleSixDeck,shuffledDeck,dealThreeByNine,pipSum,finishMinus,applyScoreDelta,createBranchState,cloneBranchState,createOpeningState,cloneOpeningState,isNumberOpened,openNumber,sidesEndingIn,candidateDoubleOpenings,applyCandidateDoubleOpening,enumerateDoubleOpeningSequences,applyDoubleOpeningSequence,legalSinglePlacements,applySinglePlacement,legalSinglesForHand};
