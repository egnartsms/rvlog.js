import {nodeProxy} from "rvlog/proxy.js"
import {makeNode} from "rvlog/node.js"


export function makePlane (parentNode, name) {
  const plane = () => null

  Reflect.deleteProperty(plane, 'name')
  Reflect.deleteProperty(plane, 'length')

  return Object.assign(
    Object.setPrototypeOf(plane, protoPlane),
    {
      parentNode,
      name,
      supplyCount: 0,
      node: null,
      nodes: null,
      subplanes: null
    }
  )
}

const protoPlane = {}

export function planeApply(plane, args) {
  if (args.length === 0) {
    throw new Error("Plane call misuse (no arguments)")
  } else if (args.length > 1) {
    throw new Error('Plane call misuse (many arguments)')
  }

  const [value] = args
  let node

  if (plane.nodes === null) {
    if (plane.node === null) {
      node = plane.node = makeNode(plane, value)

      // garbageCandidates.add(node)
    } else if (plane.node.value === value) {
      node = plane.node
    } else {
      // Turn into multi-value plane
      plane.nodes = new Map()
      plane.nodes.set(plane.node.value, plane.node)
      plane.node = null

      node = makeNode(plane, value)
      plane.nodes.set(node.value, node)

      // garbageCandidates.add(node)
    }
  } else {
    node = plane.nodes.get(value)

    if (node === undefined) {
      node = makeNode(plane, value)
      plane.nodes.set(node.value, node)

      // garbageCandidates.add(node)
    }
  }

  return nodeProxy(node)
}

