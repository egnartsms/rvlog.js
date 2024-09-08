import * as util from 'rvlog/util'
import { proxyFor, symTarget } from 'rvlog/proxy.js'
import { Node } from 'rvlog/node.js'

export { Plane }

function Plane (parentNode, name) {
  dbg: util.check(!this, 'Node() and Plane() should be called without \'new\'')

  const plane = () => null

  delete plane.name
  delete plane.length

  return Object.assign(
    Object.setPrototypeOf(plane, Plane.prototype),
    {
      parentNode,
      name,
      node: null, // for single node
      nodes: null, // for multiple nodes, optional Map of value -> node
      numSupportedNodes: 0,
      subplanes: null
    }
  )
}

const attrWatchers = new Map()

Plane.prototype.proxyTraps = {
  // Subplane getter
  get (plane, key, receiver) {
    if (key === symTarget) {
      return plane
    }

    throw new Error('Subplanes not implemeted')
  },

  apply (plane, thisArg, args) {
    return planeApply(plane, args)
  }
}

function planeApply (plane, args) {
  if (args.length === 0) {
    util.raise('Plane call misuse (no arguments)')
  } else if (args.length > 1) {
    util.raise('Plane call misuse (many arguments)')
  }

  const [value] = args

  if (plane.node !== null) {
    if (plane.node.value === value) {
      return proxyFor(plane.node)
    }

    // Switch to multiple nodes
    dbg: util.check(plane.nodes === null)

    const node = Node(plane, value)

    plane.nodes = new Map([
      [plane.node.value, plane.node],
      [node.value, node]
    ])
    plane.node = null

    return proxyFor(node)
  }

  if (plane.nodes === null) {
    plane.node = Node(plane, value)
    return proxyFor(plane.node)
  }

  let node = plane.nodes.get(value)

  if (node === undefined) {
    node = Node(plane, value)
    plane.nodes.set(node.value, node)
    // garbageCandidates.add(node)
  }

  return proxyFor(node)
}
