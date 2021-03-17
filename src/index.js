/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-02-20 13:08:16
 * @modify date 2021-02-20 13:08:16
 * @desc entry of the repo
 */

import { mapEntity2Element, mapAttribute2Channel } from './entity2element'
import { NLDComponents } from './NLDComponents'
import { BASIC_SVG_ELEMENTS, COMMON_STYLE_CHANNELS, COMMON_POSITION_CHANNELS } from './global'
import { verticalClusterElement } from './textualize'
import { number2ordinal, textualizeStringArray } from './utils'

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
    console.log(`%c Computing nodes' encodings...`, 'background: #222; color: #bada55')
    // let [node2element, node2att2val2ele2stl, node2att2ele2diff] = entity2element(
    //     data,
    //     func,
    //     'nodes'
    // )
    console.log(`%c Computing links' encodings...`, 'background: #222; color: #bada55')
    // let [link2element, link2att2val2ele2stl, link2att2ele2diff] = (entity2element(
    //     data,
    //     func,
    //     'links'
    // )
    let [node2element, nodeElement2label] = mapEntity2Element(data, func, 'nodes')
    let [link2element, linkElement2label] = mapEntity2Element(data, func, 'links')

    // Step2: Remove Links' elements from node results
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
                for (let attrName in node2att2val2ele2stl[i]) {
                    for (let val in node2att2val2ele2stl[i][attrName]) {
                        delete node2att2val2ele2stl[i][attrName][val][elementIndex]
                        if (Object.keys(node2att2val2ele2stl[i][attrName][val]).length == 0) {
                            delete node2att2val2ele2stl[i][attrName][val]
                        }
                    }
                    if (Object.keys(node2att2val2ele2stl[i][attrName]).length == 0) {
                        delete node2att2val2ele2stl[i][attrName]
                    }
                }
                if (Object.keys(node2att2val2ele2stl[i]).length == 0) {
                    delete node2att2val2ele2stl[i]
                }

                for (let attrName in node2att2ele2diff[i]) {
                    delete node2att2ele2diff[i][attrName][elementIndex]
                    if (Object.keys(node2att2ele2diff[i][attrName]).length == 0) {
                        delete node2att2ele2diff[i][attrName]
                    }
                }
                if (Object.keys(node2att2ele2diff[i]).length == 0) {
                    delete node2att2ele2diff[i]
                }

                delete nodeElement2label[i]
            }
        })
        node2element[i] = node2element_i
    }

    const nodeLabel2attr2diff = mapAttribute2Channel(
        data,
        func,
        'nodes',
        node2element,
        nodeElement2label
    )
    const linkLabel2attr2diff = mapAttribute2Channel(
        data,
        func,
        'links',
        link2element,
        linkElement2label
    )

    // Step3: Generate Descriptions
    let descriptions = []
    let entityType = 'node'
    let entity2element = node2element
    let element2label = nodeElement2label
    let label2attr2diff = nodeLabel2attr2diff
    // Step3.1: Generate Constituents, e.g. A node can consist of 4 elements
    let description = ''
    const numberOfElementsEachEntity = entity2element[0].size
    description += `Each ${entityType} consists of ${numberOfElementsEachEntity} element${
        numberOfElementsEachEntity > 1 ? 's' : ''
    }.`
    descriptions.push(description)
    // Step3.2: Vertical Grouping
    description = ''
    const classes = {}
    for (let label in label2attr2diff) {
        const attr2diff = label2attr2diff[label]
        const className = JSON.stringify(attr2diff)
        classes[className] = classes[className] ?? new Set()
        classes[className].add(label)
    }
    const classesSize = Object.keys(classes).length
    if (classesSize > 1) {
        description = `They can be categorized into ${classesSize} categories according to their visual mappings.`
        descriptions.push(description)
        description = ''
    }
    // Step3.3: Generate Encoding Descriptions for each Category
    let i = 1
    for (let className in classes) {
        const label = Array.from(classes[className])[0]
        const attr2diff = label2attr2diff[label]
        let tagNames = Array.from(
            new Set(
                element2label
                    .map((l, eleIndex) => {
                        if (l == label) {
                            return nldComponents.basicElementArray[eleIndex].tagName
                        } else {
                            return undefined
                        }
                    })
                    .filter((_) => _)
            )
        ).sort()
        const numberOfElements = classes[className].size
        if (classesSize > 1) {
            description = `For the ${number2ordinal(i)} category, it contains ${
                /* number */ numberOfElements
            } ${/* tagName */ tagNames.length > 1 ? 'element' : '"' + tagNames[0] + '"'}${
                numberOfElements > 1 ? 's' : ''
            }.`
            descriptions.push(description)
            description = ''
        }

        if (tagNames.length > 1) {
            description = `${numberOfElements > 1 ? 'They' : 'It'} can switch ${
                tagNames.length == 2 ? 'between' : 'among'
            } ${textualizeStringArray(
                tagNames.map((_) => `\"${_}\"${numberOfElements > 1 ? 's' : ''}`)
            )}, `

            const attrNamesOfTagName = Object.entries(attr2diff)
                .filter(([attrName, diff]) => diff.tagName)
                .map(([attrName, diff]) => attrName)

            description += `${textualizeStringArray(
                attrNamesOfTagName.map((attrName) => `attribute \"${attrName}\"`)
            )} control${attrNamesOfTagName.length > 1 ? '' : 's'} the switch.`
            descriptions.push(description)
            description = ''

            const attr2diffEntriesWithCommonStyle = Object.entries(attr2diff).reduce(
                (result, [attrName, diff]) => {
                    if (!diff.tagName) {
                        if (diff.style) {
                            const _diff = {}
                            for (let channel in diff.style) {
                                if (COMMON_STYLE_CHANNELS.has(channel)) {
                                    _diff.style = _diff.style ?? {}
                                    _diff.style[channel] = true
                                }
                            }
                            if (_diff.style) {
                                result.push([attrName, _diff])
                            }
                        }
                    }
                    return result
                },
                []
            )

            descriptions = descriptions.concat(textualizeAttr2Diff(attr2diffEntriesWithCommonStyle))

            tagNames.forEach((tagName) => {
                description = `When ${
                    numberOfElements > 1 ? 'they are' : 'it is'
                } switched into \"${tagName}\"${numberOfElements > 1 ? 's' : ''}, `

                descriptions.push(description)
                description = ''

                const attr2diffEntriesWithThisTag = Object.entries(attr2diff).reduce(
                    (result, [attrName, diff]) => {
                        if (!diff.tagName) {
                            if (diff.style) {
                                const _diff = {}
                                for (let channel in diff.style) {
                                    if (
                                        [
                                            COMMON_POSITION_CHANNELS.get(tagName),
                                            BASIC_SVG_ELEMENTS.get(tagName)
                                        ].some(
                                            (channels) =>
                                                channels.has(channel) ||
                                                (channel.split('.')[1] == tagName &&
                                                    channels.has(channel.split('.')[0]))
                                        )
                                    ) {
                                        _diff.style = _diff.style ?? {}
                                        _diff.style[channel] = true
                                    }
                                }
                                if (_diff.style) {
                                    result.push([attrName, _diff])
                                }
                            }
                        }
                        return result
                    },
                    []
                )

                descriptions = descriptions.concat(textualizeAttr2Diff(attr2diffEntriesWithThisTag))
            })
        }

        if (tagNames.length == 1) {
            // no switch
            descriptions = descriptions.concat(textualizeAttr2Diff(Object.entries(attr2diff)))
        }

        i++
    }
    function textualizeAttr2Diff(attr2diffEntries) {
        const descriptions = []
        attr2diffEntries.forEach(([attrName, diff]) => {
            const channels = []
            if (diff.style)
                Object.entries(diff.style).forEach(([channel, bool]) => {
                    bool ? channels.push(channel) : null
                })
            description = `Attribute \"${attrName}\" controls its ${textualizeStringArray(
                channels.map((_) => `\"${_.split('.')[0]}\"`)
            )}.`
            descriptions.push(description)
            description = ''
        })
        return descriptions
    }

    console.log(descriptions.join('\n'))
    const endTime = performance.now()
    console.log(endTime - beginTime)
}

export { detector }
