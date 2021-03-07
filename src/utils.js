/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-03-07 20:19:00
 * @modify date 2021-03-07 20:19:00
 * @desc [description]
 */
import { BASIC_SVG_ELEMENTS } from './global'
// import { parse as pathParser } from 'd-path-parser'

export const NUMERICAL = 'NUMERICAL'
export const CATEGORICAL = 'CATEGORICAL'

export const dom = {
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
        let style = {}
        const BASIC_STYLES = BASIC_SVG_ELEMENTS.get(element.tagName)
        if (BASIC_STYLES) {
            // step1: for positions
            if (element.tagName == 'circle' || element.tagName == 'ellipse') {
                const [cx, cy] = getComputedPosition(element, [
                    element.cx.baseVal.value,
                    element.cy.baseVal.value
                ])
                style = { ...style, cx, cy }
            } else if (element.tagName == 'line') {
                const [x1, y1] = getComputedPosition(element, [
                    element.x1.baseVal.value,
                    element.y1.baseVal.value
                ])
                const [x2, y2] = getComputedPosition(element, [
                    element.x2.baseVal.value,
                    element.y2.baseVal.value
                ])
                style = { ...style, x1, y1, x2, y2 }
            } else if (element.tagName === 'polygon' || element.tagName === 'polyline') {
                const points = Array.from(element.points).map(({ x, y }) =>
                    getComputedPosition(element, [x, y])
                )
                style = { ...style, points }
            } else if (element.tagName === 'path') {
                // TODO
            }

            // step2: for else (e.g. r, width, fill...)
            BASIC_STYLES.forEach((channel) => {
                style[channel] = computedStyles[channel]
            })

            return style

            /**
             * transform a position with transform matrix (transformation)
             * @param {Object} style: {tagName: 'xxx', style1: 'xx', style2: 'xx', ...}
             * @param {String} transformation:  e.g. "matrix(1, 0, 0, 1, 10, 10)"
             */
            function getComputedPosition(element, position) {
                //! compute position, assume only translate, no rotate, no scale
                let thisNode = element
                let [x, y] = position
                do {
                    const matrixString = window.getComputedStyle(thisNode).transform
                    let matrix = [1, 0, 0, 1, 0, 0]
                    if (matrixString !== 'none') {
                        matrix = matrixString.slice('matrix('.length, -1).split(',').map(parseFloat)
                    }
                    x += matrix[4]
                    y += matrix[5]
                    thisNode = thisNode.parentNode
                } while (thisNode.tagName !== 'svg')
                return [x, y]
            }
        }
    }
}

export const object = {
    isEqual: function (a, b) {
        //! only object, number, array, string are supported
        if (typeof a !== typeof b) {
            return false
        }

        if (typeof a == 'string' || typeof a == 'number') {
            return a == b
        } else if (typeof a == 'object') {
            if (Array.isArray(a) && Array.isArray(b)) {
                return a.length == b.length && a.every((_, i) => a[i] == b[i])
            } else if (!Array.isArray(a) && !Array.isArray(b)) {
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
            } else {
                return false
            }
        } else {
            console.error(`Not supported type: ${typeof a}`)
        }
    },
    /**
     * Deep Copy an object
     * @param {JSON format data} obj
     */
    deepcopy: function (obj) {
        return JSON.parse(JSON.stringify(obj))
    },
    dfs: function (obj, callback) {
        const stack = []
        let index = obj
        while (true) {
            if (index) {
                callback(index)
                if (index.children && index.children.length) {
                    let children = index.children
                    if (!index.children.forEach) {
                        children = Array.from(index.children)
                    }
                    const indexNext = children.pop()
                    children.forEach((child) => stack.push(child))
                    index = indexNext
                } else {
                    index = stack.pop()
                }
            } else {
                break
            }
        }
    }
}

export const NoLinDiagram = {
    /**
     * get attributes of nodes and links
     * @param {standard node-link data format} data
     * @returns {nodes: node attributes array, links: link attributes array}
     */
    getAttributesOf: function (data) {
        const nodeAttrs = new Map()
        const linkAttrs = new Map()
        data.nodes.forEach((node) => {
            for (let attr in node) {
                if (nodeAttrs.has(attr)) {
                    nodeAttrs.get(attr).push(node[attr])
                } else {
                    nodeAttrs.set(attr, [node[attr]])
                }
            }
        })
        data.links.forEach((link) => {
            for (let attr in link) {
                if (linkAttrs.has(attr)) {
                    linkAttrs.get(attr).push(link[attr])
                } else {
                    linkAttrs.set(attr, [link[attr]])
                }
            }
        })

        // delete unique identities
        nodeAttrs.delete('id')
        linkAttrs.delete('source')
        linkAttrs.delete('target')

        nodeAttrs.forEach((value, name) => {
            nodeAttrs.set(name, computeAttributeTypeAndRange(value))
        })
        linkAttrs.forEach((value, name) => {
            linkAttrs.set(name, computeAttributeTypeAndRange(value))
        })

        return {
            nodes: nodeAttrs,
            links: linkAttrs
        }

        /**
         *
         * @param {*} data
         * @param {*} NUMERICAL_LENGTH_THRESHOLD
         */
        function computeAttributeTypeAndRange(data, NUMERICAL_LENGTH_THRESHOLD = 10) {
            let range = []
            let isAllNumerical = true
            let type = NUMERICAL
            data.forEach((value) => {
                range.push(value)
                if (typeof value !== 'number') {
                    isAllNumerical = false
                }
            })
            if (!isAllNumerical || range.length <= NUMERICAL_LENGTH_THRESHOLD) {
                type = CATEGORICAL
            }
            return {
                type,
                range
            }
        }
    }
}
