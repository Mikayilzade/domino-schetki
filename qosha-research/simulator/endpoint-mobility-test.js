'use strict';
const x=require('./endpoint-mobility-holdout').selfTest();
if(!x.passed)throw Error('mobility regression failed');
console.log('endpoint mobility regression: ok',x.seed);
