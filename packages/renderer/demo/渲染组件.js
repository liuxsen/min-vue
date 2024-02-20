import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

effect(() => {
  const Child = {
    name: 'Child',
    props: {
      childProp: String,
    },
    data() {
      return {}
    },
    render() {
      return {
        type: 'div',
        children: `child: ${this.childProp}`,
      }
    },
  }
  const Parent = {
    name: 'Parent',
    data() {
      return {
        info: {
          count: 1,
        },
      }
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
    mounted() {
      setTimeout(() => {
        this.info.count++
      }, 100)
    },
    render() {
      return {
        type: 'div',
        children: [
          {
            key: 1,
            type: Text,
            children: `count: ${this.info.count}`,
          },
          {
            key: 2,
            type: 'div',
            children: `prop: ${this.title}`,
          },
          {
            key: 3,
            type: Child,
            props: {
              childProp: this.info.count,
            },
          },
        ],
      }
    },
  }

  const vnode = {
    type: Parent,
    props: {
      title: 'title',
    },
  }
  renderer.render(vnode, document.querySelector('#app'))
})
