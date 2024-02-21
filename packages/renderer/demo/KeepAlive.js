import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { KeepAlive, onMounted, onUnMounted } from '../core/hook'
import { defineAsyncComponent } from '../core/defineAsyncComponent'

const bol = ref(true)

effect(() => {
  const First = {
    name: 'First',
    render() {
      return {
        type: 'div',
        children: 'first',
        props: {
          onClick() {
            bol.value = false
            setTimeout(() => {
              bol.value = true
            }, 2000)
          },
        },
      }
    },
  }
  const App = {
    name: 'App',
    render() {
      return {
        type: 'div',
        children: [
          {
            type: KeepAlive,
            props: {
              exclude: /^First/,
            },
            children: {
              default() {
                return {
                  type: bol.value ? First : 'div',
                }
              },
            },
          },
        ],
      }
    },
  }
  const vnode = {
    type: App,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
