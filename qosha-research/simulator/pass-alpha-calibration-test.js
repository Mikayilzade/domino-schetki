'use strict';
// Regression: calibration must be sourced from a20-plain even when alpha8 is first.
const {run,test}=require('./joint-pass-memory-runner');
test();
const a=run(1301000,2,[8,20]),b=run(1301000,2,[8,20]);
if(JSON.stringify(a)!==JSON.stringify(b)||a.fullRounds!==72)throw Error('grid replay');
for(const p of a.profiles){
  if(p.calibration.all.n<=0||p.calibration.either.n<=0)throw Error('missing calibration for '+p.profile);
  for(const m of ['plain','one','joint']){
    const v=p.calibration.either.metrics[m].brier;
    if(!Number.isFinite(v)||v<0||v>1)throw Error('invalid Brier '+m);
  }
}
if(require.main===module)console.log(JSON.stringify({passed:true,fullRounds:a.fullRounds,
  calibration:a.profiles.map(p=>({profile:p.profile,all:p.calibration.all.n,either:p.calibration.either.n}))}));
module.exports={passed:true};
