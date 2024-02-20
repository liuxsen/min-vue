import { shouldSetAsProps } from '../utils/shouldSetAsProps'
import { createRenderer } from './createRenderer'

export const renderer = createRenderer({
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
  setText(el, text) {
    el.nodeValue = text
  },
  createText(text) {
    return document.createTextNode(text)
  },
  createComment(text) {
    return document.createComment(text)
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
