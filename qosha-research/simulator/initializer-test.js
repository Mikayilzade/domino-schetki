'use strict';
const assert=require('assert');
const e=require('./engine');
const init=require('./initializer');
const fixture=require('../fixtures/seed-1898414179.json');

let st=init.initializeThreePlayerRoundFromDeal({hands:fixture.initialHands,stock:fixture.initialStock,isFirstRound:false,previousWinnerIndex:1,chooseFollowup:(choices)=>choices.find(x=>x.tile[0]===1&&x.tile[1]===5)});
assert.equal(st.kind,'ready');assert.equal(st.starter,2);assert.equal(st.currentPlayer,0);assert.deepStrictEqual(st.openingDraw,[1,5]);assert.deepStrictEqual(st.openingFollowup.tile,[1,5]);assert.equal(st.openingPassed,false);assert.equal(st.hands[2].length,8);

const stockOne={hands:[[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[2,3],[2,4]],[[1,2],[1,3],[2,2],[2,5],[2,6],[3,3],[3,4],[3,5],[3,6]],[[1,4],[1,5],[1,6],[4,4],[4,5],[4,6],[5,5],[5,6],[6,6]]],stock:[[1,1]]};
st=init.initializeThreePlayerRoundFromDeal({...stockOne,isFirstRound:true});assert.equal(st.kind,'redeal');
st=init.initializeThreePlayerRoundFromDeal({...stockOne,isFirstRound:false,previousWinnerIndex:1,chooseFollowup:c=>c[0]});assert.equal(st.kind,'ready');assert.equal(st.starter,1);assert.equal(st.currentPlayer,2);

// Valid deal where owner of 1-1 draws a non-1 and still cannot follow on 1: opening becomes a pass, not unresolved.
const deck=e.createDoubleSixDeck();
const starter=[[1,1],...deck.filter(t=>!t.includes(1)&&e.tileKey(t)!=='1-1').slice(0,8)];
const used=new Set(starter.map(e.tileKey));
const stock=deck.find(t=>!t.includes(1)&&!used.has(e.tileKey(t)));used.add(e.tileKey(stock));
const remaining=deck.filter(t=>!used.has(e.tileKey(t)));
const noFollow={hands:[starter,remaining.slice(0,9),remaining.slice(9,18)],stock:[stock]};
st=init.initializeThreePlayerRoundFromDeal({...noFollow,isFirstRound:false,previousWinnerIndex:2});
assert.equal(st.kind,'ready');assert.equal(st.starter,0);assert.equal(st.currentPlayer,1);assert.equal(st.openingFollowup,null);assert.equal(st.openingPassed,true);assert.equal(st.consecutivePasses,1);assert.equal(st.stock.length,0);assert.equal(st.branchState.branches.up.end,1);assert.equal(st.branchState.branches.left.end,1);

console.log('qosa initializer invariants: OK');
