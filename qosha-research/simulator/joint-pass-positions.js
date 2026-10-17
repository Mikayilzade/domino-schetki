'use strict';
// Exact joint next-pass disagreement by reachable position, no Monte Carlo.
const {collect}=require('./two-opponent-conditional-holdout');
const {evaluate}=require('./exact-next-pass-hypergeom');
const {features}=require('./equal-pass-reply-overlap');
const {pass}=require('./joint-pass-exact');
function run(start,end,limit){const f=collect(start,end,limit),rows=[];for(const p of f.out){const x=evaluate(p);if(Math.abs(x.passDelta)>1e-12||x.connector.legalUnknown!==x.unrelated.legalUnknown)continue;const z=features(p),n=z.unknownPool,k=x.nextHandSize,m=z.legalUnknown,u=z.legalTileOverlap.union;rows.push({seed:p.seed,turn:p.turn,n,k,m,union:u,exactFlip:2*(pass(n,m,k)-pass(n,u,k))});}return{scanned:f.scanned,eligible:f.out.length,rows};}
if(require.main===module)console.log(JSON.stringify(run(+(process.argv[2]||1020000),+(process.argv[3]||1060000),+(process.argv[4]||96)),null,2));
module.exports={run};
