import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

const bol = ref(false)

effect(() => {
  const vnode = {
    type: 'ul',
    props: {
      onClick: () => {
        bol.value = !bol.value
      },
    },
    children: bol.value
      ? [
          { type: 'li', children: '1' },
          { type: 'li', children: '2' },
          { type: 'li', children: '3' },
        ]
      : [
          { type: 'li', children: '4' },
          { type: 'li', children: '5' },
        ],
  }
  renderer.render(vnode, document.querySelector('#app'))
})
