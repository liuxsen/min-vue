import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

const bol = ref(true)

effect(() => {
  const vnode = {
    type: 'div',
    props: {
      onClick: () => {
        bol.value = !bol.value
      },
    },
    children: bol.value
      ? [
          { type: 'p', children: '1', props: {}, key: 1 },
          { type: 'div', children: '2', key: 2 },
          { type: 'span', children: '3', key: 3 },
        ]
      : [
          { type: 'span', children: '4', key: 3 },
          { type: 'p', children: '5', key: 1 },
          { type: 'p', children: '7', key: 4 },
          { type: 'div', children: '6', key: 2 },
        ],
  }
  renderer.render(vnode, document.querySelector('#app'))
})
