import * as util from './util'

export { propagateToFixpoint, invalidate, isInvalidated, createPrioQueue }

const invalidated = new Set()
let prioQueue = null

function createPrioQueue () {
  dbg: util.check(prioQueue === null)

  prioQueue = []
}

function invalidate (item) {
  if (invalidated.has(item)) {
    return
  }

  if (prioQueue !== null) {
    prioQueue.push(item)
  }

  invalidated.add(item)
}

function isInvalidated (item) {
  return invalidated.has(item)
}

function propagateToFixpoint () {
  while (invalidated.size > 0) {
    if (prioQueue !== null) {
      for (const item of prioQueue) {
        item.revalidate()
        invalidated.delete(item)
      }

      prioQueue = null

      continue
    }

    const [item] = invalidated
    item.revalidate()
    invalidated.delete(item)
  }
}
