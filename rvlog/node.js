import { planeProxy } from 'rvlog/proxy.js'
import { makePlane } from 'rvlog/plane.js'

export function makeNode (parentPlane, value) {
  const node = () => null

  delete node.name
  delete node.length

  return Object.assign(
    Object.setPrototypeOf(node, protoNode),
    {
      parentPlane,
      value,
      // Continue here:
      //   - add prop: suppliedChildrenCount
      //   - add prop: supplier. This is either null or the primary supplier.
      //
      // A node becomes unsupplied if both conditions hold:
      //   - node.supplier === null
      //   - node.suppliedChildrenCount === 0
      //
      // What do we do if a node becomes unsupplied? This:
      //   - update plane-level consumers (`plane.version.removed.add(node)`)
      //   - update node-level consumers (i.e. notify that node died)
      //   - if the node has no node-level consumers, it also becomes a garbage candidate
      //
      // node.supplier may become null even if `regSupply.get(node)` is non-empty.
      suppliedChildrenCount: 0,
      supplier: null,
      planes: null
    }
  )
}

const protoNode = {}

export function nodeGet (node, key) {
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
