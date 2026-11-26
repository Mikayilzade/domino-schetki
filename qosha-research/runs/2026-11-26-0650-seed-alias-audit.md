# Seed alias audit — 2026-11-26 06:50 Asia/Baku

Engine qosha-research-0.5.3 / recovered qosa-1.0.0; 3×9 primary. Source blobs: engine.js 82e5bd544a57683d5b4f7812beb2d4abf80da894; hidden-world.js 6d4d2c3d693a3d9b66a3d21c7f0d65474292a3e2.

Both source files map a zero mixed seed to 0x9e3779b9 before xorshift32. Inverting the bijective uint32 mixer (odd modular multipliers and inverse right-xorshifts) yields seed 1640531527 for zero and seed 937260827 for 0x9e3779b9. Executed a direct JS reproduction of the source mixer and Fisher–Yates on both seeds: mixed values 0 and 2654435769; both produce identical permutation of indices 0..27: [25,17,26,10,9,2,7,14,27,11,5,18,3,24,4,6,16,1,19,13,20,15,22,21,0,12,23,8]. Thus the same alias also applies to hidden-pool shuffles of any fixed length. This is a deterministic source-level reproduction, not execution of the imported engine or full validation gate.

Two seed IDs, one unique permutation; zero new gameplay deals or strategies; no win/pips/block/minus/regret measurements. Historical 180,000 matched-seat rounds remain separate. High confidence in exact alias, no strategic inference. Branch/block/loneZero still provisional. The standalone conditional-hidden-worlds.js already uses a distinct fallback stream, but the two audited sources do not.

Next: add regression for this exact pair to both original generators, version the zero-state fallback (preserve all other seed outputs and legacy replay), execute original-source tests, and keep old cohorts separate. No PWA changes. Full gate not executed.
