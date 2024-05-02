Function.prototype.myBind = function (thisArg, ...argArray) {
  const method = this;
  return function (...nextArgs) {
    return method.call(thisArg, ...argArray, ...nextArgs)
  }
};