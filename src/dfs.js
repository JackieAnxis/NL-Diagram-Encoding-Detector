/**
 *
 */
export default function dfs(obj, callback) {
    const stack = []
    let index = obj
    while (true) {
        if (index) {
            callback(index)
            if (index.children && index.children.length) {
                const indexNext = index.children.pop()
                let children = index.children
                if (!index.children.forEach) {
                    children = Array.from(index.children)
                }
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
