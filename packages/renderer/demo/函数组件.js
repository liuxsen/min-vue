import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { onMounted, onUnMounted } from '../core/hook'
import { defineAsyncComponent } from '../core/defineAsyncComponent'

effect(() => {
  function MyFuncComp(props) {
    return {
      type: 'h1',
      children: props.title,
    }
  }
  MyFuncComp.props = {
    title: String,
  }
  const vnode = {
    type: MyFuncComp,
    props: {
      title: 'aaa',
    },
  }
  renderer.render(vnode, document.querySelector('#app'))
})
