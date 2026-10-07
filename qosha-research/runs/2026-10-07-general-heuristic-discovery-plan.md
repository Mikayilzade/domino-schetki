# General heuristic discovery plan

Timestamp: 2026-10-07 11:45 (+04)

Primary research output is now human-readable general gameplay heuristics discovered from simulation.

First hypothesis families:
- repeated-number structure: at least three tiles containing X plus X-X; compare preserving the double/connectors with spending them early;
- chain structure X-X + X-Y + Y-Y and its relation to late double finishes;
- preserving a connector while controlling multiple branch ends;
- opening a closed number versus keeping it closed, conditioned on how many matching tiles remain in the player's hand;
- using observed opponent passes as information;
- identifying states where tempo is better than closed-branch control.

Future decision-point datasets should record hand sizes, doubles, count of each number, double/connector structures, four ends, opened numbers, legal choices, chosen action and observable pass history.

Discovery is only stage one. Any candidate rule must be retested on matched states by forcing both competing choices and continuing with the same policy. Keep finish-first, remainder, block and minus outcomes separate. Record counter-conditions where the effect vanishes or reverses.

Fixed-visible hidden-world Monte Carlo remains a validation tool, not the main research product.

Current validated strategy scale remains 180,000 matched-seat rounds. No new gameplay claim is made in this planning checkpoint.

Next action: add a decision-state feature extractor and instrumentation, then collect the first dataset aimed specifically at repeated-number + double + connector patterns.
