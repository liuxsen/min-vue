import { effect, ref } from '@vue/reactivity'
import { Comment, Fragment, Text } from '../core/constant'
import { renderer } from '../core/dom'
import { onUnMounted } from '../core/hook'
import { defineAsyncComponent } from '../core/defineAsyncComponent'

const bol = ref(true)

effect(() => {
  const Button = {
    name: 'Button',
    data() {
      return {}
    },
    setup(props) {
      onUnMounted(() => {
        console.log('destryed')
      })
    },
    render() {
      return {
        type: 'button',
        children: 'btn',
      }
    },
  }
  // const vnode = {
  //   type: 'div',
  //   props: {
  //     onClick() {
  //       bol.value = !bol.value
  //     },
  //   },
  //   children: bol.value
  //     ? [
  //         {
  //           type: Button,
  //         },
  //       ]
  //     : [],
  // }
  const ErrorComponent = {
    name: 'ErrorComponent',
    props: {
      error: Object,
    },
    render() {
      console.log(this.error)
      return {
        type: 'div',
        children: this.error.message,
      }
    },
  }
  const LoadingComponent = {
    name: 'LoadingComponent',
    render() {
      return {
        type: 'div',
        children: 'loading',
      }
    },
  }
  let retryCount = 0
  const vnode = {
    type: 'div',
    props: {
      onClick() {
        bol.value = !bol.value
      },
    },
    children: [
      {
        type: Button,
      },
      {
        type: defineAsyncComponent({
          loader: () => new Promise((resolve, reject) => {
            setTimeout(() => {
              import('./Radio').then((c) => {
                if (retryCount === 2) {
                  resolve(c)
                }
                else {
                  reject(new Error('错误'))
                }
              })
            }, 200)
          }),
          onError: (retry, fail, retries) => {
            console.log('重试')
            retryCount = retries
            if (retries <= 2) {
              retry()
            }
          },
          timeout: 2100, // 超时1000ms 显示错误组件
          delay: 2000, // 延迟 200ms后显示loading组件
          errorComponent: ErrorComponent,
          loadingComponent: LoadingComponent,
        }),
      },
    ],
  }
  renderer.render(vnode, document.querySelector('#app'))
})
