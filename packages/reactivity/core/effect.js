const bucket = new Set()
const data = { text: 'hello world' }

const obj = new Proxy(data, {
  get(target, k) {
    bucket.add(effect)
    return target[k]
  },
  set(target, k, value) {
    target[k] = value
    bucket.forEach(fn => fn())
    return true
  },
})

export function effect() {
  document.body.innerHTML = obj.text
}

effect()

setTimeout(() => {
  obj.text = 'hello vue3'
}, 2000)
