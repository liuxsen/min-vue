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

export const Teleport = {
  name: 'Teleport',
  __isTeleport: true,
  props: {
    to: String,
  },
  process(n1, n2, container, anchor, internals) {
    const { patch, patchChildren, move } = internals
    if (!n1) {
      // 全新挂载
      const target = typeof n2.props.to === 'string'
        ? document.querySelector(n2.props.to)
        : n2.props.to
      n2.children.forEach(c => patch(null, c, target, anchor))
    }
    else {
      // 更新
      patchChildren(n1, n2, container)
      if (n2.props.to !== n1.props.to) {
        const newTarget = typeof n2.props.to === 'string'
          ? document.querySelector(n2.props.to)
          : n2.props.to
        n2.children.forEach(c => move(c, newTarget))
      }
    }
  },
}

function nextFrame(fn) {
  requestAnimationFrame(() => {
    requestAnimationFrame(fn)
  })
}

export const Transition = {
  name: 'Transition',
  setup(props, { slots }) {
    return () => {
      const innerVNode = slots.default()
      innerVNode.transition = {
        beforeEnter(el) {
          el.classList.add('enter-from')
          el.classList.add('enter-active')
        },
        enter(el) {
          nextFrame(() => {
            el.classList.remove('enter-from')
            el.classList.add('enter-to')
            el.addEventListener('transitionend', () => {
              el.classList.remove('enter-to')
              el.classList.remove('enter-active')
            })
          })
        },
        // 设置离场
        leave(el, performRemove) {
          el.classList.add('leave-from')
          el.classList.add('leave-active')
          // 强制reflow； 使初始状态生效
          document.body.offsetHeight
          nextFrame(() => {
            el.classList.remove('leave-from')
            el.classList.add('leave-to')
            el.addEventListener('transitionend', () => {
              el.classList.remove('leave-to')
              el.classList.remove('leave-active')
              performRemove && performRemove()
            })
          })
        },
      }
      return innerVNode
    }
  },
}
