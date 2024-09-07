import { symTarget, proxyFor } from './proxy.js'
import { Node } from './node.js'
import { activeAgent } from './agent.js'

export { procedure } from './agent.js'
export { propagateToFixpoint } from './engine.js'

export { dataNode, add, exists }

function dataNode () {
  return proxyFor(Node(null, null))
}

function add (nodeProxy) {
  activeAgent.supportNode(nodeProxy[symTarget])
}

function exists (nodeProxy) {
  let node = nodeProxy[symTarget]

  activeAgent.useNode(node)

  return node.isSupported
}
