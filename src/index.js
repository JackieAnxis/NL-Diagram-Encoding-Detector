/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import entity2element from './entity2element'
import { NLDComponents } from './NLDComponents'
import { BASIC_SVG_ELEMENTS } from './global'

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
    const nldComponents = new NLDComponents(svg)

    // Step1: Map Entities to Elements, Map Attributes to Channels
    const [node2element, nodeAttr2channel] = entity2element(data, func, 'nodes')
    const [link2element, linkAttr2channel] = entity2element(data, func, 'links')

    // if link2element shares same elements with node2element,
    // we should remove them from node2element
    const element2node = []
    for (let i = 0; i < node2element.length; i++) {
        node2element[i]?.forEach((elementIndex) => {
            if (element2node[elementIndex] !== undefined) {
                debugger
            }
            element2node[elementIndex] = i
        })
    }
    const element2link = []
    for (let i = 0; i < link2element.length; i++) {
        link2element[i]?.forEach((elementIndex) => {
            if (element2link[elementIndex] !== undefined) {
                debugger
            }
            element2link[elementIndex] = i
        })
    }
    for (let i = 0; i < element2node.length; i++) {
        const elementIndex = i
        if (element2link[elementIndex]) {
            const nodeIndex = element2node[elementIndex]
            node2element[nodeIndex].delete(elementIndex)
            for (let attrName in nodeAttr2channel[nodeIndex]) {
                nodeAttr2channel[nodeIndex][attrName].delete(elementIndex)
            }
        }
    }

    // Step3 Merge
    console.log(`A node can consist of ${textualizeEntity2Element(node2element).result}`)
    console.log(`A link can consist of ${textualizeEntity2Element(link2element).result}`)
    function textualizeEntity2Element(entity2element) {
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
        let result = ''
        elementCounts.forEach((elementCount, i) => {
            const descriptions = Object.entries(elementCount)
                .filter(([tagName, count]) => count > 0)
                .map(([tagName, count]) => `${count} ${tagName}${count > 1 ? s : ''}`)
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
        return {
            result,
            elementCounts
        }

        function encoder(elementCount) {
            return Array.from(BASIC_SVG_ELEMENTS.entries())
                .map(([tagName]) => (elementCount[tagName] ? elementCount[tagName] : 0))
                .join('-')
        }
        function decoder(countString) {
            const tagNames = Array.from(BASIC_SVG_ELEMENTS.entries()).map(([tagName]) => tagName)
            const elementCount = {}
            countString.split('-').forEach((count, i) => {
                elementCount[tagNames[i]] = count
            })
            return elementCount
        }
    }
}

export { detector }
