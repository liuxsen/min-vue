import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

const bol = ref(false)
const count = ref(0)

effect(() => {
  const MyComponent = {
    name: 'MyComponent',
    data() {
      return { foo: 1 }
    },
    beforeCreate() {
      console.log('beforeCreate')
    },
    created() {
      console.log('created')
    },
    beforeMount() {
      console.log('beforeMount')
    },
    mounted() {
      console.log('mounted')
    },
    beforeUpdate() {
      console.log('beforeUpdate')
    },
    updated() {
      console.log('updated')
    },
    props: {
      id: String,
      title: String,
    },
    render() {
      return {
        type: 'div',
        children: `foo的值是: ${this.id}`,
      }
    },
  }
  const App = {
    name: 'App',
    data() {
      return {
        info: {
          count: 1,
        },
      }
    },
    mounted() {
      setTimeout(() => {
        this.info.count = 2
      }, 2000)
    },
    render() {
      return {
        type: 'div',
        props: {
        },
        children: [
          {
            type: 'div',
            children: `count:${this.info.count}`,
          },
          {
            type: MyComponent,
            props: {
              id: 'this_is_id',
              title: 'title',
              count: this.info.count,
            },
          },
        ],
      }
    },
  }
  const vnode = {
    type: App,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
