// import { Queue } from 'rvlog/util'

export { propagateToFixpoint, scheduleForRevalidation, isInvalidated, makeSureRevalidated }

// const toRevalidate = new Queue()
const invalidated = new Set()

function scheduleForRevalidation (item) {
  invalidated.add(item)
}

function isInvalidated (item) {
  return invalidated.has(item)
}

function makeSureRevalidated (item) {
  if (invalidated.has(item)) {
    item.revalidate()
    invalidated.delete(item)
  }
}

function propagateToFixpoint () {
  while (invalidated.size > 0) {
    let [item] = invalidated
    item.revalidate()
    invalidated.delete(item)
  }
}
