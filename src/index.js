/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import entity2element from './entity2element'
import { NLDComponents } from './NLDComponents'
import { BASIC_SVG_ELEMENTS, COMMON_STYLE_CHANNELS, CONNECTOR_CHAR } from './global'

/**
 *
 * @param {string} code
 * @param {standard node-link data format} data
 */
function detector(code, data) {
    const beginTime = performance.now()
    // eslint-disable-next-line no-new-func
    const func = new Function('d3', 'data', code)
    const svg = func(d3, data)
    const nldComponents = new NLDComponents(svg)

    // Step1: Map Entities to Elements, Map Attributes to Channels
    // entity2element: [[entityIndex]: Set(elementIndex)]
    // entityAttr2channel:
    // [[entityIndex]: {
    //   [entityAttributeName]: {
    //      [elementIndex]: {tagName, style, ...}
    //   }
    // }]
    const { node2element, link2element, nodeAttr2channel, linkAttr2channel } = {
        node2element: [
            [304, 305, 306, 307],
            [300, 301, 302, 303],
            [296, 297, 298, 299],
            [292, 293, 294, 295],
            [288, 289, 290, 291],
            [284, 285, 286, 287],
            [280, 281, 282, 283],
            [276, 277, 278, 279],
            [272, 273, 274, 275],
            [268, 269, 270, 271],
            [264, 265, 266, 267],
            [260, 261, 262, 263],
            [259, 256, 257, 258],
            [252, 253, 254, 255],
            [248, 249, 250, 251],
            [244, 245, 246, 247],
            [243, 240, 241, 242],
            [239, 236, 237, 238],
            [235, 232, 233, 234],
            [231, 228, 229, 230],
            [227, 224, 225, 226],
            [223, 220, 221, 222],
            [219, 216, 217, 218],
            [215, 212, 213, 214],
            [208, 209, 210, 211],
            [204, 205, 206, 207],
            [203, 200, 201, 202],
            [196, 197, 198, 199],
            [192, 193, 194, 195],
            [188, 189, 190, 191],
            [187, 184, 185, 186],
            [180, 181, 182, 183],
            [176, 177, 178, 179],
            [172, 173, 174, 175],
            [168, 169, 170, 171],
            [164, 165, 166, 167],
            [160, 161, 162, 163],
            [156, 157, 158, 159],
            [152, 153, 154, 155],
            [148, 149, 150, 151],
            [144, 145, 146, 147],
            [140, 141, 142, 143],
            [136, 137, 138, 139],
            [135, 132, 133, 134],
            [128, 129, 130, 131],
            [124, 125, 126, 127],
            [123, 120, 121, 122],
            [119, 116, 117, 118],
            [112, 113, 114, 115],
            [111, 108, 109, 110],
            [107, 104, 105, 106],
            [103, 100, 101, 102],
            [99, 96, 97, 98],
            [95, 92, 93, 94],
            [91, 88, 89, 90],
            [84, 85, 86, 87],
            [83, 80, 81, 82],
            [76, 77, 78, 79],
            [72, 73, 74, 75],
            [68, 69, 70, 71],
            [64, 65, 66, 67],
            [60, 61, 62, 63],
            [56, 57, 58, 59],
            [52, 53, 54, 55],
            [48, 49, 50, 51],
            [44, 45, 46, 47],
            [40, 41, 42, 43],
            [39, 36, 37, 38],
            [32, 33, 34, 35],
            [28, 29, 30, 31],
            [24, 25, 26, 27],
            [20, 21, 22, 23],
            [19, 16, 17, 18],
            [12, 13, 14, 15],
            [8, 9, 10, 11],
            [4, 5, 6, 7],
            [0, 1, 2, 3]
        ],
        link2element: [
            [561],
            [560],
            [559],
            [558],
            [557],
            [556],
            [555],
            [554],
            [553],
            [552],
            [551],
            [550],
            [549],
            [548],
            [547],
            [546],
            [545],
            [544],
            [543],
            [542],
            [541],
            [540],
            [539],
            [538],
            [537],
            [536],
            [535],
            [534],
            [533],
            [532],
            [531],
            [530],
            [529],
            [528],
            [527],
            [526],
            [525],
            [524],
            [523],
            [522],
            [521],
            [520],
            [519],
            [518],
            [517],
            [516],
            [515],
            [514],
            [513],
            [512],
            [511],
            [510],
            [509],
            [508],
            [507],
            [506],
            [505],
            [504],
            [503],
            [502],
            [501],
            [500],
            [499],
            [498],
            [497],
            [496],
            [495],
            [494],
            [493],
            [492],
            [491],
            [490],
            [489],
            [488],
            [487],
            [486],
            [485],
            [484],
            [483],
            [482],
            [481],
            [480],
            [479],
            [478],
            [477],
            [476],
            [475],
            [474],
            [473],
            [472],
            [471],
            [470],
            [469],
            [468],
            [467],
            [466],
            [465],
            [464],
            [463],
            [462],
            [461],
            [460],
            [459],
            [458],
            [457],
            [456],
            [455],
            [454],
            [453],
            [452],
            [451],
            [450],
            [449],
            [448],
            [447],
            [446],
            [445],
            [444],
            [443],
            [442],
            [441],
            [440],
            [439],
            [438],
            [437],
            [436],
            [435],
            [434],
            [433],
            [432],
            [431],
            [430],
            [429],
            [428],
            [427],
            [426],
            [425],
            [424],
            [423],
            [422],
            [421],
            [420],
            [419],
            [418],
            [417],
            [416],
            [415],
            [414],
            [413],
            [412],
            [411],
            [410],
            [409],
            [408],
            [407],
            [406],
            [405],
            [404],
            [403],
            [402],
            [401],
            [400],
            [399],
            [398],
            [397],
            [396],
            [395],
            [394],
            [393],
            [392],
            [391],
            [390],
            [389],
            [388],
            [387],
            [386],
            [385],
            [384],
            [383],
            [382],
            [381],
            [380],
            [379],
            [378],
            [377],
            [376],
            [375],
            [374],
            [373],
            [372],
            [371],
            [370],
            [369],
            [368],
            [367],
            [366],
            [365],
            [364],
            [363],
            [362],
            [361],
            [360],
            [359],
            [358],
            [357],
            [356],
            [355],
            [354],
            [353],
            [352],
            [351],
            [350],
            [349],
            [348],
            [347],
            [346],
            [345],
            [344],
            [343],
            [342],
            [341],
            [340],
            [339],
            [338],
            [337],
            [336],
            [335],
            [334],
            [333],
            [332],
            [331],
            [330],
            [329],
            [328],
            [327],
            [326],
            [325],
            [324],
            [323],
            [322],
            [321],
            [320],
            [319],
            [318],
            [317],
            [316],
            [315],
            [314],
            [313],
            [312],
            [311],
            [310],
            [309],
            [308]
        ],
        nodeAttr2channel: [
            {
                group: {
                    304: { tagName: true },
                    305: { tagName: true },
                    306: { tagName: true },
                    307: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    304: { style: { y: true, height: true } },
                    305: { style: { y: true, height: true } },
                    306: { style: { height: true } }
                }
            },
            {
                group: {
                    300: { tagName: true },
                    301: { tagName: true },
                    302: { tagName: true },
                    303: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    300: { style: { y: true, height: true } },
                    301: { style: { y: true, height: true } },
                    302: { style: { height: true } }
                }
            },
            {
                group: {
                    296: { tagName: true },
                    297: { tagName: true },
                    298: { tagName: true },
                    299: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    296: { style: { y: true, height: true } },
                    297: { style: { y: true, height: true } },
                    298: { style: { height: true } }
                }
            },
            {
                group: {
                    292: { tagName: true },
                    293: { tagName: true },
                    294: { tagName: true },
                    295: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    292: { style: { y: true, height: true } },
                    293: { style: { y: true, height: true } },
                    294: { style: { height: true } }
                }
            },
            {
                group: {
                    288: { tagName: true },
                    289: { tagName: true },
                    290: { tagName: true },
                    291: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    288: { style: { y: true, height: true } },
                    289: { style: { y: true, height: true } },
                    290: { style: { height: true } }
                }
            },
            {
                group: {
                    284: { tagName: true },
                    285: { tagName: true },
                    286: { tagName: true },
                    287: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    284: { style: { y: true, height: true } },
                    285: { style: { y: true, height: true } },
                    286: { style: { height: true } }
                }
            },
            {
                group: {
                    280: { tagName: true },
                    281: { tagName: true },
                    282: { tagName: true },
                    283: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    280: { style: { y: true, height: true } },
                    281: { style: { y: true, height: true } },
                    282: { style: { height: true } }
                }
            },
            {
                group: {
                    276: { tagName: true },
                    277: { tagName: true },
                    278: { tagName: true },
                    279: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    276: { style: { y: true, height: true } },
                    277: { style: { y: true, height: true } },
                    278: { style: { height: true } }
                }
            },
            {
                group: {
                    272: { tagName: true },
                    273: { tagName: true },
                    274: { tagName: true },
                    275: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    272: { style: { y: true, height: true } },
                    273: { style: { y: true, height: true } },
                    274: { style: { height: true } }
                }
            },
            {
                group: {
                    268: { tagName: true },
                    269: { tagName: true },
                    270: { tagName: true },
                    271: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    268: { style: { y: true, height: true } },
                    269: { style: { y: true, height: true } },
                    270: { style: { height: true } }
                }
            },
            {
                group: {
                    264: { tagName: true },
                    265: { tagName: true },
                    266: { tagName: true },
                    267: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    264: { style: { cy: true, ry: true } },
                    265: { style: { cy: true, ry: true } },
                    266: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    260: { tagName: true },
                    261: { tagName: true },
                    262: { tagName: true },
                    263: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    260: { style: { cy: true, ry: true } },
                    261: { style: { cy: true, ry: true } },
                    262: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 259: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    256: { style: { y: true, height: true } },
                    257: { style: { y: true, height: true } },
                    258: { style: { height: true } }
                }
            },
            {
                group: {
                    252: { tagName: true },
                    253: { tagName: true },
                    254: { tagName: true },
                    255: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    252: { style: { cy: true, ry: true } },
                    253: { style: { cy: true, ry: true } },
                    254: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    248: { tagName: true },
                    249: { tagName: true },
                    250: { tagName: true },
                    251: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    248: { style: { cy: true, ry: true } },
                    249: { style: { cy: true, ry: true } },
                    250: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    244: { tagName: true },
                    245: { tagName: true },
                    246: { tagName: true },
                    247: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    244: { style: { cy: true, ry: true } },
                    245: { style: { cy: true, ry: true } },
                    246: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 243: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    240: { style: { y: true, height: true } },
                    241: { style: { y: true, height: true } },
                    242: { style: { height: true } }
                }
            },
            {
                group: { 239: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    236: { style: { y: true, height: true } },
                    237: { style: { y: true, height: true } },
                    238: { style: { height: true } }
                }
            },
            {
                group: { 235: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    232: { style: { y: true, height: true } },
                    233: { style: { y: true, height: true } },
                    234: { style: { height: true } }
                }
            },
            {
                group: { 231: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    228: { style: { y: true, height: true } },
                    229: { style: { y: true, height: true } },
                    230: { style: { height: true } }
                }
            },
            {
                group: { 227: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    224: { style: { y: true, height: true } },
                    225: { style: { y: true, height: true } },
                    226: { style: { height: true } }
                }
            },
            {
                group: { 223: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    220: { style: { y: true, height: true } },
                    221: { style: { y: true, height: true } },
                    222: { style: { height: true } }
                }
            },
            {
                group: { 219: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    216: { style: { y: true, height: true } },
                    217: { style: { y: true, height: true } },
                    218: { style: { height: true } }
                }
            },
            {
                group: { 215: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    212: { style: { y: true, height: true } },
                    213: { style: { y: true, height: true } },
                    214: { style: { height: true } }
                }
            },
            {
                group: {
                    208: { tagName: true },
                    209: { tagName: true },
                    210: { tagName: true },
                    211: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    208: { style: { cy: true, ry: true } },
                    209: { style: { cy: true, ry: true } },
                    210: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    204: { tagName: true },
                    205: { tagName: true },
                    206: { tagName: true },
                    207: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    204: { style: { cy: true, ry: true } },
                    205: { style: { cy: true, ry: true } },
                    206: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 203: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    200: { style: { y: true, height: true } },
                    201: { style: { y: true, height: true } },
                    202: { style: { height: true } }
                }
            },
            {
                group: {
                    196: { tagName: true },
                    197: { tagName: true },
                    198: { tagName: true },
                    199: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    196: { style: { cy: true, ry: true } },
                    197: { style: { cy: true, ry: true } },
                    198: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    192: { tagName: true },
                    193: { tagName: true },
                    194: { tagName: true },
                    195: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    192: { style: { cy: true, ry: true } },
                    193: { style: { cy: true, ry: true } },
                    194: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    188: { tagName: true },
                    189: { tagName: true },
                    190: { tagName: true },
                    191: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    188: { style: { cy: true, ry: true } },
                    189: { style: { cy: true, ry: true } },
                    190: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 187: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    184: { style: { y: true, height: true } },
                    185: { style: { y: true, height: true } },
                    186: { style: { height: true } }
                }
            },
            {
                group: {
                    180: { tagName: true },
                    181: { tagName: true },
                    182: { tagName: true },
                    183: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    180: { style: { cy: true, ry: true } },
                    181: { style: { cy: true, ry: true } },
                    182: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    176: { tagName: true },
                    177: { tagName: true },
                    178: { tagName: true },
                    179: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    176: { style: { cy: true, ry: true } },
                    177: { style: { cy: true, ry: true } },
                    178: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    172: { tagName: true },
                    173: { tagName: true },
                    174: { tagName: true },
                    175: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    172: { style: { cy: true, ry: true } },
                    173: { style: { cy: true, ry: true } },
                    174: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    168: { tagName: true },
                    169: { tagName: true },
                    170: { tagName: true },
                    171: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    168: { style: { cy: true, ry: true } },
                    169: { style: { cy: true, ry: true } },
                    170: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    164: { tagName: true },
                    165: { tagName: true },
                    166: { tagName: true },
                    167: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    164: { style: { cy: true, ry: true } },
                    165: { style: { cy: true, ry: true } },
                    166: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    160: { tagName: true },
                    161: { tagName: true },
                    162: { tagName: true },
                    163: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    160: { style: { cy: true, ry: true } },
                    161: { style: { cy: true, ry: true } },
                    162: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    156: { tagName: true },
                    157: { tagName: true },
                    158: { tagName: true },
                    159: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    156: { style: { cy: true, ry: true } },
                    157: { style: { cy: true, ry: true } },
                    158: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    152: { tagName: true },
                    153: { tagName: true },
                    154: { tagName: true },
                    155: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    152: { style: { cy: true, ry: true } },
                    153: { style: { cy: true, ry: true } },
                    154: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    148: { tagName: true },
                    149: { tagName: true },
                    150: { tagName: true },
                    151: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    148: { style: { cy: true, ry: true } },
                    149: { style: { cy: true, ry: true } },
                    150: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    144: { tagName: true },
                    145: { tagName: true },
                    146: { tagName: true },
                    147: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    144: { style: { cy: true, ry: true } },
                    145: { style: { cy: true, ry: true } },
                    146: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    140: { tagName: true },
                    141: { tagName: true },
                    142: { tagName: true },
                    143: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    140: { style: { cy: true, ry: true } },
                    141: { style: { cy: true, ry: true } },
                    142: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    136: { tagName: true },
                    137: { tagName: true },
                    138: { tagName: true },
                    139: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    136: { style: { cy: true, ry: true } },
                    137: { style: { cy: true, ry: true } },
                    138: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 135: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    132: { style: { y: true, height: true } },
                    133: { style: { y: true, height: true } },
                    134: { style: { height: true } }
                }
            },
            {
                group: {
                    128: { tagName: true },
                    129: { tagName: true },
                    130: { tagName: true },
                    131: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    128: { style: { cy: true, ry: true } },
                    129: { style: { cy: true, ry: true } },
                    130: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    124: { tagName: true },
                    125: { tagName: true },
                    126: { tagName: true },
                    127: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    124: { style: { cy: true, ry: true } },
                    125: { style: { cy: true, ry: true } },
                    126: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 123: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    120: { style: { y: true, height: true } },
                    121: { style: { y: true, height: true } },
                    122: { style: { height: true } }
                }
            },
            {
                group: { 119: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    116: { style: { y: true, height: true } },
                    117: { style: { y: true, height: true } },
                    118: { style: { height: true } }
                }
            },
            {
                group: {
                    112: { tagName: true },
                    113: { tagName: true },
                    114: { tagName: true },
                    115: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    112: { style: { cy: true, ry: true } },
                    113: { style: { cy: true, ry: true } },
                    114: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 111: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    108: { style: { y: true, height: true } },
                    109: { style: { y: true, height: true } },
                    110: { style: { height: true } }
                }
            },
            {
                group: { 107: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    104: { style: { y: true, height: true } },
                    105: { style: { y: true, height: true } },
                    106: { style: { height: true } }
                }
            },
            {
                group: { 103: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    100: { style: { y: true, height: true } },
                    101: { style: { y: true, height: true } },
                    102: { style: { height: true } }
                }
            },
            {
                group: { 99: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    96: { style: { y: true, height: true } },
                    97: { style: { y: true, height: true } },
                    98: { style: { height: true } }
                }
            },
            {
                group: { 95: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    92: { style: { y: true, height: true } },
                    93: { style: { y: true, height: true } },
                    94: { style: { height: true } }
                }
            },
            {
                group: { 91: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    88: { style: { y: true, height: true } },
                    89: { style: { y: true, height: true } },
                    90: { style: { height: true } }
                }
            },
            {
                group: {
                    84: { tagName: true },
                    85: { tagName: true },
                    86: { tagName: true },
                    87: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    84: { style: { cy: true, ry: true } },
                    85: { style: { cy: true, ry: true } },
                    86: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 83: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    80: { style: { y: true, height: true } },
                    81: { style: { y: true, height: true } },
                    82: { style: { height: true } }
                }
            },
            {
                group: {
                    76: { tagName: true },
                    77: { tagName: true },
                    78: { tagName: true },
                    79: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    76: { style: { cy: true, ry: true } },
                    77: { style: { cy: true, ry: true } },
                    78: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    72: { tagName: true },
                    73: { tagName: true },
                    74: { tagName: true },
                    75: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    72: { style: { cy: true, ry: true } },
                    73: { style: { cy: true, ry: true } },
                    74: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    68: { tagName: true },
                    69: { tagName: true },
                    70: { tagName: true },
                    71: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    68: { style: { cy: true, ry: true } },
                    69: { style: { cy: true, ry: true } },
                    70: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    64: { tagName: true },
                    65: { tagName: true },
                    66: { tagName: true },
                    67: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    64: { style: { cy: true, ry: true } },
                    65: { style: { cy: true, ry: true } },
                    66: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    60: { tagName: true },
                    61: { tagName: true },
                    62: { tagName: true },
                    63: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    60: { style: { cy: true, ry: true } },
                    61: { style: { cy: true, ry: true } },
                    62: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    56: { tagName: true },
                    57: { tagName: true },
                    58: { tagName: true },
                    59: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    56: { style: { cy: true, ry: true } },
                    57: { style: { cy: true, ry: true } },
                    58: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    52: { tagName: true },
                    53: { tagName: true },
                    54: { tagName: true },
                    55: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    52: { style: { cy: true, ry: true } },
                    53: { style: { cy: true, ry: true } },
                    54: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    48: { tagName: true },
                    49: { tagName: true },
                    50: { tagName: true },
                    51: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    48: { style: { cy: true, ry: true } },
                    49: { style: { cy: true, ry: true } },
                    50: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    44: { tagName: true },
                    45: { tagName: true },
                    46: { tagName: true },
                    47: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    44: { style: { cy: true, ry: true } },
                    45: { style: { cy: true, ry: true } },
                    46: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    40: { tagName: true },
                    41: { tagName: true },
                    42: { tagName: true },
                    43: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    40: { style: { cy: true, ry: true } },
                    41: { style: { cy: true, ry: true } },
                    42: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 39: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    36: { style: { y: true, height: true } },
                    37: { style: { y: true, height: true } },
                    38: { style: { height: true } }
                }
            },
            {
                group: {
                    32: { tagName: true },
                    33: { tagName: true },
                    34: { tagName: true },
                    35: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    32: { style: { cy: true, ry: true } },
                    33: { style: { cy: true, ry: true } },
                    34: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    28: { tagName: true },
                    29: { tagName: true },
                    30: { tagName: true },
                    31: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    28: { style: { cy: true, ry: true } },
                    29: { style: { cy: true, ry: true } },
                    30: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    24: { tagName: true },
                    25: { tagName: true },
                    26: { tagName: true },
                    27: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    24: { style: { cy: true, ry: true } },
                    25: { style: { cy: true, ry: true } },
                    26: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    20: { tagName: true },
                    21: { tagName: true },
                    22: { tagName: true },
                    23: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    20: { style: { cy: true, ry: true } },
                    21: { style: { cy: true, ry: true } },
                    22: { style: { cy: true, ry: true } }
                }
            },
            {
                group: { 19: { style: { fill: true } } },
                x: {},
                y: {},
                percents: {
                    16: { style: { y: true, height: true } },
                    17: { style: { y: true, height: true } },
                    18: { style: { height: true } }
                }
            },
            {
                group: {
                    12: { tagName: true },
                    13: { tagName: true },
                    14: { tagName: true },
                    15: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    12: { style: { cy: true, ry: true } },
                    13: { style: { cy: true, ry: true } },
                    14: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    8: { tagName: true },
                    9: { tagName: true },
                    10: { tagName: true },
                    11: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    8: { style: { cy: true, ry: true } },
                    9: { style: { cy: true, ry: true } },
                    10: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    4: { tagName: true },
                    5: { tagName: true },
                    6: { tagName: true },
                    7: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    4: { style: { cy: true, ry: true } },
                    5: { style: { cy: true, ry: true } },
                    6: { style: { cy: true, ry: true } }
                }
            },
            {
                group: {
                    0: { tagName: true },
                    1: { tagName: true },
                    2: { tagName: true },
                    3: { style: { fill: true } }
                },
                x: {},
                y: {},
                percents: {
                    0: { style: { cy: true, ry: true } },
                    1: { style: { cy: true, ry: true } },
                    2: { style: { cy: true, ry: true } }
                }
            }
        ],
        linkAttr2channel: [
            { value: { 561: { style: { 'stroke-width': true } } } },
            { value: { 560: { style: { 'stroke-width': true } } } },
            { value: { 559: { style: { 'stroke-width': true } } } },
            { value: { 558: { style: { 'stroke-width': true } } } },
            { value: { 557: { style: { 'stroke-width': true } } } },
            { value: { 556: { style: { 'stroke-width': true } } } },
            { value: { 555: { style: { 'stroke-width': true } } } },
            { value: { 554: { style: { 'stroke-width': true } } } },
            { value: { 553: { style: { 'stroke-width': true } } } },
            { value: { 552: { style: { 'stroke-width': true } } } },
            { value: { 551: { style: { 'stroke-width': true } } } },
            { value: { 550: { style: { 'stroke-width': true } } } },
            { value: { 549: { style: { 'stroke-width': true } } } },
            { value: { 548: { style: { 'stroke-width': true } } } },
            { value: { 547: { style: { 'stroke-width': true } } } },
            { value: { 546: { style: { 'stroke-width': true } } } },
            { value: { 545: { style: { 'stroke-width': true } } } },
            { value: { 544: { style: { 'stroke-width': true } } } },
            { value: { 543: { style: { 'stroke-width': true } } } },
            { value: { 542: { style: { 'stroke-width': true } } } },
            { value: { 541: { style: { 'stroke-width': true } } } },
            { value: { 540: { style: { 'stroke-width': true } } } },
            { value: { 539: { style: { 'stroke-width': true } } } },
            { value: { 538: { style: { 'stroke-width': true } } } },
            { value: { 537: { style: { 'stroke-width': true } } } },
            { value: { 536: { style: { 'stroke-width': true } } } },
            { value: { 535: { style: { 'stroke-width': true } } } },
            { value: { 534: { style: { 'stroke-width': true } } } },
            { value: { 533: { style: { 'stroke-width': true } } } },
            { value: { 532: { style: { 'stroke-width': true } } } },
            { value: { 531: { style: { 'stroke-width': true } } } },
            { value: { 530: { style: { 'stroke-width': true } } } },
            { value: { 529: { style: { 'stroke-width': true } } } },
            { value: { 528: { style: { 'stroke-width': true } } } },
            { value: { 527: { style: { 'stroke-width': true } } } },
            { value: { 526: { style: { 'stroke-width': true } } } },
            { value: { 525: { style: { 'stroke-width': true } } } },
            { value: { 524: { style: { 'stroke-width': true } } } },
            { value: { 523: { style: { 'stroke-width': true } } } },
            { value: { 522: { style: { 'stroke-width': true } } } },
            { value: { 521: { style: { 'stroke-width': true } } } },
            { value: { 520: { style: { 'stroke-width': true } } } },
            { value: { 519: { style: { 'stroke-width': true } } } },
            { value: { 518: { style: { 'stroke-width': true } } } },
            { value: { 517: { style: { 'stroke-width': true } } } },
            { value: { 516: { style: { 'stroke-width': true } } } },
            { value: { 515: { style: { 'stroke-width': true } } } },
            { value: { 514: { style: { 'stroke-width': true } } } },
            { value: { 513: { style: { 'stroke-width': true } } } },
            { value: { 512: { style: { 'stroke-width': true } } } },
            { value: { 511: { style: { 'stroke-width': true } } } },
            { value: { 510: { style: { 'stroke-width': true } } } },
            { value: { 509: { style: { 'stroke-width': true } } } },
            { value: { 508: { style: { 'stroke-width': true } } } },
            { value: { 507: { style: { 'stroke-width': true } } } },
            { value: { 506: { style: { 'stroke-width': true } } } },
            { value: { 505: { style: { 'stroke-width': true } } } },
            { value: { 504: { style: { 'stroke-width': true } } } },
            { value: { 503: { style: { 'stroke-width': true } } } },
            { value: { 502: { style: { 'stroke-width': true } } } },
            { value: { 501: { style: { 'stroke-width': true } } } },
            { value: { 500: { style: { 'stroke-width': true } } } },
            { value: { 499: { style: { 'stroke-width': true } } } },
            { value: { 498: { style: { 'stroke-width': true } } } },
            { value: { 497: { style: { 'stroke-width': true } } } },
            { value: { 496: { style: { 'stroke-width': true } } } },
            { value: { 495: { style: { 'stroke-width': true } } } },
            { value: { 494: { style: { 'stroke-width': true } } } },
            { value: { 493: { style: { 'stroke-width': true } } } },
            { value: { 492: { style: { 'stroke-width': true } } } },
            { value: { 491: { style: { 'stroke-width': true } } } },
            { value: { 490: { style: { 'stroke-width': true } } } },
            { value: { 489: { style: { 'stroke-width': true } } } },
            { value: { 488: { style: { 'stroke-width': true } } } },
            { value: { 487: { style: { 'stroke-width': true } } } },
            { value: { 486: { style: { 'stroke-width': true } } } },
            { value: { 485: { style: { 'stroke-width': true } } } },
            { value: { 484: { style: { 'stroke-width': true } } } },
            { value: { 483: { style: { 'stroke-width': true } } } },
            { value: { 482: { style: { 'stroke-width': true } } } },
            { value: { 481: { style: { 'stroke-width': true } } } },
            { value: { 480: { style: { 'stroke-width': true } } } },
            { value: { 479: { style: { 'stroke-width': true } } } },
            { value: { 478: { style: { 'stroke-width': true } } } },
            { value: { 477: { style: { 'stroke-width': true } } } },
            { value: { 476: { style: { 'stroke-width': true } } } },
            { value: { 475: { style: { 'stroke-width': true } } } },
            { value: { 474: { style: { 'stroke-width': true } } } },
            { value: { 473: { style: { 'stroke-width': true } } } },
            { value: { 472: { style: { 'stroke-width': true } } } },
            { value: { 471: { style: { 'stroke-width': true } } } },
            { value: { 470: { style: { 'stroke-width': true } } } },
            { value: { 469: { style: { 'stroke-width': true } } } },
            { value: { 468: { style: { 'stroke-width': true } } } },
            { value: { 467: { style: { 'stroke-width': true } } } },
            { value: { 466: { style: { 'stroke-width': true } } } },
            { value: { 465: { style: { 'stroke-width': true } } } },
            { value: { 464: { style: { 'stroke-width': true } } } },
            { value: { 463: { style: { 'stroke-width': true } } } },
            { value: { 462: { style: { 'stroke-width': true } } } },
            { value: { 461: { style: { 'stroke-width': true } } } },
            { value: { 460: { style: { 'stroke-width': true } } } },
            { value: { 459: { style: { 'stroke-width': true } } } },
            { value: { 458: { style: { 'stroke-width': true } } } },
            { value: { 457: { style: { 'stroke-width': true } } } },
            { value: { 456: { style: { 'stroke-width': true } } } },
            { value: { 455: { style: { 'stroke-width': true } } } },
            { value: { 454: { style: { 'stroke-width': true } } } },
            { value: { 453: { style: { 'stroke-width': true } } } },
            { value: { 452: { style: { 'stroke-width': true } } } },
            { value: { 451: { style: { 'stroke-width': true } } } },
            { value: { 450: { style: { 'stroke-width': true } } } },
            { value: { 449: { style: { 'stroke-width': true } } } },
            { value: { 448: { style: { 'stroke-width': true } } } },
            { value: { 447: { style: { 'stroke-width': true } } } },
            { value: { 446: { style: { 'stroke-width': true } } } },
            { value: { 445: { style: { 'stroke-width': true } } } },
            { value: { 444: { style: { 'stroke-width': true } } } },
            { value: { 443: { style: { 'stroke-width': true } } } },
            { value: { 442: { style: { 'stroke-width': true } } } },
            { value: { 441: { style: { 'stroke-width': true } } } },
            { value: { 440: { style: { 'stroke-width': true } } } },
            { value: { 439: { style: { 'stroke-width': true } } } },
            { value: { 438: { style: { 'stroke-width': true } } } },
            { value: { 437: { style: { 'stroke-width': true } } } },
            { value: { 436: { style: { 'stroke-width': true } } } },
            { value: { 435: { style: { 'stroke-width': true } } } },
            { value: { 434: { style: { 'stroke-width': true } } } },
            { value: { 433: { style: { 'stroke-width': true } } } },
            { value: { 432: { style: { 'stroke-width': true } } } },
            { value: { 431: { style: { 'stroke-width': true } } } },
            { value: { 430: { style: { 'stroke-width': true } } } },
            { value: { 429: { style: { 'stroke-width': true } } } },
            { value: { 428: { style: { 'stroke-width': true } } } },
            { value: { 427: { style: { 'stroke-width': true } } } },
            { value: { 426: { style: { 'stroke-width': true } } } },
            { value: { 425: { style: { 'stroke-width': true } } } },
            { value: { 424: { style: { 'stroke-width': true } } } },
            { value: { 423: { style: { 'stroke-width': true } } } },
            { value: { 422: { style: { 'stroke-width': true } } } },
            { value: { 421: { style: { 'stroke-width': true } } } },
            { value: { 420: { style: { 'stroke-width': true } } } },
            { value: { 419: { style: { 'stroke-width': true } } } },
            { value: { 418: { style: { 'stroke-width': true } } } },
            { value: { 417: { style: { 'stroke-width': true } } } },
            { value: { 416: { style: { 'stroke-width': true } } } },
            { value: { 415: { style: { 'stroke-width': true } } } },
            { value: { 414: { style: { 'stroke-width': true } } } },
            { value: { 413: { style: { 'stroke-width': true } } } },
            { value: { 412: { style: { 'stroke-width': true } } } },
            { value: { 411: { style: { 'stroke-width': true } } } },
            { value: { 410: { style: { 'stroke-width': true } } } },
            { value: { 409: { style: { 'stroke-width': true } } } },
            { value: { 408: { style: { 'stroke-width': true } } } },
            { value: { 407: { style: { 'stroke-width': true } } } },
            { value: { 406: { style: { 'stroke-width': true } } } },
            { value: { 405: { style: { 'stroke-width': true } } } },
            { value: { 404: { style: { 'stroke-width': true } } } },
            { value: { 403: { style: { 'stroke-width': true } } } },
            { value: { 402: { style: { 'stroke-width': true } } } },
            { value: { 401: { style: { 'stroke-width': true } } } },
            { value: { 400: { style: { 'stroke-width': true } } } },
            { value: { 399: { style: { 'stroke-width': true } } } },
            { value: { 398: { style: { 'stroke-width': true } } } },
            { value: { 397: { style: { 'stroke-width': true } } } },
            { value: { 396: { style: { 'stroke-width': true } } } },
            { value: { 395: { style: { 'stroke-width': true } } } },
            { value: { 394: { style: { 'stroke-width': true } } } },
            { value: { 393: { style: { 'stroke-width': true } } } },
            { value: { 392: { style: { 'stroke-width': true } } } },
            { value: { 391: { style: { 'stroke-width': true } } } },
            { value: { 390: { style: { 'stroke-width': true } } } },
            { value: { 389: { style: { 'stroke-width': true } } } },
            { value: { 388: { style: { 'stroke-width': true } } } },
            { value: { 387: { style: { 'stroke-width': true } } } },
            { value: { 386: { style: { 'stroke-width': true } } } },
            { value: { 385: { style: { 'stroke-width': true } } } },
            { value: { 384: { style: { 'stroke-width': true } } } },
            { value: { 383: { style: { 'stroke-width': true } } } },
            { value: { 382: { style: { 'stroke-width': true } } } },
            { value: { 381: { style: { 'stroke-width': true } } } },
            { value: { 380: { style: { 'stroke-width': true } } } },
            { value: { 379: { style: { 'stroke-width': true } } } },
            { value: { 378: { style: { 'stroke-width': true } } } },
            { value: { 377: { style: { 'stroke-width': true } } } },
            { value: { 376: { style: { 'stroke-width': true } } } },
            { value: { 375: { style: { 'stroke-width': true } } } },
            { value: { 374: { style: { 'stroke-width': true } } } },
            { value: { 373: { style: { 'stroke-width': true } } } },
            { value: { 372: { style: { 'stroke-width': true } } } },
            { value: { 371: { style: { 'stroke-width': true } } } },
            { value: { 370: { style: { 'stroke-width': true } } } },
            { value: { 369: { style: { 'stroke-width': true } } } },
            { value: { 368: { style: { 'stroke-width': true } } } },
            { value: { 367: { style: { 'stroke-width': true } } } },
            { value: { 366: { style: { 'stroke-width': true } } } },
            { value: { 365: { style: { 'stroke-width': true } } } },
            { value: { 364: { style: { 'stroke-width': true } } } },
            { value: { 363: { style: { 'stroke-width': true } } } },
            { value: { 362: { style: { 'stroke-width': true } } } },
            { value: { 361: { style: { 'stroke-width': true } } } },
            { value: { 360: { style: { 'stroke-width': true } } } },
            { value: { 359: { style: { 'stroke-width': true } } } },
            { value: { 358: { style: { 'stroke-width': true } } } },
            { value: { 357: { style: { 'stroke-width': true } } } },
            { value: { 356: { style: { 'stroke-width': true } } } },
            { value: { 355: { style: { 'stroke-width': true } } } },
            { value: { 354: { style: { 'stroke-width': true } } } },
            { value: { 353: { style: { 'stroke-width': true } } } },
            { value: { 352: { style: { 'stroke-width': true } } } },
            { value: { 351: { style: { 'stroke-width': true } } } },
            { value: { 350: { style: { 'stroke-width': true } } } },
            { value: { 349: { style: { 'stroke-width': true } } } },
            { value: { 348: { style: { 'stroke-width': true } } } },
            { value: { 347: { style: { 'stroke-width': true } } } },
            { value: { 346: { style: { 'stroke-width': true } } } },
            { value: { 345: { style: { 'stroke-width': true } } } },
            { value: { 344: { style: { 'stroke-width': true } } } },
            { value: { 343: { style: { 'stroke-width': true } } } },
            { value: { 342: { style: { 'stroke-width': true } } } },
            { value: { 341: { style: { 'stroke-width': true } } } },
            { value: { 340: { style: { 'stroke-width': true } } } },
            { value: { 339: { style: { 'stroke-width': true } } } },
            { value: { 338: { style: { 'stroke-width': true } } } },
            { value: { 337: { style: { 'stroke-width': true } } } },
            { value: { 336: { style: { 'stroke-width': true } } } },
            { value: { 335: { style: { 'stroke-width': true } } } },
            { value: { 334: { style: { 'stroke-width': true } } } },
            { value: { 333: { style: { 'stroke-width': true } } } },
            { value: { 332: { style: { 'stroke-width': true } } } },
            { value: { 331: { style: { 'stroke-width': true } } } },
            { value: { 330: { style: { 'stroke-width': true } } } },
            { value: { 329: { style: { 'stroke-width': true } } } },
            { value: { 328: { style: { 'stroke-width': true } } } },
            { value: { 327: { style: { 'stroke-width': true } } } },
            { value: { 326: { style: { 'stroke-width': true } } } },
            { value: { 325: { style: { 'stroke-width': true } } } },
            { value: { 324: { style: { 'stroke-width': true } } } },
            { value: { 323: { style: { 'stroke-width': true } } } },
            { value: { 322: { style: { 'stroke-width': true } } } },
            { value: { 321: { style: { 'stroke-width': true } } } },
            { value: { 320: { style: { 'stroke-width': true } } } },
            { value: { 319: { style: { 'stroke-width': true } } } },
            { value: { 318: { style: { 'stroke-width': true } } } },
            { value: { 317: { style: { 'stroke-width': true } } } },
            { value: { 316: { style: { 'stroke-width': true } } } },
            { value: { 315: { style: { 'stroke-width': true } } } },
            { value: { 314: { style: { 'stroke-width': true } } } },
            { value: { 313: { style: { 'stroke-width': true } } } },
            { value: { 312: { style: { 'stroke-width': true } } } },
            { value: { 311: { style: { 'stroke-width': true } } } },
            { value: { 310: { style: { 'stroke-width': true } } } },
            { value: { 309: { style: { 'stroke-width': true } } } },
            { value: { 308: { style: { 'stroke-width': true } } } }
        ]
    }
    // console.log(`%c Computing nodes' encodings...`, 'background: #222; color: #bada55')
    // const [node2element, nodeAttr2channel] = entity2element(data, func, 'nodes')
    // console.log(`%c Computing links' encodings...`, 'background: #222; color: #bada55')
    // const [link2element, linkAttr2channel] = entity2element(data, func, 'links')

    // if link2element shares same elements with node2element,
    // we should remove them from node2element
    const element2link = []
    for (let i = 0; i < link2element.length; i++) {
        link2element[i]?.forEach((elementIndex) => {
            if (element2link[elementIndex] !== undefined) {
                // one element cannot correspond to several links
                debugger
            }
            element2link[elementIndex] = i
        })
    }

    // Remove link2element from node2element
    for (let i = 0; i < node2element.length; i++) {
        // i: nodeIndex
        const node2element_i = new Set()
        node2element[i]?.forEach((elementIndex) => {
            if (element2link[elementIndex] == undefined) {
                // the element corresponds to a link, remove it from node2element
                node2element_i.add(elementIndex)
            } else {
                for (let attrName in nodeAttr2channel[i]) {
                    delete nodeAttr2channel[i][attrName][elementIndex]
                }
            }
        })
        node2element[i] = node2element_i
    }

    const endTime = performance.now()
    console.log(endTime - beginTime)

    // Step3 textualize entity2element
    const nodeElementCounts = countEntity2Element(node2element)
    const linkElementCounts = countEntity2Element(link2element)

    function countEntity2Element(entity2element) {
        const descriptionSet = new Set()
        entity2element.forEach((elementIndexSet) => {
            const elementCount = {}
            elementIndexSet.forEach((elementIndex) => {
                const tagName = nldComponents.basicElementArray[elementIndex].tagName
                if (!elementCount[tagName]) {
                    elementCount[tagName] = 0
                }
                elementCount[tagName] += 1
            })

            descriptionSet.add(encoder(elementCount))
        })
        const elementCounts = Array.from(descriptionSet).map(decoder)
        return elementCounts

        function encoder(elementCount) {
            return Array.from(BASIC_SVG_ELEMENTS.entries())
                .map(([tagName]) => (elementCount[tagName] ? elementCount[tagName] : 0))
                .join(CONNECTOR_CHAR)
        }
        function decoder(countString) {
            const tagNames = Array.from(BASIC_SVG_ELEMENTS.entries()).map(([tagName]) => tagName)
            const elementCount = {}
            countString.split(CONNECTOR_CHAR).forEach((count, i) => {
                elementCount[tagNames[i]] = count
            })
            return elementCount
        }
    }

    // Step4 textualize attribute2channel
    // console.log(`For a node, `)
    const nodeEncodingCounts = textualizeAttr2Channel(nodeAttr2channel)
    // nodeEncodingCounts.forEach((encoding) => {
    //     let description = `the Attribute [${encoding.attribute}] influences `
    //     if (encoding.tagName !== 'constituent') {
    //         if (encoding.count == nodeElementCounts[encoding.tagName]) {
    //         }
    //     } else {
    //     }
    // })
    console.log(textualizeAttr2Channel(linkAttr2channel))
    function textualizeAttr2Channel(attr2channel) {
        // attr2channel:
        // [[entityIndex]: {
        //   [entityAttributeName]: {
        //      [elementIndex]: {tagName, style, ...}
        //   }
        // }]

        const descriptionSet = new Set()
        attr2channel.forEach((entityAttr2channel, entityIndex) => {
            // description formulation: "attribute-tagName-style-count"
            for (let attributeName in entityAttr2channel) {
                let thisChannelsCount = {}
                for (let elementIndex in entityAttr2channel[attributeName]) {
                    let tagName = entityAttr2channel[attributeName][elementIndex].tagName
                    let style = entityAttr2channel[attributeName][elementIndex].style
                    if (tagName) {
                        if (!thisChannelsCount['constituent-tagName']) {
                            thisChannelsCount['constituent-tagName'] = 0
                        }
                        thisChannelsCount['constituent-tagName'] += 1
                        tagName = 'constituent'
                    }
                    for (let channel in style) {
                        if (
                            (tagName == 'constituent' && channel in COMMON_STYLE_CHANNELS) ||
                            tagName !== 'constituent'
                        ) {
                            // only COMMON_STYLE_CHANNELS are described with 'constituent'
                            if (!tagName) {
                                tagName = nldComponents.basicElementArray[elementIndex].tagName
                            }
                            const key = tagName + CONNECTOR_CHAR + channel
                            if (!thisChannelsCount[key]) {
                                thisChannelsCount[key] = 0
                            }
                            thisChannelsCount[key] += 1
                        }
                    }
                }
                for (const key in thisChannelsCount) {
                    descriptionSet.add(
                        attributeName +
                            CONNECTOR_CHAR +
                            key +
                            CONNECTOR_CHAR +
                            thisChannelsCount[key]
                    )
                }
            }
        })
        console.log(descriptionSet)
        const elementCounts = Array.from(descriptionSet)
            .map((countString) => {
                const [attribute, tagName, channel, count] = countString.split(CONNECTOR_CHAR)
                return { attribute, tagName, channel, count }
            })
            .sort((a, b) => b.count - a.count)
        return elementCounts
    }

    console.log(`A node can consist of ${textualizeElementCounts(nodeElementCounts)}`)
    console.log(`A link can consist of ${textualizeElementCounts(linkElementCounts)}`)

    function textualizeElementCounts(elementCounts) {
        let result = ''
        elementCounts.forEach((elementCount, i) => {
            const descriptions = Object.entries(elementCount)
                .filter(([tagName, count]) => count > 0)
                .map(([tagName, count]) => `${count} ${tagName}${count > 1 ? 's' : ''}`)
            descriptions.forEach((description, j) => {
                result += description
                if (descriptions.length > 2 && j != descriptions.length - 1) {
                    result += ', '
                }
                if (j == descriptions.length - 2) {
                    result += ' and '
                }
            })
            if (elementCounts.length >= 2 && i < elementCounts.length - 1) {
                result += ', or '
            } else {
                result += '.'
            }
        })
        result = result.replace(/\s+/g, ' ')
        return result
    }
}

export { detector }
