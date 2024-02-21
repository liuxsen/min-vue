let currentInstance = null
export function setCurrentInstance(instance) {
  currentInstance = instance
}

export function onMounted(fn) {
  if (currentInstance) {
    currentInstance.mounted.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}

export function onCreated(fn) {
  if (currentInstance) {
    currentInstance.created.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}

export function onUnMounted(fn) {
  if (currentInstance) {
    currentInstance.unMounted.push(fn)
  }
  else {
    console.log('只能在setup中使用')
  }
}
