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
