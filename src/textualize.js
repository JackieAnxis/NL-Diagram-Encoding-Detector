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
export function textualize(nldComponents, entity2element, entity2attr2channel, entities) {
    entity2attr2channel.forEach((attr2channel, entityIndex) => {
        for (let attribute in attr2channel) {
            const elements = attr2channel[attribute]
            // 'NULL→["rect"]'
            // 'group→["rect","ellipse"]'
        }
    })
}
