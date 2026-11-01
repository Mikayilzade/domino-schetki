
## Separate model-specific pass posterior (2026-11-01)

When a visible state includes forced-pass evidence and two provisional branch models:
- compute global-ever-open and current-only posterior supports separately, alongside the joint intersection used for paired model-agreement comparisons;
- report global-only, current-only-exclusive, joint, and neither support counts separately; totals across visible states are state-world assignments, not global unique allocations;
- evaluate the same root common-action set under identical continuation policies and deterministic hidden-world ranking; report model-specific regret and its difference from the joint-intersection estimate;
- do not infer voluntary tile choices as facts unless an explicit opponent-choice likelihood is preregistered; pass consistency alone is not full public-history conditioning;
- keep this diagnostic separate from strategy-strength holdouts and do not promote a tactic from stratified hindsight-oracle regret;
