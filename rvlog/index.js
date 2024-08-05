export { dataNode }

function dataNode () {
  return proxyFor(makeNode(null, null), nodeProxyTraps)
}

function makeNode (parentPlane, value) {
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

const nodeProxyTraps = {
  get (node, key, receiver) {
    if (node.planes === null) {
      node.planes = { __proto__: null }
    }

    let plane = node.planes[key]

    if (plane === undefined) {
      plane = node.planes[key] = makePlane(node, key)
      garbageCandidates.add(plane)
    }

    return proxyFor(plane, planeProxyTraps)
  }
}

function makePlane (parentNode, name) {
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

const planeProxyTraps = {
  // Subplane getter
  get (plane, key, receiver) {
    throw new Error('Subplanes not implemeted')
  },

  apply (plane, thisArg, args) {
    if (args.length === 0) {
      throw new Error("We don't support this yet: `Node.plane()`")
    } else if (args.length > 1) {
      throw new Error('Plane call misuse (many arguments)')
    }

    const [value] = args
    let node

    if (plane.nodes === null) {
      if (plane.node === null) {
        node = plane.node = makeNode(plane, value)

        garbageCandidates.add(node)
      } else if (plane.node.value === value) {
        node = plane.node
      } else {
        // Turn into multi-value plane
        plane.nodes = new Map()
        plane.nodes.set(plane.node.value, plane.node)
        plane.node = null

        node = makeNode(plane, value)
        plane.nodes.set(node.value, node)

        garbageCandidates.add(node)
      }
    } else {
      node = plane.nodes.get(value)

      if (node === undefined) {
        node = makeNode(plane, value)
        plane.nodes.set(node.value, node)

        garbageCandidates.add(node)
      }
    }

    return proxyFor(node, nodeProxyTraps)
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

const garbageCandidates = new Set()
