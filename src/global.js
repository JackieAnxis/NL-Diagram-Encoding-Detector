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
const BASIC_SVG_ELEMENTS = new Map([
    ['circle', ['r', 'cx', 'cy']], // great, numerical
    ['ellipse', ['rx', 'ry', 'cx', 'cy']], // great, numerical
    ['line', ['x1', 'x2', 'y1', 'y2']], // great, numerical
    ['polygon', ['points']], // great, numerical array
    ['polyline', ['points']], // great, numerical array
    ['rect', ['x', 'y', 'width', 'height', 'rx', 'ry']], // great, rx/ry: mayby, all numerical
    ['path', ['d']] // great, categorical + numerical
])
BASIC_SVG_ELEMENTS.forEach((attributes, name) => {
    attributes = attributes.concat([...COMMON_STYLE_CHANNELS])
    BASIC_SVG_ELEMENTS.set(name, new Set(attributes))
})
export { BASIC_SVG_ELEMENTS, COMMON_STYLE_CHANNELS }
