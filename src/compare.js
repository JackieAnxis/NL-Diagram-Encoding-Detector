import { StyleTree } from './StyleTree'
/**
 * if structure
 * @param {html dom element} element1
 * @param {html dom element} element2
 * @return {false | BasicStyleTree}
 * if structures are not same: return false;
 * else: return a BasicStyleTree which contains a property[tree]: {name, style: {String => Boolean}, children: [{...}, ...]}
 */
export default function compare(element1, element2) {
    const styleTree1 = new StyleTree(element1)
    const styleTree2 = new StyleTree(element2)
    return styleTree1.diffWith(styleTree2)
}
