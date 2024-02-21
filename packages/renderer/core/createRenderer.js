import { effect, reactive, shallowReactive, shallowReadonly } from '@vue/reactivity'
import { normalizeClass } from '../utils/normalizeClass'
import { Comment, Fragment, Text } from './constant'
import { setCurrentInstance } from './hook'

// 新建渲染器
export function createRenderer({
  createElement,
  setElementText,
  insert,
  createText,
  setText,
  createComment,
  patchProps,
}) {
  // 渲染实现
  function render(vnode, container) {
    if (vnode) {
      patch(container._vnode, vnode, container)
    }
    else {
      if (container._vnode) {
        // 新node不存在；旧node存在；卸载dom
        // container.innerHTML = ''
        unmount(container._vnode)
      }
    }
    // 保存vnode为旧node
    container._vnode = vnode
  }

  /* 卸载操作 */
  function unmount(vnode) {
    if (vnode.type === Fragment) {
      vnode.children.forEach(c => unmount(c))
      return
    }
    let el = vnode.el
    // 如果是组件
    if (vnode.component) {
      const instance = vnode.component
      el = instance.subTree.el
      instance.unMounted && instance.unMounted.forEach(hook => hook.call(instance))
    }

    const parent = el.parentNode
    if (parent) {
      parent.removeChild(el)
    }
  }

  /**
   * 挂载dom
   * @param {vnode} n1 旧node
   * @param {vnode} n2 新node
   * @param {dom} container dom
   */
  function patch(n1, n2, container, anchor) {
    // 如果n1存在，对比n1 n2 类型；如果不一致，卸载n1
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    // 普通标签
    if (typeof n2.type === 'string') {
      if (!n1) {
        // 没有旧node，第一次渲染，需要挂载n2
        mountElement(n2, container, anchor)
      }
      else {
        patchElement(n1, n2)
      }
    }
    else if (n2.type === Text) {
      // 文本节点
      if (!n1) {
        const el = n2.el = createText(n2.children)
        insert(el, container, anchor)
      }
      else {
        // 如果已经存在旧node，使用新文本节点的内容更新旧文本节点
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    }
    else if (n2.type === Comment) {
      if (!n1) {
        const el = n2.el = createComment(n2.children)
        insert(el, container, anchor)
      }
      else {
        // 如果已经存在旧node，使用新文本节点的内容更新旧文本节点
        const el = n2.el = n1.el
        if (n2.children !== n1.children) {
          setText(el, n2.children)
        }
      }
    }
    else if (n2.type === Fragment) {
      if (!n1) {
        n2.children.forEach(c => patch(null, c, container))
      }
      else {
        patchChildren(n1, n2, container)
      }
    }
    else if (typeof n2.type === 'object' || typeof n2.type === 'function') {
      // 组件
      console.log('组件')
      if (!n1) {
        mountComponent(n2, container, anchor)
      }
      else {
        patchComponent(n1, n2, anchor)
      }
    }
    else {
      // 其他类型
      console.log('更新')
      console.log(n1, n2)
    }
  }

  function patchElement(n1, n2, anchor) {
    const el = n2.el = n1.el
    const oldProps = n1.props
    const newProps = n2.props
    for (const key in newProps) {
      if (newProps[key] !== oldProps[key]) {
        patchProps(el, key, oldProps[key], newProps[key])
      }
    }
    for (const key in oldProps) {
      if (!(key in newProps)) {
        patchProps(el, key, oldProps[key], null)
      }
    }
    patchChildren(n1, n2, el)
  }

  function patchChildren(n1, n2, container) {
    if (typeof n2.children === 'string') {
      // 如果新子节点是string类型
      // 旧节点的类型： 没有子节点 文本子节点 一组子节点
      // 如果旧子节点是一组子节点，需要逐个卸载
      if (Array.isArray(n1.children)) {
        n1.children.forEach(c => unmount(c))
      }
      setElementText(container, n2.children)
    }
    else if (Array.isArray(n2.children)) {
      // diff 核心
      if (Array.isArray(n1.children)) {
        const oldChildren = n1.children
        const newChildren = n2.children
        let lastIndex = 0
        for (let i = 0; i < newChildren.length; i++) {
          let find = false // 查找是否有可以用的节点
          const newVNode = newChildren[i]
          for (let j = 0; j < oldChildren.length; j++) {
            const oldVNode = oldChildren[j]
            // 复用key标注的元素
            if (newVNode.key === oldVNode.key) {
              find = true
              // 1. 更新复用的元素
              patch(oldVNode, newVNode, container)
              if (j < lastIndex) {
                // 2. 移动元素
                const prevVNode = newChildren[i - 1]
                if (prevVNode) {
                  const anchor = prevVNode.el.nextSibling
                  insert(newVNode.el, container, anchor)
                }
              }
              else {
                lastIndex = j
              }
              break
            }
          }
          if (!find) {
            // 3. 新增节点
            const preVNode = newChildren[i - 1]
            let anchor = null
            if (preVNode) {
              // 如果有前一个vnode节点，使用他的下一个兄弟节点作为锚点元素
              anchor = preVNode.el.nextSibling
            }
            else {
              anchor = container.firstChild
            }
            patch(null, newVNode, container, anchor)
          }
        }
        // 4. 删除旧节点操作
        for (let i = 0; i < oldChildren.length; i++) {
          const oldVNode = oldChildren[i]
          const has = newChildren.find(vnode => vnode.key === oldVNode.key)
          if (!has) {
            unmount(oldVNode)
          }
        }
      }
      else {
        setElementText(container, '')
        n2.children.forEach(c => patch(null, c, container))
      }
    }
  }

  /**
   * 挂载vnode到container
   * @param {vnode} vnode vnode
   * @param {dom} container dom
   */
  function mountElement(vnode, container, anchor) {
    const el = createElement(vnode.type)
    // 建立vnode和dom的联系
    vnode.el = el
    // 同步props
    if (vnode.props) {
      for (const key in vnode.props) {
        patchProps(el, key, null, vnode.props[key])
      }
    }
    if (typeof vnode.children === 'string') {
      setElementText(el, vnode.children)
    }
    else if (Array.isArray(vnode.children)) {
      vnode.children.forEach((child) => {
        patch(null, child, el)
      })
    }
    // container.appendChild(el)
    insert(el, container, anchor)
  }

  // 挂载组件
  function mountComponent(vnode, container, anchor) {
    const isFunctional = typeof vnode.type === 'function'
    let componentOptions = vnode.type
    if (isFunctional) {
      componentOptions = {
        render: vnode.type,
        props: vnode.type.props,
      }
    }
    let {
      render,
      data,
      props: propsOption,
      beforeCreated, created,
      beforeMount, mounted,
      beforeUpdate, updated,
      setup,
    } = componentOptions
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    beforeCreated && beforeCreated()
    const state = reactive(data ? data() : {})
    const instance = {
      state,
      props: shallowReactive(props), // props是浅响应的，只要更新了props，就会触发重新渲染
      isMounted: false,
      subTree: null,
      mounted: [],
      created: [],
      unMounted: [],
    }

    function emit(event, ...payload) {
      const eventName = `on${event[0].toUpperCase() + event.slice(1)}`
      const handler = instance.props[eventName]
      if (handler) {
        handler(...payload)
      }
      else {
        console.error('事件不存在')
      }
    }

    const setupContext = { attrs, emit }
    setCurrentInstance(instance)
    const setupResult = setup ? setup(shallowReadonly(instance.props), setupContext) : null
    setCurrentInstance(null)

    // 保存setup返回的数据
    let setupState = null
    if (typeof setupResult === 'function') {
      if (render) {
        console.error('setup函数返回渲染函数，render函数被忽略')
      }
      render = setupResult
    }
    else {
      setupState = setupResult
    }
    vnode.component = instance

    // 创建渲染上下文对象
    const renderContext = new Proxy(instance, {
      get(t, k, r) {
        const { state, props } = t
        if (state && k in state) {
          return state[k]
        }
        else if (k in props) {
          return props[k]
        }
        else if (setupState && k in setupState) {
          // 渲染上下文增加setupState的支持
          return setupState[k]
        }
        else {
          console.error('不存在')
        }
      },
      set(t, k, v, r) {
        const { state, props } = t
        if (state && k in state) {
          state[k] = v
        }
        else if (setupState && k in setupState) {
          setupState[k] = v
        }
        else if (k in props) {
          console.warn('props is readonly')
        }
        else {
          console.error('不存在')
        }
      },
    })
    instance.created && instance.created.forEach(hook => hook.call(renderContext))
    created && created.call(renderContext)

    effect(() => {
      const subTree = render.call(renderContext, renderContext)
      if (!instance.isMounted) {
        beforeMount && beforeMount.call(renderContext)
        patch(null, subTree, container, anchor)
        instance.isMounted = true
        instance.mounted && instance.mounted.forEach(hook => hook.call(renderContext))
        mounted && mounted.call(renderContext)
      }
      else {
        beforeUpdate && beforeUpdate.call(renderContext)
        patch(instance.subTree, subTree, container, anchor)
        updated && updated.call(renderContext)
      }
      instance.subTree = subTree
    })
  }
  // 更新组件
  function patchComponent(n1, n2, anchor) {
    console.log('更新组件')
    console.log(n1, n2)
    // 保存组件实例到新vnode上
    const instance = (n2.component = n1.component)
    const { props } = instance
    if (hasPropsChanged(n1.props, n2.props)) {
      const [nextProps] = resolveProps(n2.type.props, n2.props)
      // 更新props
      for (const key in nextProps) {
        props[key] = nextProps[key]
      }
      // 删除不存在的props
      for (const k in props) {
        if (!(k in nextProps)) {
          delete props[k]
        }
      }
    }
  }

  function hasPropsChanged(prevProps, nextProps) {
    const nextKeys = Object.keys(nextProps)
    const preKeys = Object.keys(prevProps)
    if (nextKeys.length !== preKeys.length) {
      return true
    }
    //
    for (let i = 0; i < nextKeys.length; i++) {
      const key = nextKeys[i]
      if (nextProps[key] !== prevProps[key])
        return true
    }
    return false
  }

  // 解析组件props和attrs数据
  function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
      // props如果是以on开头；表示是事件函数；作为props
      if (key in options || key.startsWith('on')) {
        // 如果为组件传递的props数据在options选项中有定义，是合法的props
        props[key] = propsData[key]
      }
      else {
        attrs[key] = propsData[key]
      }
    }
    return [props, attrs]
  }

  return {
    render,
  }
}
