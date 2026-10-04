# Actual-starter regression requirement

The controlled specific-double analysis must stratify by the initialized round's actual `starter`, not by raw ownership of `1-1`.

Required regression case: when raw `1-1` is the stock tile in a later round, `previousWinnerIndex` is the actual starter even though no raw hand owns `1-1`. Any controlled run produced before this correction must not be counted as validated specific-double evidence.

Next code change: initialize the round before constructing per-seat features, then set `starter = (seat === base.starter)` while retaining double ownership/count from the raw 3x9 deal.
