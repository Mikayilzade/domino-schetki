'use strict';

// Exhaustive synthetic seat-permutation contract for candidate block-winner rules.
// This does not construct legal blocked hands or authenticate real-table scoring.
// node qosha-research/simulator/block-winner-permutation-contract.js

function permutations(xs) {
  if (xs.length <= 1) return [xs];
  const out = [];
  for (let i = 0; i < xs.length; i++) {
    const rest = [...xs.slice(0, i), ...xs.slice(i + 1)];
    for (const tail of permutations(rest)) out.push([xs[i], ...tail]);
  }
  return out;
}

function* vectors(n, maxPip, prefix = []) {
  if (prefix.length === n) {
    yield prefix;
    return;
  }
  for (let value = 0; value <= maxPip; value++) {
    yield* vectors(n, maxPip, [...prefix, value]);
  }
}

function minSeats(values) {
  const min = Math.min(...values);
  return values.map((value, seat) => value === min ? seat : -1).filter(seat => seat >= 0);
}

function firstMinSeat(values) {
  return minSeats(values)[0];
}

// Candidate policy: return a winner only when the minimum is unique.
function uniqueMinimumOrNull(values) {
  const candidates = minSeats(values);
  return candidates.length === 1 ? candidates[0] : null;
}

// Candidate policy: unique minimum wins; on a tie, last passer wins only if
// they are among the tied minima; otherwise the result remains unresolved.
function lastPasserPriority(values, lastPasser) {
  const candidates = minSeats(values);
  if (candidates.length === 1) return candidates[0];
  return candidates.includes(lastPasser) ? lastPasser : null;
}

// Illustrative unit-mass allocation among tied minima, not an asserted game score.
function equalShare(values) {
  const candidates = minSeats(values);
  const share = 1 / candidates.length;
  return values.map((_, seat) => candidates.includes(seat) ? share : 0);
}

function permuteValues(values, permutation) {
  // permutation[newSeat] = oldSeat
  return permutation.map(oldSeat => values[oldSeat]);
}

function mapOldSetToNew(oldSet, permutation) {
  return oldSet.map(oldSeat => permutation.indexOf(oldSeat)).sort((a, b) => a - b);
}

function mapSharesToNew(oldShares, permutation) {
  return permutation.map(oldSeat => oldShares[oldSeat]);
}

function same(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

function run(maxPip = 5) {
  if (!Number.isInteger(maxPip) || maxPip < 0 || maxPip > 9) {
    throw new Error('maxPip must be an integer in 0..9');
  }

  let assertions = 0;
  const check = (condition, message) => {
    assertions++;
    if (!condition) throw new Error('block-winner-permutation-contract: ' + message);
  };

  const counts = {
    vectors3: 0,
    vectors5: 0,
    permutationCases3: 0,
    permutationCases5: 0,
    candidateSetChecks: 0,
    equalShareChecks: 0,
    uniqueOrNullChecks: 0,
    lastPasserChecks: 0,
    tiedVectors3: 0,
    tiedVectors5: 0,
    rawOrderTieCases: 0,
    rawOrderChanged: 0,
    rawChangeByTieSize: {}
  };

  for (const players of [3, 5]) {
    const allPermutations = permutations([...Array(players).keys()]);
    for (const values of vectors(players, maxPip)) {
      counts['vectors' + players]++;
      const candidates = minSeats(values);
      const originalFirst = firstMinSeat(values);
      const originalUnique = uniqueMinimumOrNull(values);
      const originalShares = equalShare(values);

      if (candidates.length > 1) counts['tiedVectors' + players]++;

      for (const permutation of allPermutations) {
        const relabelled = permuteValues(values, permutation);
        const relabelledCandidates = minSeats(relabelled);
        counts['permutationCases' + players]++;

        counts.candidateSetChecks++;
        check(
          same(relabelledCandidates, mapOldSetToNew(candidates, permutation)),
          'minimum candidate set must map under seat permutation'
        );

        counts.equalShareChecks++;
        check(
          same(equalShare(relabelled), mapSharesToNew(originalShares, permutation)),
          'equal-share vector must map under seat permutation'
        );

        counts.uniqueOrNullChecks++;
        const expectedUnique = originalUnique === null ? null : permutation.indexOf(originalUnique);
        check(
          uniqueMinimumOrNull(relabelled) === expectedUnique,
          'unique-minimum/no-winner-on-tie policy must map under seat permutation'
        );

        for (let lastPasser = 0; lastPasser < players; lastPasser++) {
          counts.lastPasserChecks++;
          const relabelledLastPasser = permutation.indexOf(lastPasser);
          const originalChoice = lastPasserPriority(values, lastPasser);
          const expectedChoice = originalChoice === null ? null : permutation.indexOf(originalChoice);
          check(
            lastPasserPriority(relabelled, relabelledLastPasser) === expectedChoice,
            'last-passer candidate policy must map when passer identity is relabelled'
          );
        }

        if (candidates.length > 1) {
          counts.rawOrderTieCases++;
          const selectedOldIdentity = permutation[firstMinSeat(relabelled)];
          if (selectedOldIdentity !== originalFirst) counts.rawOrderChanged++;

          const tieSize = candidates.length;
          if (!counts.rawChangeByTieSize[tieSize]) {
            counts.rawChangeByTieSize[tieSize] = { cases: 0, changed: 0 };
          }
          counts.rawChangeByTieSize[tieSize].cases++;
          if (selectedOldIdentity !== originalFirst) {
            counts.rawChangeByTieSize[tieSize].changed++;
          }
        }
      }
    }
  }

  counts.rawOrderChangeRate = counts.rawOrderTieCases
    ? counts.rawOrderChanged / counts.rawOrderTieCases
    : 0;
  for (const [tieSize, item] of Object.entries(counts.rawChangeByTieSize)) {
    item.rate = item.changed / item.cases;
  }

  const expected = {
    vectors3: (maxPip + 1) ** 3,
    vectors5: (maxPip + 1) ** 5,
    permutationCases3: (maxPip + 1) ** 3 * 6,
    permutationCases5: (maxPip + 1) ** 5 * 120
  };
  for (const [key, value] of Object.entries(expected)) {
    if (counts[key] !== value) throw new Error('count regression: ' + key);
  }

  return {
    schema: 'block-winner-permutation-contract/v1',
    passed: true,
    maxPip,
    domain: 'All synthetic per-seat remainder vectors in 0..maxPip for 3 and 5 seats; every seat permutation.',
    assertions,
    counts,
    scope: 'Candidate-set and labelled-policy metamorphic contract only. Not legal blocked-hand enumeration, physical rule authentication, score allocation, or strategy evaluation.'
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run, permutations, vectors, minSeats, uniqueMinimumOrNull, lastPasserPriority, equalShare };
