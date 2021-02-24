var width = 960
var height = 600
var graph = data
var svg = d3.create('svg').attr('viewBox', [0, 0, width, height])

var color = d3
    .scaleOrdinal()
    .range([
        '#1f77b4',
        '#aec7e8',
        '#ff7f0e',
        '#ffbb78',
        '#2ca02c',
        '#98df8a',
        '#d62728',
        '#ff9896',
        '#9467bd',
        '#c5b0d5',
        '#8c564b',
        '#c49c94',
        '#e377c2',
        '#f7b6d2',
        '#7f7f7f',
        '#c7c7c7',
        '#bcbd22',
        '#dbdb8d',
        '#17becf',
        '#9edae5'
    ])

var DEFAULT_OPTIONS = {
    radius: 20,
    outerStrokeWidth: 10,
    parentNodeColor: 'blue',
    showPieChartBorder: true,
    pieChartBorderColor: 'white',
    pieChartBorderWidth: 2,
    showLabelText: false,
    labelText: 'text',
    labelColor: 'blue'
}

function getOptionOrDefault(key, options, defaultOptions) {
    defaultOptions = defaultOptions || DEFAULT_OPTIONS
    if (options && key in options) {
        return options[key]
    }
    return defaultOptions[key]
}

function drawParentCircle(nodeElement, options) {
    var outerStrokeWidth = getOptionOrDefault('outerStrokeWidth', options)
    var radius = getOptionOrDefault('radius', options)
    var parentNodeColor = getOptionOrDefault('parentNodeColor', options)

    nodeElement
        .insert('circle')
        .attr('id', 'parent-pie')
        .attr('r', radius)
        .attr('fill', function (d) {
            return parentNodeColor
        })
        .attr('stroke', function (d) {
            return parentNodeColor
        })
        .attr('stroke-width', outerStrokeWidth)
}

function drawPieChartBorder(nodeElement, options) {
    var radius = getOptionOrDefault('radius', options)
    var pieChartBorderColor = getOptionOrDefault('pieChartBorderColor', options)
    var pieChartBorderWidth = getOptionOrDefault('pieChartBorderWidth', options)

    nodeElement
        .insert('circle')
        .attr('r', radius)
        .attr('fill', 'transparent')
        .attr('stroke', pieChartBorderColor)
        .attr('stroke-width', pieChartBorderWidth)
}

function drawPieChart(nodeElement, percentages, options) {
    var radius = getOptionOrDefault('radius', options)
    var halfRadius = radius / 2
    var halfCircumference = 2 * Math.PI * halfRadius

    var percentToDraw = 0
    for (var p in percentages) {
        percentToDraw += percentages[p]

        nodeElement
            .insert('circle', '#parent-pie + *')
            .attr('r', halfRadius)
            .attr('fill', 'transparent')
            .style('stroke', color(p))
            .style('stroke-width', radius)
            .style(
                'stroke-dasharray',
                (halfCircumference * percentToDraw) / 100 + ' ' + halfCircumference
            )
    }
}

function drawTitleText(nodeElement, options) {
    var radius = getOptionOrDefault('radius', options)
    var text = getOptionOrDefault('labelText', options)
    var color = getOptionOrDefault('labelColor', options)

    nodeElement
        .append('text')
        .text(String(text))
        .attr('fill', color)
        .attr('dy', radius * 2)
}

var NodePieBuilder = {
    drawNodePie: function (nodeElement, percentages, options) {
        drawParentCircle(nodeElement, options)

        if (!percentages) return
        drawPieChart(nodeElement, percentages, options)

        var showLabelText = getOptionOrDefault('showLabelText', options)
        if (showLabelText) {
            drawTitleText(nodeElement, options)
        }
    }
}

var simulation = d3
    .forceSimulation()
    .force(
        'link',
        d3.forceLink().id(function (d) {
            return d.id
        })
    )
    .force('charge', d3.forceManyBody())
    .force('center', d3.forceCenter(width / 2, height / 2))

var link = svg
    .append('g')
    .attr('class', 'links')
    .selectAll('line')
    .data(graph.links)
    .enter()
    .append('line')
    .attr('stroke-width', function (d) {
        return Math.sqrt(d.value)
    })

var node = svg
    .append('g')
    .attr('class', 'nodes')
    .selectAll('g')
    .data(graph.nodes)
    .enter()
    .append('g')
    .call(d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended))

// var circles = node.append("circle")
//     .attr("r", 5)
//     .attr("fill", function(d) { return color(d.group); })

// var lables = node.append("text")
//     .text(function(d) {
//       return d.id;
//     })
//     .attr('x', 6)
//     .attr('y', 3);

// node.append("title")
//     .text(function(d) { return d.id; });

node.each(function (d) {
    NodePieBuilder.drawNodePie(d3.select(this), d.percent, {
        radius: 10,
        parentNodeColor: color(d.group),
        outerStrokeWidth: 2,
        showLabelText: true,
        labelText: d.id,
        labelColor: color(d.group)
    })
})

simulation.nodes(graph.nodes).on('tick', ticked)

simulation.force('link').links(graph.links)

function ticked() {
    link.attr('x1', function (d) {
        return d.source.x
    })
        .attr('y1', function (d) {
            return d.source.y
        })
        .attr('x2', function (d) {
            return d.target.x
        })
        .attr('y2', function (d) {
            return d.target.y
        })

    node.attr('transform', function (d) {
        return 'translate(' + d.x + ',' + d.y + ')'
    })
}

function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart()
    d.fx = d.x
    d.fy = d.y
}

function dragged(d) {
    d.fx = d3.event.x
    d.fy = d3.event.y
}

function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0)
    d.fx = null
    d.fy = null
}

return svg.node()
