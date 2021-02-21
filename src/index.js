/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import * as d3 from 'd3'

/**
 *
 *
 * @param {string} code
 * @param {standard node-link data format} data
 */
function detector(code, data) {
    // eslint-disable-next-line no-new-func
    const func = new Function('d3', 'data', code)
    const originSVG = func(d3, data)
    const attrs = getAttributesOf(data)
    console.log(attrs)
    const syntheticData = generateSyntheticData(data) // {nodes: {attr1: data1, attr2: data2, ...}, links: {...}}
    console.log(syntheticData)
    const keys = Object.keys(data) // ['nodes', 'links']
    keys.forEach((key) => {
        for (let attrName in syntheticData[key]) {
            syntheticData[key][attrName].forEach((newData) => {
                const newSVG = func(d3, newData)
                const diff = getChangedVisualChannels(originSVG, newSVG)
                console.log(diff)
            })
        }
    })
}

/**
 * get attributes of nodes and links
 * @param {standard node-link data format} data
 * @returns {nodes: node attributes array, links: link attributes array}
 */
function getAttributesOf(data) {
    const nodeAttrs = new Set()
    const linkAttrs = new Set()
    data.nodes.forEach((node) => {
        for (let attr in node) {
            nodeAttrs.add(attr)
        }
    })
    data.links.forEach((link) => {
        for (let attr in link) {
            linkAttrs.add(attr)
        }
    })
    nodeAttrs.delete('id')
    linkAttrs.delete('source')
    linkAttrs.delete('target')
    return {
        nodes: [...nodeAttrs],
        links: [...linkAttrs]
    }
}

function generateSyntheticData(
    originData,
    numericalStepPercent = 0.1,
    numericalLengthThreshold = 5
) {
    const attrs = getAttributesOf(originData)
    const syntheticData = { nodes: {}, links: {} }
    const keys = Object.keys(syntheticData)
    keys.forEach((key) => {
        attrs[key].forEach((attr) => {
            let range = new Set()
            let isAllNumerical = true
            let type = 'numerical'
            originData[key].forEach((entity) => {
                const value = entity[attr]
                range.add(value)
                if (typeof value !== 'number') {
                    isAllNumerical = false
                }
            })
            range = [...range]
            if (!isAllNumerical || range.length <= numericalLengthThreshold) {
                type = 'categorical'
            } else {
                const min = d3.min(range)
                const max = d3.max(range)
                range = []
                let value = min
                let step = numericalStepPercent * (max - min)
                while (value <= max) {
                    range.push(value)
                    value += step
                }
            }
            syntheticData[key][attr] = range.map((value) => {
                const data = JSON.parse(JSON.stringify(originData))
                for (let index in data[key]) {
                    const entity = data[key][index]
                    entity[attr] = value
                }
                return data
            })

            syntheticData[key][attr].type = type
        })
    })
    return syntheticData
}

/**
 * get changed visual channels between two svgs
 * we assume that two svgs only differ in values of visual channels while structures are same
 * @param {html-svg-element} element1
 * @param {html-svg-element} element2
 */
function getChangedVisualChannels(element1, element2, diff = {}) {
    const attributesOfElement1 = new Map(
        [...element1.attributes].map((attribute) => [attribute.name, attribute.value])
    )
    const attributesOfElement2 = new Map(
        [...element2.attributes].map((attribute) => [attribute.name, attribute.value])
    )
    attributesOfElement1.forEach((value, name) => {
        if (attributesOfElement2.get(name) != value) {
            if (!diff.differences) {
                diff.differences = new Set()
            }
            diff.differences.add(name)
        }
    })
    if (element1.children.length > 0) {
        diff.children = []
        const childrenOfElement1 = [...element1.children]
        const childrenOfElement2 = [...element2.children]
        for (let i = 0; i < childrenOfElement1.length; i++) {
            const childDiff = getChangedVisualChannels(childrenOfElement1[i], childrenOfElement2[i])
            if (childDiff.differences || childDiff.children) {
                diff.children.push(childDiff)
            }
        }
        if (diff.children.length === 0) {
            delete diff['children']
        }
    }
    diff.name = element1.nodeName
    return diff
}

export { detector }
