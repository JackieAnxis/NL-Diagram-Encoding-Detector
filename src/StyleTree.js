import { BASIC_SVG_ELEMENTS } from './global'
import dfs from './dfs'

export class BasicStyleTree {
    constructor() {
        this.tree = undefined
    }
    isEmpty() {
        let isEmpty = true
        dfs(this.tree, function (treeNode) {
            if (treeNode.style && Object.keys(treeNode.style).length) {
                isEmpty = false
            }
        })
        return isEmpty
    }
}

export class StyleTree extends BasicStyleTree {
    constructor(svg) {
        super()
        if (svg) {
            this.osvg = svg // origin svg
            document.body.appendChild(svg)
            // styleTree (visual channel tree):
            // { name: String, style: {String => Any}, children: [{...}, ...]}
            this.tree = this._computeStyleTreeFor(svg)
            document.body.removeChild(svg)
        }
    }

    _computeStyleTreeFor(element) {
        // each node in tree contains: name, style, children
        const treeNode = {}
        if (BASIC_SVG_ELEMENTS.has(element.tagName)) {
            // it is a basic visual element
            treeNode.name = element.tagName
            treeNode.style = {}
            const style = window.getComputedStyle(element)
            BASIC_SVG_ELEMENTS.get(element.tagName).forEach((attr) => {
                treeNode.style[attr] = style[attr]
            })
        } else if (['g', 'svg'].indexOf(element.tagName) >= 0) {
            // ! WARNING: transform is not considered yet
            treeNode.name = element.tagName
            treeNode.children = []
            Array.from(element.children).forEach((child) => {
                const childTreeNode = this._computeStyleTreeFor(child)
                treeNode.children.push(childTreeNode)
            })
            if (Object.keys(treeNode).length === 0) {
                treeNode = {}
            }
        } else {
            // something we don't care
        }
        return treeNode
    }

    /**
     * compare whether the structures of two style trees are same
     * @param {StyleTree} anotherStyleTree
     */
    isSameStructuredWith(anotherStyleTree) {
        return areSame(this.tree, anotherStyleTree.tree)
        function areSame(treeNode1, treeNode2) {
            if (treeNode1.name == treeNode2.name) {
                if (treeNode1.children && treeNode1.children.length) {
                    return treeNode1.children.every((child, i) => {
                        if (treeNode2?.children?.length > i) {
                            return areSame(child, treeNode2?.children[i])
                        } else {
                            return false
                        }
                    })
                } else {
                    return !(treeNode2.children && treeNode2.children.length)
                }
            } else {
                return false
            }
        }
    }

    /**
     * compare whether this StyleTree is diff with anotherStyleTree
     * @param {StyleTree} anotherStyleTree
     * @return {*} if structures are not same, return false; else return a BasicStyleTree which is a diffTree
     */
    diffWith(anotherStyleTree) {
        const isSame = this.isSameStructuredWith(anotherStyleTree)
        if (isSame) {
            const diffTree = new BasicStyleTree()
            diffTree.tree = _diff(this.tree, anotherStyleTree.tree)
            return diffTree

            /**
             * Assume anotherStyleTree is same structured (which means tagNames are all the same) with this styleTree,
             * Only compare whether some styles of a basic svg element are different
             * @param {StyleTree.tree} treeNode1
             * @param {StyleTree.tree} treeNode2
             * @return {StyleTree.tree} treeNodeDiff
             */
            function _diff(treeNode1, treeNode2) {
                if (treeNode1.name !== treeNode1.name) {
                    console.error('Something wrong...')
                }
                const diff = { name: treeNode1.name }
                if (BASIC_SVG_ELEMENTS.has(treeNode1.name)) {
                    diff.style = {}
                    Object.keys(treeNode1.style).forEach((name) => {
                        if (treeNode1.style[name] !== treeNode2.style[name]) {
                            diff.style[name] = true
                        }
                    })
                } else if (['g', 'svg'].indexOf(treeNode1.name) >= 0) {
                    diff.children = []
                    if (treeNode1.children.length !== treeNode2.children.length) {
                        console.error('Something wrong with style tree children length')
                    }
                    for (let i = 0; i < treeNode1.children.length; i++) {
                        const childDiff = _diff(treeNode1.children[i], treeNode2.children[i])
                        if (Object.keys(childDiff).length) {
                            diff.children.push(childDiff)
                        }
                    }
                } else {
                    console.error('Something wrong...')
                }
                return diff
            }
        } else {
            return false
        }
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
