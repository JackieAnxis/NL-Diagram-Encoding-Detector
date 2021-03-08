/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import * as d3 from 'd3'

import compare from './compare'
import { object } from './utils'
import entity2element from './entity2element'

/**
 *
 * @param {string} code
 * @param {standard node-link data format} data
 */
function detector(code, data) {
    // eslint-disable-next-line no-new-func
    const func = new Function('d3', 'data', code)

    // Step1: Eliminate random encoding
    const svg = func(d3, object.deepcopy(data))
    const svgBeta = func(d3, object.deepcopy(data))
    const unstableElements = compare(svg, svgBeta)
    // if diff is not an empty object
    // it means some visual channels are not stable (it means random, same inputs lead to different outputs)
    if (!unstableElements.isEmpty()) {
        console.error('The input code is unstable.')
        return false
    }

    // Step2: Map links to Elements
    const link2element = entity2element(data, func, 'links')
    const node2element = entity2element(data, func, 'nodes')
}

export { detector }
