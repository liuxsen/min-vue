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
 * 2. 将收集副作用函数，执行副作用函数封装
 *    封装 track trigger两个函数; 仅仅是将set， get的逻辑封装到函数中
 */

const obj = new Proxy(data, {
  get(target, key) {
    track(target, key)
    return target[key]
  },
  set(target, key, value) {
    trigger(target, key, value)
    return true
  },
})

// track函数 收集副作用函数
function track(target, key) {
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
}
// trigger
function trigger(target, key, value) {
  target[key] = value
  const depsMap = bucket.get(target)
  if (!depsMap)
    return
  const effects = depsMap.get(key)
  effects && effects.forEach(fn => fn())
}
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
