import * as d3 from 'd3'
import compare from './compare'
import { object, NoLinDiagram } from './utils'

/**
 *
 * @param {Object} graph: standard node-link data format
 * @param {Function} func: the function that takes data as input and generate a node-link diagram (svg format)
 * @param {String} entityType: 'nodes' | 'links'
 */
export default function entity2element(graph, func, entityType) {
    // Step1: Eliminate random encoding
    const svg = func(d3, object.deepcopy(graph))
    const svgBeta = func(d3, object.deepcopy(graph))
    const unstableComponents = compare(svg, svgBeta)

    // Step2: Get the Mapping
    const entity2element = new Array(graph[entityType].length)
    const attribute2channel = new Array(graph[entityType].length)
    const attributes = NoLinDiagram.getAttributesOf(graph) /* Map(name <=> {entityType, range}) */
    const svgOrigin = func(d3, object.deepcopy(graph))
    for (let [name, { type, range }] of attributes[entityType].entries()) {
        // Step2.1: ensure that this attribute could cause changes
        const shuffledGraph = object.deepcopy(graph)
        const shuffledRange = d3.shuffle(range.slice())
        shuffledGraph[entityType].forEach((entity, i) => {
            entity[name] = shuffledRange[i]
        })
        const svgShuffled = func(d3, shuffledGraph)
        const diff = compare(svgOrigin, svgShuffled)
        if (!unstableComponents.isEmpty()) {
            diff.eliminate(unstableComponents)
        }
        if (diff.isEmpty()) {
            // if this attribute cannot cause any change to svg
            // no need to test it
            continue
        }

        // Step2.2: get the mapping by swap attributes of entities
        // swap one of the attributes of two entities
        // we assume that it will not change the element sequence
        for (let i = 0; i < graph[entityType].length; i++) {
            let canNotFind = false
            let clonedGraph = object.deepcopy(graph)
            let attributeI = clonedGraph[entityType][i][name]
            let j = (i + 1) % graph[entityType].length
            let attributeJ = clonedGraph[entityType][j][name]
            let indexofSwapIJDiff = undefined
            let svgControl = svgOrigin
            let svgSwapped
            let swapIJDiff, swapIKDiff
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

                svgSwapped = func(d3, object.deepcopy(clonedGraph))
                swapIJDiff = compare(svgControl, svgSwapped)
                if (!unstableComponents.isEmpty()) {
                    swapIJDiff.eliminate(unstableComponents)
                }
                indexofSwapIJDiff = swapIJDiff.getIndexOfDifferences()
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

                svgSwapped = func(d3, object.deepcopy(clonedGraph))
                swapIKDiff = compare(svgControl, svgSwapped)
                if (!unstableComponents.isEmpty()) {
                    swapIKDiff.eliminate(unstableComponents)
                }
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

            if (!entity2element[i]) {
                entity2element[i] = new Set()
                for (let ij in indexofSwapIJDiff) {
                    for (let ik in indexofSwapIKDiff) {
                        if (indexofSwapIJDiff[ij] == indexofSwapIKDiff[ik]) {
                            entity2element[i].add(indexofSwapIKDiff[ik])
                        }
                    }
                }
            }

            // Step2.3 Get the attribute2channel Mapping
            // find the changed visual channels
            if (!attribute2channel[i]) {
                attribute2channel[i] = {}
            }
            const changedElementsWithChannels = new Map()
            entity2element[i].forEach((index) => {
                const diffs = [swapIJDiff.array[index], swapIKDiff.array[index]]
                const change = {}
                diffs.forEach((diff) => {
                    if (diff?.tagName) {
                        change.tagName = true
                    }
                    if (diff && diff.style) {
                        if (!change.style) {
                            change.style = {}
                        }
                        for (let channel in diff.style) {
                            change.style[channel] = true
                        }
                    }
                })
                change.elementIndex = index
                changedElementsWithChannels.set(index, change)
            })
            attribute2channel[i][name] = changedElementsWithChannels
        }
    }
    return [entity2element, attribute2channel]
}
