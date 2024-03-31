function myObjectCreate(proto) {
  if (proto === null || typeof proto !== 'object') {
    throw new Error('Not an object');
  }

  function F() {}
  F.prototype = proto;
  return new F();
}