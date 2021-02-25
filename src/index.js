/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import * as d3 from 'd3'
import { compare } from 'dom-compare'
import MultiKeyMap from 'multikeymap'

const CATEGORICAL = 'categorical'
const NUMERICAL = 'numerical'
const BASIC_SVG_ELEMENTS = new Set([
    'circle',
    'ellipse',
    'line',
    'polygon',
    'polyline',
    'rect',
    'path',
    'text'
])

/**
 *
 * @param {string} code
 * @param {standard node-link data format} data
 */
function detector(code, data) {
    // eslint-disable-next-line no-new-func
    const func = new Function('d3', 'data', code)
    const svg = func(d3, data)
    document.body.appendChild(svg)

    // prevent blocking
    setTimeout(function () {
        // judge how each node/link is represented in the dom tree
        const realtedVisualElements = computeRelatedVisualElements(data, func)

        const relatedVisualChannels = computeRelatedVisualChannels(data, func)

        console.log(realtedVisualElements, relatedVisualChannels)
    }, 1000)
    // TODO 1: style
    // TODO 2: compress data
    // TODO 3: correlation (positive or negative or ...)
}

/**
 * compress complex json format data with deep structure
 * e.g. {'nodes': [{'info': {'name': 'xxx', 'edge': 35}, 'percents': [10,20,30,40]}, ...], ...}
 *  =>
 * {'nodes': [{'info-name': 'xxx', 'info-edge': 35, 'percents-0': 10, 'percents-1': 20, ...}, ...]}
 * @param {JSON format data} originData
 * @return {JSON format data} encodedData
 */
function dataEncoder(originData) {
    let encodedData = {...originData}
    const keys = ['nodes', 'links']
    keys.forEach(key => {
        encodedData[key] = encodedData[key].map(ele => {
            let newEle = {}
            Object.keys(ele).forEach(attrName => {
                if (ele[attrName] instanceof Object){
                    Object.keys(ele[attrName]).forEach(attrSubName => {
                        newName = attrName + '-' + attrSubName
                        newEle[newName] = ele[attrName][attrSubName]
                    })
                }else{
                    newEle[attrName] = ele[attrName]
                }
            })
            return newEle
        })
    })
    return encodedData
}

/**
 * The opposite of dataEncoder
 * @param {JSON format data} encodedData
 * @return {JSON formated data}
 */
function dataDecoder(encodedData) {
    let originData = {...encodedData}
    const keys = ['nodes', 'links']
    keys.forEach(key => {
        originData[key] = originData[key].map(ele => {
            let newEle = {}
            Object.keys(ele).forEach(attrName => {
                if (attrName.indexOf('-') != -1){
                    let [supName, subName] = attrName.split('-')
                    subName = isNaN(Number(subName))? subName: Number(subName)
                    if (Object.keys(newEle).indexOf(supName) == -1){
                        newEle[supName] = isNaN(Number(subName))? {}: []
                    }
                    newEle[supName][subName] = ele[attrName]
                }else{
                    newEle[attrName] = ele[attrName]
                }
            })
            return newEle
        })
    })
    return originData
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
        const node = deepcopy(data.nodes[i])
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
    const clonedDataWithAllNodes = { nodes: deepcopy(data.nodes), links: [deepcopy(data.links[0])] }
    lastSVG = func(d3, clonedDataWithAllNodes)
    lastCount = countBasicElementsOf(lastSVG)
    const linksRelatedElements = {}
    count = {}
    for (let i = 1; i < data.links.length; i++) {
        const link = deepcopy(data.links[i])
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
            const clonedData = deepcopy(data)
            // randomize attribute value
            clonedData[key].forEach((ele) => {
                ele[attrName] = attrInfo.range[d3.randomInt(0, attrInfo.range.length)()]
            })
            const clonedSVG = func(d3, clonedData)
            const diff = compare(originSVG, clonedSVG).getDifferences()
            const changes = {}
            diff.forEach(({ /* this node is not that node in the data */ node, message }) => {
                if (message.indexOf('Attribute') === 0) {
                    let element = node.split('/').pop()
                    element = element.split('[').shift()
                    let channel = message.match(/Attribute '(\S*)'.*/)[1]
                    // TODO remove position channels: x/y/x1/...
                    if (!changes[element]) {
                        changes[element] = {}
                    } else {
                        changes[element][channel] = true
                    }
                } else {
                    console.error('Something Wrong...')
                }
            })
            relatedVisualChannels[key][attrName] = changes
        })
    })
    return relatedVisualChannels
}

/**
 * count the number of basic elements contained in the input svg
 * @param {html svg element} svg
 */
function countBasicElementsOf(svg) {
    const count = {}
    BASIC_SVG_ELEMENTS.forEach((name) => {
        const size = d3.select(svg).selectAll(name).size()
        count[name] = size
    })
    return count
}

/**
 * get difference between two count result
 * if count2 > count1, it returns positive number
 * @param {Object} count1: {name: String (element name), count: Number}
 * @param {Object} count2: {name: String (element name), count: Number}
 */
function computeCntDiffBtwn(count1, count2) {
    const diff = {}
    const names = new Set([...Object.keys(count1), ...Object.keys(count2)])
    names.forEach((name) => {
        diff[name] = (count2[name] ? count2[name] : 0) - (count1[name] ? count1[name] : 0)
    })
    return diff
}

/**
 * Deep Copy an object
 * @param {JSON format data} obj
 */
function deepcopy(obj) {
    return JSON.parse(JSON.stringify(obj))
}

/**
 * get attributes of nodes and links
 * @param {standard node-link data format} data
 * @returns {nodes: node attributes array, links: link attributes array}
 */
function getAttributesOf(data) {
    const nodeAttrs = new Map()
    const linkAttrs = new Map()
    data.nodes.forEach((node) => {
        for (let attr in node) {
            if (nodeAttrs.has(attr)) {
                nodeAttrs.get(attr).push(node[attr])
            } else {
                nodeAttrs.set(attr, [node[attr]])
            }
        }
    })
    data.links.forEach((link) => {
        for (let attr in link) {
            if (linkAttrs.has(attr)) {
                linkAttrs.get(attr).push(link[attr])
            } else {
                linkAttrs.set(attr, [link[attr]])
            }
        }
    })

    // delete unique identities
    nodeAttrs.delete('id')
    linkAttrs.delete('source')
    linkAttrs.delete('target')

    nodeAttrs.forEach((value, name) => {
        nodeAttrs.set(name, computeAttributeTypeAndRange(value))
    })
    linkAttrs.forEach((value, name) => {
        linkAttrs.set(name, computeAttributeTypeAndRange(value))
    })

    return {
        nodes: nodeAttrs,
        links: linkAttrs
    }
}

/**
 *
 * @param {*} data
 * @param {*} NUMERICAL_LENGTH_THRESHOLD
 */
function computeAttributeTypeAndRange(data, NUMERICAL_LENGTH_THRESHOLD = 10) {
    let range = new Set()
    let isAllNumerical = true
    let type = NUMERICAL
    data.forEach((value) => {
        range.add(value)
        if (typeof value !== 'number') {
            isAllNumerical = false
        }
    })
    range = [...range]
    if (!isAllNumerical || range.length <= NUMERICAL_LENGTH_THRESHOLD) {
        type = CATEGORICAL
    }
    return {
        type,
        range
    }
}

export { detector }
