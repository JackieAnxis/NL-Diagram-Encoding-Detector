import { dom, object } from './utils'

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
    }
}

export { ifNoStructChange }
