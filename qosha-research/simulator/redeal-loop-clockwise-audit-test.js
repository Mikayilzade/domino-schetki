'use strict';
const audit=require('./redeal-loop-clockwise-audit');
process.stdout.write(JSON.stringify(audit.test(),null,2)+'\n');
