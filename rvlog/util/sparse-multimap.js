import { methodFor } from 'rvlog/common'

export { MultiMap }

function MultiMap () {
  this.alone = new Map()
  this.multi = new Map()
}

methodFor(MultiMap, function has (key, val) {
  if (this.alone.has(key)) {
    return this.alone.get(key) === val
  }
  else if (this.multi.has(key)) {
    return this.multi.get(key).has(val)
  }
  else {
    return false
  }
})

/**
 * Precondition: this.alone.has(key) should be true
 */
function toMulti (mmap, key) {
  const bag = new Set()
  bag.add(this.alone.get(key))

  this.multi.set(key, bag)
  this.alone.delete(key)

  return bag
}

MultiMap.prototype = {
  add (key, val) {
    if (this.alone.has(key)) {
      if (this.alone.get(key) === val) {
        return false
      }

      toMulti(this, key).add(val)
    }
    else if (this.multi.has(key)) {
      let bag = this.multi.get(key)

      if (bag.has(val)) {
        return false
      }

      bag.add(val)
    }
    else {
      this.alone.set(key, val)
    }

    return true
  },

  delete (key, val) {
    if (this.single.has(key)) {
      let xval = this.single.get(key)

      if (xval === val) {
        this.single.delete(key)
        return true
      } else {
        return false
      }
    }
    else if (this.multi.has(key)) {
      let bag = this.multi.get(key)

      if (bag.has(val)) {
        bag.delete(val)

        if (bag.size === 0) {
          this.multi.delete(key)
        }

        return true
      } else {
        return false
      }
    } else {
      return false
    }
  },

  getAll (key) {
    if (this.single.has(key)) {
      return [this.single.get(key)]
    } else if (this.multi.has(key)) {
      return this.multi.get(key)
    }
    else {
      return []
    }
  }

  // popAt(key) {
  //   if (this.single.has(key)) {
  //     let val = this.single.get(key);

  //     this.single.delete(key);

  //     return val;
  //   }

  //   if (this.multi.has(key)) {
  //     let bag = this.multi.get(key);
  //     let [val] = bag;

  //     bag.delete(val);

  //     if (bag.size === 0) {
  //       this.multi.delete(key);
  //     }

  //     return val;
  //   }

  //   return undefined;
  // }
}
