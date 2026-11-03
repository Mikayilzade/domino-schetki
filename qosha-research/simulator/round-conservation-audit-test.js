'use strict';
const audit=require('./round-conservation-audit');
const result=audit.test();
process.stdout.write(JSON.stringify(result,null,2)+'\n');
