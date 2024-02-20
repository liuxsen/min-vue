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
    render() {
      return {
        type: 'div',
        children: `foo的值是: ${this.foo}`,
        props: {
          onClick: () => {
            console.log(12111)
            this.foo += 1
          },
        },
      }
    },
  }
  const vnode = {
    type: MyComponent,
  }
  renderer.render(vnode, document.querySelector('#app'))
})
