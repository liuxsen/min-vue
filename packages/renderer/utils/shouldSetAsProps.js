/**
 * 判断是否应该使用dom Property
 * @param {*} key 属性key
 * @param {dom} el
 * @returns boolean
 */
export function shouldSetAsProps(key, el) {
  if (key in el) {
    return true
  }
  return false
}
