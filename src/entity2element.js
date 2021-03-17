import * as d3 from 'd3'
import compare from './compare'
import { object, NoLinDiagram } from './utils'
import { NLDComponents } from './NLDComponents'
import { CONNECTOR_CHAR, SHARED_CHANNELS } from './global'

/**
 *
 * @param {Object} graph: standard node-link data format
 * @param {Function} func: the function that takes data as input and generate a node-link diagram (svg format)
 * @param {String} entityType: 'nodes' | 'links'
 * @param {Dict} entity2element: {entityIndex => elementIndex}
 * @param {Dict} element2label: {elementIndex => label}
 */
export function mapAttribute2Channel(graph, func, entityType, entity2element, element2label) {
    // Step1: Eliminate random encoding
    const svg = func(d3, object.deepcopy(graph))
    const svgBeta = func(d3, object.deepcopy(graph))
    const unstableComponents = compare(svg, svgBeta)

    // Step2: shuffle all attributes, find which channels are influnced
    const attributes = NoLinDiagram.getAttributesOf(graph) /* Map(name <=> {entityType, range}) */
    const svgOrigin = func(d3, object.deepcopy(graph))
    const label2attr2diff = {}
    for (let [name, { type, range }] of attributes[entityType].entries()) {
        // Step2.1: shuffle and generate
        const shuffledGraph = object.deepcopy(graph)
        const shuffledRange = d3.shuffle(range.slice())
        shuffledGraph[entityType].forEach((entity, i) => {
            entity[name] = shuffledRange[i]
        })
        const svgShuffled = func(d3, shuffledGraph)
        const nldOrigin = new NLDComponents(svgOrigin)
        const nldShuffled = new NLDComponents(svgShuffled)
        const diffs = nldOrigin.diffWith(nldShuffled)

        if (!unstableComponents.isEmpty()) {
            diffs.eliminate(unstableComponents)
        }
        if (diffs.isEmpty()) {
            // if this attribute cannot cause any change to svg
            // no need to test it
            continue
        }

        // Step2.2: merge diffs by label
        diffs.array.forEach((diffItem, elementIndex) => {
            if (diffItem) {
                const label = element2label[elementIndex]
                if (label != undefined && label != 'undefined') {
                    label2attr2diff[label] = label2attr2diff[label] ?? {}
                    const attr2diff = label2attr2diff[label]
                    attr2diff[name] = attr2diff[name] ?? {}
                    if (diffItem.style) {
                        Object.keys(diffItem.style).forEach((channel) => {
                            if (SHARED_CHANNELS.has(channel)) {
                                // e.g. ellipse and rect share rx and ry
                                const tagName = nldShuffled.basicElementArray[elementIndex].tagName
                                diffItem.style[channel + '.' + tagName] = diffItem.style[channel]
                                delete diffItem.style[channel]
                            }
                        })
                    }
                    attr2diff[name] = mergeDiff(diffItem, attr2diff[name])
                }
            }
        })

        console.log(label2attr2diff)
    }

    return label2attr2diff

    function mergeDiff(diff1, diff2) {
        const mergedDiff = {}
        const diffs = [diff1, diff2]
        diffs.forEach((diff) => {
            if (diff.tagName) {
                mergedDiff.tagName |= diff.tagName
            }
            if (diff.style) {
                for (let channel in diff.style) {
                    mergedDiff.style = mergedDiff.style ?? {}
                    mergedDiff.style[channel] |= diff.style[channel]
                }
            }
        })
        return mergedDiff
    }
}

/**
 *
 * @param {Object} graph: standard node-link data format
 * @param {Function} func: the function that takes data as input and generate a node-link diagram (svg format)
 * @param {String} entityType: 'nodes' | 'links'
 */
export function mapEntity2Element(graph, func, entityType) {
    // Step1: Eliminate random encoding
    const svg = func(d3, object.deepcopy(graph))
    const svgBeta = func(d3, object.deepcopy(graph))
    const unstableComponents = compare(svg, svgBeta)

    // Step2: Get the Mapping
    const entity2element = new Array(graph[entityType].length) // : [[entityIndex]: Set(elementIndex)]
    const svgOrigin = func(d3, object.deepcopy(graph))

    // Step2.2: get the mapping by swapping entities
    // swap two entities
    // we assume that it will not change the element sequence
    const labelsOfElements = []
    labelsOfElements.max = 0
    for (let i = 0; i < graph[entityType].length; i++) {
        console.log(
            `%c For %c${entityType}%c's attribute, computing %c${entityType}%c[%c${i}/${graph[entityType].length}%c]'s encoding...`,
            'background: #222; color: #bada55',
            'background: #222; color: #d94e54',
            'background: #222; color: #bada55',
            'background: #222; color: #d94e54',
            'background: #222; color: #bada55',
            'background: #222; color: #d94e54',
            'background: #222; color: #bada55'
        )

        let clonedGraph = object.deepcopy(graph)
        let thisEntity = clonedGraph[entityType][i]
        let svgControl = svgOrigin

        // Step2.2.1 find all entities that don't have totally same attributes with entities[i]
        let entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
        function findEntitiesWithDiffAttr_INDEX(thisEntity, graph) {
            let entitiesWithDiffAttr_INDEX = [] // entities with different attribute (just stores index)
            let valueStack = []
            function isAttributesAllSame(entity) {
                return !Object.keys(thisEntity).some(
                    (name) =>
                        name !== 'id' &&
                        name !== 'source' &&
                        name !== 'target' &&
                        !object.isEqual(thisEntity[name], entity[name])
                )
            }
            graph[entityType].forEach((entity, j) => {
                if (!isAttributesAllSame(entity)) {
                    if (valueStack.every((value) => !isAttributesAllSame(value, entity))) {
                        entitiesWithDiffAttr_INDEX.push(j)
                    }
                }
            })
            return entitiesWithDiffAttr_INDEX
        }

        // Step2.2.2 swap thisEntity with each of entities with at least one different attribute
        if (entitiesWithDiffAttr_INDEX.length == 0) {
            console.error(
                'All entities have same attribute, algorithm can not detect any encoding.'
            )
            debugger // some thing wrong, all entities have same attribute
        } else if (entitiesWithDiffAttr_INDEX.length == 1) {
            // only one entity is different with thisEntity
            // first swap with the diff entity
            const j = entitiesWithDiffAttr_INDEX[0]
            clonedGraph[entityType][i] = clonedGraph[entityType][j]
            clonedGraph[entityType][j] = thisEntity
            thisEntity = clonedGraph[entityType][i]
            // second re-find entities with different attribute
            entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
            // if still only one entity diff with thisEntity, can not deal with such case
            if (entitiesWithDiffAttr_INDEX.length == 1) {
                console.error(
                    `Cannot deal with ${entityType}[${i}], only one ${entityType.slice(
                        0,
                        -1
                    )} diffs with it.`
                )
                debugger
            } else {
                // re-generate the control group svg
                svgControl = func(d3, object.deepcopy(clonedGraph))
            }
        }

        // swap this entity with any other diff entities
        const elementFrequency = {}
        const nldControl = new NLDComponents(svgControl)
        entitiesWithDiffAttr_INDEX.forEach((entityIndex) => {
            const entity = clonedGraph[entityType][entityIndex]

            clonedGraph[entityType][i] = entity
            clonedGraph[entityType][entityIndex] = thisEntity
            thisEntity = clonedGraph[entityType][i]

            let svgSwapped = func(d3, object.deepcopy(clonedGraph))
            const nldSwapped = new NLDComponents(svgSwapped)
            const swapDiff = nldControl.diffWith(nldSwapped)

            if (!unstableComponents.isEmpty()) {
                swapDiff.eliminate(unstableComponents)
            }

            let indexofSwapDiff = swapDiff.getIndexOfDifferences()
            indexofSwapDiff.forEach((elementIndex) => {
                if (!elementFrequency[elementIndex]) {
                    elementFrequency[elementIndex] = 0
                }
                elementFrequency[elementIndex] += 1
                if (elementFrequency[elementIndex] >= 2) {
                    // occurs more than once, it should be entity[i]'s element
                    if (!entity2element[i]) {
                        entity2element[i] = new Set()
                    }
                    entity2element[i].add(elementIndex)
                }
                // compare which elements of nldSwapped is same with nldControl
                indexofSwapDiff.forEach((elementJndex) => {
                    if (
                        elementIndex !== elementJndex &&
                        object.isEqual(
                            nldControl.basicElementArray[elementIndex],
                            nldSwapped.basicElementArray[elementJndex]
                        )
                    ) {
                        if (labelsOfElements[elementIndex] && !labelsOfElements[elementJndex]) {
                            labelsOfElements[elementJndex] = labelsOfElements[elementIndex]
                        } else if (
                            !labelsOfElements[elementIndex] &&
                            labelsOfElements[elementJndex]
                        ) {
                            labelsOfElements[elementIndex] = labelsOfElements[elementJndex]
                        } else if (
                            !labelsOfElements[elementIndex] &&
                            !labelsOfElements[elementJndex]
                        ) {
                            labelsOfElements[elementIndex] = labelsOfElements[
                                elementJndex
                            ] = ++labelsOfElements.max
                        } else {
                            if (labelsOfElements[elementIndex] != labelsOfElements[elementJndex])
                                debugger
                        }
                    }
                })
            })

            // swap back
            clonedGraph[entityType][i] = clonedGraph[entityType][entityIndex]
            clonedGraph[entityType][entityIndex] = thisEntity
            thisEntity = clonedGraph[entityType][i]
        })
    }
    return [entity2element, labelsOfElements]
}

// export default function entity2element(graph, func, entityType) {
//     // Step1: Eliminate random encoding
//     const svg = func(d3, object.deepcopy(graph))
//     const svgBeta = func(d3, object.deepcopy(graph))
//     const unstableComponents = compare(svg, svgBeta)

//     // Step2: Get the Mapping
//     const entity2element = new Array(graph[entityType].length) // : [[entityIndex]: Set(elementIndex)]
//     const ent2att2val2ele2stl = new Array(graph[entityType].length) // : [[entityIndex]: {[entityAttributeName]: Map(elementIndex <=> {elementIndex, style:{[channelName]: Boolean}})}]
//     const ent2att2ele2diff = new Array(graph[entityType].length)
//     const attributes = NoLinDiagram.getAttributesOf(graph) /* Map(name <=> {entityType, range}) */
//     const svgOrigin = func(d3, object.deepcopy(graph))
//     for (let [name, { type, range }] of attributes[entityType].entries()) {
//         // Step2.1: ensure that this attribute could cause changes
//         const shuffledGraph = object.deepcopy(graph)
//         const shuffledRange = d3.shuffle(range.slice())
//         shuffledGraph[entityType].forEach((entity, i) => {
//             entity[name] = shuffledRange[i]
//         })
//         const svgShuffled = func(d3, shuffledGraph)
//         const diff = compare(svgOrigin, svgShuffled)
//         if (!unstableComponents.isEmpty()) {
//             diff.eliminate(unstableComponents)
//         }
//         if (diff.isEmpty()) {
//             // if this attribute cannot cause any change to svg
//             // no need to test it
//             continue
//         }

//         // Step2.2: get the mapping by swap attributes of entities
//         // swap one of the attributes of two entities
//         // we assume that it will not change the element sequence
//         for (let i = 0; i < graph[entityType].length; i++) {
//             console.log(
//                 `%c For %c${entityType}%c's attribute[%c${name}%c], computing %c${entityType}%c[%c${i}/${graph[entityType].length}%c]'s encoding...`,
//                 'background: #222; color: #bada55',
//                 'background: #222; color: #d94e54',
//                 'background: #222; color: #bada55',
//                 'background: #222; color: #d94e54',
//                 'background: #222; color: #bada55',
//                 'background: #222; color: #d94e54',
//                 'background: #222; color: #bada55',
//                 'background: #222; color: #d94e54',
//                 'background: #222; color: #bada55'
//             )

//             let clonedGraph = object.deepcopy(graph)
//             let thisEntity = clonedGraph[entityType][i]
//             let svgControl = svgOrigin

//             // Step2.2.1 find all entities that don't have same attribute[name] with entities[i]
//             let entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
//             function findEntitiesWithDiffAttr_INDEX(thisEntity, graph) {
//                 let entitiesWithDiffAttr_INDEX = [] // entities with different attribute (just stores index)
//                 let valueStack = []
//                 graph[entityType].forEach((entity, j) => {
//                     if (!object.isEqual(thisEntity[name], entity[name])) {
//                         if (valueStack.every((value) => !object.isEqual(value, entity[name]))) {
//                             entitiesWithDiffAttr_INDEX.push(j)
//                         }
//                     }
//                 })
//                 return entitiesWithDiffAttr_INDEX
//                 // .slice(0, 2) // ! it is a balance with performance and precision
//             }

//             // Step2.2.2 swap thisEntity with each of entities with different attribute
//             if (entitiesWithDiffAttr_INDEX.length == 0) {
//                 debugger // some thing wrong, all entities have same attribute[name]
//             } else if (entitiesWithDiffAttr_INDEX.length == 1) {
//                 // first swap with the diff entity
//                 const j = entitiesWithDiffAttr_INDEX[0]
//                 const attributeI = clonedGraph[entityType][i][name]
//                 clonedGraph[entityType][i][name] = clonedGraph[entityType][j][name]
//                 clonedGraph[entityType][j][name] = attributeI
//                 thisEntity = clonedGraph[entityType][i]
//                 // second re-find entities with different attribute
//                 entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
//                 // if still only one entity diff with thisEntity, can not deal with such case
//                 if (entitiesWithDiffAttr_INDEX.length == 1) {
//                     console.error(
//                         `Cannot deal with ${entityType}[${i}], only one ${entityType.slice(
//                             0,
//                             -1
//                         )} diffs with it.`
//                     )
//                     continue
//                 } else {
//                     // re-generate the control group svg
//                     svgControl = func(d3, object.deepcopy(clonedGraph))
//                 }
//             }

//             // swap this entity with any other diff entities
//             const elementFrequency = {}
//             const nldControl = new NLDComponents(svgControl)
//             const nldSwappedMap = {}
//             entitiesWithDiffAttr_INDEX.forEach((entityIndex) => {
//                 const entity = clonedGraph[entityType][entityIndex]
//                 let attributeI = thisEntity[name]
//                 thisEntity[name] = entity[name]
//                 entity[name] = attributeI

//                 let svgSwapped = func(d3, object.deepcopy(clonedGraph))
//                 const nldSwapped = new NLDComponents(svgSwapped)
//                 nldSwappedMap[entityIndex] = nldSwapped
//                 const swapDiff = nldControl.diffWith(nldSwapped)
//                 if (!unstableComponents.isEmpty()) {
//                     swapDiff.eliminate(unstableComponents)
//                 }
//                 let indexofSwapDiff = swapDiff.getIndexOfDifferences()
//                 indexofSwapDiff.forEach((elementIndex) => {
//                     if (!elementFrequency[elementIndex]) {
//                         elementFrequency[elementIndex] = 0
//                     }
//                     elementFrequency[elementIndex] += 1
//                     if (elementFrequency[elementIndex] >= 2) {
//                         // occurs more than once, it should be entity[i]'s element
//                         if (!entity2element[i]) {
//                             entity2element[i] = new Set()
//                         }
//                         entity2element[i].add(elementIndex)

//                         // Step2.3 Record the changed visual channels
//                         if (!ent2att2ele2diff[i]) {
//                             // i: entity index
//                             ent2att2ele2diff[i] = {}
//                         }
//                         if (!ent2att2ele2diff[i][name]) {
//                             ent2att2ele2diff[i][name] = {}
//                         }

//                         const diffElement = object.deepcopy(swapDiff.array[elementIndex])
//                         if (!ent2att2ele2diff[i][name][elementIndex]) {
//                             ent2att2ele2diff[i][name][elementIndex] = diffElement
//                         } else {
//                             const diff = ent2att2ele2diff[i][name][elementIndex]
//                             if (diffElement.tagName) {
//                                 diff.tagName = diffElement.tagName
//                             }
//                             if (diffElement.style && Object.keys(diffElement.style).length > 0) {
//                                 if (!diff.style) {
//                                     diff.style = {}
//                                 }
//                                 for (let channel in diffElement.style) {
//                                     diff.style[channel] = diffElement.style[channel]
//                                 }
//                             }
//                         }
//                     }
//                 })

//                 // swap back
//                 attributeI = thisEntity[name]
//                 thisEntity[name] = entity[name]
//                 entity[name] = attributeI
//             })

//             entitiesWithDiffAttr_INDEX.push(i)
//             entitiesWithDiffAttr_INDEX.forEach((entityIndex) => {
//                 const entity = clonedGraph[entityType][entityIndex]
//                 const attrName = name
//                 const attrValue = entity[attrName]

//                 Object.keys(ent2att2ele2diff[i][attrName]).forEach((elementIndex) => {
//                     if (!ent2att2val2ele2stl[i]) {
//                         // i: entity index
//                         ent2att2val2ele2stl[i] = {}
//                     }
//                     if (!ent2att2val2ele2stl[i][attrName]) {
//                         ent2att2val2ele2stl[i][attrName] = {}
//                     }

//                     if (!ent2att2val2ele2stl[i][attrName][attrValue]) {
//                         ent2att2val2ele2stl[i][attrName][attrValue] = {}
//                     }

//                     let stl = nldControl.basicElementArray[elementIndex]
//                     if (entityIndex !== i) {
//                         stl = nldSwappedMap[entityIndex].basicElementArray[elementIndex]
//                     }
//                     ent2att2val2ele2stl[i][attrName][attrValue][elementIndex] = stl
//                 })
//             })
//         }
//     }
//     return [entity2element, ent2att2val2ele2stl, ent2att2ele2diff]
// }
