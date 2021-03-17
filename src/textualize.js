import { CONNECTOR_CHAR } from './global'

function encodeDiff(diff) {
    let str = `tagName:${diff.tagName ? true : false}${CONNECTOR_CHAR}style:{`
    if (diff.style) {
        str += Object.entries(diff.style)
            .filter(([name, bool]) => bool)
            .sort(([name1], [name2]) => name1 > name2)
            .map(([name, bool]) => `${name}:${bool}`)
            .join(CONNECTOR_CHAR)
    }
    str += `}`
    return str
}

function encodeAtt2Diff(att2diff) {
    // return `${attrName}${CONNECTOR_CHAR}${encodeDiff(diff)}`
    const att2diffencoding = {}
    for (let attrName in att2diff) {
        const diff = att2diff[attrName]
        att2diffencoding[attrName] = encodeDiff(diff)
    }
    return JSON.stringify(att2diffencoding)
}

export function verticalClusterElement(ent2att2ele2diff) {
    // vertical clustering of elements
    // merge diff of each element, change ent2att2ele2diff to ent2ele2att2diff
    const ent2ele2att2diff = {}
    for (let entIndex in ent2att2ele2diff) {
        const att2ele2diff = ent2att2ele2diff[entIndex]
        ent2ele2att2diff[entIndex] = ent2ele2att2diff[entIndex] ?? {}
        for (let attrName in att2ele2diff) {
            const ele2diff = att2ele2diff[attrName]
            for (let eleIndex in ele2diff) {
                const diff = ele2diff[eleIndex]
                ent2ele2att2diff[entIndex][eleIndex] = ent2ele2att2diff[entIndex][eleIndex] ?? {}
                ent2ele2att2diff[entIndex][eleIndex][attrName] = diff
            }
        }
    }

    for (let entIndex in ent2ele2att2diff) {
        const ele2att2diff = ent2ele2att2diff[entIndex]
        const classes = {}
        for (let eleIndex in ele2att2diff) {
            const att2diff = ele2att2diff[eleIndex]
            let doesTagNameEncode = false
            for (let attrName in att2diff) {
                const diff = att2diff[attrName]
                doesTagNameEncode = diff.tagName
                if (doesTagNameEncode) break
            }
            if (!doesTagNameEncode) {
                // for elements whose tagNames do not encode any info,
                // only attrName => diff is required to identify them
                const className = encodeAtt2Diff(att2diff)
                classes[className] = classes[className] ?? new Set()
                classes[className].add(eleIndex)
            } else {
                // for elements whose tagNames do encode some info,
                // 1. their tagName ranges are same;
                // 2. their general encoding are same (identified by attrName => diff)
                // 3. when with a same tagName, their encoding should be same
                console.log(att2diff)
                debugger
            }
        }
        console.log(classes)
    }
}

/**
 *
 * @param {NLDComponents} nldComponents:
 * @param {Array} entity2attr2channel:
 * [[entityIndex]: {
 *   [entityAttributeName]: {
 *      [elementIndex]: {tagName, style, ...}
 *   }
 * }]
 */
export function textualize(
    nldComponents,
    entities,
    entity2element,
    ent2att2val2ele2stl,
    ent2att2ele2diff
) {
    // step1 对于每个节点，对不同的元素通过视觉编码进行分组；
    // 怎么标记一个element的编码；就看什么属性能改变它的什么通道；
    // 对于两个element，输入一样时，输出也一样，就被认为是同编码的；
    //// 对于两个属于同个entity的element，如果在相同的tagName的情况下，所有的属性编码的视觉通道都一样，就认为编码一样；
    const encoding2element = {}
    // encoding:
    function encode(att, val, stl) {
        return `{${att}}${CONNECTOR_CHAR}{${val}}${CONNECTOR_CHAR}{${JSON.stringify({
            tagName: stl.tagName,
            style: stl.style
        })}}`
    }

    ent2att2val2ele2stl.forEach((att2val2ele2stl, entityIndex) => {
        // ele2att2val2diff
        const entity = entities[entityIndex]
        for (let attrName in att2val2ele2stl) {
            const val2ele2stl = att2val2ele2stl[attrName]
            for (let value in val2ele2stl) {
                const ele2stl = val2ele2stl[value]
                // merge ent2att2ele2diff[entityIndex][attrName]

                for (let elementIndex in ele2stl) {
                    let diff = undefined
                    if (
                        ent2att2ele2diff &&
                        ent2att2ele2diff[entityIndex] &&
                        ent2att2ele2diff[entityIndex][attrName] &&
                        ent2att2ele2diff[entityIndex][attrName][elementIndex]
                    ) {
                        diff = ent2att2ele2diff[entityIndex][attrName][elementIndex]
                    } else {
                        debugger
                    }
                    const style = {}
                    if (diff.tagName) {
                        style.tagName = ele2stl[elementIndex].tagName
                    }
                    if (diff?.style) {
                        style.style = {}
                        for (let channel in diff.style) {
                            style.style[channel] = ele2stl[elementIndex].style[channel]
                        }
                    }

                    const encoding = encode(attrName, value, style)
                    if (!encoding2element[encoding]) {
                        encoding2element[encoding] = []
                    }
                    encoding2element[encoding].push(elementIndex)
                }

                // if (!identifications[elementIndex]) {
                //     identifications[elementIndex] = {} // attribute => channels[]
                // }

                // const element = nldComponents.basicElementArray[elementIndex]
                // const value2diff = element2diff[elementIndex]

                // for (let value in value2diff) {
                //     const diff = value2diff[value]
                //     if (diff.style) {
                //         identifications[elementIndex][attribute] = Object.keys(diff.style)
                //             .filter((channel) => channel)
                //             .sort()
                //     } else {
                //         identifications[elementIndex][attribute] = []
                //     }

                //     if (diff.tagName) identifications[elementIndex].tagName = attribute
                // }
            }
        }
    })

    console.log(encoding2element)

    // // group identifications by attribute and channels
    // const groups = {}
    // Object.entries(identifications).forEach(([elementIndex, identification]) => {
    //     // identification: attribute => channels[]; identification?.tagName
    //     if (!identification.tagName) {
    //         // normal nodes (without tagName encoding)
    //         // identified by attribute-[channels]-attribute-[channels]...
    //         const key = Object.entries(identification)
    //             .map(
    //                 ([attribute, channels]) => attribute + CONNECTOR_CHAR + JSON.stringify(channels)
    //             )
    //             .sort()
    //             .join(CONNECTOR_CHAR)

    //         if (!groups[key]) {
    //             groups[key] = []
    //         }
    //         groups[key].push(elementIndex)
    //     } else {
    //         // abnormal nodes (with tagName encoding)
    //         // identified by attribute-tagName-[channels]-tagName-[channels]-...-attribute-[channels]-...
    //         // 怎么标记一个element的编码；就看什么属性能改变它的什么通道；
    //         // 两个相同的element，如果它们所有的编码方案都一样，就认为编码一样；
    //         // 对于两个分别属于两个entity的element，输入一样时，输出也一样，就被认为是同编码的；
    //         // 对于两个属于同个entity的element，如果在相同的tagName的情况下，所有的属性编码的视觉通道都一样，就认为编码一样；
    //     }
    // })
}
