'use strict';
const audit=require('./redeal-full-round-audit');
process.stdout.write(JSON.stringify(audit.test(),null,2)+'\n');
