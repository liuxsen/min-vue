import { effect, reactive, shallowReactive } from '@vue/reactivity'
import { shouldSetAsProps } from '../utils/shouldSetAsProps'
import { normalizeClass } from '../utils/normalizeClass'
import { Comment, Fragment, Text } from './constant'

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
    const el = vnode.el
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
        mountElement(n2, container)
      }
      else {
        patchElement(n1, n2)
      }
    }
    else if (n2.type === Text) {
      // 文本节点
      if (!n1) {
        const el = n2.el = createText(n2.children)
        insert(el, container)
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
        insert(el, container)
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
    else if (typeof n2.type === 'object') {
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

  function patchElement(n1, n2) {
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
      if (Array.isArray(n1.children)) {
        // 新旧节点都是array
        // diff 核心算法
        // 暂时处理
        n1.children.forEach(c => unmount(c))
        n2.children.forEach(c => patch(null, c, container))
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
  function mountElement(vnode, container) {
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
    insert(el, container)
  }

  // 挂载组件
  function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const {
      render,
      data,
      props: propsOption,
      beforeCreated, created,
      beforeMount, mounted,
      beforeUpdate, updated,
    } = componentOptions
    const [props, attrs] = resolveProps(propsOption, vnode.props)

    beforeCreated && beforeCreated()
    const state = reactive(data())
    const instance = {
      state,
      props: shallowReactive(props),
      isMounted: false,
      subTree: null,
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
        else {
          console.error('不存在')
        }
      },
      set(t, k, v, r) {
        const { state, props } = t
        if (state && k in state) {
          state[k] = v
        }
        else if (k in props) {
          console.warn('props is readonly')
        }
        else {
          console.error('不存在')
        }
      },
    })

    created && created.call(renderContext)

    effect(() => {
      debugger
      const subTree = render.call(renderContext, renderContext)
      if (!instance.isMounted) {
        beforeMount && beforeMount.call(renderContext)
        patch(null, subTree, container, anchor)
        instance.isMounted = true
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
  }

  // 解析组件props和attrs数据
  function resolveProps(options, propsData) {
    const props = {}
    const attrs = {}
    for (const key in propsData) {
      if (key in options) {
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
