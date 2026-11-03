'use strict';
const assert=require('assert');
const stats=require('./cluster-statistics');
const rate=stats.rate([{y:1,n:1},{y:0,n:1}],'y','n');
assert.strictEqual(rate.clusters,2);assert.strictEqual(rate.numerator,1);assert.strictEqual(rate.denominator,2);assert.strictEqual(rate.estimate,0.5);assert(Math.abs(rate.residualSumSquares-0.5)<1e-12);assert(Math.abs(rate.standardError-0.5)<1e-12);assert.strictEqual(rate.ci95.low,0);assert.strictEqual(rate.ci95.high,1);
const mean=stats.mean([{v:1},{v:3}],r=>r.v);assert.strictEqual(mean.mean,2);assert.strictEqual(mean.deviationSumSquares,2);assert.strictEqual(mean.standardError,1);
const empty=stats.rate([{y:0,n:0}],'y','n');assert.strictEqual(empty.estimate,null);assert.strictEqual(empty.standardError,null);
const rows=[{mix:'m',pairs:1,bothFinish:1,kindChanged:1,finishWinnerChanged:1,minusChanged:0,turnDelta:2,finalPipDelta:6},{mix:'m',pairs:1,bothFinish:1,kindChanged:0,finishWinnerChanged:0,minusChanged:0,turnDelta:4,finalPipDelta:0}];
const summary=stats.summarize(rows).mixes.m;assert.strictEqual(summary.dealClusters,2);assert.strictEqual(summary.roundKindChange.estimate,0.5);assert.strictEqual(summary.finishWinnerChangeAmongBothFinish.estimate,0.5);assert.strictEqual(summary.meanTurnDeltaPerDeal.mean,3);assert.strictEqual(summary.meanFinalPipDeltaPerSeatPerDeal.mean,1);