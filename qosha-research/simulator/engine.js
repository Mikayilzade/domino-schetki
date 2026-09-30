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
function legalSinglePlacements(s,tile){const [a,b]=canonicalTile(tile[0],tile[1]),out=[];for(const side of SIDES){const br=s.branches[side];if(!br.active)continue;if(a===br.end||b===br.end){const to=a===b?a:(a===br.end?b:a);out.push({side,tile:[a,b],from:br.end,to});}}return out;}
function applySinglePlacement(s,p){const m=legalSinglePlacements(s,p.tile).find(x=>x.side===p.side&&x.to===p.to);if(!m)throw new Error('illegal placement');const n=cloneBranchState(s);n.branches[p.side].end=m.to;return n;}
function legalSinglesForHand(s,h){return h.flatMap((tile,handIndex)=>legalSinglePlacements(s,tile).map(p=>({handIndex,...p})));}
module.exports={SIDES,canonicalTile,tileKey,createDoubleSixDeck,shuffledDeck,dealThreeByNine,pipSum,finishMinus,applyScoreDelta,createBranchState,cloneBranchState,legalSinglePlacements,applySinglePlacement,legalSinglesForHand};
