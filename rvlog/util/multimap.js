import * as util from 'rvlog/util'

export { Multimap }

function Multimap () {
  this.map = new Map()
}

util.methodFor(Multimap, function add(key, val) {
  let bag = this.map.get(key)

  if (bag === undefined) {
    this.map.set(key, bag = new Set())
  }

  if (bag.has(val)) {
    return false
  }
  else {
    bag.add(val)
    return true
  }
})

util.methodFor(Multimap, function discard(key, val) {
  let bag = this.map.get(key)

  if (bag === undefined) {
    return false
  }

  let wasRemoved = bag.delete(val)

  if (wasRemoved && bag.size === 0) {
    this.map.delete(key)
  }

  return wasRemoved
})

util.methodFor(Multimap, function has(key) {
  return this.map.has(key)
})
