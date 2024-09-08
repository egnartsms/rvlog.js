import * as util from './util'
import { invalidate, isInvalidated, makeSureRevalidated } from './engine.js'

export { activeAgent, Agent }

let activeAgent = null

// function withActiveAgent(agent, callback) {
//   let oldAgent = activeAgent

//   activeAgent = agent

//   try {
//     return callback()
//   }
//   finally {
//     activeAgent = oldAgent
//   }
// }

function Agent (proc) {
  Object.assign(this, {
    proc: proc,
    watchedNodes: [],
    supportedNodes: [],
    exc: null,
  })
}

util.methodFor(Agent, function supportNode (node) {
  if (node.supportBy(this)) {
    this.supportedNodes.push(node)
  }
})

util.methodFor(Agent, function useNode (node) {
  if (node.watchBy(this)) {
    this.watchedNodes.push(node)
  }
})

util.methodFor(Agent, function revalidate () {
  dbg: util.check(activeAgent === null, 'Agent revalidation may not overlap')

  activeAgent = this

  try {
    this.proc.call(null)
    // console.log(`Procedure ${this.proc} executed normally`)
  }
  catch (e) {
    this.exc = e
    console.log(`Procedure ${this.proc} raised an exception:`, e)
  }

  activeAgent = null

  // Revalidate all the supported nodes outside the main revalidation loop.
  //
  // TODO: processing of all nodes that this agent started to support is suboptimal. You
  // should handle them separately when they get invalidated during agent run.
  makeSureRevalidated(this.supportedNodes)
})

util.methodFor(Agent, function reset () {
  dbg: util.check(!isInvalidated(this))

  for (let node of this.watchedNodes) {
    node.unwatchBy(this)
  }
  this.watchedNodes.length = 0

  invalidate(this)

  for (let node of this.supportedNodes) {
    node.unsupportBy(this)
  }
  this.supportedNodes.length = 0

})

util.methodFor(Agent, function onNodeFlipped (node, exists) {
  this.reset()
})
