export { symTarget, proxyFor }

const symTarget = Symbol('target')

const objectToProxy = new Map()

function proxyFor (object) {
  let proxy = objectToProxy.get(object)

  if (proxy === undefined) {
    proxy = new Proxy(object, object.proxyTraps)
    objectToProxy.set(object, proxy)
  }

  return proxy
}

const garbageCandidates = new Set()

export function checkForGarbage (entity) {
  garbageCandidates.add(entity)
}
