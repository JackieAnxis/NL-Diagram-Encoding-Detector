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
    const entity2element = new Array(graph[entityType].length) // : [[entityIndex]: Set(elementIndex)]
    const attribute2channel = new Array(graph[entityType].length) // : [[entityIndex]: {[entityAttributeName]: Map(elementIndex <=> {elementIndex, style:{[channelName]: Boolean}})}]
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
            console.log(
                `%c For %c${entityType}%c's attribute[%c${name}%c], computing %c${entityType}%c[%c${i}/${graph[entityType].length}%c]'s encoding...`,
                'background: #222; color: #bada55',
                'background: #222; color: #d94e54',
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

            // Step2.2.1 find all entities that don't have same attribute[name] with entities[i]
            let entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
            function findEntitiesWithDiffAttr_INDEX(thisEntity, graph) {
                let entitiesWithDiffAttr_INDEX = [] // entities with different attribute (just stores index)
                let valueStack = []
                graph[entityType].forEach((entity, j) => {
                    if (!object.isEqual(thisEntity[name], entity[name])) {
                        if (valueStack.every((value) => !object.isEqual(entity[name], value))) {
                            // this value is not be stacked
                            entitiesWithDiffAttr_INDEX.push(j)
                        }
                    }
                })
                return entitiesWithDiffAttr_INDEX //.slice(0, 2) // ! it is a balance with performance and precision
            }

            // Step2.2.2 swap thisEntity with each of entities with different attribute
            if (entitiesWithDiffAttr_INDEX.length == 0) {
                debugger // some thing wrong, all entities have same attribute[name]
            } else if (entitiesWithDiffAttr_INDEX.length == 1) {
                // first swap with the diff entity
                const j = entitiesWithDiffAttr_INDEX[0]
                const attributeI = clonedGraph[entityType][i][name]
                clonedGraph[entityType][i][name] = clonedGraph[entityType][j][name]
                clonedGraph[entityType][j][name] = attributeI
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
                    continue
                } else {
                    // re-generate the control group svg
                    svgControl = func(d3, object.deepcopy(clonedGraph))
                }
            }
            // swap this entity with any other diff entities
            const elementFrequency = {}
            entitiesWithDiffAttr_INDEX.forEach((entityIndex) => {
                const entity = clonedGraph[entityType][entityIndex]
                let attributeI = thisEntity[name]
                thisEntity[name] = entity[name]
                entity[name] = attributeI

                let svgSwapped = func(d3, object.deepcopy(clonedGraph))
                let swapDiff = compare(svgControl, svgSwapped)
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

                        // Step2.3 Record the changed visual channels
                        if (!attribute2channel[i]) {
                            attribute2channel[i] = {}
                        }
                        if (!attribute2channel[i][name]) {
                            attribute2channel[i][name] = {}
                        }

                        const diffElement = object.deepcopy(swapDiff.array[elementIndex])
                        attribute2channel[i][name][elementIndex] = diffElement
                    }
                })

                // swap back
                attributeI = thisEntity[name]
                thisEntity[name] = entity[name]
                entity[name] = attributeI
            })
        }
    }
    return [entity2element, attribute2channel]
}

function _entity2element(graph, func, entityType) {
    // Step1: Eliminate random encoding
    const svg = func(d3, object.deepcopy(graph))
    const svgBeta = func(d3, object.deepcopy(graph))
    const unstableComponents = compare(svg, svgBeta)

    // Step2: Get the Mapping
    const entity2element = new Array(graph[entityType].length) // : [[entityIndex]: Set(elementIndex)]
    const attribute2channel = new Array(graph[entityType].length) // : [[entityIndex]: {[entityAttributeName]: Map(elementIndex <=> {elementIndex, style:{[channelName]: Boolean}})}]
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
            console.log(
                `%c For %c${entityType}%c's attribute[%c${name}%c], computing %c${entityType}%c[%c${i}/${graph[entityType].length}%c]'s encoding...`,
                'background: #222; color: #bada55',
                'background: #222; color: #d94e54',
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

            // Step2.2.1 find all entities that don't have same attribute[name] with entities[i]
            let entitiesWithDiffAttr_INDEX = findEntitiesWithDiffAttr_INDEX(thisEntity, clonedGraph)
            function findEntitiesWithDiffAttr_INDEX(thisEntity, graph) {
                let entitiesWithDiffAttr_INDEX = [] // entities with different attribute (just stores index)
                graph[entityType].forEach((entity, j) => {
                    if (!object.isEqual(thisEntity[name], entity[name])) {
                        entitiesWithDiffAttr_INDEX.push(j)
                    }
                })
                return entitiesWithDiffAttr_INDEX.slice(0, 2) // TODO it is a balance with performance and precision
            }

            // Step2.2.2 swap thisEntity with each of entities with different attribute
            if (entitiesWithDiffAttr_INDEX.length == 0) {
                debugger // some thing wrong, all entities have same attribute[name]
            } else if (entitiesWithDiffAttr_INDEX.length == 1) {
                // first swap with the diff entity
                const j = entitiesWithDiffAttr_INDEX[0]
                const attributeI = clonedGraph[entityType][i][name]
                clonedGraph[entityType][i][name] = clonedGraph[entityType][j][name]
                clonedGraph[entityType][j][name] = attributeI
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
                    continue
                } else {
                    // re-generate the control group svg
                    svgControl = func(d3, object.deepcopy(clonedGraph))
                }
            }
            // swap this entity with any other diff entities
            const elementFrequency = {}
            entitiesWithDiffAttr_INDEX.forEach((entityIndex) => {
                const entity = clonedGraph[entityType][entityIndex]
                let attributeI = thisEntity[name]
                thisEntity[name] = entity[name]
                entity[name] = attributeI

                let svgSwapped = func(d3, object.deepcopy(clonedGraph))
                let swapDiff = compare(svgControl, svgSwapped)
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

                        // Step2.3 Record the changed visual channels
                        if (!attribute2channel[i]) {
                            attribute2channel[i] = {}
                        }
                        if (!attribute2channel[i][name]) {
                            attribute2channel[i][name] = {}
                        }

                        const diffElement = object.deepcopy(swapDiff.array[elementIndex])
                        attribute2channel[i][name][elementIndex] = diffElement
                    }
                })

                // swap back
                attributeI = thisEntity[name]
                thisEntity[name] = entity[name]
                entity[name] = attributeI
            })
        }
    }
    return [entity2element, attribute2channel]
}
