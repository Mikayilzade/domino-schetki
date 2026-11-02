'use strict';
const assert = require('assert');
const e = require('./engine');
const d = require('./turn-dispatcher');
const alloc = require('./hidden-world-enumeration');
const research = require('./pass-history-conditioned-support');
let assertions = 0;
function check(value, message) { assertions++; assert.ok(value, message); }

const fixture = research.syntheticFixture();
check(fixture.raw === 3432, 'fixture exact support must be C(14,7)');
check(fixture.global === 8 && fixture.currentOnly === 120, 'model-specific pass supports');
check(fixture.joint === 8 && fixture.globalOnly === 0 && fixture.currentOnlyExclusive === 112 && fixture.neither === 3312,
  'joint/exclusive support partition');
check(fixture.globalMaskSize === 8 && fixture.currentOnlyMaskSize === 5, 'late-arrival pass masks differ');
check(fixture.differingTiles.join(',') === '0-2,2-5,2-6', 'exact pass-mask difference tiles');

// Rebuild the late-arrival branch state: 2 opened on UP, UP leaves 2, LEFT
// later arrives at 2. A 2-tile on LEFT is globally legal but current-only locked.
let branch = e.createBranchState([1, 1]);
let opening = e.createOpeningState([1]);
const opened = new Map([[1, new Set(e.SIDES)]]);
branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [1, 2]).find(p => p.side === 'up'));
opening = e.openNumber(opening, 2); opened.set(2, new Set(['up']));
branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [1, 3]).find(p => p.side === 'left'));
opening = e.openNumber(opening, 3); opened.set(3, new Set(['left']));
branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [2, 4]).find(p => p.side === 'up'));
branch = e.applySinglePlacement(branch, e.legalSinglePlacements(branch, [2, 3]).find(p => p.side === 'left'));
check(d.openedSinglePlacements(branch, opening, [2, 5]).some(p => p.side === 'left'), 'global model permits late arrival');
check(!research.currentOnlyLegalTile(branch, opening, opened, [2, 5]), 'current-only model locks late arrival');

// Pass-time reconstruction must add same-seat tiles played after a no-draw pass.
const pass = { player: 2, turn: 0, handSizeAtPass: 2, forbiddenGlobal: ['2-5'], forbiddenCurrent: [] };
const later = [{ turn: 1, player: 2, tiles: [[2, 5]] }];
const reconstructed = research.passTimeHand([[3, 4]], pass, later);
check(reconstructed.hand.map(e.tileKey).sort().join(',') === '2-5,3-4', 'later public play is part of pass-time hand');
const conditioned = research.supportFromSpec({ pool: [[3, 4]], hiddenHandSizes: [0, 1], focalHand: [], focalSeat: 0,
  playedEvents: later, passHistory: [pass], currentOnlyTraceCompatible: true, maxWorlds: 10 });
check(conditioned.counts.raw === 1 && conditioned.counts.global === 0 && conditioned.counts.currentOnly === 1 &&
  conditioned.counts.currentOnlyExclusive === 1, 'pass-time tile filters global but not current-only world');

const small = research.run({ startSeed: 3446032, deals: 30, targetPositions: 5, maxWorlds: 20000 });
check(small.positions.length === 5, 'small deterministic run finds five late pass states');
check(small.positions.every(p => p.actualGlobalCompatible), 'true global worlds survive pass filters');
check(small.positions.every(p => p.support.globalOnly + p.support.currentOnlyExclusive + p.support.joint + p.support.neither === p.support.raw),
  'every generated support partition sums');
console.log(JSON.stringify({ passed: true, assertions, syntheticFixture: fixture,
  passTimeReconstruction: true, generatedPositions: small.positions.length }, null, 2));
