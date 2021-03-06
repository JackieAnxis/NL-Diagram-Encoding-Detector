import { BASIC_SVG_ELEMENTS } from './global'

const dom = {
    /**
     * count the number of basic elements contained in the input svg
     * @param {html svg element} svg
     */
    countBasicElementsOf: function (svg) {
        const count = {}
        BASIC_SVG_ELEMENTS.forEach((_, name) => {
            const size = d3.select(svg).selectAll(name).size()
            count[name] = size
        })

        /**
         * get difference between two count result
         * if count2 > count1, it returns positive number
         * @param {Object} count1: {name: String (element name), count: Number}
         * @param {Object} count2: {name: String (element name), count: Number}
         */
        count.prototype.minus = function (subcount) {
            const diff = {}
            const names = new Set([...Object.keys(this), ...Object.keys(subcount)])
            names.forEach((name) => {
                diff[name] = (subcount[name] ? subcount[name] : 0) - (this[name] ? this[name] : 0)
            })
            return diff
        }
        return count
    },
    getComputedStyle: function (element) {
        const computedStyles = window.getComputedStyle(element)
        const style = {}
        const BASIC_STYLES = BASIC_SVG_ELEMENTS.get(element.tagName)
        if (BASIC_STYLES) {
            BASIC_STYLES.forEach((channel) => {
                style[channel] = computedStyles[channel]
            })
            /**
             * transform a position with transform matrix (transformation)
             * @param {Object} style: {tagName: 'xxx', style1: 'xx', style2: 'xx', ...}
             * @param {String} transformation:  e.g. "matrix(1, 0, 0, 1, 10, 10)"
             */
            const transformed = function (style, transformation) {
                const matrix = [1, 0, 0, 1, 0, 0]
                if (transformation !== 'none') {
                    matrix = transformation.slice('matrix('.length, -1).split(',').map(parseFloat)
                }
                function computePosition(position, matrix) {
                    return [position[0] + matrix[4], position[1] + matrix[5]]
                }
                if (style.tagName == 'circle' || style.tagName == 'ellipse') {
                    const [cx, cy] = computePosition([style.cx, style.cy], matrix)
                    style = { ...style, cx, cy }
                } else if (style.tagName == 'line') {
                    const [x1, y1] = computePosition([style.x1, style.y1], matrix)
                    const [x2, y2] = computePosition([style.x2, style.y2], matrix)
                    style = { ...style, x1, y1, x2, y2 }
                } else if (style.tagName === 'polygon' || style.tagName === 'polyline') {
                    // TODO
                    if (typeof style['points'] == 'string') {
                        // 'points' still is a string,
                        // transform it into an array
                    }
                }
            }

            // compute position, assume only translate, no rotate, no scale
            const node = element
            do {
                const transformMatrix = window.getComputedStyle(node).transform
                if (transform !== 'none') {
                }
            } while (node.tagName !== 'svg')
        }
    }
}

const object = {
    isEquivalent: function (a, b) {
        // Create arrays of property names
        const aProps = Object.getOwnPropertyNames(a)
        const bProps = Object.getOwnPropertyNames(b)

        // If number of properties is different,
        // objects are not equivalent
        if (aProps.length != bProps.length) {
            return false
        }

        for (var i = 0; i < aProps.length; i++) {
            var propName = aProps[i]

            // If values of same property are not equal,
            // objects are not equivalent
            if (a[propName] !== b[propName]) {
                return false
            }
        }

        // If we made it this far, objects
        // are considered equivalent
        return true
    },

    /**
     * Deep Copy an object
     * @param {JSON format data} obj
     */
    deepcopy: function (obj) {
        return JSON.parse(JSON.stringify(obj))
    }
}

export { dom, object }
