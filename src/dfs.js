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
                index.children.forEach((child) => stack.push(child))
                index = indexNext
            } else {
                index = stack.pop()
            }
        } else {
            break
        }
    }
}
