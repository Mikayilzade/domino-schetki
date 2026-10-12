'use strict';
function passChance(n,l,h){let p=1;for(let i=0;i<h;i++)p*=(n-l-i)/(n-i);return p;}
module.exports={passChance};
