import { ref, shallowRef } from '@vue/reactivity'
import { Comment } from './constant'
import { onUnMounted } from './hook'

function fetch() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('err'))
    }, 1000)
  })
}

function load(onError) {
  const p = fetch()
  return p.catch((err) => {
    return new Promise((resolve, reject) => {
      const retry = () => resolve(load(onError))
      const fail = () => reject(err)
      onError(retry, fail)
    })
  })
}

/**
 * 异步组件
 * @param {object} options {loader, timeout, errorComponent}
 */
export function defineAsyncComponent(options) {
  if (typeof options === 'function') {
    options = {
      loader: options,
    }
  }
  const { loader } = options
  let InnerCom = null

  // 重试机制
  let retries = 0
  function load() {
    return loader()
      .catch((err) => {
        if (options.onError) {
          return new Promise((resolve, reject) => {
            const retry = () => {
              resolve(load())
              retries++
            }
            const fail = () => reject(err)
            options.onError(retry, fail, retries)
          })
        }
        else {
          throw err
        }
      })
  }

  return {
    name: 'AsyncComponentWrapper',
    data() {
      return {}
    },
    setup() {
      const loaded = ref(false)
      const timeout = ref(false)
      const error = shallowRef(null) // 保存错误对象
      const loading = ref(false)

      let loadingTimer = null
      if (options.delay) {
        // 在延迟之前不显示加载状态
        loadingTimer = setTimeout(() => {
          loading.value = true
        }, options.delay)
      }
      else {
        // 直接显示加载状态
        loading.value = true
      }

      load()
        .then((c) => {
          InnerCom = c.default
          // 如果没有超时，标注加载成功
          if (!timeout.value) {
            loaded.value = true
          }
        }).catch((err) => {
          error.value = err
        }).finally(() => {
          loading.value = false
          // 加载完成，清除加载中定时
          clearTimeout(loadingTimer)
        })
      let timer = null
      if (options.timeout) {
        timer = setTimeout(() => {
          const err = new Error(`Async component timee out after (${options.timeout})ms`)
          timeout.value = true
          error.value = err
        }, options.timeout)
      }
      onUnMounted(() => {
        clearTimeout(timer)
      })
      const placeholder = { type: Comment, children: '异步组件placeholder' }
      return () => {
        if (loaded.value) {
          return { type: InnerCom }
        }
        else if (error.value && options.errorComponent) {
          return options.errorComponent
            ? {
                type: options.errorComponent,
                props: {
                  error: error.value,
                },
              }
            : placeholder
        }
        else if (loading.value && options.loadingComponent) {
          return {
            type: options.loadingComponent,
          }
        }
        return placeholder
      }
    },
  }
}
