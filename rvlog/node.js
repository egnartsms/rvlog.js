import * as util from 'rvlog/util'
import { Multimap, Queue } from 'rvlog/util'
import { proxyFor, symTarget } from 'rvlog/proxy.js'
import { Plane } from 'rvlog/plane.js'
import { invalidate } from 'rvlog/engine.js'

export { Node }

function Node (parentPlane, value) {
  dbg: util.check(!this, 'Node() and Plane() should be called without \'new\'')

  const node = () => null

  delete node.name
  delete node.length

  return Object.assign(
    Object.setPrototypeOf(node, Node.prototype),
    {
      parentPlane,
      value,
      // What do we do if a node becomes unsupported? This:
      //   - update plane-level watchers ('plane.version.removed.add(node)')
      //   - update node-level watchers (i.e. notify that node died)
      //   - if the node has no node-level consumers, it also becomes a garbage candidate
      //
      // 'node.supporter' may become null even if the set of shadow supporters is not
      //  empty. This happens in case of cyclic dependency. That's why we bother with
      //  this spanning tree of supporters.
      supporter: null,
      planes: null,
      // a plane is "supported" if it has at least 1 supported node
      numSupportedPlanes: 0
    }
  )
}

const shadowSupporters = new Multimap() // all except the `node.supporter`
const nodeWatchers = new Map()

Node.prototype.proxyTraps = {
  get (node, key, receiver) {
    if (key === symTarget) {
      return node
    }

    return nodeGet(node, key)
  }
}

function nodeGet (node, key) {
  if (node.planes === null) {
    node.planes = { __proto__: null }
  }

  let plane = node.planes[key]

  if (plane === undefined) {
    plane = node.planes[key] = Plane(node, key)
    // garbageCandidates.add(plane)
  }

  return proxyFor(plane)
}

util.propertyFor(Node, function isSupported () {
  return this.supporter !== null || this.numSupportedPlanes > 0
})

util.methodFor(Node, function watchBy (watcher) {
  let rec = nodeWatchers.get(this)

  if (rec === undefined) {
    nodeWatchers.set(this, rec = { pos: null, neg: null })
  }

  if (rec.pos?.has(watcher) || rec.neg?.has(watcher)) {
    return false
  }

  const target = this.isSupported
    ? rec.pos || (rec.pos = new Set())
    : rec.neg || (rec.neg = new Set())

  target.add(watcher)

  return true
})

util.methodFor(Node, function unwatchBy (watcher) {
  const rec = nodeWatchers.get(this)

  if (rec.pos?.delete(watcher)) {
    if (rec.pos.size === 0) {
      rec.pos = null
    }
  } else if (rec.neg?.delete(watcher)) {
    if (rec.neg.size === 0) {
      rec.neg = null
    }
  } else {
    util.raise('Logical error: watcher was not registered before')
  }

  if (rec.pos === null && rec.neg === null) {
    nodeWatchers.delete(this)
  }
})

function existenceChanged (node) {
  if (nodeWatchers.has(node)) {
    invalidate(node)
  }
}

/**
 * @return: whether the agent became a new supporter of the node.
 */
util.methodFor(Node, function supportBy (agent) {
  if (this.isSupported) {
    if (this.supporter === null) {
      // 'this' was supported for its children
      this.supporter = agent
      return true
    }

    if (this.supporter === agent) {
      return false
    }

    return shadowSupporters.add(this, agent)
  }

  this.supporter = agent

  let wasUnsupported = true
  let node = this

  // Loop invariant: 'node' is not a root and it just became supported
  while (wasUnsupported) {
    existenceChanged(node)

    if (node.parentPlane === null) {
      break
    }

    if (node.parentPlane.numSupportedNodes++ > 0) {
      break
    }

    node = node.parentPlane.parentNode
    wasUnsupported = !node.isSupported
    node.numSupportedPlanes += 1
  }

  return true
})

util.methodFor(Node, function unsupportBy (agent) {
  if (this.supporter !== agent) {
    const wasRemoved = shadowSupporters.discard(this, agent)
    dbg: util.check(wasRemoved, 'Agent did not support the node before')
    return
  }

  // The primary supporter ceased to support us. Go find a new primary supporter among the
  // shadow supporters that doesn't recursively depend on this node itself.
  this.supporter = shadowSupporters.has(this)
    ? util.find(
      shadowSupporters.get(this), (agent) => canAgentSupportNode(agent, this)
    ) ?? null
    : null

  if (this.supporter !== null) {
    shadowSupporters.discard(this, this.supporter)
  }

  // In case the node became unsupported, we need to propagate this up the ancestor
  // chain.
  let node = this

  while (!node.isSupported) {
    existenceChanged(node)

    if (node.parentPlane === null) {
      break
    }

    if (--node.parentPlane.numSupportedNodes > 0) {
      break
    }

    node = node.parentPlane.parentNode
    node.numSupportedPlanes -= 1
  }
})

function canAgentSupportNode (primAgent, orphaned) {
  const seen = new Set()
  const queue = new Queue()

  queue.push(primAgent)

  while (!queue.isEmpty) {
    const agent = queue.pop()

    if (agent.watchedNodes.includes(orphaned)) {
      return false // 'orphaned' transitively supports 'primAgent'
    }

    for (const node of agent.watchedNodes) {
      if (node.supporter !== null && !seen.has(node.supporter)) {
        seen.add(node.supporter)
        queue.push(node.supporter)
      }
    }
  }

  return true
}

/**
 * By node revalidation we imply notifying its watchers about its supported status. We
 * track which watchers are in which state.
 */
util.methodFor(Node, function revalidate () {
  if (!nodeWatchers.has(this)) {
    return
  }

  const rec = nodeWatchers.get(this)
  const supported = this.isSupported
  let good
  let bad = supported ? rec.neg : rec.pos

  for (const watcher of bad ?? []) {
    watcher.onNodeFlipped(this, supported)
  }

  // Be careful: it's not unusual that in .onNodeFlipped() above the watchers stop to
  // watch the nodes. So we may very well end up here with `rec.pos === null` or `rec.neg
  // === null`, or even `rec` having been deleted from `watchers` because it became
  // empty. In this latter case, the `rec`s pos and neg props will both be null -- here
  // we rely on this fact.
  [good, bad] = supported ? [rec.pos, rec.neg] : [rec.neg, rec.pos]

  if (bad === null) {
    return
  }

  if (good === null) {
    // `bad` is a set, `good` is null => just swap the two
    [rec.pos, rec.neg] = [rec.neg, rec.pos]
    return
  }

  util.addAll(good, bad)

  // Null out the 'bad'
  if (supported) {
    rec.neg = null
  } else {
    rec.pos = null
  }
})
