const bucket = new WeakMap()
let activeEffect // 保存被注册的副作用函数

const data = { text: 'hello world' }

/**
 * 解决问题：
 * 1. 建立明确的响应式绑定关系；
 * weakMap
 *    |__target map[target]
 *          |_____text1  set
 *                  |____effectFn
 *                  |____effectFn2
 * 数据结构使用WeakMap
 */

const obj = new Proxy(data, {
  get(target, key) {
    if (!activeEffect)
      return target[key]
    let depsMap = bucket.get(target)
    if (!depsMap) {
      bucket.set(target, (depsMap = new Map()))
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, (deps = new Set()))
    }
    deps.add(activeEffect)
    return target[key]
  },
  set(target, key, value) {
    target[key] = value
    const depsMap = bucket.get(target)
    if (!depsMap)
      return
    const effects = depsMap.get(key)
    effects && effects.forEach(fn => fn())
    return true
  },
})

export function effect(fn) {
  activeEffect = fn
  fn()
}

effect(() => {
  console.log('effect run')
  document.body.innerHTML = obj.text
})

// obj.text = 'vue3 !!!'
obj.name = 'name'
