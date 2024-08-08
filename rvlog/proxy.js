import { nodeGet } from 'rvlog/node.js'
import { planeApply } from 'rvlog/plane.js'

const nodeProxyTraps = {
  get (node, key, receiver) {
    return nodeGet(node, key)
  }
}

export const planeProxyTraps = {
  // Subplane getter
  get (plane, key, receiver) {
    throw new Error('Subplanes not implemeted')
  },

  apply (plane, thisArg, args) {
    return planeApply(plane, args)
  }
}

const objectToProxy = new Map()

function proxyFor (object, traps) {
  let proxy = objectToProxy.get(object)

  if (proxy === undefined) {
    proxy = new Proxy(object, traps)
    objectToProxy.set(object, proxy)
  }

  return proxy
}

export const nodeProxy = (node) => proxyFor(node, nodeProxyTraps)
export const planeProxy = (node) => proxyFor(node, planeProxyTraps)

const garbageCandidates = new Set()

export function checkForGarbage (entity) {
  garbageCandidates.add(entity)
}
