import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'

effect(() => {
  const Child = {
    name: 'Child',
    props: {
      childProp: String,
    },
    setup(props, { emit }) {
      return {
        emit,
      }
    },
    data() {
      return {}
    },
    render() {
      return {
        type: 'div',
        children: `child: ${this.childProp}`,
        props: {
          onClick: () => {
            this.emit('change', 1, 2)
          },
        },
      }
    },
  }
  const Parent = {
    name: 'Parent',
    setup() {
      const age = ref(1)
      return {
        age,
      }
    },
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
            key: 4,
            type: Text,
            children: ` age: ${this.age.value}`,
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
              onChange(...args) {
                console.log(args)
              },
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
