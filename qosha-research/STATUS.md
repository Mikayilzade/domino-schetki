# Simulator status

Current engine: `qosa-research-0.1.0`

## Validated in code

- canonical double-six deck has 28 unique tiles;
- deterministic seeded shuffle/deal;
- primary 3×9 deal leaves exactly one stock tile;
- pip counting;
- finish-minus classification for all-double final plays of length 1..4;
- a mixed double/non-double final list does not receive minus;
- score floor at zero.

Run locally with:

```
node qosha-research/simulator/test.js
```

## Intentionally NOT implemented yet

No branch/legal-move simulator is claimed valid yet. The exact branch-opening and multi-double legality rules in `RULES.md` are still ambiguous. This engine therefore cannot yet produce trustworthy strategy win rates.

The PRNG is new research infrastructure and is not claimed to reproduce historical `qosa-1.0.0` hands from the same numeric seed.

## Next

Implement a branch-state model only for rule portions that can be expressed without guessing, then add fixtures for known real positions before any large simulation.
