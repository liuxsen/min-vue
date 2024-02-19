export const objectToString = Object.prototype.toString
export function toTypeString(value) {
  return objectToString.call(value)
}
export const isArray = Array.isArray
export function isMap(val) {
  return toTypeString(val) === '[object Map]'
}
export function isSet(val) {
  return toTypeString(val) === '[object Set]'
}

export function isDate(val) {
  return toTypeString(val) === '[object Date]'
}
export function isRegExp(val) {
  return toTypeString(val) === '[object RegExp]'
}
export function isFunction(val) {
  return typeof val === 'function'
}
export const isString = val => typeof val === 'string'
export const isSymbol = val => typeof val === 'symbol'
export function isObject(val) {
  return val !== null && typeof val === 'object'
}

export function isPromise(val) {
  return (
    (isObject(val) || isFunction(val))
    && isFunction.then
    && isFunction.catch
  )
}
