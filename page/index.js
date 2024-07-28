(function () {
  'use strict';

  function makeNode () {
    const node = {
      parentPlane: null,
      suppliers: null,
      value: null,
      planes: null,
      proxy: null
    };
    node.proxy = new Proxy(node, nodeProxyHandler);

    return node
  }

  const nodeProxyHandler = {
    get (node, key, receiver) {
      if (node.planes === null) {
        node.planes = { __proto__: null };
      }

      if (!(key in node.planes)) {
        node.planes[key] = makePlane(node, key);
        garbageCandidates.add(node.planes[key]);
      }

      return node.planes[key].proxy
    }

    // apply (query) {

    // }
  };

  console.log(makeNode);

})();
//# sourceMappingURL=index.js.map
