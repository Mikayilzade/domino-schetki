'use strict';
// Joint next-pass probability under uniform hidden hands.
function pass(n,m,k){if(k>n-m)return 0;let p=1;for(let i=0;i<k;i++)p*=(n-m-i)/(n-i);return p;}
function joint(n,k,a,b){const union=new Set([...a,...b]).size;return pass(n,a.length,k)+pass(n,b.length,k)-2*pass(n,union,k);}
module.exports={pass,joint};
