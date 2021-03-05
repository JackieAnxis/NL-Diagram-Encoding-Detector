/**
 * compress complex json format data with deep structure
 * e.g. {'nodes': [{'info': {'name': 'xxx', 'edge': 35}, 'percents': [10,20,30,40]}, ...], ...}
 *  =>
 * {'nodes': [{'info-name': 'xxx', 'info-edge': 35, 'percents-0': 10, 'percents-1': 20, ...}, ...]}
 * @param {JSON format data} originData
 * @return {JSON format data} encodedData
 */
function dataEncoder(originData) {
    let encodedData = { ...originData }
    const keys = ['nodes', 'links']
    keys.forEach((key) => {
        encodedData[key] = encodedData[key].map((ele) => {
            let newEle = {}
            Object.keys(ele).forEach((attrName) => {
                if (ele[attrName] instanceof Object) {
                    Object.keys(ele[attrName]).forEach((attrSubName) => {
                        newName = attrName + '-' + attrSubName
                        newEle[newName] = ele[attrName][attrSubName]
                    })
                } else {
                    newEle[attrName] = ele[attrName]
                }
            })
            return newEle
        })
    })
    return encodedData
}

/**
 * The opposite of dataEncoder
 * @param {JSON format data} encodedData
 * @return {JSON formated data}
 */
function dataDecoder(encodedData) {
    let originData = { ...encodedData }
    const keys = ['nodes', 'links']
    keys.forEach((key) => {
        originData[key] = originData[key].map((ele) => {
            let newEle = {}
            Object.keys(ele).forEach((attrName) => {
                if (attrName.indexOf('-') != -1) {
                    let [supName, subName] = attrName.split('-')
                    subName = isNaN(Number(subName)) ? subName : Number(subName)
                    if (Object.keys(newEle).indexOf(supName) == -1) {
                        newEle[supName] = isNaN(Number(subName)) ? {} : []
                    }
                    newEle[supName][subName] = ele[attrName]
                } else {
                    newEle[attrName] = ele[attrName]
                }
            })
            return newEle
        })
    })
    return originData
}
