'use strict';
const audit=require('./block-tied-minimum-stratified-audit');
function test(){return audit.test();}
if(require.main===module)console.log(JSON.stringify(test(),null,2));
module.exports={test};