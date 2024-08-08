import { nodeProxy } from 'rvlog/proxy.js'
import { makeNode } from 'rvlog/node.js'

export { dataNode }

function dataNode () {
  return nodeProxy(makeNode(null, null))
}
