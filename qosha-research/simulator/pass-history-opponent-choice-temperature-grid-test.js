'use strict';
const grid=require('./pass-history-opponent-choice-temperature-grid');
const result=grid.test();
if(!result.passed||result.assertions<27)throw new Error('temperature-grid regression failed');
process.stdout.write(JSON.stringify(result)+'\n');
