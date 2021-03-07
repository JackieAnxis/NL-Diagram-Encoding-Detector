/**
 * @author Jiacheng Pan
 * @email panjiacheng@zju.edu.cn
 * @create date 2021-03-07 20:18:51
 * @modify date 2021-03-07 20:18:51
 * @desc [description]
 */
import { NLDComponents } from './NLDComponents'
/**
 * if structure
 * @param {html dom element} element1
 * @param {html dom element} element2
 * @return {NLDCompDiff} diff: a NLDCompDiff which extends Array: [{tagName: boolean, style:{[visual channel]: boolean}}]
 */
export default function compare(element1, element2) {
    const NLDComponents1 = new NLDComponents(element1)
    const NLDComponents2 = new NLDComponents(element2)
    const diff = NLDComponents1.diffWith(NLDComponents2)
    return diff
}
