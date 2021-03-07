/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import * as d3 from 'd3'
import MultiKeyMap from 'multikeymap'

import compare from './compare'
import { object } from './utils'
import * as entity2element from './entity2element'

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
    entity2element.ifNoStructChange.linkMapper(data, func)
    // 交换某两个数据实体的某个属性，这个属性肯定不会改变结构（因为已经在step1确保）；
    // 比较原visual channel数组和现在的这个数组。
    // 如果这个属性只改变数值型的属性，我们假设数值型的属性的映射方式一般只会跟数据的分布相关（比如一般跟最大值最小值相关），所以我们交换数据是不会改变数据分布的，进而没有改变映射方式，所以此时只有跟交换的两个数据实体相关的visual element会被改变；
    // 如果这个属性只改变类别型的属性。在类别型属性的映射中，可能映射方式会随着原数据的改变而发生改变（比如类别的出现顺序），交换数据可能会改变映射，虽然改变了映射方式，但我们认为曾经被编码为同一类的输入，在改变了映射的情况下仍然会被分到同一类。所以发生了类别变化的那些visual element就是这两个entity对应的。

    // 判断一个视觉通道是numerical还是categorical的？
    // 如果是categorical的，其unique的值会很少
    // 如果是numerical的，其unique的值会很多

    // 若存在： numerical 的视觉通道：数据分布会影响映射，只换，不改；
    // 0. 初始svg0；初始data0；
    // 1. data0的基础上，交换 A B 的所有 attr2style 属性（保证 A 和 B 的这些属性不完全一样）；data1 svg1，对比 svg0 和 svg1，找出修改内容；该内容可能只跟A相关，可能只跟B相关，可能两者都相关；
    // 2. data0的基础上，交换 A C 的所有 attr2style 属性（保证 A 和 C 的这些属性不完全一样）；data2 svg2，对比 svg0 和 svg1，找出修改内容；该内容可能只跟A相关，可能只跟C相关，可能两者都相关；
    // 3. 分析1和2中的修改内容，相同部分为A，不相同部分为B和C；

    // 若存在： categorical 的视觉通道：只有数据顺序（出现）会影响映射方式，只改，不换；
}

/**
 * get nodes/links related visual elements and their counts
 * @param {JSON format data} data
 * @param {d3 function} func
 */
function computeRelatedVisualElements(data, func) {
    // judge how each node/link is represented in the dom tree
    // find visual elements for each node
    // first, find visual elements for all nodes except nodes[0]
    const clonedDataWithOneNode = { nodes: [data.nodes[0]], links: [] }
    let lastSVG = func(d3, clonedDataWithOneNode)
    let lastCount = countBasicElementsOf(lastSVG)
    const nodesRelatedElements = {}
    let svg, diff, count
    for (let i = 1; i < data.nodes.length; i++) {
        const node = object.deepcopy(data.nodes[i])
        const id = node.id
        clonedDataWithOneNode.nodes.push(node)
        svg = func(d3, clonedDataWithOneNode)
        count = countBasicElementsOf(svg)
        const diff = computeCntDiffBtwn(lastCount, count)
        nodesRelatedElements[id] = []
        for (let name in diff) {
            if (diff[name] > 0) {
                nodesRelatedElements[id].push({
                    name,
                    count: diff[name]
                })
            }
        }
        lastCount = count
        lastSVG = svg
    }
    // second, find visual elements of nodes[0]
    const node0 = clonedDataWithOneNode.nodes.shift() // remove nodes[0]
    svg = func(d3, clonedDataWithOneNode)
    count = countBasicElementsOf(svg)
    diff = computeCntDiffBtwn(count, lastCount)
    nodesRelatedElements[node0.id] = []
    for (let name in diff) {
        if (diff[name] > 0) {
            nodesRelatedElements[node0.id].push({
                name,
                count: diff[name]
            })
        }
    }
    // nodes related visual elements are found yet.
    // compress, remove duplication
    const nodesRelatedElementsMap = new MultiKeyMap()
    Object.values(nodesRelatedElements).forEach((count) => {
        nodesRelatedElementsMap.set(
            count.map(({ name, count }) => `${name}:${count}`),
            true
        )
    })

    // find visual elements for each link, the procedure is similar to nodes
    const clonedDataWithAllNodes = {
        nodes: object.deepcopy(data.nodes),
        links: [object.deepcopy(data.links[0])]
    }
    lastSVG = func(d3, clonedDataWithAllNodes)
    lastCount = countBasicElementsOf(lastSVG)
    const linksRelatedElements = {}
    count = {}
    for (let i = 1; i < data.links.length; i++) {
        const link = object.deepcopy(data.links[i])
        clonedDataWithAllNodes.links.push(link)
        const svg = func(d3, clonedDataWithAllNodes)
        count = countBasicElementsOf(svg)
        diff = computeCntDiffBtwn(lastCount, count)
        let id = `${link.source}-${link.target}` // !NOTE: suppose links are unduplicated and undirected
        linksRelatedElements[id] = []
        for (let name in diff) {
            if (diff[name] > 0) {
                linksRelatedElements[id].push({
                    name,
                    count: diff[name]
                })
            }
        }
        lastCount = count
        lastSVG = svg
    }
    // second, find visual elements of links[0]
    const link0 = clonedDataWithAllNodes.links.shift() // remove links[0]
    let idOfLink0 = `${link0.source}-${link0.target}`
    svg = func(d3, clonedDataWithAllNodes)
    count = countBasicElementsOf(svg)
    diff = computeCntDiffBtwn(count, lastCount)
    linksRelatedElements[idOfLink0] = []
    for (let name in diff) {
        if (diff[name] > 0) {
            linksRelatedElements[idOfLink0].push({
                name,
                count: diff[name]
            })
        }
    }
    // links related visual elements are found yet.
    // compress, remove duplication
    const linksRelatedElementsMap = new MultiKeyMap()
    Object.values(linksRelatedElements).forEach((count) => {
        linksRelatedElementsMap.set(
            count.map(({ name, count }) => `${name}:${count}`),
            true
        )
    })

    return {
        nodes: [...nodesRelatedElementsMap.keys()].map((keys) => {
            return keys
                .map((key) => {
                    const [name, count] = key.split(':')
                    return { name, count }
                })
                .reduce((map, value) => {
                    map[value.name] = value.count
                    return map
                }, {})
        }),
        links: [...linksRelatedElementsMap.keys()].map((keys) => {
            return keys
                .map((key) => {
                    const [name, count] = key.split(':')
                    return { name, count }
                })
                .reduce((map, value) => {
                    map[value.name] = value.count
                    return map
                }, {})
        })
    }
}

/**
 * get nodes/links attributes related visual channels
 * @param {JSON format data} data
 * @param {d3 function} func
 */
function computeRelatedVisualChannels(data, func) {
    // change the value of each attribute in each data entity
    // test which visual channels are changed
    const originSVG = func(d3, data)
    const attrs = getAttributesOf(data)
    const relatedVisualChannels = { nodes: {}, links: {} }
    const keys = ['nodes', 'links']
    keys.forEach((key) => {
        attrs[key].forEach((attrInfo, attrName) => {
            const clonedData = object.deepcopy(data)
            // randomize attribute value
            const shuffled = d3.shuffle(attrInfo.range.slice())
            clonedData[key].forEach((entity, i) => {
                entity[attrName] = shuffled[i]
            })

            // generate new function
            const clonedSVG = func(d3, clonedData)
            const diff = compare(originSVG, clonedSVG)
        })
    })
    return relatedVisualChannels
}

export { detector }
