let currentInstance = null
export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function onMounted(fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}

export function onCreated(fn) {
  if (currentInstance) {
    currentInstance.created.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}

export function onUnMounted(fn) {
  if (currentInstance) {
    currentInstance.unMounted.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}

// TODO: 缓存管理

export const KeepAlive = {
  // 用作标识
  __isKeepAlive: true,
  props: {
    include: RegExp,
    exclude: RegExp,
  },
  data() {
    return {}
  },
  setup(props, { slots }) {
    // 创建一个缓存对象 key: vnode.type value: vnode
    const cache = new Map()
    const instance = currentInstance
    const { move, createElement } = instance.keepAliveCtx
    const storageContainer = createElement('div')
    instance._activate = (vnode, container, anchor) => {
      move(vnode, container, anchor)
    }
    instance._deActivate = (vnode) => {
      move(vnode, storageContainer)
    }
    return () => {
      const rawVNode = slots.default()
      // 如果不是组件，直接渲染，非组件的虚拟节点无法被keepAlive
      if (typeof rawVNode.type !== 'object') {
        return rawVNode
      }
      const name = rawVNode.type.name
      // 如果name无法被include匹配;或者被exclude匹配，那么就直接返回vnode，不缓存
      if (name
        && (
          (props.include && !props.include.test(name))
          || (props.exclude && props.exclude.test(name))
        )
      ) {
        return rawVNode
      }
      const cachedVNode = cache.get(rawVNode.type)
      if (cachedVNode) {
        rawVNode.component = cachedVNode.component
        rawVNode.keptAlive = true
      }
      else {
        cache.set(rawVNode.type, rawVNode)
      }
      rawVNode.shouldKeepAlive = true
      rawVNode.keepAliveInstance = instance
      return rawVNode
    }
  },
}
