import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { Teleport } from '../core/hook'

const bol = ref(true)

effect(() => {
  const Parent = {
    name: 'Parent',
    props: {},
    render() {
      return {
        type: Teleport,
        props: {
          to: bol.value ? '#teleport-box' : '#overlay',
        },
        children: [
          {
            type: 'h1',
            key: 1,
            children: `title: ${bol.value}`,
            props: {
              onClick() {
                bol.value = !bol.value
              },
            },
          },
          {
            key: 2,
            type: 'p',
            children: 'content',
          },
        ],
      }
    },
  }

  const vnode = {
    type: Parent,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
