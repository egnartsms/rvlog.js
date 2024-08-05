export { makeNode, planeProxy }

const nodeProxyDummyTarget = {}
const planeProxyDummyTarget = function () {}

const proxyToObject = new Map()
const objectToProxy = new Map()

function makeProxyGetter (makeProxy) {
  return (object) => {
    let proxy = objectToProxy.get(object)

    if (proxy === undefined) {
      proxy = makeProxy()

      objectToProxy.set(object, proxy)
      proxyToObject.set(proxy, object)
    }

    return proxy
  }
}

const nodeProxy = makeProxyGetter(
  () => new Proxy(nodeProxyDummyTarget, nodeProxyHandler)
)
const planeProxy = makeProxyGetter(
  () => new Proxy(planeProxyDummyTarget, planeProxyHandler)
)

const garbageCandidates = new Set()

function makeNode (parentPlane, value) {
  return {
    parentPlane,
    suppliers: null,
    value,
    planes: null
  }
}

const nodeProxyHandler = {
  get (targetDummy, key, receiver) {
    const node = proxyToObject.get(receiver)

    if (node === undefined) {
      throw new Error('Stale node proxy. Do not hold onto object proxies')
    }

    if (node.planes === null) {
      node.planes = { __proto__: null }
    }

    let plane = node.planes[key]

    if (plane === undefined) {
      plane = node.planes[key] = makePlane(node, key)
      garbageCandidates.add(plane)
    }

    return planeProxy(plane)
  }
}

function makePlane (parentNode, name) {
  function plane (value) {
  }

  return Object.assign(plane, {
    parentNode,
    name,
    node: null,
    nodes: null,
    subplanes: null
  })
}

const planeProxyHandler = {
  // This is the subplane getter: `db.user.deactivated("Joe")`
  get (dummyTarget, key, receiver) {
    const plane = proxyToObject.get(receiver)

    if (plane === undefined) {
      throw new Error('Stale plane proxy. Do not hold onto object proxies')
    }

    // TODO: implement creation of `plane.subplanes[key]`
  },

  apply (dummyTarget, thisArg, args) {
    console.log(arguments)
    console.log(this)
    return 'none'
    // if (value === undefined) {
    //   throw new Error("We don't support this yet: `db.user()`");
    // }

    // let node

    // if (plane.nodes === null) {
    //   if (plane.node === null) {
    //     node = plane.node = makeNode(plane, value)
    //   }
    //   else if (plane.node.value === value) {
    //     node = plane.node
    //   }
    //   else {
    //     // Turn into multi-value plane
    //     plane.nodes = new Map
    //     plane.nodes.set(plane.node.value, plane.node)
    //     plane.node = null

    //     node = makeNode(plane, value)
    //     plane.nodes.set(value, node)
    //   }
    // }
    // else {
    //   node = plane.nodes.get(value)

    //   if (node === undefined) {
    //     node = makeNode(plane, value)
    //     plane.nodes.set(value, node)
    //   }
    // }

    // return objectProxy(node, nodeProxyHandler)
  }
}
