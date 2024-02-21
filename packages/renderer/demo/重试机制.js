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

load(
  (retry) => {
    console.log('重试一次')
    retry()
  },
)
  .then((res) => {
    console.log(res)
  })
