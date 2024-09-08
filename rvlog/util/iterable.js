export function find (iterable, predicate) {
  for (const item of iterable) {
    if (predicate(item)) {
      return item
    }
  }

  return undefined
}

export function any (seq, pred) {
  for (const item of seq) {
    if (pred(item)) {
      return true
    }
  }

  return false
}
