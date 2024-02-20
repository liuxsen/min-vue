import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

const bol = ref(false)
const bol2 = ref(true)

effect(() => {
  const vnode = {
    type: 'div',
    children: [
      {
        type: Comment,
        children: `我是注释内容${bol.value}`,
      },
      {
        type: Text,
        children: `我是文本内容: ${bol.value}`,
      },
      {
        type: 'ul',
        children: [
          {
            type: Fragment,
            children: bol2.value
              ? [
                  { type: 'li', children: bol.value ? '1' : 'a' },
                  { type: 'li', children: bol.value ? '2' : 'b' },
                  { type: 'li', children: bol.value ? '3' : 'c' },
                ]
              : [],
          },
        ],
      },
    ],
    props: {
      onClick() {
        bol.value = !bol.value
        bol2.value = false
      },
    },
  }
  renderer.render(vnode, document.querySelector('#app'))
})
