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
