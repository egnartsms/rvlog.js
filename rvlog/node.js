import {planeProxy} from "rvlog/proxy.js"
import {makePlane} from "rvlog/plane.js"


export function makeNode (parentPlane, value) {
  const node = () => null

  Reflect.deleteProperty(node, 'name')
  Reflect.deleteProperty(node, 'length')

  return Object.assign(
    Object.setPrototypeOf(node, protoNode),
    {
      parentPlane,
      value,
      supplyCount: 0,
      planes: null
    }
  )
}

const protoNode = {}

export function nodeGet(node, key) {
  if (node.planes === null) {
    node.planes = { __proto__: null }
  }

  let plane = node.planes[key]

  if (plane === undefined) {
    plane = node.planes[key] = makePlane(node, key)
    // garbageCandidates.add(plane)
  }

  return planeProxy(plane)
}
