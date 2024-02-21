import { effect } from '@vue/reactivity'
import { renderer } from '../core/dom'
import { Fragment } from '../core/constant'

effect(() => {
  const MyComponent = {
    name: 'MyComponent',
    render() {
      return {
        type: Fragment,
        children: [
          {
            type: 'header',
            children: [this.$slots.header()],
          },
          {
            type: 'div',
            children: [this.$slots.body()],
          },
          {
            type: 'footer',
            children: [this.$slots.footer()],
          },
        ],
      }
    },
  }
  const App = {
    name: 'App',
    render() {
      return {
        type: MyComponent,
        children: {
          header() {
            return {
              type: 'h1',
              children: '我是标题',
            }
          },
          body() {
            return {
              type: 'section',
              children: '我是内容',
            }
          },
          footer() {
            return {
              type: 'p',
              children: '我是footer',
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
