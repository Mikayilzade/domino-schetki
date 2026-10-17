'use strict';
// Nondegenerate deterministic regression for the equal-pass reply-overlap runner.
// node qosha-research/simulator/equal-pass-reply-overlap-test.js
const {collect}=require('./two-opponent-conditional-holdout');
const {features,run}=require('./equal-pass-reply-overlap');
function test(){
 const positions=collect(961282,961283,1).out;
 if(positions.length!==1)throw Error('missing known reachable position 961282');
 const f=features(positions[0]);
 if(f.legalUnknown!==3||f.legalTileOverlap.shared!==2||f.legalTileOverlap.union!==4||f.legalTileOverlap.jaccard!==0.5)throw Error('known overlap fixture changed');
 const a=run(961282,961283,1,2),b=run(961282,961283,1,2);
 if(a.comparedPositions!==1||a.hiddenWorlds!==2||a.continuations!==12)throw Error('expected one paired position, two worlds, three policies');
 if(JSON.stringify(a.rows)!==JSON.stringify(b.rows))throw Error('non-deterministic replay');
 if(a.rows[0].legalTileOverlap.jaccard!==0.5)throw Error('runner feature mismatch');
 return{passed:true,seed:961282,legalOverlap:f.legalTileOverlap,worlds:a.hiddenWorlds,continuations:a.continuations};
}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={test};
