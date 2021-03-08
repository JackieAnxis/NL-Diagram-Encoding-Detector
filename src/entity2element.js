import * as d3 from 'd3'
import compare from './compare'
import { dom, object, NoLinDiagram } from './utils'

/**
 *
 * @param {Object} graph: standard node-link data format
 * @param {Function} func: the function that takes data as input and generate a node-link diagram (svg format)
 * @param {String} entityType: 'nodes' | 'links'
 */
export default function entity2element(graph, func, entityType) {
    const entity2element = new Array(graph[entityType].length)
    const attributes = NoLinDiagram.getAttributesOf(graph) /* Map(name <=> {entityType, range}) */
    const svgOrigin = func(d3, graph)
    for (let [name, { type, range }] of attributes[entityType].entries()) {
        // step0: check whether all nodes/links get mapped
        let isAllFound = true
        for (let i = 0; i < entity2element.length; i++) {
            if (!entity2element[i]) {
                isAllFound = false
                break
            }
        }
        if (isAllFound) {
            break
        }

        // step1: ensure that this attribute could cause changes
        const shuffledGraph = object.deepcopy(graph)
        const shuffledRange = d3.shuffle(range.slice())
        shuffledGraph[entityType].forEach((entity, i) => {
            entity[name] = shuffledRange[i]
        })
        const svgShuffled = func(d3, shuffledGraph)
        const diff = compare(svgOrigin, svgShuffled)
        if (diff.isEmpty()) {
            // if this attribute cannot cause any change to svg
            // no need to test it
            continue
        }

        // step2: get the mapping by swap attributes of entities
        // swap one of the attributes of two entities
        // we assume that it will not change the element sequence
        for (let i = 0; i < graph[entityType].length; i++) {
            if (entity2element[i]) {
                // entity i has been mapped
                continue
            }
            let canNotFind = false
            let clonedGraph = object.deepcopy(graph)
            let attributeI = clonedGraph[entityType][i][name]
            let j = (i + 1) % graph[entityType].length
            let attributeJ = clonedGraph[entityType][j][name]
            let indexofSwapIJDiff = undefined
            let svgControl = svgOrigin
            let svgSwapped
            do {
                while (object.isEqual(attributeI, attributeJ)) {
                    // find some entities[j] which does not have an attribute[name] same with entities[i]
                    j = (j + 1) % graph[entityType].length
                    attributeJ = clonedGraph[entityType][j][name]
                    if (i == j) {
                        if (indexofSwapIJDiff) {
                            // if find indexofSwapIJDiff, but it is empty
                            console.error(
                                `Attribute: ${name} of all ${entityType} encode into the same visual channel, can not detect which visual channel encodes it.`
                            )
                            canNotFind = true
                            break
                        } else {
                            console.error(
                                `All ${entityType} have same attribute: ${name}, can not detect which visual channel encodes it.`
                            )
                            canNotFind = true
                            break
                        }
                    }
                }

                if (canNotFind) {
                    break
                }

                // swap attribute[name] of entities[i] and entitie[j]
                clonedGraph[entityType][i][name] = attributeJ
                clonedGraph[entityType][j][name] = attributeI

                svgSwapped = func(d3, clonedGraph)
                const swapIJDiff = compare(svgControl, svgSwapped)
                indexofSwapIJDiff = swapIJDiff.getIndexOfDifferences()
                // TODO for categorical mapping
                if (!indexofSwapIJDiff.length) {
                    // no diff, find another j
                    j = (j + 1) % graph[entityType].length
                    if (i == j) {
                        console.error(
                            `Cannot produce any difference by swapping ${entityType}[${i}] and any other ${entityType.slice(
                                0,
                                -1
                            )}`
                        )
                        canNotFind = true
                        break
                    }
                }
            } while (indexofSwapIJDiff.length == 0)

            if (canNotFind) {
                break
            }

            // swap entity[i] and entity[k]
            attributeI = clonedGraph[entityType][i][name] // new value
            let k = (i + 1) % graph[entityType].length
            let attributeK = clonedGraph[entityType][k][name]
            let indexofSwapIKDiff
            let isReset = false
            svgControl = svgSwapped
            function reset() {
                isReset = true
                clonedGraph = object.deepcopy(graph)
                k = (i + 1) % graph[entityType].length
                attributeI = clonedGraph[entityType][i][name]
                attributeK = clonedGraph[entityType][k][name]
                svgControl = svgOrigin
            }
            do {
                while (object.isEqual(attributeI, attributeK) || k == j) {
                    // find some link[k] which does not have an attribute[name] with link[i]
                    k = (k + 1) % graph[entityType].length
                    attributeK = clonedGraph[entityType][k][name]
                    if (i == k) {
                        if (!isReset) {
                            // not find any link that has different attribute[name] with link[i]
                            // reset the clonedGraph, and find it again
                            reset()
                            continue
                        } else {
                            if (indexofSwapIKDiff) {
                                // if find indexofSwapIKDiff, but it is empty
                                console.error(
                                    `Attribute: ${name} of all ${entityType} encode into the same visual channel, can not detect which visual channel encodes it.`
                                )
                                canNotFind = true
                                break
                            } else {
                                console.error(
                                    `All ${entityType} have same attribute: ${name}, can not detect which visual channel encodes it.`
                                )
                                canNotFind = true
                                break
                            }
                        }
                    }
                }

                if (canNotFind) {
                    break
                }

                // swap attribute[name] of links[i] and links[k]
                clonedGraph[entityType][i][name] = attributeK
                clonedGraph[entityType][k][name] = attributeI

                svgSwapped = func(d3, clonedGraph)
                const swapIKDiff = compare(svgControl, svgSwapped)
                indexofSwapIKDiff = swapIKDiff.getIndexOfDifferences()
                if (!indexofSwapIKDiff.length) {
                    // no diff, find another k
                    k = (k + 1) % graph[entityType].length
                    if (i == k) {
                        if (!isReset) {
                            reset()
                        } else {
                            console.error(
                                `Cannot produce any difference by swapping ${entityType}[${i}] and any other ${entityType.slice(
                                    0,
                                    -1
                                )}`
                            )
                            canNotFind = true
                            break
                        }
                    }
                }
            } while (indexofSwapIJDiff.length == 0)

            if (canNotFind) {
                break
            }

            entity2element[i] = []
            for (let ij in indexofSwapIJDiff) {
                for (let ik in indexofSwapIKDiff) {
                    if (indexofSwapIJDiff[ij] == indexofSwapIKDiff[ik]) {
                        entity2element[i].push(indexofSwapIKDiff[ik])
                    }
                }
            }
        }
    }
    console.log(entity2element)
    return entity2element
}
