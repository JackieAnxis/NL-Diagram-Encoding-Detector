const width = 800
const height = 600

const id2node = new Map()
const nodes = data.nodes.map((d) => {
    const n = Object.create(d)
    id2node.set(d.id, n)
    return n
})

const links = data.links.map((d) => ({
    value: d.value,
    source: id2node.get(d.source),
    target: id2node.get(d.target)
}))

// node color
const color = (function () {
    const groups = Array.from(new Set(data.nodes.map((d) => d.group))).sort(d3.ascending)
    const colors = d3.schemeCategory10
    return (d) => colors[groups.indexOf(d.group)]
})()

const svg = d3
    .create('svg')
    .attr('viewBox', [0, 0, width, height])
    .attr('width', width)
    .attr('height', height)

const link = svg
    .append('g')
    .attr('stroke', '#999')
    .attr('stroke-opacity', 0.6)
    .selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke-width', (d) => Math.sqrt(d.value))

const node = svg
    .append('g')
    .attr('stroke', '#fff')
    .attr('stroke-width', 1.5)
    .selectAll('circle')
    .data(nodes)
    .join('circle')
    .attr('r', 5)
    .attr('fill', color)

node.append('title').text((d) => d.id)

link.attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y)

node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

return svg.node()
