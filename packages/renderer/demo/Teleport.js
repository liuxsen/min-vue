import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { Teleport } from '../core/hook'

effect(() => {
  const Parent = {
    name: 'Parent',
    props: {},
    render() {
      return {
        type: Teleport,
        props: {
          to: '#teleport-box',
        },
        children: [
          {
            type: 'h1', children: 'title',
          },
          {
            type: 'p', children: 'content',
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
