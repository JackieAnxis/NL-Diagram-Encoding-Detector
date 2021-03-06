import { BASIC_SVG_ELEMENTS } from './global'
import dfs from './dfs'

export class NLDComponents {
    // node link diagram components
    constructor(svg) {
        if (svg) {
            this.osvg = svg // origin svg
            document.body.appendChild(svg)
            // styleTree (visual channel tree):
            // { name: String, style: {String => Any}, children: [{...}, ...]}
            const basicElementArray = []
            dfs(svg, function (element) {
                // only keep basic
                if (BASIC_SVG_ELEMENTS.has(element.tagName)) {
                    const item = {}
                    // it is a basic visual element
                    item.tagName = element.tagName
                    const style = window.getComputedStyle(element)
                    // TODO for position attribute, plese compute bounding box
                    const BASIC_STYLES = BASIC_SVG_ELEMENTS.get(element.tagName)
                    BASIC_STYLES.forEach((channel) => {
                        item[channels] = style[channel]
                    })
                    basicElementArray.push(item)
                }
            })
            this.basicElementArray = basicElementArray
            document.body.removeChild(svg)
        }
    }

    isEmpty() {
        let isEmpty = true
        this.basicElementArray.forEach((element) => {
            if (element && Object.keys(element).length) {
                isEmpty = false
            }
        })
        return isEmpty
    }

    /**
     * Assume two arrays are equilong (equal length),
     * compare whether this NLDComponents is diff with anotherNLDComponents.
     * Only compare whether some styles of a basic svg element are different
     * @param {NLDComponents} anotherNLDComponents
     * @return {NLDComponents} diff: a NLDComponents which only stores differences
     */
    diffWith(anotherNLDComponents) {
        const diff = new NLDComponents()
        diff.basicElementArray = []
        const n = Math.min(
            this.basicElementArray.length,
            anotherNLDComponents.basicElementArray.length
        )
        for (let i = 0; i < n; i++) {
            const ele1 = this.basicElementArray[i]
            const ele2 = anotherNLDComponents.basicElementArray[i]
            const eleDiff = {}
            Object.keys(ele1).forEach((channel) => {
                if (ele1.tagName == ele2.tagName) {
                    if (ele1[channel] !== ele2[channel]) {
                        eleDiff[channel] = true
                    }
                } else {
                    // TODO
                }
            })
        }
        return diff
    }

    /**
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
