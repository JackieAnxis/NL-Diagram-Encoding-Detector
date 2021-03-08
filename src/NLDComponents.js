import { BASIC_SVG_ELEMENTS } from './global'
import { dom, object } from './utils'

export class NLDCompDiff {
    constructor() {
        this.array = []
    }
    isItemEmpty(item) {
        if (item?.tagName) {
            // tagName different
            return false
        } else {
            if (item?.style) {
                if (Object.keys(item.style).length > 0) {
                    // and something is in item.style
                    return false
                }
            }
        }
        return true
    }
    isEmpty() {
        return this.array.every(this.isItemEmpty)
    }
    getIndexOfDifferences() {
        const indexes = []
        this.array.forEach((item, i) => {
            if (!this.isItemEmpty(item)) {
                indexes.push(i)
            }
        })
        return indexes
    }
}

export class NLDComponents {
    // node link diagram components
    constructor(svg) {
        if (svg) {
            this.osvg = svg // origin svg

            // compute style
            document.body.appendChild(svg)
            const basicElementArray = []
            object.dfs(svg, function (element) {
                // compute styles (include tagName), only keep basic
                if (BASIC_SVG_ELEMENTS.has(element.tagName)) {
                    const style = dom.getComputedStyle(element)
                    basicElementArray.push({
                        tagName: element.tagName,
                        element,
                        style
                    })
                }
            })
            this.basicElementArray = basicElementArray
            document.body.removeChild(svg)
        }
    }

    /**
     * !Assume two arrays are equilong (equal length) and the sequences are same,
     * compare whether this NLDComponents is diff with anotherNLDComponents.
     * Only compare whether some styles of a basic svg element are different
     * @param {NLDComponents} anotherNLDComponents
     * @return {NLDComponents} diff: a NLDComponents which only stores differences
     */
    diffWith(anotherNLDComponents) {
        const diff = new NLDCompDiff()
        const n = Math.min(
            this.basicElementArray.length,
            anotherNLDComponents.basicElementArray.length
        )
        for (let i = 0; i < n; i++) {
            const ele1 = this.basicElementArray[i]
            const ele2 = anotherNLDComponents.basicElementArray[i]
            const eleDiff = undefined
            if (ele1.tagName == ele2.tagName) {
                const channels = new Set(Object.keys(ele1.style).concat(Object.keys(ele2.style)))
                channels.forEach((channel) => {
                    if (!object.isEqual(ele1.style[channel], ele2.style[channel])) {
                        if (!eleDiff) {
                            eleDiff = { style: {} }
                        }
                        eleDiff.style[channel] = true
                    }
                })
            } else {
                eleDiff = { tagName: true }
                // TODO, if the tagName is changed
            }
            diff.array.push(eleDiff)
        }
        return diff
    }

    /**
     * TODO: modify it from tree to array
     * eliminate unstable channels from this style tree
     * only remain stable channels
     * @param {BasicStyleTree} unstableStyleTree
     */
    eliminate(unstableStyleTree) {
        _eliminate(this.tree, unstableStyleTree.tree)

        function _eliminate(treeNode, diffNode) {
            if (diffNode.style && treeNode.style) {
                for (let styleName in diffNode) {
                    delete treeNode.style[styleName]
                }
            }
            if (diffNode.children?.length === treeNode.children?.length) {
                treeNode.children.forEach((child, i) => {
                    _eliminate(child, diffNode.children[i])
                })
            } else {
                console.error('Some bug occurs!')
            }
        }
    }
}
