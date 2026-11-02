#!/usr/bin/env python3
"""Synthetic finite-sample diagnostic for round-seat CR1 cluster-robust SE.

Requires NumPy. This is calibration-method validation only; it contains no game data.
"""
import argparse
import json
import math
import numpy as np

# Two-sided 97.5th percentiles of Student t, df = G - 1.
T_CRIT_975 = {4: 3.182446305284263, 8: 2.3646242515927844,
              20: 2.093024054408263, 50: 2.0095752371292397}


def cr1(group_scores, total_n, mean):
    """Same decision-weighted intercept-only CR1 formula as the JS module.

    group_scores is a sequence of (n_g, sum_y_g).
    """
    groups = len(group_scores)
    if groups < 2 or total_n <= 0:
        return None
    ss = sum((total - mean * n) ** 2 for n, total in group_scores)
    return math.sqrt((groups / (groups - 1)) * ss / (total_n * total_n))


def run_config(groups, scheme, reps, seed):
    rng = np.random.default_rng(seed)
    if scheme == "balanced-n4":
        ns = np.full((reps, groups), 4, dtype=np.int64)
    elif scheme == "random-n1-12":
        ns = rng.integers(1, 13, size=(reps, groups), dtype=np.int64)
    elif scheme == "half-n1-half-n12":
        base = np.array([1] * (groups // 2) + [12] * (groups - groups // 2), dtype=np.int64)
        ns = np.tile(base, (reps, 1))
    else:
        raise ValueError(scheme)

    total_n = ns.sum(axis=1)
    # y_gi = mu + u_g + e_gi, with mu=0, u~N(0,1), e~N(0,0.5^2).
    cluster_effect = rng.normal(0.0, 1.0, size=(reps, groups))
    within_noise = rng.normal(0.0, 0.5, size=(reps, groups))
    group_totals = ns * cluster_effect + np.sqrt(ns) * within_noise
    estimate = group_totals.sum(axis=1) / total_n
    residual_totals = group_totals - estimate[:, None] * ns
    se = np.sqrt((groups / (groups - 1)) * (residual_totals ** 2).sum(axis=1) / (total_n ** 2))
    tcrit = T_CRIT_975[groups]
    empirical_sd = float(estimate.std(ddof=1))
    mean_cr1_se = float(se.mean())
    return {
        "groups": groups,
        "clusterSizeScheme": scheme,
        "empiricalSDOfMean": empirical_sd,
        "meanCR1SE": mean_cr1_se,
        "meanSEtoEmpiricalSD": mean_cr1_se / empirical_sd,
        "normal95Coverage": float(np.mean(np.abs(estimate) <= 1.96 * se)),
        "tGminus1Coverage": float(np.mean(np.abs(estimate) <= tcrit * se)),
    }


def formula_checks():
    checks = 0
    assert abs(cr1([(2, 2), (2, 6)], 4, 2) - 1.0) < 1e-12; checks += 1
    assert cr1([(4, 4)], 4, 1) is None; checks += 1
    x = [(3, 4), (5, 7), (2, 1)]
    n = sum(a for a, _ in x); mean = sum(b for _, b in x) / n
    se = cr1(x, n, mean)
    assert abs(se - cr1(list(reversed(x)), n, mean)) < 1e-12; checks += 1
    shift = 11
    shifted = [(a, b + shift * a) for a, b in x]
    assert abs(cr1(shifted, n, mean + shift) - se) < 1e-12; checks += 1
    scale = 2.5
    scaled = [(a, b * scale) for a, b in x]
    assert abs(cr1(scaled, n, mean * scale) - scale * se) < 1e-12; checks += 1
    assert cr1([(2, 4), (3, 6)], 5, 2) == 0.0; checks += 1
    return checks


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--reps", type=int, default=30000)
    parser.add_argument("--seed", type=int, default=202611021756)
    args = parser.parse_args()
    assert args.reps > 0
    checks = formula_checks()
    rows = [run_config(g, scheme, args.reps, args.seed)
            for g in (4, 8, 20, 50)
            for scheme in ("balanced-n4", "random-n1-12", "half-n1-half-n12")]
    print(json.dumps({"formulaAssertions": checks, "replicatesPerConfiguration": args.reps,
                      "seed": args.seed, "results": rows}, indent=2))


if __name__ == "__main__":
    main()
