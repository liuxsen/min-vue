import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { Teleport, Transition } from '../core/hook'

const bol = ref(true)

effect(() => {
  const Parent = {
    name: 'Parent',
    props: {},
    render() {
      return bol.value
        ? {
            type: Transition,
            children: {
              default() {
                return {
                  type: 'div',
                  props: {
                    class: 'box',
                    onClick() {
                      bol.value = !bol.value
                    },
                  },
                }
              },
            },
          }
        : {
            type: 'div',
          }
    },
  }

  const vnode = {
    type: Parent,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
