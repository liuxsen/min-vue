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
 * 3. 问题：在三元表达式中，会产生遗留的副作用函数
 * 解决方案：
 *  再trigger之前先将key对应的依赖副作用函数清空，然后重新执行
 * activeEffect.deps = [set[activeEffect]]
 * key1 set[effect1, effect2]
 * key2 set[effect1, effect2]
 * effect1.deps = [set[effect1, effect2], set[effect1, effect2]]
 * 第一步收集依赖到set中
 * 第二步收集完成的set集合 push到 activeEffect.deps 中
 * 第三步 触发proxy的set动作，触发trigger函数；再次执行effectFn；清除在deps中的effectFn；达到副作用函数清除任务
 * 4. 问题： effect函数嵌套问题
 *  解决方案： 使用effectStack
 * 5. 自增操作 obj.foo++ 导致无限递归循环
 *  在trigger函数中增加守卫，如果activeEffect === 副作用函数，则不执行
 * 6. 调度执行
 * 6.1 屏蔽过渡状态，减少副作用函数的执行次数
 *  利用set保存effectFn；使用flushjob函数执行set中的effectfn；
 * 7. computed + lazy
 */

const bucket = new WeakMap()
const effectStack = [] // 副作用函数栈
let activeEffect // 保存被注册的副作用函数

const data = { text: 'hello world', ok: true, count: 0 }

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
  activeEffect.deps.push(deps)
}
// trigger
function trigger(target, key, value) {
  target[key] = value
  const depsMap = bucket.get(target)
  if (!depsMap)
    return
  const effects = depsMap.get(key)
  const effectsToRun = new Set()
  effects && effects.forEach((fn) => {
    if (fn !== activeEffect) {
      effectsToRun.add(fn)
    }
  })
  effectsToRun.forEach((fn) => {
    if (fn.options.scheduler) {
      fn.options.scheduler(fn)
    }
    else {
      fn()
    }
  })
}

const jobQueue = new Set()
const p = Promise.resolve()
let isFlushIng = false
function flushJob() {
  if (isFlushIng)
    return
  isFlushIng = true
  p.then(() => {
    jobQueue.forEach((job) => {
      job()
    })
  }).finally(() => {
    isFlushIng = false
  })
}

export function effect(fn, options = {
  scheduler: (effectFn) => {
    jobQueue.add(effectFn)
    flushJob()
  },
  lazy: true,
}) {
  const effectFn = () => {
    // 调用cleanup完成清除工作
    cleanup(effectFn)
    activeEffect = effectFn
    effectStack.push(effectFn)
    const res = fn()
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    return res
  }
  effectFn.options = options
  effectFn.deps = []
  if (!effectFn.options.lazy) {
    // 用来存储所有与该副作用函数相关联的的依赖集合
    effectFn()
  }
  else {
    return effectFn
  }
}

function cleanup(effectFn) {
  for (let i = 0; i < effectFn.deps.length; i++) {
    const deps = effectFn.deps[i]
    deps.delete(effectFn)
  }
  effectFn.deps.length = 0
}

function computed(getter) {
  const effectFn = effect(getter, {
    lazy: true,
  })
  const obj = {
    get value() {
      return effectFn()
    },
  }
  return obj
}

const computedValue = computed(() => {
  console.log('log')
  return obj.count + 1
})
obj.count++
obj.count++
obj.count++
obj.count++
obj.count++
obj.count++
obj.count++
console.log(computedValue.value)
