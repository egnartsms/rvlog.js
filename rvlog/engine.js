// import { Queue } from 'rvlog/util'

export { propagateToFixpoint, invalidate, isInvalidated, makeSureRevalidated }

// const toRevalidate = new Queue()
const invalidated = new Set()

function invalidate (item) {
  invalidated.add(item)
}

function isInvalidated (item) {
  return invalidated.has(item)
}

/**
 * Revalidate all the supported nodes outside the main revalidation loop
 */
function makeSureRevalidated (items) {
  for (let item of items) {
    if (invalidated.has(item)) {
      item.revalidate()
      invalidated.delete(item)
    }
  }
}

function propagateToFixpoint () {
  while (invalidated.size > 0) {
    let [item] = invalidated
    item.revalidate()
    invalidated.delete(item)
  }
}
