export function methodFor (klass, method) {
  if (Object.hasOwn(klass.prototype, method.name)) {
    throw new Error(`Duplicate method '${method.name}' for '${klass.name}'`)
  }

  klass.prototype[method.name] = method
}

export function propertyFor (klass, fnGetter) {
  if (Object.hasOwn(klass.prototype, fnGetter.name)) {
    throw new Error(`Duplicate method '${fnGetter.name}' for '${klass.name}'`)
  }

  Object.defineProperty(klass.prototype, fnGetter.name, {
    configurable: true,
    enumerable: true,
    get: fnGetter
  })
}
