const bucket = new Set()
let activeEffect // 保存被注册的副作用函数

const data = { text: 'hello world' }

const obj = new Proxy(data, {
  get(target, k) {
    bucket.add(activeEffect)
    return target[k]
  },
  set(target, k, value) {
    target[k] = value
    bucket.forEach(fn => fn())
    return true
  },
})

export function effect(fn) {
  activeEffect = fn
  fn()
}

effect(() => {
  document.body.innerHTML = obj.text
})

obj.text = 'vue3 !!!'
