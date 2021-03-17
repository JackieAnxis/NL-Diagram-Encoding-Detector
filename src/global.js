// great: it is a good channel to encode info
// maybe: it is not really good enough
// rare: it is bad to encode info
const COMMON_STYLE_CHANNELS = new Set([
    'fill', // great, color
    'fill-opacity', // maybe, numerical
    'stroke', // great, color
    'stroke-dasharray', // rare
    'stroke-opacity', // maybe, numerical
    'stroke-width', // great, numerical
    'transform' // great, numerical
])

const COMMON_POSITION_CHANNELS = new Map([
    ['circle', new Set(['cx', 'cy'])], // great, numerical
    ['ellipse', new Set(['cx', 'cy'])], // great, numerical
    ['line', new Set(['x1', 'x2', 'y1', 'y2'])], // great, numerical
    ['polygon', new Set(['points'])], // great, numerical array
    ['polyline', new Set(['points'])], // great, numerical array
    ['rect', new Set(['x', 'y'])], // great, rx/ry: mayby, all numerical
    ['path', new Set([])] // great, categorical + numerical
])

const DEFAULT_ATTRIBUTE = {
    fill: [255, 255, 255, 1],
    'fill-opacity': 1,
    stroke: [255, 255, 255, 1],
    'stroke-dasharray': 'none',
    'stroke-opacity': 1,
    transform: 'none',
    rx: 'auto',
    ry: 'auto'
}

const BASIC_SVG_ELEMENTS = new Map([
    ['circle', ['r']], // great, numerical
    ['ellipse', ['rx', 'ry']], // great, numerical
    ['line', []], // great, numerical
    ['polygon', []], // great, numerical array
    ['polyline', []], // great, numerical array
    ['rect', ['width', 'height', 'rx', 'ry']], // great, rx/ry: mayby, all numerical
    ['path', []] // great, categorical + numerical
])
BASIC_SVG_ELEMENTS.forEach((attributes, name) => {
    attributes = attributes.concat([...COMMON_STYLE_CHANNELS])
    BASIC_SVG_ELEMENTS.set(name, new Set(attributes))
})

const CONNECTOR_CHAR = '→'

const SHARED_CHANNELS = new Set(['rx', 'ry', 'cx', 'cy', 'points'])

export {
    BASIC_SVG_ELEMENTS,
    COMMON_STYLE_CHANNELS,
    DEFAULT_ATTRIBUTE,
    CONNECTOR_CHAR,
    COMMON_POSITION_CHANNELS,
    SHARED_CHANNELS
}
