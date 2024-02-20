import { effect, ref } from '@vue/reactivity'
import { renderer } from '../core/dom'

const bol = ref(false)

effect(() => {
  const vnode = {
    type: 'div',
    // children: `value: ${bol.value}`,
    // children: bol.value
    //   ? `value: ${bol.value}`
    //   : [
    //       {
    //         type: 'p',
    //         children: `p: value: ${bol.value}`,
    //       },
    //     ],
    children: [
      {
        type: 'p',
        children: `p: value: ${bol.value}`,
      },
    ],
    props: {
      onClick: () => {
        if (bol.value) {
          bol.value = false
        }
        else {
          bol.value = true
        }
      },
    },
  }
  renderer.render(vnode, document.querySelector('#app'))
})
