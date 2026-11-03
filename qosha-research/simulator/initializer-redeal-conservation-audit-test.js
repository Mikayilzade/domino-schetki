'use strict';
const audit = require('./initializer-redeal-conservation-audit');
process.stdout.write(JSON.stringify(audit.test(), null, 2) + '\n');
