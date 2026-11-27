# 2026-11-27 12:48 Asia/Baku — opening target-specific holdout

Engine qosha-research-0.5.3 / qosa-1.0.0, 3×9+1. Same matched A (owned double first) vs C (ordinary links first) and symmetric continuation as 11:52 cohort, disjoint seeds. Target strata refer to A's chosen number; alternative strata to C's number. Blocks unassigned, branch unlock and loneZero provisional. V8 CommonJS execution, not native full gate. RESULTS.md returned empty; linked prior run is comparison only. Historical 180000 separate. Intervals exploratory and unadjusted. Next: replicate target-specific differences and complete native pinned validation gates. No live files modified.

```json
{
  "shas": {
    "engine": "82e5bd544a57683d5b4f7812beb2d4abf80da894",
    "initializer": "2fad29e516454580ec9a06115354e9866f3096e6",
    "round-driver": "fbaad78865adbddde1ea6651e6a501dc0bde3203",
    "turn-kernel": "94657896e1f8e471ceb2e9a65d1842b6102dff18",
    "turn-dispatcher": "55b0bcf3f1653c64b4e06bc95d7e917a480562a0"
  },
  "start": 26140000,
  "count": 12000,
  "unique": 12000,
  "duplicates": 0,
  "eligible": 7856,
  "disagree": 1757,
  "stats": {
    "min-pips:all": {
      "n": 1757,
      "w": [
        884,
        807
      ],
      "only": [
        380,
        303
      ],
      "pips": [
        4216,
        4873
      ],
      "blocks": [
        58,
        70
      ],
      "turns": [
        41914,
        42424
      ],
      "minus": [
        {
          "0": 789,
          "-10": 94,
          "-20": 1
        },
        {
          "0": 678,
          "-10": 123,
          "-20": 6
        }
      ],
      "endingDoubles": [
        4,
        6
      ],
      "startingDoubles": 3510,
      "median": [
        0,
        1
      ],
      "delta": 0.043824701195219126,
      "ci95": [
        0.014734765116244802,
        0.07291463727419345
      ]
    },
    "min-pips:target2": {
      "n": 312,
      "w": [
        163,
        158
      ],
      "only": [
        67,
        62
      ],
      "pips": [
        762,
        702
      ],
      "blocks": [
        9,
        11
      ],
      "turns": [
        7426,
        7533
      ],
      "minus": [
        {
          "0": 148,
          "-10": 14,
          "-20": 1
        },
        {
          "0": 138,
          "-10": 19,
          "-20": 1
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 632,
      "median": [
        0,
        0
      ],
      "delta": 0.016025641025641024,
      "ci95": [
        -0.05541716640061861,
        0.08746844845190066
      ]
    },
    "min-pips:alternative6": {
      "n": 278,
      "w": [
        153,
        145
      ],
      "only": [
        59,
        51
      ],
      "pips": [
        644,
        658
      ],
      "blocks": [
        4,
        9
      ],
      "turns": [
        6561,
        6731
      ],
      "minus": [
        {
          "0": 130,
          "-10": 22,
          "-20": 1
        },
        {
          "0": 120,
          "-10": 25
        }
      ],
      "endingDoubles": [
        2,
        1
      ],
      "startingDoubles": 571,
      "median": [
        0,
        0
      ],
      "delta": 0.02877697841726619,
      "ci95": [
        -0.04522361357334659,
        0.10277757040787897
      ]
    },
    "moderate-hold:all": {
      "n": 1757,
      "w": [
        827,
        762
      ],
      "only": [
        350,
        285
      ],
      "pips": [
        4784,
        5301
      ],
      "blocks": [
        51,
        54
      ],
      "turns": [
        42558,
        42890
      ],
      "minus": [
        {
          "0": 720,
          "-10": 106,
          "-20": 1
        },
        {
          "0": 658,
          "-10": 101,
          "-20": 3
        }
      ],
      "endingDoubles": [
        4,
        9
      ],
      "startingDoubles": 3510,
      "median": [
        1,
        2
      ],
      "delta": 0.03699487763232783,
      "ci95": [
        0.008929497649857038,
        0.06506025761479863
      ]
    },
    "moderate-hold:target2": {
      "n": 312,
      "w": [
        166,
        155
      ],
      "only": [
        57,
        46
      ],
      "pips": [
        810,
        786
      ],
      "blocks": [
        7,
        7
      ],
      "turns": [
        7547,
        7632
      ],
      "minus": [
        {
          "0": 153,
          "-10": 13
        },
        {
          "0": 136,
          "-10": 19
        }
      ],
      "endingDoubles": [
        0,
        0
      ],
      "startingDoubles": 632,
      "median": [
        0,
        1
      ],
      "delta": 0.035256410256410256,
      "ci95": [
        -0.028481531632150864,
        0.09899435214497138
      ]
    },
    "moderate-hold:alternative6": {
      "n": 278,
      "w": [
        158,
        136
      ],
      "only": [
        65,
        43
      ],
      "pips": [
        644,
        774
      ],
      "blocks": [
        13,
        12
      ],
      "turns": [
        6672,
        6774
      ],
      "minus": [
        {
          "0": 124,
          "-10": 34
        },
        {
          "0": 111,
          "-10": 24,
          "-20": 1
        }
      ],
      "endingDoubles": [
        1,
        1
      ],
      "startingDoubles": 571,
      "median": [
        0,
        1
      ],
      "delta": 0.07913669064748201,
      "ci95": [
        0.0063291038893814044,
        0.1519442774055826
      ]
    },
    "min-pips:target4": {
      "n": 293,
      "w": [
        134,
        109
      ],
      "only": [
        66,
        41
      ],
      "pips": [
        753,
        1053
      ],
      "blocks": [
        10,
        12
      ],
      "turns": [
        7006,
        7122
      ],
      "minus": [
        {
          "0": 118,
          "-10": 16
        },
        {
          "0": 97,
          "-10": 12
        }
      ],
      "endingDoubles": [
        1,
        1
      ],
      "startingDoubles": 579,
      "median": [
        1,
        3
      ],
      "delta": 0.08532423208191127,
      "ci95": [
        0.016704338786727474,
        0.15394412537709506
      ]
    },
    "min-pips:alternative3": {
      "n": 315,
      "w": [
        166,
        147
      ],
      "only": [
        71,
        52
      ],
      "pips": [
        769,
        882
      ],
      "blocks": [
        15,
        13
      ],
      "turns": [
        7479,
        7683
      ],
      "minus": [
        {
          "0": 146,
          "-10": 20
        },
        {
          "0": 119,
          "-10": 26,
          "-20": 2
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 638,
      "median": [
        0,
        1
      ],
      "delta": 0.06031746031746032,
      "ci95": [
        -0.00847737079822903,
        0.12911229143314967
      ]
    },
    "moderate-hold:target4": {
      "n": 293,
      "w": [
        141,
        117
      ],
      "only": [
        68,
        44
      ],
      "pips": [
        687,
        1038
      ],
      "blocks": [
        3,
        13
      ],
      "turns": [
        7132,
        7182
      ],
      "minus": [
        {
          "0": 133,
          "-10": 8
        },
        {
          "0": 107,
          "-10": 9,
          "-20": 1
        }
      ],
      "endingDoubles": [
        1,
        1
      ],
      "startingDoubles": 579,
      "median": [
        1,
        3
      ],
      "delta": 0.08191126279863481,
      "ci95": [
        0.011621101187974617,
        0.15220142440929502
      ]
    },
    "moderate-hold:alternative3": {
      "n": 315,
      "w": [
        136,
        131
      ],
      "only": [
        61,
        56
      ],
      "pips": [
        1025,
        971
      ],
      "blocks": [
        12,
        11
      ],
      "turns": [
        7591,
        7589
      ],
      "minus": [
        {
          "0": 119,
          "-20": 1,
          "-10": 16
        },
        {
          "0": 105,
          "-10": 25,
          "-20": 1
        }
      ],
      "endingDoubles": [
        1,
        3
      ],
      "startingDoubles": 638,
      "median": [
        3,
        2
      ],
      "delta": 0.015873015873015872,
      "ci95": [
        -0.051514826751955234,
        0.08326085849798698
      ]
    },
    "min-pips:target6": {
      "n": 288,
      "w": [
        119,
        120
      ],
      "only": [
        57,
        58
      ],
      "pips": [
        843,
        946
      ],
      "blocks": [
        9,
        10
      ],
      "turns": [
        6846,
        6948
      ],
      "minus": [
        {
          "0": 107,
          "-10": 12
        },
        {
          "0": 99,
          "-10": 20,
          "-20": 1
        }
      ],
      "endingDoubles": [
        1,
        0
      ],
      "startingDoubles": 579,
      "median": [
        2,
        2
      ],
      "delta": -0.003472222222222222,
      "ci95": [
        -0.07657960605012014,
        0.06963516160567569
      ]
    },
    "min-pips:alternative4": {
      "n": 260,
      "w": [
        134,
        141
      ],
      "only": [
        47,
        54
      ],
      "pips": [
        674,
        591
      ],
      "blocks": [
        7,
        9
      ],
      "turns": [
        6179,
        6299
      ],
      "minus": [
        {
          "0": 117,
          "-10": 17
        },
        {
          "0": 117,
          "-10": 22,
          "-20": 2
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 522,
      "median": [
        0,
        0
      ],
      "delta": -0.026923076923076925,
      "ci95": [
        -0.10275894048684744,
        0.048912786640693595
      ]
    },
    "moderate-hold:target6": {
      "n": 288,
      "w": [
        104,
        122
      ],
      "only": [
        44,
        62
      ],
      "pips": [
        999,
        968
      ],
      "blocks": [
        5,
        8
      ],
      "turns": [
        6925,
        7011
      ],
      "minus": [
        {
          "0": 93,
          "-10": 11
        },
        {
          "0": 103,
          "-10": 19
        }
      ],
      "endingDoubles": [
        0,
        0
      ],
      "startingDoubles": 579,
      "median": [
        3,
        2
      ],
      "delta": -0.0625,
      "ci95": [
        -0.1323159844177306,
        0.007315984417730598
      ]
    },
    "moderate-hold:alternative4": {
      "n": 260,
      "w": [
        122,
        118
      ],
      "only": [
        43,
        39
      ],
      "pips": [
        754,
        725
      ],
      "blocks": [
        10,
        8
      ],
      "turns": [
        6332,
        6392
      ],
      "minus": [
        {
          "0": 104,
          "-10": 18
        },
        {
          "0": 100,
          "-10": 18
        }
      ],
      "endingDoubles": [
        1,
        1
      ],
      "startingDoubles": 522,
      "median": [
        1,
        1
      ],
      "delta": 0.015384615384615385,
      "ci95": [
        -0.05298504428270888,
        0.08375427505193965
      ]
    },
    "min-pips:target0": {
      "n": 305,
      "w": [
        202,
        182
      ],
      "only": [
        69,
        49
      ],
      "pips": [
        599,
        455
      ],
      "blocks": [
        9,
        17
      ],
      "turns": [
        7177,
        7359
      ],
      "minus": [
        {
          "0": 175,
          "-10": 27
        },
        {
          "0": 131,
          "-10": 50,
          "-20": 1
        }
      ],
      "endingDoubles": [
        2,
        3
      ],
      "startingDoubles": 590,
      "median": [
        0,
        0
      ],
      "delta": 0.06557377049180328,
      "ci95": [
        -0.003958023409178349,
        0.13510556439278493
      ]
    },
    "moderate-hold:target0": {
      "n": 305,
      "w": [
        168,
        140
      ],
      "only": [
        73,
        45
      ],
      "pips": [
        772,
        718
      ],
      "blocks": [
        12,
        9
      ],
      "turns": [
        7373,
        7457
      ],
      "minus": [
        {
          "0": 123,
          "-10": 45
        },
        {
          "0": 111,
          "-10": 29
        }
      ],
      "endingDoubles": [
        3,
        6
      ],
      "startingDoubles": 590,
      "median": [
        0,
        1
      ],
      "delta": 0.09180327868852459,
      "ci95": [
        0.022647610396248644,
        0.16095894698080054
      ]
    },
    "min-pips:target5": {
      "n": 273,
      "w": [
        129,
        119
      ],
      "only": [
        57,
        47
      ],
      "pips": [
        610,
        880
      ],
      "blocks": [
        14,
        10
      ],
      "turns": [
        6579,
        6579
      ],
      "minus": [
        {
          "0": 119,
          "-10": 10
        },
        {
          "0": 110,
          "-10": 7,
          "-20": 2
        }
      ],
      "endingDoubles": [
        0,
        0
      ],
      "startingDoubles": 561,
      "median": [
        1,
        2
      ],
      "delta": 0.03663003663003663,
      "ci95": [
        -0.03659183015797563,
        0.1098519034180489
      ]
    },
    "min-pips:alternative2": {
      "n": 306,
      "w": [
        132,
        120
      ],
      "only": [
        63,
        51
      ],
      "pips": [
        800,
        1001
      ],
      "blocks": [
        12,
        10
      ],
      "turns": [
        7426,
        7318
      ],
      "minus": [
        {
          "0": 119,
          "-10": 13
        },
        {
          "0": 103,
          "-10": 17
        }
      ],
      "endingDoubles": [
        2,
        2
      ],
      "startingDoubles": 587,
      "median": [
        2,
        2
      ],
      "delta": 0.0392156862745098,
      "ci95": [
        -0.029143932525122887,
        0.1075753050741425
      ]
    },
    "moderate-hold:target5": {
      "n": 273,
      "w": [
        116,
        98
      ],
      "only": [
        57,
        39
      ],
      "pips": [
        860,
        977
      ],
      "blocks": [
        12,
        9
      ],
      "turns": [
        6635,
        6665
      ],
      "minus": [
        {
          "0": 107,
          "-10": 8,
          "-20": 1
        },
        {
          "0": 88,
          "-10": 10
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 561,
      "median": [
        2,
        3
      ],
      "delta": 0.06593406593406594,
      "ci95": [
        -0.004102471693476453,
        0.13597060356160834
      ]
    },
    "moderate-hold:alternative2": {
      "n": 306,
      "w": [
        117,
        112
      ],
      "only": [
        56,
        51
      ],
      "pips": [
        897,
        1062
      ],
      "blocks": [
        4,
        10
      ],
      "turns": [
        7423,
        7389
      ],
      "minus": [
        {
          "0": 103,
          "-10": 14
        },
        {
          "0": 99,
          "-10": 13
        }
      ],
      "endingDoubles": [
        1,
        3
      ],
      "startingDoubles": 587,
      "median": [
        3,
        2
      ],
      "delta": 0.016339869281045753,
      "ci95": [
        -0.04999951894659267,
        0.08267925750868417
      ]
    },
    "min-pips:alternative5": {
      "n": 301,
      "w": [
        156,
        146
      ],
      "only": [
        61,
        51
      ],
      "pips": [
        816,
        777
      ],
      "blocks": [
        8,
        9
      ],
      "turns": [
        7077,
        7267
      ],
      "minus": [
        {
          "0": 137,
          "-10": 19
        },
        {
          "0": 115,
          "-10": 29,
          "-20": 2
        }
      ],
      "endingDoubles": [
        0,
        0
      ],
      "startingDoubles": 601,
      "median": [
        0,
        1
      ],
      "delta": 0.03322259136212625,
      "ci95": [
        -0.03570230564758143,
        0.10214748837183393
      ]
    },
    "moderate-hold:alternative5": {
      "n": 301,
      "w": [
        161,
        147
      ],
      "only": [
        66,
        52
      ],
      "pips": [
        828,
        792
      ],
      "blocks": [
        6,
        5
      ],
      "turns": [
        7259,
        7410
      ],
      "minus": [
        {
          "0": 137,
          "-10": 24
        },
        {
          "0": 126,
          "-10": 20,
          "-20": 1
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 601,
      "median": [
        0,
        1
      ],
      "delta": 0.046511627906976744,
      "ci95": [
        -0.024144786001405585,
        0.11716804181535907
      ]
    },
    "min-pips:alternative0": {
      "n": 297,
      "w": [
        143,
        108
      ],
      "only": [
        79,
        44
      ],
      "pips": [
        513,
        964
      ],
      "blocks": [
        12,
        20
      ],
      "turns": [
        7192,
        7126
      ],
      "minus": [
        {
          "0": 140,
          "-10": 3
        },
        {
          "0": 104,
          "-10": 4
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 591,
      "median": [
        1,
        2
      ],
      "delta": 0.11784511784511785,
      "ci95": [
        0.0457712174986996,
        0.18991901819153612
      ]
    },
    "moderate-hold:alternative0": {
      "n": 297,
      "w": [
        133,
        118
      ],
      "only": [
        59,
        44
      ],
      "pips": [
        636,
        977
      ],
      "blocks": [
        6,
        8
      ],
      "turns": [
        7281,
        7336
      ],
      "minus": [
        {
          "0": 133
        },
        {
          "0": 117,
          "-10": 1
        }
      ],
      "endingDoubles": [
        0,
        0
      ],
      "startingDoubles": 591,
      "median": [
        1,
        2
      ],
      "delta": 0.050505050505050504,
      "ci95": [
        -0.01633666080491427,
        0.11734676181501527
      ]
    },
    "min-pips:target3": {
      "n": 286,
      "w": [
        137,
        119
      ],
      "only": [
        64,
        46
      ],
      "pips": [
        649,
        837
      ],
      "blocks": [
        7,
        10
      ],
      "turns": [
        6880,
        6883
      ],
      "minus": [
        {
          "0": 122,
          "-10": 15
        },
        {
          "0": 103,
          "-10": 15,
          "-20": 1
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 569,
      "median": [
        1,
        2
      ],
      "delta": 0.06293706293706294,
      "ci95": [
        -0.008693607747572427,
        0.13456773362169833
      ]
    },
    "moderate-hold:target3": {
      "n": 286,
      "w": [
        132,
        130
      ],
      "only": [
        51,
        49
      ],
      "pips": [
        656,
        814
      ],
      "blocks": [
        12,
        8
      ],
      "turns": [
        6946,
        6943
      ],
      "minus": [
        {
          "0": 111,
          "-10": 21
        },
        {
          "0": 113,
          "-10": 15,
          "-20": 2
        }
      ],
      "endingDoubles": [
        0,
        1
      ],
      "startingDoubles": 569,
      "median": [
        1,
        1.5
      ],
      "delta": 0.006993006993006993,
      "ci95": [
        -0.06165378592551664,
        0.07563979991153062
      ]
    }
  }
}
```

Reproduction:
```js
function experiment(e,i,r){const start=26140000,count=12000,stats={},seen=new Set();let eligible=0,disagree=0,duplicates=0;const key=e.tileKey;for(let seed=start;seed<start+count;seed++){const deal=e.dealThreeByNine(seed),id=deal.hands.map(h=>h.map(key).sort().join(",")).join("|")+"|"+key(deal.stock[0]);if(seen.has(id)){duplicates++;continue}seen.add(id);if(key(deal.stock[0])==="1-1")continue;const base=i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true}),p=base.starter,hand=deal.hands[p].filter(t=>key(t)!=="1-1").concat(deal.stock),choices=hand.filter(t=>t[0]!==t[1]&&t.includes(1));if(choices.length<2)continue;eligible++;const x=t=>t[0]===1?t[1]:t[0],owned=t=>+hand.some(h=>h[0]===x(t)&&h[1]===x(t)),links=t=>hand.filter(h=>h!==t&&h[0]!==h[1]&&h.includes(x(t))).length,tie=t=>e.mixSeed32(seed^Math.imul(x(t)+1,0x9e3779b9));const a=[...choices].sort((a,b)=>owned(b)-owned(a)||links(b)-links(a)||tie(b)-tie(a))[0],c=[...choices].sort((a,b)=>links(b)-links(a)||owned(b)-owned(a)||tie(b)-tie(a))[0];if(key(a)===key(c))continue;disagree++;for(const policy of ["min-pips","moderate-hold"]){const choose=(opts,state)=>{const score=z=>{const ts=z.type==="single"?[z.tile]:z.tiles;return (z.type==="mixed-finish"?1000:0)+e.pipSum(ts)-(policy==="moderate-hold"&&opts.hand.length>4?3*ts.filter(t=>t[0]===t[1]).length:0)};const max=Math.max(...opts.actions.map(score)),groups={};for(const z of opts.actions.filter(z=>score(z)===max)){const b=z.side?state.branchState.branches[z.side]:null,k=JSON.stringify([z.type,z.tile||null,z.numbers||[],b?.end??null,z.to??null]);(groups[k]??=[]).push(z)}const ks=Object.keys(groups).sort(),h=e.mixSeed32(seed^Math.imul(state.turns+1,0x85ebca6b)^state.currentPlayer),g=groups[ks[h%ks.length]];return g[e.mixSeed32(h)%g.length]};const outs=[a,c].map(tile=>r.runRound(i.initializeThreePlayerRoundFromDeal({...deal,isFirstRound:true,chooseFollowup:opts=>opts.find(o=>key(o.tile)===key(tile))}),choose));const wins=outs.map(o=>+(o.outcome.kind==="finish"&&o.outcome.playerIndex===p));for(const stratum of ["all","target"+x(a),"alternative"+x(c)]){const k=stats[policy+":"+stratum]??={n:0,w:[0,0],only:[0,0],pips:[0,0],blocks:[0,0],turns:[0,0],minus:[{},{}],rem:[[],[]],endingDoubles:[0,0],startingDoubles:0};k.n++;k.startingDoubles+=hand.filter(t=>t[0]===t[1]).length;for(let j=0;j<2;j++){const o=outs[j],pip=e.pipSum(o.hands[p]);k.w[j]+=wins[j];k.only[j]+=+(wins[j]&&!wins[1-j]);k.pips[j]+=pip;k.rem[j].push(pip);k.blocks[j]+=+(o.outcome.kind==="block");k.turns[j]+=o.turns;k.endingDoubles[j]+=o.hands[p].filter(t=>t[0]===t[1]).length;if(wins[j]){const m=o.outcome.minus||0;k.minus[j][m]=(k.minus[j][m]||0)+1}}}}}for(const k of Object.values(stats)){k.median=k.rem.map(a=>{a.sort((a,b)=>a-b);return(a[Math.floor((a.length-1)/2)]+a[Math.floor(a.length/2)])/2});delete k.rem;const d=(k.only[0]-k.only[1])/k.n,se=Math.sqrt(((k.only[0]+k.only[1])/k.n-d*d)/(k.n-1));k.delta=d;k.ci95=[d-1.96*se,d+1.96*se]}return{start,count,unique:seen.size,duplicates,eligible,disagree,stats}}

```
