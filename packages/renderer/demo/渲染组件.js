import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

const bol = ref(false)

effect(() => {
  const MyComponent = {
    name: 'MyComponent',
    data() {
      return { foo: 1 }
    },
    render() {
      return {
        type: 'div',
        children: '我是组件内容',
      }
    },
  }
  const vnode = {
    type: MyComponent,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
