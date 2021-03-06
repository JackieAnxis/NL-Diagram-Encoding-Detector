const COMMON_STYLE_CHANNELS = new Set([
    'fill',
    'fill-opacity',
    'stroke',
    'stroke-dasharray',
    'stroke-opacity',
    'stroke-width',
    'transform'
])
const BASIC_SVG_ELEMENTS = new Map([
    ['circle', ['r']],
    ['ellipse', ['rx', 'ry']],
    ['line', ['x1', 'x2', 'y1', 'y2']],
    ['polygon', ['points']],
    ['polyline', ['points']],
    ['rect', ['x', 'y', 'width', 'height', 'rx', 'ry']],
    ['path', ['d']]
])
BASIC_SVG_ELEMENTS.forEach((attributes, name) => {
    attributes = attributes.concat([...COMMON_STYLE_CHANNELS])
    BASIC_SVG_ELEMENTS.set(name, new Set(attributes))
})
export { BASIC_SVG_ELEMENTS, COMMON_STYLE_CHANNELS }
