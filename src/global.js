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
export { BASIC_SVG_ELEMENTS, COMMON_STYLE_CHANNELS, DEFAULT_ATTRIBUTE, CONNECTOR_CHAR }
