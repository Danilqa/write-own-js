function myInstanceOf(obj, target) {
  if (typeof target !== 'function') throw new Error('Target is not callable')
  if (obj === null || typeof obj !== 'object') return false;

  const proto = Object.getPrototypeOf(obj);
  if (proto === target.prototype) {
    return true;
  }

  return myInstanceOf(proto, target);
}
