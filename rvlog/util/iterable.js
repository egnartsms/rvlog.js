export function find(iterable, predicate) {
  for (let item of iterable) {
    if (predicate(item)) {
      return item
    }
  }

  return undefined
}


export function any(seq, pred) {
  for (let item of seq) {
    if (pred(item)) {
      return true
    }
  }

  return false
}
