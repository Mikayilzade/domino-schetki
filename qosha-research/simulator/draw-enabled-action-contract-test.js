'use strict';
const assert = require('node:assert/strict');
const e = require('./engine');
const d = require('./turn-dispatcher');
const t = require('./turn-kernel');
const rd = require('./round-driver');

function branchWithEnds(ends) {
  const state = e.createBranchState([1, 1]);
  e.SIDES.forEach((side, i) => { state.branches[side].end = ends[i]; });
  return state;
}
function keys(tiles) { return tiles.map(e.tileKey).sort(); }
function assertConservation(beforeHand, beforeStock, transition, label) {
  const before = keys([...beforeHand, ...beforeStock]);
  const after = keys([...transition.hand, ...transition.stock, ...(transition.playedTiles || [])]);
  assert.deepEqual(after, before, label + ': tile conservation');
}
function test() {
  let assertions = 0;
  const eq = (actual, expected, label) => { assert.equal(actual, expected, label); assertions++; };
  const deep = (actual, expected, label) => { assert.deepEqual(actual, expected, label); assertions++; };
  const ok = (actual, label) => { assert.ok(actual, label); assertions++; };

  // A held nonmatching tile does not draw when it already has a legal move.
  {
    const branch = branchWithEnds([1, 1, 1, 1]);
    const opening = e.createOpeningState([1]);
    const hand = [[1, 3]], stock = [[4, 5]];
    const opts = d.turnOptions(branch, opening, hand, stock);
    eq(opts.phase, 'play', 'in-hand legal action phase');
    eq(opts.drawn, false, 'no draw when hand has a legal action');
    deep(opts.stock, stock, 'stock unchanged before action');
    const tr = d.applyTurn(branch, opening, hand, stock, opts.actions.find(a => a.type === 'single'));
    eq(tr.drawn, false, 'applied in-hand action remains undrawn');
    assertConservation(hand, stock, tr, 'in-hand legal action');
    assertions++;
  }

  // Drawn ordinary tile unlocks a normal single placement.
  {
    const branch = branchWithEnds([1, 1, 1, 1]);
    const opening = e.createOpeningState([1]);
    const hand = [[2, 3]], stock = [[1, 4]];
    eq(d.actionsForHand(branch, opening, hand).length, 0, 'no action before draw');
    const opts = d.turnOptions(branch, opening, hand, stock);
    eq(opts.phase, 'play', 'draw-enabled single phase');
    eq(opts.drawn, true, 'single requires draw');
    deep(opts.drawnTile, [1, 4], 'single draw tile');
    eq(opts.stock.length, 0, 'single draw consumes stock');
    const action = opts.actions.find(a => a.type === 'single');
    ok(action, 'drawn tile exposes single action');
    const tr = d.applyTurn(branch, opening, hand, stock, action);
    eq(tr.passed, false, 'draw-enabled single is not a pass');
    eq(tr.drawn, true, 'single transition records draw');
    deep(keys(tr.hand), keys(hand), 'single leaves original hand tile');
    deep(keys(tr.playedTiles), ['1-4'], 'single plays drawn tile');
    eq(t.nextPassCount(2, tr), 0, 'successful play resets pass counter');
    assertConservation(hand, stock, tr, 'draw-enabled single');
    assertions++;
  }

  // Drawn double becomes a legal double-sequence action; branch geometry is preserved.
  {
    const branch = branchWithEnds([1, 2, 3, 4]);
    const opening = e.createOpeningState([1]);
    const hand = [[5, 6]], stock = [[2, 2]];
    eq(d.actionsForHand(branch, opening, hand).length, 0, 'double is unavailable before draw');
    const opts = d.turnOptions(branch, opening, hand, stock);
    eq(opts.phase, 'play', 'draw-enabled double phase');
    eq(opts.drawn, true, 'double requires draw');
    const action = opts.actions.find(a => a.type === 'double-sequence' && a.numbers.join(',') === '2');
    ok(action, 'drawn double exposes double-sequence action');
    const tr = d.applyTurn(branch, opening, hand, stock, action);
    eq(tr.passed, false, 'draw-enabled double is not a pass');
    deep(keys(tr.playedTiles), ['2-2'], 'double sequence plays drawn double');
    deep(keys(tr.hand), ['5-6'], 'double sequence retains unrelated tile');
    deep([...tr.openingState.openedNumbers].sort((a,b)=>a-b), [1,2], 'double opening state updates');
    deep(e.SIDES.map(side => tr.branchState.branches[side].end), [1,2,3,4], 'double sequence preserves branch geometry');
    assertConservation(hand, stock, tr, 'draw-enabled double');
    assertions++;
  }

  // Drawn ordinary prefix enables a mixed finish with a held double.
  {
    const branch = branchWithEnds([1, 4, 5, 6]);
    const opening = e.createOpeningState([1]);
    const hand = [[2, 2]], stock = [[1, 2]];
    eq(d.actionsForHand(branch, opening, hand).length, 0, 'held double is unavailable before draw');
    const opts = d.turnOptions(branch, opening, hand, stock);
    eq(opts.phase, 'play', 'draw-enabled mixed-finish phase');
    eq(opts.drawn, true, 'mixed finish requires draw');
    const action = opts.actions.find(a => a.type === 'mixed-finish');
    ok(action, 'drawn prefix exposes mixed finish');
    deep(action.tiles.map(e.tileKey), ['1-2', '2-2'], 'mixed finish prefix and closing double');
    const tr = d.applyTurn(branch, opening, hand, stock, action);
    eq(tr.passed, false, 'mixed finish is not a pass');
    eq(tr.hand.length, 0, 'mixed finish empties hand');
    eq(tr.stock.length, 0, 'mixed finish consumes stock');
    eq(tr.drawn, true, 'mixed finish records draw');
    eq(e.finishMinus(tr.finishDoubles), -10, 'mixed finish counts closing double only');
    eq(tr.branchState.branches.up.end, 2, 'ordinary prefix extends branch before double');
    ok(tr.openingState.openedNumbers.has(2), 'closing double opens its number');
    assertConservation(hand, stock, tr, 'draw-enabled mixed finish');
    assertions++;

    const hands = [tr.hand, [[3, 4]], [[5, 6]]];
    const normalOutcome = d.roundOutcome({ hands, stock: tr.stock, consecutivePasses: 0,
      lastPlayerIndex: 0, lastTurnResult: tr, players: 3 });
    eq(normalOutcome.kind, 'finish', 'finish classified after drawn mixed finish');
    eq(normalOutcome.minus, -10, 'finish minus survives dispatcher outcome');

    // Artificial dual-condition fixture: not reachable after a successful action,
    // because a successful action resets passes; guards finish-before-block ordering.
    const precedence = d.roundOutcome({ hands, stock: [], consecutivePasses: 3,
      lastPlayerIndex: 0, lastTurnResult: tr, players: 3 });
    eq(precedence.kind, 'finish', 'finish takes precedence over block predicate');
  }

  // Round-driver integration: a successful drawn finish resets prior passes.
  {
    const branch = branchWithEnds([1, 4, 5, 6]);
    const opening = e.createOpeningState([1]);
    const state = { branchState: branch, openingState: opening,
      hands: [[[2, 2]], [[3, 4]], [[5, 6]]], stock: [[1, 2]],
      currentPlayer: 0, consecutivePasses: 2, turns: 0, outcome: null };
    const next = rd.stepRound(state, opts => opts.actions.find(a => a.type === 'mixed-finish'));
    eq(next.outcome.kind, 'finish', 'round driver classifies drawn mixed finish');
    eq(next.outcome.minus, -10, 'round driver carries mixed-finish minus');
    eq(next.hands[0].length, 0, 'round driver removes all finished tiles');
    eq(next.stock.length, 0, 'round driver consumes drawn stock');
    eq(next.consecutivePasses, 0, 'round driver resets pass count on successful action');
    eq(next.turns, 1, 'round driver increments turn exactly once');
  }

  // If the single draw still offers no action, the tile stays in hand and the turn passes.
  {
    const branch = branchWithEnds([1, 2, 3, 4]);
    const opening = e.createOpeningState([1]);
    const hand = [[5, 6]], stock = [[0, 0]];
    eq(d.actionsForHand(branch, opening, hand).length, 0, 'no action before no-play draw');
    const opts = d.turnOptions(branch, opening, hand, stock);
    eq(opts.phase, 'pass', 'no-play draw leads to pass');
    eq(opts.drawn, true, 'pass records attempted draw');
    deep(opts.drawnTile, [0, 0], 'pass records drawn tile');
    eq(opts.stock.length, 0, 'pass consumes the final stock tile');
    const tr = d.applyTurn(branch, opening, hand, stock, null);
    eq(tr.passed, true, 'turn result is pass');
    eq(tr.drawn, true, 'pass transition preserves draw flag');
    deep(keys(tr.hand), ['0-0', '5-6'], 'unplayable draw remains in hand');
    deep(tr.playedTiles, [], 'pass plays no tile');
    eq(t.nextPassCount(0, tr), 1, 'pass counter increments');
    assertConservation(hand, stock, tr, 'draw-and-pass');
    assertions++;

    const laterNoStock = d.turnOptions(branch, opening, tr.hand, tr.stock);
    eq(laterNoStock.phase, 'pass', 'empty-stock no-action remains pass');
    eq(laterNoStock.drawn, false, 'empty stock causes no second draw');
    const secondPass = d.applyTurn(branch, opening, tr.hand, tr.stock, null);
    eq(t.nextPassCount(1, secondPass), 2, 'consecutive no-stock pass increments again');
    eq(t.isBlocked({ stock: secondPass.stock, consecutivePasses: 3, players: 3 }), true,
      'block predicate activates after three consecutive passes and empty stock');

    const round = { branchState: branch, openingState: opening,
      hands: [[[5, 6]], [[0, 5]], [[0, 6]]], stock: [[0, 0]],
      currentPlayer: 0, consecutivePasses: 0, turns: 0, outcome: null };
    const afterDrawPass = rd.stepRound(round, () => null);
    eq(afterDrawPass.consecutivePasses, 1, 'round driver increments after draw-and-pass');
    eq(afterDrawPass.currentPlayer, 1, 'round driver advances after pass');
    deep(keys(afterDrawPass.hands[0]), ['0-0', '5-6'], 'round driver retains unplayable drawn tile');
    const afterPass2 = rd.stepRound(afterDrawPass, () => null);
    eq(afterPass2.consecutivePasses, 2, 'round driver counts second consecutive pass');
    const afterPass3 = rd.stepRound(afterPass2, () => null);
    eq(afterPass3.consecutivePasses, 3, 'round driver counts third consecutive pass');
    eq(afterPass3.outcome.kind, 'block', 'round driver detects block after full pass cycle');
    eq(afterPass3.turns, 3, 'block round advances exactly three turns');
  }

  return { passed: true, assertions, fixtures: [
    'no draw when an in-hand action exists',
    'draw enables ordinary single',
    'draw enables double-sequence action',
    'draw enables mixed finish',
    'round-driver finish/pass integration',
    'draw-and-pass retains unplayable tile',
    'pass counter reset/increment and finish precedence'
  ], deals: 0, seeds: null,
  scope: 'qosa-1.0.0 coded-model integration contract; physical branch/opening semantics remain provisional' };
}

if (require.main === module) process.stdout.write(JSON.stringify(test(), null, 2) + '\n');
module.exports = { test };
