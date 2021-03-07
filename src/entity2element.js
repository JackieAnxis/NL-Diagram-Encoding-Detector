import * as d3 from 'd3'
import compare from './compare'
import { dom, object, NoLinDiagram } from './utils'

const ifNoStructChange = {
    nodeMapper: function (data, func) {
        // judge how each node/link is represented in the dom tree
        // find visual elements for each node
        // first, find visual elements for all nodes except nodes[0]
        const clonedDataWithOneNode = { nodes: [data.nodes[0]], links: [] }
        let lastSVG = func(d3, clonedDataWithOneNode)
        let lastCount = dom.countBasicElementsOf(lastSVG)
        const nodesRelatedElements = {}
        let svg, diff, count
        for (let i = 1; i < data.nodes.length; i++) {
            const node = object.deepcopy(data.nodes[i])
            const id = node.id
            clonedDataWithOneNode.nodes.push(node)
            svg = func(d3, clonedDataWithOneNode)
            // TODO determine what is missing?

            // count = dom.countBasicElementsOf(svg)
            // const diff = lastCount.minus(count)
            // nodesRelatedElements[id] = []
            // for (let name in diff) {
            //     if (diff[name] > 0) {
            //         nodesRelatedElements[id].push({
            //             name,
            //             count: diff[name]
            //         })
            //     }
            // }
            // lastCount = count
            // lastSVG = svg
        }

        // second, find visual elements of nodes[0]
        const node0 = clonedDataWithOneNode.nodes.shift() // remove nodes[0]
        svg = func(d3, clonedDataWithOneNode)
        count = dom.countBasicElementsOf(svg)
        diff = count.minus(lastCount)
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
            nodes: deepcopy(data.nodes),
            links: [deepcopy(data.links[0])]
        }
        lastSVG = func(d3, clonedDataWithAllNodes)
        lastCount = dom.countBasicElementsOf(lastSVG)
        const linksRelatedElements = {}
        count = {}
        for (let i = 1; i < data.links.length; i++) {
            const link = deepcopy(data.links[i])
            clonedDataWithAllNodes.links.push(link)
            const svg = func(d3, clonedDataWithAllNodes)
            count = dom.countBasicElementsOf(svg)
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
        count = dom.countBasicElementsOf(svg)
        diff = count.minus(lastCount)
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

        return [...nodesRelatedElementsMap.keys()].map((keys) => {
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
    },
    linkMapper: function (graph, func) {
        const attributes = NoLinDiagram.getAttributesOf(graph) /* Map(name <=> {type, range}) */
        const svgOrigin = func(d3, graph)
        attributes['links'].forEach(({ type, range }, name) => {
            // step1: ensure that this attribute could cause changes
            const shuffledGraph = object.deepcopy(graph)
            const shuffledRange = d3.shuffle(range.slice())
            shuffledGraph.links.forEach((link, i) => {
                link[name] = shuffledRange[i]
            })
            const svgShuffled = func(d3, shuffledGraph)
            const diff = compare(svgOrigin, svgShuffled)
            if (diff.isEmpty()) {
                // if this attribute cannot cause any change to svg
                // no need to test it
                return
            }

            // step2: get the mapping by swap attributes of entities
            // swap one of the attributes of two entities
            // we assume that it will not change the element sequence
            for (let i = 0; i < graph.links.length; i++) {
                let clonedGraph = object.deepcopy(graph)
                let attributeI = clonedGraph.links[i][name]
                let j = (i + 1) % graph.links.length
                let attributeJ = clonedGraph.links[j][name]
                let indexofSwapIJDiff = undefined
                let svgControl = svgOrigin
                let svgSwapped
                do {
                    while (object.isEqual(attributeI, attributeJ)) {
                        // find some link[j] which does not have an attribute[name] with link[i]
                        j = (j + 1) % graph.links.length
                        attributeJ = clonedGraph.links[j][name]
                        if (i == j) {
                            if (indexofSwapIJDiff) {
                                // if find indexofSwapIJDiff, but it is empty
                                console.error(
                                    `Attribute: ${name} of all links encode into the same visual channel, can not detect which visual channel encodes it.`
                                )
                                return
                            } else {
                                console.error(
                                    `All links have same attribute: ${name}, can not detect which visual channel encodes it.`
                                )
                                return
                            }
                        }
                    }

                    // swap attribute[name] of links[i] and links[j]
                    clonedGraph.links[i][name] = attributeJ
                    clonedGraph.links[j][name] = attributeI

                    svgSwapped = func(d3, clonedGraph)
                    const swapIJDiff = compare(svgControl, svgSwapped)
                    indexofSwapIJDiff = swapIJDiff.getIndexOfDifferences()
                    if (!indexofSwapIJDiff.length) {
                        // no diff, find another j
                        j = (j + 1) % graph.links.length
                        if (i == j) {
                            console.error(
                                `Cannot produce any difference by swapping links[${i}] and any other link`
                            )
                            return
                        }
                    }
                } while (indexofSwapIJDiff.length == 0)

                // swap links[i] and links[k]
                attributeI = clonedGraph.links[i][name] // new value
                let k = (i + 1) % graph.links.length
                let attributeK = clonedGraph.links[k][name]
                let indexofSwapIKDiff
                let isReset = false
                svgControl = svgSwapped
                function reset() {
                    isReset = true
                    clonedGraph = object.deepcopy(graph)
                    k = (i + 1) % graph.links.length
                    attributeI = clonedGraph.links[i][name]
                    attributeK = clonedGraph.links[k][name]
                    svgControl = svgOrigin
                }
                do {
                    while (object.isEqual(attributeI, attributeK) || k == j) {
                        // find some link[k] which does not have an attribute[name] with link[i]
                        k = (k + 1) % graph.links.length
                        attributeK = clonedGraph.links[k][name]
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
                                        `Attribute: ${name} of all links encode into the same visual channel, can not detect which visual channel encodes it.`
                                    )
                                    return
                                } else {
                                    console.error(
                                        `All links have same attribute: ${name}, can not detect which visual channel encodes it.`
                                    )
                                    return
                                }
                            }
                        }
                    }

                    // swap attribute[name] of links[i] and links[k]
                    clonedGraph.links[i][name] = attributeK
                    clonedGraph.links[k][name] = attributeI

                    svgSwapped = func(d3, clonedGraph)
                    const swapIKDiff = compare(svgControl, svgSwapped)
                    indexofSwapIKDiff = swapIKDiff.getIndexOfDifferences()
                    if (!indexofSwapIKDiff.length) {
                        // no diff, find another k
                        k = (k + 1) % graph.links.length
                        if (i == k) {
                            if (!isReset) {
                                reset()
                            } else {
                                console.error(
                                    `Cannot produce any difference by swapping links[${i}] and any other link`
                                )
                                return
                            }
                        }
                    }
                } while (indexofSwapIJDiff.length == 0)

                console.log(indexofSwapIJDiff, indexofSwapIKDiff)
                // TODO compare two index, find the exact one
            }
        })
    }
}

export { ifNoStructChange }
