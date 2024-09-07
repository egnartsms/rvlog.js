export { Queue }

function Queue () {
  this.front = []
  this.pop = []
}

Queue.prototype = {
  push (item) {
    this.rear.push(item)
  },

  pushAll (items) {
    for (const item of items) {
      this.push(item)
    }
  },

  pop () {
    if (this.front.length === 0) {
      stackRepump(this.rear, this.front)
    }

    return this.front.pop()
  },

  get isEmpty () {
    return this.front.length === 0 && this.rear.length === 0
  }
}

function stackRepump (from, to) {
  while (from.length > 0) {
    to.push(from.pop())
  }
}
