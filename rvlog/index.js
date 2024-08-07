export { dataNode }

import {nodeProxy} from "rvlog/proxy.js"
import {makeNode} from "rvlog/node.js"

function dataNode () {
  return nodeProxy(makeNode(null, null))
}
