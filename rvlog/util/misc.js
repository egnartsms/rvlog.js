export function check (condition, message) {
  if (!condition) {
    throw new Error(
      typeof message === 'string'
        ? message
        : typeof message === 'function'
          ? message()
          : 'Check failed'
    )
  }
}

export function raise (message) {
  throw new Error(message)
}

export function addAll (container, items) {
  for (const item of items) {
    container.add(item)
  }
}
