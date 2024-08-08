import { nodeProxy } from 'rvlog/proxy.js'
import { makeNode } from 'rvlog/node.js'

export function makePlane (parentNode, name) {
  const plane = () => null

  delete plane.name
  delete plane.length

  return Object.assign(
    Object.setPrototypeOf(plane, protoPlane),
    {
      parentNode,
      name,
      suppliedChildrenCount: 0,
      nodes: new Map(),
      subplanes: null
    }
  )
}

const protoPlane = {}

export function planeApply (plane, args) {
  if (args.length === 0) {
    throw new Error('Plane call misuse (no arguments)')
  } else if (args.length > 1) {
    throw new Error('Plane call misuse (many arguments)')
  }

  const [value] = args
  let node

  node = plane.nodes.get(value)

  if (node === undefined) {
    node = makeNode(plane, value)
    plane.nodes.set(node.value, node)

    // garbageCandidates.add(node)
  }

  return nodeProxy(node)
}
