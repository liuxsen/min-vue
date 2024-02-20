import { effect, ref } from '@vue/reactivity'
import { shouldSetAsProps } from './utils/shouldSetAsProps'
import { normalizeClass } from './utils/normalizeClass'

// 新建渲染器
function createRenderer({
  createElement,
  setElementText,
  insert,
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
  function patch(n1, n2, container) {
    // 如果n1存在，对比n1 n2 类型；如果不一致，卸载n1
    if (n1 && n1.type !== n2.type) {
      unmount(n1)
      n1 = null
    }
    if (typeof n2.type === 'string') {
      // 普通标签
      if (!n1) {
        // 没有旧node，第一次渲染，需要挂载n2
        mountElement(n2, container)
      }
      else {
        patchElement(n1, n2)
      }
    }
    else if (typeof type === 'object') {
      // 组件
    }
    else {
      // 其他类型
      console.log('更新')
      console.log(n1, n2)
    }
  }

  function patchElement(n1, n2) {
    console.log('更新')
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

  function patchChildren(n1, n2, el) {
    console.log('更新111')
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

  return {
    render,
  }
}

const renderer = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  /**
   * 将子元素插入到某个元素前面;如果没有传递anchor，会插入到末尾
   * @param {dom} el dom
   * @param {dom} parent 父元素
   * @param {dom} anchor 锚点
   */
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  },
  patchProps(el, key, prevValue, nextValue) {
    if (key.startsWith('on')) {
      const name = key.slice(2).toLowerCase()
      // 使用对象结构保存事件，key是事件名字
      const invokers = el._evi || (el._evi = {})
      let invoker = invokers[key]
      if (nextValue) {
        if (!invoker) {
          invoker = (e) => {
            if (e.timeStamp < invoker.attached)
              return
            if (Array.isArray(invoker.value)) {
              invoker.value.forEach(fn => fn(e))
            }
            else {
              invoker.value(e)
            }
          }
          el._evi[key] = invoker
          // invoker 引用不变
          invoker.value = nextValue
          invoker.attached = performance.now()
          el.addEventListener(name, invoker)
        }
        else {
          invoker.value = nextValue
        }
      }
      else if (invoker) {
        el.removeEventListener(name, invoker)
      }
    }
    else if (key === 'class') {
      el.className = nextValue || ''
    }
    else if (shouldSetAsProps(key, el)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextValue === '') {
        el[key] = true
      }
      else {
        el[key] = nextValue
      }
    }
    else {
      el.setAttribute(key, nextValue)
    }
  },
})

const vnode1 = {
  type: 'div',
  props: {
    id: 'foo',
    abc: 'aaa',
    class: normalizeClass([
      'a', 'b', {
        need: true,
        notNeed: false,
      },
    ]),
  },
  children: [
    { type: 'p', props: { class: 'aaa' }, children: 'hello' },
    { type: 'button', props: { disabled: 'false' }, children: 'button' },
    { type: 'span', children: 'span2 ' },
    { type: 'span', children: 'span3' },
  ],
}
const vnode2 = {
  type: 'p',
  props: {
    onClick: () => {
      console.log('clicked p')
    },
  },
  children: [
    {
      type: 'span',
      children: 'click me',
      props: {
        onContextmenu: () => {
          console.log('contextmenu')
        },
        onClick: () => {
          console.log('clicked span')
        },
      },
    },
  ],
}
const vnode3 = {
  type: 'div',
  children: 'v3',
  props: {
    onClick: [
      (e) => {
        console.log('1')
      },
      (e) => {
        console.log('2')
      },
    ],
  },
}

const bol = ref(false)

effect(() => {
  const vnode = {
    type: 'div',
    props: bol.value
      ? {
          onClick(e) {
            console.log('clicked outer div')
          },
        }
      : {},
    children: [
      {
        type: 'p',
        children: 'click me',
        props: {
          onClick: (e) => {
            if (bol.value) {
              bol.value = false
            }
            else {
              bol.value = true
            }
            console.log('clicke me')
          },
        },
      },
    ],
  }
  renderer.render(vnode, document.querySelector('#app'))
})
