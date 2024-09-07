import * as util from './util'
import { scheduleForRevalidation, isInvalidated, makeSureRevalidated } from './engine.js'

export { procedure, activeAgent, Agent }

function procedure (proc) {
  scheduleForRevalidation(new Agent(proc))
}

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
  return Object.assign(this, {
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

  // Revalidate all the supported nodes outside the main revalidation loop
  for (let node of this.supportedNodes) {
    // TODO: querying all the supported nodes is suboptimal. You should handle them
    // separately when they get invalidated during the agent run.
    makeSureRevalidated(node)
  }
})

util.methodFor(Agent, function onNodeFlipped (node, exists) {
  // Just invalidate the Agent's invocation
  dbg: util.check(!isInvalidated(this))

  for (let node of this.watchedNodes) {
    node.unwatchBy(this)
  }
  this.watchedNodes.length = 0

  scheduleForRevalidation(this)

  for (let node of this.supportedNodes) {
    node.unsupportBy(this)
  }
  this.supportedNodes.length = 0
})
