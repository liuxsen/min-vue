import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { KeepAlive, onMounted, onUnMounted } from '../core/hook'
import { defineAsyncComponent } from '../core/defineAsyncComponent'

effect(() => {
  const First = {
    name: 'First',
    render() {
      return {
        type: 'div',
        children: 'first',
      }
    },
  }
  const Second = {
    name: 'First',
    render() {
      return {
        type: 'div',
        children: 'Second',
      }
    },
  }
  const App = {
    name: 'App',
    render() {
      return {
        type: KeepAlive,
        children: {
          default() {
            return {
              type: First,
            }
          },
        },
      }
    },
  }
  const vnode = {
    type: App,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
